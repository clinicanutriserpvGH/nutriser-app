import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, Calendar, CheckCircle, Clock, XCircle, ArrowLeft, BookOpen, Upload, Eye } from "lucide-react";
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
  const [promotionExpiresAt, setPromotionExpiresAt] = useState("");
  const [promotionPrice, setPromotionPrice] = useState("");
  const [promotionRegularPrice, setPromotionRegularPrice] = useState("");
  const [promotionImage, setPromotionImage] = useState<File | null>(null);
  const [promotionImagePreview, setPromotionImagePreview] = useState<string | null>(null);
  const [promotionMaxCoupons, setPromotionMaxCoupons] = useState("");
  // Estado para edición de promoción
  const [editingPromoId, setEditingPromoId] = useState<number | null>(null);
  const [editPromoTitle, setEditPromoTitle] = useState("");
  const [editPromoDescription, setEditPromoDescription] = useState("");
  const [editPromoPrice, setEditPromoPrice] = useState("");
  const [editPromoRegularPrice, setEditPromoRegularPrice] = useState("");
  const [editPromoExpiresAt, setEditPromoExpiresAt] = useState("");
  const [editPromoImage, setEditPromoImage] = useState<File | null>(null);
  const [editPromoImagePreview, setEditPromoImagePreview] = useState<string | null>(null);
  const [editPromoMaxCoupons, setEditPromoMaxCoupons] = useState("");

  // Estado para eBook
  const [ebookTitle, setEbookTitle] = useState("");
  const [ebookDescription, setEbookDescription] = useState("");
  const [ebookPrice, setEbookPrice] = useState("");
  const [ebookCoverBase64, setEbookCoverBase64] = useState<string | null>(null);
  const [ebookPdfBase64, setEbookPdfBase64] = useState<string | null>(null);
  const [ebookCoverPreview, setEbookCoverPreview] = useState<string | null>(null);
  const [ebookPdfName, setEbookPdfName] = useState<string | null>(null);
  const [ebookComingSoon, setEbookComingSoon] = useState(false);
  const [ebookPresalePrice, setEbookPresalePrice] = useState("");
  const [isUploadingEbook, setIsUploadingEbook] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

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

  const { data: giftPurchases, refetch: refetchGifts } = trpc.giftPurchases.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: activeEbook, refetch: refetchEbook } = trpc.ebook.getActive.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: ebookPurchases, refetch: refetchEbookPurchases } = trpc.ebook.listPurchases.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const upsertEbookMutation = trpc.ebook.upsert.useMutation({
    onSuccess: () => {
      toast.success('eBook guardado exitosamente');
      refetchEbook();
      setIsUploadingEbook(false);
    },
    onError: (error) => {
      toast.error('Error al guardar eBook: ' + error.message);
      setIsUploadingEbook(false);
    },
  });

  const { data: ebookDiscountCodes, refetch: refetchDiscountCodes } = trpc.ebook.listDiscountCodes.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const toggleDiscountCodeMutation = trpc.ebook.toggleDiscountCode.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? 'Código activado' : 'Código desactivado');
      refetchDiscountCodes();
    },
    onError: (error) => toast.error('Error: ' + error.message),
  });

  const updateEbookPurchaseMutation = trpc.ebook.updatePurchaseStatus.useMutation({
    onSuccess: (_, variables) => {
      if (variables.status === 'approved') {
        toast.success('Compra aprobada. Email enviado al comprador con acceso al eBook.');
      } else {
        toast.success('Compra rechazada.');
      }
      refetchEbookPurchases();
    },
    onError: (error) => toast.error('Error: ' + error.message),
  });

  const approveGiftMutation = trpc.giftPurchases.approve.useMutation({
    onSuccess: (data) => {
      toast.success('Compra autorizada. Email enviado al comprador.');
      refetchGifts();
      // Open WhatsApp automatically if phone is available
      if (data?.whatsappUrl) {
        setTimeout(() => {
          window.open(data.whatsappUrl, '_blank');
        }, 800);
      }
    },
    onError: () => toast.error('Error al autorizar'),
  });

  const rejectGiftMutation = trpc.giftPurchases.reject.useMutation({
    onSuccess: () => {
      toast.success('Compra rechazada');
      refetchGifts();
    },
    onError: () => toast.error('Error al rechazar'),
  });

  const markUsedGiftMutation = trpc.giftPurchases.markUsed.useMutation({
    onSuccess: () => {
      toast.success('Cupón marcado como usado');
      refetchGifts();
    },
    onError: () => toast.error('Error al marcar como usado'),
  });

  const deleteGiftMutation = trpc.giftPurchases.delete.useMutation({
    onSuccess: () => {
      toast.success('Registro eliminado');
      refetchGifts();
    },
    onError: (error) => toast.error('Error: ' + error.message),
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
      setPromotionExpiresAt("");
      setPromotionPrice("");
      setPromotionRegularPrice("");
      setPromotionImage(null);
      setPromotionImagePreview(null);
      setPromotionMaxCoupons("");
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

  const updatePromotionMutation = trpc.promotions.update.useMutation({
    onSuccess: () => {
      toast.success("Promoción actualizada exitosamente");
      setEditingPromoId(null);
      utils.promotions.listForAdmin.invalidate();
      utils.promotions.list.invalidate();
    },
    onError: (error) => {
      toast.error("Error al actualizar promoción: " + error.message);
    },
  });

  // Funciones para eBook
  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await handleFileToBase64(file);
    setEbookCoverBase64(base64);
    setEbookCoverPreview(base64);
  };

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('El PDF no puede superar los 50MB');
      return;
    }
    const base64 = await handleFileToBase64(file);
    setEbookPdfBase64(base64);
    setEbookPdfName(file.name);
  };

  const handleSaveEbook = () => {
    if (!ebookTitle.trim()) {
      toast.error('Ingresa un título para el eBook');
      return;
    }
    if (!ebookPrice || isNaN(Number(ebookPrice)) || Number(ebookPrice) <= 0) {
      toast.error('Ingresa un precio válido');
      return;
    }
    setIsUploadingEbook(true);
    upsertEbookMutation.mutate({
      id: activeEbook?.id,
      title: ebookTitle,
      description: ebookDescription,
      price: ebookPrice,
      presalePrice: ebookPresalePrice.trim() || null,
      coverBase64: ebookCoverBase64 ?? undefined,
      pdfBase64: ebookPdfBase64 ?? undefined,
      comingSoon: ebookComingSoon,
    });
  };

  // Cargar datos del ebook activo al formulario
  useEffect(() => {
    if (activeEbook) {
      setEbookTitle(activeEbook.title || '');
      setEbookDescription(activeEbook.description || '');
      setEbookPrice(activeEbook.price?.toString() || '');
      setEbookPresalePrice((activeEbook as any).presalePrice?.toString() || '');
      if (activeEbook.coverUrl) setEbookCoverPreview(activeEbook.coverUrl);
      setEbookComingSoon(activeEbook.comingSoon ?? false);
    }
  }, [activeEbook]);

  const handlePublishPromotion = async () => {
    if (!promotionTitle.trim()) {
      toast.error("Ingresa un título para la promoción");
      return;
    }
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;
    if (promotionImage) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
        reader.readAsDataURL(promotionImage);
      });
      imageBase64 = base64;
      imageMimeType = promotionImage.type;
    }
    createPromotionMutation.mutate({
      title: promotionTitle,
      description: promotionDescription,
      price: promotionPrice.trim() || undefined,
      regularPrice: promotionRegularPrice.trim() || undefined,
      imageBase64,
      imageMimeType,
      maxCoupons: promotionMaxCoupons.trim() ? parseInt(promotionMaxCoupons) : undefined,
      expiresAt: promotionExpiresAt ? new Date(promotionExpiresAt).toISOString() : undefined,
    });
  };

  const handleSaveEditPromotion = async () => {
    if (!editingPromoId || !editPromoTitle.trim()) {
      toast.error("El título es requerido");
      return;
    }
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;
    if (editPromoImage) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
        reader.readAsDataURL(editPromoImage);
      });
      imageBase64 = base64;
      imageMimeType = editPromoImage.type;
    }
    updatePromotionMutation.mutate({
      id: editingPromoId,
      title: editPromoTitle,
      description: editPromoDescription,
      price: editPromoPrice.trim() || null,
      regularPrice: editPromoRegularPrice.trim() || null,
      imageBase64,
      imageMimeType,
      maxCoupons: editPromoMaxCoupons.trim() ? parseInt(editPromoMaxCoupons) : null,
      expiresAt: editPromoExpiresAt ? new Date(editPromoExpiresAt).toISOString() : null,
    });
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
          <TabsList className="bg-[#C5A55A]/10 flex-wrap h-auto gap-1">
            <TabsTrigger value="memberships">Membresías</TabsTrigger>
            <TabsTrigger value="appointments">Citas</TabsTrigger>
            <TabsTrigger value="giftPurchases">Regalos Pagados</TabsTrigger>
            <TabsTrigger value="promotions">Promociones</TabsTrigger>
            <TabsTrigger value="ebook" className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              eBook
            </TabsTrigger>
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

          {/* Gift Purchases Tab */}
          <TabsContent value="giftPurchases" className="space-y-4">
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#C5A55A]">Compras de Cupones de Regalo</CardTitle>
                <CardDescription>Autoriza o rechaza las compras de cupones de regalo</CardDescription>
              </CardHeader>
              <CardContent>
                {!giftPurchases || giftPurchases.length === 0 ? (
                  <p className="text-[#999] text-center py-8">No hay compras de regalos pendientes</p>
                ) : (
                  <div className="space-y-4">
                    {giftPurchases.map((purchase: any) => (
                      <div key={purchase.id} className="border border-[#C5A55A]/20 rounded-xl p-5 bg-[#FAF7F2]">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Comprobante */}
                          <div className="flex-shrink-0">
                            <p className="text-xs font-semibold text-[#666] mb-2 uppercase">Comprobante</p>
                            {purchase.proofUrl ? (
                              <a href={purchase.proofUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={purchase.proofUrl}
                                  alt="Comprobante"
                                  className="w-24 h-24 object-cover rounded-lg border border-[#C5A55A]/30 hover:opacity-80 transition"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <p className="text-xs text-blue-600 mt-1 hover:underline">Ver completo</p>
                              </a>
                            ) : (
                              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-xs text-gray-500">Sin imagen</span>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 space-y-1">
                            {/* Código único del cupón */}
                            {purchase.couponCode && (
                              <div className="bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-lg px-3 py-2 mb-2">
                                <p className="text-xs text-[#666] font-semibold uppercase tracking-wide">Código de Cupón</p>
                                <p className="text-lg font-mono font-bold text-[#C5A55A] tracking-widest">{purchase.couponCode}</p>
                              </div>
                            )}
                            <p className="font-bold text-[#1A1A1A]">{purchase.buyerName}</p>
                            <p className="text-sm text-[#666]">{purchase.buyerEmail}</p>
                            {purchase.buyerPhone && <p className="text-sm text-[#666]">{purchase.buyerPhone}</p>}
                            {/* Tipo: personal o regalo */}
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                purchase.isGift ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {purchase.isGift ? '🎁 Para regalar' : '👤 Uso personal'}
                              </span>
                            </div>
                            {/* Destinatario si es regalo */}
                            {purchase.isGift && purchase.recipientName && (
                              <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 mt-2">
                                <p className="text-xs text-purple-700 font-semibold">Destinatario del regalo:</p>
                                <p className="text-sm font-bold text-purple-900">{purchase.recipientName}</p>
                                {purchase.recipientContact && <p className="text-xs text-purple-700">{purchase.recipientContact}</p>}
                              </div>
                            )}
                            <p className="text-xs text-[#999] mt-1">
                              {purchase.createdAt ? new Date(purchase.createdAt).toLocaleString('es-MX') : ''}
                            </p>
                            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-2 ${
                              purchase.status === 'approved' ? 'bg-green-100 text-green-700' :
                              purchase.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              purchase.status === 'used' ? 'bg-gray-100 text-gray-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {purchase.status === 'approved' ? '✓ Autorizado' :
                               purchase.status === 'rejected' ? '✗ Rechazado' :
                               purchase.status === 'used' ? '✅ Usado' : '⏳ Pendiente'}
                            </span>
                          </div>

                          {/* Acciones */}
                          <div className="flex flex-col gap-2 justify-center">
                            {purchase.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => approveGiftMutation.mutate({ id: purchase.id })}
                                  disabled={approveGiftMutation.isPending}
                                >
                                  Autorizar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-400 text-red-600 hover:bg-red-50"
                                  onClick={() => rejectGiftMutation.mutate({ id: purchase.id })}
                                  disabled={rejectGiftMutation.isPending}
                                >
                                  Rechazar
                                </Button>
                              </>
                            )}
                            {purchase.status === 'approved' && (
                              <Button
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600 text-white"
                                onClick={() => {
                                  if (confirm('\u00bfMarcar este cup\u00f3n como usado? Ya no podr\u00e1 ser canjeado nuevamente.')) {
                                    markUsedGiftMutation.mutate({ id: purchase.id });
                                  }
                                }}
                                disabled={markUsedGiftMutation.isPending}
                              >
                                ✓ Marcar como Usado
                              </Button>
                            )}
                            {(purchase.status === 'used' || purchase.status === 'rejected') && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-400 text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  if (confirm('\u00bfEliminar este registro? Esta acci\u00f3n no se puede deshacer.')) {
                                    deleteGiftMutation.mutate({ id: purchase.id });
                                  }
                                }}
                                disabled={deleteGiftMutation.isPending}
                              >
                                🗑 Eliminar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                        Precio regular
                        <span className="text-[#999] font-normal ml-1">(se tacha)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: $3,500 MXN"
                        value={promotionRegularPrice}
                        onChange={(e) => setPromotionRegularPrice(e.target.value)}
                        className="w-full px-4 py-2 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                        Precio promocional
                        <span className="text-[#999] font-normal ml-1">(destacado)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: $2,499 MXN"
                        value={promotionPrice}
                        onChange={(e) => setPromotionPrice(e.target.value)}
                        className="w-full px-4 py-2 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                      Imagen del cupón
                      <span className="text-[#999] font-normal ml-2">(opcional, para que llame la atención)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) { toast.error('La imagen no debe superar 5MB'); return; }
                          setPromotionImage(file);
                          const reader = new FileReader();
                          reader.onload = (ev) => setPromotionImagePreview(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-4 py-2 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A] text-sm"
                    />
                    {promotionImagePreview && (
                      <div className="mt-2 relative inline-block">
                        <img src={promotionImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-[#C5A55A]/30" />
                        <button
                          type="button"
                          onClick={() => { setPromotionImage(null); setPromotionImagePreview(null); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                      Cupones disponibles
                      <span className="text-[#999] font-normal ml-2">(opcional, deja vacío para ilimitados)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ej: 20 (se muestra contador de urgencia)"
                      value={promotionMaxCoupons}
                      onChange={(e) => setPromotionMaxCoupons(e.target.value)}
                      className="w-full px-4 py-2 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A]"
                    />
                    {promotionMaxCoupons && parseInt(promotionMaxCoupons) > 0 && (
                      <p className="text-xs text-[#C5A55A] mt-1">
                        Se mostrará "Quedan {promotionMaxCoupons} cupones" en la cuponera pública
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                      Fecha límite para canjear
                      <span className="text-[#999] font-normal ml-2">(opcional)</span>
                    </label>
                    <input
                      type="date"
                      value={promotionExpiresAt}
                      onChange={(e) => setPromotionExpiresAt(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A]"
                    />
                    {promotionExpiresAt && (
                      <p className="text-xs text-[#C5A55A] mt-1">
                        El cupón vencerá el {new Date(promotionExpiresAt + 'T23:59:59').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
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
                      {promotions.map((promo: any) => (
                        <div key={promo.id} className="bg-[#FAF7F2] p-4 rounded-lg border border-[#C5A55A]/20">
                          {editingPromoId === promo.id ? (
                            /* Formulario de edición */
                            <div className="space-y-3">
                              <h4 className="font-bold text-[#1A1A1A] mb-2">Editar Promoción</h4>
                              <input
                                type="text"
                                value={editPromoTitle}
                                onChange={(e) => setEditPromoTitle(e.target.value)}
                                placeholder="Título"
                                className="w-full px-3 py-2 border border-[#C5A55A]/30 rounded-lg text-sm focus:outline-none focus:border-[#C5A55A]"
                              />
                              <textarea
                                value={editPromoDescription}
                                onChange={(e) => setEditPromoDescription(e.target.value)}
                                placeholder="Descripción"
                                rows={2}
                                className="w-full px-3 py-2 border border-[#C5A55A]/30 rounded-lg text-sm focus:outline-none focus:border-[#C5A55A]"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={editPromoRegularPrice}
                                  onChange={(e) => setEditPromoRegularPrice(e.target.value)}
                                  placeholder="Precio regular (se tacha)"
                                  className="w-full px-3 py-2 border border-[#C5A55A]/30 rounded-lg text-sm focus:outline-none focus:border-[#C5A55A]"
                                />
                                <input
                                  type="text"
                                  value={editPromoPrice}
                                  onChange={(e) => setEditPromoPrice(e.target.value)}
                                  placeholder="Precio promocional"
                                  className="w-full px-3 py-2 border border-[#C5A55A]/30 rounded-lg text-sm focus:outline-none focus:border-[#C5A55A]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-[#666] mb-1">Imagen del cupón</label>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
                                      setEditPromoImage(file);
                                      const reader = new FileReader();
                                      reader.onload = (ev) => setEditPromoImagePreview(ev.target?.result as string);
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="w-full px-3 py-1 border border-[#C5A55A]/30 rounded-lg text-xs"
                                />
                                {(editPromoImagePreview || promo.imageUrl) && (
                                  <img src={editPromoImagePreview || promo.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded mt-1 border" />
                                )}
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Cupones disponibles</label>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Vacío = ilimitados"
                                  value={editPromoMaxCoupons}
                                  onChange={(e) => setEditPromoMaxCoupons(e.target.value)}
                                  className="w-full px-3 py-2 border border-[#C5A55A]/30 rounded-lg text-sm focus:outline-none focus:border-[#C5A55A]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Fecha límite</label>
                                <input
                                  type="date"
                                  value={editPromoExpiresAt}
                                  onChange={(e) => setEditPromoExpiresAt(e.target.value)}
                                  className="w-full px-3 py-2 border border-[#C5A55A]/30 rounded-lg text-sm focus:outline-none focus:border-[#C5A55A]"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleSaveEditPromotion}
                                  disabled={updatePromotionMutation.isPending}
                                  className="flex-1 px-3 py-2 bg-[#C5A55A] text-white rounded hover:bg-[#B39548] transition text-sm font-medium disabled:opacity-50"
                                >
                                  {updatePromotionMutation.isPending ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button
                                  onClick={() => setEditingPromoId(null)}
                                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm font-medium"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Vista normal */
                            <>
                              {promo.imageUrl && (
                                <img src={promo.imageUrl} alt={promo.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                              )}
                              <div className="bg-gradient-to-br from-[#C5A55A] to-[#B8963E] rounded-lg p-4 mb-3 text-white">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-sm font-bold">CUPÓN</span>
                                  <span className="text-lg">🎁</span>
                                </div>
                                <p className="text-xs font-light line-clamp-2">{promo.title}</p>
                                {(promo.regularPrice || promo.price) && (
                                  <div className="flex items-center gap-2 mt-2">
                                    {promo.regularPrice && <span className="text-xs line-through opacity-70">{promo.regularPrice}</span>}
                                    {promo.price && <span className="text-sm font-bold">{promo.price}</span>}
                                  </div>
                                )}
                              </div>
                              <h4 className="font-bold text-[#1A1A1A]">{promo.title}</h4>
                              {(promo.regularPrice || promo.price) && (
                                <div className="flex items-center gap-2 mt-1">
                                  {promo.regularPrice && <span className="text-sm text-[#999] line-through">{promo.regularPrice}</span>}
                                  {promo.price && <span className="text-sm font-semibold text-[#C5A55A]">💰 {promo.price}</span>}
                                </div>
                              )}
                              <p className="text-sm text-[#666] mt-1">{promo.description}</p>
                              {promo.expiresAt ? (
                                <div className="mt-2 flex items-center gap-1">
                                  {new Date(promo.expiresAt) < new Date() ? (
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                                      ❌ Vencido el {new Date(promo.expiresAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  ) : (
                                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-semibold">
                                      📅 Válido hasta {new Date(promo.expiresAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-[#999] mt-2">Sin fecha límite</p>
                              )}
                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={() => {
                                    setEditingPromoId(promo.id);
                                    setEditPromoTitle(promo.title || '');
                                    setEditPromoDescription(promo.description || '');
                                    setEditPromoPrice(promo.price || '');
                                    setEditPromoRegularPrice(promo.regularPrice || '');
                                    setEditPromoExpiresAt(promo.expiresAt ? new Date(promo.expiresAt).toISOString().split('T')[0] : '');
                                    setEditPromoImage(null);
                                    setEditPromoImagePreview(null);
                                    setEditPromoMaxCoupons(promo.maxCoupons ? String(promo.maxCoupons) : '');
                                  }}
                                  className="flex-1 px-3 py-2 bg-[#C5A55A]/20 text-[#C5A55A] border border-[#C5A55A]/40 rounded hover:bg-[#C5A55A]/30 transition text-sm font-medium"
                                >
                                  ✏️ Editar
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`¿Estás seguro de que deseas eliminar la promoción "${promo.title}"?`)) {
                                      deletePromotionMutation.mutate({ id: promo.id });
                                    }
                                  }}
                                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-medium"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* eBook Tab */}
          <TabsContent value="ebook" className="space-y-6">
            {/* Formulario de eBook - Sección 1: Información de texto */}
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#C5A55A] flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {activeEbook ? 'Editar información del eBook' : 'Publicar eBook'}
                </CardTitle>
                <CardDescription>
                  {activeEbook
                    ? `Edita el título, descripción o precio. Los cambios se guardan de inmediato.`
                    : 'Completa la información para publicar tu eBook.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Título del eBook *</label>
                      <input
                        type="text"
                        placeholder="Ej: Guía Nutricional Nutriser"
                        value={ebookTitle}
                        onChange={(e) => setEbookTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Precio (MXN) *</label>
                      <input
                        type="number"
                        placeholder="Ej: 499"
                        value={ebookPrice}
                        onChange={(e) => setEbookPrice(e.target.value)}
                        min="1"
                        className="w-full px-4 py-2 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                        Precio de Pre-venta (MXN)
                        <span className="text-[#999] font-normal ml-2">(opcional, para pre-venta)</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Ej: 349"
                        value={ebookPresalePrice}
                        onChange={(e) => setEbookPresalePrice(e.target.value)}
                        min="1"
                        className="w-full px-4 py-2 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A]"
                      />
                      <p className="text-xs text-[#999] mt-1">Si se activa "Próxima publicación", se mostrará la comparativa de precios</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Descripción</label>
                    <textarea
                      placeholder="Describe el contenido del eBook..."
                      rows={5}
                      value={ebookDescription}
                      onChange={(e) => setEbookDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A] resize-none"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (!ebookTitle.trim()) { toast.error('Ingresa un título'); return; }
                      if (!ebookPrice || isNaN(Number(ebookPrice)) || Number(ebookPrice) <= 0) { toast.error('Ingresa un precio válido'); return; }
                      upsertEbookMutation.mutate({
                        id: activeEbook?.id,
                        title: ebookTitle,
                        description: ebookDescription,
                        price: ebookPrice,
                        presalePrice: ebookPresalePrice.trim() || null,
                        comingSoon: ebookComingSoon,
                      });
                    }}
                    disabled={upsertEbookMutation.isPending}
                    className="bg-[#C5A55A] hover:bg-[#B39548] text-white font-bold disabled:opacity-50"
                  >
                    {upsertEbookMutation.isPending
                      ? 'Guardando...'
                      : activeEbook ? '💾 Guardar cambios de texto' : '📖 Publicar eBook'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Formulario de eBook - Sección 2: Archivos (portada, contraportada, PDF) */}
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#C5A55A] flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Archivos del eBook
                </CardTitle>
                <CardDescription>
                  Sube o actualiza la portada, contraportada y el PDF del libro. Cada archivo se guarda de forma independiente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Portada */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-[#1A1A1A]">Portada</label>
                    <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      className="cursor-pointer border-2 border-dashed border-[#C5A55A]/40 rounded-lg overflow-hidden hover:border-[#C5A55A] transition"
                    >
                      {ebookCoverPreview ? (
                        <img src={ebookCoverPreview} alt="Portada" className="w-full h-40 object-cover" />
                      ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-[#999]">
                          <Upload className="w-6 h-6 mb-2" />
                          <p className="text-xs text-center px-2">{activeEbook?.coverUrl ? 'Cambiar portada' : 'Subir portada'}</p>
                        </div>
                      )}
                    </div>
                    {ebookCoverBase64 && (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!activeEbook?.id) { toast.error('Primero guarda el eBook'); return; }
                          setIsUploadingEbook(true);
                          upsertEbookMutation.mutate({
                            id: activeEbook.id,
                            title: ebookTitle || activeEbook.title,
                            price: ebookPrice || activeEbook.price?.toString(),
                            coverBase64: ebookCoverBase64,
                          }, { onSettled: () => { setIsUploadingEbook(false); setEbookCoverBase64(null); } });
                        }}
                        disabled={isUploadingEbook}
                        className="w-full bg-[#C5A55A] hover:bg-[#B39548] text-white text-xs"
                      >
                        {isUploadingEbook ? 'Subiendo...' : '📤 Subir portada'}
                      </Button>
                    )}
                  </div>

                  {/* Toggle Próxima Publicación */}
                  <div className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-lg border border-[#C5A55A]/20">
                    <div>
                      <p className="font-semibold text-[#1A1A1A] text-sm">⏳ Próxima publicación</p>
                      <p className="text-xs text-[#999] mt-0.5">Muestra el eBook como adelanto sin opción de compra</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newVal = !ebookComingSoon;
                        setEbookComingSoon(newVal);
                        if (activeEbook?.id) {
                          upsertEbookMutation.mutate({
                            id: activeEbook.id,
                            title: ebookTitle || activeEbook.title,
                            price: ebookPrice || activeEbook.price?.toString(),
                            comingSoon: newVal,
                          });
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        ebookComingSoon ? 'bg-[#C5A55A]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        ebookComingSoon ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* PDF */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-[#1A1A1A]">
                      PDF del libro
                      {activeEbook?.pdfUrl && (
                        <span className="text-green-600 font-normal ml-2 text-xs">(✓ Cargado)</span>
                      )}
                    </label>
                    <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handlePdfChange} className="hidden" />
                    <div
                      onClick={() => pdfInputRef.current?.click()}
                      className="cursor-pointer border-2 border-dashed border-[#C5A55A]/40 rounded-lg hover:border-[#C5A55A] transition h-40 flex flex-col items-center justify-center"
                    >
                      {ebookPdfName ? (
                        <div className="text-center px-2">
                          <p className="text-2xl mb-1">📄</p>
                          <p className="text-xs text-green-600 font-medium break-all">{ebookPdfName}</p>
                          <p className="text-xs text-[#999] mt-1">Clic para cambiar</p>
                        </div>
                      ) : (
                        <div className="text-center px-2">
                          <Upload className="w-6 h-6 mb-2 mx-auto text-[#999]" />
                          <p className="text-xs text-[#999]">{activeEbook?.pdfUrl ? 'Cambiar PDF' : 'Seleccionar PDF'}</p>
                          <p className="text-xs text-[#999]">(máx 50MB)</p>
                        </div>
                      )}
                    </div>
                    {ebookPdfBase64 && (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!activeEbook?.id) { toast.error('Primero guarda el eBook con título y precio'); return; }
                          setIsUploadingEbook(true);
                          upsertEbookMutation.mutate({
                            id: activeEbook.id,
                            title: ebookTitle || activeEbook.title,
                            price: ebookPrice || activeEbook.price?.toString(),
                            pdfBase64: ebookPdfBase64,
                          }, { onSettled: () => { setIsUploadingEbook(false); setEbookPdfBase64(null); setEbookPdfName(null); } });
                        }}
                        disabled={isUploadingEbook}
                        className="w-full bg-[#C5A55A] hover:bg-[#B39548] text-white text-xs"
                      >
                        {isUploadingEbook ? 'Subiendo PDF... (puede tardar)' : '📤 Subir PDF al servidor'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compras de eBook */}
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#C5A55A]">Compras de eBook</CardTitle>
                <CardDescription>Gestiona las compras y autoriza el acceso al eBook</CardDescription>
              </CardHeader>
              <CardContent>
                {!ebookPurchases || ebookPurchases.length === 0 ? (
                  <div className="bg-[#FAF7F2] p-6 rounded-lg text-center text-[#999]">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No hay compras de eBook registradas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ebookPurchases.map((purchase) => (
                      <div key={purchase.id} className="bg-[#FAF7F2] p-4 rounded-lg border border-[#C5A55A]/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                purchase.status === 'approved' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-600'
                              }`}>
                                {purchase.status === 'pending' ? '⏳ Pendiente' :
                                 purchase.status === 'approved' ? '✅ Aprobado' : '❌ Rechazado'}
                              </span>
                            </div>
                            <p className="font-bold text-[#1A1A1A]">{purchase.buyerName}</p>
                            <p className="text-sm text-[#666]">{purchase.buyerEmail}</p>
                            {purchase.referredBy && (
                              <p className="text-xs text-[#C5A55A] mt-1 font-medium">
                                📣 Recomendado por: <span className="font-bold">{purchase.referredBy}</span>
                              </p>
                            )}
                            <p className="text-xs text-[#999] mt-1">
                              {new Date(purchase.createdAt).toLocaleDateString('es-MX', {
                                year: 'numeric', month: 'long', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <a
                              href={purchase.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-2 border border-[#C5A55A] text-[#C5A55A] rounded-lg hover:bg-[#C5A55A]/10 transition text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              Ver comprobante
                            </a>
                            {purchase.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    if (confirm(`¿Aprobar la compra de ${purchase.buyerName}?\n\nSe generará una contraseña automática y se enviará por correo a ${purchase.buyerEmail}.`))
                                      updateEbookPurchaseMutation.mutate({ id: purchase.id, status: 'approved' });
                                  }}
                                  disabled={updateEbookPurchaseMutation.isPending}
                                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
                                >
                                  ✅ Aprobar y enviar acceso
                                </button>
                                <button
                                  onClick={() => updateEbookPurchaseMutation.mutate({ id: purchase.id, status: 'rejected' })}
                                  disabled={updateEbookPurchaseMutation.isPending}
                                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium disabled:opacity-50"
                                >
                                  Rechazar
                                </button>
                              </>
                            )}
                            {purchase.status === 'approved' && (
                              <div className="flex items-center gap-1 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                                <span>🔑</span>
                                Credenciales enviadas por correo
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          {/* Sección de Códigos de Descuento */}
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#C5A55A] flex items-center gap-2">
                  <span className="text-lg">🏷️</span>
                  Códigos de Descuento
                </CardTitle>
                <CardDescription>
                  Activa o desactiva los códigos de descuento para el eBook. Solo los códigos activos pueden ser usados por los compradores.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ebookDiscountCodes && ebookDiscountCodes.length > 0 ? ebookDiscountCodes.map((code) => (
                    <div key={code.id} className={`p-4 rounded-xl border-2 transition-all ${
                      code.isActive
                        ? 'border-green-400 bg-green-50'
                        : 'border-[#C5A55A]/20 bg-[#FAF7F2]'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-mono font-bold text-lg uppercase ${
                          code.isActive ? 'text-green-700' : 'text-[#999]'
                        }`}>{code.code}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          code.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {code.isActive ? '✅ Activo' : '⏸️ Inactivo'}
                        </span>
                      </div>
                      <p className="text-sm text-[#666] mb-3">{code.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${
                          code.discountPercent === 100 ? 'text-purple-600' : 'text-[#C5A55A]'
                        }`}>
                          {code.discountPercent === 100 ? '🎉 GRATIS' : `${code.discountPercent}% OFF`}
                        </span>
                        <button
                          onClick={() => toggleDiscountCodeMutation.mutate({ id: code.id, isActive: !code.isActive })}
                          disabled={toggleDiscountCodeMutation.isPending}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 ${
                            code.isActive
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {code.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-2 text-center py-8 text-[#999]">
                      <p>Cargando códigos de descuento...</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-700">
                    <strong>⚠️ Importante:</strong> Solo activa un código a la vez si quieres controlar qué descuento está disponible. Puedes tener varios activos simultáneamente si lo deseas.
                  </p>
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
