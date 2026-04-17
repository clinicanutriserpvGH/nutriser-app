/**
 * Monedero Electrónico Nutriser
 * Tarjeta digital compacta arriba estilo Farmacias del Ahorro
 * Logo grande DENTRO de la tarjeta, código de barras/QR, saldo
 * Identidad visual: dorado (#C5A55A), crema (#FAF7F2), negro (#1A1A1A)
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Home, Sparkles, BookOpen, User, ChevronLeft } from "lucide-react";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import NutriserAuthModal from "@/components/NutriserAuthModal";
import { trpc } from "@/lib/trpc";
import { QRCodeSVG } from "qrcode.react";
import { useRoute } from "wouter";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

// Formatear centavos a pesos MXN
function formatMoney(centavos: number): string {
  return `$${(centavos / 100).toFixed(2)}`;
}

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
}

// Barra de progreso de lealtad
function LoyaltyProgressBar({ current, required, rewardLabel }: { current: number; required: number; rewardLabel: string }) {
  const steps: React.ReactNode[] = [];
  for (let i = 1; i <= required; i++) {
    steps.push(
      <div key={i} className="flex flex-col items-center flex-1">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i <= current ? "bg-[#C5A55A] border-[#C5A55A] text-white" : "bg-white border-gray-300 text-gray-400"}`}>
          {i}
        </div>
      </div>
    );
    if (i < required) {
      steps.push(<div key={`line-${i}`} className={`h-0.5 flex-1 mt-3.5 -mx-1 ${i < current ? "bg-[#C5A55A]" : "bg-gray-200"}`} />);
    }
  }
  steps.push(<div key="line-reward" className={`h-0.5 flex-1 mt-3.5 -mx-1 ${current >= required ? "bg-[#C5A55A]" : "bg-gray-200"}`} />);
  steps.push(
    <div key="reward" className="flex flex-col items-center flex-1">
      <div className={`px-2 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all whitespace-nowrap ${current >= required ? "bg-green-500 border-green-500 text-white" : "bg-white border-green-400 text-green-600"}`}>
        {rewardLabel}
      </div>
    </div>
  );
  return <div className="flex items-start w-full">{steps}</div>;
}

function LoyaltyPlanCard({ planName, productName, current, required, rewardLabel, rewardsAvailable, expiresAt }: { planName: string; productName: string; current: number; required: number; rewardLabel: string; rewardsAvailable: number; expiresAt?: string | Date | null }) {
  const remaining = required - current;
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
      <div className="flex justify-between items-start mb-1">
        <p className="text-[#C5A55A] font-bold text-sm">{planName}</p>
        {expiresAt && <p className="text-gray-400 text-xs">Vigencia {formatDate(expiresAt)}</p>}
      </div>
      <p className="text-gray-600 text-xs mb-3">Cada compra cuenta</p>
      <LoyaltyProgressBar current={current} required={required} rewardLabel={rewardLabel} />
      <p className="text-gray-700 text-sm mt-3">
        Ya llevas <strong>{current}</strong> compra{current !== 1 ? "s" : ""} de <strong>{productName}</strong> acumulada{current !== 1 ? "s" : ""}.
        {remaining > 0 ? <> ¡Solo te faltan <strong>{remaining}</strong> para tu recompensa!</> : <span className="text-green-600 font-bold"> ¡Tienes una recompensa disponible!</span>}
      </p>
      {rewardsAvailable > 0 && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-700 text-xs font-semibold flex items-center gap-2">
          <span className="text-lg">🎁</span>
          {rewardsAvailable} recompensa{rewardsAvailable > 1 ? "s" : ""} disponible{rewardsAvailable > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

function ConsultationCard({ totalConsultations, freeAvailable }: { totalConsultations: number; freeAvailable: number }) {
  const cyclePosition = totalConsultations % 3;
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
      <div className="flex justify-between items-start mb-1">
        <p className="text-[#C5A55A] font-bold text-sm">Acumula 3 y la 4ta es GRATIS</p>
        <p className="text-gray-400 text-xs">Consultas nutricionales</p>
      </div>
      <p className="text-gray-600 text-xs mb-3">Cada consulta cuenta</p>
      <LoyaltyProgressBar current={cyclePosition} required={3} rewardLabel="1 GRATIS" />
      <p className="text-gray-700 text-sm mt-3">
        Ya llevas <strong>{cyclePosition}</strong> consulta{cyclePosition !== 1 ? "s" : ""} en este ciclo.
        {cyclePosition < 3 ? <> ¡Solo te faltan <strong>{3 - cyclePosition}</strong> para tu consulta GRATIS!</> : <span className="text-green-600 font-bold"> ¡Tienes una consulta GRATIS disponible!</span>}
      </p>
      {freeAvailable > 0 && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-700 text-xs font-semibold flex items-center gap-2">
          <span className="text-lg">🎁</span>
          {freeAvailable} consulta{freeAvailable > 1 ? "s" : ""} GRATIS disponible{freeAvailable > 1 ? "s" : ""}
        </div>
      )}
      <p className="text-gray-400 text-[10px] mt-2">Total histórico: {totalConsultations} consultas nutricionales</p>
    </div>
  );
}

function TransactionRow({ txn }: { txn: any }) {
  const isPositive = txn.amount >= 0;
  const typeLabels: Record<string, string> = { cashback: "Cashback", redeem: "Canje", bonus: "Bonificación", adjustment: "Ajuste", free_consultation: "Consulta gratis" };
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{txn.description}</p>
        <p className="text-[10px] text-gray-400">{typeLabels[txn.type] || txn.type} · {formatDate(txn.createdAt)}</p>
      </div>
      <p className={`text-sm font-bold ml-3 ${isPositive ? "text-green-600" : "text-red-500"}`}>
        {isPositive ? "+" : ""}{formatMoney(txn.amount)}
      </p>
    </div>
  );
}

export default function WalletPage() {
  const { patient, isLoggedIn } = usePatientAuth();
  const [, setLocation] = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"card" | "loyalty" | "purchases" | "history">("card");

  const purchasesQuery = trpc.patients.getMyPurchases.useQuery(
    { email: patient?.email ?? 'x@x.com' },
    { enabled: isLoggedIn && !!patient?.email && activeTab === 'purchases' }
  );
  const myPurchases = purchasesQuery.data;
  const [copied, setCopied] = useState(false);

  const [matchRoute, params] = useRoute("/monedero/:walletNumber");
  const walletNumberFromUrl = matchRoute ? params?.walletNumber : null;

  const walletQuery = trpc.wallet.getMyWallet.useQuery(
    { patientId: patient?.id || 0 },
    { enabled: isLoggedIn && !!patient?.id }
  );

  const plansQuery = trpc.wallet.getActivePlans.useQuery(undefined, { enabled: isLoggedIn });

  const wallet = walletQuery.data?.wallet;
  const tracker = walletQuery.data?.tracker;
  const progressList = walletQuery.data?.progress || [];
  const transactions = walletQuery.data?.transactions || [];
  const plans = plansQuery.data || [];

  const qrUrl = wallet ? `https://nutriserpv.com/monedero/${wallet.walletNumber}` : "";

  const copyWalletNumber = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.walletNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col">
        <div className="pt-12 px-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
          <button onClick={() => setLocation("/memberships")} className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm font-medium bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
            <ChevronLeft className="w-4 h-4" /> REGRESAR
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <img src={LOGO_URL} alt="Nutriser" className="w-24 h-24 object-contain mb-6" />
          <h1 className="text-2xl font-bold text-[#C5A55A] mb-2 text-center">Monedero Nutriser</h1>
          <p className="text-gray-400 text-center mb-8 max-w-sm">Inicia sesión para ver tu tarjeta digital, saldo y beneficios exclusivos.</p>
          <button onClick={() => setShowAuth(true)} className="bg-[#C5A55A] text-white font-bold py-3 px-8 rounded-xl text-lg hover:bg-[#b8963f] transition-all">
            Iniciar Sesión
          </button>
          <NutriserAuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        </div>
      </div>
    );
  }

  // Loading
  if (walletQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center">
        <img src={LOGO_URL} alt="Nutriser" className="w-16 h-16 object-contain animate-pulse mb-4" />
        <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#C5A55A] rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
        </div>
        <p className="text-gray-500 text-sm mt-3">Cargando tu monedero...</p>
        <style>{`@keyframes loading { 0% { width: 0%; } 50% { width: 80%; } 100% { width: 100%; } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      {/* Header — simple back button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button onClick={() => setLocation("/memberships")} className="text-gray-600 hover:text-gray-800 mr-3">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-[#1A1A1A]">Monedero Nutriser</h1>
      </div>

      {/* ── Tarjeta compacta estilo Farmacias del Ahorro ── */}
      <div className="px-4 pt-4 pb-2">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Top section — dark with logo + card info */}
            <div className="bg-gradient-to-br from-[#1A1A1A] via-[#222] to-[#1A1A1A] p-5 relative overflow-hidden">
              {/* Subtle gold accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A55A] to-transparent" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C5A55A]/8 to-transparent rounded-bl-full" />

              {/* Row: Logo + Title + Status */}
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <img src={LOGO_URL} alt="Nutriser" className="w-12 h-12 object-contain" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-[#C5A55A] font-black text-sm tracking-widest uppercase">Monedero Nutriser</h2>
                  <p className="text-gray-500 text-[10px] tracking-wide">aesthetic & nutrition</p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider flex-shrink-0 ${wallet?.isActive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                  {wallet?.isActive ? "ACTIVA" : "INACTIVA"}
                </span>
              </div>

              {/* QR Code — inline with card number */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-white rounded-xl p-2.5 flex-shrink-0">
                  <QRCodeSVG
                    value={qrUrl || "https://nutriserpv.com/monedero"}
                    size={80}
                    level="H"
                    includeMargin={false}
                    bgColor="#FFFFFF"
                    fgColor="#1A1A1A"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm uppercase truncate">{patient?.name || "Usuario"}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <p className="text-white/70 font-mono text-xs tracking-wider truncate">{wallet?.walletNumber || "---"}</p>
                    <button onClick={copyWalletNumber} className="text-[#C5A55A] hover:text-[#d4b96e] transition-colors flex-shrink-0" title="Copiar">
                      {copied ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      )}
                    </button>
                  </div>
                  {/* Logo watermark */}
                  <div className="flex justify-end mt-2">
                    <img src={LOGO_URL} alt="" className="w-14 h-auto object-contain opacity-25" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom section — saldo */}
            <div className="px-5 py-3 flex items-center justify-between bg-white">
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Saldo disponible</p>
                <p className="text-[#C5A55A] font-black text-2xl">{formatMoney(wallet?.balance || 0)}</p>
              </div>
              <button
                onClick={() => setActiveTab("history")}
                className="text-[#C5A55A] text-xs font-semibold hover:underline"
              >
                Ver Estado de Cuenta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-md mx-auto px-4 mt-3">
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          {[
            { key: "card" as const, label: "Mi Tarjeta" },
            { key: "loyalty" as const, label: "Mis Planes" },
            { key: "purchases" as const, label: "Mis Compras" },
            { key: "history" as const, label: "Movimientos" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.key ? "bg-[#1A1A1A] text-[#C5A55A]" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-md mx-auto px-4 mt-4 pb-32">
        {activeTab === "card" && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
              <h3 className="text-[#1A1A1A] font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#C5A55A]/10 rounded-full flex items-center justify-center text-[#C5A55A] text-xs">★</span>
                Beneficios de tu Monedero
              </h3>
              <div className="space-y-2">
                {[
                  "2% de cashback en cada compra verificada",
                  "Dinero electrónico para usar en Nutriser Shop y Cupones",
                  "3 consultas nutricionales → la 4ta es GRATIS",
                  "Planes de lealtad por productos: acumula y gana GRATIS",
                  "Historial completo de movimientos",
                  "QR único para acceder desde cualquier dispositivo",
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#C5A55A] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <p className="text-gray-600 text-xs">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Total acumulado</p>
                <p className="text-[#C5A55A] font-bold text-lg">{formatMoney(wallet?.totalCashback || 0)}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Total canjeado</p>
                <p className="text-gray-700 font-bold text-lg">{formatMoney(wallet?.totalRedeemed || 0)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "loyalty" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={LOGO_URL} alt="Nutriser" className="w-6 h-6 object-contain" />
              <h2 className="text-[#1A1A1A] font-bold text-base">Mis Planes de Lealtad</h2>
            </div>
            <p className="text-gray-500 text-xs mb-4">Compra productos elegibles y consigue recompensas</p>
            {tracker && (
              <ConsultationCard totalConsultations={tracker.nutritionConsultations} freeAvailable={tracker.freeConsultationsEarned - tracker.freeConsultationsUsed} />
            )}
            {progressList.length > 0 ? (
              progressList.map((p: any) => (
                <LoyaltyPlanCard key={p.id} planName={p.plan.name} productName={p.plan.productName} current={p.currentCount} required={p.plan.requiredPurchases} rewardLabel={p.plan.rewardDescription || "1 GRATIS"} rewardsAvailable={p.rewardsEarned - p.rewardsUsed} expiresAt={p.plan.expiresAt} />
              ))
            ) : plans.length > 0 ? (
              plans.map((plan: any) => (
                <LoyaltyPlanCard key={plan.id} planName={plan.name} productName={plan.productName} current={0} required={plan.requiredPurchases} rewardLabel={plan.rewardDescription || "1 GRATIS"} rewardsAvailable={0} expiresAt={plan.expiresAt} />
              ))
            ) : (
              !tracker && (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">Aún no tienes planes de lealtad activos.</p>
                  <p className="text-gray-300 text-xs mt-1">Compra en Nutriser Shop para comenzar a acumular.</p>
                </div>
              )
            )}
          </div>
        )}

        {activeTab === "purchases" && (
          <div className="space-y-5">
            <div className="bg-[#C5A55A]/5 border border-[#C5A55A]/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-[#C5A55A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <h3 className="text-[#1A1A1A] font-bold text-sm">Mis Compras</h3>
              </div>
              <p className="text-gray-500 text-xs">Todo lo que has adquirido en Nutriser, vinculado a tu cuenta.</p>
            </div>

            {purchasesQuery.isLoading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-2 border-[#C5A55A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-400 text-xs">Cargando tus compras...</p>
              </div>
            ) : (
              <>
                {/* Paquetes */}
                {(myPurchases?.packages?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Paquetes</p>
                    <div className="space-y-3">
                      {myPurchases!.packages.map((pkg: any) => (
                        <div key={pkg.id} className={`bg-white rounded-2xl p-4 border shadow-sm ${
                          pkg.status === 'verified' ? 'border-green-200' :
                          pkg.status === 'rejected' ? 'border-red-200' : 'border-yellow-200'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[#1A1A1A] font-bold text-sm">{pkg.programName || pkg.programType}</p>
                              <p className="text-gray-500 text-xs mt-0.5">${pkg.price} MXN</p>
                              {pkg.verifiedAt && <p className="text-gray-400 text-xs mt-0.5">Verificado: {new Date(pkg.verifiedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</p>}
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              pkg.status === 'verified' ? 'bg-green-50 text-green-700' :
                              pkg.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {pkg.status === 'verified' ? 'Activo' : pkg.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                            </span>
                          </div>
                          {pkg.status === 'verified' && pkg.accessCode && (
                            <div className="mt-2 bg-gray-50 rounded-xl px-3 py-1.5 flex items-center gap-2">
                              <span className="text-gray-400 text-xs">Código:</span>
                              <span className="text-[#C5A55A] font-mono font-black text-sm tracking-widest">{pkg.accessCode}</span>
                            </div>
                          )}
                          {pkg.status === 'pending' && <p className="text-yellow-600 text-xs mt-2">Tu paquete está siendo revisado. Recibirás confirmación por correo.</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Servicios */}
                {(myPurchases?.services?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Servicios</p>
                    <div className="space-y-3">
                      {myPurchases!.services.map((svc: any) => (
                        <div key={svc.id} className={`bg-white rounded-2xl p-4 border shadow-sm ${
                          svc.status === 'approved' ? 'border-green-200' :
                          svc.status === 'rejected' ? 'border-red-200' : 'border-yellow-200'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[#1A1A1A] font-bold text-sm">{svc.serviceName}</p>
                              {svc.originalPrice && <p className="text-gray-500 text-xs mt-0.5">{svc.originalPrice.replace(/^\$+/, '$').replace(/\s*MXN\s*MXN/i, ' MXN').replace(/\s*MXN$/i, ' MXN').trim()}</p>}
                              {svc.approvedAt && <p className="text-gray-400 text-xs mt-0.5">Autorizado: {new Date(svc.approvedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</p>}
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              svc.status === 'approved' ? 'bg-green-50 text-green-700' :
                              svc.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {svc.status === 'approved' ? 'Activo' : svc.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                            </span>
                          </div>
                          {svc.status === 'approved' && svc.serviceCode && (
                            <div className="mt-2 bg-gray-50 rounded-xl px-3 py-1.5 flex items-center gap-2">
                              <span className="text-gray-400 text-xs">Código:</span>
                              <span className="text-[#C5A55A] font-mono font-black text-sm tracking-widest">{svc.serviceCode}</span>
                            </div>
                          )}
                          {svc.status === 'pending' && <p className="text-yellow-600 text-xs mt-2">Tu servicio está siendo revisado. Recibirás confirmación por correo.</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cupones */}
                {(myPurchases?.coupons?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Cupones</p>
                    <div className="space-y-3">
                      {myPurchases!.coupons.map((c: any) => (
                        <div key={c.id} className={`bg-white rounded-2xl p-4 border shadow-sm ${
                          c.status === 'approved' ? 'border-green-200' :
                          c.status === 'used' ? 'border-gray-200' :
                          c.status === 'expired' ? 'border-orange-200' :
                          c.status === 'rejected' ? 'border-red-200' : 'border-yellow-200'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[#1A1A1A] font-bold text-sm">{c.promotionTitle}</p>
                              {c.expiresAt && c.status === 'approved' && (
                                <p className="text-gray-500 text-xs mt-0.5">Válido hasta: {new Date(c.expiresAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                              )}
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              c.status === 'approved' ? 'bg-green-50 text-green-700' :
                              c.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                              c.status === 'used' ? 'bg-gray-100 text-gray-500' :
                              c.status === 'expired' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {c.status === 'approved' ? 'Activo' : c.status === 'pending' ? 'Pendiente' : c.status === 'used' ? 'Usado' : c.status === 'expired' ? 'Vencido' : 'Rechazado'}
                            </span>
                          </div>
                          {c.couponCode && c.status === 'approved' && (
                            <div className="mt-2 bg-gray-50 rounded-xl px-3 py-1.5 flex items-center gap-2">
                              <span className="text-gray-400 text-xs">Código:</span>
                              <span className="text-[#C5A55A] font-mono font-black text-sm tracking-widest">{c.couponCode}</span>
                            </div>
                          )}
                          {c.status === 'pending' && <p className="text-yellow-600 text-xs mt-2">Tu cupón está siendo revisado. Recibirás confirmación por correo.</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estado vacío */}
                {(myPurchases?.packages?.length ?? 0) === 0 &&
                 (myPurchases?.services?.length ?? 0) === 0 &&
                 (myPurchases?.coupons?.length ?? 0) === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <p className="text-gray-500 text-sm">Aún no tienes compras registradas.</p>
                    <p className="text-gray-400 text-xs mt-1">Tus paquetes, servicios y cupones aparecerán aquí automáticamente.</p>
                    {patient?.email && (
                      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 inline-block text-left">
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-1">Cuenta vinculada</p>
                        <p className="text-gray-700 text-xs font-mono">{patient.email}</p>
                        <p className="text-gray-400 text-[10px] mt-1">Asegúrate de haber comprado con este mismo correo.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <h2 className="text-[#1A1A1A] font-bold text-base mb-4">Historial de Movimientos</h2>
            {transactions.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                {transactions.map((txn: any) => (
                  <TransactionRow key={txn.id} txn={txn} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No hay movimientos aún.</p>
                <p className="text-gray-300 text-xs mt-1">Tu cashback y canjes aparecerán aquí.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Navigation Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-md mx-auto flex items-end justify-around px-2 pt-1 pb-2">
            <button onClick={() => setLocation("/memberships")} className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[60px]">
              <Home className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">Inicio</span>
            </button>
            <button onClick={() => setLocation("/memberships")} className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[60px]">
              <Sparkles className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">Tienda</span>
            </button>
            <div className="flex flex-col items-center -mt-5">
              <div className="w-14 h-14 rounded-full bg-white border-4 border-[#C5A55A] shadow-lg flex items-center justify-center mb-0.5">
                <img src={LOGO_URL} alt="Monedero" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-[10px] font-bold text-[#C5A55A]">Monedero</span>
            </div>
            <button onClick={() => setLocation("/memberships")} className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[60px]">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">Library</span>
            </button>
            <button onClick={() => setLocation("/memberships")} className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[60px]">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">Cuenta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
