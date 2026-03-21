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
  const [selectedProofId, setSelectedProofId] = useState<number | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [isLoadingProof, setIsLoadingProof] = useState(false);
  const [promotionTitle, setPromotionTitle] = useState("");
  const [promotionDescription, setPromotionDescription] = useState("");
  const [promotionImage, setPromotionImage] = useState<File | null>(null);

  // Horarios fijos de la clínica
  const CLINIC_HOURS = [
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

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

  const { data: promotions } = trpc.promotions.listForAdmin.useQuery(undefined, {
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

  const deleteMembershipMutation = trpc.memberships.cancel.useMutation({
    onSuccess: () => {
      toast.success("Membresía eliminada");
      utils.memberships.list.invalidate();
    },
    onError: (error) => {
      toast.error("Error al eliminar membresía: " + error.message);
    },
  });

  const getProofQuery = trpc.memberships.getProof.useQuery(selectedProofId ?? 0, {
    enabled: selectedProofId !== null,
  });

  useEffect(() => {
    if (selectedProofId !== null) {
      setIsLoadingProof(true);
    }
  }, [selectedProofId]);

  useEffect(() => {
    if (getProofQuery.data && getProofQuery.data.proofUrl) {
      setProofUrl(getProofQuery.data.proofUrl);
      setIsLoadingProof(false);
    }
  }, [getProofQuery.data]);

  const handleViewProof = (membershipId: number) => {
    setSelectedProofId(membershipId);
    setProofUrl(null);
  };

  const handleVerifyAll = () => {
    if (!memberships) return;
    const pendingMemberships = memberships.filter((m) => m.status === "pending");
    if (pendingMemberships.length === 0) {
      toast.error("No hay membresías pendientes para verificar");
      return;
    }
    if (confirm(`Estás seguro de que deseas verificar ${pendingMemberships.length} membresía(s)?`)) {
      pendingMemberships.forEach((m) => {
        updateStatusMutation.mutate({
          id: m.id,
          status: "verified",
        });
      });
    }
  };

  const handleDeleteAll = () => {
    if (!memberships) return;
    if (memberships.length === 0) {
      toast.error("No hay membresías para eliminar");
      return;
    }
    if (confirm(`Estás seguro de que deseas eliminar TODAS las ${memberships.length} membresía(s)? Esta acción no se puede deshacer.`)) {
      memberships.forEach((m) => {
        deleteMembershipMutation.mutate({ membershipId: m.id });
      });
    }
  };

  const handleVerifyMembership = (membershipId: number) => {
    updateStatusMutation.mutate({
      id: membershipId,
      status: "verified",
    });
  };

  const handleDeleteMembership = (membershipId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta membresía?")) {
      deleteMembershipMutation.mutate({ membershipId });
    }
  };

  const handleApproveAppointment = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
  };

  const handleConfirmApprove = () => {
    toast.success("Cita aprobada y correo enviado");
    setSelectedAppointmentId(null);
  };

  const cancelAppointmentMutation = trpc.appointments.cancel.useMutation({
    onSuccess: () => {
      toast.success("Cita cancelada");
      utils.appointments.list.invalidate();
    },
    onError: (error) => {
      toast.error("Error: " + error.message);
    },
  });

  const deleteAppointmentMutation = trpc.appointments.delete.useMutation({
    onSuccess: () => {
      toast.success("Cita eliminada");
      utils.appointments.list.invalidate();
    },
    onError: (error) => {
      toast.error("Error: " + error.message);
    },
  });

  const deleteAllAppointmentsMutation = trpc.appointments.deleteAll.useMutation({
    onSuccess: () => {
      toast.success("Todas las citas eliminadas");
      utils.appointments.list.invalidate();
    },
    onError: (error) => {
      toast.error("Error: " + error.message);
    },
  });

  const handleCancelAppointment = (appointmentId: number) => {
    if (confirm("¿Estás seguro de que deseas cancelar esta cita?")) {
      cancelAppointmentMutation.mutate({ id: appointmentId });
    }
  };

  const handleDeleteAppointment = (appointmentId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
      deleteAppointmentMutation.mutate({ id: appointmentId });
    }
  };

  const handleDeleteAllAppointments = () => {
    if (!appointments || appointments.length === 0) {
      toast.error("No hay citas para eliminar");
      return;
    }
    if (confirm(`¿Estás seguro de que deseas eliminar TODAS las ${appointments.length} cita(s)? Esta acción no se puede deshacer.`)) {
      deleteAllAppointmentsMutation.mutate();
    }
  };

  const createPromotionMutation = trpc.promotions.create.useMutation({
    onSuccess: () => {
      toast.success("Promoción publicada exitosamente");
      setPromotionTitle("");
      setPromotionDescription("");
      setPromotionImage(null);
      utils.promotions.listForAdmin.invalidate();
      utils.promotions.list.invalidate();
    },
    onError: (error) => {
      toast.error("Error al publicar promoción: " + error.message);
    },
  });

  const deletePromotionMutation = trpc.promotions.delete.useMutation({
    onSuccess: () => {
      toast.success("Promoción eliminada exitosamente");
      utils.promotions.listForAdmin.invalidate();
      utils.promotions.list.invalidate();
    },
    onError: (error) => {
      toast.error("Error al eliminar promoción: " + error.message);
    },
  });

  const handlePublishPromotion = async () => {
    if (!promotionTitle.trim()) {
      toast.error("Ingresa un título para la promoción");
      return;
    }

    try {
      let imageUrl = '/uploads/nutriser-logo.jpeg';
      
      if (promotionImage) {
        const formData = new FormData();
        formData.append('file', promotionImage);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Error al subir imagen');
        }
        
        const { url } = await uploadResponse.json();
        imageUrl = url;
      }
      
      createPromotionMutation.mutate({
        title: promotionTitle,
        description: promotionDescription,
        imageUrl: imageUrl,
      });
    } catch (error) {
      toast.error("Error al subir imagen: " + (error instanceof Error ? error.message : "Error desconocido"));
    }
  };

  // Get the selected appointment to display its time
  const selectedAppointment = appointments?.find((a) => a.id === selectedAppointmentId);

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
            <TabsTrigger value="promotions">Promociones</TabsTrigger>
          </TabsList>

          {/* Memberships Tab */}
          <TabsContent value="memberships" className="space-y-4">
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-[#C5A55A]">Solicitudes de Membresía</CardTitle>
                    <CardDescription>Gestiona las solicitudes de membresía de los clientes</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleVerifyAll}
                    >
                      Verificar Todo
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleDeleteAll}
                    >
                      Eliminar Todo
                    </Button>
                  </div>
                </div>
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
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                                onClick={() => handleViewProof(membership.id)}
                              >
                                Ver
                              </Button>
                            </td>
                            <td className="py-3 px-4 flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-green-100 text-green-700 hover:bg-green-200"
                                onClick={() => handleVerifyMembership(membership.id)}
                                disabled={membership.status === "verified"}
                              >
                                Verificar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-red-100 text-red-700 hover:bg-red-200"
                                onClick={() => handleDeleteMembership(membership.id)}
                              >
                                Eliminar
                              </Button>
                            </td>
                            <td className="py-3 px-4 text-xs text-[#999]">
                              {new Date(membership.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#999]">
                            No hay membresías
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
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-[#C5A55A]">Citas Agendadas</CardTitle>
                    <CardDescription>Gestiona las citas agendadas por los clientes</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDeleteAllAppointments}
                  >
                    Eliminar Todo
                  </Button>
                </div>
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
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Acciones</th>
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
                            <td className="py-3 px-4 flex gap-2">
                              {appointment.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs bg-green-100 text-green-700 hover:bg-green-200"
                                    onClick={() => handleApproveAppointment(appointment.id)}
                                  >
                                    Aprobar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                  >
                                    Cancelar
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-red-100 text-red-700 hover:bg-red-200"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                              >
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#999]">
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

          {/* Promotions Tab */}
          <TabsContent value="promotions" className="space-y-4">
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#C5A55A]">Gestionar Promociones</CardTitle>
                <CardDescription>Agrega, edita o elimina promociones vigentes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulario para agregar promoción */}
                <div className="bg-[#FAF7F2] p-6 rounded-lg space-y-4 border border-[#C5A55A]/20">
                  <h3 className="font-bold text-[#1A1A1A] mb-4">Agregar Nueva Promoción</h3>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Título</label>
                    <input
                      type="text"
                      placeholder="Ej: Descuento 20% en tratamientos"
                      value={promotionTitle}
                      onChange={(e) => setPromotionTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Descripción</label>
                    <textarea
                      placeholder="Describe la promoción..."
                      rows={3}
                      value={promotionDescription}
                      onChange={(e) => setPromotionDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Imagen</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPromotionImage(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A]"
                    />
                  </div>
                  <Button
                    onClick={handlePublishPromotion}
                    disabled={createPromotionMutation.isPending}
                    className="w-full bg-[#C5A55A] hover:bg-[#B39548] text-white font-bold disabled:opacity-50"
                  >
                    {createPromotionMutation.isPending ? "Publicando..." : "Publicar Promoción"}
                  </Button>
                </div>

                {/* Lista de promociones */}
                <div>
                  <h3 className="font-bold text-[#1A1A1A] mb-4">Promociones Publicadas</h3>
                  {!promotions || promotions.length === 0 ? (
                    <div className="bg-[#FAF7F2] p-4 rounded-lg text-center text-[#999]">
                      <p>No hay promociones publicadas aún</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {promotions.map((promo) => (
                        <div key={promo.id} className="bg-[#FAF7F2] p-4 rounded-lg border border-[#C5A55A]/20">
                          <img 
                            src={promo.imageUrl || '/uploads/nutriser-logo.jpeg'} 
                            alt={promo.title} 
                            className="w-full h-40 object-cover rounded-lg mb-3" 
                            onError={(e) => { e.currentTarget.src = '/uploads/nutriser-logo.jpeg'; }}
                          />
                          <h4 className="font-bold text-[#1A1A1A]">{promo.title}</h4>
                          <p className="text-sm text-[#666] mt-2">{promo.description}</p>
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de que deseas eliminar la promoción "${promo.title}"?`)) {
                                deletePromotionMutation.mutate({ id: promo.id });
                              }
                            }}
                            className="w-full mt-4 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Aprobar Cita */}
        {selectedAppointmentId !== null && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Aprobar Cita</h2>
                <button
                  onClick={() => setSelectedAppointmentId(null)}
                  className="text-2xl text-[#999] hover:text-[#1A1A1A]"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-[#FAF7F2] p-4 rounded-lg">
                  <p className="text-sm text-[#999] mb-2">Hora solicitada por el paciente:</p>
                  <p className="text-2xl font-bold text-[#C5A55A]">{selectedAppointment.appointmentTime}</p>
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-lg">
                  <p className="text-sm text-[#999]">
                    Se enviará un correo de confirmación desde la clínica con el número de WhatsApp/teléfono.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setSelectedAppointmentId(null)}
                  className="flex-1 px-4 py-2 border border-[#C5A55A] text-[#C5A55A] rounded-lg hover:bg-[#FAF7F2] transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmApprove}
                  className="flex-1 px-4 py-2 bg-[#C5A55A] text-white rounded-lg hover:bg-[#B8935A] transition"
                >
                  Aprobar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Comprobante */}
        {selectedProofId !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Comprobante de Pago</h2>
                <button
                  onClick={() => {
                    setSelectedProofId(null);
                    setProofUrl(null);
                  }}
                  className="text-2xl text-[#999] hover:text-[#1A1A1A]"
                >
                  ×
                </button>
              </div>
              <div className="mb-4 bg-[#FAF7F2] p-4 rounded-lg min-h-96 flex items-center justify-center">
                {isLoadingProof ? (
                  <p className="text-[#999]">Cargando comprobante...</p>
                ) : proofUrl ? (
                  <img
                    src={proofUrl}
                    alt="Comprobante de pago"
                    className="w-full max-h-96 object-contain"
                    onError={() => {
                      console.error("Error loading image:", proofUrl);
                      toast.error("Error al cargar la imagen");
                    }}
                  />
                ) : (
                  <p className="text-[#999]">No se pudo cargar el comprobante</p>
                )}
              </div>
              <p className="text-sm text-[#999] mb-4">
                Verifica que el comprobante sea válido antes de activar la membresía.
              </p>
              <button
                onClick={() => {
                  setSelectedProofId(null);
                  setProofUrl(null);
                }}
                className="w-full px-4 py-2 bg-[#C5A55A] text-white rounded-lg hover:bg-[#B8935A] transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
