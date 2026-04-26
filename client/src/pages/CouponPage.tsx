/**
 * CouponPage - Página dedicada para ver un cupón específico
 * Se abre cuando alguien hace clic en el link compartido por WhatsApp
 * URL: /cupon/:id
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowRight, Clock, Flame, AlertTriangle, Upload, CheckCircle, Tag, Wallet, Gift, User, Copy, Check } from "lucide-react";
import BackToSplash from "@/components/BackToSplash";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import NutriserAuthModal from "@/components/NutriserAuthModal";

export default function CouponPage() {
  const params = useParams<{ id: string }>();
  const couponId = parseInt(params.id || "0", 10);
  const { patient, isLoggedIn } = usePatientAuth();

  // ── Compartir con cashback ──────────────────────────────────────────────────
  const [linkCopied, setLinkCopied] = useState(false);
  const pendingShareRef = useRef<number | null>(null); // promoId pendiente de cashback
  const walletShareQuery = trpc.wallet.getMyWallet.useQuery(
    { patientId: patient?.id || 0 },
    { enabled: isLoggedIn && !!patient?.id }
  );
  const myWalletCode = walletShareQuery.data?.wallet?.walletNumber || null;

  const buildShareUrl = useCallback((promoId: number) => {
    const base = 'https://nutriserpv.com';
    return myWalletCode
      ? `${base}/cupon/${promoId}?ref=${myWalletCode}`
      : `${base}/cupon/${promoId}`;
  }, [myWalletCode]);

  const handleShareWhatsApp = useCallback(() => {
    if (!isLoggedIn || !myWalletCode) {
      toast.info('Inicia sesión en tu Monedero para ganar cashback al compartir');
    }
    if (!couponId) return;
    const shareUrl = buildShareUrl(couponId);
    const title = (document.querySelector('h1')?.textContent || 'Oferta Nutriser').trim();
    const text = `${shareUrl}\n\n🔥 *¡OFERTA ESPECIAL NUTRISER!* 🔥\n\n🎁 *${title}*\n\n✅ Adquiere tu cupón directamente en el link de arriba`;
    if (isLoggedIn && myWalletCode) pendingShareRef.current = couponId;
    window.location.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [couponId, buildShareUrl, isLoggedIn, myWalletCode]);

  const handleCopyLink = useCallback(() => {
    if (!isLoggedIn || !myWalletCode) {
      toast.info('Inicia sesión en tu Monedero para ganar cashback al compartir');
    }
    if (!couponId) return;
    const shareUrl = buildShareUrl(couponId);
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    if (isLoggedIn && myWalletCode) pendingShareRef.current = couponId;
    toast.success('¡Link copiado! Pégalo en WhatsApp, Facebook o donde quieras 🎉');
    setTimeout(() => setLinkCopied(false), 3000);
  }, [couponId, buildShareUrl, isLoggedIn, myWalletCode]);

  // Detectar regreso a la app tras compartir (visibilitychange)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && pendingShareRef.current !== null) {
        pendingShareRef.current = null;
        // El cashback real se acredita cuando el admin aprueba la compra del referido
        // Aquí solo mostramos confirmación visual
        toast.success('¡Gracias por compartir! Cuando tu recomendado compre, recibirás cashback en tu Monedero 💰');
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // Estados principales
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  // Estados del flujo de pago
  const [isGift, setIsGift] = useState<boolean | null>(null); // null = no elegido aún
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [payProofFile, setPayProofFile] = useState<File | null>(null);
  const [payStep, setPayStep] = useState<'gift_choice' | 'form' | 'uploading' | 'done'>('gift_choice');
  const payProofRef = useRef<HTMLInputElement>(null);

  const { data: promotions, isLoading } = trpc.promotions.list.useQuery();
  const promo = promotions?.find((p) => p.id === couponId);

  // Resetear isGift cuando se cierra el modal
  const handleCloseModal = () => {
    setShowPaymentFlow(false);
    setPayStep('gift_choice');
    setIsGift(null);
    setRecipientName('');
    setRecipientPhone('');
    setRecipientEmail('');
    setPayProofFile(null);
    setWalletUsedForFull(false);
  };

  // Modal de bienvenida para usuarios sin monedero
  const [showWalletPromoModal, setShowWalletPromoModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Monedero Nutriser
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [walletUsedForFull, setWalletUsedForFull] = useState(false); // true cuando el monedero cubre el total
  const walletQuery = trpc.wallet.getMyWallet.useQuery(
    { patientId: patient?.id || 0 },
    { enabled: isLoggedIn && !!patient?.id && showPaymentFlow }
  );
  const walletBalance = walletQuery.data?.wallet?.balance || 0;

  // Método de pago
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer');
  const walletData = walletQuery.data?.wallet;

  // Mutaciones
  const createGiftPurchaseMutation = trpc.giftPurchases.create.useMutation({
    onSuccess: () => {
      setPayStep('done');
      toast.success('¡Comprobante enviado! El equipo Nutriser verificará tu pago.');
    },
    onError: (e) => {
      setPayStep('form');
      toast.error('Error al enviar: ' + e.message);
    },
  });
  const cashPendingMutation = trpc.cashPayments.createPending.useMutation({
    onSuccess: (_, vars) => {
      setPayStep('done');
      const isFullWallet = vars.walletAmountUsedCents && vars.walletAmountUsedCents >= vars.amountCents;
      if (isFullWallet) {
        toast.success('✅ Solicitud registrada. El administrador autorizará tu compra con saldo del monedero.');
      } else {
        toast.success('¡Pendiente de pago en efectivo registrado en tu monedero!');
      }
    },
    onError: (e) => {
      setPayStep('form');
      toast.error('Error al registrar: ' + e.message);
    },
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const getUrgencyLevel = (remaining: number | null | undefined, max: number | null | undefined) => {
    if (!max || remaining === null || remaining === undefined) return "none";
    if (remaining === 0) return "sold";
    if (remaining <= 3) return "critical";
    if (remaining <= Math.ceil(max * 0.3)) return "low";
    return "ok";
  };

  // Detectar si el usuario viene de la tienda (/memberships) via query param ?from=store
  const [cameFromStore] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('from') === 'store';
    } catch {}
    return false;
  });
  const [, navigate] = useLocation();

  const handleBack = () => {
    if (cameFromStore) {
      navigate('/memberships');
    } else {
      sessionStorage.setItem("nutriser_scroll_to", "promociones");
      window.location.replace("/");
    }
  };

  // Enviar comprobante de pago
  const handleSubmitPayment = async () => {
    if (!promo) return;
    if (!isLoggedIn || !patient) {
      toast.error('Necesitas un Monedero Nutriser activo para adquirir este cupón.');
      return;
    }

    const buyerName = patient.name || '';
    const buyerPhone = patient.phone || '';
    const buyerEmail = patient.email || '';
    const giftFlag = isGift === true;

    // Calcular precio numérico del cupón
    const rawPrice = promo.price || '';
    const numericPricePesos = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;
    const numericPriceCents = Math.round(numericPricePesos * 100);
    const walletUsedCents = useWallet && walletAmount > 0 ? Math.min(walletAmount, numericPriceCents) : 0;
    const remainingCents = Math.max(0, numericPriceCents - walletUsedCents);

    // — Pago completo con Monedero (sin comprobante) —
    if (walletUsedCents >= numericPriceCents && numericPriceCents > 0 && walletData?.id && patient?.id) {
      setWalletUsedForFull(true);
      setPayStep('uploading');
      cashPendingMutation.mutate({
        walletId: walletData.id,
        patientId: patient.id,
        concept: promo.title,
        itemType: 'promotion',
        itemId: String(promo.id),
        amountCents: numericPriceCents,
        walletAmountUsedCents: numericPriceCents,
        cashbackPercent: 2,
        notes: `Cupón: ${promo.title}. Pago completo con saldo del monedero solicitado por ${buyerName}. ${giftFlag ? `Para regalar a: ${recipientName} (${recipientEmail}, ${recipientPhone})` : 'Para uso propio'}. Pendiente de autorización del administrador.`,
      });
      return;
    }

    // — Pago en Efectivo (con o sin descuento de monedero) —
    if (paymentMethod === 'cash') {
      if (!walletData?.id || !patient?.id) {
        toast.error('Necesitas un monedero activo para pagar en efectivo.');
        return;
      }
      if (remainingCents <= 0) {
        toast.error('El monedero ya cubre el total. No es necesario pago en efectivo.');
        return;
      }
      setPayStep('uploading');
      cashPendingMutation.mutate({
        walletId: walletData.id,
        patientId: patient.id,
        concept: promo.title,
        itemType: 'promotion',
        itemId: String(promo.id),
        amountCents: remainingCents,
        walletAmountUsedCents: walletUsedCents,
        cashbackPercent: 2,
        notes: `Cupón: ${promo.title}. Pago en efectivo solicitado por ${buyerName}. ${giftFlag ? `Para regalar a: ${recipientName} (${recipientEmail}, ${recipientPhone})` : 'Para uso propio'}.`,
      });
      return;
    }

    if (!payProofFile) {
      toast.error('Sube el comprobante de pago');
      return;
    }

    setPayStep('uploading');
    try {
      const formData = new FormData();
      formData.append('file', payProofFile);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      const proofUrl = data.url;

      // Convertir el archivo a base64 para enviarlo al servidor
      const reader = new FileReader();
      const base64Data: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(payProofFile);
      });

      // Calcular descuento real del monedero (en pesos MXN)
      const walletDiscountPesos = useWallet && walletAmount > 0 ? walletAmount / 100 : 0;

      await createGiftPurchaseMutation.mutateAsync({
        promotionId: promo.id,
        buyerName,
        buyerPhone,
        buyerEmail: buyerEmail || 'sin-correo@nutriser.com',
        proofData: base64Data,
        proofMimeType: payProofFile.type || 'image/jpeg',
        isGift: giftFlag,
        recipientName: giftFlag ? recipientName : undefined,
        recipientContact: giftFlag ? recipientPhone : undefined,
        walletDiscount: walletDiscountPesos > 0 ? walletDiscountPesos : undefined,
        patientEmail: patient?.email || undefined,
        promotionTitle: promo.title,
      });
    } catch (err: any) {
      setPayStep('form');
      toast.error('Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Navegación única: BackToSplash (sin Navbar para evitar duplicados) */}
      <BackToSplash
        hideHome={cameFromStore}
        desktopBackTo={cameFromStore ? "/memberships" : "/"}
        desktopBackLabel={cameFromStore ? "Volver a la tienda" : "Regresar"}
        mobileBackTo={cameFromStore ? "/memberships" : undefined}
      />

      {/* Espaciador para safe area + BackToSplash */}
      <div className="pt-20" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 5rem)' }} />

      <main className="flex-1 pb-12">
        <div className="container max-w-2xl mx-auto px-4">
          {/* Header decorativo */}
          <div className="text-center mb-2">
            <div className="inline-block bg-[#C5A55A]/20 text-[#8B6914] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
              🎁 Oferta Exclusiva Nutriser
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-10 h-10 text-[#C5A55A] animate-spin" />
            </div>
          ) : !promo ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="font-serif text-2xl text-[#1A1A1A] mb-2">Cupón no encontrado</h2>
              <p className="text-[#666] mb-6">Este cupón ya no está disponible o ha expirado.</p>
              <button onClick={handleBack} className="bg-[#C5A55A] hover:bg-[#B8963E] text-white px-6 py-3 rounded-xl font-bold transition">
                Ver otras promociones
              </button>
            </div>
          ) : (() => {
            const urgency = getUrgencyLevel(promo.couponsRemaining, promo.maxCoupons);
            const isSoldOut = urgency === "sold";
            const isCritical = urgency === "critical";
            const isLow = urgency === "low";
            // Porcentaje pseudo-aleatorio pero consistente por cupón (40-75%)
            const pct = isSoldOut ? 100 : 40 + ((promo.id * 17 + 7) % 36);

            return (
              <div>
                {/* Title */}
                <h1 className="font-serif text-3xl lg:text-4xl text-[#1A1A1A] leading-tight text-center mb-6">
                  {promo.title}
                </h1>

                {/* Coupon card */}
                <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C5A55A]/30">
                  {/* Urgency ribbon */}
                  {isCritical && !isSoldOut && (
                    <div className="bg-red-600 text-white text-center py-2 text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2 animate-pulse">
                      <Flame className="w-4 h-4" /> ¡ÚLTIMOS CUPONES DISPONIBLES! <Flame className="w-4 h-4" />
                    </div>
                  )}
                  {isLow && !isSoldOut && (
                    <div className="bg-orange-500 text-white text-center py-2 text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Pocos cupones disponibles
                    </div>
                  )}

                  {/* Image */}
                  {promo.imageUrl ? (
                    <div className="relative overflow-hidden" style={{ height: "260px" }}>
                      <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      {promo.regularPrice && promo.price && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-black shadow-lg">
                          🔥 OFERTA
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h2 className="font-serif text-2xl text-white leading-tight drop-shadow-lg">{promo.title}</h2>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#333] p-6">
                      {promo.regularPrice && promo.price && (
                        <div className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black mb-3">🔥 OFERTA</div>
                      )}
                      <h2 className="font-serif text-2xl text-white leading-tight">{promo.title}</h2>
                    </div>
                  )}

                  {/* Gold body */}
                  <div className="bg-gradient-to-br from-[#C5A55A] via-[#B8963E] to-[#9E7D2A] p-6">
                    {promo.description && (
                      <p className="text-white/90 text-base leading-relaxed mb-5">{promo.description}</p>
                    )}

                    {/* Price comparison */}
                    {(promo.regularPrice || promo.price) && (
                      <div className="bg-black/20 rounded-xl p-4 mb-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {promo.regularPrice && (
                              <div className="text-center">
                                <div className="text-white/50 text-xs uppercase tracking-wider">Antes</div>
                                <div className="text-white/60 text-xl line-through font-semibold">{promo.regularPrice}</div>
                              </div>
                            )}
                            {promo.regularPrice && promo.price && (
                              <ArrowRight className="w-6 h-6 text-white/60 flex-shrink-0" />
                            )}
                            {promo.price && (
                              <div className="text-center">
                                <div className="text-yellow-200 text-xs uppercase tracking-wider font-bold">Ahora</div>
                                <div className="text-white text-3xl font-black">{promo.price}</div>
                              </div>
                            )}
                          </div>
                          {promo.regularPrice && promo.price && (
                            <div className="bg-green-500 text-white text-sm font-black px-3 py-2 rounded-lg text-center">
                              ¡AHORRA!
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expiry date */}
                    {promo.expiresAt && (
                      <div className="flex items-center gap-2 mb-4 text-white/80 text-sm">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>Válido hasta el <strong className="text-white">{new Date(promo.expiresAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                      </div>
                    )}

                    {/* Coupon progress */}
                    {promo.maxCoupons != null && promo.couponsRemaining != null && (
                      <div className="mb-5">
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm font-bold flex items-center gap-1 ${isCritical ? 'text-red-200' : isLow ? 'text-orange-200' : 'text-white/80'}`}>
                            {isCritical && <Flame className="w-4 h-4" />}
                            {isSoldOut ? '❌ AGOTADO' : '⚡ Cupones limitados'}
                          </span>
                          <span className="text-white/60 text-sm">{pct}% vendido</span>
                        </div>
                        <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${isCritical ? 'bg-red-500 animate-pulse' : isLow ? 'bg-orange-400' : 'bg-green-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      onClick={() => {
                        if (!isLoggedIn || !patient) {
                          setShowWalletPromoModal(true);
                          return;
                        }
                        setShowPaymentFlow(true);
                      }}
                      disabled={isSoldOut}
                      className={`block w-full py-4 px-4 rounded-xl font-black text-base text-center uppercase tracking-widest transition-all duration-200 shadow-lg ${
                        isSoldOut
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-white text-[#8B6914] hover:bg-[#FAF7F2] hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {isSoldOut ? '❌ Agotado' : '🎁 ¡Lo Quiero! — Adquirir Cupón'}
                    </button>

                     <p className="text-white/60 text-xs text-center mt-3">
                      * Previa cita requerida · Válido en Nutriser Aesthetic &amp; Nutrition
                    </p>

                    {/* ═══ BANNER COMPARTIR CON CASHBACK ═══ */}
                    <div className="mt-4 bg-black/30 border border-[#C5A55A]/40 rounded-xl px-4 py-3">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="text-base flex-shrink-0">💰</span>
                        <div>
                          <p className="text-[#C5A55A] text-xs font-bold mb-0.5">¡Comparte y gana cashback en tu Monedero!</p>
                          <p className="text-white/70 text-[10px] leading-snug">
                            Comparte este cupón con tus contactos. Por cada recomendado que abra su Monedero con tu link y <strong className="text-white">compre un cupón</strong>, te acreditamos cashback automáticamente. Solo cuenta cuando compartes desde aquí.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleShareWhatsApp}
                          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all active:scale-95"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp
                        </button>
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center justify-center gap-2 bg-[#C5A55A]/20 hover:bg-[#C5A55A]/30 border border-[#C5A55A]/50 text-[#C5A55A] font-bold text-xs py-2.5 px-3 rounded-xl transition-all active:scale-95"
                        >
                          {linkCopied ? <Check className="w-4 h-4 flex-shrink-0" /> : <Copy className="w-4 h-4 flex-shrink-0" />}
                          {linkCopied ? '¡Copiado!' : 'Copiar link'}
                        </button>
                      </div>
                    </div>
                    {/* ═══════════════════════════════════════ */}

                  </div>
                </div>
                {/* Bottom CTA */}
                <div className="mt-8 text-center">
                  <p className="text-[#666] text-sm mb-4">¿Quieres ver más ofertas?</p>
                  <button
                    onClick={() => navigate('/cupones')}
                    className="bg-[#1A1A1A] hover:bg-[#333] text-[#C5A55A] border border-[#C5A55A] px-6 py-3 rounded-xl font-bold transition"
                  >
                    Ver todas las promociones
                  </button>
                </div>

                {/* ═══════════════════════════════════════════════════════
                     MODAL: PAGO CON COMPROBANTE + CÓDIGO EXTRA
                    ═══════════════════════════════════════════════════════ */}
                {showPaymentFlow && (
                  <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[70] p-4 overflow-y-auto"
                       style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 my-4 shadow-2xl">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">💳 Adquirir cupón</h2>
                        <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                      </div>

                      {payStep === 'gift_choice' ? (
                        /* ── Paso 0: ¿Para mí o para regalar? ── */
                        <div className="py-4">
                          <p className="text-sm text-gray-600 mb-5 text-center">¿Este cupón es para ti o lo quieres regalar?</p>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => { setIsGift(false); setPayStep('form'); }}
                              className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-[#C5A55A] bg-amber-50 hover:bg-amber-100 transition-all"
                            >
                              <User className="w-8 h-8 text-[#C5A55A]" />
                              <span className="font-bold text-[#1A1A1A] text-sm">Para mí</span>
                              <span className="text-xs text-gray-500 text-center leading-tight">Usaré el cupón yo mismo</span>
                            </button>
                            <button
                              onClick={() => { setIsGift(true); setPayStep('form'); }}
                              className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-purple-400 bg-purple-50 hover:bg-purple-100 transition-all"
                            >
                              <Gift className="w-8 h-8 text-purple-500" />
                              <span className="font-bold text-[#1A1A1A] text-sm">Para regalar</span>
                              <span className="text-xs text-gray-500 text-center leading-tight">Lo enviaré a alguien especial</span>
                            </button>
                          </div>
                        </div>
                      ) : payStep === 'done' ? (
                        <div className="text-center py-6">
                          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                          {useWallet && walletUsedForFull ? (
                            <>
                              <h3 className="font-bold text-lg text-[#1A1A1A] mb-2">¡Solicitud registrada!</h3>
                              <p className="text-gray-500 text-sm mb-2">Tu solicitud de pago con saldo del monedero fue registrada. El administrador la autorizará y recibirás confirmación por WhatsApp.</p>
                              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                                <p className="text-amber-700 text-xs font-semibold">💰 Saldo a descontar: ${(walletAmount / 100).toFixed(2)} MXN</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <h3 className="font-bold text-lg text-[#1A1A1A] mb-2">¡Comprobante enviado!</h3>
                              <p className="text-gray-500 text-sm mb-2">
                                {isGift
                                  ? `El equipo Nutriser verificará tu pago. Al aprobarlo, ${recipientName} recibirá el cupón en su correo.`
                                  : 'El equipo Nutriser verificará tu pago y recibirás tu cupón por correo al ser aprobado.'}
                              </p>
                            </>
                          )}
                          <p className="text-[#C5A55A] font-semibold text-sm">📞 322 450 3257</p>
                          <Button className="mt-5 bg-[#C5A55A] hover:bg-[#B8963E] text-white" onClick={handleCloseModal}>
                            Cerrar
                          </Button>
                        </div>
                      ) : (
                        <>
                          {/* Indicador: para mí o para regalar */}
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-4 text-sm font-semibold ${
                            isGift ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {isGift ? <Gift className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            {isGift ? 'Cupón de regalo' : 'Cupón para uso propio'}
                            <button onClick={() => { setIsGift(null); setPayStep('gift_choice'); }} className="ml-auto text-xs underline opacity-70">cambiar</button>
                          </div>

                          {/* Campos del destinatario si es regalo */}
                          {isGift && (
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4 space-y-3">
                              <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Datos de quien recibirá el regalo</p>
                              <div>
                                <label className="text-xs text-gray-600 font-medium">Nombre completo *</label>
                                <Input
                                  value={recipientName}
                                  onChange={e => setRecipientName(e.target.value)}
                                  placeholder="Nombre de quien lo recibirá"
                                  className="mt-1 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 font-medium">Correo electrónico *</label>
                                <Input
                                  type="email"
                                  value={recipientEmail}
                                  onChange={e => setRecipientEmail(e.target.value)}
                                  placeholder="correo@ejemplo.com"
                                  className="mt-1 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 font-medium">Teléfono *</label>
                                <Input
                                  type="tel"
                                  value={recipientPhone}
                                  onChange={e => setRecipientPhone(e.target.value)}
                                  placeholder="322 000 0000"
                                  className="mt-1 text-sm"
                                />
                              </div>
                            </div>
                          )}

                          {/* Resumen del cupón */}
                          <div className="bg-[#FAF7F2] rounded-xl p-4 mb-4">
                            <p className="font-semibold text-[#1A1A1A] text-sm mb-1">{promo.title}</p>
                            <div className="flex items-center gap-3">
                              {promo.regularPrice && <span className="text-gray-400 line-through text-sm">{promo.regularPrice}</span>}
                              {promo.price && <span className="text-[#C5A55A] font-black text-xl">{promo.price}</span>}
                            </div>
                          </div>

                          {/* Datos del cliente — tomados del monedero */}
                          {patient && (
                            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                              <div className="w-9 h-9 rounded-full bg-[#C5A55A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {patient.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[#1A1A1A] font-bold text-sm truncate">{patient.name}</p>
                                <p className="text-gray-500 text-xs truncate">{patient.email}</p>
                                <p className="text-gray-500 text-xs">{patient.phone}</p>
                              </div>
                              <span className="text-green-600 text-xs font-bold flex-shrink-0">✓ Monedero</span>
                            </div>
                          )}

                          {/* Monedero Nutriser */}
                          {(() => {
                            const rawPriceForWallet = promo.price || '';
                            const numericPriceForWallet = parseFloat(rawPriceForWallet.replace(/[^0-9.]/g, '')) || 0;
                            const numericPriceCentsForWallet = Math.round(numericPriceForWallet * 100);
                            const walletCoversTotal = useWallet && walletBalance >= numericPriceCentsForWallet && numericPriceCentsForWallet > 0;
                            return isLoggedIn && walletBalance > 0 ? (
                              <div className="mb-4">
                                <div className={`border rounded-xl p-3 transition-all ${useWallet ? 'border-[#C5A55A] bg-amber-50/50' : 'border-gray-200 bg-gray-50'}`}>
                                  <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={useWallet}
                                      onChange={(e) => {
                                        setUseWallet(e.target.checked);
                                        if (e.target.checked) {
                                          setWalletAmount(walletBalance);
                                        } else {
                                          setWalletAmount(0);
                                        }
                                      }}
                                      className="w-4 h-4 accent-[#C5A55A]"
                                    />
                                    <Wallet className="w-5 h-5 text-[#C5A55A]" />
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-gray-800">Usar saldo del monedero</p>
                                      <p className="text-xs text-gray-500">Saldo disponible: <span className="font-bold text-[#C5A55A]">${(walletBalance / 100).toFixed(2)} MXN</span></p>
                                    </div>
                                  </label>
                                  {useWallet && (
                                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                                      {walletCoversTotal ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                                          <p className="text-xs text-green-700 font-bold">💰 Tu saldo cubre el total — ¡Sin comprobante!</p>
                                          <p className="text-[10px] text-green-600 mt-0.5">La compra quedará pendiente de autorización del administrador.</p>
                                        </div>
                                      ) : (
                                        <p className="text-xs text-green-600 font-semibold">Se aplicará descuento de ${(Math.min(walletBalance, numericPriceCentsForWallet) / 100).toFixed(2)} MXN de tu monedero</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null;
                          })()}

                          {/* Selector de método de pago */}
                          <div className="mb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Método de pago</p>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setPaymentMethod('transfer')}
                                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                                  paymentMethod === 'transfer'
                                    ? 'border-[#C5A55A] bg-amber-50 text-[#C5A55A]'
                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                }`}
                              >
                                <span className="text-xl">🏦</span>
                                <span className="text-xs font-bold">Transferencia</span>
                                <span className="text-[10px] text-center leading-tight opacity-70">Sube comprobante</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                                  paymentMethod === 'cash'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                }`}
                              >
                                <span className="text-xl">💵</span>
                                <span className="text-xs font-bold">Efectivo</span>
                                <span className="text-[10px] text-center leading-tight opacity-70">Paga en clínica</span>
                              </button>
                            </div>
                            {paymentMethod === 'cash' && !walletData?.id && (
                              <p className="text-xs text-orange-600 mt-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                                ⚠️ Necesitas una cuenta con monedero para pagar en efectivo.
                              </p>
                            )}
                            {paymentMethod === 'cash' && walletData?.id && (
                              <div className="mt-2 bg-green-50 border border-green-200 rounded-xl p-3 space-y-1">
                                <p className="text-xs font-bold text-green-700">✅ Se creará un pendiente en tu monedero</p>
                                <p className="text-xs text-green-600">El admin lo verá al escanear tu QR y confirmará en clínica.</p>
                              </div>
                            )}
                          </div>

                          {/* Instrucciones de transferencia — solo si es transferencia */}
                          {paymentMethod === 'transfer' && (() => {
                            const rawPrice = promo.price || '';
                            const numericPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;
                            const walletDeductPesos = useWallet && walletAmount > 0 ? walletAmount / 100 : 0;
                            const finalAmount = Math.max(0, numericPrice - walletDeductPesos);
                            return (
                              <div className="bg-[#1A1A1A] rounded-xl p-4 mb-4 text-white text-sm">
                                <p className="font-bold mb-2">💳 Datos para transferencia:</p>
                                <p className="text-gray-300">Banco: Banamex</p>
                                <p className="text-gray-300">CLABE Interbancaria: <span className="font-mono font-bold text-white">002470701448743487</span></p>
                                {useWallet && walletDeductPesos > 0 && numericPrice > 0 ? (
                                  <div className="mt-2 space-y-1">
                                    <p className="text-gray-400 text-xs line-through">Precio original: {promo.price}</p>
                                    <p className="text-green-400 text-xs">Monedero: -${walletDeductPesos.toFixed(2)} MXN</p>
                                    <p className="text-[#C5A55A] font-bold text-base">Monto a pagar: ${finalAmount.toFixed(2)} MXN</p>
                                  </div>
                                ) : (
                                  <p className="text-[#C5A55A] font-bold mt-2">Monto a pagar: {promo.price}</p>
                                )}
                              </div>
                            );
                          })()}

                          {/* Subir comprobante — solo si es transferencia Y el monedero no cubre el total */}
                          {paymentMethod === 'transfer' && (() => {
                            const rawPriceBtn = promo.price || '';
                            const numericPriceBtn = parseFloat(rawPriceBtn.replace(/[^0-9.]/g, '')) || 0;
                            const numericPriceCentsBtn = Math.round(numericPriceBtn * 100);
                            const walletCoversBtn = useWallet && walletBalance >= numericPriceCentsBtn && numericPriceCentsBtn > 0;
                            return !walletCoversBtn;
                          })() && <div className="mb-4">
                            <p className="text-sm font-semibold text-[#1A1A1A] mb-2">Comprobante de pago *</p>
                            <button
                              onClick={() => payProofRef.current?.click()}
                              className={`w-full border-2 border-dashed rounded-xl py-4 text-center transition ${payProofFile ? 'border-green-400 bg-green-50' : 'border-[#C5A55A]/50 hover:bg-[#C5A55A]/5'}`}
                            >
                              {payProofFile ? (
                                <div className="text-green-600">
                                  <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                                  <span className="text-sm font-medium">{payProofFile.name}</span>
                                </div>
                              ) : (
                                <div className="text-[#C5A55A]">
                                  <Upload className="w-6 h-6 mx-auto mb-1" />
                                  <span className="text-sm font-medium">Toca para subir comprobante</span>
                                </div>
                              )}
                            </button>
                            <input
                              ref={payProofRef}
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={e => setPayProofFile(e.target.files?.[0] || null)}
                            />
                          </div>}

                          {/* Botón de envío — adaptado al método de pago */}
                          {(() => {
                            const rawPriceSubmit = promo.price || '';
                            const numericPriceSubmit = parseFloat(rawPriceSubmit.replace(/[^0-9.]/g, '')) || 0;
                            const numericPriceCentsSubmit = Math.round(numericPriceSubmit * 100);
                            const walletCoversSubmit = useWallet && walletBalance >= numericPriceCentsSubmit && numericPriceCentsSubmit > 0;
                            const giftFieldsMissing = isGift && (!recipientName.trim() || !recipientEmail.trim() || !recipientPhone.trim());
                            const needsProof = paymentMethod === 'transfer' && !walletCoversSubmit && !payProofFile;
                            return (
                              <>
                                {giftFieldsMissing && (
                                  <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">⚠️ Completa los datos del destinatario para continuar.</p>
                                )}
                                <Button
                                  onClick={handleSubmitPayment}
                                  disabled={payStep === 'uploading' || needsProof || !!giftFieldsMissing}
                                  className={`w-full text-white font-bold py-3 ${
                                    walletCoversSubmit
                                      ? 'bg-amber-600 hover:bg-amber-700'
                                      : paymentMethod === 'cash'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-[#C5A55A] hover:bg-[#B8963E]'
                                  }`}
                                >
                                  {payStep === 'uploading' ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                                  ) : walletCoversSubmit ? (
                                    '💰 Solicitar compra con saldo del monedero'
                                  ) : paymentMethod === 'cash' ? (
                                    '💵 Registrar pago en efectivo'
                                  ) : (
                                    '📤 Enviar comprobante de pago'
                                  )}
                                </Button>
                                <p className="text-xs text-gray-400 text-center mt-2">
                                  {walletCoversSubmit
                                    ? 'El administrador autorizará el descuento de tu saldo y confirmará la compra'
                                    : paymentMethod === 'cash'
                                      ? 'El admin confirmará tu pago al escanear tu monedero en clínica'
                                      : 'El equipo Nutriser verificará tu pago y te confirmará por WhatsApp'
                                  }
                                </p>
                              </>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />

      {/* ═══ MODAL BIENVENIDA: Crear Monedero para comprar cupón ═══ */}
      {showWalletPromoModal && promo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1A] border border-[#C5A55A]/40 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
            {/* Header dorado */}
            <div className="bg-gradient-to-r from-[#C5A55A] to-[#8B6914] px-6 py-5 text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h2 className="text-white font-black text-lg uppercase tracking-wide">¡Casi es tuyo!</h2>
              <p className="text-white/90 text-sm mt-1">Crea tu Monedero Nutriser gratis para comprarlo</p>
            </div>

            {/* Cuerpo */}
            <div className="px-6 py-5 space-y-4">
              {/* Cupón que quiere comprar */}
              <div className="bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-xl p-3 flex items-center gap-3">
                <span className="text-2xl">🏷️</span>
                <div>
                  <p className="text-[#C5A55A] text-xs font-bold uppercase tracking-wide">Cupón seleccionado</p>
                  <p className="text-white font-semibold text-sm">{promo.title}</p>
                  <p className="text-[#C5A55A] font-black">{promo.price}</p>
                </div>
              </div>

              {/* Beneficios */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-lg mt-0.5">✓</span>
                  <p className="text-white/90 text-sm"><strong className="text-white">Monedero electrónico gratuito</strong> — sin costo, se crea en 2 minutos</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-lg mt-0.5">✓</span>
                  <p className="text-white/90 text-sm"><strong className="text-white">Compra este cupón</strong> con descuento exclusivo</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#C5A55A] text-lg mt-0.5">💰</span>
                  <p className="text-white/90 text-sm"><strong className="text-[#C5A55A]">Recibes cashback</strong> en tu primera compra — acumulable para próximas visitas</p>
                </div>
              </div>

              {/* CTAs */}
              <button
                onClick={() => {
                  setShowWalletPromoModal(false);
                  setShowAuthModal(true);
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C5A55A] to-[#8B6914] text-white font-black text-sm uppercase tracking-widest shadow-lg hover:opacity-90 transition-all"
              >
                Crear mi Monedero Gratis
              </button>
              <button
                onClick={() => setShowWalletPromoModal(false)}
                className="w-full py-2 text-white/50 text-sm hover:text-white/80 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de registro/login del Monedero */}
      <NutriserAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          // Regresar al cupón para que lo compre
          setTimeout(() => {
            setShowPaymentFlow(true);
            toast.success('🎉 ¡Monedero creado! Ahora puedes adquirir tu cupón.');
          }, 500);
        }}
        contextMessage={`Para adquirir el cupón "${promo?.title || ''}" necesitas un Monedero Nutriser gratuito. ¡Se crea en 2 minutos y recibes cashback en tu compra!`}
      />
    </div>
  );
}
