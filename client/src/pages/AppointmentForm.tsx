import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Calendar, Clock, Mail, Phone, User, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function AppointmentForm() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = trpc.appointments.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone || !formData.appointmentDate || !formData.appointmentTime) {
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
        serviceType: "Valoración General",
        notes: "Cita agendada desde formulario de valoración",
      });

      toast.success("¡Cita agendada correctamente! Te enviaremos un correo de confirmación.");
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        appointmentDate: "",
        appointmentTime: "",
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
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[#C5A55A] hover:text-[#B8963E]"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-[#1A1A1A] mb-4">Agenda tu Valoración</h1>
          <p className="text-lg text-[#1A1A1A]/60">
            Completa el formulario y nos pondremos en contacto para confirmar tu cita
          </p>
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
                <Input
                  id="time"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  required
                  className="border-[#C5A55A]/30 focus:border-[#C5A55A]"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 text-lg font-bold tracking-wider"
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
