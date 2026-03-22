/**
 * Nutriser - Tienda eBook
 * Página pública para comprar el eBook de Nutriser
 * Flujo: Ver eBook → Datos del comprador → Transferencia bancaria + comprobante → Confirmación
 */
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Upload, Clock, CheckCircle, ShoppingCart, Eye, X } from "lucide-react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BANK_INFO = {
  bank: "Banamex",
  clabe: "002470701448743487",
};

type Step = "view" | "form" | "proof" | "success";

export default function EbookStore() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("view");
  const [formData, setFormData] = useState({ buyerName: "", buyerEmail: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(900);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [purchaseId, setPurchaseId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState<"front" | "back" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: ebook, isLoading } = trpc.ebook.getActive.useQuery();
  const purchaseMutation = trpc.ebook.purchase.useMutation();

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
    setStep("proof");
    setStartedAt(Date.now());
    setTimeRemaining(900);
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !filePreview) {
      toast.error("Por favor sube el comprobante de pago");
      return;
    }
    if (!ebook) return;

    setIsSubmitting(true);
    try {
      const result = await purchaseMutation.mutateAsync({
        ebookId: ebook.id,
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        proofBase64: filePreview,
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
        <Navbar lightBg />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <BookOpen className="w-16 h-16 text-[#C5A55A]/30 mx-auto mb-4" />
            <h2 className="font-serif text-3xl text-[#1A1A1A] mb-3">Próximamente</h2>
            <p className="text-[#666] mb-6">
              Estamos preparando nuestro eBook. Vuelve pronto para encontrar contenido exclusivo de nutrición y estética.
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-[#C5A55A] hover:text-[#B8963E] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Navbar lightBg />

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
              src={showCoverModal === "front" ? ebook.coverUrl! : ebook.backCoverUrl!}
              alt={showCoverModal === "front" ? "Portada" : "Contraportada"}
              className="w-full rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      <div className="pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button - siempre visible */}
          <div className="mb-8">
            <button
              onClick={() => {
                if (step === "view") {
                  window.location.href = "/";
                } else {
                  setStep("view");
                }
              }}
              className="flex items-center gap-2 text-[#C5A55A] hover:text-[#B8963E] transition font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === "view" ? "Volver al inicio" : "Volver al eBook"}
            </button>
          </div>

          {/* Step: View eBook */}
          {step === "view" && (
            <div>
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-[#C5A55A]/10 text-[#C5A55A] px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  <BookOpen className="w-4 h-4" />
                  Tienda eBook
                </div>
                <h1 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] mb-4">{ebook.title}</h1>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Images */}
                <div className="space-y-4">
                  {/* Portada */}
                  {ebook.coverUrl ? (
                    <div className="relative group">
                      <img
                        src={ebook.coverUrl}
                        alt={`Portada: ${ebook.title}`}
                        className="w-full rounded-lg shadow-xl"
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
                    <div className="w-full aspect-[3/4] bg-gradient-to-br from-[#C5A55A] to-[#B8963E] rounded-lg shadow-xl flex items-center justify-center">
                      <BookOpen className="w-24 h-24 text-white/50" />
                    </div>
                  )}

                  {/* Contraportada */}
                  {ebook.backCoverUrl && (
                    <div className="relative group">
                      <img
                        src={ebook.backCoverUrl}
                        alt={`Contraportada: ${ebook.title}`}
                        className="w-full rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => setShowCoverModal("back")}
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center rounded-lg"
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition bg-white/90 text-[#1A1A1A] px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Ver contraportada
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-6">
                  {/* Price */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#C5A55A]/20">
                    <p className="text-sm text-[#999] uppercase tracking-wider mb-1">Precio</p>
                    <p className="font-serif text-5xl text-[#C5A55A] font-bold">
                      ${Number(ebook.price).toLocaleString('es-MX')}
                      <span className="text-xl text-[#999] font-normal ml-2">MXN</span>
                    </p>
                    <p className="text-sm text-[#666] mt-2">Acceso de por vida · Lectura en línea</p>
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
                      {[
                        "Acceso inmediato tras aprobación del pago",
                        "Lectura en línea desde cualquier dispositivo",
                        "Contenido exclusivo de Nutriser",
                        "Sin fecha de caducidad de acceso",
                      ].map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#C5A55A] flex-shrink-0 mt-0.5" />
                          <span className="text-[#666] text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => setStep("form")}
                    className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-4 px-8 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-[#C5A55A]/30 flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Comprar ahora — ${Number(ebook.price).toLocaleString('es-MX')} MXN
                  </button>

                  <p className="text-xs text-center text-[#999]">
                    Pago por transferencia bancaria. El acceso se activa en menos de 24 horas tras verificar tu comprobante.
                  </p>
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

                  <div className="bg-[#FAF7F2] p-4 rounded-lg border border-[#C5A55A]/20">
                    <p className="text-sm text-[#666]">
                      <strong>eBook:</strong> {ebook.title}
                    </p>
                    <p className="text-sm text-[#666] mt-1">
                      <strong>Total:</strong> ${Number(ebook.price).toLocaleString('es-MX')} MXN
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-4 rounded-xl font-bold text-lg transition-all duration-300"
                  >
                    Continuar al pago
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
                      <span className="font-bold text-[#C5A55A] text-lg">${Number(ebook.price).toLocaleString('es-MX')} MXN</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#666]">Concepto:</span>
                      <span className="font-semibold text-[#1A1A1A] text-sm">{ebook.title}</span>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <form onSubmit={handleProofSubmit} className="space-y-4">
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
                          <p className="text-sm text-[#999] mt-1">PNG, JPG o WEBP (máx 10MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedFile || isSubmitting}
                    className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar comprobante"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
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
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-700">
                    <strong>Tiempo de activación:</strong> El acceso se activa en menos de 24 horas hábiles. Revisa también tu carpeta de spam.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 rounded-xl font-bold transition-all duration-300"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
