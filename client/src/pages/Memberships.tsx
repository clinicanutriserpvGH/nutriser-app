import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check } from "lucide-react";

const BANK_INFO = {
  bank: "Banamex",
  account: "002470701448743487",
};

const PROGRAMS = [
  {
    id: "basic",
    name: "Programa Básico",
    price: 2000,
    color: "#C5A55A",
    features: [
      "4 asesorías nutricionales",
      "4 escaneos corporales",
      "5% de descuento en tratamientos corporales",
      "Acceso por 1 año",
    ],
  },
  {
    id: "premium",
    name: "Programa Premium",
    price: 3000,
    color: "#D4AF37",
    features: [
      "10 asesorías nutricionales",
      "10 escaneos corporales",
      "10% de descuento en todos los tratamientos",
      "Acceso por 1 año",
      "Soporte prioritario",
    ],
  },
];

export default function Memberships() {
  const [selectedProgram, setSelectedProgram] = useState<"basic" | "premium" | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
  });
  const [membershipId, setMembershipId] = useState<number | null>(null);
  const [step, setStep] = useState<"select" | "form" | "proof">("select");

  const createMutation = trpc.memberships.create.useMutation();
  const uploadProofMutation = trpc.memberships.uploadProof.useMutation();

  const handleSelectProgram = (program: "basic" | "premium") => {
    setSelectedProgram(program);
    setStep("form");
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    try {
      const result = await createMutation.mutateAsync({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        programType: selectedProgram,
      });

      // Obtener el ID de la membresía (último insertado)
      setMembershipId(Date.now()); // Usar timestamp como ID temporal
      setStep("proof");
      toast.success("Membresía creada. Ahora sube el comprobante de pago.");
    } catch (error) {
      toast.error("Error al crear la membresía");
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membershipId) return;

    const fileInput = document.getElementById("proof-file") as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      toast.error("Por favor selecciona una imagen");
      return;
    }

    // En producción, aquí subirías el archivo a S3 primero
    // Por ahora, simularemos con una URL de ejemplo
    const proofUrl = URL.createObjectURL(file);

    try {
      await uploadProofMutation.mutateAsync({
        membershipId,
        proofUrl,
      });

      toast.success("Comprobante subido correctamente. Te enviaremos un correo de confirmación.");
      setStep("select");
      setFormData({ clientName: "", clientEmail: "", clientPhone: "" });
      setSelectedProgram(null);
      setMembershipId(null);
    } catch (error) {
      toast.error("Error al subir el comprobante");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] to-[#F5F1E8] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] mb-4">
            Nuestros Programas
          </h1>
          <p className="text-lg text-gray-600">
            Elige el programa que mejor se adapte a tus necesidades
          </p>
        </div>

        {step === "select" && (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {PROGRAMS.map((program) => (
              <Card
                key={program.id}
                className="border-2 hover:border-[#C5A55A] transition-all cursor-pointer"
                onClick={() => handleSelectProgram(program.id as "basic" | "premium")}
              >
                <CardHeader className="bg-gradient-to-r from-[#FAF7F2] to-[#F5F1E8]">
                  <CardTitle className="text-2xl text-[#1A1A1A]">
                    {program.name}
                  </CardTitle>
                  <CardDescription className="text-lg font-bold text-[#C5A55A]">
                    ${program.price.toLocaleString("es-MX")} MXN
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-6">
                    {program.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#C5A55A] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-[#C5A55A] hover:bg-[#B39449] text-white">
                    Seleccionar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {step === "form" && selectedProgram && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Datos para tu Membresía</CardTitle>
              <CardDescription>
                Completa el formulario para registrarte en el programa{" "}
                {selectedProgram === "basic" ? "Básico" : "Premium"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitForm} className="space-y-6">
                <div>
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, clientEmail: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono (Opcional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+52 1234567890"
                    value={formData.clientPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, clientPhone: e.target.value })
                    }
                  />
                </div>

                <div className="bg-[#FAF7F2] p-4 rounded-lg border border-[#C5A55A]/20">
                  <h3 className="font-semibold text-[#1A1A1A] mb-3">
                    Datos Bancarios para Transferencia
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">Banco:</span> {BANK_INFO.bank}
                    </p>
                    <p>
                      <span className="font-semibold">Cuenta:</span>{" "}
                      <code className="bg-white px-2 py-1 rounded font-mono text-[#C5A55A]">
                        {BANK_INFO.account}
                      </code>
                    </p>
                    <p className="text-gray-600 mt-3">
                      <span className="font-semibold">Concepto de depósito:</span>
                      <br />
                      {formData.clientName || "Tu nombre"} - Programa{" "}
                      {selectedProgram === "basic" ? "Básico" : "Premium"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("select")}
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#C5A55A] hover:bg-[#B39449] text-white"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Procesando..." : "Continuar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "proof" && membershipId && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Sube tu Comprobante de Pago</CardTitle>
              <CardDescription>
                Por favor, adjunta una foto clara del comprobante de tu transferencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadProof} className="space-y-6">
                <div className="border-2 border-dashed border-[#C5A55A]/30 rounded-lg p-8 text-center">
                  <input
                    id="proof-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                  <label
                    htmlFor="proof-file"
                    className="cursor-pointer block"
                  >
                    <div className="text-[#C5A55A] mb-2">📷</div>
                    <p className="font-semibold text-[#1A1A1A]">
                      Haz clic para seleccionar una imagen
                    </p>
                    <p className="text-sm text-gray-600">
                      o arrastra tu archivo aquí
                    </p>
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Asegúrate de que la imagen sea clara y
                    muestre el comprobante completo con todos los datos de la
                    transferencia.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("form")}
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#C5A55A] hover:bg-[#B39449] text-white"
                    disabled={uploadProofMutation.isPending}
                  >
                    {uploadProofMutation.isPending ? "Subiendo..." : "Enviar Comprobante"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
