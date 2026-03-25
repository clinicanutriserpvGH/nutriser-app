import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, Upload, Clock, ArrowLeft, Tag, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const BANK_INFO = {
  bank: "Banamex",
  account: "002470701448743487",
};

const PROGRAMS = [
  {
    id: "basic",
    name: "Programa Básico",
    price: 2500,
    color: "#C5A55A",
    features: [
      "4 asesorías nutricionales personalizadas",
      "4 escaneos corporales",
      "5% de descuento en tratamientos corporales",
      "Acceso a seguimiento online",
    ],
  },
  {
    id: "premium",
    name: "Programa Premium",
    price: 4000,
    color: "#D4AF37",
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
  const validateDiscountCodeQuery = trpc.discountCodes.validate.useQuery(
    { code: formData.discountCode.trim() },
    { enabled: false }
  );

  const handleValidateDiscount = async () => {
    if (!formData.discountCode.trim()) { toast.error("Ingresa un código de descuento"); return; }
    setDiscountValidating(true);
    try {
      const result = await validateDiscountCodeQuery.refetch();
      if (result.data?.valid) {
        setDiscountInfo({ valid: true, discount: result.data.discount, isGift: result.data.isGift ?? false, isTwoForOne: result.data.isTwoForOne ?? false, description: result.data.description ?? null });
        toast.success(`¡Código válido! ${result.data.discount}% de descuento aplicado.`);
      } else {
        setDiscountInfo({ valid: false, discount: null, isGift: false, isTwoForOne: false, description: null });
        toast.error("Código inválido o no está activo.");
      }
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

    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        programType: selectedProgram,
      });

      setMembershipId(result.id);
      setCreatedAt(Date.now());
      setTimeRemaining(900); // Reiniciar contador a 15 minutos
      setStep("proof");
      toast.success("Membresía creada. Tienes 15 minutos para subir el comprobante.");
    } catch (error) {
      toast.error("Error al crear la membresía");
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
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[#C5A55A] hover:text-[#B8963E]"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-[#1A1A1A] mb-4">Comprar Programa Nutrición</h1>
          <p className="text-lg text-[#1A1A1A]/60">Elige el programa que mejor se adapte a tus necesidades</p>
        </div>

        {/* Step: Select Program */}
        {step === "select" && (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {PROGRAMS.map((program) => (
              <Card
                key={program.id}
                className="border-2 border-[#C5A55A]/20 hover:border-[#C5A55A] transition-all cursor-pointer"
                onClick={() => handleSelectProgram(program.id as "basic" | "premium")}
              >
                <CardHeader>
                  <CardTitle className="font-serif text-3xl" style={{ color: program.color }}>
                    {program.name}
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-[#1A1A1A]">
                    ${program.price.toLocaleString()} MXN
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
                    Seleccionar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
                {/* ─── Código de Descuento ─────────────────────────────── */}
                <div className="border border-[#C5A55A]/30 rounded-xl p-4 bg-[#FAF7F2]">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#C5A55A]" />
                    Código de Promoción (opcional)
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
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-green-700 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {discountInfo.isTwoForOne
                            ? "¡2x1 aplicado! Adquieres un programa y obtienes el siguiente a mitad de precio."
                            : discountInfo.isGift
                            ? "¡Regalo aplicado! Tu programa es completamente gratis."
                            : `¡Código válido! ${discountInfo.discount}% de descuento aplicado.`}
                        </span>
                      </div>
                      {selectedProgram && !discountInfo.isTwoForOne && (
                        (() => {
                          const program = PROGRAMS.find(p => p.id === selectedProgram);
                          if (!program) return null;
                          const discounted = discountInfo.isGift ? 0 : program.price * (1 - (discountInfo.discount ?? 0) / 100);
                          return (
                            <div className="bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-xl px-4 py-3 flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Precio original</p>
                                <p className="text-sm text-gray-400 line-through">${program.price.toLocaleString()} MXN</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-[#C5A55A] font-semibold mb-0.5">Tu precio con descuento</p>
                                {discountInfo.isGift ? (
                                  <p className="text-xl font-black text-green-600">¡GRATIS!</p>
                                ) : (
                                  <p className="text-xl font-black text-[#C5A55A]">${discounted.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MXN</p>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  )}
                  {discountInfo && !discountInfo.valid && (
                    <p className="mt-2 text-red-600 text-xs">Código inválido o no está activo.</p>
                  )}
                </div>

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
                  <p className="text-sm text-[#1A1A1A]/70">
                    <strong>CLABE Interbancaria:</strong> {BANK_INFO.account}
                  </p>
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
