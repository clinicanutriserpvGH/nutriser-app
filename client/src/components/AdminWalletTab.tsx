/**
 * AdminWalletTab — Panel de administración del Monedero Nutriser
 * Permite: ver todas las tarjetas, acreditar saldo, ver movimientos,
 * gestionar planes de lealtad por producto, registrar consultas,
 * enviar notificaciones admin→paciente, y gestión avanzada del monedero.
 */
import { useState, useMemo, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search, Plus, Minus, CreditCard,
  Gift, Star, ChevronDown, ChevronUp, Loader2,
  DollarSign, Users, Award, Trash2, Calendar, QrCode, Printer, CheckSquare, Square, PrinterCheck, History, AlertTriangle, Bell, Send, Image, X,
} from "lucide-react";

import AdminQRScanner from "./AdminQRScanner";
import { WalletCard as WalletCardPrint, WalletCardPrintSheet } from "./WalletCardPrint";
import { generateWalletPdf } from "@/lib/generateWalletPdfClient";

type SubTab = "wallets" | "loyalty" | "plans" | "qrscan" | "printCards" | "requests";

// ─── Modal de contraseña de seguridad ────────────────────────────────────────
function SecurityModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title: string;
  description?: string;
  isPending?: boolean;
}) {
  const [password, setPassword] = useState("");
  const handleSubmit = () => {
    if (!password.trim()) { toast.error("Ingresa la contraseña de seguridad"); return; }
    onConfirm(password.trim());
    setPassword("");
  };
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setPassword(""); onClose(); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600">Contraseña de seguridad</label>
          <Input
            type="password"
            placeholder="Ingresa la contraseña..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => { setPassword(""); onClose(); }}>Cancelar</Button>
          <Button
            size="sm"
            disabled={!password.trim() || isPending}
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminWalletTab() {
  const [subTab, setSubTab] = useState<SubTab>("wallets");
  const [search, setSearch] = useState("");
  const [printSearch, setPrintSearch] = useState("");
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [printMode, setPrintMode] = useState<"single" | "sheet">("sheet");

  // ─── Queries ─────────────────────────────────────────────────────
  const walletsQuery = trpc.wallet.adminListAll.useQuery();
  const plansQuery = trpc.wallet.adminListPlans.useQuery();
  const utils = trpc.useUtils();

  // ─── Mutations ───────────────────────────────────────────────────
  const cashbackMutation = trpc.wallet.adminAddCashback.useMutation({
    onSuccess: () => { toast.success("Saldo acreditado"); utils.wallet.adminListAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const bonusMutation = trpc.wallet.adminAddBonus.useMutation({
    onSuccess: () => { toast.success("Ajuste aplicado"); utils.wallet.adminListAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const createPlanMutation = trpc.wallet.adminCreatePlan.useMutation({
    onSuccess: () => { toast.success("Plan creado"); utils.wallet.adminListPlans.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deletePlanMutation = trpc.wallet.adminDeletePlan.useMutation({
    onSuccess: () => { toast.success("Plan eliminado"); utils.wallet.adminListPlans.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const recordConsultationMutation = trpc.wallet.adminRecordConsultation.useMutation({
    onSuccess: (data) => {
      toast.success(data.freeEarned ? "¡Consulta GRATIS ganada!" : "Consulta registrada");
      utils.wallet.adminListAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const recordLoyaltyMutation = trpc.wallet.adminRecordLoyaltyPurchase.useMutation({
    onSuccess: (data) => {
      toast.success(data.rewardEarned ? "¡Recompensa GRATIS ganada!" : "Compra registrada en plan");
      utils.wallet.adminListAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const wallets = walletsQuery.data || [];
  const plans = plansQuery.data || [];

  const filteredWallets = useMemo(() => {
    if (!search.trim()) return wallets;
    const q = search.toLowerCase();
    return wallets.filter((w: any) =>
      w.patientName?.toLowerCase().includes(q) ||
      w.walletNumber?.toLowerCase().includes(q) ||
      w.patientEmail?.toLowerCase().includes(q)
    );
  }, [wallets, search]);

  // ─── Stats ───────────────────────────────────────────────────────
  const totalBalance = wallets.reduce((s: number, w: any) => s + (w.balance || 0), 0);
  const activeWallets = wallets.filter((w: any) => w.status === "active").length;

  // ─── Pending security action state ───────────────────────────────
  const [securityModal, setSecurityModal] = useState<{
    open: boolean;
    title: string;
    description?: string;
    onConfirm: (password: string) => void;
    isPending?: boolean;
  }>({ open: false, title: "", onConfirm: () => {} });

  const openSecurityModal = (title: string, description: string, onConfirm: (password: string) => void, isPending?: boolean) => {
    setSecurityModal({ open: true, title, description, onConfirm, isPending });
  };
  const closeSecurityModal = () => setSecurityModal(prev => ({ ...prev, open: false }));

  return (
    <div className="space-y-4">
      {/* Security Modal */}
      <SecurityModal
        open={securityModal.open}
        onClose={closeSecurityModal}
        onConfirm={(pw) => { securityModal.onConfirm(pw); closeSecurityModal(); }}
        title={securityModal.title}
        description={securityModal.description}
        isPending={securityModal.isPending}
      />

      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-3 text-center">
            <CreditCard className="w-5 h-5 text-[#C5A55A] mx-auto mb-1" />
            <p className="text-xl font-black text-[#C5A55A]">{wallets.length}</p>
            <p className="text-[10px] text-gray-500 uppercase">Tarjetas</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-black text-green-600">{activeWallets}</p>
            <p className="text-[10px] text-gray-500 uppercase">Activas</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3 text-center">
            <DollarSign className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-black text-blue-600">${(totalBalance / 100).toFixed(2)}</p>
            <p className="text-[10px] text-gray-500 uppercase">Saldo Total</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-3 text-center">
            <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xl font-black text-purple-600">{plans.length}</p>
            <p className="text-[10px] text-gray-500 uppercase">Planes</p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs — Grid 2x3 para fácil uso en móvil */}
      <div className="grid grid-cols-3 gap-2 pb-2">
        {([
          { key: "qrscan" as SubTab, label: "Escanear QR", icon: QrCode },
          { key: "wallets" as SubTab, label: "Tarjetas", icon: CreditCard },
          { key: "printCards" as SubTab, label: "Imprimir", icon: Printer },
          { key: "requests" as SubTab, label: "Solicitudes", icon: Calendar },
          { key: "loyalty" as SubTab, label: "Lealtad", icon: Star },
          { key: "plans" as SubTab, label: "Planes", icon: Gift },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-semibold transition ${
              subTab === key
                ? "bg-[#C5A55A] text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="leading-tight text-center">{label}</span>
          </button>
        ))}
      </div>

      {/* ═══ SUB-TAB: Escanear QR ═══ */}
      {subTab === "qrscan" && <AdminQRScanner />}

      {/* ═══ SUB-TAB: Solicitudes de Tarjeta Física ═══ */}
      {subTab === "requests" && <PhysicalCardRequestsTab />}

      {/* ═══ SUB-TAB: Imprimir Tarjetas ═══ */}
      {subTab === "printCards" && (
        <PrintCardsTab
          wallets={wallets}
          isLoading={walletsQuery.isLoading}
          search={printSearch}
          setSearch={setPrintSearch}
          selectedCards={selectedCards}
          setSelectedCards={setSelectedCards}
          printMode={printMode}
          setPrintMode={setPrintMode}
        />
      )}

      {/* ═══ SUB-TAB: Tarjetas ═══ */}
      {subTab === "wallets" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, correo o número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {walletsQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#C5A55A]" />
            </div>
          ) : filteredWallets.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No se encontraron tarjetas</p>
          ) : (
            <div className="space-y-2">
              {filteredWallets.map((w: any) => (
                <WalletCard
                  key={w.id}
                  wallet={w}
                  onCredit={(amount, desc, password) => cashbackMutation.mutate({
                    walletId: w.id, amount, description: desc, adminPassword: password,
                  })}
                  onDebit={(amount, desc, password) => bonusMutation.mutate({
                    walletId: w.id, amount: -amount, description: desc, adminPassword: password,
                  })}
                  isLoading={cashbackMutation.isPending || bonusMutation.isPending}
                  openSecurityModal={openSecurityModal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ SUB-TAB: Registrar Lealtad ═══ */}
      {subTab === "loyalty" && (
        <LoyaltyRegistration
          wallets={wallets}
          plans={plans}
          onRegisterConsultation={(walletId) => recordConsultationMutation.mutate({ walletId })}
          onRegisterProductPurchase={(walletId, planId) => recordLoyaltyMutation.mutate({ walletId, planId })}
          isLoading={recordConsultationMutation.isPending || recordLoyaltyMutation.isPending}
        />
      )}

      {/* ═══ SUB-TAB: Planes de Producto ═══ */}
      {subTab === "plans" && (
        <PlansManager
          plans={plans}
          onCreate={(data) => createPlanMutation.mutate(data)}
          onDelete={(id) => deletePlanMutation.mutate({ id })}
          isLoading={createPlanMutation.isPending || deletePlanMutation.isPending}
        />
      )}
    </div>
  );
}

// ─── Wallet Card ─────────────────────────────────────────────────────────────
function WalletCard({ wallet, onCredit, onDebit, isLoading, openSecurityModal }: {
  wallet: any;
  onCredit: (amount: number, desc: string, password: string) => void;
  onDebit: (amount: number, desc: string, password: string) => void;
  isLoading: boolean;
  openSecurityModal: (title: string, description: string, onConfirm: (password: string) => void, isPending?: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDesc, setCreditDesc] = useState("");
  const [debitAmount, setDebitAmount] = useState("");
  const [debitDesc, setDebitDesc] = useState("");
  const [showTransactions, setShowTransactions] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [showPurchases, setShowPurchases] = useState(false);
  const [discountValue, setDiscountValue] = useState<10|15|20|25|30>(10);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [editingNotif, setEditingNotif] = useState<any | null>(null);
  const [showNotifHistory, setShowNotifHistory] = useState(false);
  const utils = trpc.useUtils();

  const notifsQuery = trpc.adminNotifs.getByWalletId.useQuery(
    { walletId: wallet.id }
  );
  const deleteNotifMutation = trpc.adminNotifs.deleteNotif.useMutation({
    onSuccess: () => { notifsQuery.refetch(); toast.success('Notificación eliminada'); },
    onError: (e) => toast.error('Error: ' + e.message),
  });
  const deleteAllNotifsMutation = trpc.adminNotifs.deleteAllNotifs.useMutation({
    onSuccess: () => { notifsQuery.refetch(); toast.success('Todas las notificaciones eliminadas'); },
    onError: (e) => toast.error('Error: ' + e.message),
  });
  // Query siempre activa para detectar deudas del monedero
  const activeNotifsQuery = trpc.adminNotifs.getByWalletId.useQuery({ walletId: wallet.id });
  const activeDebtNotifs = (activeNotifsQuery.data || []).filter((n: any) => n.type === 'cobro');
  const clearDebtMutation = trpc.adminNotifs.clearDebt.useMutation({
    onSuccess: (data) => {
      if (data.deleted > 0) {
        toast.success(`✅ Deuda eliminada. El paciente ya puede comprar normalmente.`);
      } else {
        toast.info('Este paciente no tiene deuda activa.');
      }
      activeNotifsQuery.refetch();
      notifsQuery.refetch();
    },
    onError: (e) => toast.error('Error al eliminar deuda: ' + e.message),
  });

  const transactionsQuery = trpc.wallet.adminGetTransactions.useQuery(
    { walletId: wallet.id },
    { enabled: showTransactions }
  );
  const cashPaymentsHistoryQuery = trpc.cashPayments.getMyHistory.useQuery(
    { walletId: wallet.id },
    { enabled: showPurchases }
  );
  const installmentPlansQuery = trpc.installments.getMyPlans.useQuery(
    { walletNumber: wallet.walletNumber },
    { enabled: showPurchases }
  );
  const deleteTransactionMutation = trpc.wallet.adminDeleteTransaction.useMutation({
    onSuccess: () => { toast.success("Movimiento eliminado"); transactionsQuery.refetch(); utils.wallet.adminListAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const clearAllTransactionsMutation = trpc.wallet.adminClearAllTransactions.useMutation({
    onSuccess: (data) => { toast.success(`Historial limpiado (${data.deleted} movimientos)`); setConfirmClearAll(false); transactionsQuery.refetch(); utils.wallet.adminListAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteCashPaymentMutation = trpc.cashPayments.adminDelete.useMutation({
    onSuccess: () => { toast.success('Pago eliminado'); cashPaymentsHistoryQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const clearAllCashPaymentsMutation = trpc.cashPayments.adminClearAll.useMutation({
    onSuccess: (data) => { toast.success(`${data.deleted} pago(s) eliminado(s)`); cashPaymentsHistoryQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  // ── Administración del monedero ──
  const suspendMutation = trpc.wallet.adminSuspendWallet.useMutation({
    onSuccess: () => { toast.success('Monedero dado de baja.'); utils.wallet.adminListAll.invalidate(); },
    onError: (e) => toast.error('Error: ' + e.message),
  });
  const unsuspendMutation = trpc.wallet.adminUnsuspendWallet.useMutation({
    onSuccess: () => { toast.success('Monedero reactivado.'); utils.wallet.adminListAll.invalidate(); },
    onError: (e) => toast.error('Error: ' + e.message),
  });
  const resetMutation = trpc.wallet.adminResetWallet.useMutation({
    onSuccess: () => { toast.success('Monedero reiniciado. Saldo en $0.00.'); utils.wallet.adminListAll.invalidate(); },
    onError: (e) => { toast.error('Error: ' + e.message); },
  });
  const setDiscountMutation = trpc.wallet.adminSetDiscount.useMutation({
    onSuccess: (d) => { toast.success(`Descuento del ${d.discountPercent}% aplicado.`); utils.wallet.adminListAll.invalidate(); },
    onError: (e) => toast.error('Error: ' + e.message),
  });
  const removeDiscountMutation = trpc.wallet.adminRemoveDiscount.useMutation({
    onSuccess: () => { toast.success('Descuento eliminado.'); utils.wallet.adminListAll.invalidate(); },
    onError: (e) => toast.error('Error: ' + e.message),
  });
  const requireContractMutation = trpc.wallet.adminRequireContract.useMutation({
    onSuccess: () => { toast.success('✅ Solicitud de firma enviada. El usuario deberá firmar antes de continuar.'); utils.wallet.adminListAll.invalidate(); },
    onError: (e) => toast.error('Error: ' + e.message),
  });
  const clearContractMutation = trpc.wallet.adminClearContract.useMutation({
    onSuccess: () => { toast.success('Solicitud de contrato cancelada.'); utils.wallet.adminListAll.invalidate(); },
    onError: (e) => toast.error('Error: ' + e.message),
  });
  const clearAllPurchasesMutation = trpc.wallet.adminClearAllPurchases.useMutation({
    onSuccess: () => { toast.success('✅ Todas las compras (servicios, productos, libros) han sido eliminadas.'); utils.wallet.adminListAll.invalidate(); },
    onError: (e) => toast.error('Error: ' + e.message),
  });

  return (
    <>
      {/* Modal de notificación */}
      {showNotifModal && (
        <NotifModal
          walletId={wallet.id}
          patientName={wallet.patientName}
          onClose={() => setShowNotifModal(false)}
        />
      )}

      <Card className="border-gray-200 hover:border-[#C5A55A]/50 transition">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1A1A1A] to-[#333] rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-[#C5A55A]" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{wallet.patientName || "Sin nombre"}</p>
                <p className="text-[10px] text-gray-400 font-mono">{wallet.walletNumber}</p>
                {wallet.patientEmail && <p className="text-[10px] text-gray-400 truncate">{wallet.patientEmail}</p>}
                {(wallet as any).patientBirthday && (
                  <p className="text-[10px] text-pink-500 font-semibold flex items-center gap-1">
                    🎂 {new Date((wallet as any).patientBirthday + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="font-black text-lg text-[#C5A55A]">${(wallet.balance / 100).toFixed(2)}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                wallet.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {wallet.status === "active" ? "Activa" : "Suspendida"}
              </span>
            </div>
            <button onClick={() => setExpanded(!expanded)} className="ml-2 p-1 hover:bg-gray-100 rounded">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Badge de contrato — visible sin expandir */}
          <div className="flex items-center gap-2 mt-2">
            {(wallet as any).consentAcceptedAt ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                ✅ Contrato firmado
              </span>
            ) : (wallet as any).contractRequired ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                ⏳ Firma pendiente
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                📋 Sin contrato
              </span>
            )}
          </div>

          {/* Loyalty info */}
          <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-gray-500">
            <span>Consultas ciclo: <b className="text-gray-700">{wallet.consultationsInCycle || 0}/3</b></span>
            <span>Total consultas: <b className="text-gray-700">{wallet.totalConsultations || 0}</b></span>
            {(wallet.freeConsultationsAvailable || 0) > 0 && (
              <span className="text-green-700 font-bold">🎁 {wallet.freeConsultationsAvailable} consulta{wallet.freeConsultationsAvailable > 1 ? 's' : ''} GRATIS disponible{wallet.freeConsultationsAvailable > 1 ? 's' : ''}</span>
            )}
            <span>Acumulado: <b className="text-[#C5A55A]">${((wallet.totalCredited || 0) / 100).toFixed(2)}</b></span>
          </div>
          {/* Planes de lealtad por producto */}
          {(wallet.loyaltyProgress || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {(wallet.loyaltyProgress || []).map((p: any) => (
                <span key={p.id} className="text-[10px] bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 text-amber-800">
                  {p.plan?.productName || 'Producto'}: <b>{p.currentCount}/{p.plan?.requiredPurchases || '?'}</b>
                  {(p.rewardsEarned - p.rewardsUsed) > 0 && <span className="ml-1 text-green-700 font-bold">🎁 {p.rewardsEarned - p.rewardsUsed} GRATIS</span>}
                </span>
              ))}
            </div>
          )}

          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
              {/* Acreditar */}
              <div className="bg-green-50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-bold text-green-700 flex items-center gap-1"><Plus className="w-3 h-3" /> Acreditar saldo (cashback)</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Monto (MXN)"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="flex-1 text-sm"
                  />
                  <Input
                    placeholder="Descripción"
                    value={creditDesc}
                    onChange={(e) => setCreditDesc(e.target.value)}
                    className="flex-1 text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  disabled={isLoading || !creditAmount}
                  onClick={() => {
                    const amt = Math.round(parseFloat(creditAmount) * 100);
                    if (amt <= 0) { toast.error("Monto inválido"); return; }
                    const desc = creditDesc || "Cashback admin";
                    openSecurityModal(
                      "Acreditar Cashback",
                      `¿Acreditar $${(amt/100).toFixed(2)} MXN al monedero de ${wallet.patientName}?`,
                      (pw) => { onCredit(amt, desc, pw); setCreditAmount(""); setCreditDesc(""); }
                    );
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
                >
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Acreditar"}
                </Button>
              </div>

              {/* Descontar */}
              <div className="bg-red-50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-bold text-red-700 flex items-center gap-1"><Minus className="w-3 h-3" /> Descontar saldo</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Monto (MXN)"
                    value={debitAmount}
                    onChange={(e) => setDebitAmount(e.target.value)}
                    className="flex-1 text-sm"
                  />
                  <Input
                    placeholder="Descripción"
                    value={debitDesc}
                    onChange={(e) => setDebitDesc(e.target.value)}
                    className="flex-1 text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  disabled={isLoading || !debitAmount}
                  onClick={() => {
                    const amt = Math.round(parseFloat(debitAmount) * 100);
                    if (amt <= 0) { toast.error("Monto inválido"); return; }
                    const desc = debitDesc || "Cargo admin";
                    openSecurityModal(
                      "Descontar Saldo",
                      `¿Descontar $${(amt/100).toFixed(2)} MXN del monedero de ${wallet.patientName}?`,
                      (pw) => { onDebit(amt, desc, pw); setDebitAmount(""); setDebitDesc(""); }
                    );
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-xs"
                >
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Descontar"}
                </Button>
              </div>

              {/* ── Administración del Monedero ── */}
              <div className="bg-gray-900 rounded-xl p-3 space-y-3 border border-gray-700">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  Administración del Monedero
                </p>

                {/* Baja / Alta */}
                <div className="flex gap-2">
                  {wallet.status === 'active' ? (
                    <Button
                      size="sm"
                      disabled={suspendMutation.isPending}
                      onClick={() => openSecurityModal(
                        "Dar de Baja",
                        `¿Suspender el monedero de ${wallet.patientName}? El paciente no podrá usarlo hasta que lo reactives.`,
                        (pw) => suspendMutation.mutate({ walletNumber: wallet.walletNumber, adminPassword: pw })
                      )}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs"
                    >
                      {suspendMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Dar de Baja'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={unsuspendMutation.isPending}
                      onClick={() => openSecurityModal(
                        "Dar de Alta",
                        `¿Reactivar el monedero de ${wallet.patientName}?`,
                        (pw) => unsuspendMutation.mutate({ walletNumber: wallet.walletNumber, adminPassword: pw })
                      )}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      {unsuspendMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Dar de Alta'}
                    </Button>
                  )}
                </div>

                {/* Descuento */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-wide">Descuento en consultas</p>
                  {wallet.discountPercent ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-400">{wallet.discountPercent}% activo</span>
                      <Button
                        size="sm"
                        disabled={removeDiscountMutation.isPending}
                        onClick={() => openSecurityModal(
                          "Quitar Descuento",
                          `¿Quitar el descuento del ${wallet.discountPercent}% del monedero de ${wallet.patientName}?`,
                          (pw) => removeDiscountMutation.mutate({ walletNumber: wallet.walletNumber, adminPassword: pw })
                        )}
                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white text-xs"
                      >
                        {removeDiscountMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Quitar descuento'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value) as 10|15|20|25|30)}
                        className="flex-1 text-xs bg-gray-800 text-white border border-gray-600 rounded-lg px-2 py-1"
                      >
                        {[10,15,20,25,30].map(v => <option key={v} value={v}>{v}%</option>)}
                      </select>
                      <Button
                        size="sm"
                        disabled={setDiscountMutation.isPending}
                        onClick={() => openSecurityModal(
                          "Aplicar Descuento",
                          `¿Aplicar un descuento del ${discountValue}% al monedero de ${wallet.patientName}?`,
                          (pw) => setDiscountMutation.mutate({ walletNumber: wallet.walletNumber, discountPercent: discountValue, adminPassword: pw })
                        )}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                      >
                        {setDiscountMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Aplicar descuento'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Deuda activa */}
                {activeDebtNotifs.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wide flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Deuda activa ({activeDebtNotifs.length})
                    </p>
                    {activeDebtNotifs.map((n: any) => (
                      <p key={n.id} className="text-[9px] text-red-300 truncate">• {n.title}</p>
                    ))}
                    <Button
                      size="sm"
                      disabled={clearDebtMutation.isPending}
                      onClick={() => openSecurityModal(
                        '❌ Quitar Deuda Activa',
                        `¿Eliminar la deuda de ${wallet.patientName}? Esto borrará las notificaciones de cobro y el paciente podrá comprar normalmente.`,
                        (pw) => clearDebtMutation.mutate({ walletId: wallet.id })
                      )}
                      className="w-full bg-red-700 hover:bg-red-800 text-white text-xs"
                    >
                      {clearDebtMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : '❌ Quitar Deuda Activa'}
                    </Button>
                  </div>
                )}

                {/* Reiniciar */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-wide">Reiniciar monedero</p>
                  <Button
                    size="sm"
                    disabled={resetMutation.isPending}
                    onClick={() => openSecurityModal(
                      "⚠️ Reiniciar Monedero",
                      `ADVERTENCIA: Esto pondrá saldo, cashback y canjeado en $0.00, borrará el historial de movimientos y cancelará pagos pendientes del monedero de ${wallet.patientName}. Esta acción NO se puede deshacer.`,
                      (pw) => resetMutation.mutate({ walletNumber: wallet.walletNumber, adminEmail: 'admin', adminPassword: pw })
                    )}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs"
                  >
                    {resetMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reiniciar (poner en $0.00)'}
                  </Button>
                </div>

                {/* Enviar Notificación */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-wide">Notificaciones</p>
                   <Button
                    size="sm"
                    onClick={() => setShowNotifModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1"
                  >
                    <Bell className="w-3 h-3" />
                    Enviar Notificación al Paciente
                  </Button>
                </div>
                {/* Contrato de Consentimiento */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-wide">Contrato de Consentimiento</p>
                  {(wallet as any).contractRequired && !(wallet as any).consentAcceptedAt ? (
                    <div className="space-y-1.5">
                      <div className="bg-yellow-900/40 border border-yellow-600/50 rounded-lg px-2 py-1.5 text-[10px] text-yellow-300 flex items-center gap-1.5">
                        📋 Firma pendiente &mdash; el usuario está bloqueado hasta que firme
                      </div>
                      <Button
                        size="sm"
                        disabled={clearContractMutation.isPending}
                        onClick={() => {
                          if (confirm(`¿Cancelar la solicitud de firma de contrato para ${wallet.patientName}?`)) {
                            clearContractMutation.mutate({ patientEmail: wallet.patientEmail! });
                          }
                        }}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white text-xs"
                      >
                        {clearContractMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : '❌ Cancelar solicitud de firma'}
                      </Button>
                    </div>
                  ) : (wallet as any).consentAcceptedAt ? (
                    <div className="bg-green-900/40 border border-green-600/50 rounded-lg px-2 py-1.5 text-[10px] text-green-300 flex items-center gap-1.5">
                      ✅ Contrato firmado el {new Date((wallet as any).consentAcceptedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      disabled={requireContractMutation.isPending}
                      onClick={() => {
                        if (confirm(`¿Solicitar firma de contrato a ${wallet.patientName}? El usuario quedará bloqueado hasta que firme.`)) {
                          requireContractMutation.mutate({ patientEmail: wallet.patientEmail! });
                        }
                      }}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs flex items-center gap-1"
                    >
                      {requireContractMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <>📋 Solicitar Firma de Contrato</>}
                    </Button>
                  )}
                </div>
              </div>

              {/* Historial de Notificaciones (Admin) */}
              <div className="mt-3 space-y-3 border border-blue-100 rounded-xl p-3 bg-blue-50/40">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-blue-500" /> Notificaciones enviadas
                    {(notifsQuery.data || []).length > 0 && (
                      <span className="ml-1 bg-blue-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{(notifsQuery.data || []).length}</span>
                    )}
                  </p>
                  {(notifsQuery.data || []).length > 0 && (
                    <button
                      onClick={() => deleteAllNotifsMutation.mutate({ walletId: wallet.id })}
                      disabled={deleteAllNotifsMutation.isPending}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold transition px-2 py-1 rounded hover:bg-red-50"
                    >
                      Eliminar todas
                    </button>
                  )}
                </div>
                {notifsQuery.isLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>
                ) : (notifsQuery.data || []).length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">No hay notificaciones enviadas</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(notifsQuery.data || []).map((n: any) => (
                      <div key={n.id} className="bg-white border border-blue-100 rounded-xl px-3 py-2.5 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-blue-900 truncate">{n.title}</p>
                            <p className="text-xs text-blue-700 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              {' '}&bull;{' '}
                              {n.isRead ? <span className="text-green-600 font-semibold">✅ Leído</span> : <span className="text-red-500 font-semibold">🔴 No leído</span>}
                            </p>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0 mt-0.5">
                            <button
                              onClick={() => setEditingNotif(n)}
                              className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                              title="Editar notificación"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button
                              onClick={() => deleteNotifMutation.mutate({ notifId: n.id })}
                              disabled={deleteNotifMutation.isPending}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                              title="Eliminar notificación"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal de edición de notificación */}
              {editingNotif && (
                <EditNotifModal
                  notif={editingNotif}
                  onClose={() => setEditingNotif(null)}
                  onSaved={() => { setEditingNotif(null); notifsQuery.refetch(); }}
                />
              )}

              {/* ─── Compras desglosadas (Admin) ─── */}
              <div className="mt-2">
                <button
                  onClick={() => setShowPurchases(!showPurchases)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#C5A55A] transition"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  {showPurchases ? "Ocultar compras" : "Ver compras"}
                </button>
                {showPurchases && (
                  <div className="mt-2 space-y-3">
                    {/* Pagos en clínica */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Pagos en clínica</p>
                        {(cashPaymentsHistoryQuery.data || []).length > 0 && (
                          <button
                            onClick={() => clearAllCashPaymentsMutation.mutate({ walletId: wallet.id })}
                            disabled={clearAllCashPaymentsMutation.isPending}
                            className="flex items-center gap-1 text-[9px] text-red-600 hover:text-red-800 font-bold transition disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                            {clearAllCashPaymentsMutation.isPending ? '...' : 'Borrar todos'}
                          </button>
                        )}
                      </div>
                      {cashPaymentsHistoryQuery.isLoading ? (
                        <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-[#C5A55A]" /></div>
                      ) : (cashPaymentsHistoryQuery.data || []).length === 0 ? (
                        <p className="text-[10px] text-gray-400 text-center py-2">Sin pagos en clínica</p>
                      ) : (
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {(cashPaymentsHistoryQuery.data || []).map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-semibold text-gray-800 truncate">{p.concept}</p>
                                <p className="text-[9px] text-gray-400">{new Date(p.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                <span className="text-xs font-black text-gray-700">${(p.amountCents / 100).toFixed(2)}</span>
                                {p.status === 'confirmed' ? (
                                  <span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-1.5 py-0.5">Pagado ✓</span>
                                ) : p.status === 'cancelled' ? (
                                  <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-1.5 py-0.5">Cancelado</span>
                                ) : (
                                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">Pendiente</span>
                                )}
                                <button
                                  onClick={() => deleteCashPaymentMutation.mutate({ id: p.id })}
                                  disabled={deleteCashPaymentMutation.isPending}
                                  className="p-1 rounded bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition flex-shrink-0 disabled:opacity-50"
                                  title="Eliminar este pago"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Borrar todas las compras */}
                    <div>
                      <button
                        onClick={() => {
                          if (confirm('¿Estás seguro? Se eliminarán TODAS las compras (servicios, productos, libros).')) {
                            clearAllPurchasesMutation.mutate({ walletId: wallet.id });
                          }
                        }}
                        disabled={clearAllPurchasesMutation.isPending}
                        className="flex items-center gap-1 text-[9px] text-red-600 hover:text-red-800 font-bold transition disabled:opacity-50 px-2 py-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        {clearAllPurchasesMutation.isPending ? 'Eliminando...' : 'Borrar todas las compras'}
                      </button>
                    </div>

                    {/* Planes a plazos */}
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1">Planes a plazos</p>
                      {installmentPlansQuery.isLoading ? (
                        <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-[#C5A55A]" /></div>
                      ) : (installmentPlansQuery.data || []).length === 0 ? (
                        <p className="text-[10px] text-gray-400 text-center py-2">Sin planes a plazos</p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {(installmentPlansQuery.data || []).map((plan: any) => {
                            const paidInstallments = (plan.installmentPayments || []).filter((ip: any) => ip.status === 'paid').length;
                            const totalInstallments = plan.numberOfInstallments;
                            const progressPct = totalInstallments > 0 ? Math.round((paidInstallments / totalInstallments) * 100) : 0;
                            const totalPaid = (plan.downPaymentCents || 0) + (plan.installmentPayments || []).filter((ip: any) => ip.status === 'paid').reduce((s: number, ip: any) => s + ip.amountCents, 0);
                            const remaining = (plan.totalAmountCents || 0) - totalPaid;
                            return (
                              <div key={plan.id} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                <div className="flex items-start justify-between mb-1">
                                  <p className="text-[10px] font-bold text-gray-800 leading-tight flex-1 pr-2">{plan.serviceName}</p>
                                  {plan.status === 'completed' ? (
                                    <span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-1.5 py-0.5 flex-shrink-0">Completado ✓</span>
                                  ) : plan.status === 'cancelled' ? (
                                    <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-1.5 py-0.5 flex-shrink-0">Cancelado</span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-1.5 py-0.5 flex-shrink-0">Activo</span>
                                  )}
                                </div>
                                <div className="flex justify-between text-[9px] text-gray-500 mb-1">
                                  <span>Total: <strong className="text-gray-700">${(plan.totalAmountCents / 100).toFixed(2)}</strong></span>
                                  <span>Pagado: <strong className="text-green-600">${(totalPaid / 100).toFixed(2)}</strong></span>
                                  {remaining > 0 && <span>Resta: <strong className="text-red-600">${(remaining / 100).toFixed(2)}</strong></span>}
                                </div>
                                {/* Barra de progreso */}
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                                  <div
                                    className="h-1.5 rounded-full bg-gradient-to-r from-[#C5A55A] to-amber-400 transition-all"
                                    style={{ width: `${progressPct}%` }}
                                  />
                                </div>
                                <p className="text-[9px] text-gray-400 mb-1">{paidInstallments}/{totalInstallments} cuotas pagadas</p>
                                {/* Cuotas individuales */}
                                {(plan.installmentPayments || []).length > 0 && (
                                  <div className="space-y-0.5">
                                    {(plan.installmentPayments || []).map((ip: any) => (
                                      <div key={ip.id} className="flex items-center justify-between">
                                        <span className="text-[9px] text-gray-500">Cuota #{ip.installmentNumber}</span>
                                        <div className="flex items-center gap-1">
                                          <span className="text-[9px] font-semibold text-gray-700">${(ip.amountCents / 100).toFixed(2)}</span>
                                          {ip.status === 'paid' ? (
                                            <span className="text-[8px] font-bold text-green-600">✓ Pagada</span>
                                          ) : ip.dueDate && new Date(ip.dueDate) < new Date() ? (
                                            <span className="text-[8px] font-bold text-red-600">Vencida</span>
                                          ) : (
                                            <span className="text-[8px] font-bold text-amber-600">Pendiente</span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Historial de Movimientos (Admin) */}
              <div className="mt-2">
                <button
                  onClick={() => setShowTransactions(!showTransactions)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#C5A55A] transition"
                >
                  <History className="w-3.5 h-3.5" />
                  {showTransactions ? "Ocultar movimientos" : "Ver movimientos"}
                </button>
                {showTransactions && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Historial de transacciones</p>
                      {!confirmClearAll ? (
                        <button
                          onClick={() => setConfirmClearAll(true)}
                          className="flex items-center gap-1 text-[10px] text-red-600 hover:text-red-800 font-semibold transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          Limpiar todo
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span className="text-[10px] text-red-700 font-semibold">Eliminar todos?</span>
                          <button
                            onClick={() => clearAllTransactionsMutation.mutate({ walletId: wallet.id })}
                            disabled={clearAllTransactionsMutation.isPending}
                            className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold hover:bg-red-700 disabled:opacity-50"
                          >
                            {clearAllTransactionsMutation.isPending ? "..." : "Si"}
                          </button>
                          <button
                            onClick={() => setConfirmClearAll(false)}
                            className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-bold hover:bg-gray-300"
                          >
                            No
                          </button>
                        </div>
                      )}
                    </div>
                    {transactionsQuery.isLoading ? (
                      <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-[#C5A55A]" /></div>
                    ) : (transactionsQuery.data || []).length === 0 ? (
                      <p className="text-[10px] text-gray-400 text-center py-3">No hay movimientos</p>
                    ) : (
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {(transactionsQuery.data || []).map((tx: any) => (
                          <div key={tx.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1.5">
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-semibold text-gray-800 truncate">{tx.description}</p>
                              <p className="text-[9px] text-gray-400">{new Date(tx.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              <span className={`text-xs font-black ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.amount >= 0 ? '+' : ''}${(tx.amount / 100).toFixed(2)}
                              </span>
                              <button
                                onClick={() => deleteTransactionMutation.mutate({ transactionId: tx.id })}
                                disabled={deleteTransactionMutation.isPending}
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 active:bg-red-200 transition flex-shrink-0"
                                title="Eliminar este movimiento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// ─── Modal de Notificación Admin → Paciente ──────────────────────────────────
function NotifModal({ walletId, patientName, onClose }: { walletId: number; patientName: string; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<'cobro'|'promocion'|'felicitacion'|'general'>('general');
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const sendMutation = trpc.adminNotifs.sendByWalletId.useMutation({
    onSuccess: () => {
      toast.success("✅ Notificación enviada al paciente");
      utils.adminNotifs.getByWalletId.invalidate({ walletId });
      onClose();
    },
    onError: (e) => toast.error("Error: " + e.message),
  });

  const handleImageUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) { toast.error("La imagen no debe superar 2MB"); return; }
    if (!['image/jpeg', 'image/png'].includes(file.type)) { toast.error("Solo se permiten imágenes JPG o PNG"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-notif-image', { method: 'POST', body: formData, credentials: 'include' });
      if (!res.ok) throw new Error('Error al subir imagen');
      const data = await res.json();
      setImageUrl(data.url);
      toast.success("Imagen subida correctamente");
    } catch (e: any) {
      toast.error("Error al subir imagen: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const typeColors: Record<string, string> = {
    cobro: 'bg-red-100 text-red-700',
    promocion: 'bg-amber-100 text-amber-700',
    felicitacion: 'bg-green-100 text-green-700',
    general: 'bg-blue-100 text-blue-700',
  };
  const typeLabels: Record<string, string> = {
    cobro: '💳 Cobro',
    promocion: '🎁 Promoción',
    felicitacion: '🎉 Felicitación',
    general: '📢 General',
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Enviar Notificación a {patientName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {/* Tipo */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Tipo de notificación</label>
            <div className="flex gap-2 flex-wrap">
              {(['cobro','promocion','felicitacion','general'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${type === t ? typeColors[t] + ' border-current' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                >
                  {typeLabels[t]}
                </button>
              ))}
            </div>
          </div>
          {/* Título */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Título *</label>
            <Input
              placeholder="Ej: ¡Tienes una promoción especial!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
            />
          </div>
          {/* Mensaje */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Mensaje *</label>
            <textarea
              placeholder="Escribe el mensaje para el paciente..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Imagen opcional */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1">
              <Image className="w-3 h-3" /> Imagen (opcional)
              <span className="text-gray-400 font-normal ml-1">JPG/PNG, máx. 800×600px, 2MB</span>
            </label>
            {imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="Preview" className="w-full max-h-32 object-cover rounded-lg border" />
                <button
                  onClick={() => setImageUrl("")}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                  {uploading ? "Subiendo..." : "Clic para subir imagen"}
                </button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button
            size="sm"
            disabled={!title.trim() || !message.trim() || sendMutation.isPending}
            onClick={() => sendMutation.mutate({
              walletId,
              title: title.trim(),
              message: message.trim(),
              imageUrl: imageUrl || undefined,
              type,
              adminEmail: 'admin',
            })}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
          >
            {sendMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Loyalty Registration ────────────────────────────────────────────────────
function LoyaltyRegistration({ wallets, plans, onRegisterConsultation, onRegisterProductPurchase, isLoading }: {
  wallets: any[];
  plans: any[];
  onRegisterConsultation: (walletId: number) => void;
  onRegisterProductPurchase: (walletId: number, planId: number) => void;
  isLoading: boolean;
}) {
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [walletSearch, setWalletSearch] = useState("");

  const filtered = useMemo(() => {
    if (!walletSearch.trim()) return wallets;
    const q = walletSearch.toLowerCase();
    return wallets.filter((w: any) =>
      w.patientName?.toLowerCase().includes(q) || w.walletNumber?.toLowerCase().includes(q)
    );
  }, [wallets, walletSearch]);

  const selectedWalletData = wallets.find((w: any) => w.id === selectedWallet);

  return (
    <div className="space-y-4">
      {/* Seleccionar paciente */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-[#C5A55A]" />
            Seleccionar Paciente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar paciente..."
              value={walletSearch}
              onChange={(e) => setWalletSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filtered.map((w: any) => (
              <button
                key={w.id}
                onClick={() => setSelectedWallet(w.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                  selectedWallet === w.id
                    ? "bg-[#C5A55A]/10 border border-[#C5A55A] text-[#C5A55A] font-bold"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="font-medium">{w.patientName}</span>
                <span className="text-[10px] text-gray-400 ml-2">{w.walletNumber}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedWalletData && (
        <>
          {/* Info del paciente */}
          <Card className="border-[#C5A55A]/30 bg-amber-50/50">
            <CardContent className="p-3">
              <p className="text-sm font-bold text-gray-900">{selectedWalletData.patientName}</p>
              <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                <span>Consultas ciclo: <b>{selectedWalletData.consultationsInCycle || 0}/3</b></span>
                <span>Total consultas: <b>{selectedWalletData.totalConsultations || 0}</b></span>
                {(selectedWalletData.freeConsultationsAvailable || 0) > 0 && (
                  <span className="text-green-700 font-bold">🎁 {selectedWalletData.freeConsultationsAvailable} consulta{selectedWalletData.freeConsultationsAvailable > 1 ? 's' : ''} GRATIS</span>
                )}
                <span>Saldo: <b className="text-[#C5A55A]">${((selectedWalletData.balance || 0) / 100).toFixed(2)}</b></span>
              </div>
              {/* Planes de lealtad por producto */}
              {(selectedWalletData.loyaltyProgress || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(selectedWalletData.loyaltyProgress || []).map((p: any) => (
                    <span key={p.id} className="text-[10px] bg-amber-100 border border-amber-300 rounded-full px-2 py-0.5 text-amber-900">
                      {p.plan?.productName || 'Producto'}: <b>{p.currentCount}/{p.plan?.requiredPurchases || '?'}</b>
                      {(p.rewardsEarned - p.rewardsUsed) > 0 && <span className="ml-1 text-green-700 font-bold">🎁 {p.rewardsEarned - p.rewardsUsed} GRATIS</span>}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registrar consulta */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Registrar Consulta Nutricional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-3">
                {(selectedWalletData.consultationsInCycle || 0) >= 3
                  ? "Este paciente ya acumulo 3 consultas. La siguiente es GRATIS."
                  : `Lleva ${selectedWalletData.consultationsInCycle || 0}/3 consultas. Faltan ${3 - (selectedWalletData.consultationsInCycle || 0)} para la gratis.`
                }
              </p>
              <Button
                disabled={isLoading}
                onClick={() => onRegisterConsultation(selectedWallet!)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrar Consulta"}
              </Button>
            </CardContent>
          </Card>

          {/* Registrar compra de producto (plan de lealtad) */}
          {plans.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-600" />
                  Registrar Compra de Producto (Plan de Lealtad)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {plans.filter((p: any) => p.isActive).map((plan: any) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        selectedPlan === plan.id
                          ? "bg-green-50 border border-green-400 text-green-700 font-bold"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="font-medium">{plan.productName}</span>
                      <span className="text-[10px] text-gray-400 ml-2">
                        Acumula {plan.requiredPurchases} → 1 GRATIS
                      </span>
                    </button>
                  ))}
                </div>
                <Button
                  disabled={isLoading || !selectedPlan}
                  onClick={() => {
                    if (selectedPlan) onRegisterProductPurchase(selectedWallet!, selectedPlan);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrar Compra de Producto"}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ─── Plans Manager ───────────────────────────────────────────────────────────
function PlansManager({ plans, onCreate, onDelete, isLoading }: {
  plans: any[];
  onCreate: (data: { name: string; productName: string; category: "product" | "service" | "consultation"; requiredPurchases: number; rewardDescription?: string; expiresAt?: string }) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState<"product" | "service" | "consultation">("product");
  const [required, setRequired] = useState("3");
  const [expiresAt, setExpiresAt] = useState("");

  return (
    <div className="space-y-4">
      {/* Crear plan */}
      <Card className="border-[#C5A55A]/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#C5A55A]" />
            Crear Nuevo Plan de Lealtad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Nombre del plan *</label>
            <Input
              placeholder="Ej: Acumula 3 y llévate 1 gratis"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Nombre del producto *</label>
            <Input
              placeholder="Ej: Daflon 500 Mg Oral 20"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
              >
                <option value="product">Producto</option>
                <option value="service">Servicio</option>
                <option value="consultation">Consulta</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Compras req.</label>
              <Input
                type="number"
                min="2"
                max="20"
                value={required}
                onChange={(e) => setRequired(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Vigencia</label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>
          <p className="text-[10px] text-gray-400">Acumula {required} compras → 1 GRATIS</p>
          <Button
            disabled={isLoading || !name.trim() || !productName.trim()}
            onClick={() => {
              onCreate({
                name: name.trim(),
                productName: productName.trim(),
                category,
                requiredPurchases: parseInt(required) || 3,
                rewardDescription: "1 GRATIS",
                expiresAt: expiresAt || undefined,
              });
              setName(""); setProductName(""); setRequired("3"); setExpiresAt("");
            }}
            className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear Plan"}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de planes */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-700">Planes existentes ({plans.length})</h3>
        {plans.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-sm">No hay planes creados aun</p>
        ) : (
          plans.map((plan: any) => (
            <Card key={plan.id} className={`${plan.isActive ? "border-green-200" : "border-gray-200 opacity-60"}`}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#C5A55A] flex-shrink-0" />
                    <p className="font-bold text-sm text-gray-900 truncate">{plan.productName}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      plan.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {plan.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {plan.name} — Acumula {plan.requiredPurchases} → 1 GRATIS
                    {plan.expiresAt && ` • Vigencia: ${new Date(plan.expiresAt).toLocaleDateString("es-MX")}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm("¿Eliminar este plan?")) onDelete(plan.id);
                  }}
                  className="text-red-500 hover:bg-red-50 border-red-200 ml-2"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ─── PrintCardsTab — Imprimir Tarjetas Físicas CR-80 ────────────────────────
function PrintCardsTab({
  wallets,
  isLoading,
  search,
  setSearch,
  selectedCards,
  setSelectedCards,
  printMode,
  setPrintMode,
}: {
  wallets: any[];
  isLoading: boolean;
  search: string;
  setSearch: (s: string) => void;
  selectedCards: Set<number>;
  setSelectedCards: (s: Set<number>) => void;
  printMode: "single" | "sheet";
  setPrintMode: (m: "single" | "sheet") => void;
}) {
  const filtered = useMemo(() => {
    if (!search.trim()) return wallets;
    const q = search.toLowerCase();
    return wallets.filter((w: any) =>
      w.patientName?.toLowerCase().includes(q) ||
      w.walletNumber?.toLowerCase().includes(q) ||
      w.patientEmail?.toLowerCase().includes(q)
    );
  }, [wallets, search]);

  const toggleCard = (id: number) => {
    const next = new Set(selectedCards);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCards(next);
  };

  const selectAll = () => setSelectedCards(new Set(filtered.map((w: any) => w.id)));
  const clearAll = () => setSelectedCards(new Set());

  const selectedWallets = wallets.filter((w: any) => selectedCards.has(w.id));
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingEvolis, setIsGeneratingEvolis] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);
  const generateEvolisPDF = trpc.wallet.generateWalletPDF.useMutation();

  // Convertir datos de wallet al formato de WalletCardData
  const toCardData = (w: any) => ({
    patientName: w.patientName || "Usuario",
    walletNumber: w.walletNumber || "---",
    qrUrl: `https://nutriserpv.com/c/${w.walletNumber}`,
    isActive: w.status === "active",
  });

  // Escala para preview en pantalla (la tarjeta CR-80 mide 323×204px a 96dpi)
  const previewScale = 0.72;

  // Genera el PDF en el cliente (jsPDF + QRCode puro) — sin html2canvas, funciona en Safari/iPad
  const handlePrint = useCallback(async () => {
    if (selectedWallets.length === 0) {
      toast.error("Selecciona al menos una tarjeta para imprimir");
      return;
    }
    setIsPrinting(true);
    toast.info("Generando PDF...");
    try {
      const cards = selectedWallets.map((w: any) => ({
        patientName: w.patientName || "Sin nombre",
        walletNumber: w.walletNumber || "",
        qrUrl: `https://nutriserpv.com/c/${w.walletNumber || ""}`,
      }));
      const mode = printMode === "sheet" && selectedWallets.length > 1 ? "a4" : "individual";
      await generateWalletPdf(cards, mode);
      toast.success("✅ PDF descargado. Imprímelo en tu impresora de tarjetas.");
    } catch (err) {
      console.error("[Print]", err);
      toast.error("Error al generar el PDF.");
    } finally {
      setIsPrinting(false);
    }
  }, [selectedWallets, printMode]);

  // Genera PDF de alta resolución (260 dpi) para impresora Evolis
  const handleGenerateEvolisPDF = useCallback(async () => {
    if (selectedWallets.length === 0) {
      toast.error("Selecciona al menos una tarjeta para imprimir");
      return;
    }
    setIsGeneratingEvolis(true);
    toast.info("Generando PDF para Evolis (260 dpi)...");
    try {
      const walletIds = selectedWallets.map((w: any) => w.id);
      const result = (await generateEvolisPDF.mutateAsync({
        walletIds,
        format: printMode === "sheet" ? "sheet" : "individual",
      })) as any;
      if (result?.success && result?.buffer) {
        const binaryString = atob(result.buffer as string);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = (result.filename as string) || "nutriser-wallets.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("✅ PDF Evolis descargado (260 dpi, QR de alta resolución)");
      }
    } catch (err: any) {
      console.error("[Evolis PDF]", err);
      toast.error(err?.message || "Error al generar PDF Evolis");
    } finally {
      setIsGeneratingEvolis(false);
    }
  }, [selectedWallets, printMode, generateEvolisPDF]);

  return (
    <div className="space-y-4">
      {/* Instrucciones */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Printer className="w-5 h-5 text-[#C5A55A] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Imprimir Tarjetas Físicas CR-80</p>
            <p className="text-sm text-amber-800 mt-1">
              Selecciona los pacientes y haz clic en <strong>"Generar PDF"</strong>. El PDF se abrirá en el visor de tu dispositivo — usa el botón de compartir → <strong>"Imprimir"</strong>. Usa papel PVC o cartulina gruesa (300 g/m²) para mejor resultado.
            </p>
            <p className="text-xs text-amber-600 mt-1">
              💡 <b>Hoja A4:</b> caben 8 tarjetas por hoja. <b>Individual:</b> una tarjeta por página.
            </p>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={selectAll} className="text-xs">
          <CheckSquare className="w-3.5 h-3.5 mr-1" /> Todos ({filtered.length})
        </Button>
        <Button variant="outline" size="sm" onClick={clearAll} className="text-xs">
          <Square className="w-3.5 h-3.5 mr-1" /> Limpiar
        </Button>
        {/* Modo de impresión */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setPrintMode("sheet")}
            className={`px-3 py-1.5 text-xs font-medium transition ${printMode === "sheet" ? "bg-[#C5A55A] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            Hoja A4 (8/hoja)
          </button>
          <button
            onClick={() => setPrintMode("single")}
            className={`px-3 py-1.5 text-xs font-medium transition ${printMode === "single" ? "bg-[#C5A55A] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            Individual
          </button>
        </div>
        <Button
          onClick={handlePrint}
          disabled={selectedCards.size === 0 || isPrinting}
          className="bg-[#C5A55A] hover:bg-[#b8944d] text-white font-bold"
        >
          {isPrinting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generando PDF...</>
          ) : (
            <><Printer className="w-4 h-4 mr-2" />Generar PDF {selectedCards.size > 0 ? `(${selectedCards.size})` : ""}</>
          )}
        </Button>
        <Button
          onClick={handleGenerateEvolisPDF}
          disabled={selectedCards.size === 0 || isGeneratingEvolis}
          className="bg-green-600 hover:bg-green-700 text-white font-bold"
          title="PDF de alta resolución (260 dpi) para impresora Evolis Badgy"
        >
          {isGeneratingEvolis ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Evolis...</>
          ) : (
            <><PrinterCheck className="w-4 h-4 mr-2" />Evolis 260dpi {selectedCards.size > 0 ? `(${selectedCards.size})` : ""}</>
          )}
        </Button>
      </div>

      {/* Lista de wallets para seleccionar */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#C5A55A]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
          {filtered.map((w: any) => {
            const isSelected = selectedCards.has(w.id);
            return (
              <button
                key={w.id}
                onClick={() => toggleCard(w.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                  isSelected
                    ? "border-[#C5A55A] bg-amber-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-[#C5A55A]" : "border-2 border-gray-300"}`}>
                  {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{w.patientName || "Sin nombre"}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{w.walletNumber}</p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${w.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {w.status === "active" ? "Activa" : "Inactiva"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Preview de tarjetas seleccionadas */}
      {selectedWallets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PrinterCheck className="w-4 h-4 text-[#C5A55A]" />
            <p className="text-sm font-bold text-gray-700">
              Vista previa ({selectedWallets.length} tarjeta{selectedWallets.length !== 1 ? "s" : ""})
            </p>
          </div>
          <div className="flex flex-wrap gap-4 p-4 bg-gray-100 rounded-xl">
            {selectedWallets.map((w: any) => (
              <div
                key={w.id}
                style={{ width: 323 * previewScale, height: 204 * previewScale, position: "relative", flexShrink: 0 }}
              >
                <WalletCardPrint card={toCardData(w)} scale={previewScale} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenedor oculto para html2canvas */}
      <div ref={printContainerRef} style={{ display: "none", background: "white" }}>
        {selectedWallets.map((w: any) => (
          <div
            key={w.id}
            className="wallet-card-print-item"
            style={{ width: "323px", height: "204px", overflow: "hidden", borderRadius: "13px", flexShrink: 0 }}
          >
            <WalletCardPrint card={toCardData(w)} scale={1} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PhysicalCardRequestsTab — Solicitudes de Tarjeta Física ────────────────
function PhysicalCardRequestsTab() {
  const [filter, setFilter] = useState<"all" | "pending" | "printed" | "delivered">("pending");
  const [printingId, setPrintingId] = useState<number | null>(null);

  const requestsQuery = trpc.physicalCard.adminList.useQuery({ status: filter });
  const requests = requestsQuery.data || [];

  const markPrinted = trpc.physicalCard.markPrinted.useMutation({
    onSuccess: () => { requestsQuery.refetch(); toast.success("Marcada como impresa"); },
  });
  const markDelivered = trpc.physicalCard.markDelivered.useMutation({
    onSuccess: () => { requestsQuery.refetch(); toast.success("Marcada como entregada"); },
  });

  const handlePrint = (req: any) => {
    setPrintingId(req.id);
    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) { toast.error("Activa las ventanas emergentes"); return; }
    const logoUrl = "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
    const qrUrl = `https://nutriserpv.com/c/${req.walletNumber}`;
    printWin.document.write(`<!DOCTYPE html><html><head><title>Tarjeta ${req.walletNumber}</title>
<style>
  @page { size: 85.5mm 54mm; margin: 0; }
  body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .card { width: 85.5mm; height: 54mm; background: linear-gradient(135deg, #1A1A1A 0%, #2a2010 60%, #1A1A1A 100%); position: relative; font-family: 'Helvetica Neue', Arial, sans-serif; overflow: hidden; box-sizing: border-box; }
  .gold-top { position: absolute; top: 0; left: 0; right: 0; height: 0.5mm; background: linear-gradient(90deg, transparent, #C5A55A 30%, #E8C97A 50%, #C5A55A 70%, transparent); }
  .header { display: flex; align-items: center; gap: 1.5mm; padding: 2.5mm 3mm 1.5mm 3mm; }
  .logo { width: 7mm; height: 7mm; object-fit: contain; }
  .title { color: #C5A55A; font-weight: 900; font-size: 2.2mm; letter-spacing: 0.18em; text-transform: uppercase; }
  .subtitle { color: rgba(255,255,255,0.45); font-size: 1.7mm; letter-spacing: 0.12em; }
  .body { display: flex; align-items: center; gap: 2.5mm; padding: 1mm 3mm; }
  .qr-wrap { background: #fff; border-radius: 1.5mm; padding: 1.2mm; }
  .name { color: #fff; font-weight: 700; font-size: 2.8mm; text-transform: uppercase; }
  .num { color: rgba(255,255,255,0.55); font-family: monospace; font-size: 2.2mm; letter-spacing: 0.15em; margin-top: 0.8mm; }
  .footer { position: absolute; bottom: 0; left: 0; right: 0; height: 5.5mm; background: linear-gradient(90deg, #8B6914 0%, #C5A55A 25%, #E8C97A 50%, #C5A55A 75%, #8B6914 100%); display: flex; align-items: center; justify-content: space-between; padding: 0 3mm; }
  .footer-l { color: rgba(0,0,0,0.6); font-size: 1.6mm; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
  .footer-r { color: rgba(0,0,0,0.5); font-size: 1.5mm; }
</style>
<script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
</head><body>
<div class="card">
  <div class="gold-top"></div>
  <div class="header">
    <img class="logo" src="${logoUrl}" />
    <div style="flex:1"><div class="title">Monedero Nutriser</div><div class="subtitle">aesthetic &amp; nutrition</div></div>
  </div>
  <div class="body">
    <div class="qr-wrap"><canvas id="qr"></canvas></div>
    <div style="flex:1">
      <div class="name">${req.patientName}</div>
      <div class="num">${req.walletNumber}</div>
    </div>
  </div>
  <div class="footer">
    <span class="footer-l">nutriserpv.com/monedero</span>
    <span class="footer-r">Válida solo en Nutriser PV</span>
  </div>
</div>
<script>
QRCode.toCanvas(document.getElementById('qr'), '${qrUrl}', { width: 85, margin: 0, color: { dark: '#000000', light: '#ffffff' } }, function() {
  setTimeout(function() { window.print(); window.close(); }, 500);
});
</script>
</body></html>`);
    printWin.document.close();
    markPrinted.mutate({ id: req.id });
    setPrintingId(null);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    printed: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
  };
  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    printed: "Impresa",
    delivered: "Entregada",
  };

  return (
    <div className="space-y-4 mt-2">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#1A1A1A] text-base">Solicitudes de Tarjeta Física</h3>
        <span className="text-xs text-gray-400">{requests.length} resultado{requests.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(["pending", "printed", "delivered", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              filter === s ? "bg-[#C5A55A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "Todas" : statusLabels[s]}
          </button>
        ))}
      </div>

      {requestsQuery.isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-[#C5A55A]" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          No hay solicitudes {filter !== "all" ? statusLabels[filter].toLowerCase() + "s" : ""}
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-[#1A1A1A] truncate">{req.patientName}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[req.status] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabels[req.status] || req.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">{req.walletNumber}</p>
                  {req.patientEmail && <p className="text-xs text-gray-400">{req.patientEmail}</p>}
                  <p className="text-[10px] text-gray-300 mt-1">
                    Solicitado: {new Date(req.requestedAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handlePrint(req)}
                    disabled={printingId === req.id}
                    className="flex items-center gap-1.5 bg-[#C5A55A] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#b8963f] transition disabled:opacity-60"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir
                  </button>
                  {req.status !== "delivered" && (
                    <button
                      onClick={() => markDelivered.mutate({ id: req.id })}
                      className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700 transition"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      Entregada
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Modal de Edición de Notificación ────────────────────────────────────────
function EditNotifModal({ notif, onClose, onSaved }: { notif: any; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(notif.title || "");
  const [message, setMessage] = useState(notif.message || "");
  const [type, setType] = useState<'cobro'|'promocion'|'felicitacion'|'general'>(notif.type || 'general');

  const editMutation = trpc.adminNotifs.editNotif.useMutation({
    onSuccess: () => {
      toast.success("✅ Notificación actualizada");
      onSaved();
    },
    onError: (e) => toast.error("Error: " + e.message),
  });

  const typeOptions: { value: 'cobro'|'promocion'|'felicitacion'|'general'; label: string; emoji: string }[] = [
    { value: 'cobro', label: 'Cobro', emoji: '🧾' },
    { value: 'promocion', label: 'Promoción', emoji: '🎁' },
    { value: 'felicitacion', label: 'Felicitación', emoji: '🎉' },
    { value: 'general', label: 'General', emoji: '📢' },
  ];

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-700">
            <Bell className="w-4 h-4" />
            Editar Notificación
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {/* Tipo */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Tipo</label>
            <div className="flex flex-wrap gap-1.5">
              {typeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`px-2 py-1 rounded-full text-xs font-semibold border transition ${
                    type === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Título */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Título *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la notificación"
              className="text-sm"
            />
          </div>
          {/* Mensaje */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Mensaje *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe el mensaje..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button
            size="sm"
            disabled={!title.trim() || !message.trim() || editMutation.isPending}
            onClick={() => editMutation.mutate({ notifId: notif.id, title: title.trim(), message: message.trim(), type })}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {editMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
