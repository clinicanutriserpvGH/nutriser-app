import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Loader2, Gift, Sparkles, Mail, Copy, Check, Upload, Clock, X } from "lucide-react";
import { toast } from "sonner";

export default function PromotionsSection() {
  const { data: promotions, isLoading } = trpc.promotions.list.useQuery();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [selectedPromoForGift, setSelectedPromoForGift] = useState<{ id: number; title: string } | null>(null);

  // Gift form state
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createGiftPurchase = trpc.giftPurchases.create.useMutation({
    onSuccess: () => {
      toast.success("¡Compra registrada! El admin verificará tu comprobante y recibirás confirmación.");
      setGiftModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error("Error al procesar: " + err.message);
      setIsSubmitting(false);
    },
  });

  const resetForm = () => {
    setBuyerName("");
    setBuyerEmail("");
    setBuyerPhone("");
    setProofFile(null);
    setTimeLeft(900);
    setIsSubmitting(false);
  };

  // Start timer when modal opens
  useEffect(() => {
    if (giftModalOpen) {
      setTimeLeft(900);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGiftModalOpen(false);
            toast.error("Tiempo límite de 15 minutos agotado");
            resetForm();
            return 900;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [giftModalOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo no debe superar 5MB");
      return;
    }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      toast.error("Solo se aceptan JPG, PNG o PDF");
      return;
    }
    setProofFile(file);
  };

  const handleGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) { toast.error("Por favor ingresa tu nombre"); return; }
    if (!buyerEmail.trim()) { toast.error("Por favor ingresa tu email"); return; }
    if (!proofFile) { toast.error("Por favor sube el comprobante de pago"); return; }
    if (!selectedPromoForGift) return;

    setIsSubmitting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      createGiftPurchase.mutate({
        promotionId: selectedPromoForGift.id,
        buyerName,
        buyerEmail,
        buyerPhone,
        proofData: base64,
        proofMimeType: proofFile.type,
      });
    };
    reader.readAsDataURL(proofFile);
  };

  const handleShareWhatsApp = (title: string, description: string, promoId: number) => {
    const shareUrl = `https://nutriserpv.com/#cupon-${promoId}`;
    const message = `🎁 *${title}*\n\n${description}\n\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleShareEmail = (title: string, description: string, promoId: number) => {
    const shareUrl = `https://nutriserpv.com/#cupon-${promoId}`;
    const subject = `Promoción Nutriser: ${title}`;
    const body = `Mira esta promoción de Nutriser:\n\n${title}\n\n${description}\n\n${shareUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  };

  const handleCopyLink = (id: number, title: string, description: string | null) => {
    const text = `🎁 ${title}\n\n${description || ""}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Cupón copiado al portapapeles");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="promociones" className="py-20 bg-[#FAF7F2]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-4xl lg:text-5xl text-[#1A1A1A] mb-4">
            Cuponera de Promociones
          </h2>
          <p className="text-[#666] mb-4">Comparte nuestras ofertas con tus amigos</p>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#C5A55A] to-transparent mx-auto" />
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-[#C5A55A] animate-spin" />
          </div>
        ) : !promotions || promotions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-12 rounded-lg border-2 border-[#C5A55A]/20 text-center"
          >
            <p className="text-[#999] text-lg mb-2">Actualmente no existen promociones</p>
            <p className="text-[#666] text-sm">Vuelve pronto para conocer nuestras ofertas especiales</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="relative" id={`cupon-${promo.id}`}>
                  {/* Cupón Principal */}
                  <div className="bg-gradient-to-br from-[#C5A55A] to-[#B8963E] rounded-t-2xl overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                    <div className="p-8 relative">
                      {/* Icono regalo - abre modal de compra */}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPromoForGift({ id: promo.id, title: promo.title });
                            setGiftModalOpen(true);
                          }}
                          className="bg-white/20 backdrop-blur-sm rounded-full p-3 animate-bounce hover:bg-white/30 transition cursor-pointer"
                          title="Comprar como regalo"
                        >
                          <Gift className="w-6 h-6 text-white" />
                        </button>
                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                      </div>

                      <h3 className="font-serif text-2xl lg:text-3xl text-white mb-4 pr-20 leading-tight">
                        {promo.title}
                      </h3>
                      {promo.description && (
                        <p className="text-white/90 text-sm lg:text-base leading-relaxed mb-6 font-light">
                          {promo.description}
                        </p>
                      )}
                      <div className="h-px bg-white/30 my-6" />
                      <a
                        href={`https://wa.me/3221007799?text=${encodeURIComponent(`Quiero la promoción: ${promo.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-white text-[#C5A55A] py-3 px-4 rounded-lg font-bold text-center uppercase tracking-[0.1em] transition-all duration-300 hover:bg-[#FAF7F2] hover:shadow-lg transform hover:scale-105 active:scale-95"
                      >
                        Lo Quiero
                      </a>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 py-2 opacity-20">
                      {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-2 bg-white rounded-full" />)}
                    </div>
                  </div>

                  {/* Línea de corte */}
                  <div className="h-1 bg-[#C5A55A]/30 relative flex items-center justify-center">
                    <div className="absolute left-0 right-0 flex justify-between px-4">
                      {[...Array(8)].map((_, i) => <div key={i} className="w-1 h-1 bg-[#C5A55A] rounded-full" />)}
                    </div>
                  </div>

                  {/* Sección Compartir */}
                  <div className="bg-white rounded-b-2xl p-6 shadow-xl border-t-2 border-[#C5A55A]/20">
                    <p className="text-xs font-semibold text-[#666] mb-3 uppercase tracking-wider">Compartir con:</p>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => handleShareWhatsApp(promo.title, promo.description || "", promo.id)}
                        className="flex-1 min-w-[100px] flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-all font-semibold text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.967 1.523 9.9 9.9 0 001.563 19.231c2.693.47 5.455.082 7.978-1.125a9.9 9.9 0 00-4.57-19.629z"/>
                        </svg>
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShareEmail(promo.title, promo.description || "", promo.id)}
                        className="flex-1 min-w-[100px] flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-all font-semibold text-sm"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </button>
                      <button
                        onClick={() => handleCopyLink(promo.id, promo.title, promo.description)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                      >
                        {copiedId === promo.id ? <><Check size={18} /><span>Copiado</span></> : <><Copy size={18} /><span>Copiar</span></>}
                      </button>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-4 right-4 h-2 bg-[#C5A55A]/20 rounded-full blur-xl" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Compra de Regalo */}
      {giftModalOpen && selectedPromoForGift && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C5A55A] to-[#B8963E] p-5 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Gift className="w-5 h-5" /> Comprar Cupón de Regalo
                </h2>
                <p className="text-white/80 text-sm mt-1">{selectedPromoForGift.title}</p>
              </div>
              <button onClick={() => { setGiftModalOpen(false); resetForm(); }} className="text-white hover:bg-white/20 p-2 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-5 py-3 border-b ${timeLeft < 120 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
              <Clock size={16} className={timeLeft < 120 ? "text-red-600" : "text-amber-600"} />
              <span className={`text-sm font-semibold ${timeLeft < 120 ? "text-red-900" : "text-amber-900"}`}>
                Tiempo para subir comprobante: {formatTime(timeLeft)}
              </span>
            </div>

            <form onSubmit={handleGiftSubmit} className="p-5 space-y-4">
              {/* Clave bancaria */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-900 mb-1 uppercase tracking-wide">Clave Interbancaria Banamex</p>
                <p className="text-xl font-mono font-bold text-blue-600 break-all select-all">002470701448743487</p>
                <p className="text-xs text-blue-700 mt-2">Realiza la transferencia y sube el comprobante abajo</p>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tu Nombre *</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A55A] text-sm"
                  placeholder="Ej: María García"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tu Email *</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A55A] text-sm"
                  placeholder="tu@email.com"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tu Teléfono (opcional)</label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A55A] text-sm"
                  placeholder="322 450 3257"
                />
              </div>

              {/* Upload Comprobante */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Comprobante de Pago *</label>
                <label
                  htmlFor="proof-upload"
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition ${proofFile ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-[#C5A55A] bg-gray-50"}`}
                >
                  <Upload size={28} className={proofFile ? "text-green-500 mb-2" : "text-gray-400 mb-2"} />
                  <p className="text-sm font-semibold text-gray-700">
                    {proofFile ? proofFile.name : "Haz clic para subir"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG o PDF (máx 5MB)</p>
                  <input
                    id="proof-upload"
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setGiftModalOpen(false); resetForm(); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-[#C5A55A] text-white rounded-lg font-semibold hover:bg-[#B8963E] transition disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? "Procesando..." : "Enviar Comprobante"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
