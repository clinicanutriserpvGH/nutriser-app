import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Calendar, Clock, Mail, Phone, User, ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { SimpleCaptcha } from "@/components/SimpleCaptcha";

const SERVICES = [
  "Asesoría Nutricional Personalizada",
  "Cavitación 80K y 120K",
  "Radiofrecuencia Corporal",
  "Vacunterapia",
  "Láser Lipolítico No Invasivo (Hipoláser)",
  "Martillo Vibrador Corporal",
  "Vacuum con Copas para Glúteos",
  "Aplicación de Enzimas Reductoras",
  "Mesoterapia Reductora",
  "Diagnóstico Facial con Monitor de Piel",
  "Limpieza Facial Profunda",
  "Dermaplaning",
  "Radiofrecuencia Facial",
  "Hollywood Peel con Láser PicoSegundos",
  "Microneedling Profesional (Dermapen)",
  "Plasma Rico en Plaquetas (PRP)",
  "Martillo Frío Facial",
  "Blefaroplastia No Quirúrgica",
  "Láser CO₂ Fraccionado",
  "Toxina Botulínica (Botox)",
  "Relleno de Ácido Hialurónico (Russian Lips)",
  "Rellenos Faciales",
  "Detox Iónico",
  "Retiro de Tatuajes con Láser",
  "Productos Nutricionales y Cosméticos",
  "Valoración General",
];

const CLINIC_HOURS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
];

export default function AppointmentForm() {
  const [, navigate] = useLocation();

  // Leer el servicio preseleccionado desde el query param ?service=...
  const searchParams = new URLSearchParams(window.location.search);
  const preselectedService = searchParams.get("service");
  const initialService = preselectedService && SERVICES.includes(preselectedService)
    ? preselectedService
    : "Asesoría Nutricional Personalizada";

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    serviceType: initialService,
  });
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  const createMutation = trpc.appointments.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isCaptchaVerified) {
      toast.error("Por favor verifica que eres humano");
      return;
    }
    
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone || !formData.appointmentDate || !formData.appointmentTime || !formData.serviceType) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      const date = new Date(formData.appointmentDate);
      
      await createMutation.mutateAsync({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        appointmentDate: date,
        appointmentTime: formData.appointmentTime,
        serviceType: formData.serviceType,
        notes: "Cita agendada desde formulario de valoración",
      });

      toast.success("¡Cita agendada correctamente! Te enviaremos un correo de confirmación.");
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        appointmentDate: "",
        appointmentTime: "",
        serviceType: "Asesoría Nutricional Personalizada",
      });
    } catch (error) {
      toast.error("Error al agendar la cita");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] to-[#F5F1E8] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              sessionStorage.removeItem("nutriser_splash_seen");
              window.location.href = "/";
            }}
            className="flex items-center gap-2 text-[#C5A55A] hover:text-[#B8963E]"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-[#1A1A1A] mb-4">Agenda tu Cita</h1>
          <p className="text-lg text-[#1A1A1A]/60">
            Completa el formulario y nos pondremos en contacto para confirmar tu cita
          </p>
          <div className="mt-4 mx-auto max-w-lg bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-lg px-5 py-3 text-sm text-[#7a6030] text-center">
            💡 <strong>Importante:</strong> Selecciona el <strong>servicio deseado</strong> en el formulario para que podamos preparar tu cita correctamente. La confirmación de fecha y hora la coordinaremos contigo directamente.
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-2 border-[#C5A55A]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent">
            <CardTitle className="text-[#C5A55A]">Información de la Cita</CardTitle>
            <CardDescription>Todos los campos son obligatorios</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-[#C5A55A]" />
                  Nombre completo *
                </Label>
                <Input
                  id="name"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Tu nombre"
                  required
                  className="border-[#C5A55A]/30 focus:border-[#C5A55A]"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-[#C5A55A]" />
                  Correo electrónico *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  placeholder="tu@email.com"
                  required
                  className="border-[#C5A55A]/30 focus:border-[#C5A55A]"
                />
              </div>

              {/* Teléfono */}
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-[#C5A55A]" />
                  Teléfono *
                </Label>
                <Input
                  id="phone"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  placeholder="+52 (requerido)"
                  required
                  className="border-[#C5A55A]/30 focus:border-[#C5A55A]"
                />
              </div>

              {/* Servicio */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <ChevronDown className="w-4 h-4 text-[#C5A55A]" />
                  Servicio deseado *
                </Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsServiceOpen(!isServiceOpen)}
                    className="w-full px-4 py-2 text-left border-2 border-[#C5A55A]/30 rounded-md bg-white hover:border-[#C5A55A] focus:border-[#C5A55A] focus:outline-none transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#1A1A1A]">{formData.serviceType}</span>
                      <ChevronDown className={`w-4 h-4 text-[#C5A55A] transition-transform ${isServiceOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {isServiceOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-[#C5A55A]/30 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
                      {SERVICES.map((service) => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, serviceType: service });
                            setIsServiceOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-[#C5A55A]/10 transition-colors border-b border-[#C5A55A]/10 last:border-b-0 text-[#1A1A1A]"
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fecha */}
              <div>
                <Label htmlFor="date" className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#C5A55A]" />
                  Fecha deseada *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  required
                  className="border-[#C5A55A]/30 focus:border-[#C5A55A]"
                />
              </div>

              {/* Hora */}
              <div>
                <Label htmlFor="time" className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#C5A55A]" />
                  Horario deseado *
                </Label>
                <select
                  id="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-[#C5A55A]/30 rounded-md bg-white hover:border-[#C5A55A] focus:border-[#C5A55A] focus:outline-none transition-colors"
                >
                  <option value="">Selecciona una hora</option>
                  {CLINIC_HOURS.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </div>

              {/* CAPTCHA */}
              <div>
                <SimpleCaptcha onVerify={setIsCaptchaVerified} isSubmitting={isSubmitting} />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !isCaptchaVerified}
                className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 text-lg font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Agendando..." : "Agendar Cita"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-[#C5A55A]/10 rounded-lg">
              <p className="text-sm text-[#1A1A1A]/70">
                <strong>Nota:</strong> Después de enviar el formulario, nos pondremos en contacto por correo o teléfono para confirmar tu cita.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
