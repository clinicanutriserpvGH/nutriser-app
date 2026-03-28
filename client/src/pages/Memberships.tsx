import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, Upload, Clock, ArrowLeft, Tag, CheckCircle2, Loader2, Copy, CheckCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import BackToSplash from "@/components/BackToSplash";

// Componente reutilizable para copiar texto al portapapeles
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback para navegadores sin clipboard API
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar CLABE"
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
        copied
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-[#C5A55A]/15 text-[#C5A55A] border border-[#C5A55A]/30 hover:bg-[#C5A55A]/25'
      }`}
    >
      {copied ? (
        <><CheckCheck className="w-3 h-3" /> Copiado</>
      ) : (
        <><Copy className="w-3 h-3" /> Copiar</>
      )}
    </button>
  );
}

const BANK_INFO = {
  bank: "Banamex",
  account: "002470701448743487",
};

const PRICE_PER_CONSULT = 800;

const PROGRAMS = [
  {
    id: "basic",
    name: "Paquete Básico",
    price: 2500,
    color: "#C5A55A",
    consultCount: 4,
    features: [
      "4 asesorías nutricionales personalizadas",
      "4 escaneos corporales",
      "5% de descuento en tratamientos corporales",
      "Acceso a seguimiento online",
    ],
  },
  {
    id: "premium",
    name: "Paquete Premium",
    price: 4500,
    color: "#D4AF37",
    consultCount: 8,
    features: [
      "8 asesorías nutricionales personalizadas",
      "8 escaneos corporales",
      "10% de descuento en todos los tratamientos",
      "Acceso a seguimiento online",
      "10% de descuento en compra de eBook",
    ],
  },
];

export default function Memberships() {
  const [, navigate] = useLocation();
  const [selectedProgram, setSelectedProgram] = useState<"basic" | "premium" | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    discountCode: "",
  });
  const [discountInfo, setDiscountInfo] = useState<{ valid: boolean; discount: number | null; isGift: boolean; isTwoForOne: boolean; description: string | null } | null>(null);
  const [discountValidating, setDiscountValidating] = useState(false);
  const [membershipId, setMembershipId] = useState<number | null>(null);
  const [step, setStep] = useState<"select" | "form" | "proof">("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(900); // 15 minutos en segundos
  const [createdAt, setCreatedAt] = useState<number | null>(null);


  const createMutation = trpc.memberships.create.useMutation();
  const uploadProofMutation = trpc.memberships.uploadProof.useMutation();
  const cancelMutation = trpc.memberships.cancel.useMutation();
  const utils = trpc.useUtils();

  const handleValidateDiscount = async () => {
    const code = formData.discountCode.trim();
    if (!code) { toast.error("Ingresa un código de descuento"); return; }
    setDiscountValidating(true);
    try {
      // Usar fetch directo para evitar problemas de caché con useQuery
      const result = await utils.discountCodes.validate.fetch({ code });
      if (result?.valid) {
        setDiscountInfo({ valid: true, discount: result.discount, isGift: result.isGift ?? false, isTwoForOne: result.isTwoForOne ?? false, description: result.description ?? null });
        if (result.isTwoForOne) {
          toast.success("¡Código 2x1 aplicado! Compras un programa y obtienes el siguiente a mitad de precio.");
        } else if (result.isGift) {
          toast.success("¡Código de regalo aplicado! Tu programa es completamente gratis.");
        } else {
          toast.success(`¡Código válido! ${result.discount}% de descuento aplicado.`);
        }
      } else {
        setDiscountInfo({ valid: false, discount: null, isGift: false, isTwoForOne: false, description: null });
        toast.error("Código inválido o no está activo.");
      }
    } catch {
      toast.error("Error al validar el código.");
    } finally {
      setDiscountValidating(false);
    }
  };

  // Contador de tiempo
  useEffect(() => {
    if (step !== "proof" || !createdAt) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - createdAt) / 1000);
      const remaining = Math.max(0, 900 - elapsed);
      setTimeRemaining(remaining);

      // Si se acabó el tiempo, cancelar membresía
      if (remaining === 0 && membershipId) {
        cancelMutation.mutate({ membershipId });
        setStep("select");
        setMembershipId(null);
        setCreatedAt(null);
        toast.error("Tiempo agotado. La inscripción ha sido cancelada.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, createdAt, membershipId, cancelMutation]);

  const handleSelectProgram = (program: "basic" | "premium") => {
    setSelectedProgram(program);
    setStep("form");
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    // Validaciones específicas por campo
    const name = formData.clientName.trim();
    const email = formData.clientEmail.trim();
    const phone = formData.clientPhone.trim();

    if (!name) {
      toast.error("⚠️ El nombre completo es obligatorio");
      return;
    }
    if (name.length < 3 || !/\s/.test(name)) {
      toast.error("⚠️ Ingresa tu nombre completo (nombre y apellido)");
      return;
    }
    if (!email) {
      toast.error("⚠️ El correo electrónico es obligatorio");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("⚠️ El correo electrónico no es válido. Ejemplo: tunombre@gmail.com");
      return;
    }
    if (!phone) {
      toast.error("⚠️ El teléfono es obligatorio");
      return;
    }
    const phoneDigits = phone.replace(/[\s\-\+\(\)]/g, '');
    if (phoneDigits.length < 10 || !/^\d+$/.test(phoneDigits)) {
      toast.error("⚠️ El teléfono no es válido. Ingresa al menos 10 dígitos. Ejemplo: 3221007799");
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        programType: selectedProgram,
        discountCode: (discountInfo?.valid && formData.discountCode.trim()) ? formData.discountCode.trim() : undefined,
        discountPercent: (discountInfo?.valid && discountInfo.discount) ? discountInfo.discount : undefined,
      });

      setMembershipId(result.id);
      setCreatedAt(Date.now());
      setTimeRemaining(900); // Reiniciar contador a 15 minutos
      setStep("proof");
      toast.success("Datos guardados. Ahora sube tu comprobante de pago para completar la inscripción.");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('email') || msg.includes('correo')) {
        toast.error("⚠️ El correo electrónico no es válido o ya está registrado.");
      } else if (msg.includes('phone') || msg.includes('tel')) {
        toast.error("⚠️ El número de teléfono no es válido.");
      } else {
        toast.error("⚠️ No se pudo completar el registro. Verifica que todos tus datos sean correctos e inténtalo de nuevo.");
      }
      console.error(error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe exceder 5MB");
      return;
    }

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setFilePreview(preview);
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membershipId || !selectedFile) {
      toast.error("Por favor selecciona una imagen");
      return;
    }

    try {
      // Convertir archivo a base64 para enviar
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        try {
          await uploadProofMutation.mutateAsync({
            membershipId,
            proofData: base64,
            fileName: selectedFile.name,
          });

          toast.success("Comprobante recibido. En cuanto confirmemos tu pago, recibirás un correo con las instrucciones de acceso.");
          setStep("select");
          setFormData({ clientName: "", clientEmail: "", clientPhone: "", discountCode: "" });
          setDiscountInfo(null);
          setSelectedProgram(null);
          setMembershipId(null);
          setSelectedFile(null);
          setFilePreview(null);
          setCreatedAt(null);
          setTimeRemaining(900);
        } catch (error) {
          toast.error("Error al subir el comprobante");
          console.error(error);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error("Error al procesar la imagen");
      console.error(error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] to-[#F5F1E8] py-12 px-4">
      <BackToSplash />
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">

        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-[#1A1A1A] mb-4">Comprar Paquetes Nutrición</h1>
          <p className="text-lg text-[#1A1A1A]/60">Elige el paquete que mejor se adapte a tus necesidades</p>
        </div>

        {/* Step: Select Program */}
        {step === "select" && (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {PROGRAMS.map((program) => {
                const hasDiscount = discountInfo?.valid && !discountInfo.isTwoForOne;
                const isGift = discountInfo?.valid && discountInfo.isGift;
                const discountedPrice = hasDiscount && !isGift && discountInfo.discount
                  ? Math.round(program.price * (1 - discountInfo.discount / 100))
                  : null;
                const consultValue = program.consultCount * PRICE_PER_CONSULT;
                const savingsVsConsults = consultValue - program.price;

                return (
                  <Card
                    key={program.id}
                    className={`border-2 transition-all cursor-pointer relative overflow-hidden ${
                      hasDiscount
                        ? 'border-[#C5A55A] shadow-lg shadow-[#C5A55A]/20'
                        : 'border-[#C5A55A]/20 hover:border-[#C5A55A]'
                    }`}
                    onClick={() => handleSelectProgram(program.id as "basic" | "premium")}
                  >
                    {/* Badge de ahorro vs consultas individuales */}
                    <div className="absolute top-4 right-4 bg-green-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                      💰 Ahorras ${savingsVsConsults.toLocaleString('es-MX')} MXN
                    </div>
                    <CardHeader>
                      <CardTitle className="font-serif text-3xl" style={{ color: program.color }}>
                        {program.name}
                      </CardTitle>
                      <CardDescription className="mt-1 space-y-1">
                        {isGift ? (
                          <span className="text-2xl font-black text-green-600">¡GRATIS!</span>
                        ) : discountedPrice ? (
                          <div className="flex items-end gap-3">
                            <span className="text-2xl font-bold text-[#C5A55A]">
                              ${discountedPrice.toLocaleString('es-MX')} MXN
                            </span>
                            <span className="text-base text-gray-400 line-through mb-0.5">
                              ${program.price.toLocaleString()} MXN
                            </span>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-[#1A1A1A]">
                            ${program.price.toLocaleString()} MXN
                          </span>
                        )}
                        {/* Comparativa vs consultas individuales */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                          <span className="line-through">${consultValue.toLocaleString('es-MX')} MXN</span>
                          <span className="text-gray-400">si pagaras consultas por separado</span>
                        </div>
                        {discountedPrice && discountInfo?.discount && (
                          <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            Ahorras ${(program.price - discountedPrice).toLocaleString('es-MX')} MXN con tu código
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {program.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-[#C5A55A] mt-0.5 flex-shrink-0" />
                            <span className="text-[#1A1A1A]/70">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full mt-6" style={{ backgroundColor: program.color }}>
                        Comprar
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Código de Promoción — visible antes de seleccionar paquete */}
            <div className="max-w-xl mx-auto">
              <div className="border border-[#C5A55A]/30 rounded-xl p-5 bg-white shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#C5A55A]" />
                  ¿Tienes un código de promoción?
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.discountCode}
                    onChange={(e) => { setFormData({ ...formData, discountCode: e.target.value.toUpperCase() }); setDiscountInfo(null); }}
                    placeholder="Ej: Nutriser20"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleValidateDiscount}
                    disabled={discountValidating || !formData.discountCode.trim()}
                    className="bg-[#C5A55A] hover:bg-[#B8963E] text-white px-4"
                  >
                    {discountValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                  </Button>
                </div>
                {discountInfo && discountInfo.valid && (
                  <div className="mt-3 flex items-center gap-2 text-green-700 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {discountInfo.isTwoForOne
                        ? "¡2x1 aplicado! Adquieres un paquete y obtienes el siguiente a mitad de precio."
                        : discountInfo.isGift
                        ? "¡Regalo aplicado! Tu paquete es completamente gratis."
                        : `¡Código válido! ${discountInfo.discount}% de descuento aplicado. Selecciona tu paquete para ver el precio final.`}
                    </span>
                  </div>
                )}
                {discountInfo && !discountInfo.valid && (
                  <p className="mt-2 text-red-600 text-xs">Código inválido o no está activo.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Step: Form */}
        {step === "form" && selectedProgram && (
          <Card className="max-w-2xl mx-auto border-2 border-[#C5A55A]/20">
            <CardHeader>
              <CardTitle>Completa tus datos</CardTitle>
              <CardDescription>
                Programa: {PROGRAMS.find(p => p.id === selectedProgram)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="+52 (requerido)"
                    required
                  />
                </div>
                {/* ─── Resumen de descuento aplicado (solo lectura) ─── */}
                {discountInfo?.valid && selectedProgram && (() => {
                  const program = PROGRAMS.find(p => p.id === selectedProgram);
                  if (!program) return null;
                  const discounted = discountInfo.isGift ? 0 : Math.round(program.price * (1 - (discountInfo.discount ?? 0) / 100));
                  return (
                    <div className="border border-[#C5A55A]/30 rounded-xl p-4 bg-[#FAF7F2]">
                      <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-3">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {discountInfo.isTwoForOne
                            ? `Código ${formData.discountCode} — ¡2x1 aplicado!`
                            : discountInfo.isGift
                            ? `Código ${formData.discountCode} — ¡Regalo aplicado!`
                            : `Código ${formData.discountCode} — ${discountInfo.discount}% de descuento`}
                        </span>
                      </div>
                      {!discountInfo.isTwoForOne && (
                        <div className="bg-white border border-[#C5A55A]/20 rounded-xl px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Precio original</p>
                            <p className="text-sm text-gray-400 line-through">${program.price.toLocaleString()} MXN</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[#C5A55A] font-semibold mb-0.5">Tu precio</p>
                            {discountInfo.isGift ? (
                              <p className="text-xl font-black text-green-600">¡GRATIS!</p>
                            ) : (
                              <p className="text-xl font-black text-[#C5A55A]">${discounted.toLocaleString('es-MX')} MXN</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep("select");
                      setSelectedProgram(null);
                    }}
                  >
                    Atrás
                  </Button>
                  <Button type="submit" className="flex-1" style={{ backgroundColor: "#C5A55A" }}>
                    Continuar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step: Upload Proof */}
        {step === "proof" && selectedProgram && (
          <Card className="max-w-2xl mx-auto border-2 border-[#C5A55A]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sube el comprobante de pago</CardTitle>
                  <CardDescription>
                    Programa: {PROGRAMS.find(p => p.id === selectedProgram)?.name}
                  </CardDescription>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeRemaining < 300 ? "bg-red-100" : "bg-blue-100"
                }`}>
                  <Clock className="w-5 h-5" />
                  <span className={`font-bold ${timeRemaining < 300 ? "text-red-600" : "text-blue-600"}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Bank Info */}
                <div className="bg-[#C5A55A]/10 p-4 rounded-lg">
                  <h3 className="font-bold text-[#1A1A1A] mb-2">Datos para transferencia:</h3>
                  <p className="text-sm text-[#1A1A1A]/70">
                    <strong>Banco:</strong> {BANK_INFO.bank}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-[#1A1A1A]/70 flex-1">
                      <strong>CLABE Interbancaria:</strong> {BANK_INFO.account}
                    </p>
                    <CopyButton text={BANK_INFO.account} />
                  </div>
                  <p className="text-xs text-[#1A1A1A]/50 mt-2">
                    Concepto: <strong>{formData.clientName ? `${formData.clientName} – ` : "Tu nombre – "}{PROGRAMS.find(p => p.id === selectedProgram)?.name}</strong>
                  </p>
                </div>

                {/* File Upload */}
                <form onSubmit={handleUploadProof} className="space-y-4">
                  <div className="border-2 border-dashed border-[#C5A55A]/30 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      {filePreview ? (
                        <div>
                          <img src={filePreview} alt="Preview" className="max-h-48 mx-auto rounded mb-2" />
                          <p className="text-sm text-[#C5A55A]">Cambiar imagen</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-[#C5A55A] mx-auto mb-2" />
                          <p className="text-[#1A1A1A] font-semibold">Sube la foto del comprobante</p>
                          <p className="text-sm text-[#1A1A1A]/60">PNG, JPG o WEBP (máx 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setStep("select");
                        setSelectedProgram(null);
                        setMembershipId(null);
                        setCreatedAt(null);
                        setTimeRemaining(900);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={!selectedFile || uploadProofMutation.isPending}
                      className="flex-1"
                      style={{ backgroundColor: "#C5A55A" }}
                    >
                      {uploadProofMutation.isPending ? "Enviando..." : "Enviar comprobante"}
                    </Button>
                  </div>
                </form>

                {timeRemaining < 300 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">
                      ⚠️ Te quedan {formatTime(timeRemaining)} para subir el comprobante. Después se cancelará tu inscripción.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
