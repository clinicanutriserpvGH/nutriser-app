/**
 * Monedero Electrónico Nutriser
 * Tarjeta digital con QR, saldo, planes de lealtad estilo Farmacia del Ahorro
 * Identidad visual: dorado (#C5A55A), crema (#FAF7F2), negro (#1A1A1A)
 */
import { useState, useEffect, useMemo } from "react";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import NutriserAuthModal from "@/components/NutriserAuthModal";
import { trpc } from "@/lib/trpc";
import { QRCodeSVG } from "qrcode.react";
import { useRoute } from "wouter";
import BackToSplash from "@/components/BackToSplash";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

// Formatear centavos a pesos MXN
function formatMoney(centavos: number): string {
  return `$${(centavos / 100).toFixed(2)}`;
}

// Formatear fecha
function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Barra de progreso de lealtad
function LoyaltyProgressBar({
  current,
  required,
  rewardLabel,
}: {
  current: number;
  required: number;
  rewardLabel: string;
}) {
  const steps = [];
  for (let i = 1; i <= required; i++) {
    steps.push(
      <div key={i} className="flex flex-col items-center flex-1">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
            i <= current
              ? "bg-[#C5A55A] border-[#C5A55A] text-white"
              : "bg-white border-gray-300 text-gray-400"
          }`}
        >
          {i}
        </div>
      </div>
    );
    if (i < required) {
      steps.push(
        <div
          key={`line-${i}`}
          className={`h-0.5 flex-1 mt-3.5 -mx-1 ${
            i < current ? "bg-[#C5A55A]" : "bg-gray-200"
          }`}
        />
      );
    }
  }
  // Reward step
  steps.push(
    <div
      key="line-reward"
      className={`h-0.5 flex-1 mt-3.5 -mx-1 ${
        current >= required ? "bg-[#C5A55A]" : "bg-gray-200"
      }`}
    />
  );
  steps.push(
    <div key="reward" className="flex flex-col items-center flex-1">
      <div
        className={`px-2 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all whitespace-nowrap ${
          current >= required
            ? "bg-green-500 border-green-500 text-white"
            : "bg-white border-green-400 text-green-600"
        }`}
      >
        {rewardLabel}
      </div>
    </div>
  );
  return <div className="flex items-start w-full">{steps}</div>;
}

// Tarjeta de plan de lealtad individual (estilo Farmacia del Ahorro)
function LoyaltyPlanCard({
  planName,
  productName,
  current,
  required,
  rewardLabel,
  rewardsAvailable,
  expiresAt,
}: {
  planName: string;
  productName: string;
  current: number;
  required: number;
  rewardLabel: string;
  rewardsAvailable: number;
  expiresAt?: string | Date | null;
}) {
  const remaining = required - current;
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
      <div className="flex justify-between items-start mb-1">
        <p className="text-[#C5A55A] font-bold text-sm">
          {planName}
        </p>
        {expiresAt && (
          <p className="text-gray-400 text-xs">
            Vigencia {formatDate(expiresAt)}
          </p>
        )}
      </div>
      <p className="text-gray-600 text-xs mb-3">Cada compra cuenta</p>

      <LoyaltyProgressBar
        current={current}
        required={required}
        rewardLabel={rewardLabel}
      />

      <p className="text-gray-700 text-sm mt-3">
        Ya llevas <strong>{current}</strong> compra{current !== 1 ? "s" : ""} de{" "}
        <strong>{productName}</strong> acumulada{current !== 1 ? "s" : ""}.
        {remaining > 0 ? (
          <>
            {" "}
            ¡Solo te faltan <strong>{remaining}</strong> para tu recompensa!
          </>
        ) : (
          <span className="text-green-600 font-bold">
            {" "}
            ¡Tienes una recompensa disponible!
          </span>
        )}
      </p>

      {rewardsAvailable > 0 && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-700 text-xs font-semibold flex items-center gap-2">
          <span className="text-lg">🎁</span>
          {rewardsAvailable} recompensa{rewardsAvailable > 1 ? "s" : ""}{" "}
          disponible{rewardsAvailable > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

// Tarjeta de consultas nutricionales (3+1 gratis)
function ConsultationCard({
  totalConsultations,
  freeAvailable,
}: {
  totalConsultations: number;
  freeAvailable: number;
}) {
  const cyclePosition = totalConsultations % 3;
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
      <div className="flex justify-between items-start mb-1">
        <p className="text-[#C5A55A] font-bold text-sm">
          Acumula 3 y la 4ta es GRATIS
        </p>
        <p className="text-gray-400 text-xs">Consultas nutricionales</p>
      </div>
      <p className="text-gray-600 text-xs mb-3">Cada consulta cuenta</p>

      <LoyaltyProgressBar
        current={cyclePosition}
        required={3}
        rewardLabel="1 GRATIS"
      />

      <p className="text-gray-700 text-sm mt-3">
        Ya llevas <strong>{cyclePosition}</strong> consulta
        {cyclePosition !== 1 ? "s" : ""} en este ciclo.
        {cyclePosition < 3 ? (
          <>
            {" "}
            ¡Solo te faltan <strong>{3 - cyclePosition}</strong> para tu
            consulta GRATIS!
          </>
        ) : (
          <span className="text-green-600 font-bold">
            {" "}
            ¡Tienes una consulta GRATIS disponible!
          </span>
        )}
      </p>

      {freeAvailable > 0 && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-700 text-xs font-semibold flex items-center gap-2">
          <span className="text-lg">🎁</span>
          {freeAvailable} consulta{freeAvailable > 1 ? "s" : ""} GRATIS
          disponible{freeAvailable > 1 ? "s" : ""}
        </div>
      )}

      <p className="text-gray-400 text-[10px] mt-2">
        Total histórico: {totalConsultations} consultas nutricionales
      </p>
    </div>
  );
}

// Transacción individual
function TransactionRow({ txn }: { txn: any }) {
  const isPositive = txn.amount >= 0;
  const typeLabels: Record<string, string> = {
    cashback: "Cashback",
    redeem: "Canje",
    bonus: "Bonificación",
    adjustment: "Ajuste",
    free_consultation: "Consulta gratis",
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {txn.description}
        </p>
        <p className="text-[10px] text-gray-400">
          {typeLabels[txn.type] || txn.type} · {formatDate(txn.createdAt)}
        </p>
      </div>
      <p
        className={`text-sm font-bold ml-3 ${
          isPositive ? "text-green-600" : "text-red-500"
        }`}
      >
        {isPositive ? "+" : ""}
        {formatMoney(txn.amount)}
      </p>
    </div>
  );
}

export default function WalletPage() {
  const { patient, isLoggedIn } = usePatientAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"card" | "loyalty" | "history">(
    "card"
  );
  const [copied, setCopied] = useState(false);

  // Check if we're on a QR-scanned route /monedero/:walletNumber
  const [matchRoute, params] = useRoute("/monedero/:walletNumber");
  const walletNumberFromUrl = matchRoute ? params?.walletNumber : null;

  // Fetch wallet data
  const walletQuery = trpc.wallet.getMyWallet.useQuery(
    { patientId: patient?.id || 0 },
    { enabled: isLoggedIn && !!patient?.id }
  );

  // Fetch active loyalty plans
  const plansQuery = trpc.wallet.getActivePlans.useQuery(undefined, {
    enabled: isLoggedIn,
  });

  const wallet = walletQuery.data?.wallet;
  const tracker = walletQuery.data?.tracker;
  const progressList = walletQuery.data?.progress || [];
  const transactions = walletQuery.data?.transactions || [];
  const plans = plansQuery.data || [];

  // QR URL: points to the wallet page for this user
  const qrUrl = wallet
    ? `https://nutriserpv.com/monedero/${wallet.walletNumber}`
    : "";

  const copyWalletNumber = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.walletNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col">
        <BackToSplash hideHome mobileBackTo="/memberships" />
        <div
          className="flex-1 flex flex-col items-center justify-center px-6"
          style={{ paddingTop: "env(safe-area-inset-top, 20px)" }}
        >
          <img
            src={LOGO_URL}
            alt="Nutriser"
            className="w-24 h-24 object-contain mb-6"
          />
          <h1 className="text-2xl font-bold text-[#C5A55A] mb-2 text-center">
            Monedero Nutriser
          </h1>
          <p className="text-gray-400 text-center mb-8 max-w-sm">
            Inicia sesión para ver tu tarjeta digital, saldo y beneficios
            exclusivos.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-[#C5A55A] text-white font-bold py-3 px-8 rounded-xl text-lg hover:bg-[#b8963f] transition-all"
          >
            Iniciar Sesión
          </button>
          <NutriserAuthModal
            isOpen={showAuth}
            onClose={() => setShowAuth(false)}
          />
        </div>
      </div>
    );
  }

  // Loading state
  if (walletQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center">
        <img
          src={LOGO_URL}
          alt="Nutriser"
          className="w-16 h-16 object-contain animate-pulse mb-4"
        />
        <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#C5A55A] rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
        </div>
        <p className="text-gray-500 text-sm mt-3">Cargando tu monedero...</p>
        <style>{`
          @keyframes loading {
            0% { width: 0%; }
            50% { width: 80%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#FAF7F2]"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <BackToSplash hideHome mobileBackTo="/memberships" />

      {/* Header */}
      <div className="bg-[#1A1A1A] pt-16 pb-6 px-4">
        <div className="max-w-md mx-auto text-center">
          <img
            src={LOGO_URL}
            alt="Nutriser"
            className="w-12 h-12 object-contain mx-auto mb-2"
          />
          <h1 className="text-xl font-bold text-[#C5A55A]">
            Monedero Nutriser
          </h1>
        </div>
      </div>

      {/* Tarjeta Digital */}
      <div className="max-w-md mx-auto px-4 -mt-4">
        <div className="bg-gradient-to-br from-[#1A1A1A] via-[#2a2a2a] to-[#1A1A1A] rounded-3xl p-5 shadow-2xl border border-[#C5A55A]/30 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A55A]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C5A55A]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            {/* Top row: logo + name */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img
                  src={LOGO_URL}
                  alt="Nutriser"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-[#C5A55A] font-bold text-sm tracking-wider">
                  NUTRISER
                </span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  wallet?.isActive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {wallet?.isActive ? "ACTIVA" : "INACTIVA"}
              </span>
            </div>

            {/* Card number */}
            <div className="mb-4">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">
                Número de tarjeta
              </p>
              <div className="flex items-center gap-2">
                <p className="text-white font-mono text-lg tracking-widest">
                  {wallet?.walletNumber || "---"}
                </p>
                <button
                  onClick={copyWalletNumber}
                  className="text-[#C5A55A] hover:text-[#d4b96e] transition-colors"
                  title="Copiar número"
                >
                  {copied ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Name + Balance row */}
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">
                  Titular
                </p>
                <p className="text-white font-semibold text-sm">
                  {patient?.name || "Usuario"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">
                  Saldo disponible
                </p>
                <p className="text-[#C5A55A] font-bold text-2xl">
                  {formatMoney(wallet?.balance || 0)}
                </p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white rounded-xl p-3">
                <QRCodeSVG
                  value={qrUrl || "https://nutriserpv.com/monedero"}
                  size={120}
                  level="M"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#1A1A1A"
                />
              </div>
            </div>
            <p className="text-gray-500 text-[10px] text-center mt-2">
              Escanea para acceder a tu monedero
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-md mx-auto px-4 mt-6">
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          {[
            { key: "card" as const, label: "Mi Tarjeta" },
            { key: "loyalty" as const, label: "Mis Planes" },
            { key: "history" as const, label: "Movimientos" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-[#1A1A1A] text-[#C5A55A]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-md mx-auto px-4 mt-4 pb-24">
        {/* Mi Tarjeta */}
        {activeTab === "card" && (
          <div>
            {/* Beneficios */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
              <h3 className="text-[#1A1A1A] font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#C5A55A]/10 rounded-full flex items-center justify-center text-[#C5A55A] text-xs">
                  ★
                </span>
                Beneficios de tu Monedero
              </h3>
              <div className="space-y-2">
                {[
                  "1% de cashback en cada compra verificada",
                  "Dinero electrónico para usar en Nutriser Shop y Cupones",
                  "3 consultas nutricionales → la 4ta es GRATIS",
                  "Planes de lealtad por productos: acumula y gana GRATIS",
                  "Historial completo de movimientos",
                  "QR único para acceder desde cualquier dispositivo",
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-[#C5A55A] mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-gray-600 text-xs">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">
                  Total acumulado
                </p>
                <p className="text-[#C5A55A] font-bold text-lg">
                  {formatMoney(wallet?.totalCashback || 0)}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">
                  Total canjeado
                </p>
                <p className="text-gray-700 font-bold text-lg">
                  {formatMoney(wallet?.totalRedeemed || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mis Planes de Lealtad */}
        {activeTab === "loyalty" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src={LOGO_URL}
                alt="Nutriser"
                className="w-6 h-6 object-contain"
              />
              <h2 className="text-[#1A1A1A] font-bold text-base">
                Mis Planes de Lealtad
              </h2>
            </div>
            <p className="text-gray-500 text-xs mb-4">
              Compra productos elegibles y consigue recompensas
            </p>

            {/* Consultation loyalty card (always shown) */}
            {tracker && (
              <ConsultationCard
                totalConsultations={tracker.nutritionConsultations}
                freeAvailable={
                  tracker.freeConsultationsEarned -
                  tracker.freeConsultationsUsed
                }
              />
            )}

            {/* Product/service loyalty plans */}
            {progressList.length > 0 ? (
              progressList.map((p: any) => (
                <LoyaltyPlanCard
                  key={p.id}
                  planName={p.plan.name}
                  productName={p.plan.productName}
                  current={p.currentCount}
                  required={p.plan.requiredPurchases}
                  rewardLabel={p.plan.rewardDescription || "1 GRATIS"}
                  rewardsAvailable={p.rewardsEarned - p.rewardsUsed}
                  expiresAt={p.plan.expiresAt}
                />
              ))
            ) : plans.length > 0 ? (
              plans.map((plan: any) => (
                <LoyaltyPlanCard
                  key={plan.id}
                  planName={plan.name}
                  productName={plan.productName}
                  current={0}
                  required={plan.requiredPurchases}
                  rewardLabel={plan.rewardDescription || "1 GRATIS"}
                  rewardsAvailable={0}
                  expiresAt={plan.expiresAt}
                />
              ))
            ) : (
              !tracker && (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">
                    Aún no tienes planes de lealtad activos.
                  </p>
                  <p className="text-gray-300 text-xs mt-1">
                    Compra en Nutriser Shop para comenzar a acumular.
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* Historial de Movimientos */}
        {activeTab === "history" && (
          <div>
            <h2 className="text-[#1A1A1A] font-bold text-base mb-4">
              Historial de Movimientos
            </h2>
            {transactions.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                {transactions.map((txn: any) => (
                  <TransactionRow key={txn.id} txn={txn} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">
                  No hay movimientos aún.
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  Tu cashback y canjes aparecerán aquí.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
