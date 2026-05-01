import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, Clock, Phone, User, Mail } from "lucide-react";

export default function Appointments() {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    serviceType: "",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const createAppointmentMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("Cita agendada exitosamente. Te enviaremos una confirmación por correo.");
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        appointmentDate: "",
        appointmentTime: "",
        serviceType: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const appointmentDate = new Date(formData.appointmentDate);
      await createAppointmentMutation.mutateAsync({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone || undefined,
        appointmentDate,
        appointmentTime: formData.appointmentTime,
        serviceType: formData.serviceType,
        notes: formData.notes || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Generate time slots (every 30 minutes from 9 AM to 6 PM)
  const timeSlots = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let minute of [0, 30]) {
      const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      timeSlots.push(timeStr);
    }
  }

  const services = [
    "Tratamiento de Estrías",
    "Tratamiento de Cicatrices de Acné",
    "Tratamiento de Celulitis",
    "Tratamiento de Hiperpigmentación",
    "Vacumterapia",
    "Otro",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl lg:text-5xl text-[#1A1A1A] mb-4">
            Agendar tu Valoración
          </h1>
          <p className="text-[#666] text-lg">
            Selecciona la fecha y hora que mejor se adapte a tu disponibilidad
          </p>
        </div>

        <Card className="border-2 border-[#C5A55A]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent">
            <CardTitle className="text-[#C5A55A]">Formulario de Cita</CardTitle>
            <CardDescription>Completa todos los campos para agendar tu cita</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div>
                <Label htmlFor="clientName" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-[#C5A55A]" />
                  Nombre Completo
                </Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Tu nombre completo"
                  required
                  className="border-[#C5A55A]/30 focus:border-[#C5A55A]"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="clientEmail" className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-[#C5A55A]" />
                  Email
                </Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  required
                  className="border-[#C5A55A]/30 focus:border-[#C5A55A]"
                />
              </div>

              {/* Teléfono */}
              <div>
                <Label htmlFor="clientPhone" className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-[#C5A55A]" />
                  Teléfono (Opcional)
                </Label>
                <Input
                  id="clientPhone"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  placeholder="+52 322 100 7799"
                  className="border-[#C5A55A]/30 focus:border-[#C5A55A]"
                />
              </div>

              {/* Servicio */}
              <div>
                <Label htmlFor="serviceType" className="mb-2 block">
                  Servicio o Tratamiento
                </Label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-[#C5A55A]/30 rounded-md focus:outline-none focus:border-[#C5A55A] bg-white"
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <Label htmlFor="appointmentDate" className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#C5A55A]" />
                  Fecha
                </Label>
                <Input
                  id="appointmentDate"
                  name="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  min={today}
                  required
                  className="border-[#C5A55A]/30 focus:border-[#C5A55A]"
                />
              </div>

              {/* Hora */}
              <div>
                <Label htmlFor="appointmentTime" className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#C5A55A]" />
                  Hora
                </Label>
                <select
                  id="appointmentTime"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-[#C5A55A]/30 rounded-md focus:outline-none focus:border-[#C5A55A] bg-white"
                >
                  <option value="">Selecciona una hora</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notas */}
              <div>
                <Label htmlFor="notes" className="mb-2 block">
                  Notas Adicionales (Opcional)
                </Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Cuéntanos más sobre tus necesidades..."
                  rows={4}
                  className="w-full px-3 py-2 border border-[#C5A55A]/30 rounded-md focus:outline-none focus:border-[#C5A55A]"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || createAppointmentMutation.isPending}
                className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 text-lg font-bold tracking-wider"
              >
                {isLoading || createAppointmentMutation.isPending ? "Agendando..." : "Agendar Cita"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-[#C5A55A]/10 rounded-lg border border-[#C5A55A]/20">
          <h3 className="font-serif text-lg text-[#C5A55A] mb-2">¿Prefieres contactarnos directamente?</h3>
          <p className="text-[#666] mb-4">
            Puedes escribirnos por WhatsApp o llamarnos para agendar tu cita:
          </p>
          <a
            href="https://wa.me/523221007799"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#25D366] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#20BA5A] transition-colors"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
