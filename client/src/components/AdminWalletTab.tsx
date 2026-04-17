/**
 * AdminWalletTab — Panel de administración del Monedero Nutriser
 * Permite: ver todas las tarjetas, acreditar saldo, ver movimientos,
 * gestionar planes de lealtad por producto, y registrar consultas.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Search, Plus, Minus, CreditCard,
  Gift, Star, ChevronDown, ChevronUp, Loader2,
  DollarSign, Users, Award, Trash2, Calendar, QrCode,
} from "lucide-react";

import AdminQRScanner from "./AdminQRScanner";

type SubTab = "wallets" | "loyalty" | "plans" | "qrscan";

export default function AdminWalletTab() {
  const [subTab, setSubTab] = useState<SubTab>("wallets");
  const [search, setSearch] = useState("");

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

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {([
          { key: "qrscan" as SubTab, label: "Escanear QR", icon: QrCode },
          { key: "wallets" as SubTab, label: "Tarjetas", icon: CreditCard },
          { key: "loyalty" as SubTab, label: "Registrar Lealtad", icon: Star },
          { key: "plans" as SubTab, label: "Planes de Producto", icon: Gift },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              subTab === key
                ? "bg-[#C5A55A] text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ═══ SUB-TAB: Escanear QR ═══ */}
      {subTab === "qrscan" && <AdminQRScanner />}

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
