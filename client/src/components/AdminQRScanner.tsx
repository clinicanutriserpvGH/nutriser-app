/**
 * AdminQRScanner — Escanear QR de paciente y registrar compra presencial
 * Flujo: Escanear QR → Ver datos del paciente → Seleccionar servicio/producto → Confirmar → Cashback acreditado
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  QrCode, Camera, User, Wallet, ShoppingBag,
  Package, Sparkles, Check, ArrowLeft, Loader2,
  Search, CreditCard, DollarSign, X, Trash2, AlertTriangle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Step = "scan" | "patient" | "select" | "confirm" | "done";
type ItemType = "service" | "package" | "product";

export default function AdminQRScanner() {
  const [step, setStep] = useState<Step>("scan");
  const [walletNumber, setWalletNumber] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    type: ItemType;
    name: string;
    price: number; // centavos
  } | null>(null);
  const [customPrice, setCustomPrice] = useState("");
  const [cashbackPercent, setCashbackPercent] = useState("2");
  const [walletAmountToUse, setWalletAmountToUse] = useState("0"); // pesos
  const [notes, setNotes] = useState("");
  const scannerRef = useRef<any>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  // Query para pagos en efectivo pendientes del wallet actual
  const [walletIdForCash, setWalletIdForCash] = useState<number | null>(null);
  const cashPendingQuery = trpc.cashPayments.getMyPending.useQuery(
    { walletId: walletIdForCash! },
    { enabled: !!walletIdForCash }
  );

  // Query para solicitudes de interés en banners del paciente escaneado
  const bannerInterestsAdminQuery = trpc.bannerInterests.getPending.useQuery(
    undefined,
    { enabled: !!walletIdForCash }
  );
  // Filtrar solo los del paciente actual (por walletId/patientId)
  // El endpoint getPending devuelve todos, filtraremos por patientEmail
  const [patientEmailForFilter, setPatientEmailForFilter] = useState<string | null>(null);
  const [patientIdForOnlinePurchases, setPatientIdForOnlinePurchases] = useState<number | null>(null);
  // Query para compras en línea aprobadas del paciente
  const onlinePurchasesQuery = trpc.patients.getMyPurchases.useQuery(
    { email: patientEmailForFilter!, patientId: patientIdForOnlinePurchases ?? undefined },
    { enabled: !!patientEmailForFilter }
  );
  const patientBannerInterests = (bannerInterestsAdminQuery.data || []).filter(
    (i: any) => patientEmailForFilter && i.patientEmail === patientEmailForFilter
  );

  // Estado de monto por solicitud de banner (id -> string)
  const [bannerAmounts, setBannerAmounts] = useState<Record<number, string>>({});

  // Mutation para eliminar solicitud de banner
  const deleteBannerMutation = trpc.bannerInterests.delete.useMutation({
    onSuccess: () => {
      toast.success('Solicitud de promoción eliminada.');
      bannerInterestsAdminQuery.refetch();
    },
    onError: (e) => toast.error('Error al eliminar: ' + e.message),
  });

  // Mutation para atender solicitud de banner
  const attendBannerMutation = trpc.bannerInterests.attend.useMutation({
    onSuccess: () => {
      toast.success('✅ Promoción acreditada al monedero del paciente.');
      bannerInterestsAdminQuery.refetch();
      utils.wallet.adminLookupByNumber.invalidate();
    },
    onError: (e) => toast.error('Error al acreditar: ' + e.message),
  });
  const confirmCashMutation = trpc.cashPayments.confirm.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Pago confirmado. Cashback acreditado a ${patientQuery.data?.patientName ?? 'paciente'}.`);
      utils.cashPayments.getMyPending.invalidate();
      utils.wallet.adminLookupByNumber.invalidate();
    },
    onError: (e) => toast.error('Error al confirmar: ' + e.message),
  });
  const cancelCashMutation = trpc.cashPayments.cancel.useMutation({
    onSuccess: () => {
      toast.success('Pago pendiente cancelado.');
      utils.cashPayments.getMyPending.invalidate();
    },
    onError: (e) => toast.error('Error al cancelar: ' + e.message),
  });

  // Query para buscar monedero por número
  const patientQuery = trpc.wallet.adminLookupByNumber.useQuery(
    { walletNumber },
    { enabled: !!walletNumber && step !== "scan" }
  );

  // Query para servicios y productos
  const servicesQuery = trpc.services.list.useQuery();
  const productsQuery = trpc.products.list.useQuery();

  // Estado para el selector de descuento
  const [selectedDiscount, setSelectedDiscount] = useState<10 | 15 | 20 | 25 | 30 | null>(null);

  // Mutation para activar descuento
  const setDiscountMutation = trpc.wallet.adminSetDiscount.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Descuento del ${data.discountPercent}% activado correctamente.`);
      utils.wallet.adminLookupByNumber.invalidate();
      setSelectedDiscount(null);
    },
    onError: (e) => toast.error('Error al activar descuento: ' + e.message),
  });

  // Mutation para quitar descuento
  const removeDiscountMutation = trpc.wallet.adminRemoveDiscount.useMutation({
    onSuccess: () => {
      toast.success('Descuento eliminado del monedero.');
      utils.wallet.adminLookupByNumber.invalidate();
    },
    onError: (e) => toast.error('Error al quitar descuento: ' + e.message),
  });

  // Mutation para reiniciar monedero (poner todo en cero)
  const resetWalletMutation = trpc.wallet.adminResetWallet.useMutation({
    onSuccess: () => {
      toast.success('✅ Monedero reiniciado. Saldo, cashback y canjeado en $0.00');
      utils.wallet.adminLookupByNumber.invalidate();
      setConfirmReset(false);
    },
    onError: (e) => toast.error('Error al reiniciar monedero: ' + e.message),
  });
  // Mutation para suspender monedero (dar de baja)
  const suspendWalletMutation = trpc.wallet.adminSuspendWallet.useMutation({
    onSuccess: () => {
      toast.success('Monedero dado de baja. El paciente no podrá usarlo hasta ser reactivado.');
      utils.wallet.adminLookupByNumber.invalidate();
    },
    onError: (e) => toast.error('Error al dar de baja: ' + e.message),
  });
  // Mutation para reactivar monedero (dar de alta)
  const unsuspendWalletMutation = trpc.wallet.adminUnsuspendWallet.useMutation({
    onSuccess: () => {
      toast.success('✅ Monedero reactivado. El paciente puede usarlo nuevamente.');
      utils.wallet.adminLookupByNumber.invalidate();
    },
    onError: (e) => toast.error('Error al reactivar: ' + e.message),
  });
  // Mutation para quitar deuda activa (eliminar notificaciones de cobro)
  const clearDebtMutation = trpc.adminNotifs.clearDebt.useMutation({
    onSuccess: (data) => {
      if (data.deleted > 0) {
        toast.success(`✅ Deuda eliminada. El paciente ya puede comprar normalmente.`);
      } else {
        toast.info('Este paciente no tiene deuda activa registrada.');
      }
      notifsForPatientQuery.refetch();
    },
    onError: (e) => toast.error('Error al eliminar deuda: ' + e.message),
  });
  // Query para notificaciones activas del paciente (para mostrar deudas en el escáner)
  const notifsForPatientQuery = trpc.adminNotifs.getByWalletId.useQuery(
    { walletId: walletIdForCash! },
    { enabled: !!walletIdForCash }
  );
  const activeDebtNotifs = (notifsForPatientQuery.data || []).filter((n: any) => n.type === 'cobro');
  // Estado para confirmar reinicio (doble confirmación)
  const [confirmReset, setConfirmReset] = useState(false);

  // ─── Modal de contraseña de seguridad ─────────────────────────────
  const [securityModal, setSecurityModal] = useState<{
    open: boolean;
    title: string;
    description?: string;
    onConfirm: (password: string) => void;
  }>({ open: false, title: '', onConfirm: () => {} });

  const openSecurityModal = (title: string, description: string, onConfirm: (password: string) => void) => {
    setSecurityModal({ open: true, title, description, onConfirm });
  };
  const closeSecurityModal = () => setSecurityModal(prev => ({ ...prev, open: false }));

  // Query para historial de compras del paciente (para que el admin pueda borrarlas)
  const [patientIdForHistory, setPatientIdForHistory] = useState<number | null>(null);
  const patientPurchaseHistoryQuery = trpc.cashPayments.getPatientHistory.useQuery(
    { patientId: patientIdForHistory! },
    { enabled: !!patientIdForHistory }
  );

  // Mutation para borrar una compra del historial
  const deletePurchaseMutation = trpc.cashPayments.adminDelete.useMutation({
    onSuccess: () => {
      toast.success('Compra eliminada del historial.');
      patientPurchaseHistoryQuery.refetch();
    },
    onError: (e) => toast.error('Error al eliminar: ' + e.message),
  });

  // ─── Plan de Pagos a Plazos ─────────────────────────────────────────
  const [showInstallmentForm, setShowInstallmentForm] = useState(false);
  const [installmentConcept, setInstallmentConcept] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [installmentModalidad, setInstallmentModalidad] = useState<'quincenal' | 'semanal'>('quincenal');
  // IDs de artículos seleccionados para el plan (índices del itemsJson del pago pendiente)
  const [selectedPlanItems, setSelectedPlanItems] = useState<number[]>([]);
  // ID del pago pendiente vinculado al plan
  const [linkedCashPaymentId, setLinkedCashPaymentId] = useState<number | null>(null);

  const installmentCreateMutation = trpc.installments.create.useMutation({
    onSuccess: (data) => {
      const perPayment = data.plan.totalAmountCents / data.plan.totalInstallments;
      toast.success(`✅ Plan creado: ${data.plan.totalInstallments} pagos de $${(perPayment / 100).toFixed(2)} ${data.plan.modalidad === 'quincenal' ? 'quincenales' : 'semanales'}.`);
      setShowInstallmentForm(false);
      setInstallmentConcept("");
      setInstallmentAmount("");
      setSelectedPlanItems([]);
      setLinkedCashPaymentId(null);
      utils.cashPayments.getMyPending.invalidate();
      utils.wallet.adminLookupByNumber.invalidate();
    },
    onError: (e) => toast.error('Error al crear plan: ' + e.message),
  });

  // Mutation para registrar compra presencial
  const registerMutation = trpc.wallet.adminRegisterPresentialPurchase.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Cashback de $${(data.cashbackAmount / 100).toFixed(2)} MXN acreditado a ${data.patientName}`
      );
      setStep("done");
      utils.wallet.adminListAll.invalidate();
      utils.wallet.adminLookupByNumber.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // Paquetes hardcoded (mismos que en Memberships)
  const PACKAGES = [
    { id: "pkg-nutricion", name: "Paquete Nutrición", price: 250000 },
    { id: "pkg-reductor", name: "Paquete Reductor Nutriser", price: 450000 },
  ];

  // ─── QR Scanner ───────────────────────────────────────────────
  const startScanner = useCallback(async () => {
    if (scanning) return;
    setScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      // Esperar a que el DOM tenga el contenedor
      await new Promise((r) => setTimeout(r, 300));

      if (!scannerContainerRef.current) {
        setScanning(false);
        return;
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Extraer walletNumber del URL del QR
          // Formato: NUT-XXXX-XXXX o URL con ese número
          const match = decodedText.match(/NUT-[A-Z0-9]+-[A-Z0-9]+/i);
          if (match) {
            setWalletNumber(match[0].toUpperCase());
            setStep("patient");
            stopScanner();
          } else if (decodedText.toUpperCase().startsWith("NUT-")) {
            setWalletNumber(decodedText.toUpperCase());
            setStep("patient");
            stopScanner();
          } else {
            toast.error("QR no reconocido. Escanea un QR de monedero Nutriser.");
          }
        },
        () => {} // ignore errors during scan
      );
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      toast.error("No se pudo acceder a la cámara. Verifica los permisos.");
      setScanning(false);
    }
  }, [scanning]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // Cuando se obtiene el paciente, cargar sus pagos pendientes y solicitudes de banner
  useEffect(() => {
    if (patientQuery.data?.walletId) {
      setWalletIdForCash(patientQuery.data.walletId);
    }
    if (patientQuery.data?.patientEmail) {
      setPatientEmailForFilter(patientQuery.data.patientEmail);
    }
    if (patientQuery.data?.patientId) {
      setPatientIdForHistory(patientQuery.data.patientId);
      setPatientIdForOnlinePurchases(patientQuery.data.patientId);
    }
  }, [patientQuery.data?.walletId, patientQuery.data?.patientEmail, patientQuery.data?.patientId]);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleManualSearch = () => {
    const num = manualInput.trim().toUpperCase();
    if (!num) return;
    // Wallet numbers are in format NUT-XXXX-XXXX
    setWalletNumber(num.startsWith("NUT-") ? num : num);
    setStep("patient");
  };

  const handleSelectItem = (type: ItemType, name: string, price: number) => {
    setSelectedItem({ type, name, price });
    setCustomPrice((price / 100).toString());
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (!selectedItem || !walletNumber) return;
    const priceInCents = Math.round(parseFloat(customPrice || "0") * 100);
    const cbPercent = parseFloat(cashbackPercent || "2");
    const walletCents = Math.round(parseFloat(walletAmountToUse || "0") * 100);
    const patientBalance = patientQuery.data?.balance ?? 0;

    if (walletCents > patientBalance) {
      toast.error(`Saldo insuficiente. El paciente tiene $${(patientBalance / 100).toFixed(2)} MXN`);
      return;
    }

    registerMutation.mutate({
      walletNumber,
      itemType: selectedItem.type,
      itemName: selectedItem.name,
      itemPrice: priceInCents,
      cashbackPercent: cbPercent,
      walletAmountToUse: walletCents,
      notes: notes || undefined,
    });
  };

  const handleReset = () => {
    stopScanner();
    setStep("scan");
    setWalletNumber("");
    setManualInput("");
    setSelectedItem(null);
    setCustomPrice("");
    setCashbackPercent("2");
    setWalletAmountToUse("0");
    setNotes("");
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Modal de contraseña de seguridad */}
      <Dialog open={securityModal.open} onOpenChange={(o) => { if (!o) closeSecurityModal(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              {securityModal.title}
            </DialogTitle>
          </DialogHeader>
          {securityModal.description && <p className="text-sm text-gray-600">{securityModal.description}</p>}
          <SecurityPasswordInputInline
            onConfirm={(pw: string) => { securityModal.onConfirm(pw); closeSecurityModal(); }}
            onCancel={closeSecurityModal}
          />
        </DialogContent>
      </Dialog>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {(["Escanear", "Paciente", "Seleccionar", "Confirmar"] as const).map((label, i) => {
          const stepIndex = ["scan", "patient", "select", "confirm"].indexOf(step);
          const isActive = i <= stepIndex;
          return (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isActive ? "bg-[#C5A55A] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {i + 1}
              </div>
              <span className={isActive ? "text-[#C5A55A] font-semibold" : ""}>{label}</span>
              {i < 3 && <div className={`w-6 h-0.5 ${isActive ? "bg-[#C5A55A]" : "bg-gray-200"}`} />}
            </div>
          );
        })}
      </div>

      {/* ═══ STEP 1: Escanear QR ═══ */}
      {step === "scan" && (
        <div className="space-y-4">
          <Card className="border-[#C5A55A]/30 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-4 text-center space-y-4">
              <div className="w-16 h-16 bg-[#C5A55A]/10 rounded-2xl flex items-center justify-center mx-auto">
                <QrCode className="w-8 h-8 text-[#C5A55A]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Escanear QR del Paciente</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Escanea el código QR del monedero del paciente para registrar una compra presencial
                </p>
              </div>

              {!scanning ? (
                <Button
                  onClick={startScanner}
                  className="bg-[#C5A55A] hover:bg-[#b8963f] text-white gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Abrir Cámara
                </Button>
              ) : (
                <div className="space-y-3">
                  <div
                    id="qr-reader"
                    ref={scannerContainerRef}
                    className="mx-auto rounded-xl overflow-hidden border-2 border-[#C5A55A]/30"
                    style={{ maxWidth: 300 }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopScanner}
                    className="text-red-500 border-red-200"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cerrar cámara
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Búsqueda manual */}
          <Card className="border-gray-200">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                <Search className="w-3 h-3" />
                O buscar por número de tarjeta
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="NUT-XXXX-XXXX"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                  className="text-sm font-mono"
                />
                <Button
                  onClick={handleManualSearch}
                  className="bg-[#1A1A1A] hover:bg-[#333] text-white"
                  disabled={!manualInput.trim()}
                >
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ STEP 2: Datos del Paciente ═══ */}
      {step === "patient" && (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-500">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver a escanear
          </Button>

          {patientQuery.isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#C5A55A] mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Buscando paciente...</p>
            </div>
          ) : patientQuery.error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-center">
                <p className="text-red-600 font-semibold">Monedero no encontrado</p>
                <p className="text-xs text-red-400 mt-1">Verifica el número: {walletNumber}</p>
                <Button variant="outline" size="sm" onClick={handleReset} className="mt-3">
                  Intentar de nuevo
                </Button>
              </CardContent>
            </Card>
          ) : patientQuery.data ? (
            <Card className="border-[#C5A55A]/30 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1A1A1A] to-[#333] rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-[#C5A55A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{patientQuery.data.patientName}</p>
                    <p className="text-xs text-gray-500">{patientQuery.data.patientEmail}</p>
                    {patientQuery.data.patientPhone && (
                      <p className="text-xs text-gray-400">{patientQuery.data.patientPhone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Saldo</p>
                    <p className="font-black text-xl text-[#C5A55A]">
                      ${(patientQuery.data.balance / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <CreditCard className="w-3 h-3 text-gray-400" />
                  <span className="font-mono text-gray-500">{patientQuery.data.walletNumber}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    patientQuery.data.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {patientQuery.data.isActive ? "Activa" : "Suspendida"}
                  </span>
                </div>

                {patientQuery.data.isActive ? (
                  <Button
                    onClick={() => setStep("select")}
                    className="w-full bg-[#C5A55A] hover:bg-[#b8963f] text-white gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Registrar Compra
                  </Button>
                ) : (
                  <p className="text-center text-red-500 text-sm font-semibold">
                    Monedero suspendido — no se puede registrar compra
                  </p>
                )}

                {/* — Pagos en Efectivo Pendientes — */}
                {cashPendingQuery.isLoading ? (
                  <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-amber-500" /></div>
                ) : (cashPendingQuery.data && cashPendingQuery.data.length > 0) ? (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-bold text-red-700">Pagos en Clínica Pendientes ({cashPendingQuery.data.length})</span>
                    </div>
                    {cashPendingQuery.data.map((p: any) => {
                      // Parsear itemsJson si existe
                      let parsedItems: Array<{name: string; qty?: number; priceCents: number; itemType?: string}> = [];
                      try { if (p.itemsJson) parsedItems = JSON.parse(p.itemsJson); } catch {}
                      return (
                      <div key={p.id} className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Pago en clínica solicitado</p>
                            <p className="text-xs text-gray-400">
                              {new Date(p.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-base font-black text-red-700">${(p.amountCents / 100).toFixed(2)}</p>
                            {p.cashbackPercent > 0 && (
                              <p className="text-[10px] text-green-600 font-semibold">+{p.cashbackPercent}% cashback</p>
                            )}
                          </div>
                        </div>
                        {/* Desglose de artículos del carrito */}
                        {parsedItems.length > 0 ? (
                          <div className="bg-white border border-red-100 rounded-lg px-3 py-2 space-y-1">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Artículos ({parsedItems.length})</p>
                            {parsedItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="text-gray-700 flex-1 min-w-0 pr-2">
                                  {item.qty && item.qty > 1 ? <span className="font-bold text-[#C5A55A] mr-1">{item.qty}×</span> : null}
                                  {item.name}
                                </span>
                                <span className="font-bold text-gray-900 whitespace-nowrap">${(item.priceCents / 100).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="border-t border-gray-100 pt-1 flex justify-between text-xs font-black">
                              <span className="text-gray-600">Total</span>
                              <span className="text-red-700">${(p.amountCents / 100).toFixed(2)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white border border-red-100 rounded-lg px-3 py-2">
                            <p className="text-sm font-bold text-gray-900">{p.concept}</p>
                          </div>
                        )}
                        {/* Desglose: saldo del monedero + efectivo a cobrar */}
                        {p.walletAmountUsedCents > 0 && (() => {
                          const cashCents = p.amountCents - p.walletAmountUsedCents;
                          return (
                            <div className="bg-white border border-amber-200 rounded-lg px-3 py-2 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Saldo monedero (descontar):</span>
                                <span className="font-bold text-[#C5A55A]">-${(p.walletAmountUsedCents / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500 font-bold">Cobrar en efectivo:</span>
                                <span className="font-black text-green-700 text-sm">${(cashCents / 100).toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        })()}
                        {p.notes && <p className="text-xs text-gray-500 italic">{p.notes}</p>}
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmCashMutation.mutate({ id: p.id })}
                            disabled={confirmCashMutation.isPending}
                            className="flex-1 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            {confirmCashMutation.isPending ? 'Confirmando...' : 'Confirmar pago'}
                          </button>
                          <button
                            onClick={() => cancelCashMutation.mutate({ id: p.id })}
                            disabled={cancelCashMutation.isPending}
                            className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300 disabled:opacity-50 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-center text-gray-400 mt-1">Sin pagos en clínica pendientes</p>
                )}

                {/* ─── Plan de Pagos a Plazos ─── */}
                <div className="mt-3 border border-blue-200 rounded-xl p-3 bg-gradient-to-br from-blue-50/60 to-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💳</span>
                      <span className="text-sm font-bold text-gray-800">Plan de Pagos a Plazos</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowInstallmentForm(!showInstallmentForm);
                        if (!showInstallmentForm) {
                          setSelectedPlanItems([]);
                          setLinkedCashPaymentId(null);
                          setInstallmentConcept("");
                          setInstallmentAmount("");
                        }
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {showInstallmentForm ? 'Cancelar' : '+ Crear plan'}
                    </button>
                  </div>

                  {showInstallmentForm && (() => {
                    // Artículos del pago pendiente en clínica (si hay alguno)
                    const pendingPayments = cashPendingQuery.data ?? [];
                    const hasPending = pendingPayments.length > 0;

                    // Obtener el pago vinculado
                    const linkedPayment: any = (hasPending && linkedCashPaymentId)
                      ? (pendingPayments.find((p: any) => p.id === linkedCashPaymentId) ?? null)
                      : null;

                    // Calcular allItems UNA SOLA VEZ — fallback a artículo único cuando itemsJson está vacío
                    let allItems: {name: string; priceCents: number}[] = [];
                    if (linkedPayment) {
                      try {
                        const parsed = JSON.parse(linkedPayment.itemsJson ?? '[]');
                        const mapped = parsed.map((it: any) => ({ name: it.name, priceCents: it.priceCents ?? Math.round((it.price ?? 0) * 100) }));
                        allItems = mapped.length > 0 ? mapped : [{ name: linkedPayment.concept, priceCents: linkedPayment.amountCents }];
                      } catch {
                        allItems = [{ name: linkedPayment.concept, priceCents: linkedPayment.amountCents }];
                      }
                    }

                    // Calcular el total de los artículos seleccionados para el plan
                    let selectedTotalCents = 0;
                    let planItemsForJson: {name: string; priceCents: number}[] = [];
                    let immediateItemNames: string[] = [];
                    let immediateAmountCents = 0; // artículos NO seleccionados para el plan

                    if (linkedPayment && allItems.length > 0) {
                      allItems.forEach((item, idx) => {
                        if (selectedPlanItems.includes(idx)) {
                          selectedTotalCents += item.priceCents;
                          planItemsForJson.push(item);
                        } else {
                          immediateAmountCents += item.priceCents;
                          immediateItemNames.push(item.name);
                        }
                      });
                    }

                    // REGLA ANTI-FRAUDE: 50% se paga de contado al crear el plan,
                    // el otro 50% se divide en cuotas con recargo
                    const downPaymentCents = Math.round(selectedTotalCents * 0.5);
                    const planAmountCents = selectedTotalCents - downPaymentCents; // 50% restante

                    let manualPlanAmountCents = 0;
                    if (!linkedPayment) {
                      // Modo manual: usar el monto escrito (ya es el total, se aplica 50/50)
                      const manualTotal = Math.round(parseFloat(installmentAmount || '0') * 100);
                      manualPlanAmountCents = Math.round(manualTotal * 0.5);
                    }

                    const effectivePlanAmountCents = linkedPayment ? planAmountCents : manualPlanAmountCents;
                    const effectiveDownPaymentCents = linkedPayment ? downPaymentCents : Math.round(parseFloat(installmentAmount || '0') * 50); // 50% del manual

                    const planAmount = effectivePlanAmountCents / 100;
                    const surcharge = installmentModalidad === 'quincenal' ? 0.10 : 0.15;
                    const planTotal = planAmount * (1 + surcharge);
                    const n = installmentModalidad === 'quincenal' ? 2 : 4;

                    return (
                      <div className="space-y-2 pt-1">
                        {/* PASO 1: Si hay pagos pendientes, seleccionar cuál vincular */}
                        {hasPending && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Pago pendiente a vincular</p>
                            {pendingPayments.map((p: any) => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setLinkedCashPaymentId(linkedCashPaymentId === p.id ? null : p.id);
                                  setSelectedPlanItems([]);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                                  linkedCashPaymentId === p.id
                                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-bold truncate pr-2">{p.concept.length > 30 ? p.concept.slice(0, 30) + '...' : p.concept}</span>
                                  <span className="font-black text-green-700 whitespace-nowrap">${(p.amountCents / 100).toFixed(2)}</span>
                                </div>
                                {linkedCashPaymentId === p.id && <span className="text-[9px] text-blue-600 font-semibold">✓ Seleccionado</span>}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* PASO 2: Si hay pago vinculado, mostrar checkboxes de artículos */}
                        {linkedPayment && allItems.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Selecciona qué va al plan de pagos</p>
                            {allItems.map((item, idx) => (
                              <label key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                                selectedPlanItems.includes(idx)
                                  ? 'border-blue-400 bg-blue-50'
                                  : 'border-gray-200 bg-white hover:border-blue-200'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={selectedPlanItems.includes(idx)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPlanItems(prev => [...prev, idx]);
                                    } else {
                                      setSelectedPlanItems(prev => prev.filter(i => i !== idx));
                                    }
                                  }}
                                  className="w-3.5 h-3.5 accent-blue-600 flex-shrink-0"
                                />
                                <span className="flex-1 text-xs font-medium text-gray-800">{item.name}</span>
                                <span className="text-xs font-black text-gray-700">${(item.priceCents / 100).toFixed(2)}</span>
                              </label>
                            ))}
                            {selectedPlanItems.length === 0 && (
                              <p className="text-[10px] text-orange-500 font-semibold px-1">⚠️ Selecciona al menos un artículo para el plan</p>
                            )}

                          </div>
                        )}

                        {/* PASO 3: Si no hay pago vinculado, modo manual */}
                        {(!hasPending || !linkedCashPaymentId) && (
                          <>
                            <input
                              type="text"
                              placeholder="Concepto (ej: Paquete Nutrición)"
                              value={installmentConcept}
                              onChange={(e) => setInstallmentConcept(e.target.value)}
                              className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <input
                              type="number"
                              placeholder="Monto total en pesos (ej: 3500)"
                              value={installmentAmount}
                              onChange={(e) => setInstallmentAmount(e.target.value)}
                              className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                          </>
                        )}

                        {/* Modalidad */}
                        <div className="flex gap-2">
                          {(['quincenal', 'semanal'] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setInstallmentModalidad(m)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                                installmentModalidad === m
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                              }`}
                            >
                              {m === 'quincenal' ? '📅 2 pagos quincenales (+10%)' : '📆 4 pagos semanales (+15%)'}
                            </button>
                          ))}
                        </div>

                        {/* Resumen del plan con regla 50/50 */}
                        {planAmount > 0 && (
                          <div className="space-y-1.5">
                            <div className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-xs text-amber-900">
                              <p className="font-bold text-amber-800 mb-1">💰 Pago al crear el plan (50% contado)</p>
                              <div className="flex justify-between">
                                <span>Enganche requerido hoy:</span>
                                <span className="font-black text-amber-700">${(effectiveDownPaymentCents / 100).toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800">
                              <p className="font-bold mb-1">📅 Resto a plazos (50% + recargo {surcharge * 100}%)</p>
                              <div className="flex justify-between">
                                <span>Subtotal a plazos:</span>
                                <span className="font-bold">${planAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Con recargo ({surcharge * 100}%):</span>
                                <span className="font-bold">${planTotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between border-t border-blue-200 mt-1 pt-1">
                                <span className="font-bold">{n} cuotas de:</span>
                                <span className="font-black text-blue-700">${(planTotal / n).toFixed(2)}</span>
                              </div>
                            </div>
                            {immediateAmountCents > 0 && (
                              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-[10px] text-green-800">
                                <span className="font-bold">✅ Artículos pagados de inmediato:</span> {immediateItemNames.join(', ')} — ${(immediateAmountCents / 100).toFixed(2)}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Botón crear */}
                        <button
                          onClick={() => {
                            // Validaciones
                            if (linkedCashPaymentId) {
                              if (selectedPlanItems.length === 0) { toast.error('Selecciona al menos un artículo para el plan'); return; }
                              if (effectivePlanAmountCents <= 0) { toast.error('El monto del plan debe ser mayor a 0'); return; }
                              const conceptForPlan = planItemsForJson.map(i => i.name).join(', ');
                              // immediateAmountCents aquí incluye artículos NO seleccionados + el enganche 50%
                              const totalImmediateCents = immediateAmountCents + effectiveDownPaymentCents;
                              const totalImmediateConcept = [
                                ...(immediateItemNames.length > 0 ? [`${immediateItemNames.join(', ')}`] : []),
                                `Enganche 50% (${conceptForPlan})`
                              ].join(', ');
                              installmentCreateMutation.mutate({
                                walletNumber,
                                concept: conceptForPlan,
                                originalAmount: effectivePlanAmountCents / 100,
                                modalidad: installmentModalidad,
                                adminEmail: 'admin@nutriser.com',
                                cashPaymentId: linkedCashPaymentId,
                                itemsJson: JSON.stringify(planItemsForJson),
                                immediateAmountCents: totalImmediateCents > 0 ? totalImmediateCents : undefined,
                                immediateConcept: totalImmediateCents > 0 ? totalImmediateConcept : undefined,
                                downPaymentCents: effectiveDownPaymentCents,
                              });
                            } else {
                              const amount = parseFloat(installmentAmount);
                              if (!installmentConcept.trim()) { toast.error('Ingresa el concepto'); return; }
                              if (!amount || amount <= 0) { toast.error('Ingresa un monto válido'); return; }
                              // Modo manual: 50% contado, 50% a plazos
                              const halfAmount = amount * 0.5;
                              installmentCreateMutation.mutate({
                                walletNumber,
                                concept: installmentConcept.trim(),
                                originalAmount: halfAmount, // solo el 50% va a plazos
                                modalidad: installmentModalidad,
                                adminEmail: 'admin@nutriser.com',
                                immediateAmountCents: Math.round(halfAmount * 100), // 50% contado
                                immediateConcept: `Enganche 50% (${installmentConcept.trim()})`,
                                downPaymentCents: Math.round(halfAmount * 100),
                              });
                            }
                          }}
                          disabled={installmentCreateMutation.isPending || (linkedCashPaymentId ? selectedPlanItems.length === 0 : false)}
                          className="w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                        >
                          {installmentCreateMutation.isPending ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Creando plan...</>
                          ) : (
                            <><CreditCard className="w-3 h-3" /> Crear Plan de Pagos</>
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* ─── Solicitudes de Promoción (Banner Interests) ─── */}
                {bannerInterestsAdminQuery.isLoading ? (
                  <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-amber-500" /></div>
                ) : patientBannerInterests.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏷️</span>
                      <span className="text-sm font-bold text-[#C5A55A]">Solicitudes de Promoción ({patientBannerInterests.length})</span>
                    </div>
                    {patientBannerInterests.map((interest: any) => (
                      <div key={interest.id} className="bg-amber-50 border border-[#C5A55A]/40 rounded-xl p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          {interest.bannerImageUrl && (
                            <div className="w-14 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                              <img src={interest.bannerImageUrl} alt={interest.bannerTitle || 'Promo'} className="w-full h-full object-contain" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{interest.bannerTitle || 'Promoción Nutriser'}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(interest.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <span className="flex-shrink-0 bg-[#C5A55A]/20 text-[#C5A55A] text-[10px] font-bold px-2 py-0.5 rounded-full">Pendiente</span>
                        </div>
                        {/* Campo de monto */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Monto a acreditar (MXN)</label>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-sm font-bold text-gray-500">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={bannerAmounts[interest.id] || ''}
                                onChange={(e) => setBannerAmounts(prev => ({ ...prev, [interest.id]: e.target.value }))}
                                className="flex-1 border border-[#C5A55A]/40 rounded-lg px-2 py-1.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/50 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const amountPesos = parseFloat(bannerAmounts[interest.id] || '0');
                              if (!amountPesos || amountPesos <= 0) {
                                toast.error('Ingresa un monto válido para acreditar.');
                                return;
                              }
                              attendBannerMutation.mutate({
                                interestId: interest.id,
                                walletId: walletIdForCash!,
                                amount: Math.round(amountPesos * 100),
                                concept: `Promoción: ${interest.bannerTitle || 'Banner Nutriser'}`,
                                adminNotes: 'Acreditado en clínica',
                              });
                            }}
                            disabled={attendBannerMutation.isPending || deleteBannerMutation.isPending}
                            className="flex-1 py-2 rounded-lg bg-[#C5A55A] text-white text-xs font-bold hover:bg-[#b8963f] disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                          >
                            {attendBannerMutation.isPending ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Acreditando...</>
                            ) : (
                              <><Check className="w-3 h-3" /> Acreditar</>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar esta solicitud de promoción? Esta acción no se puede deshacer.')) {
                                deleteBannerMutation.mutate({ interestId: interest.id });
                              }
                            }}
                            disabled={deleteBannerMutation.isPending || attendBannerMutation.isPending}
                            className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                            title="Eliminar solicitud"
                          >
                            {deleteBannerMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-center text-gray-400 mt-1">Sin solicitudes de promoción pendientes</p>
                )}

                {/* ─── Compras en Línea (aprobadas y pendientes) ─── */}
                {onlinePurchasesQuery.isLoading ? (
                  <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-[#C5A55A]" /></div>
                ) : (() => {
                  const purchases = onlinePurchasesQuery.data;
                  if (!purchases) return null;
                  const services = (purchases.services || []).filter((s: any) => s.status !== 'rejected');
                  const products = (purchases.products || []).filter((p: any) => p.status !== 'rejected');
                  const packages = (purchases.packages || []).filter((m: any) => m.status !== 'rejected');
                  const ebooks = (purchases.ebooks || []).filter((e: any) => e.status !== 'rejected');
                  const total = services.length + products.length + packages.length + ebooks.length;
                  if (total === 0) return null;
                  const statusBadge = (status: string) => (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      status === 'approved' || status === 'verified' ? 'bg-green-100 text-green-700' :
                      status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {status === 'approved' || status === 'verified' ? '✓ Aprobado' : status === 'pending' ? '⏳ Pendiente' : status}
                    </span>
                  );
                  return (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🛒</span>
                        <span className="text-sm font-bold text-gray-800">Compras en Línea ({total})</span>
                      </div>
                      {services.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Servicios</p>
                          <div className="space-y-1.5">
                            {services.map((s: any) => (
                              <div key={s.id} className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate">{s.serviceName}</p>
                                  <p className="text-[10px] text-gray-400">{new Date(s.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                                {statusBadge(s.status)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {products.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Productos</p>
                          <div className="space-y-1.5">
                            {products.map((p: any) => (
                              <div key={p.id} className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate">{p.productName} {p.quantity > 1 ? `×${p.quantity}` : ''}</p>
                                  <p className="text-[10px] text-gray-400">{new Date(p.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                                {statusBadge(p.status)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {packages.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Paquetes / Membresías</p>
                          <div className="space-y-1.5">
                            {packages.map((m: any) => (
                              <div key={m.id} className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate">{m.membershipName || m.name || 'Paquete'}</p>
                                  <p className="text-[10px] text-gray-400">{new Date(m.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                                {statusBadge(m.status)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {ebooks.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Librería / Ebooks</p>
                          <div className="space-y-1.5">
                            {ebooks.map((e: any) => (
                              <div key={e.id} className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate">{e.ebookTitle || 'Ebook'}</p>
                                  <p className="text-[10px] text-gray-400">{new Date(e.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                                {statusBadge(e.status)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ─── Historial de Compras del Paciente (Admin puede borrar) ─── */}
                {patientPurchaseHistoryQuery.data && patientPurchaseHistoryQuery.data.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🧾</span>
                      <span className="text-sm font-bold text-gray-800">Historial de Compras ({patientPurchaseHistoryQuery.data.length})</span>
                    </div>
                    {patientPurchaseHistoryQuery.data.map((p: any) => (
                      <div key={p.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{p.concept}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(p.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              p.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>{p.status === 'confirmed' ? 'Confirmado' : p.status === 'pending' ? 'Pendiente' : 'Cancelado'}</span>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <p className="text-base font-black text-gray-800">${(p.amountCents / 100).toFixed(2)}</p>
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar la compra "${p.concept}" del historial? Esta acción no se puede deshacer.`)) {
                                  deletePurchaseMutation.mutate({ id: p.id });
                                }
                              }}
                              disabled={deletePurchaseMutation.isPending}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-all"
                              title="Eliminar compra"
                            >
                              {deletePurchaseMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── Gestión de Descuento del Monedero ─── */}
                <div className="mt-3 border border-[#C5A55A]/30 rounded-xl p-3 bg-gradient-to-br from-amber-50/60 to-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏷️</span>
                      <span className="text-sm font-bold text-gray-800">Descuento del Monedero</span>
                    </div>
                    {patientQuery.data?.discountPercent ? (
                      <span className="bg-[#C5A55A] text-white text-xs font-black px-2.5 py-1 rounded-full">
                        {patientQuery.data.discountPercent}% ACTIVO
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                        Sin descuento
                      </span>
                    )}
                  </div>

                  {patientQuery.data?.discountPercent ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">
                        Activado el {patientQuery.data.discountActivatedAt
                          ? new Date(patientQuery.data.discountActivatedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </p>
                      <button
                        onClick={() => openSecurityModal(
                          'Quitar Descuento',
                          `¿Quitar el descuento del ${patientQuery.data?.discountPercent}% del monedero de ${patientQuery.data?.patientName}?`,
                          (pw) => removeDiscountMutation.mutate({ walletNumber, adminPassword: pw })
                        )}
                        disabled={removeDiscountMutation.isPending}
                        className="w-full py-2 rounded-lg bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                      >
                        {removeDiscountMutation.isPending ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Quitando...</>
                        ) : (
                          <><X className="w-3 h-3" /> Quitar descuento</>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Seleccionar descuento</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {([10, 15, 20, 25, 30] as const).map((pct) => (
                          <button
                            key={pct}
                            onClick={() => setSelectedDiscount(selectedDiscount === pct ? null : pct)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              selectedDiscount === pct
                                ? 'bg-[#C5A55A] text-white border-[#C5A55A]'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#C5A55A]'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                      {selectedDiscount && (
                        <button
                          onClick={() => openSecurityModal(
                            'Activar Descuento',
                            `¿Activar un descuento del ${selectedDiscount}% al monedero de ${patientQuery.data?.patientName}?`,
                            (pw) => setDiscountMutation.mutate({ walletNumber, discountPercent: selectedDiscount!, adminPassword: pw })
                          )}
                          disabled={setDiscountMutation.isPending}
                          className="w-full py-2 rounded-lg bg-[#C5A55A] text-white text-xs font-bold hover:bg-[#b8963f] disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                        >
                          {setDiscountMutation.isPending ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Activando...</>
                          ) : (
                            <><Check className="w-3 h-3" /> Activar {selectedDiscount}% de descuento</>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                 </div>

                {/* ─── Planes de Pago Activos del Paciente ─── */}
                <PatientInstallmentPlans walletNumber={walletNumber} />

                {/* ─── Administración del Monedero (Reiniciar / Dar de Baja / Alta) ─── */}
                <div className="mt-3 border border-red-200 rounded-xl p-3 bg-gradient-to-br from-red-50/60 to-white space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">⚠️</span>
                    <span className="text-sm font-bold text-gray-800">Administración del Monedero</span>
                  </div>

                  {/* Dar de Baja / Alta */}
                  {patientQuery.data?.isActive ? (
                    <button
                      onClick={() => openSecurityModal(
                        'Dar de Baja',
                        `¿Suspender el monedero de ${patientQuery.data?.patientName}? El paciente no podrá usarlo hasta que lo reactives.`,
                        (pw) => suspendWalletMutation.mutate({ walletNumber, adminPassword: pw })
                      )}
                      disabled={suspendWalletMutation.isPending}
                      className="w-full py-2 rounded-lg bg-orange-100 text-orange-700 text-xs font-bold hover:bg-orange-200 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                    >
                      {suspendWalletMutation.isPending ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Procesando...</>
                      ) : (
                        <><X className="w-3 h-3" /> Dar de Baja (Suspender Monedero)</>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => openSecurityModal(
                        'Dar de Alta',
                        `¿Reactivar el monedero de ${patientQuery.data?.patientName}?`,
                        (pw) => unsuspendWalletMutation.mutate({ walletNumber, adminPassword: pw })
                      )}
                      disabled={unsuspendWalletMutation.isPending}
                      className="w-full py-2 rounded-lg bg-green-100 text-green-700 text-xs font-bold hover:bg-green-200 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                    >
                      {unsuspendWalletMutation.isPending ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Reactivando...</>
                      ) : (
                        <><Check className="w-3 h-3" /> Dar de Alta (Reactivar Monedero)</>
                      )}
                    </button>
                  )}

                  {/* ─── Deuda activa ─── */}
                  {activeDebtNotifs.length > 0 && (
                    <div className="bg-red-50 border border-red-300 rounded-lg p-2 space-y-1.5">
                      <p className="text-[10px] font-bold text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Deuda activa ({activeDebtNotifs.length} notificación{activeDebtNotifs.length > 1 ? 'es' : ''} de cobro)
                      </p>
                      {activeDebtNotifs.map((n: any) => (
                        <p key={n.id} className="text-[9px] text-red-600 truncate">• {n.title}: {n.message}</p>
                      ))}
                      <button
                        onClick={() => openSecurityModal(
                          '❌ Quitar Deuda Activa',
                          `¿Eliminar la deuda de ${patientQuery.data?.patientName}? Esto borrará las notificaciones de cobro y el paciente podrá comprar normalmente.`,
                          (pw) => {
                            // Verificar la contraseña en el servidor (el modal ya la valida)
                            if (walletIdForCash) clearDebtMutation.mutate({ walletId: walletIdForCash });
                          }
                        )}
                        disabled={clearDebtMutation.isPending}
                        className="w-full py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                      >
                        {clearDebtMutation.isPending ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Eliminando...</>
                        ) : (
                          <>❌ Quitar Deuda Activa</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Reiniciar Monedero: disponible solo desde la tarjeta en el panel de Tarjetas */}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
      {/* ═══ STEP 3: Seleccionar Servicio/Producto ═══ */}
      {step === "select" && (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setStep("patient")} className="text-gray-500">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </Button>

          <p className="text-sm font-bold text-gray-700">
            ¿Qué compró <span className="text-[#C5A55A]">{patientQuery.data?.patientName}</span>?
          </p>

          {/* Paquetes */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
              <Package className="w-3 h-3" /> Paquetes
            </p>
            <div className="grid grid-cols-1 gap-2">
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handleSelectItem("package", pkg.name, pkg.price)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#C5A55A] hover:bg-amber-50 transition text-left"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{pkg.name}</p>
                    <p className="text-xs text-[#C5A55A] font-bold">${(pkg.price / 100).toLocaleString()} MXN</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Servicios */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Tratamientos / Servicios
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {servicesQuery.isLoading ? (
                <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
              ) : (
                (servicesQuery.data || []).map((svc: any) => {
                  const priceNum = parseFloat(svc.price?.replace(/[^0-9.]/g, "") || "0");
                  return (
                    <button
                      key={svc.id}
                      onClick={() => handleSelectItem("service", svc.name, Math.round(priceNum * 100))}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#C5A55A] hover:bg-amber-50 transition text-left"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{svc.name}</p>
                        <p className="text-xs text-[#C5A55A] font-bold">
                          {priceNum > 0 ? `$${priceNum.toLocaleString()} MXN` : "Consultar precio"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Productos de Farmacia */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" /> Productos Farmacy
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {productsQuery.isLoading ? (
                <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
              ) : (
                (productsQuery.data || []).map((prod: any) => {
                  const priceNum = parseFloat(prod.price?.replace(/[^0-9.]/g, "") || "0");
                  return (
                    <button
                      key={prod.id}
                      onClick={() => handleSelectItem("product", prod.name, Math.round(priceNum * 100))}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#C5A55A] hover:bg-amber-50 transition text-left"
                    >
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{prod.name}</p>
                        <p className="text-xs text-[#C5A55A] font-bold">
                          {priceNum > 0 ? `$${priceNum.toLocaleString()} MXN` : "Sin precio"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 4: Confirmar ═══ */}
      {step === "confirm" && selectedItem && (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setStep("select")} className="text-gray-500">
            <ArrowLeft className="w-4 h-4 mr-1" /> Cambiar artículo
          </Button>

          <Card className="border-[#C5A55A]/30">
            <CardContent className="p-4 space-y-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">Registrar compra para</p>
                <p className="font-bold text-lg text-gray-900">{patientQuery.data?.patientName}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Artículo</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedItem.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Tipo</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold uppercase">
                    {selectedItem.type === "service" ? "Tratamiento" : selectedItem.type === "package" ? "Paquete" : "Producto"}
                  </span>
                </div>
              </div>

              {/* Precio editable */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  <DollarSign className="w-3 h-3 inline" /> Precio cobrado (MXN)
                </label>
                <Input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="0.00"
                  className="text-lg font-bold text-center"
                />
              </div>

              {/* Saldo del monedero a usar */}
              {(patientQuery.data?.balance ?? 0) > 0 && (
                <div className="bg-amber-50 border border-[#C5A55A]/30 rounded-xl p-3 space-y-2">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-[#C5A55A]" /> Usar saldo del monedero
                  </label>
                  <p className="text-xs text-gray-500">Disponible: <span className="font-bold text-[#C5A55A]">${((patientQuery.data?.balance ?? 0) / 100).toFixed(2)} MXN</span></p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">$</span>
                    <Input
                      type="number"
                      value={walletAmountToUse}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value || "0");
                        const maxPesos = (patientQuery.data?.balance ?? 0) / 100;
                        const price = parseFloat(customPrice || "0");
                        setWalletAmountToUse(String(Math.min(val, maxPesos, price)));
                      }}
                      placeholder="0"
                      min="0"
                      max={Math.min((patientQuery.data?.balance ?? 0) / 100, parseFloat(customPrice || "0"))}
                      step="0.01"
                      className="text-center font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const maxPesos = (patientQuery.data?.balance ?? 0) / 100;
                        const price = parseFloat(customPrice || "0");
                        setWalletAmountToUse(String(Math.min(maxPesos, price)));
                      }}
                      className="text-xs text-[#C5A55A] font-bold whitespace-nowrap hover:underline"
                    >
                      Usar todo
                    </button>
                  </div>
                  {parseFloat(walletAmountToUse) > 0 && parseFloat(customPrice) > 0 && (
                    <div className="text-xs space-y-1 pt-1 border-t border-[#C5A55A]/20">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Monedero:</span>
                        <span className="font-bold text-[#C5A55A]">-${parseFloat(walletAmountToUse).toFixed(2)} MXN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Efectivo/transferencia:</span>
                        <span className="font-bold text-green-700">${Math.max(0, parseFloat(customPrice) - parseFloat(walletAmountToUse)).toFixed(2)} MXN</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cashback % */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  <Wallet className="w-3 h-3 inline" /> Cashback (%)
                </label>
                <Input
                  type="number"
                  value={cashbackPercent}
                  onChange={(e) => setCashbackPercent(e.target.value)}
                  placeholder="2"
                  min="0"
                  max="100"
                  className="text-center"
                />
              </div>

              {/* Preview cashback */}
              {parseFloat(customPrice) > 0 && parseFloat(cashbackPercent) > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-green-600">Cashback que se acreditará</p>
                  <p className="text-2xl font-black text-green-700">
                    +${((parseFloat(customPrice) * parseFloat(cashbackPercent)) / 100).toFixed(2)} MXN
                  </p>
                </div>
              )}

              {/* Notas */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Notas (opcional)</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Pago en efectivo, sesión 2 de 4..."
                  className="text-sm"
                />
              </div>

              <Button
                onClick={handleConfirm}
                disabled={registerMutation.isPending || !parseFloat(customPrice)}
                className="w-full bg-[#C5A55A] hover:bg-[#b8963f] text-white gap-2 h-12 text-base"
              >
                {registerMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                Confirmar y Acreditar Cashback
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ STEP 5: Completado ═══ */}
      {step === "done" && registerMutation.data && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-green-700">¡Compra Registrada!</h3>
              <p className="text-sm text-gray-600 font-semibold mt-1">{registerMutation.data.patientName}</p>
            </div>
            <div className="bg-white rounded-xl p-3 space-y-2 text-sm border border-green-100">
              {registerMutation.data.walletDeducted > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Monedero usado:</span>
                  <span className="font-bold text-[#C5A55A]">-${(registerMutation.data.walletDeducted / 100).toFixed(2)} MXN</span>
                </div>
              )}
              {registerMutation.data.efectivoPagado > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Efectivo/transferencia:</span>
                  <span className="font-bold text-gray-700">${(registerMutation.data.efectivoPagado / 100).toFixed(2)} MXN</span>
                </div>
              )}
              {registerMutation.data.cashbackAmount > 0 && (
                <div className="flex justify-between border-t border-green-100 pt-2">
                  <span className="text-gray-500">Cashback acreditado:</span>
                  <span className="font-bold text-green-600">+${(registerMutation.data.cashbackAmount / 100).toFixed(2)} MXN</span>
                </div>
              )}
              <div className="flex justify-between border-t border-green-100 pt-2">
                <span className="text-gray-500">Nuevo saldo monedero:</span>
                <span className="font-black text-[#C5A55A]">${(registerMutation.data.newBalance / 100).toFixed(2)} MXN</span>
              </div>
            </div>
            <Button
              onClick={handleReset}
              className="bg-[#C5A55A] hover:bg-[#b8963f] text-white gap-2"
            >
              <QrCode className="w-4 h-4" />
              Escanear otro QR
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente interno para ingresar la contraseña de seguridad
function SecurityPasswordInputInline({ onConfirm, onCancel }: { onConfirm: (pw: string) => void; onCancel: () => void }) {
  const [password, setPassword] = useState("");
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Contraseña de seguridad</label>
        <Input
          type="password"
          placeholder="Ingresa la contraseña..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && password.trim() && onConfirm(password.trim())}
          autoFocus
        />
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button
          size="sm"
          disabled={!password.trim()}
          onClick={() => { if (password.trim()) onConfirm(password.trim()); }}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Confirmar
        </Button>
      </DialogFooter>
    </div>
  );
}

// ─── Componente: Planes de Pago Activos del Paciente (vista admin) ─────────
function PatientInstallmentPlans({ walletNumber }: { walletNumber: string }) {
  const utils = trpc.useUtils();
  const plansQuery = trpc.installments.getMyPlans.useQuery(
    { walletNumber },
    { enabled: !!walletNumber }
  );

  const confirmPaymentMutation = trpc.installments.confirmPayment.useMutation({
    onSuccess: () => {
      toast.success('✅ Cuota registrada como pagada.');
      utils.installments.getMyPlans.invalidate({ walletNumber });
    },
    onError: (e) => toast.error('Error al registrar cuota: ' + e.message),
  });

  const plans = plansQuery.data ?? [];
  const activePlans = plans.filter((p: any) => p.status === 'active');

  if (plansQuery.isLoading) {
    return (
      <div className="mt-3 border border-indigo-200 rounded-xl p-3 bg-indigo-50/40">
        <div className="flex items-center gap-2 text-indigo-600 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Cargando planes de pago...</span>
        </div>
      </div>
    );
  }

  if (activePlans.length === 0) return null;

  return (
    <div className="mt-3 border border-indigo-200 rounded-xl p-3 bg-gradient-to-br from-indigo-50/60 to-white space-y-3">
      <div className="flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-bold text-gray-800">Planes de Pago Activos ({activePlans.length})</span>
      </div>

      {activePlans.map((plan: any) => {
        const paidInstallments = plan.paidInstallments ?? 0;
        const totalInstallments = plan.totalInstallments ?? 0;
        const totalAmountCents = plan.totalAmountCents ?? 0;
        const paidAmountCents = totalInstallments > 0
          ? Math.round((paidInstallments / totalInstallments) * totalAmountCents)
          : 0;
        const pendingAmountCents = totalAmountCents - paidAmountCents;
        const perInstallmentCents = totalInstallments > 0
          ? Math.round(totalAmountCents / totalInstallments)
          : 0;
        const progressPct = totalInstallments > 0
          ? Math.round((paidInstallments / totalInstallments) * 100)
          : 0;

        // Artículos del plan
        let planItems: { name: string; priceCents: number }[] = [];
        try {
          if (plan.itemsJson) planItems = JSON.parse(plan.itemsJson);
        } catch {}

        // Pagos pendientes (cuotas no pagadas)
        const pendingPayments = (plan.payments ?? []).filter((p: any) => p.status === 'pending');
        const nextPayment = pendingPayments[0];

        return (
          <div key={plan.id} className="border border-indigo-100 rounded-lg p-3 bg-white space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-gray-800">{plan.concept}</p>
                <p className="text-xs text-gray-500 capitalize">
                  Pagos {plan.modalidad === 'quincenal' ? 'quincenales' : 'semanales'}
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                Activo
              </span>
            </div>

            {/* Artículos incluidos en el plan */}
            {planItems.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Artículos en plan:</p>
                {planItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-semibold text-gray-800">${(item.priceCents / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Barra de progreso */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{paidInstallments} de {totalInstallments} cuotas pagadas</span>
                <span className="font-bold text-indigo-600">{progressPct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Montos */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Pagado</p>
                <p className="text-sm font-bold text-green-700">${(paidAmountCents / 100).toFixed(2)}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Pendiente</p>
                <p className="text-sm font-bold text-red-600">${(pendingAmountCents / 100).toFixed(2)}</p>
              </div>
            </div>

            {/* Próxima cuota y botón registrar */}
            {nextPayment && (
              <div className="border border-amber-200 rounded-lg p-2 bg-amber-50">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-amber-700">Próxima cuota</p>
                    <p className="text-sm font-bold text-gray-800">${(perInstallmentCents / 100).toFixed(2)}</p>
                    {nextPayment.dueDate && (
                      <p className="text-xs text-gray-500">
                        Vence: {new Date(nextPayment.dueDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`¿Registrar pago de cuota $${(perInstallmentCents / 100).toFixed(2)} para "${plan.concept}"?`)) {
                        confirmPaymentMutation.mutate({
                          paymentId: nextPayment.id,
                          adminEmail: 'admin@nutriser.com',
                        });
                      }
                    }}
                    disabled={confirmPaymentMutation.isPending}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                  >
                    {confirmPaymentMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    Registrar pago
                  </button>
                </div>
              </div>
            )}

            {/* Historial de cuotas pagadas */}
            {paidInstallments > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cuotas pagadas:</p>
                {(plan.payments ?? [])
                  .filter((p: any) => p.status === 'paid')
                  .map((p: any, idx: number) => (
                    <div key={p.id} className="flex justify-between text-xs bg-green-50 rounded px-2 py-1">
                      <span className="text-gray-600">Cuota #{idx + 1}</span>
                      <span className="font-semibold text-green-700">
                        ${(perInstallmentCents / 100).toFixed(2)} — {p.paidAt ? new Date(p.paidAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : 'Pagado'}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
