import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, Calendar, CheckCircle, Clock, XCircle, ArrowLeft, BookOpen, Upload, Eye, Bell, BellRing, ShoppingBag, Trash2, Settings, Plus, Pencil } from "lucide-react";
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

  // Estado para servicios
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: 'general',
    price: '',
    imageUrl: '',
    isActive: true,
    sortOrder: 0,
  });
  const [serviceImage, setServiceImage] = useState<File | null>(null);
  const [serviceImagePreview, setServiceImagePreview] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [isUploadingServiceImage, setIsUploadingServiceImage] = useState(false);

  // Estado para productos
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'general',
    price: '',
    imageUrl: '',
    stock: 0,
    isActive: true,
    sortOrder: 0,
  });
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);

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

  // Suscriptores de cupones
  const { data: couponSubscribers, refetch: refetchSubscribers } = trpc.couponSubscribers.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteSubscriberMutation = trpc.couponSubscribers.delete.useMutation({
    onSuccess: () => {
      toast.success('Suscriptor eliminado');
      refetchSubscribers();
    },
    onError: (error) => toast.error('Error: ' + error.message),
  });

  // Catálogo de servicios
  const { data: servicesCatalog, refetch: refetchServices } = trpc.services.listAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createServiceMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success('Servicio creado exitosamente');
      refetchServices();
      setServiceForm({ name: '', description: '', category: 'general', price: '', imageUrl: '', isActive: true, sortOrder: 0 });
      setServiceImage(null);
      setServiceImagePreview(null);
      setEditingServiceId(null);
    },
    onError: (error) => toast.error('Error al crear servicio: ' + error.message),
  });

  const updateServiceMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      toast.success('Servicio actualizado exitosamente');
      refetchServices();
      setServiceForm({ name: '', description: '', category: 'general', price: '', imageUrl: '', isActive: true, sortOrder: 0 });
      setServiceImage(null);
      setServiceImagePreview(null);
      setEditingServiceId(null);
    },
    onError: (error) => toast.error('Error al actualizar servicio: ' + error.message),
  });

  const deleteServiceCatalogMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      toast.success('Servicio eliminado');
      refetchServices();
    },
    onError: (error) => toast.error('Error al eliminar servicio: ' + error.message),
  });

  // Catálogo de productos
  const { data: productsCatalog, refetch: refetchProducts } = trpc.products.listAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success('Producto creado exitosamente');
      refetchProducts();
      setProductForm({ name: '', description: '', category: 'general', price: '', imageUrl: '', stock: 0, isActive: true, sortOrder: 0 });
      setProductImage(null);
      setProductImagePreview(null);
      setEditingProductId(null);
    },
    onError: (error) => toast.error('Error al crear producto: ' + error.message),
  });

  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success('Producto actualizado exitosamente');
      refetchProducts();
      setProductForm({ name: '', description: '', category: 'general', price: '', imageUrl: '', stock: 0, isActive: true, sortOrder: 0 });
      setProductImage(null);
      setProductImagePreview(null);
      setEditingProductId(null);
    },
    onError: (error) => toast.error('Error al actualizar producto: ' + error.message),
  });

  const deleteProductCatalogMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success('Producto eliminado');
      refetchProducts();
    },
    onError: (error) => toast.error('Error al eliminar producto: ' + error.message),
  });

  // Compras de productos
  const { data: productPurchases, refetch: refetchProductPurchases } = trpc.productPurchases.listAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const verifyProductMutation = trpc.productPurchases.verify.useMutation({
    onSuccess: () => { toast.success('Compra verificada.'); refetchProductPurchases(); },
    onError: (error) => toast.error('Error: ' + error.message),
  });

  const rejectProductMutation = trpc.productPurchases.reject.useMutation({
    onSuccess: () => { toast.success('Compra rechazada.'); refetchProductPurchases(); },
    onError: (error) => toast.error('Error: ' + error.message),
  });

  const deleteProductPurchaseMutation = trpc.productPurchases.delete.useMutation({
    onSuccess: () => { toast.success('Registro eliminado.'); refetchProductPurchases(); },
    onError: (error) => toast.error('Error: ' + error.message),
  });

  // Compras de servicios
  const { data: servicePurchases, refetch: refetchServicePurchases } = trpc.servicePurchases.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const approveServiceMutation = trpc.servicePurchases.approve.useMutation({
    onSuccess: () => {
      toast.success('Compra aprobada. Email enviado al comprador con su código de servicio.');
      refetchServicePurchases();
    },
    onError: (error) => toast.error('Error: ' + error.message),
  });

  const rejectServiceMutation = trpc.servicePurchases.reject.useMutation({
    onSuccess: () => {
      toast.success('Compra rechazada.');
      refetchServicePurchases();
    },
    onError: (error) => toast.error('Error: ' + error.message),
  });

  const deleteServiceMutation = trpc.servicePurchases.delete.useMutation({
    onSuccess: () => {
      toast.success('Registro eliminado.');
      refetchServicePurchases();
    },
    onError: (error) => toast.error('Error: ' + error.message),
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

  const revokeEbookAccessMutation = trpc.ebook.revokeAccess.useMutation({
    onSuccess: () => {
      toast.success('Acceso revocado. El usuario ya no puede acceder al eBook.');
      refetchEbookPurchases();
    },
    onError: (error) => toast.error('Error al revocar acceso: ' + error.message),
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

  // ─── Códigos de Descuento Generales ────────────────────────────────────────
  const { data: generalDiscountCodes, refetch: refetchGeneralCodes } = trpc.discountCodes.listAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const toggleGeneralCodeMutation = trpc.discountCodes.toggle.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? 'Código activado' : 'Código desactivado');
      refetchGeneralCodes();
    },
    onError: () => toast.error('Error al actualizar código'),
  });

  // Hooks de Cursos
  const { data: coursesData, refetch: refetchCourses } = trpc.courses.listAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: pendingCommentsData, refetch: refetchPendingComments } = trpc.courses.getPendingComments.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const [courseForm, setCourseForm] = useState({ title: '', description: '', category: '' });
  const [videoForm, setVideoForm] = useState({ title: '', description: '', videoUrl: '', duration: '', courseId: 0 });
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [selectedCourseForVideos, setSelectedCourseForVideos] = useState<number | null>(null);
  const [courseVideoFile, setCourseVideoFile] = useState<File | null>(null);
  const [courseDocFile, setCourseDocFile] = useState<File | null>(null);
  const [uploadingCourseVideo, setUploadingCourseVideo] = useState(false);
  const [selectedVideoForDoc, setSelectedVideoForDoc] = useState<number | null>(null);

  const createCourseMutation = trpc.courses.create.useMutation({
    onSuccess: () => { toast.success('Curso creado'); refetchCourses(); setCourseForm({ title: '', description: '', category: '' }); },
    onError: () => toast.error('Error al crear curso'),
  });
  const updateCourseMutation = trpc.courses.update.useMutation({
    onSuccess: () => { toast.success('Curso actualizado'); refetchCourses(); setEditingCourseId(null); },
    onError: () => toast.error('Error al actualizar curso'),
  });
  const deleteCourseMutation = trpc.courses.delete.useMutation({
    onSuccess: () => { toast.success('Curso eliminado'); refetchCourses(); },
    onError: () => toast.error('Error al eliminar curso'),
  });
  const createVideoMutation = trpc.courses.createVideo.useMutation({
    onSuccess: () => { toast.success('Video agregado'); refetchCourses(); setVideoForm({ title: '', description: '', videoUrl: '', duration: '', courseId: 0 }); setUploadingCourseVideo(false); },
    onError: () => { toast.error('Error al agregar video'); setUploadingCourseVideo(false); },
  });
  const deleteVideoMutation = trpc.courses.deleteVideo.useMutation({
    onSuccess: () => { toast.success('Video eliminado'); refetchCourses(); },
    onError: () => toast.error('Error al eliminar video'),
  });
  const approveCommentMutation = trpc.courses.approveComment.useMutation({
    onSuccess: () => { toast.success('Comentario aprobado'); refetchPendingComments(); },
    onError: () => toast.error('Error al aprobar comentario'),
  });
  const rejectCommentMutation = trpc.courses.rejectComment.useMutation({
    onSuccess: () => { toast.success('Comentario rechazado'); refetchPendingComments(); },
    onError: () => toast.error('Error al rechazar comentario'),
  });
  const addDocumentMutation = trpc.courses.createDocument.useMutation({
    onSuccess: () => { toast.success('Documento agregado'); refetchCourses(); setSelectedVideoForDoc(null); setCourseDocFile(null); },
    onError: () => toast.error('Error al agregar documento'),
  });
  const deleteDocumentMutation = trpc.courses.deleteDocument.useMutation({
    onSuccess: () => { toast.success('Documento eliminado'); refetchCourses(); },
    onError: () => toast.error('Error al eliminar documento'),
  });

  const handleUploadCourseVideo = async () => {
    if (!courseVideoFile || !videoForm.title || !videoForm.courseId) {
      toast.error('Completa el título, selecciona el curso y el archivo de video');
      return;
    }
    setUploadingCourseVideo(true);
    const formData = new FormData();
    formData.append('file', courseVideoFile);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.url) throw new Error('No URL');
      createVideoMutation.mutate({ ...videoForm, videoUrl: data.url });
    } catch {
      toast.error('Error al subir el video');
      setUploadingCourseVideo(false);
    }
  };

  const handleUploadCourseDoc = async (videoId: number) => {
    if (!courseDocFile) { toast.error('Selecciona un documento'); return; }
    const formData = new FormData();
    formData.append('file', courseDocFile);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.url) throw new Error('No URL');
      addDocumentMutation.mutate({ videoId, title: courseDocFile.name, fileUrl: data.url, fileType: courseDocFile.type });
    } catch {
      toast.error('Error al subir el documento');
    }
  };

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

  // Manejar imagen de servicio
  const handleServiceImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('La imagen no debe superar 5MB'); return; }
    setServiceImage(file);
    const preview = URL.createObjectURL(file);
    setServiceImagePreview(preview);
  };

  const handleSaveService = async () => {
    if (!serviceForm.name.trim()) {
      toast.error('El nombre del servicio es requerido');
      return;
    }
    let imageUrl = serviceForm.imageUrl;
    // Si hay imagen nueva, subirla
    if (serviceImage) {
      setIsUploadingServiceImage(true);
      try {
        const formData = new FormData();
        formData.append('file', serviceImage);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.url) imageUrl = data.url;
        else throw new Error(data.error || 'Upload failed');
      } catch (e) {
        toast.error('Error al subir imagen: ' + (e instanceof Error ? e.message : 'Unknown error'));
        setIsUploadingServiceImage(false);
        return;
      }
      setIsUploadingServiceImage(false);
    }
    const payload = {
      name: serviceForm.name,
      description: serviceForm.description || undefined,
      category: serviceForm.category,
      price: serviceForm.price || undefined,
      imageUrl: imageUrl || undefined,
      isActive: serviceForm.isActive,
      sortOrder: serviceForm.sortOrder,
    };
    if (editingServiceId) {
      updateServiceMutation.mutate({ id: editingServiceId, ...payload });
    } else {
      createServiceMutation.mutate(payload);
    }
  };

  const handleEditService = (service: any) => {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      description: service.description || '',
      category: service.category || 'general',
      price: service.price || '',
      imageUrl: service.imageUrl || '',
      isActive: service.isActive,
      sortOrder: service.sortOrder || 0,
    });
    setServiceImagePreview(service.imageUrl || null);
    setServiceImage(null);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) {
      toast.error('El nombre del producto es requerido');
      return;
    }
    let imageUrl = productForm.imageUrl;
    if (productImage) {
      setIsUploadingProductImage(true);
      try {
        const formData = new FormData();
        formData.append('file', productImage);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.url) imageUrl = data.url;
        else throw new Error(data.error || 'Upload failed');
      } catch (e) {
        toast.error('Error al subir imagen: ' + (e instanceof Error ? e.message : 'Unknown error'));
        setIsUploadingProductImage(false);
        return;
      }
      setIsUploadingProductImage(false);
    }
    const payload = {
      name: productForm.name,
      description: productForm.description || undefined,
      category: productForm.category,
      price: productForm.price || undefined,
      imageUrl: imageUrl || undefined,
      stock: productForm.stock,
      isActive: productForm.isActive,
      sortOrder: productForm.sortOrder,
    };
    if (editingProductId) {
      updateProductMutation.mutate({ id: editingProductId, ...payload });
    } else {
      createProductMutation.mutate(payload);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description || '',
      category: product.category || 'general',
      price: product.price || '',
      imageUrl: product.imageUrl || '',
      stock: product.stock || 0,
      isActive: product.isActive,
      sortOrder: product.sortOrder || 0,
    });
    setProductImagePreview(product.imageUrl || null);
    setProductImage(null);
  };

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
          <div className="overflow-x-auto -mx-4 px-4 pb-1">
            <TabsList className="bg-[#C5A55A]/10 h-auto inline-flex flex-nowrap gap-1 min-w-max p-1">
              <TabsTrigger value="memberships" className="whitespace-nowrap text-xs sm:text-sm px-3 py-2">Membresías</TabsTrigger>
              <TabsTrigger value="appointments" className="whitespace-nowrap text-xs sm:text-sm px-3 py-2">Citas</TabsTrigger>
              <TabsTrigger value="giftPurchases" className="whitespace-nowrap text-xs sm:text-sm px-3 py-2">Regalos</TabsTrigger>
              <TabsTrigger value="promotions" className="whitespace-nowrap text-xs sm:text-sm px-3 py-2">Promociones</TabsTrigger>
              <TabsTrigger value="ebook" className="flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm px-3 py-2">
                <BookOpen className="w-3.5 h-3.5" />
                eBook
              </TabsTrigger>
              <TabsTrigger value="subscribers" className="flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm px-3 py-2">
                <Bell className="w-3.5 h-3.5" />
                Suscriptores
                {couponSubscribers && couponSubscribers.length > 0 && (
                  <span className="ml-1 bg-[#C5A55A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{couponSubscribers.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="servicePurchases" className="flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm px-3 py-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                Compras Serv.
                {servicePurchases && servicePurchases.filter(p => p.status === 'pending').length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{servicePurchases.filter(p => p.status === 'pending').length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm px-3 py-2">
                <Settings className="w-3.5 h-3.5" />
                Servicios
                {servicesCatalog && (
                  <span className="ml-1 bg-[#C5A55A]/20 text-[#C5A55A] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{servicesCatalog.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm px-3 py-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                Productos
                {productsCatalog && (
                  <span className="ml-1 bg-[#C5A55A]/20 text-[#C5A55A] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{productsCatalog.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="productPurchases" className="flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm px-3 py-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                Compras Prod.
                {productPurchases && productPurchases.filter((p: any) => p.status === 'pending').length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{productPurchases.filter((p: any) => p.status === 'pending').length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="discountCodes" className="flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm px-3 py-2">
                <span>🏷️</span>
                <span>Cód. Descuento</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm px-3 py-2">
                <span>🎓</span>
                <span>Cursos</span>
              </TabsTrigger>
            </TabsList>
          </div>

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
                              <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex items-center gap-1 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                                  <span>🔑</span>
                                  Credenciales enviadas por correo
                                </div>
                                <button
                                  onClick={() => {
                                    if (confirm(`⚠️ ¿Revocar acceso de ${purchase.buyerName}?\n\nEsto eliminará su acceso al eBook. El usuario ya no podrá iniciar sesión.\n\nEsta acción no se puede deshacer.`))
                                      revokeEbookAccessMutation.mutate({ id: purchase.id });
                                  }}
                                  disabled={revokeEbookAccessMutation.isPending}
                                  className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium disabled:opacity-50"
                                >
                                  🚫 Revocar Acceso
                                </button>
                              </div>
                            )}
                            {purchase.status === 'rejected' && (
                              <button
                                onClick={() => {
                                  if (confirm(`¿Eliminar el registro de ${purchase.buyerName}?\n\nEsto eliminará permanentemente esta compra rechazada.`))
                                    revokeEbookAccessMutation.mutate({ id: purchase.id });
                                }}
                                disabled={revokeEbookAccessMutation.isPending}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium disabled:opacity-50"
                              >
                                🗑 Eliminar
                              </button>
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
          {/* Tab de Suscriptores */}
          <TabsContent value="subscribers" className="space-y-4">
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-[#C5A55A] flex items-center gap-2">
                      <BellRing className="w-5 h-5" />
                      Suscriptores a Ofertas
                    </CardTitle>
                    <CardDescription>Usuarios suscritos para recibir notificaciones de nuevos cupones</CardDescription>
                  </div>
                  <div className="bg-[#FAF7F2] border border-[#C5A55A]/30 rounded-xl px-4 py-2 text-center">
                    <p className="text-2xl font-bold text-[#C5A55A]">{couponSubscribers?.length || 0}</p>
                    <p className="text-xs text-[#999]">suscriptores</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <p className="text-sm text-amber-700">
                    <strong>⚠️ Automático:</strong> Cuando publicas una nueva promoción, todos los suscriptores reciben un correo electrónico desde <strong>clinicanutriserpv@gmail.com</strong> y una notificación push en su celular.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#C5A55A]/20">
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Correo</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">WhatsApp</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Fecha</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {couponSubscribers && couponSubscribers.length > 0 ? (
                        couponSubscribers.map((sub) => (
                          <tr key={sub.id} className="border-b border-[#C5A55A]/10 hover:bg-[#C5A55A]/5">
                            <td className="py-3 px-4 font-semibold">{sub.email}</td>
                            <td className="py-3 px-4">
                              <a href={`https://wa.me/52${sub.whatsapp?.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.967 1.523 9.9 9.9 0 001.563 19.231c2.693.47 5.455.082 7.978-1.125a9.9 9.9 0 00-4.57-19.629z"/></svg>
                                {sub.whatsapp}
                              </a>
                            </td>
                            <td className="py-3 px-4 text-xs text-[#999]">{new Date(sub.createdAt).toLocaleDateString('es-MX')}</td>
                            <td className="py-3 px-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-red-100 text-red-700 hover:bg-red-200"
                                onClick={() => {
                                  if (confirm('\u00bfEliminar este suscriptor?')) {
                                    deleteSubscriberMutation.mutate({ id: sub.id });
                                  }
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-[#999]">
                            No hay suscriptores aún. El botón “Suscribirse a Ofertas” en la cuponera permite a los usuarios registrarse.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Catálogo de Servicios */}
          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulario crear/editar servicio */}
              <Card className="border-[#C5A55A]/20">
                <CardHeader>
                  <CardTitle className="text-[#C5A55A] flex items-center gap-2">
                    {editingServiceId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editingServiceId ? 'Editar Servicio' : 'Agregar Servicio'}
                  </CardTitle>
                  <CardDescription>
                    {editingServiceId ? 'Modifica los datos del servicio seleccionado' : 'Crea un nuevo servicio para el catálogo'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del servicio *</label>
                    <input
                      type="text"
                      value={serviceForm.name}
                      onChange={e => setServiceForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Ej: Cavitación 80K"
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      value={serviceForm.description}
                      onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Breve descripción del servicio..."
                      rows={3}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A] resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <select
                        value={serviceForm.category}
                        onChange={e => setServiceForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]"
                      >
                        <option value="nutricion">Nutrición</option>
                        <option value="corporales">Corporales</option>
                        <option value="faciales">Faciales</option>
                        <option value="medicina">Medicina</option>
                        <option value="otros">Otros</option>
                        <option value="productos">Productos</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                      <input
                        type="text"
                        value={serviceForm.price}
                        onChange={e => setServiceForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="Ej: $1,500 MXN"
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Orden (número)</label>
                      <input
                        type="number"
                        value={serviceForm.sortOrder}
                        onChange={e => setServiceForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={serviceForm.isActive}
                          onChange={e => setServiceForm(f => ({ ...f, isActive: e.target.checked }))}
                          className="w-4 h-4 accent-[#C5A55A]"
                        />
                        <span className="text-sm font-medium text-gray-700">Activo (visible)</span>
                      </label>
                    </div>
                  </div>
                  {/* Imagen */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del servicio</label>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#C5A55A]/50 rounded-xl cursor-pointer hover:bg-[#C5A55A]/5 transition">
                      <input type="file" accept="image/*" onChange={handleServiceImageChange} className="hidden" />
                      {serviceImagePreview ? (
                        <img src={serviceImagePreview} alt="preview" className="h-24 object-contain rounded-lg" />
                      ) : (
                        <div className="text-center p-3">
                          <Upload className="w-6 h-6 text-[#C5A55A] mx-auto mb-1" />
                          <div className="text-sm text-gray-500">Toca para subir imagen</div>
                          <div className="text-xs text-gray-400 mt-1">JPG, PNG · máx 5MB</div>
                        </div>
                      )}
                    </label>
                    {serviceImagePreview && (
                      <button
                        onClick={() => { setServiceImage(null); setServiceImagePreview(null); setServiceForm(f => ({ ...f, imageUrl: '' })); }}
                        className="mt-1 text-xs text-red-500 hover:underline"
                      >
                        × Quitar imagen
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveService}
                      disabled={createServiceMutation.isPending || updateServiceMutation.isPending || isUploadingServiceImage}
                      className="flex-1 bg-[#C5A55A] hover:bg-[#B8963E] text-white"
                    >
                      {isUploadingServiceImage ? 'Subiendo imagen...' :
                       createServiceMutation.isPending || updateServiceMutation.isPending ? 'Guardando...' :
                       editingServiceId ? 'Guardar Cambios' : 'Crear Servicio'}
                    </Button>
                    {editingServiceId && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingServiceId(null);
                          setServiceForm({ name: '', description: '', category: 'general', price: '', imageUrl: '', isActive: true, sortOrder: 0 });
                          setServiceImage(null);
                          setServiceImagePreview(null);
                        }}
                        className="border-gray-300 text-gray-600"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Lista de servicios */}
              <Card className="border-[#C5A55A]/20">
                <CardHeader>
                  <CardTitle className="text-[#C5A55A] flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Catálogo de Servicios
                  </CardTitle>
                  <CardDescription>{servicesCatalog?.length || 0} servicios registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {servicesCatalog && servicesCatalog.length > 0 ? (
                      servicesCatalog.map((svc) => (
                        <div key={svc.id} className={`flex items-start gap-3 p-3 rounded-xl border ${svc.isActive ? 'border-[#C5A55A]/20 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                          {svc.imageUrl ? (
                            <img src={svc.imageUrl} alt={svc.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                          ) : (
                            <div className="w-14 h-14 bg-[#FAF7F2] rounded-lg flex items-center justify-center flex-shrink-0">
                              <Settings className="w-6 h-6 text-[#C5A55A]/40" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-semibold text-sm text-[#1A1A1A] truncate">{svc.name}</p>
                              {!svc.isActive && <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Inactivo</span>}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{svc.description || 'Sin descripción'}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] bg-[#C5A55A]/10 text-[#C5A55A] px-1.5 py-0.5 rounded-full">{svc.category}</span>
                              {svc.price && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">{svc.price}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleEditService(svc)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                if (confirm(`¿Eliminar el servicio "${svc.name}"?`)) {
                                  deleteServiceCatalogMutation.mutate({ id: svc.id });
                                }
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-[#999]">
                        <Settings className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No hay servicios en el catálogo.</p>
                        <p className="text-xs mt-1">Usa el formulario de la izquierda para agregar servicios.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab de Compras de Servicios */}
          <TabsContent value="servicePurchases" className="space-y-4">
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#C5A55A] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Compras de Servicios
                </CardTitle>
                <CardDescription>Gestiona las solicitudes de compra de servicios de la clínica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#C5A55A]/20">
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Comprador</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Email</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Teléfono</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Servicio</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Código</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Estado</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Comprobante</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Acciones</th>
                        <th className="text-left py-3 px-4 text-[#C5A55A] font-bold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicePurchases && servicePurchases.length > 0 ? (
                        servicePurchases.map((sp) => (
                          <tr key={sp.id} className={`border-b border-[#C5A55A]/10 hover:bg-[#C5A55A]/5 ${sp.status === 'pending' ? 'bg-yellow-50' : ''}`}>
                            <td className="py-3 px-4 font-semibold">{sp.buyerName}</td>
                            <td className="py-3 px-4">{sp.buyerEmail}</td>
                            <td className="py-3 px-4">{sp.buyerPhone || '-'}</td>
                            <td className="py-3 px-4">{sp.serviceName}</td>
                            <td className="py-3 px-4">
                              <span className="font-mono text-xs bg-[#FAF7F2] border border-[#C5A55A]/30 px-2 py-1 rounded">{sp.serviceCode}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                sp.status === 'approved' ? 'bg-green-100 text-green-700' :
                                sp.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {sp.status === 'approved' ? '✅ Aprobado' : sp.status === 'pending' ? '⏳ Pendiente' : '❌ Rechazado'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {sp.proofUrl && (
                                <a href={sp.proofUrl} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="outline" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
                                    <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                                  </Button>
                                </a>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1.5 flex-wrap">
                                {sp.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs bg-green-100 text-green-700 hover:bg-green-200"
                                      onClick={() => approveServiceMutation.mutate({ id: sp.id })}
                                      disabled={approveServiceMutation.isPending}
                                    >
                                      Aprobar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs bg-red-100 text-red-700 hover:bg-red-200"
                                      onClick={() => rejectServiceMutation.mutate({ id: sp.id })}
                                      disabled={rejectServiceMutation.isPending}
                                    >
                                      Rechazar
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  onClick={() => {
                                    if (confirm('\u00bfEliminar este registro?')) deleteServiceMutation.mutate({ id: sp.id });
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-xs text-[#999]">{new Date(sp.createdAt).toLocaleDateString('es-MX')}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-[#999]">
                            No hay compras de servicios aún.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Productos Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#1A1A1A]">Catálogo de Productos</CardTitle>
                <CardDescription>Agrega, edita o elimina productos de la tienda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulario */}
                <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#C5A55A]/20">
                  <h3 className="font-semibold text-[#1A1A1A] mb-4">{editingProductId ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-[#666] mb-1 block">Nombre *</label>
                      <input type="text" value={productForm.name} onChange={e => setProductForm(f => ({...f, name: e.target.value}))} placeholder="Nombre del producto" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#666] mb-1 block">Categoría</label>
                      <select value={productForm.category} onChange={e => setProductForm(f => ({...f, category: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]">
                        <option value="general">General</option>
                        <option value="nutricionales">Nutricionales</option>
                        <option value="cosmeticos">Cosméticos</option>
                        <option value="suplementos">Suplementos</option>
                        <option value="cuidado_piel">Cuidado de Piel</option>
                        <option value="otros">Otros</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#666] mb-1 block">Precio</label>
                      <input type="text" value={productForm.price} onChange={e => setProductForm(f => ({...f, price: e.target.value}))} placeholder="Ej: $299" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#666] mb-1 block">Stock</label>
                      <input type="number" value={productForm.stock} onChange={e => setProductForm(f => ({...f, stock: parseInt(e.target.value) || 0}))} min={0} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#666] mb-1 block">Orden</label>
                      <input type="number" value={productForm.sortOrder} onChange={e => setProductForm(f => ({...f, sortOrder: parseInt(e.target.value) || 0}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]" />
                    </div>
                    <div className="flex items-center gap-2 mt-5">
                      <input type="checkbox" id="productActive" checked={productForm.isActive} onChange={e => setProductForm(f => ({...f, isActive: e.target.checked}))} className="w-4 h-4 accent-[#C5A55A]" />
                      <label htmlFor="productActive" className="text-sm text-[#666]">Activo (visible en tienda)</label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-[#666] mb-1 block">Descripción</label>
                      <textarea value={productForm.description} onChange={e => setProductForm(f => ({...f, description: e.target.value}))} placeholder="Descripción del producto" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A] resize-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-[#666] mb-2 block">Imagen del Producto</label>
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#C5A55A]/40 rounded-xl cursor-pointer hover:bg-[#C5A55A]/5 transition">
                        <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setProductImage(f); setProductImagePreview(URL.createObjectURL(f)); }}} className="hidden" />
                        {productImagePreview ? (
                          <img src={productImagePreview} alt="preview" className="h-24 object-contain rounded-lg" />
                        ) : (
                          <div className="text-center p-3"><Upload className="w-6 h-6 text-[#C5A55A] mx-auto mb-1" /><div className="text-sm text-gray-500">Subir imagen</div></div>
                        )}
                      </label>
                      {productImagePreview && (
                        <button onClick={() => { setProductImage(null); setProductImagePreview(null); setProductForm(f => ({...f, imageUrl: ''})); }} className="mt-1 text-xs text-red-500 hover:underline">Quitar imagen</button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleSaveProduct}
                      disabled={createProductMutation.isPending || updateProductMutation.isPending || isUploadingProductImage}
                      className="flex items-center gap-2 bg-[#C5A55A] hover:bg-[#B8935A] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      <Plus className="w-4 h-4" />
                      {isUploadingProductImage ? 'Subiendo imagen...' :
                       createProductMutation.isPending || updateProductMutation.isPending ? 'Guardando...' :
                       editingProductId ? 'Actualizar Producto' : 'Agregar Producto'}
                    </button>
                    {editingProductId && (
                      <button onClick={() => { setEditingProductId(null); setProductForm({ name: '', description: '', category: 'general', price: '', imageUrl: '', stock: 0, isActive: true, sortOrder: 0 }); setProductImage(null); setProductImagePreview(null); }} className="px-4 py-2 border rounded-lg text-sm text-[#666] hover:bg-gray-50 transition">Cancelar</button>
                    )}
                  </div>
                </div>

                {/* Lista de productos */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#C5A55A]/20">
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Imagen</th>
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Nombre</th>
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Categoría</th>
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Precio</th>
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Stock</th>
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Estado</th>
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsCatalog?.map((prod: any) => (
                        <tr key={prod.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {prod.imageUrl ? (
                              <img src={prod.imageUrl} alt={prod.name} className="w-12 h-12 object-cover rounded-lg" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">Sin img</div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium text-[#1A1A1A]">{prod.name}</td>
                          <td className="py-3 px-4 text-[#666] capitalize">{prod.category}</td>
                          <td className="py-3 px-4 text-[#C5A55A] font-semibold">{prod.price || 'Sin precio'}</td>
                          <td className="py-3 px-4 text-[#666]">{prod.stock}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${prod.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {prod.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleEditProduct(prod)} className="p-1.5 text-[#C5A55A] hover:bg-[#C5A55A]/10 rounded transition"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => { if (confirm('¿Eliminar este producto?')) deleteProductCatalogMutation.mutate({ id: prod.id }); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!productsCatalog || productsCatalog.length === 0) && (
                        <tr><td colSpan={7} className="py-8 text-center text-[#999]">No hay productos en el catálogo</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compras de Productos Tab */}
          <TabsContent value="productPurchases" className="space-y-4">
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#1A1A1A]">Compras de Productos</CardTitle>
                <CardDescription>Verifica comprobantes y aprueba o rechaza compras de productos.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#C5A55A]/20">
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Producto</th>
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Comprador</th>
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Correo</th>
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Teléfono</th>
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Cantidad</th>
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Estado</th>
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Comprobante</th>
                        <th className="text-left py-3 px-4 text-[#666] font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productPurchases?.map((pp: any) => (
                        <tr key={pp.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-[#1A1A1A]">{pp.productName}</td>
                          <td className="py-3 px-4">{pp.buyerName}</td>
                          <td className="py-3 px-4 text-[#666]">{pp.buyerEmail}</td>
                          <td className="py-3 px-4 text-[#666]">{pp.buyerPhone || '-'}</td>
                          <td className="py-3 px-4 text-center">{pp.quantity}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              pp.status === 'approved' ? 'bg-green-100 text-green-700' :
                              pp.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>{pp.status === 'approved' ? 'Aprobado' : pp.status === 'rejected' ? 'Rechazado' : 'Pendiente'}</span>
                          </td>
                          <td className="py-3 px-4">
                            {pp.proofUrl && (
                              <button onClick={() => window.open(pp.proofUrl, '_blank')} className="flex items-center gap-1 text-[#C5A55A] hover:underline text-xs"><Eye className="w-3.5 h-3.5" />Ver</button>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              {pp.status === 'pending' && (
                                <>
                                  <button onClick={() => verifyProductMutation.mutate({ id: pp.id })} className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded transition"><CheckCircle className="w-3.5 h-3.5" />Aprobar</button>
                                  <button onClick={() => rejectProductMutation.mutate({ id: pp.id })} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition"><XCircle className="w-3.5 h-3.5" />Rechazar</button>
                                </>
                              )}
                              <button onClick={() => { if (confirm('¿Eliminar este registro?')) deleteProductPurchaseMutation.mutate({ id: pp.id }); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded transition"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!productPurchases || productPurchases.length === 0) && (
                        <tr><td colSpan={8} className="py-8 text-center text-[#999]">No hay compras de productos</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Códigos de Descuento Generales Tab */}
          <TabsContent value="discountCodes" className="space-y-4">
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#C5A55A]">🏷️ Códigos de Descuento Generales</CardTitle>
                <CardDescription>
                  Activa o desactiva los códigos de promoción para servicios, productos y programas de nutrición.
                  El código del eBook se gestiona en el tab "eBook".
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generalDiscountCodes && generalDiscountCodes.length > 0 ? (
                    generalDiscountCodes.map((code: any) => (
                      <div key={code.id} className={`border-2 rounded-xl p-4 transition-all ${
                        code.isActive
                          ? 'border-[#C5A55A] bg-[#FAF7F2]'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-mono font-bold text-lg text-[#1A1A1A]">{code.code}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {code.isTwoForOne
                                ? '🎁 2x1 — Compras uno y obtienes doble'
                                : code.isGift
                                ? '🎁 Regalo — 100% gratis'
                                : `${code.discountPercent}% de descuento`
                              }
                            </p>
                            {code.description && (
                              <p className="text-xs text-gray-400 mt-1">{code.description}</p>
                            )}
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            code.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {code.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mb-3">
                          Usos: <span className="font-semibold text-gray-600">{code.usageCount || 0}</span>
                        </div>
                        <button
                          onClick={() => toggleGeneralCodeMutation.mutate({ id: code.id, isActive: !code.isActive })}
                          className={`w-full py-2 rounded-lg text-sm font-bold transition ${
                            code.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-[#C5A55A] text-white hover:bg-[#B8963E]'
                          }`}
                        >
                          {code.isActive ? '⏸ Desactivar' : '▶ Activar'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm col-span-3 py-8 text-center">Cargando códigos...</p>
                  )}
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                  <p className="font-bold text-amber-800 mb-2">ℹ️ Cómo funcionan los códigos:</p>
                  <ul className="text-amber-700 space-y-1 text-xs">
                    <li>• Los clientes ingresan el código al momento de comprar un servicio, producto o programa de nutrición.</li>
                    <li>• Solo los códigos <strong>Activos</strong> pueden ser usados por los clientes.</li>
                    <li>• El código <strong>Nutriserfree</strong> hace que el servicio/producto sea completamente gratis.</li>
                    <li>• El código <strong>Nutriser2x1</strong> permite al cliente obtener 2 servicios al precio de 1.</li>
                    <li>• Los códigos del eBook se gestionan en el tab "eBook".</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TAB: CURSOS ===== */}
          <TabsContent value="courses" className="space-y-6">
            {/* Comentarios pendientes */}
            {pendingCommentsData && pendingCommentsData.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-700">💬 Comentarios Pendientes de Moderación ({pendingCommentsData.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingCommentsData.map((comment: any) => (
                    <div key={comment.id} className="bg-white border border-red-100 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">{comment.authorName}</p>
                          <p className="text-xs text-gray-400">{comment.authorEmail} • Video ID: {comment.videoId}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => approveCommentMutation.mutate({ id: comment.id })}>✓ Aprobar</Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => rejectCommentMutation.mutate({ id: comment.id })}>Rechazar</Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{comment.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Crear nuevo curso */}
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#C5A55A]">➕ Crear Nuevo Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Título del curso *" value={courseForm.title} onChange={e => setCourseForm(p => ({ ...p, title: e.target.value }))} />
                <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Descripción" value={courseForm.description} onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))} />
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Categoría (ej: Nutrición, Bienestar)" value={courseForm.category} onChange={e => setCourseForm(p => ({ ...p, category: e.target.value }))} />
                <Button className="bg-[#C5A55A] hover:bg-[#B8963E] text-white" onClick={() => createCourseMutation.mutate(courseForm)} disabled={!courseForm.title || createCourseMutation.isPending}>
                  {createCourseMutation.isPending ? 'Creando...' : 'Crear Curso'}
                </Button>
              </CardContent>
            </Card>

            {/* Lista de cursos */}
            <Card className="border-[#C5A55A]/20">
              <CardHeader>
                <CardTitle className="text-[#C5A55A]">🎓 Cursos ({coursesData?.length ?? 0})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!coursesData || coursesData.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No hay cursos creados aún.</p>
                ) : coursesData.map((course: any) => (
                  <div key={course.id} className="border border-[#C5A55A]/20 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-[#1A1A1A]">{course.title}</h3>
                        <p className="text-xs text-gray-500">{course.category} • {course.isPublished ? '🟢 Publicado' : '🔴 Borrador'}</p>
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => updateCourseMutation.mutate({ id: course.id, isPublished: !course.isPublished })}>
                          {course.isPublished ? 'Despublicar' : 'Publicar'}
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => { if(confirm('\u00bfEliminar curso?')) deleteCourseMutation.mutate({ id: course.id }); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Agregar video al curso */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">🎥 Agregar Video</p>
                      <input className="w-full border rounded px-2 py-1.5 text-sm" placeholder="Título del video *" value={videoForm.courseId === course.id ? videoForm.title : ''} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value, courseId: course.id }))} />
                      <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows={2} placeholder="Descripción" value={videoForm.courseId === course.id ? videoForm.description : ''} onChange={e => setVideoForm(p => ({ ...p, description: e.target.value, courseId: course.id }))} />
                      <input className="w-full border rounded px-2 py-1.5 text-sm" placeholder="Duración (ej: 15:30)" value={videoForm.courseId === course.id ? videoForm.duration : ''} onChange={e => setVideoForm(p => ({ ...p, duration: e.target.value, courseId: course.id }))} />
                      <div className="flex gap-2 items-center">
                        <input type="file" accept="video/*" className="text-xs flex-1" onChange={e => { setCourseVideoFile(e.target.files?.[0] || null); setVideoForm(p => ({ ...p, courseId: course.id })); }} />
                        <Button size="sm" className="bg-[#C5A55A] hover:bg-[#B8963E] text-white whitespace-nowrap" onClick={handleUploadCourseVideo} disabled={uploadingCourseVideo || videoForm.courseId !== course.id}>
                          {uploadingCourseVideo && videoForm.courseId === course.id ? 'Subiendo...' : 'Subir Video'}
                        </Button>
                      </div>
                    </div>

                    {/* Videos del curso */}
                    {course.videos && course.videos.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">📺 Videos ({course.videos.length})</p>
                        {course.videos.map((video: any) => (
                          <div key={video.id} className="bg-white border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{video.title}</p>
                                <p className="text-xs text-gray-400">{video.duration}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-xs" onClick={() => setSelectedVideoForDoc(selectedVideoForDoc === video.id ? null : video.id)}>
                                  📄 Doc
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 text-xs" onClick={() => { if(confirm('\u00bfEliminar video?')) deleteVideoMutation.mutate({ id: video.id }); }}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Documentos del video */}
                            {selectedVideoForDoc === video.id && (
                              <div className="mt-3 pt-3 border-t space-y-2">
                                <p className="text-xs font-bold text-gray-500">Agregar documento de apoyo:</p>
                                <div className="flex gap-2 items-center">
                                  <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.xls" className="text-xs flex-1" onChange={e => setCourseDocFile(e.target.files?.[0] || null)} />
                                  <Button size="sm" className="bg-[#C5A55A] hover:bg-[#B8963E] text-white text-xs whitespace-nowrap" onClick={() => handleUploadCourseDoc(video.id)} disabled={addDocumentMutation.isPending}>
                                    {addDocumentMutation.isPending ? 'Subiendo...' : 'Subir'}
                                  </Button>
                                </div>
                                {video.documents && video.documents.length > 0 && (
                                  <div className="space-y-1">
                                    {video.documents.map((doc: any) => (
                                      <div key={doc.id} className="flex justify-between items-center text-xs bg-gray-50 rounded p-2">
                                        <span>📄 {doc.title}</span>
                                        <Button size="sm" variant="ghost" className="text-red-500 h-5 px-1" onClick={() => deleteDocumentMutation.mutate({ id: doc.id })}>
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
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
