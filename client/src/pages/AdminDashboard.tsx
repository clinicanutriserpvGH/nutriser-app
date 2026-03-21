import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, Calendar, CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      navigate("/admin/login");
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  const { data: memberships } = trpc.memberships.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: appointments } = trpc.appointments.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.memberships.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Membresía activada y correo enviado");
      utils.memberships.list.invalidate();
    },
    onError: (error) => {
      toast.error("Error al activar membresía: " + error.message);
    },
  });

  const handleVerifyMembership = (membershipId: number) => {
    updateStatusMutation.mutate({
      id: membershipId,
      status: "verified",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    toast.success("Sesión cerrada");
    navigate("/");
  };

  if (!isAuthenticated) {
    return null;
  }

  const pendingMemberships = memberships?.filter((m) => m.status === "pending") || [];
  const verifiedMemberships = memberships?.filter((m) => m.status === "verified") || [];
  const pendingAppointments = appointments?.filter((a) => a.status === "pending") || [];

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4">
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-4xl text-[#1A1A1A] mb-2">Panel de Administración</h1>
            <p className="text-[#666]">Nutriser - Aesthetic & Nutrition</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A]/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-[#C5A55A]/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#999] text-sm">Total Membresías</p>
                  <p className="text-3xl font-bold text-[#C5A55A]">{memberships?.length || 0}</p>
                </div>
                <Users className="w-8 h-8 text-[#C5A55A]/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#C5A55A]/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#999] text-sm">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingMemberships.length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#C5A55A]/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#999] text-sm">Verificadas</p>
                  <p className="text-3xl font-bold text-green-600">{verifiedMemberships.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#C5A55A]/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#999] text-sm">Citas</p>
                  <p className="text-3xl font-bold text-[#C5A55A]">{appointments?.length || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-[#C5A55A]/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="memberships" className="space-y-4">
          <TabsList className="bg-[#C5A55A]/10">
            <TabsTrigger value="memberships">Membresías</TabsTrigger>
            <TabsTrigger value="appointments">Citas</TabsTrigger>
          </TabsList>

          {/* Memberships Tab */}
          <TabsContent value="memberships" className="space-y-4">
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#C5A55A]">Solicitudes de Membresía</CardTitle>
                <CardDescription>Gestiona las solicitudes de membresía de los clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#C5A55A]/20">
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Cliente</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Email</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Programa</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Estado</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Comprobante</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Acciones</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberships && memberships.length > 0 ? (
                        memberships.map((membership) => (
                          <tr key={membership.id} className="border-b border-[#C5A55A]/10 hover:bg-[#C5A55A]/5">
                            <td className="py-3 px-4 font-semibold">{membership.clientName}</td>
                            <td className="py-3 px-4">{membership.clientEmail}</td>
                            <td className="py-3 px-4 capitalize">
                              {membership.programType === "basic" ? "Básico" : "Premium"}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  membership.status === "verified"
                                    ? "bg-green-100 text-green-700"
                                    : membership.status === "pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {membership.status === "verified"
                                  ? "Verificada"
                                  : membership.status === "pending"
                                    ? "Pendiente"
                                    : "Rechazada"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Ver</span>
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => handleVerifyMembership(membership.id)}
                                disabled={membership.status === "verified" || updateStatusMutation.isPending}
                              >
                                {updateStatusMutation.isPending ? "Activando..." : "Verificar"}
                              </Button>
                            </td>
                            <td className="py-3 px-4 text-[#999]">
                              {new Date(membership.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#999]">
                            No hay membresías registradas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#C5A55A]">Citas Agendadas</CardTitle>
                <CardDescription>Gestiona las citas agendadas por los clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#C5A55A]/20">
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Cliente</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Email</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Servicio</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Fecha</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Hora</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments && appointments.length > 0 ? (
                        appointments.map((appointment) => (
                          <tr key={appointment.id} className="border-b border-[#C5A55A]/10 hover:bg-[#C5A55A]/5">
                            <td className="py-3 px-4 font-semibold">{appointment.clientName}</td>
                            <td className="py-3 px-4">{appointment.clientEmail}</td>
                            <td className="py-3 px-4">{appointment.serviceType}</td>
                            <td className="py-3 px-4">
                              {new Date(appointment.appointmentDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">{appointment.appointmentTime}</td>
                            <td className="py-3 px-4">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                {appointment.status === "pending" ? "Pendiente" : "Confirmada"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#999]">
                            No hay citas agendadas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
