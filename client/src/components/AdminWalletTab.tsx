/**
 * AdminWalletTab — Panel de administración del Monedero Nutriser
 * Permite: ver todas las tarjetas, acreditar saldo, ver movimientos,
 * gestionar planes de lealtad por producto, y registrar consultas.
 */
import { useState, useMemo, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Search, Plus, Minus, CreditCard,
  Gift, Star, ChevronDown, ChevronUp, Loader2,
  DollarSign, Users, Award, Trash2, Calendar, QrCode, Printer, CheckSquare, Square, PrinterCheck,
} from "lucide-react";

import AdminQRScanner from "./AdminQRScanner";
import { WalletCard as WalletCardPrint, WalletCardPrintSheet } from "./WalletCardPrint";

type SubTab = "wallets" | "loyalty" | "plans" | "qrscan" | "printCards" | "requests";

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

  return (
    <div className="space-y-4">
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
                  onCredit={(amount, desc) => cashbackMutation.mutate({
                    walletId: w.id, amount, description: desc,
                  })}
                  onDebit={(amount, desc) => bonusMutation.mutate({
                    walletId: w.id, amount: -amount, description: desc,
                  })}
                  isLoading={cashbackMutation.isPending || bonusMutation.isPending}
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
function WalletCard({ wallet, onCredit, onDebit, isLoading }: {
  wallet: any;
  onCredit: (amount: number, desc: string) => void;
  onDebit: (amount: number, desc: string) => void;
  isLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDesc, setCreditDesc] = useState("");
  const [debitAmount, setDebitAmount] = useState("");
  const [debitDesc, setDebitDesc] = useState("");

  return (
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
                  onCredit(amt, creditDesc || "Cashback admin");
                  setCreditAmount(""); setCreditDesc("");
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
                  onDebit(amt, debitDesc || "Cargo admin");
                  setDebitAmount(""); setDebitDesc("");
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Descontar"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Convertir datos de wallet al formato de WalletCardData
  const toCardData = (w: any) => ({
    patientName: w.patientName || "Usuario",
    walletNumber: w.walletNumber || "---",
    qrUrl: `https://nutriserpv.com/c/${w.walletNumber}`,
    isActive: w.status === "active",
  });

  // Escala para preview en pantalla (la tarjeta CR-80 mide 323×204px a 96dpi)
  const previewScale = 0.72;

  // Impresión via html2canvas: convierte la tarjeta a imagen PNG y la imprime
  // Genera la imagen de la tarjeta usando Canvas nativo (sin CORS, funciona en iOS/Safari)
  const handlePrint = useCallback(async () => {
    if (selectedWallets.length === 0) {
      toast.error("Selecciona al menos una tarjeta para imprimir");
      return;
    }
    setIsPrinting(true);
    try {
      const { drawWalletCardToCanvas, drawWalletSheetToCanvas } = await import("./walletCardCanvas");

      const cards = selectedWallets.map((w: any) => ({
        patientName: w.patientName || "Sin nombre",
        walletNumber: w.walletNumber || "",
        qrUrl: `https://nutriserpv.com/c/${w.walletNumber || ""}`,
      }));

      let resultCanvas: HTMLCanvasElement;
      if (printMode === "sheet" && cards.length > 1) {
        resultCanvas = await drawWalletSheetToCanvas(cards);
      } else if (printMode === "sheet" && cards.length === 1) {
        resultCanvas = await drawWalletCardToCanvas(cards[0], 3);
      } else {
        // Individual: una tarjeta por descarga (primera seleccionada)
        resultCanvas = await drawWalletCardToCanvas(cards[0], 3);
      }

      // Descargar PNG directamente (funciona en iOS sin popups)
      const imgData = resultCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      const fileName = cards.length === 1
        ? `tarjeta-${cards[0].walletNumber || "nutriser"}.png`
        : `tarjetas-nutriser-${cards.length}.png`;
      link.href = imgData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`✅ Imagen descargada. Ábrela y usa "Imprimir" desde tu galería o visor de fotos.`);
    } catch (err) {
      console.error("[Print] Canvas error:", err);
      toast.error("Error al generar la imagen. Intenta de nuevo.");
    } finally {
      setIsPrinting(false);
    }
  }, [selectedWallets, printMode]);

  return (
    <div className="space-y-4">
      {/* Instrucciones */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Printer className="w-5 h-5 text-[#C5A55A] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Imprimir Tarjetas Físicas CR-80</p>
            <p className="text-xs text-amber-700 mt-1">
              Selecciona los pacientes y haz clic en <b>"Descargar imagen"</b>. Se guardará un PNG
              en tu dispositivo — ábrelo y usa <b>"Imprimir"</b> desde tu galería o visor de fotos.
              Usa papel PVC o cartulina gruesa (300 g/m²) para mejor resultado.
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
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generando imagen...</>
          ) : (
            <><Printer className="w-4 h-4 mr-2" />Descargar imagen {selectedCards.size > 0 ? `(${selectedCards.size})` : ""}</>
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

      {/* Contenedor oculto para html2canvas — se muestra temporalmente al imprimir */}
      <div ref={printContainerRef} style={{ display: "none", background: "white", padding: "10mm" }}>
        {printMode === "sheet" ? (
          // Hoja A4 con hasta 8 tarjetas
          <WalletCardPrintSheet cards={selectedWallets.map(toCardData)} />
        ) : (
          // Una tarjeta por página
          selectedWallets.map((w: any, i: number) => (
            <div
              key={w.id}
              style={{
                pageBreakAfter: i < selectedWallets.length - 1 ? "always" : "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "210mm",
                height: "297mm",
                padding: "20mm",
                boxSizing: "border-box",
              }}
            >
              <div style={{ width: "85.5mm", height: "54mm", overflow: "hidden", borderRadius: "3.5mm" }}>
                {/* Importamos WalletCardPrintSheet con una sola tarjeta */}
                <WalletCardPrintSheet cards={[toCardData(w)]} />
              </div>
            </div>
          ))
        )}
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
    // Abrir ventana de impresión con la tarjeta
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
  .badge { font-size: 1.7mm; font-weight: 800; padding: 0.5mm 1.8mm; border-radius: 5mm; border: 0.3mm solid rgba(52,211,153,0.5); color: #34d399; background: rgba(52,211,153,0.12); }
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
