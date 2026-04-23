/**
 * Nutriser - Librería Nutriser
 * Página pública para comprar el eBook de Nutriser
 * Flujo: Ver eBook → Datos del comprador → Transferencia bancaria + comprobante → Confirmación
 */
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Upload, Clock, CheckCircle, ShoppingCart, Eye, X, Share2, Wallet } from "lucide-react";
import { useLocation } from "wouter";
import BackToSplash from "@/components/BackToSplash";
import Footer from "@/components/Footer";
import { OFFICIAL_DOMAIN } from "@/const";
import { useSplash } from "@/contexts/SplashContext";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { trpc as trpcClient } from "@/lib/trpc";

const BANK_INFO = {
  bank: "Banamex",
  clabe: "002470701448743487",
};

type Step = "view" | "form" | "proof" | "success";

export default function EbookStore() {
  const { showSplash } = useSplash();
  const { patient, isLoggedIn } = usePatientAuth();

  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("view");
  const [formData, setFormData] = useState({ buyerName: "", buyerEmail: "" });
  const [useWalletEbook, setUseWalletEbook] = useState(false);

  // Wallet data
  const walletQueryEbook = trpcClient.wallet.getMyWallet.useQuery(
    { patientId: patient?.id ?? 0 },
    { enabled: isLoggedIn && !!patient?.id }
  );
  const walletBalanceEbook = walletQueryEbook.data?.wallet?.balance ?? 0;
  const walletDataEbook = walletQueryEbook.data?.wallet ?? null;

  // Capturar el parámetro de referido desde la URL (?ref=NombreDelReferido)
  const [referredBy, setReferredBy] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferredBy(decodeURIComponent(ref));
  }, []);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(900);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [purchaseId, setPurchaseId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState<"front" | "back" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para código de descuento
  const [discountCode, setDiscountCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);

  const { data: ebook, isLoading } = trpc.ebook.getActive.useQuery();
  const purchaseMutation = trpc.ebook.purchase.useMutation();
  const utils = trpc.useUtils();

  // Calcular precio final con descuento
  const originalPrice = ebook ? (ebook.comingSoon && (ebook as any).presalePrice ? Number((ebook as any).presalePrice) : Number(ebook.price)) : 0;
  const discountAmount = Math.round(originalPrice * discountPercent / 100);
  const finalPrice = Math.max(0, originalPrice - discountAmount);
  const isFree = finalPrice === 0;

  const handleApplyDiscountCode = async () => {
    if (!discountCode.trim()) return;
    setIsValidatingCode(true);
    setDiscountError(null);
    try {
      const result = await utils.ebook.validateDiscountCode.fetch({ code: discountCode.trim() });
      if (result.valid) {
        setAppliedCode(discountCode.trim());
        setDiscountPercent(result.discountPercent ?? 0);
        toast.success(`¡Código aplicado! ${result.discountPercent}% de descuento`);
      } else {
        setDiscountError(result.message ?? 'Código no válido');
        setAppliedCode(null);
        setDiscountPercent(0);
      }
    } catch {
      setDiscountError('Error al validar el código. Intenta de nuevo.');
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleRemoveDiscountCode = () => {
    setAppliedCode(null);
    setDiscountPercent(0);
    setDiscountCode("");
    setDiscountError(null);
  };

  // Contador de tiempo
  useEffect(() => {
    if (step !== "proof" || !startedAt) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, 900 - elapsed);
      setTimeRemaining(remaining);
      if (remaining === 0) {
        setStep("view");
        setPurchaseId(null);
        setStartedAt(null);
        toast.error("Tiempo agotado. Por favor intenta de nuevo.");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [step, startedAt]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 10MB");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.buyerName.trim() || !formData.buyerEmail.trim()) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    // Si el eBook es gratuito (100% descuento), saltar el paso de pago
    if (isFree) {
      handleFreeEbookPurchase();
      return;
    }
    setStep("proof");
    setStartedAt(Date.now());
    setTimeRemaining(900);
  };

  // Mutation para pago completo con monedero
  const cashPendingMutationEbook = trpcClient.cashPayments.createPending.useMutation({
    onSuccess: () => {
      setStep('success');
    },
    onError: (err) => {
      toast.error('Error al registrar: ' + err.message);
      setIsSubmitting(false);
    },
  });

  const handleFreeEbookPurchase = async () => {
    if (!ebook) return;
    setIsSubmitting(true);
    try {
      const result = await purchaseMutation.mutateAsync({
        ebookId: ebook.id,
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        proofBase64: 'free_ebook_code', // Marcador especial para eBook gratuito
        referredBy: referredBy ?? undefined,
        discountCode: appliedCode ?? undefined,
      });
      setPurchaseId(result.purchaseId);
      setStep("success");
    } catch {
      toast.error("Error al procesar. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ebook) return;

    // Calcular si el monedero cubre el total
    const finalPriceCents = Math.round(finalPrice * 100);
    const walletCoversEbook = useWalletEbook && walletBalanceEbook >= finalPriceCents && finalPriceCents > 0;

    // — Pago completo con Monedero (sin comprobante) —
    if (walletCoversEbook && walletDataEbook?.id && patient?.id) {
      setIsSubmitting(true);
      cashPendingMutationEbook.mutate({
        walletId: walletDataEbook.id,
        patientId: patient.id,
        concept: ebook.title,
        itemType: 'ebook',
        itemId: String(ebook.id),
        amountCents: finalPriceCents,
        walletAmountUsedCents: finalPriceCents,
        cashbackPercent: 2,
        notes: `eBook: ${ebook.title}. Pago completo con saldo del monedero por ${formData.buyerName}. Pendiente de autorización.`,
      });
      return;
    }

    if (!selectedFile || !filePreview) {
      toast.error("Por favor sube el comprobante de pago");
      return;
    }

    setIsSubmitting(true);
    try {
      const walletDiscountPesos = useWalletEbook && walletBalanceEbook > 0 ? Math.min(walletBalanceEbook, finalPriceCents) / 100 : 0;
      const result = await purchaseMutation.mutateAsync({
        ebookId: ebook.id,
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        proofBase64: filePreview,
        referredBy: referredBy ?? undefined,
        discountCode: appliedCode ?? undefined,
        walletDiscount: walletDiscountPesos > 0 ? walletDiscountPesos : undefined,
        patientEmail: walletDiscountPesos > 0 && patient?.email ? patient.email : undefined,
        ebookTitle: ebook.title,
      });
      setPurchaseId(result.purchaseId);
      setStep("success");
    } catch (error) {
      toast.error("Error al enviar la compra. Por favor intenta de nuevo.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C5A55A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#666]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <BackToSplash />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <BookOpen className="w-16 h-16 text-[#C5A55A]/30 mx-auto mb-4" />
            <h2 className="font-serif text-3xl text-[#1A1A1A] mb-3">Próximamente</h2>
            <p className="text-[#666] mb-6">
              Estamos preparando nuestro eBook. Vuelve pronto para encontrar contenido exclusivo de nutrición y estética.
            </p>

          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <BackToSplash />

      {/* Modal de imagen */}
      {showCoverModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCoverModal(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowCoverModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#C5A55A] transition"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={ebook.coverUrl!}
              alt="Portada"
              className="w-full rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      <div className="pb-12 px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 7rem)' }}>
        <div className="max-w-4xl mx-auto">
          {/* Back Button - siempre visible */}
          <div className="mb-8">
            {step !== "view" && (
              <button
                onClick={() => setStep("view")}
                className="flex items-center gap-2 text-[#C5A55A] hover:text-[#B8963E] transition font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al eBook
              </button>
            )}
          </div>

          {/* Step: View eBook */}
          {step === "view" && (
            <div>
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-[#C5A55A]/10 text-[#C5A55A] px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  <BookOpen className="w-4 h-4" />
                  Librería Nutriser
                </div>
                <h1 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] mb-4">{ebook.title}</h1>
              </div>

              {/* Content Grid — estilo Amazon: imagen pequeña izq, info derecha */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Imagen pequeña — columna izquierda */}
                <div className="flex-shrink-0 w-36 sm:w-44 mx-auto sm:mx-0">
                  {/* Portada */}
                  {ebook.coverUrl ? (
                    <div className="relative group">
                      <img
                        src={ebook.coverUrl}
                        alt={`Portada: ${ebook.title}`}
                        className="w-full rounded-md shadow-md"
                      />
                      <button
                        onClick={() => setShowCoverModal("front")}
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center rounded-lg"
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition bg-white/90 text-[#1A1A1A] px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Ver portada
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full aspect-[3/4] bg-gradient-to-br from-[#C5A55A] to-[#B8963E] rounded-md shadow-md flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-white/50" />
                    </div>
                  )}

                  {/* Etiqueta Próximamente */}
                  {ebook.comingSoon && (
                    <div className="mt-3 flex items-center justify-center gap-2 bg-[#1A1A1A] text-[#C5A55A] px-4 py-2 rounded-full text-sm font-bold tracking-widest uppercase">
                      <span>⏳</span> Próximamente
                    </div>
                  )}
                </div>

                {/* Info — columna principal */}
                <div className="flex-1 space-y-5">
                  {/* Price */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#C5A55A]/20">
                    {ebook.comingSoon && (ebook as any).presalePrice ? (
                      <>
                        <p className="text-sm text-[#999] uppercase tracking-wider mb-1">Pre-venta especial</p>
                        <div className="flex items-end gap-3">
                          <p className="font-serif text-3xl text-[#C5A55A] font-bold">
                            ${Number((ebook as any).presalePrice).toLocaleString('es-MX')}
                            <span className="text-base text-[#999] font-normal ml-1">MXN</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-[#999] line-through">
                            Precio regular: ${Number(ebook.price).toLocaleString('es-MX')} MXN
                          </span>
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            Ahorra ${(Number(ebook.price) - Number((ebook as any).presalePrice)).toLocaleString('es-MX')} MXN
                          </span>
                        </div>
                        <p className="text-sm text-[#666] mt-2">Precio de pre-venta · Acceso de por vida</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-[#999] uppercase tracking-wider mb-1">Precio</p>
                        <p className="font-serif text-3xl text-[#C5A55A] font-bold">
                          ${Number(ebook.price).toLocaleString('es-MX')}
                          <span className="text-base text-[#999] font-normal ml-1">MXN</span>
                        </p>
                        <p className="text-sm text-[#666] mt-2">Acceso de por vida · Lectura en línea</p>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  {ebook.description && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#C5A55A]/20">
                      <h3 className="font-bold text-[#1A1A1A] mb-3">Descripción</h3>
                      <p className="text-[#666] leading-relaxed whitespace-pre-line">{ebook.description}</p>
                    </div>
                  )}

                  {/* Features */}
                  <div className="bg-[#C5A55A]/5 rounded-2xl p-6 border border-[#C5A55A]/20">
                    <h3 className="font-bold text-[#1A1A1A] mb-4">¿Qué incluye?</h3>
                    <ul className="space-y-3">
                      {(ebook.comingSoon ? [
                        "Pre-venta: asegura tu acceso antes del lanzamiento",
                        "El acceso se activa automáticamente al publicarse",
                        "Lectura en línea desde cualquier dispositivo",
                        "Sin fecha de caducidad de acceso",
                      ] : [
                        "Acceso inmediato tras aprobación del pago",
                        "Lectura en línea desde cualquier dispositivo",
                        "Contenido exclusivo de Nutriser",
                        "Sin fecha de caducidad de acceso",
                      ]).map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#C5A55A] flex-shrink-0 mt-0.5" />
                          <span className="text-[#666] text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Aviso pre-venta si es comingSoon */}
                  {ebook.comingSoon && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
                      <span className="text-2xl">⏳</span>
                      <div>
                        <p className="font-bold text-amber-800 text-sm mb-1">Pre-venta disponible</p>
                        <p className="text-amber-700 text-xs leading-relaxed">
                          Puedes adquirir este eBook ahora. El acceso para leerlo se activará automáticamente en cuanto sea publicado oficialmente. Recibirás una notificación en tu correo.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => setStep("form")}
                    className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-4 px-8 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-[#C5A55A]/30 flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {ebook.comingSoon
                      ? `Pre-comprar — $${Number((ebook as any).presalePrice || ebook.price).toLocaleString('es-MX')} MXN`
                      : `Comprar ahora — $${Number(ebook.price).toLocaleString('es-MX')} MXN`}
                  </button>

                  <p className="text-xs text-center text-[#999]">
                    {ebook.comingSoon
                      ? "Pre-venta: el acceso se activa cuando se publique el eBook."
                      : "Pago por transferencia bancaria. El acceso se activa en menos de 24 horas tras verificar tu comprobante."
                    }
                  </p>

                  {/* Botón de recomendar por WhatsApp */}
                  {(() => {
                    const referralUrl = `${OFFICIAL_DOMAIN}/ebook`;
                    const isPresale = ebook.comingSoon && (ebook as any).presalePrice;
                    const presalePrice = isPresale ? Number((ebook as any).presalePrice) : null;
                    const regularPrice = Number(ebook.price);
                    const savings = isPresale ? regularPrice - presalePrice! : 0;
                    const whatsappMsg = encodeURIComponent(
                      `📚 *¡Te recomiendo este eBook de Nutriser!*\n\n` +
                      `*"${ebook.title}"*\n` +
                      (ebook.description ? `${ebook.description.substring(0, 120)}...\n\n` : `\n`) +
                      (isPresale
                        ? `🔥 *PRE-VENTA ESPECIAL: $${presalePrice!.toLocaleString('es-MX')} MXN*\n` +
                          `~~Precio regular: $${regularPrice.toLocaleString('es-MX')} MXN~~\n` +
                          `✨ *¡Ahorras $${savings.toLocaleString('es-MX')} MXN!* — Oferta por tiempo limitado\n\n`
                        : `💰 Precio: $${regularPrice.toLocaleString('es-MX')} MXN\n\n`) +
                      `👉 Cómpralo aquí: ${referralUrl}\n\n` +
                      `✅ Lectura en línea · Acceso de por vida`
                    );
                    const whatsappUrl = `https://wa.me/?text=${whatsappMsg}`;
                    return (
                      <button
                        onClick={() => { window.location.href = whatsappUrl; }}
                        className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white py-3 px-8 rounded-xl font-bold text-base transition-all duration-300 hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Recomendar a un amigo por WhatsApp
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Step: Form */}
          {step === "form" && (
            <div className="max-w-lg mx-auto">
              <div className="text-center mb-8">
                <h2 className="font-serif text-3xl text-[#1A1A1A] mb-2">Tus datos</h2>
                <p className="text-[#666]">Ingresa tu información para continuar con la compra</p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#C5A55A]/20">
                {/* Progress */}
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#C5A55A] text-white flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-sm font-medium text-[#C5A55A]">Tus datos</span>
                  </div>
                  <div className="flex-1 h-px bg-[#C5A55A]/20" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#C5A55A]/20 text-[#999] flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-sm text-[#999]">Pago</span>
                  </div>
                  <div className="flex-1 h-px bg-[#C5A55A]/20" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#C5A55A]/20 text-[#999] flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-sm text-[#999]">Listo</span>
                  </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Nombre completo *</label>
                    <input
                      type="text"
                      value={formData.buyerName}
                      onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                      placeholder="Tu nombre"
                      required
                      className="w-full px-4 py-3 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A] bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Correo electrónico *</label>
                    <input
                      type="email"
                      value={formData.buyerEmail}
                      onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                      placeholder="tu@email.com"
                      required
                      className="w-full px-4 py-3 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A] bg-[#FAF7F2]"
                    />
                    <p className="text-xs text-[#999] mt-1">Aquí recibirás el enlace de acceso a tu eBook</p>
                  </div>

                  {/* Campo de código de descuento */}
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Código de descuento <span className="text-[#999] font-normal">(opcional)</span></label>
                    {appliedCode ? (
                      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                        <span className="text-green-700 font-bold flex-1">✅ {appliedCode} — {discountPercent}% de descuento</span>
                        <button type="button" onClick={handleRemoveDiscountCode} className="text-red-400 hover:text-red-600 text-sm font-medium">Quitar</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={discountCode}
                          onChange={(e) => { setDiscountCode(e.target.value); setDiscountError(null); }}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyDiscountCode())}
                          placeholder="Ej: ebook10"
                          className="flex-1 px-4 py-3 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A] bg-[#FAF7F2] uppercase"
                        />
                        <button
                          type="button"
                          onClick={handleApplyDiscountCode}
                          disabled={!discountCode.trim() || isValidatingCode}
                          className="px-4 py-3 bg-[#1A1A1A] text-white rounded-lg font-semibold text-sm hover:bg-[#333] transition disabled:opacity-50"
                        >
                          {isValidatingCode ? '...' : 'Aplicar'}
                        </button>
                      </div>
                    )}
                    {discountError && <p className="text-red-500 text-xs mt-1">{discountError}</p>}
                  </div>

                  <div className="bg-[#FAF7F2] p-4 rounded-lg border border-[#C5A55A]/20">
                    <p className="text-sm text-[#666]">
                      <strong>eBook:</strong> {ebook.title}
                    </p>
                    {discountPercent > 0 ? (
                      <>
                        <p className="text-sm text-[#999] mt-1 line-through">
                          Precio original: ${originalPrice.toLocaleString('es-MX')} MXN
                        </p>
                        <p className="text-sm text-green-600 mt-1 font-semibold">
                          Descuento ({discountPercent}%): −${discountAmount.toLocaleString('es-MX')} MXN
                        </p>
                        <p className="text-base font-bold text-[#C5A55A] mt-1">
                          Total a pagar: {isFree ? '🎉 GRATIS' : `$${finalPrice.toLocaleString('es-MX')} MXN`}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-[#666] mt-1">
                        <strong>Total:</strong> ${originalPrice.toLocaleString('es-MX')} MXN
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Procesando...' : isFree ? '🎉 Obtener eBook Gratis' : 'Continuar al pago'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Step: Proof */}
          {step === "proof" && (
            <div className="max-w-lg mx-auto">
              <div className="text-center mb-8">
                <h2 className="font-serif text-3xl text-[#1A1A1A] mb-2">Realiza tu pago</h2>
                <p className="text-[#666]">Transfiere el monto y sube tu comprobante</p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#C5A55A]/20">
                {/* Progress */}
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
                    <span className="text-sm text-[#999]">Tus datos</span>
                  </div>
                  <div className="flex-1 h-px bg-[#C5A55A]/20" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#C5A55A] text-white flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-sm font-medium text-[#C5A55A]">Pago</span>
                  </div>
                  <div className="flex-1 h-px bg-[#C5A55A]/20" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#C5A55A]/20 text-[#999] flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-sm text-[#999]">Listo</span>
                  </div>
                </div>

                {/* Timer */}
                <div className={`flex items-center justify-center gap-2 p-3 rounded-lg mb-6 ${timeRemaining < 300 ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"}`}>
                  <Clock className={`w-5 h-5 ${timeRemaining < 300 ? "text-red-500" : "text-blue-500"}`} />
                  <span className={`font-bold text-lg ${timeRemaining < 300 ? "text-red-600" : "text-blue-600"}`}>
                    {formatTime(timeRemaining)}
                  </span>
                  <span className="text-sm text-[#666]">para subir tu comprobante</span>
                </div>

                {/* Bank Info */}
                <div className="bg-[#C5A55A]/10 p-5 rounded-xl mb-6">
                  <h3 className="font-bold text-[#1A1A1A] mb-3 text-center">Datos para transferencia</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#666]">Banco:</span>
                      <span className="font-semibold text-[#1A1A1A]">{BANK_INFO.bank}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#666]">CLABE Interbancaria:</span>
                      <span className="font-mono font-bold text-[#1A1A1A] text-sm">{BANK_INFO.clabe}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#666]">Monto:</span>
                      <div className="text-right">
                        {discountPercent > 0 && (
                          <span className="text-xs text-[#999] line-through block">${originalPrice.toLocaleString('es-MX')} MXN</span>
                        )}
                        <span className="font-bold text-[#C5A55A] text-lg">
                          {isFree ? '🎉 GRATIS' : `$${finalPrice.toLocaleString('es-MX')} MXN`}
                        </span>
                        {discountPercent > 0 && !isFree && (
                          <span className="text-xs text-green-600 block">({discountPercent}% descuento aplicado)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#666]">Concepto:</span>
                      <span className="font-semibold text-[#1A1A1A] text-sm">{ebook.title}</span>
                    </div>
                  </div>
                </div>

                {/* Monedero Nutriser */}
                {isLoggedIn && walletBalanceEbook > 0 && (() => {
                  const finalPriceCentsUI = Math.round(finalPrice * 100);
                  const walletCoversUI = useWalletEbook && walletBalanceEbook >= finalPriceCentsUI && finalPriceCentsUI > 0;
                  return (
                    <div className={`border rounded-xl p-3 mb-4 transition-all ${useWalletEbook ? 'border-[#C5A55A] bg-amber-50/50' : 'border-gray-200 bg-gray-50'}`}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useWalletEbook}
                          onChange={(e) => setUseWalletEbook(e.target.checked)}
                          className="w-4 h-4 accent-[#C5A55A]"
                        />
                        <Wallet className="w-5 h-5 text-[#C5A55A]" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">Usar saldo del monedero</p>
                          <p className="text-xs text-gray-500">Saldo disponible: <span className="font-bold text-[#C5A55A]">${(walletBalanceEbook / 100).toFixed(2)} MXN</span></p>
                        </div>
                      </label>
                      {useWalletEbook && (
                        <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                          {walletCoversUI ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                              <p className="text-xs text-green-700 font-bold">💰 Tu saldo cubre el total — ¡Sin comprobante!</p>
                              <p className="text-[10px] text-green-600 mt-0.5">La compra quedará pendiente de autorización del administrador.</p>
                            </div>
                          ) : (
                            <p className="text-xs text-green-600 font-semibold">Se descontarán ${(Math.min(walletBalanceEbook, finalPriceCentsUI) / 100).toFixed(2)} MXN de tu monedero al enviar</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* File Upload — solo si el monedero no cubre el total */}
                <form onSubmit={handleProofSubmit} className="space-y-4">
                  {(() => {
                    const finalPriceCentsBtn = Math.round(finalPrice * 100);
                    const walletCoversBtn = useWalletEbook && walletBalanceEbook >= finalPriceCentsBtn && finalPriceCentsBtn > 0;
                    if (walletCoversBtn) return null;
                    return (
                      <div>
                        <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Comprobante de pago *</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="cursor-pointer border-2 border-dashed border-[#C5A55A]/30 rounded-xl p-6 text-center hover:border-[#C5A55A] transition"
                        >
                          {filePreview ? (
                            <div>
                              <img src={filePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg mb-2 object-contain" />
                              <p className="text-sm text-[#C5A55A] font-medium">Cambiar imagen</p>
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-10 h-10 text-[#C5A55A] mx-auto mb-3" />
                              <p className="font-semibold text-[#1A1A1A]">Sube la foto del comprobante</p>
                              <p className="text-sm text-[#999] mt-1">PNG, JPG o WEBP (áx 10MB)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const finalPriceCentsSubmit = Math.round(finalPrice * 100);
                    const walletCoversSubmit = useWalletEbook && walletBalanceEbook >= finalPriceCentsSubmit && finalPriceCentsSubmit > 0;
                    return (
                      <button
                        type="submit"
                        disabled={(!walletCoversSubmit && !selectedFile) || isSubmitting}
                        className={`w-full text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                          walletCoversSubmit ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#C5A55A] hover:bg-[#B8963E]'
                        }`}
                      >
                        {isSubmitting
                          ? 'Enviando...'
                          : walletCoversSubmit
                            ? '💰 Solicitar compra con saldo del monedero'
                            : 'Enviar comprobante'
                        }
                      </button>
                    );
                  })()}
                  {(() => {
                    const finalPriceCentsNote = Math.round(finalPrice * 100);
                    const walletCoversNote = useWalletEbook && walletBalanceEbook >= finalPriceCentsNote && finalPriceCentsNote > 0;
                    return walletCoversNote ? (
                      <p className="text-xs text-gray-400 text-center">El administrador autorizará el descuento de tu saldo y confirmará la compra</p>
                    ) : null;
                  })()}
                </form>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (() => {
            // Generar link de referido con el nombre del comprador
            const refName = encodeURIComponent(formData.buyerName);
            const referralUrl = `${OFFICIAL_DOMAIN}/ebook?ref=${refName}`;
            const isPresaleSuccess = ebook.comingSoon && (ebook as any).presalePrice;
            const presalePriceSuccess = isPresaleSuccess ? Number((ebook as any).presalePrice) : null;
            const regularPriceSuccess = Number(ebook.price);
            const savingsSuccess = isPresaleSuccess ? regularPriceSuccess - presalePriceSuccess! : 0;
            const whatsappMsg = encodeURIComponent(
              `📚 *¡Acabo de comprar el eBook "${ebook.title}" de Nutriser!*\n\n` +
              `Es un libro increíble sobre nutrición y hábitos alimentarios. ¡Te lo recomiendo mucho!\n\n` +
              (isPresaleSuccess
                ? `🔥 *Precio de pre-venta: $${presalePriceSuccess!.toLocaleString('es-MX')} MXN* (precio regular $${regularPriceSuccess.toLocaleString('es-MX')} MXN)\n` +
                  `✨ *¡Todavía puedes ahorrar $${savingsSuccess.toLocaleString('es-MX')} MXN!* — Oferta por tiempo limitado\n\n`
                : `(Precio: $${regularPriceSuccess.toLocaleString('es-MX')} MXN)\n\n`) +
              `👉 Cómpralo aquí: ${referralUrl}`
            );
            const whatsappUrl = `https://wa.me/?text=${whatsappMsg}`;

            return (
              <div className="max-w-lg mx-auto text-center">
                <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#C5A55A]/20">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="font-serif text-3xl text-[#1A1A1A] mb-3">¡Compra recibida!</h2>
                  <p className="text-[#666] mb-6 leading-relaxed">
                    Hemos recibido tu comprobante de pago. Una vez que verifiquemos tu transferencia, recibirás un correo en <strong>{formData.buyerEmail}</strong> con el enlace de acceso a tu eBook.
                  </p>

                  <div className="bg-[#FAF7F2] rounded-xl p-5 mb-6 text-left space-y-2">
                    <p className="text-sm text-[#666]"><strong>eBook:</strong> {ebook.title}</p>
                    <p className="text-sm text-[#666]"><strong>Comprador:</strong> {formData.buyerName}</p>
                    <p className="text-sm text-[#666]"><strong>Correo:</strong> {formData.buyerEmail}</p>
                    {purchaseId && <p className="text-sm text-[#999]"><strong>Referencia:</strong> #{purchaseId}</p>}
                    {referredBy && (
                      <p className="text-sm text-[#C5A55A]"><strong>Recomendado por:</strong> {referredBy} 👍</p>
                    )}
                  </div>

                  {ebook.comingSoon ? (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6">
                      <p className="text-sm text-amber-800">
                        <strong>⏳ Pre-venta confirmada:</strong> Tu compra ha sido registrada. El acceso al eBook se activará automáticamente en cuanto sea publicado oficialmente. Te notificaremos por correo a <strong>{formData.buyerEmail}</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <p className="text-sm text-blue-700">
                        <strong>Tiempo de activación:</strong> El acceso se activa en menos de 24 horas hábiles. Revisa también tu carpeta de spam.
                      </p>
                    </div>
                  )}

                  {/* Botón de recomendar por WhatsApp */}
                  <div className="bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-xl p-5 mb-6">
                    <p className="text-sm font-semibold text-[#1A1A1A] mb-1">📣 ¡Recomienda el eBook a tus amigos!</p>
                    <p className="text-xs text-[#666] mb-4">
                      Comparte tu link personalizado. Cuando alguien compre a través de tu recomendación, quedará registrado con tu nombre.
                    </p>
                    <button
                      onClick={() => { window.location.href = whatsappUrl; }}
                      className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BA5A] text-white py-3 rounded-xl font-bold transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Recomendar por WhatsApp
                    </button>
                    <p className="text-xs text-[#999] mt-2 break-all">
                      Tu link: <span className="text-[#C5A55A]">{referralUrl}</span>
                    </p>
                  </div>


                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <Footer />
    </div>
  );
}
