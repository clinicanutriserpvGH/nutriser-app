import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Loader2, Gift, Sparkles, Mail, Copy, Check, Upload, Clock, X, ArrowRight, User, Users } from "lucide-react";
import { toast } from "sonner";
import CouponCard from "@/components/CouponCard";

type Step = "form" | "type" | "payment" | "success";

export default function PromotionsSection() {
  const { data: promotions, isLoading } = trpc.promotions.list.useQuery();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<{ id: number; title: string } | null>(null);
  const [step, setStep] = useState<Step>("form");

  // Paso 1 - datos del comprador
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");

  // Paso 2 - tipo
  const [isGift, setIsGift] = useState<boolean | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientContact, setRecipientContact] = useState("");

  // Paso 3 - pago
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

  // Timer solo empieza en paso 3 (pago)
  useEffect(() => {
    if (step === "payment" && giftModalOpen) {
      setTimeLeft(900);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGiftModalOpen(false);
            toast.error("Tiempo agotado. Deberás registrarte de nuevo para activar tu cupón.");
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

  const handleShareWhatsApp = (title: string, description: string, promoId: number) => {
    const shareUrl = `https://nutriserpv.com/#cupon-${promoId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`🎁 *${title}*\n\n${description}\n\n${shareUrl}`)}`, "_blank");
  };

  const handleShareEmail = (title: string, description: string, promoId: number) => {
    const shareUrl = `https://nutriserpv.com/#cupon-${promoId}`;
    window.open(`mailto:?subject=${encodeURIComponent(`Promoción Nutriser: ${title}`)}&body=${encodeURIComponent(`${title}\n\n${description}\n\n${shareUrl}`)}`, "_blank");
  };

  const handleCopyLink = (id: number, title: string, description: string | null) => {
    navigator.clipboard.writeText(`🎁 ${title}\n\n${description || ""}`);
    setCopiedId(id);
    toast.success("Cupón copiado");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stepLabels = ["Tus datos", "¿Para quién?", "Pago"];
  const stepIndex = step === "form" ? 0 : step === "type" ? 1 : step === "payment" ? 2 : 3;

  return (
    <section id="promociones" className="py-20 bg-[#FAF7F2]">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h2 className="font-serif text-4xl lg:text-5xl text-[#1A1A1A] mb-4">Cuponera de Promociones</h2>
          <p className="text-[#666] mb-4">Comparte nuestras ofertas con tus amigos</p>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#C5A55A] to-transparent mx-auto" />
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-[#C5A55A] animate-spin" /></div>
        ) : !promotions || promotions.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border-2 border-[#C5A55A]/20 text-center">
            <p className="text-[#999] text-lg">Actualmente no existen promociones</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((promo, index) => (
              <motion.div key={promo.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }}>
                <div id={`cupon-${promo.id}`}>
                  <div className="bg-gradient-to-br from-[#C5A55A] to-[#B8963E] rounded-t-2xl shadow-xl p-8 relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button onClick={() => { setSelectedPromo({ id: promo.id, title: promo.title }); setStep("form"); setGiftModalOpen(true); }}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-3 animate-bounce hover:bg-white/30 transition" title="Adquirir cupón">
                        <Gift className="w-6 h-6 text-white" />
                      </button>
                      <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <h3 className="font-serif text-2xl text-white mb-4 pr-20 leading-tight">{promo.title}</h3>
                    {promo.description && <p className="text-white/90 text-sm leading-relaxed mb-4">{promo.description}</p>}
                    {/* Fecha límite */}
                    {promo.expiresAt && (
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
                        <span className="text-white text-sm">📅</span>
                        <div>
                          <p className="text-white/70 text-xs uppercase tracking-wider">Válido hasta</p>
                          <p className="text-white font-bold text-sm">
                            {new Date(promo.expiresAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Aviso de cita previa */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
                      <span className="text-white text-sm">📞</span>
                      <p className="text-white/90 text-xs font-semibold">Requiere cita previa para ser atendido</p>
                    </div>
                    <div className="h-px bg-white/30 my-4" />
                    <button
                      onClick={() => { setSelectedPromo({ id: promo.id, title: promo.title }); setStep("form"); setGiftModalOpen(true); }}
                      className="block w-full bg-white text-[#C5A55A] py-3 px-4 rounded-lg font-bold text-center uppercase tracking-[0.1em] hover:bg-[#FAF7F2] transition">
                      Lo Quiero
                    </button>
                  </div>
                  <div className="h-1 bg-[#C5A55A]/30 flex items-center justify-between px-4">
                    {[...Array(8)].map((_, i) => <div key={i} className="w-1 h-1 bg-[#C5A55A] rounded-full" />)}
                  </div>
                  <div className="bg-white rounded-b-2xl p-6 shadow-xl border-t-2 border-[#C5A55A]/20">
                    <p className="text-xs font-semibold text-[#666] mb-3 uppercase tracking-wider">Compartir con:</p>
                    <div className="flex gap-3 flex-wrap">
                      <button onClick={() => handleShareWhatsApp(promo.title, promo.description || "", promo.id)} className="flex-1 min-w-[90px] flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.967 1.523 9.9 9.9 0 001.563 19.231c2.693.47 5.455.082 7.978-1.125a9.9 9.9 0 00-4.57-19.629z"/></svg>
                        WhatsApp
                      </button>
                      <button onClick={() => handleShareEmail(promo.title, promo.description || "", promo.id)} className="flex-1 min-w-[70px] flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition">
                        <Mail className="w-4 h-4" />Email
                      </button>
                      <button onClick={() => handleCopyLink(promo.id, promo.title, promo.description)} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition">
                        {copiedId === promo.id ? <><Check size={16} />Copiado</> : <><Copy size={16} />Copiar</>}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Adquisición de Cupón */}
      {giftModalOpen && selectedPromo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C5A55A] to-[#B8963E] p-5 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2"><Gift className="w-5 h-5" /> Adquirir Cupón</h2>
                <p className="text-white/80 text-sm mt-1">{selectedPromo.title}</p>
              </div>
              <button onClick={() => { setGiftModalOpen(false); resetForm(); }} className="text-white hover:bg-white/20 p-2 rounded-full transition"><X size={20} /></button>
            </div>

            {/* Indicador de pasos (solo en pasos 1-3) */}
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

            {/* PASO 1: Datos del comprador */}
            {step === "form" && (
              <form onSubmit={handleStep1} className="p-5 space-y-4">
                <p className="text-sm text-gray-600">Ingresa tus datos para adquirir el cupón.</p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tu Nombre *</label>
                  <input type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A55A] text-sm" placeholder="Ej: María García" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tu Email *</label>
                  <input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A55A] text-sm" placeholder="tu@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tu Teléfono (opcional)</label>
                  <input type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A55A] text-sm" placeholder="322 450 3257" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setGiftModalOpen(false); resetForm(); }} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm">Cancelar</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-[#C5A55A] text-white rounded-lg font-semibold hover:bg-[#B8963E] transition text-sm flex items-center justify-center gap-2">Continuar <ArrowRight size={16} /></button>
                </div>
              </form>
            )}

            {/* PASO 2: ¿Para mí o para regalar? */}
            {step === "type" && (
              <form onSubmit={handleStep2} className="p-5 space-y-4">
                <p className="text-sm text-gray-600 font-semibold">¿Este cupón es para ti o lo vas a regalar?</p>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setIsGift(false)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition ${isGift === false ? "border-[#C5A55A] bg-[#FAF7F2]" : "border-gray-200 hover:border-[#C5A55A]/50"}`}>
                    <User className={`w-10 h-10 ${isGift === false ? "text-[#C5A55A]" : "text-gray-400"}`} />
                    <span className={`font-semibold text-sm ${isGift === false ? "text-[#C5A55A]" : "text-gray-600"}`}>Para mí</span>
                    <span className="text-xs text-gray-500 text-center">El cupón queda a mi nombre</span>
                  </button>
                  <button type="button" onClick={() => setIsGift(true)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition ${isGift === true ? "border-[#C5A55A] bg-[#FAF7F2]" : "border-gray-200 hover:border-[#C5A55A]/50"}`}>
                    <Users className={`w-10 h-10 ${isGift === true ? "text-[#C5A55A]" : "text-gray-400"}`} />
                    <span className={`font-semibold text-sm ${isGift === true ? "text-[#C5A55A]" : "text-gray-600"}`}>Para regalar</span>
                    <span className="text-xs text-gray-500 text-center">Lo comparto con alguien</span>
                  </button>
                </div>

                {isGift === true && (
                  <div className="space-y-3 pt-2 border-t">
                    <p className="text-sm font-semibold text-gray-700">Datos del destinatario:</p>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del destinatario *</label>
                      <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A55A] text-sm" placeholder="Nombre de quien recibe el regalo" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp o Email del destinatario *</label>
                      <input type="text" value={recipientContact} onChange={(e) => setRecipientContact(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A55A] text-sm" placeholder="322 000 0000 o correo@email.com" />
                    </div>
                  </div>
                )}

                {isGift === false && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">Tu cupón quedará registrado a nombre de <strong>{buyerName}</strong>. El admin podrá verificarlo en el panel.</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep("form")} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm">Atrás</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-[#C5A55A] text-white rounded-lg font-semibold hover:bg-[#B8963E] transition text-sm flex items-center justify-center gap-2">Continuar <ArrowRight size={16} /></button>
                </div>
              </form>
            )}

            {/* PASO 3: Pago y comprobante (timer empieza aquí) */}
            {step === "payment" && (
              <>
                <div className={`flex items-center gap-2 px-5 py-3 border-b ${timeLeft < 120 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                  <Clock size={16} className={timeLeft < 120 ? "text-red-600" : "text-amber-600"} />
                  <div>
                    <span className={`text-sm font-bold ${timeLeft < 120 ? "text-red-900" : "text-amber-900"}`}>Tiempo para subir comprobante: {formatTime(timeLeft)}</span>
                    <p className={`text-xs ${timeLeft < 120 ? "text-red-700" : "text-amber-700"}`}>Si no subes el comprobante a tiempo, deberás registrarte de nuevo.</p>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-900 mb-1 uppercase tracking-wide">Clave Interbancaria Banamex</p>
                    <p className="text-xl font-mono font-bold text-blue-600 break-all select-all">002470701448743487</p>
                    <p className="text-xs text-blue-700 mt-2">Realiza la transferencia y sube el comprobante abajo.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Comprobante de Pago *</label>
                    <label htmlFor="proof-upload" className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition ${proofFile ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-[#C5A55A] bg-gray-50"}`}>
                      <Upload size={28} className={proofFile ? "text-green-500 mb-2" : "text-gray-400 mb-2"} />
                      <p className="text-sm font-semibold text-gray-700">{proofFile ? proofFile.name : "Haz clic para subir"}</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG o PDF (máx 5MB)</p>
                      <input id="proof-upload" type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800"><strong>¿Qué pasa después?</strong> El administrador revisará tu comprobante y activará tu cupón. Recibirás confirmación por email.</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep("type")} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm">Atrás</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[#C5A55A] text-white rounded-lg font-semibold hover:bg-[#B8963E] transition disabled:opacity-50 text-sm">
                      {isSubmitting ? "Enviando..." : "Enviar Comprobante"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ÉXITO */}
            {step === "success" && (
              <div className="p-6 space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">¡Comprobante enviado!</h3>
                  <p className="text-sm text-gray-500 mt-1">Estamos revisando tu pago. En breve recibirás tu cupón.</p>
                </div>

                {/* Código de referencia */}
                <div className="bg-[#FAF7F2] border-2 border-[#C5A55A] rounded-xl p-5 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Tu código de referencia</p>
                  <p className="text-3xl font-mono font-bold text-[#C5A55A] tracking-widest">{generatedCode}</p>
                  <p className="text-xs text-gray-500 mt-2">Guarda este código. El administrador lo verificará con tu nombre.</p>
                </div>

                {/* Pasos siguientes */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="text-blue-500 text-lg mt-0.5">📧</span>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Revisa tu correo: <span className="font-mono">{buyerEmail}</span></p>
                      <p className="text-xs text-blue-700 mt-0.5">Una vez autorizado, recibirás el cupón completo con tu código único por correo electrónico. Revisa también tu carpeta de spam.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800 text-center">
                    ⏳ <strong>Tiempo de revisión:</strong> Normalmente en menos de 24 horas hábiles.
                  </p>
                </div>

                <button onClick={() => { setGiftModalOpen(false); resetForm(); }} className="w-full px-4 py-2.5 bg-[#C5A55A] text-white rounded-lg font-semibold hover:bg-[#B8963E] transition text-sm">Entendido</button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
