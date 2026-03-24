import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Loader2, Gift, Copy, Check, X, ArrowRight, Flame, Clock, AlertTriangle, Bell, BellRing } from "lucide-react";
import { toast } from "sonner";

type Step = "form" | "type" | "payment" | "success";

export default function PromotionsSection() {
  const { data: promotions, isLoading } = trpc.promotions.list.useQuery();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  // Scroll to coupon if URL has #cupon-{id}
  useEffect(() => {
    if (isLoading || !promotions) return;
    const hash = window.location.hash;
    const match = hash.match(/^#cupon-(\d+)$/);
    if (!match) return;
    const targetId = parseInt(match[1], 10);
    setHighlightId(targetId);
    setTimeout(() => {
      const el = document.getElementById(`cupon-${targetId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setHighlightId(null), 3000);
    }, 300);
  }, [isLoading, promotions]);

  // ─── Subscription modal state ─────────────────────────────────────────────
  // Persistir estado en localStorage para que no se olvide entre visitas
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subEmail, setSubEmail] = useState("");
  const [subSubmitting, setSubSubmitting] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);
  // pushEnabled: inicializar desde localStorage Y verificar permiso real del navegador
  const [pushEnabled, setPushEnabled] = useState(() => {
    const saved = localStorage.getItem('nutriser_push_enabled') === 'true';
    // También verificar que el permiso del navegador siga activo
    const hasPermission = 'Notification' in window && Notification.permission === 'granted';
    return saved && hasPermission;
  });
  const [pushLoading, setPushLoading] = useState(false);

  // Detect iOS/Safari
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOSSafari = isIOS && isSafari;
  // Detect if running as PWA (added to home screen)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

  const subscribeMutation = trpc.couponSubscribers.subscribe.useMutation({
    onSuccess: () => {
      setSubSuccess(true);
      setSubSubmitting(false);
      localStorage.setItem('nutriser_email_subscribed', 'true');
    },
    onError: (err) => {
      toast.error("Error al suscribirse: " + err.message);
      setSubSubmitting(false);
    },
  });

  const pushSubscribeMutation = trpc.push.subscribe.useMutation({
    onSuccess: () => {
      setPushEnabled(true);
      localStorage.setItem('nutriser_push_enabled', 'true');
      toast.success("🔔 ¡Notificaciones activadas!");
    },
    onError: () => {
      toast.error("No se pudieron activar las notificaciones push.");
    },
  });

  const { data: vapidData } = trpc.push.getVapidPublicKey.useQuery();

  const handleEnablePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error("Tu navegador no soporta notificaciones push.");
      return;
    }
    setPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error("Permiso de notificaciones denegado.");
        setPushLoading(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const publicKey = vapidData?.publicKey || import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicKey) { toast.error("Error de configuración."); setPushLoading(false); return; }
      // Convert base64 to Uint8Array
      const padding = '='.repeat((4 - publicKey.length % 4) % 4);
      const base64 = (publicKey + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: outputArray,
      });
      const p256dhArr = new Uint8Array(subscription.getKey('p256dh')!);
      const authArr = new Uint8Array(subscription.getKey('auth')!);
      const p256dh = btoa(Array.from(p256dhArr).map(b => String.fromCharCode(b)).join(''));
      const auth = btoa(Array.from(authArr).map(b => String.fromCharCode(b)).join(''));
      await pushSubscribeMutation.mutateAsync({ endpoint: subscription.endpoint, p256dh, auth });
    } catch (e: any) {
      console.error('Push subscription error:', e);
      toast.error("Error al activar notificaciones: " + e.message);
    }
    setPushLoading(false);
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail.trim()) { toast.error("Ingresa tu correo"); return; }
    setSubSubmitting(true);
    subscribeMutation.mutate({ email: subEmail, whatsapp: "" });
  };

  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<{ id: number; title: string } | null>(null);
  const [step, setStep] = useState<Step>("form");

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [isGift, setIsGift] = useState<boolean | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientContact, setRecipientContact] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createGiftPurchase = trpc.giftPurchases.create.useMutation({
    onSuccess: (data) => {
      setGeneratedCode(data.couponCode || "");
      setStep("success");
      setIsSubmitting(false);
      if (timerRef.current) clearInterval(timerRef.current);
    },
    onError: (err) => {
      toast.error("Error al procesar: " + err.message);
      setIsSubmitting(false);
    },
  });

  const resetForm = () => {
    setBuyerName(""); setBuyerEmail(""); setBuyerPhone("");
    setIsGift(null); setRecipientName(""); setRecipientContact("");
    setProofFile(null); setTimeLeft(900); setIsSubmitting(false);
    setGeneratedCode(""); setStep("form");
  };

  useEffect(() => {
    if (step === "payment" && giftModalOpen) {
      setTimeLeft(900);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGiftModalOpen(false);
            toast.error("Tiempo agotado. Deberás registrarte de nuevo.");
            resetForm();
            return 900;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, giftModalOpen]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) { toast.error("Ingresa tu nombre"); return; }
    if (!buyerEmail.trim()) { toast.error("Ingresa tu email"); return; }
    setStep("type");
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGift === null) { toast.error("Selecciona si es para ti o para regalar"); return; }
    if (isGift && !recipientName.trim()) { toast.error("Ingresa el nombre del destinatario"); return; }
    if (isGift && !recipientContact.trim()) { toast.error("Ingresa el contacto del destinatario"); return; }
    setStep("payment");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("El archivo no debe superar 5MB"); return; }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      toast.error("Solo se aceptan JPG, PNG o PDF"); return;
    }
    setProofFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) { toast.error("Sube el comprobante de pago"); return; }
    if (!selectedPromo) return;
    setIsSubmitting(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      createGiftPurchase.mutate({
        promotionId: selectedPromo.id,
        buyerName, buyerEmail, buyerPhone,
        proofData: base64, proofMimeType: proofFile.type,
        isGift: isGift ?? false,
        recipientName: isGift ? recipientName : undefined,
        recipientContact: isGift ? recipientContact : undefined,
      });
    };
    reader.readAsDataURL(proofFile);
  };

  const handleShareWhatsApp = (promo: { id: number; title: string; description: string | null; price: string | null; regularPrice: string | null; imageUrl?: string | null }) => {
    const shareUrl = `https://nutriserpv.com/cupon/${promo.id}`;
    const priceText = promo.regularPrice && promo.price
      ? `\n💰 Antes: ~${promo.regularPrice}~ → *Ahora: ${promo.price}*`
      : promo.price ? `\n💰 Precio: *${promo.price}*` : "";
    // El link va AL INICIO para que WhatsApp genere la vista previa con imagen
    const text = `${shareUrl}\n\n🔥 *¡OFERTA ESPECIAL NUTRISER!* 🔥\n\n🎁 *${promo.title}*\n${promo.description || ""}${priceText}\n\n✅ Adquiere tu cupón directamente en el link de arriba`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyLink = (promo: { id: number; title: string; description: string | null; price: string | null; regularPrice: string | null }) => {
    const shareUrl = `https://nutriserpv.com/cupon/${promo.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(promo.id);
    toast.success("¡Link copiado! Pégalo en Facebook, Instagram o donde quieras 🎉");
    setTimeout(() => setCopiedId(null), 3000);
  };

  const stepLabels = ["Tus datos", "¿Para quién?", "Pago"];
  const stepIndex = step === "form" ? 0 : step === "type" ? 1 : step === "payment" ? 2 : 3;

  // Urgency helpers
  const getUrgencyLevel = (remaining: number | null | undefined, max: number | null | undefined) => {
    if (!max || remaining === null || remaining === undefined) return "none";
    if (remaining === 0) return "sold";
    if (remaining <= 3) return "critical";
    if (remaining <= Math.ceil(max * 0.3)) return "low";
    return "ok";
  };

  return (
    <section id="promociones" className="py-20 bg-[#FAF7F2]">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h2 className="font-serif text-4xl lg:text-5xl text-[#1A1A1A] mb-4">Cuponera de Descuentos</h2>
          <p className="text-[#666] mb-4">Ofertas exclusivas con cupos limitados</p>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#C5A55A] to-transparent mx-auto mb-8" />

          {/* Botón de suscripción prominente */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block"
          >
            {localStorage.getItem('nutriser_email_subscribed') === 'true' && pushEnabled ? (
              /* Ya suscrito por correo Y push activo */
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-800 to-green-900 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl border-2 border-green-500">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-black">✅ Suscrito y notificaciones activas</span>
              </div>
            ) : localStorage.getItem('nutriser_email_subscribed') === 'true' ? (
              /* Ya suscrito por correo, pero push no activo */
              <button
                onClick={() => setSubModalOpen(true)}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-green-800 to-green-900 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl border-2 border-green-500 transition-all duration-300"
              >
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-black">✅ Suscrito por correo</span>
                <span className="text-white/60 text-sm font-normal hidden sm:inline">— Activar notificaciones push</span>
              </button>
            ) : (
              /* No suscrito */
              <button
                onClick={() => setSubModalOpen(true)}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-[#1A1A1A] to-[#2d2416] hover:from-[#2d2416] hover:to-[#1A1A1A] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-2xl border-2 border-[#C5A55A] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(197,165,90,0.4)]"
              >
                <span className="relative">
                  <BellRing className="w-6 h-6 text-[#C5A55A] animate-bounce" />
                </span>
                <span className="text-[#C5A55A] font-black tracking-wide">🔔 Suscribirse a Ofertas</span>
                <span className="text-white/70 text-sm font-normal hidden sm:inline">— Recibe nuevos cupones al instante</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">GRATIS</span>
              </button>
            )}
          </motion.div>
          <p className="text-xs text-[#999] mt-3">Correo + notificaciones en tu celular cuando publiquemos nuevas ofertas</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-[#C5A55A] animate-spin" /></div>
        ) : !promotions || promotions.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border-2 border-[#C5A55A]/20 text-center">
            <p className="text-[#999] text-lg">Actualmente no existen promociones</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((promo, index) => {
              const urgency = getUrgencyLevel(promo.couponsRemaining, promo.maxCoupons);
              const isSoldOut = urgency === "sold";
              const isCritical = urgency === "critical";
              const isLow = urgency === "low";
              const pct = promo.maxCoupons && promo.couponsRemaining != null
                ? Math.round(((promo.maxCoupons - promo.couponsRemaining) / promo.maxCoupons) * 100)
                : 0;

              return (
                <motion.div key={promo.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                  <div
                    id={`cupon-${promo.id}`}
                    className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-500 ${
                      highlightId === promo.id ? 'ring-4 ring-[#C5A55A] ring-offset-4 scale-[1.03]' : 'hover:shadow-2xl hover:-translate-y-1'
                    } ${isSoldOut ? 'opacity-70 grayscale' : ''}`}
                  >
                    {/* Urgency ribbon */}
                    {isCritical && !isSoldOut && (
                      <div className="absolute top-0 left-0 right-0 z-20 bg-red-600 text-white text-center py-1.5 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1 animate-pulse">
                        <Flame className="w-3.5 h-3.5" /> ¡ÚLTIMOS {promo.couponsRemaining} CUPONES! <Flame className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {isLow && !isSoldOut && (
                      <div className="absolute top-0 left-0 right-0 z-20 bg-orange-500 text-white text-center py-1.5 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Pocos cupones disponibles
                      </div>
                    )}

                    {/* Imagen */}
                    {promo.imageUrl ? (
                      <div className={`relative overflow-hidden ${isCritical || isLow ? 'mt-7' : ''}`} style={{ height: '200px' }}>
                        <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        {/* OFERTA badge */}
                        {promo.regularPrice && promo.price && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                            🔥 OFERTA
                          </div>
                        )}
                        {/* Título sobre imagen */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-serif text-xl text-white leading-tight drop-shadow-lg">{promo.title}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className={`bg-gradient-to-br from-[#1A1A1A] to-[#333] p-5 ${isCritical || isLow ? 'mt-7' : ''}`}>
                        {promo.regularPrice && promo.price && (
                          <div className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black mb-2">🔥 OFERTA</div>
                        )}
                        <h3 className="font-serif text-xl text-white leading-tight">{promo.title}</h3>
                      </div>
                    )}

                    {/* Cuerpo dorado */}
                    <div className="bg-gradient-to-br from-[#C5A55A] via-[#B8963E] to-[#9E7D2A] p-5">
                      {promo.description && (
                        <p className="text-white/90 text-sm leading-relaxed mb-4">{promo.description}</p>
                      )}

                      {/* Precio comparativo */}
                      {(promo.regularPrice || promo.price) && (
                        <div className="bg-black/20 rounded-xl p-3 mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {promo.regularPrice && (
                              <div className="text-center">
                                <div className="text-white/50 text-[10px] uppercase tracking-wider">Antes</div>
                                <div className="text-white/60 text-lg line-through font-semibold">{promo.regularPrice}</div>
                              </div>
                            )}
                            {promo.regularPrice && promo.price && (
                              <ArrowRight className="w-5 h-5 text-white/60 flex-shrink-0" />
                            )}
                            {promo.price && (
                              <div className="text-center">
                                <div className="text-yellow-200 text-[10px] uppercase tracking-wider font-bold">Ahora</div>
                                <div className="text-white text-2xl font-black">{promo.price}</div>
                              </div>
                            )}
                          </div>
                          {promo.regularPrice && promo.price && (
                            <div className="bg-green-500 text-white text-xs font-black px-2 py-1 rounded-lg text-center">
                              ¡AHORRA!
                            </div>
                          )}
                        </div>
                      )}

                      {/* Fecha límite */}
                      {promo.expiresAt && (
                        <div className="flex items-center gap-2 mb-3 text-white/80 text-xs">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Válido hasta el <strong className="text-white">{new Date(promo.expiresAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                        </div>
                      )}

                      {/* Contador de cupones con barra de progreso */}
                      {promo.maxCoupons != null && promo.couponsRemaining != null && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className={`text-xs font-bold flex items-center gap-1 ${
                              isCritical ? 'text-red-200' : isLow ? 'text-orange-200' : 'text-white/80'
                            }`}>
                              {isCritical && <Flame className="w-3.5 h-3.5" />}
                              {isSoldOut ? '❌ AGOTADO' : `${promo.couponsRemaining} cupones restantes`}
                            </span>
                            <span className="text-white/60 text-xs">{pct}% vendido</span>
                          </div>
                          <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                isCritical ? 'bg-red-500 animate-pulse' : isLow ? 'bg-orange-400' : 'bg-green-400'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Botón Lo Quiero */}
                      <button
                        onClick={() => {
                          if (isSoldOut) { toast.error("Esta promoción ya no tiene cupones disponibles"); return; }
                          setSelectedPromo({ id: promo.id, title: promo.title });
                          setStep("form");
                          setGiftModalOpen(true);
                        }}
                        disabled={isSoldOut}
                        className={`block w-full py-3 px-4 rounded-xl font-black text-sm text-center uppercase tracking-widest transition-all duration-200 shadow-lg ${
                          isSoldOut
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-white text-[#8B6914] hover:bg-[#FAF7F2] hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      >
                        {isSoldOut ? '❌ Agotado' : '🎁 ¡Lo Quiero!'}
                      </button>
                    </div>

                    {/* Compartir — solo WhatsApp y Copiar */}
                    <div className="bg-[#1A1A1A] rounded-b-2xl px-4 py-3 flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider flex-shrink-0">Compartir:</span>
                      <button
                        onClick={() => handleShareWhatsApp(promo)}
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-xs font-bold transition flex-1 justify-center"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.967 1.523 9.9 9.9 0 001.563 19.231c2.693.47 5.455.082 7.978-1.125a9.9 9.9 0 00-4.57-19.629z"/></svg>
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleCopyLink(promo)}
                        className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-xs font-bold transition flex-1 justify-center"
                      >
                        {copiedId === promo.id ? <><Check size={14} /> ¡Copiado!</> : <><Copy size={14} /> Copiar link</>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Suscripción a Ofertas */}
      {subModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) { setSubModalOpen(false); setSubSuccess(false); setSubEmail(""); } }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2d2416] p-5 flex justify-between items-start border-b-2 border-[#C5A55A]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BellRing className="w-6 h-6 text-[#C5A55A]" />
                  <h2 className="text-white font-bold text-xl">Suscribirse a Ofertas</h2>
                </div>
                <p className="text-white/70 text-sm">Sé el primero en enterarte de nuevos cupones</p>
              </div>
              <button onClick={() => { setSubModalOpen(false); setSubSuccess(false); setSubEmail(""); }} className="text-white/60 hover:text-white p-1 rounded-full transition"><X size={20} /></button>
            </div>

            {subSuccess ? (
              /* —— Estado de éxito —— */
              <div className="p-6 text-center space-y-4">
                <div className="text-5xl">🎉</div>
                <h3 className="font-bold text-xl text-[#1A1A1A]">¡Suscrito con éxito!</h3>
                <p className="text-gray-600 text-sm">Te enviaremos un correo cada vez que publiquemos una nueva oferta o cupón.</p>
                <div className="bg-[#FAF7F2] rounded-xl p-4 text-left">
                  <p className="text-sm font-semibold text-[#1A1A1A] mb-2">¿Quieres recibir también notificaciones instantáneas?</p>
                  {pushEnabled ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                      <Check className="w-4 h-4" /> ¡Notificaciones ya activadas!
                    </div>
                  ) : (
                    <button
                      onClick={handleEnablePush}
                      disabled={pushLoading}
                      className="w-full bg-[#1A1A1A] hover:bg-[#2d2416] disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
                    >
                      {pushLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Activando...</> : <><BellRing className="w-4 h-4" /> Activar notificaciones push</>}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => { setSubModalOpen(false); setSubSuccess(false); setSubEmail(""); }}
                  className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 rounded-xl font-bold transition"
                >
                  Listo
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-5">
                {/* Opción 1: Correo */}
                <div className="border-2 border-[#C5A55A]/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✉️</span>
                    <div>
                      <p className="font-bold text-[#1A1A1A] text-sm">Recibir por Correo</p>
                      <p className="text-gray-500 text-xs">Te avisamos cada vez que haya una nueva oferta</p>
                    </div>
                  </div>
                  <form onSubmit={handleSubscribeSubmit} className="flex gap-2">
                    <input
                      type="email"
                      value={subEmail}
                      onChange={e => setSubEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C5A55A] transition"
                      required
                    />
                    <button
                      type="submit"
                      disabled={subSubmitting}
                      className="bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {subSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Bell className="w-4 h-4" /> Suscribir</>}
                    </button>
                  </form>
                </div>

                {/* Separador */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider">o también</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Opción 2: Notificaciones Push */}
                <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2d2416] rounded-xl p-4 border border-[#C5A55A]/30">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-0.5">🔔</div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">Notificaciones push al instante</p>
                      <p className="text-white/60 text-xs mt-0.5">Aviso en tu celular aunque no estés en el sitio</p>

                      {pushEnabled ? (
                        <div className="mt-2 flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                          <Check className="w-4 h-4" /> ¡Notificaciones activadas!
                        </div>
                      ) : isIOSSafari && !isPWA ? (
                        /* iPhone en Safari normal: instrucciones para agregar a pantalla de inicio */
                        <div className="mt-3 space-y-2">
                          <p className="text-amber-300 text-xs font-semibold">📱 iPhone: un paso previo</p>
                          <p className="text-white/70 text-[11px] leading-relaxed">
                            Para activar notificaciones en iPhone, primero agrega esta página a tu pantalla de inicio:
                          </p>
                          <ol className="text-white/60 text-[11px] space-y-1 list-decimal list-inside">
                            <li>Toca el ícono <strong className="text-white">Compartir</strong>: <span className="inline-flex items-center justify-center bg-white/20 rounded-md px-1 py-0.5 mx-0.5" style={{verticalAlign:'middle'}}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><rect x="4" y="11" width="16" height="11" rx="2"/></svg></span> (en la barra inferior del navegador)</li>
                            <li>Selecciona <strong className="text-white">&quot;Agregar a pantalla de inicio&quot;</strong></li>
                            <li>Abre la app desde tu pantalla de inicio</li>
                            <li>Regresa aquí y presiona el botón de abajo</li>
                          </ol>
                          <button
                            onClick={handleEnablePush}
                            disabled={pushLoading}
                            className="mt-1 bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                          >
                            {pushLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Activando...</> : <><BellRing className="w-3.5 h-3.5" /> Activar Notificaciones Push</>}
                          </button>
                        </div>
                      ) : (
                        /* Android y Chrome: activa directo con un clic */
                        <div className="mt-2 space-y-2">
                          {!isIOSSafari && (
                            <p className="text-white/60 text-[11px]">✅ En Android/Chrome se activa con un solo clic</p>
                          )}
                          <button
                            onClick={handleEnablePush}
                            disabled={pushLoading}
                            className="bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                          >
                            {pushLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Activando...</> : <><BellRing className="w-3.5 h-3.5" /> Activar Notificaciones</>}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center">Puedes cancelar tu suscripción en cualquier momento.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Adquisición */}
      {giftModalOpen && selectedPromo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#C5A55A] to-[#B8963E] p-5 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2"><Gift className="w-5 h-5" /> Adquirir Cupón</h2>
                <p className="text-white/80 text-sm mt-1">{selectedPromo.title}</p>
              </div>
              <button onClick={() => { setGiftModalOpen(false); resetForm(); }} className="text-white hover:bg-white/20 p-2 rounded-full transition"><X size={20} /></button>
            </div>

            {step !== "success" && (
              <div className="flex items-center px-5 py-3 border-b bg-gray-50">
                {stepLabels.map((label, i) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${i === stepIndex ? "text-[#C5A55A]" : i < stepIndex ? "text-green-600" : "text-gray-400"}`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === stepIndex ? "bg-[#C5A55A] text-white" : i < stepIndex ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>{i < stepIndex ? "✓" : i + 1}</span>
                      <span className="hidden sm:block">{label}</span>
                    </div>
                    {i < 2 && <div className="flex-1 h-px bg-gray-300 mx-2" />}
                  </div>
                ))}
              </div>
            )}

            {step === "form" && (
              <form onSubmit={handleStep1} className="p-5 space-y-4">
                <p className="text-sm text-gray-600">Ingresa tus datos para adquirir el cupón.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Tu nombre" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                  <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="tu@correo.com" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="322 000 0000" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]" />
                </div>
                <button type="submit" className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 rounded-xl font-bold transition">Continuar →</button>
              </form>
            )}

            {step === "type" && (
              <form onSubmit={handleStep2} className="p-5 space-y-4">
                <p className="text-sm font-medium text-gray-700">¿Este cupón es para ti o para regalar?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setIsGift(false)} className={`p-4 rounded-xl border-2 text-center transition ${isGift === false ? 'border-[#C5A55A] bg-[#C5A55A]/10' : 'border-gray-200 hover:border-[#C5A55A]/50'}`}>
                    <div className="text-2xl mb-1">🙋</div>
                    <div className="text-sm font-semibold">Para mí</div>
                  </button>
                  <button type="button" onClick={() => setIsGift(true)} className={`p-4 rounded-xl border-2 text-center transition ${isGift === true ? 'border-[#C5A55A] bg-[#C5A55A]/10' : 'border-gray-200 hover:border-[#C5A55A]/50'}`}>
                    <div className="text-2xl mb-1">🎁</div>
                    <div className="text-sm font-semibold">Para regalar</div>
                  </button>
                </div>
                {isGift && (
                  <div className="space-y-3 bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <p className="text-xs text-purple-700 font-semibold">Datos del destinatario del regalo:</p>
                    <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Nombre del destinatario" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                    <input type="text" value={recipientContact} onChange={e => setRecipientContact(e.target.value)} placeholder="Email o teléfono del destinatario" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep("form")} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold text-sm transition hover:bg-gray-50">← Atrás</button>
                  <button type="submit" className="flex-1 bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 rounded-xl font-bold transition">Continuar →</button>
                </div>
              </form>
            )}

            {step === "payment" && (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                  <p className="font-bold text-amber-800 mb-2">💳 Datos de pago:</p>
                  <p className="text-amber-700">Realiza tu transferencia a:</p>
                  <p className="font-mono font-bold text-amber-900 mt-1">CLABE: 002470701448743487</p>
                  <p className="text-amber-700 text-xs mt-1">Banco: Banamex · Titular: Nutriser</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Tiempo restante:</span>
                  <span className={`font-bold font-mono ${timeLeft < 120 ? 'text-red-600 animate-pulse' : 'text-[#C5A55A]'}`}>{formatTime(timeLeft)}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comprobante de pago *</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#C5A55A]/50 rounded-xl cursor-pointer hover:bg-[#C5A55A]/5 transition">
                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                    {proofFile ? (
                      <div className="text-center p-3">
                        <div className="text-green-600 font-semibold text-sm">✓ {proofFile.name}</div>
                        <div className="text-gray-400 text-xs mt-1">Toca para cambiar</div>
                      </div>
                    ) : (
                      <div className="text-center p-3">
                        <div className="text-[#C5A55A] text-2xl mb-1">📎</div>
                        <div className="text-sm text-gray-500">Toca para subir comprobante</div>
                        <div className="text-xs text-gray-400 mt-1">JPG, PNG o PDF · máx 5MB</div>
                      </div>
                    )}
                  </label>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep("type")} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold text-sm transition hover:bg-gray-50">← Atrás</button>
                  <button type="submit" disabled={isSubmitting || !proofFile} className="flex-1 bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-50 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : '✓ Enviar Comprobante'}
                  </button>
                </div>
              </form>
            )}

            {step === "success" && (
              <div className="p-6 text-center space-y-4">
                <div className="text-5xl mb-2">🎉</div>
                <h3 className="font-bold text-xl text-[#1A1A1A]">¡Cupón Registrado!</h3>
                <p className="text-gray-600 text-sm">Tu solicitud fue enviada. El administrador verificará tu pago y activará tu cupón.</p>
                <div className="bg-[#FAF7F2] border-2 border-[#C5A55A] rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tu código de cupón</p>
                  <p className="font-mono font-black text-2xl text-[#C5A55A] tracking-widest">{generatedCode}</p>
                </div>
                <p className="text-xs text-gray-400">Recibirás un correo de confirmación cuando sea aprobado.</p>
                <button onClick={() => { setGiftModalOpen(false); resetForm(); }} className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 rounded-xl font-bold transition">Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
