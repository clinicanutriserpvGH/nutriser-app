/**
 * Monedero Electrónico Nutriser
 * Tarjeta digital compacta arriba estilo Farmacias del Ahorro
 * Logo grande DENTRO de la tarjeta, código de barras/QR, saldo
 * Identidad visual: dorado (#C5A55A), crema (#FAF7F2), negro (#1A1A1A)
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Home, Sparkles, BookOpen, User, ChevronLeft, Download, X, Bell, BellRing, Mail, AlertCircle, Megaphone, PartyPopper, CheckCircle2, Trash2 } from "lucide-react";
import { usePatientAuth } from "@/hooks/usePatientAuth";
// NutriserAuthModal eliminado: desktop redirige a /mis-tratamientos
import { trpc } from "@/lib/trpc";
import { useRoute } from "wouter";
import { WalletCard as WalletCardCR80, WalletCardPrintSheet } from "@/components/WalletCardPrint";
import { NutriserWalletCard, QRFullscreenModal } from "@/components/NutriserWalletCard";
import ContractBlockModal from "@/components/ContractBlockModal";
import { toast } from "sonner";
import { t, type Lang } from "@/lib/i18n";

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

function LoyaltyPlanCard({ planName, productName, current, required, rewardLabel, rewardsAvailable, expiresAt, lang }: { planName: string; productName: string; current: number; required: number; rewardLabel: string; rewardsAvailable: number; expiresAt?: string | Date | null; lang: Lang }) {
  const remaining = required - current;
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
      <div className="flex justify-between items-start mb-1">
        <p className="text-[#C5A55A] font-bold text-sm">{planName}</p>
        {expiresAt && <p className="text-gray-400 text-xs">{lang === 'EN' ? 'Valid until' : 'Vigencia'} {formatDate(expiresAt)}</p>}
      </div>
      <p className="text-gray-600 text-xs mb-3">{lang === 'EN' ? 'Every purchase counts' : 'Cada compra cuenta'}</p>
      <LoyaltyProgressBar current={current} required={required} rewardLabel={rewardLabel} />
      <p className="text-gray-700 text-sm mt-3">
        {lang === 'EN'
          ? <>{`You have `}<strong>{current}</strong>{` purchase${current !== 1 ? 's' : ''} of `}<strong>{productName}</strong>{` accumulated.`}
              {remaining > 0 ? <> Only <strong>{remaining}</strong> more to go for your reward!</> : <span className="text-green-600 font-bold"> You have a reward available!</span>}
            </>
          : <>Ya llevas <strong>{current}</strong> compra{current !== 1 ? 's' : ''} de <strong>{productName}</strong> acumulada{current !== 1 ? 's' : ''}.
              {remaining > 0 ? <> ¡Solo te faltan <strong>{remaining}</strong> para tu recompensa!</> : <span className="text-green-600 font-bold"> ¡Tienes una recompensa disponible!</span>}
            </>
        }
      </p>
      {rewardsAvailable > 0 && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-700 text-xs font-semibold flex items-center gap-2">
          <span className="text-lg">🎁</span>
          {lang === 'EN' ? `${rewardsAvailable} reward${rewardsAvailable > 1 ? 's' : ''} available` : `${rewardsAvailable} recompensa${rewardsAvailable > 1 ? 's' : ''} disponible${rewardsAvailable > 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
}

function ConsultationCard({ totalConsultations, freeAvailable, lang }: { totalConsultations: number; freeAvailable: number; lang: Lang }) {
  const cyclePosition = totalConsultations % 3;
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
      <div className="flex justify-between items-start mb-1">
        <p className="text-[#C5A55A] font-bold text-sm">{lang === 'EN' ? 'Accumulate 3 and the 4th is FREE' : 'Acumula 3 y la 4ta es GRATIS'}</p>
        <p className="text-gray-400 text-xs">{t('nutritionConsultations', lang)}</p>
      </div>
      <p className="text-gray-600 text-xs mb-3">{lang === 'EN' ? 'Every consultation counts' : 'Cada consulta cuenta'}</p>
      <LoyaltyProgressBar current={cyclePosition} required={3} rewardLabel="1 GRATIS" />
      <p className="text-gray-700 text-sm mt-3">
        {lang === 'EN'
          ? <>{`You have `}<strong>{cyclePosition}</strong>{` consultation${cyclePosition !== 1 ? 's' : ''} in this cycle.`}
              {cyclePosition < 3 ? <> Only <strong>{3 - cyclePosition}</strong> more for your FREE consultation!</> : <span className="text-green-600 font-bold"> You have a FREE consultation available!</span>}
            </>
          : <>Ya llevas <strong>{cyclePosition}</strong> consulta{cyclePosition !== 1 ? 's' : ''} en este ciclo.
              {cyclePosition < 3 ? <> ¡Solo te faltan <strong>{3 - cyclePosition}</strong> para tu consulta GRATIS!</> : <span className="text-green-600 font-bold"> ¡Tienes una consulta GRATIS disponible!</span>}
            </>
        }
      </p>
      {freeAvailable > 0 && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-700 text-xs font-semibold flex items-center gap-2">
          <span className="text-lg">🎁</span>
          {lang === 'EN' ? `${freeAvailable} FREE consultation${freeAvailable > 1 ? 's' : ''} available` : `${freeAvailable} consulta${freeAvailable > 1 ? 's' : ''} GRATIS disponible${freeAvailable > 1 ? 's' : ''}`}
        </div>
      )}
      <p className="text-gray-400 text-[10px] mt-2">{t('totalHistoric', lang)} {totalConsultations} {t('nutritionConsultations', lang)}</p>
    </div>
  );
}

function TransactionRow({ txn, lang }: { txn: any; lang: Lang }) {
  const isPositive = txn.amount >= 0;
  const typeLabels: Record<string, string> = { cashback: t('txnCashback', lang), redeem: t('txnRedeem', lang), bonus: t('txnBonus', lang), adjustment: t('txnAdjustment', lang), free_consultation: t('txnFreeConsultation', lang) };
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
  // ─── Verificación de contrato pendiente ──────────────────────────────────────
  const [contractSigned, setContractSigned] = useState(false);
  const contractStatusQuery = trpc.wallet.checkContractStatus.useQuery(
    { email: patient?.email ?? '' },
    { enabled: isLoggedIn && !!patient?.email, refetchOnWindowFocus: true }
  );
  const contractBlocking = isLoggedIn && !!patient &&
    !contractSigned &&
    contractStatusQuery.data?.contractRequired === true &&
    !contractStatusQuery.data?.consentAcceptedAt;
  const [activeTab, setActiveTab] = useState<"card" | "loyalty" | "purchases" | "history" | "messages">("card");
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [currentNotifIndex, setCurrentNotifIndex] = useState(0);
  const [notifModalShown, setNotifModalShown] = useState(false);
  const lang: Lang = (() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("nutriser-lang") : null;
    return (saved === "EN" || saved === "ES") ? saved as Lang : "ES";
  })();

  // Solicitudes de interés en banners (desde DB)
  const bannerInterestsQuery = trpc.bannerInterests.myInterests.useQuery(
    { patientId: patient?.id },
    { enabled: isLoggedIn && !!patient?.id }
  );
  const myBannerInterests = (bannerInterestsQuery.data || []).filter((i: any) => i.status === 'pending');

  const purchasesQuery = trpc.patients.getMyPurchases.useQuery(
    { email: patient?.email ?? 'x@x.com', patientId: patient?.id },
    { enabled: isLoggedIn && !!patient?.email && activeTab === 'purchases' }
  );
  const myPurchases = purchasesQuery.data;
  const [copied, setCopied] = useState(false);
  const [showCardSheet, setShowCardSheet] = useState(false);
  const [showQRFullscreen, setShowQRFullscreen] = useState(false);
  const [showPhysicalCardDialog, setShowPhysicalCardDialog] = useState(false);
  const [physicalCardRequested, setPhysicalCardRequested] = useState(false);

  const requestPhysicalCard = trpc.physicalCard.request.useMutation({
    onSuccess: (data) => {
      setPhysicalCardRequested(true);
      setShowPhysicalCardDialog(false);
    },
  });

  const [matchRoute, params] = useRoute("/monedero/:walletNumber");
  const walletNumberFromUrl = matchRoute ? params?.walletNumber : null;

  const walletQuery = trpc.wallet.getMyWallet.useQuery(
    { patientId: patient?.id || 0 },
    { enabled: isLoggedIn && !!patient?.id }
  );

  const plansQuery = trpc.wallet.getActivePlans.useQuery(undefined, { enabled: isLoggedIn });

  const cashPendingQuery = trpc.cashPayments.getMyPending.useQuery(
    { walletId: walletQuery.data?.wallet?.id || 0 },
    { enabled: isLoggedIn && !!walletQuery.data?.wallet?.id }
  );
  const cashPendingList = cashPendingQuery.data || [];

  // ── Notificaciones del Admin ──
  const adminNotifsQuery = trpc.adminNotifs.getByWalletId.useQuery(
    { walletId: walletQuery.data?.wallet?.id || 0 },
    { enabled: isLoggedIn && !!walletQuery.data?.wallet?.id }
  );
  const adminNotifs: any[] = adminNotifsQuery.data || [];
  const unreadNotifs = adminNotifs.filter((n: any) => !n.isRead);
  const unreadCount = unreadNotifs.length;

  const markReadMutation = trpc.adminNotifs.markRead.useMutation({
    onSuccess: () => adminNotifsQuery.refetch(),
  });
  const markAllReadMutation = trpc.adminNotifs.markAllRead.useMutation({
    onSuccess: () => adminNotifsQuery.refetch(),
  });

  // Lógica del modal automático:
  // - Mensajes de COBRO: aparecen SIEMPRE al abrir el monedero (hasta que el admin los elimine)
  // - Otros tipos (promocion, felicitacion, general): solo aparecen si no han sido leídos
  const cobrosActivos = adminNotifs.filter((n: any) => n.type === 'cobro');
  const otrosNoLeidos = adminNotifs.filter((n: any) => n.type !== 'cobro' && !n.isRead);
  const notifsParaModal = [...cobrosActivos, ...otrosNoLeidos];

  useEffect(() => {
    if (!notifModalShown && notifsParaModal.length > 0 && !walletQuery.isLoading && !adminNotifsQuery.isLoading) {
      setCurrentNotifIndex(0);
      setShowNotifModal(true);
      setNotifModalShown(true);
    }
  }, [notifsParaModal.length, walletQuery.isLoading, adminNotifsQuery.isLoading, notifModalShown]);

  const wallet = walletQuery.data?.wallet;
  const tracker = walletQuery.data?.tracker;
  const progressList = walletQuery.data?.progress || [];
  const transactions = walletQuery.data?.transactions || [];
  const plans = plansQuery.data || [];

  const qrUrl = wallet ? `https://nutriserpv.com/c/${wallet.walletNumber}` : "";

  const physicalCardStatusQuery = trpc.physicalCard.getMyStatus.useQuery(
    { walletId: wallet?.id || 0 },
    { enabled: !!wallet?.id }
  );
  const hasExistingRequest = physicalCardStatusQuery.data?.hasRequest === true;
  const physicalCardStatusLabel = (() => {
    const s = physicalCardStatusQuery.data?.status;
    if (s === 'pending') return t('requestSent', lang);
    if (s === 'printed') return t('inPreparation', lang);
    if (s === 'delivered') return t('cardDelivered', lang);
    return null;
  })();

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
            <ChevronLeft className="w-4 h-4" /> {t('back', lang).toUpperCase()}
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <img src={LOGO_URL} alt="Nutriser" className="w-24 h-24 object-contain mb-6" />
          <h1 className="text-2xl font-bold text-[#C5A55A] mb-2 text-center">{t('walletNutriser', lang)}</h1>
          <p className="text-gray-400 text-center mb-8 max-w-sm">{t('walletLoginDesc', lang)}</p>
          <button onClick={() => setLocation("/mis-tratamientos?returnTo=/monedero")} className="bg-[#C5A55A] text-white font-bold py-3 px-8 rounded-xl text-lg hover:bg-[#b8963f] transition-all">
            {t('signIn', lang)}
          </button>
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
        <p className="text-gray-500 text-sm mt-3">{t('walletLoading', lang)}</p>
        <style>{`@keyframes loading { 0% { width: 0%; } 50% { width: 80%; } 100% { width: 100%; } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      {/* ── Modal bloqueante de contrato de consentimiento ── */}
      {contractBlocking && patient && (
        <ContractBlockModal
          patientId={patient.id}
          patientName={patient.name}
          onSigned={() => {
            setContractSigned(true);
            contractStatusQuery.refetch();
          }}
        />
      )}
      {/* Header — simple back button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button onClick={() => setLocation("/memberships")} className="text-gray-600 hover:text-gray-800 mr-3">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-[#1A1A1A]">{t('walletNutriser', lang)}</h1>
      </div>

      {/* ── Tarjeta CR-80 (formato tarjeta de crédito 85.5×54mm) ── */}
      <div className="px-4 pt-4 pb-2">
        <div className="max-w-md mx-auto">
          {/* Tarjeta CR-80 escalada para pantalla móvil — clickeable para abrir sheet */}
          <button
            onClick={() => setShowCardSheet(true)}
            className="block cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
            style={{ width: 323 * 0.88, height: 204 * 0.88, position: "relative", background: "none", border: "none", padding: 0 }}
            title="Ver tarjeta completa"
          >
            <WalletCardCR80
              card={{
                patientName: patient?.name || "Usuario",
                walletNumber: wallet?.walletNumber || "---",
                qrUrl: qrUrl || "https://nutriserpv.com/monedero",
                isActive: wallet?.isActive ?? true,
              }}
              scale={0.88}
            />
          </button>

          {/* Banner de monedero suspendido */}
          {wallet && !wallet.isActive && (
            <div className="mt-3 bg-red-50 border border-red-300 rounded-2xl px-4 py-3 flex items-start gap-3">
              <span className="text-xl mt-0.5">🚫</span>
              <div>
                <p className="text-red-700 font-bold text-sm">Monedero Suspendido</p>
                <p className="text-red-600 text-xs mt-0.5">
                  Tu monedero ha sido dado de baja temporalmente. Para reactivarlo, comunícate con Nutriser.
                </p>
              </div>
            </div>
          )}
          {/* Saldo + acciones debajo de la tarjeta */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-3 px-5 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">{t('availableBalance', lang)}</p>
                <p className="text-[#C5A55A] font-black text-2xl">{formatMoney(wallet?.balance || 0)}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <button
                  onClick={() => setActiveTab("history")}
                  className="text-[#C5A55A] text-xs font-semibold hover:underline"
                >
                  {t('viewStatement', lang)}
                </button>
                {hasExistingRequest ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: physicalCardStatusQuery.data?.status === 'delivered' ? '#34d399' : '#C5A55A' }}>
                    <Download className="w-3 h-3" />
                    {physicalCardStatusLabel}
                  </span>
                ) : (
                  <button
                    onClick={() => setShowPhysicalCardDialog(true)}
                    className="flex items-center gap-1 text-[#C5A55A] text-[10px] hover:text-[#b8963f] transition-colors font-semibold"
                    title="Solicitar tarjeta física"
                  >
                    <Download className="w-3 h-3" />
                    {t('requestPhysicalCard', lang)}
                  </button>
                )}
              </div>
            </div>
            {/* Badge de descuento activo */}
            {wallet?.discountPercent && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold rounded-full px-2.5 py-1 w-fit bg-[#C5A55A]/10 text-[#8B6914] border border-[#C5A55A]/40">
                <span>🏷️</span>
                <span>Tienes {wallet.discountPercent}% de descuento activo en tus compras</span>
              </div>
            )}

            {/* Fecha de caducidad bimestral */}
            {wallet?.balanceExpiresAt && wallet.balance > 0 && (() => {
              const expiry = new Date(wallet.balanceExpiresAt);
              const now = new Date();
              const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isExpiringSoon = daysLeft <= 14;
              return (
                <div className={`mt-2 flex items-center gap-1.5 text-[10px] font-semibold rounded-full px-2.5 py-1 w-fit ${
                  isExpiringSoon
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {isExpiringSoon
                    ? `${t('balanceExpiresSoon', lang)} ${daysLeft} ${daysLeft !== 1 ? t('balanceDays', lang) : t('balanceExpiresDay', lang)}!`
                    : `${t('validUntil', lang)} ${expiry.toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  }
                </div>
              );
            })()}
          </div>

          {/* Contenido oculto para impresión — solo se muestra al imprimir */}
          <div className="print-only" style={{ display: "none" }}>
            <WalletCardPrintSheet
              cards={[{
                patientName: patient?.name || "Usuario",
                walletNumber: wallet?.walletNumber || "---",
                qrUrl: qrUrl || "https://nutriserpv.com/monedero",
                isActive: wallet?.isActive ?? true,
              }]}
            />
          </div>
        </div>
      </div>

      {/* Tabs — scroll horizontal para que no se amontonen en pantallas pequeñas */}
      <div className="max-w-md mx-auto px-4 mt-3">
        <div
          className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 gap-0.5"
          style={{ overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {[
            { key: "card" as const, label: 'Tarjeta' },
            { key: "loyalty" as const, label: 'Planes' },
            { key: "purchases" as const, label: 'Compras' },
            { key: "history" as const, label: 'Movimientos' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 py-2 px-3 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.key ? "bg-[#1A1A1A] text-[#C5A55A]" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {/* Pestaña Mensajes con contador */}
          <button
            onClick={() => {
              setActiveTab("messages");
              if (unreadCount > 0 && wallet?.walletNumber) {
                markAllReadMutation.mutate({ walletNumber: wallet.walletNumber });
              }
            }}
            className={`relative flex-shrink-0 py-2 px-3 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === "messages" ? "bg-[#1A1A1A] text-[#C5A55A]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Bell className="w-3 h-3" />
            Mensajes
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-md mx-auto px-4 mt-4 pb-32">
        {activeTab === "card" && (
          <div>
            {/* ─── Solicitudes de interés en promociones (desde DB) ─── */}
            {myBannerInterests.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="w-2 h-2 rounded-full bg-[#C5A55A] animate-pulse" />
                  <p className="text-[#C5A55A] text-[11px] font-bold uppercase tracking-wider">Promociones registradas</p>
                </div>
                <div className="space-y-3">
                  {myBannerInterests.map((interest: any) => (
                    <div key={interest.id} className="bg-[#1A1A1A] rounded-2xl overflow-hidden relative border border-[#C5A55A]/30">
                      {/* Franja dorada decorativa */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C5A55A] via-[#E8D5A3] to-[#C5A55A]" />
                      <div className="p-4 pt-5">
                        <div className="flex items-start gap-3">
                          {interest.bannerImageUrl && (
                            <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black border border-[#C5A55A]/20">
                              <img src={interest.bannerImageUrl} alt={interest.bannerTitle || 'Promo'} className="w-full h-full object-contain" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[#C5A55A] text-[10px] font-bold uppercase tracking-wider mb-0.5">🏷️ Interés registrado</p>
                            <p className="text-white font-bold text-sm leading-tight">{interest.bannerTitle || 'Promoción Nutriser'}</p>
                            <p className="text-white/50 text-[11px] mt-1">
                              {new Date(interest.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <span className="flex-shrink-0 bg-[#C5A55A]/20 text-[#C5A55A] text-[10px] font-bold px-2 py-1 rounded-full">Pendiente</span>
                        </div>
                        <p className="text-white/40 text-[11px] mt-2 pl-0">
                          Preséntate en la clínica con tu Monedero Nutriser. El equipo te dará el precio y lo acreditará a tu saldo.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pagos en Efectivo Pendientes */}
            {cashPendingList.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
                <h3 className="text-orange-800 font-bold text-sm mb-3 flex items-center gap-2">
                  <span className="text-lg">💵</span>
                  {t('cashPendingSection', lang)}
                </h3>
                <div className="space-y-2">
                  {cashPendingList.map((p: any) => (
                    <div key={p.id} className="bg-white rounded-xl border border-orange-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{p.concept}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{new Date(p.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          {p.notes && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.notes}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-orange-700 font-black text-base">${(p.amountCents / 100).toFixed(2)}</p>
                          <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">{t('statusPending', lang).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-orange-600 mt-3 text-center">
                  {t('presentWallet', lang)}
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
              <h3 className="text-[#1A1A1A] font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#C5A55A]/10 rounded-full flex items-center justify-center text-[#C5A55A] text-xs">★</span>
                {t('walletBenefits', lang)}
              </h3>
              <div className="space-y-2">
                {[
                  t('benefit1', lang),
                  t('benefit2', lang),
                  t('benefit3', lang),
                  t('benefit4', lang),
                  t('benefit5', lang),
                  t('benefit6', lang),
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
                <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t('totalAccumulated', lang)}</p>
                <p className="text-[#C5A55A] font-bold text-lg">{formatMoney(wallet?.totalCashback || 0)}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t('totalRedeemed', lang)}</p>
                <p className="text-gray-700 font-bold text-lg">{formatMoney(wallet?.totalRedeemed || 0)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "loyalty" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={LOGO_URL} alt="Nutriser" className="w-6 h-6 object-contain" />
              <h2 className="text-[#1A1A1A] font-bold text-base">{t('myLoyaltyPlans', lang)}</h2>
            </div>
            <p className="text-gray-500 text-xs mb-4">{t('loyaltySubtitle', lang)}</p>
            {tracker && (
              <ConsultationCard totalConsultations={tracker.nutritionConsultations} freeAvailable={tracker.freeConsultationsEarned - tracker.freeConsultationsUsed} lang={lang} />
            )}
            {progressList.length > 0 ? (
              progressList.map((p: any) => (
                <LoyaltyPlanCard key={p.id} planName={p.plan.name} productName={p.plan.productName} current={p.currentCount} required={p.plan.requiredPurchases} rewardLabel={p.plan.rewardDescription || "1 GRATIS"} rewardsAvailable={p.rewardsEarned - p.rewardsUsed} expiresAt={p.plan.expiresAt} lang={lang} />
              ))
            ) : plans.length > 0 ? (
              plans.map((plan: any) => (
                <LoyaltyPlanCard key={plan.id} planName={plan.name} productName={plan.productName} current={0} required={plan.requiredPurchases} rewardLabel={plan.rewardDescription || "1 GRATIS"} rewardsAvailable={0} expiresAt={plan.expiresAt} lang={lang} />
              ))
            ) : (
              !tracker && (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">{t('noLoyaltyPlans', lang)}</p>
                  <p className="text-gray-300 text-xs mt-1">{t('noLoyaltyPlansDesc', lang)}</p>
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
                <h3 className="text-[#1A1A1A] font-bold text-sm">{t('myPurchases', lang)}</h3>
              </div>
              <p className="text-gray-500 text-xs">{t('myPurchasesDesc', lang)}</p>
            </div>

            {purchasesQuery.isLoading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-2 border-[#C5A55A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-400 text-xs">{t('loadingPurchases', lang)}</p>
              </div>
            ) : (
              <>
                {/* Paquetes */}
                {(myPurchases?.packages?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{t('packagesSection', lang)}</p>
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
                              {pkg.verifiedAt && <p className="text-gray-400 text-xs mt-0.5">{t('verifiedAt', lang)} {new Date(pkg.verifiedAt).toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</p>}
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              pkg.status === 'verified' ? 'bg-green-50 text-green-700' :
                              pkg.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {pkg.status === 'verified' ? t('statusActive', lang) : pkg.status === 'pending' ? t('statusPending', lang) : t('statusRejected', lang)}
                            </span>
                          </div>
                          {pkg.status === 'verified' && pkg.accessCode && (
                            <div className="mt-2 bg-gray-50 rounded-xl px-3 py-1.5 flex items-center gap-2">
                              <span className="text-gray-400 text-xs">{t('codeLabel', lang)}</span>
                              <span className="text-[#C5A55A] font-mono font-black text-sm tracking-widest">{pkg.accessCode}</span>
                            </div>
                          )}
                          {pkg.status === 'pending' && <p className="text-yellow-600 text-xs mt-2">{t('pendingReview', lang)}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Servicios */}
                {(myPurchases?.services?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{t('servicesSection', lang)}</p>
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
                              {svc.approvedAt && <p className="text-gray-400 text-xs mt-0.5">{t('authorizedAt', lang)} {new Date(svc.approvedAt).toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</p>}
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              svc.status === 'approved' ? 'bg-green-50 text-green-700' :
                              svc.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {svc.status === 'approved' ? t('statusActive', lang) : svc.status === 'pending' ? t('statusPending', lang) : t('statusRejected', lang)}
                            </span>
                          </div>
                          {svc.status === 'approved' && svc.serviceCode && (
                            <div className="mt-2 bg-gray-50 rounded-xl px-3 py-1.5 flex items-center gap-2">
                              <span className="text-gray-400 text-xs">{t('codeLabel', lang)}</span>
                              <span className="text-[#C5A55A] font-mono font-black text-sm tracking-widest">{svc.serviceCode}</span>
                            </div>
                          )}
                          {svc.status === 'pending' && <p className="text-yellow-600 text-xs mt-2">{t('pendingServiceReview', lang)}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cupones */}
                {(myPurchases?.coupons?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{t('couponsSection', lang)}</p>
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
                                <p className="text-gray-500 text-xs mt-0.5">{t('validUntilLabel', lang)} {new Date(c.expiresAt).toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                              )}
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              c.status === 'approved' ? 'bg-green-50 text-green-700' :
                              c.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                              c.status === 'used' ? 'bg-gray-100 text-gray-500' :
                              c.status === 'expired' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {c.status === 'approved' ? t('statusActive', lang) : c.status === 'pending' ? t('statusPending', lang) : c.status === 'used' ? t('statusUsed', lang) : c.status === 'expired' ? t('statusExpired', lang) : t('statusRejected', lang)}
                            </span>
                          </div>
                          {c.couponCode && c.status === 'approved' && (
                            <div className="mt-2 bg-gray-50 rounded-xl px-3 py-1.5 flex items-center gap-2">
                              <span className="text-gray-400 text-xs">{t('codeLabel', lang)}</span>
                              <span className="text-[#C5A55A] font-mono font-black text-sm tracking-widest">{c.couponCode}</span>
                            </div>
                          )}
                          {c.status === 'pending' && <p className="text-yellow-600 text-xs mt-2">{t('pendingCouponReview', lang)}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Productos */}
                {(myPurchases?.products?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{lang === 'EN' ? 'Products' : 'Productos'}</p>
                    <div className="space-y-3">
                      {myPurchases!.products.map((prod: any) => (
                        <div key={prod.id} className={`bg-white rounded-2xl p-4 border shadow-sm ${
                          prod.status === 'verified' ? 'border-green-200' :
                          prod.status === 'rejected' ? 'border-red-200' : 'border-yellow-200'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[#1A1A1A] font-bold text-sm">{prod.productName}</p>
                              {prod.originalPrice && <p className="text-gray-500 text-xs mt-0.5 line-through">{prod.originalPrice}</p>}
                              <p className="text-gray-400 text-xs mt-0.5">{new Date(prod.createdAt).toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              prod.status === 'verified' ? 'bg-green-50 text-green-700' :
                              prod.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {prod.status === 'verified' ? (lang === 'EN' ? 'Verified' : 'Verificado') : prod.status === 'pending' ? (lang === 'EN' ? 'Pending' : 'Pendiente') : (lang === 'EN' ? 'Rejected' : 'Rechazado')}
                            </span>
                          </div>
                          {prod.purchaseCode && (
                            <div className="mt-2 bg-gray-50 rounded-xl px-3 py-1.5 flex items-center gap-2">
                              <span className="text-gray-400 text-xs">{t('codeLabel', lang)}</span>
                              <span className="text-[#C5A55A] font-mono font-black text-sm tracking-widest">{prod.purchaseCode}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ebooks / Academia */}
                {(myPurchases?.ebooks?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{lang === 'EN' ? 'Library / Academy' : 'Librería / Academia'}</p>
                    <div className="space-y-3">
                      {myPurchases!.ebooks.map((eb: any) => (
                        <div key={eb.id} className={`bg-white rounded-2xl p-4 border shadow-sm ${
                          eb.status === 'approved' ? 'border-green-200' :
                          eb.status === 'rejected' ? 'border-red-200' : 'border-yellow-200'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3">
                              {eb.ebookImageUrl && (
                                <img src={eb.ebookImageUrl} alt={eb.ebookTitle} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                              )}
                              <div>
                                <p className="text-[#1A1A1A] font-bold text-sm">{eb.ebookTitle ?? 'eBook'}</p>
                                {eb.ebookPrice && <p className="text-gray-500 text-xs mt-0.5">${eb.ebookPrice} MXN</p>}
                                <p className="text-gray-400 text-xs mt-0.5">{new Date(eb.createdAt).toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                              </div>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              eb.status === 'approved' ? 'bg-green-50 text-green-700' :
                              eb.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {eb.status === 'approved' ? (lang === 'EN' ? 'Active' : 'Activo') : eb.status === 'pending' ? (lang === 'EN' ? 'Pending' : 'Pendiente') : (lang === 'EN' ? 'Rejected' : 'Rechazado')}
                            </span>
                          </div>
                          {eb.status === 'approved' && eb.accessToken && (
                            <div className="mt-2">
                              <a href={`/ebook/${eb.accessToken}`} className="inline-flex items-center gap-1 text-[#C5A55A] text-xs font-bold hover:underline">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                {lang === 'EN' ? 'Read eBook' : 'Leer eBook'}
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pagos en clínica confirmados */}
                {(myPurchases?.cashPayments?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{lang === 'EN' ? 'Clinic Payments' : 'Pagos en Clínica'}</p>
                    <div className="space-y-3">
                      {myPurchases!.cashPayments.map((cp: any) => (
                        <div key={cp.id} className="bg-white rounded-2xl p-4 border border-green-200 shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[#1A1A1A] font-bold text-sm">{cp.concept}</p>
                              <p className="text-gray-500 text-xs mt-0.5">${(cp.amountCents / 100).toFixed(2)} MXN</p>
                              {cp.confirmedAt && <p className="text-gray-400 text-xs mt-0.5">{lang === 'EN' ? 'Paid on' : 'Pagado el'} {new Date(cp.confirmedAt).toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</p>}
                            </div>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 bg-green-50 text-green-700">
                              {lang === 'EN' ? 'Confirmed' : 'Confirmado'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estado vacío */}
                {(myPurchases?.packages?.length ?? 0) === 0 &&
                 (myPurchases?.services?.length ?? 0) === 0 &&
                 (myPurchases?.coupons?.length ?? 0) === 0 &&
                 (myPurchases?.products?.length ?? 0) === 0 &&
                 (myPurchases?.ebooks?.length ?? 0) === 0 &&
                 (myPurchases?.cashPayments?.length ?? 0) === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <p className="text-gray-500 text-sm">{t('noPurchases', lang)}</p>
                    <p className="text-gray-400 text-xs mt-1">{t('noPurchasesDesc', lang)}</p>
                    {patient?.email && (
                      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 inline-block text-left">
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-1">{t('linkedAccount', lang)}</p>
                        <p className="text-gray-700 text-xs font-mono">{patient.email}</p>
                        <p className="text-gray-400 text-[10px] mt-1">{t('sameEmailNote', lang)}</p>
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
            <h2 className="text-[#1A1A1A] font-bold text-base mb-4">{t('movementsTitle', lang)}</h2>
            {transactions.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                {transactions.map((txn: any) => (
                  <TransactionRow key={txn.id} txn={txn} lang={lang} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">{t('noMovements', lang)}</p>
                <p className="text-gray-300 text-xs mt-1">{t('noMovementsDesc', lang)}</p>
              </div>
            )}
          </div>
        )}

        {/* ── PESTAÑA MENSAJES ── */}
        {activeTab === "messages" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#1A1A1A] font-bold text-base flex items-center gap-2">
                <BellRing className="w-5 h-5 text-[#C5A55A]" />
                Mensajes de Nutriser
              </h2>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} sin leer
                </span>
              )}
            </div>
            {adminNotifsQuery.isLoading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-2 border-[#C5A55A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-400 text-xs">Cargando mensajes...</p>
              </div>
            ) : adminNotifs.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">Sin mensajes</p>
                <p className="text-gray-300 text-xs mt-1">Aquí aparecerán los mensajes de Nutriser</p>
              </div>
            ) : (
              <div className="space-y-3">
                {adminNotifs.map((notif: any, idx: number) => {
                  const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string; label: string }> = {
                    cobro: { icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Cobro' },
                    promocion: { icon: <Megaphone className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Promoción' },
                    felicitacion: { icon: <PartyPopper className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Felicitación' },
                    general: { icon: <Bell className="w-5 h-5" />, color: 'text-[#C5A55A]', bg: 'bg-[#C5A55A]/5', border: 'border-[#C5A55A]/20', label: 'General' },
                  };
                  const cfg = typeConfig[notif.type] || typeConfig.general;
                  return (
                    <div key={notif.id} className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border} ${!notif.isRead ? 'ring-2 ring-offset-1 ring-[#C5A55A]/40' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color} bg-white shadow-sm`}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                            {!notif.isRead && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
                          </div>
                          <p className="text-[#1A1A1A] font-bold text-sm">{notif.title}</p>
                          <p className="text-gray-600 text-xs mt-1 leading-relaxed">{notif.message}</p>
                          {notif.imageUrl && (
                            <img src={notif.imageUrl} alt="" className="mt-2 w-full rounded-xl object-cover max-h-40" />
                          )}
                          <p className="text-gray-400 text-[10px] mt-2">
                            {new Date(notif.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
              <span className="text-[10px] font-medium text-gray-400">{t('navHome', lang)}</span>
            </button>
            <button onClick={() => setLocation("/memberships")} className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[60px]">
              <Sparkles className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">{t('navStore', lang)}</span>
            </button>
            <div className="flex flex-col items-center -mt-5">
              <div className="w-14 h-14 rounded-full bg-white border-4 border-[#C5A55A] shadow-lg flex items-center justify-center mb-0.5">
                <img src={LOGO_URL} alt="Monedero" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-[10px] font-bold text-[#C5A55A]">{t('navWallet', lang)}</span>
            </div>
            <button onClick={() => setLocation("/memberships")} className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[60px]">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">{t('navLibrary', lang)}</span>
            </button>
            <button onClick={() => setLocation("/memberships")} className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[60px]">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">{t('navAccount', lang)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Diálogo: Solicitar tarjeta física ── */}
      {showPhysicalCardDialog && wallet && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowPhysicalCardDialog(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-md px-6 pt-6 pb-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#C5A55A]/10 rounded-2xl flex items-center justify-center">
                <Download className="w-6 h-6 text-[#C5A55A]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A]">{t('physicalCardTitle', lang)}</h3>
                <p className="text-xs text-gray-400">{t('physicalCardSubtitle', lang)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('physicalCardDesc', lang)}
            </p>
            <div className="bg-[#FAF7F2] rounded-xl p-3 mb-5 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#C5A55A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[#C5A55A] text-xs font-bold">QR</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1A1A1A]">{patient?.name}</p>
                <p className="text-[10px] text-gray-400 font-mono">{wallet.walletNumber}</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!wallet) return;
                requestPhysicalCard.mutate({
                  walletId: wallet.id,
                  patientName: patient?.name || "Paciente",
                  walletNumber: wallet.walletNumber,
                  patientEmail: patient?.email || undefined,
                });
              }}
              disabled={requestPhysicalCard.isPending}
              className="w-full bg-[#C5A55A] text-white font-bold py-3.5 rounded-2xl text-sm hover:bg-[#b8963f] transition-all disabled:opacity-60"
            >
              {requestPhysicalCard.isPending ? t('sendingRequest', lang) : t('confirmRequest', lang)}
            </button>
            <button
              onClick={() => setShowPhysicalCardDialog(false)}
              className="w-full mt-3 text-gray-400 text-sm py-2"
            >
              {t('cancel', lang)}
            </button>
          </div>
        </div>
      )}

      {/* ══ MODAL AUTOMÁTICO DE NOTIFICACIÓN DEL ADMIN ══ */}
      {/* Aparece SIEMPRE que haya notificaciones — hasta que el admin las elimine */}
      {showNotifModal && notifsParaModal.length > 0 && (() => {
        const notif = notifsParaModal[currentNotifIndex];
        if (!notif) return null;
        const typeConfig: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
          cobro: { color: 'text-red-600', bg: 'bg-red-50', label: 'Cobro pendiente', emoji: '💳' },
          promocion: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Promoción especial', emoji: '🎁' },
          felicitacion: { color: 'text-green-600', bg: 'bg-green-50', label: '¡Felicitaciones!', emoji: '🎉' },
          general: { color: 'text-[#C5A55A]', bg: 'bg-[#C5A55A]/10', label: 'Mensaje de Nutriser', emoji: '🔔' },
        };
        const cfg = typeConfig[notif.type] || typeConfig.general;
        return (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          >
            <div
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
              style={{ animation: 'fadeInScale 0.3s ease-out' }}
            >
              {/* Header de color según tipo */}
              <div className={`${cfg.bg} px-6 pt-6 pb-4 text-center`}>
                <div className="text-4xl mb-2">{cfg.emoji}</div>
                <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                {notifsParaModal.length > 1 && (
                  <div className="mt-1 flex items-center justify-center gap-1">
                    {notifsParaModal.map((_: any, i: number) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentNotifIndex ? 'bg-[#C5A55A] w-3' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                )}
              </div>
              {/* Contenido */}
              <div className="px-6 py-4">
                <h3 className="text-[#1A1A1A] font-black text-lg text-center mb-2">{notif.title}</h3>
                <p className="text-gray-600 text-sm text-center leading-relaxed">{notif.message}</p>
                {notif.imageUrl && (
                  <img src={notif.imageUrl} alt="" className="mt-3 w-full rounded-xl object-cover max-h-36" />
                )}
                <p className="text-gray-400 text-[10px] text-center mt-3">
                  {new Date(notif.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {/* Botones — navegar entre notificaciones o cerrar */}
              <div className="px-6 pb-6 flex flex-col gap-2">
                {currentNotifIndex < notifsParaModal.length - 1 ? (
                  <>
                    <button
                      onClick={() => setCurrentNotifIndex(i => i + 1)}
                      className="w-full bg-[#C5A55A] text-white font-bold py-3 rounded-2xl text-sm hover:bg-[#b8963f] transition-all"
                    >
                      Ver siguiente ({currentNotifIndex + 1}/{notifsParaModal.length})
                    </button>
                    <button
                      onClick={() => setShowNotifModal(false)}
                      className="w-full text-gray-400 text-sm py-2"
                    >
                      Cerrar por ahora
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowNotifModal(false)}
                    className="w-full bg-[#1A1A1A] text-[#C5A55A] font-bold py-3 rounded-2xl text-sm hover:bg-[#2D2D2D] transition-all"
                  >
                    Entendido
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Toast de éxito */}
      {physicalCardRequested && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2">
          <span>&#10003;</span> {t('requestSuccess', lang)}
          <button onClick={() => setPhysicalCardRequested(false)} className="ml-2 text-white/70 hover:text-white">×</button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SHEET — TARJETA ELEGANTE (al hacer clic en la tarjeta)
      ══════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL QR PANTALLA COMPLETA ── */}
      <QRFullscreenModal
        open={showQRFullscreen}
        onClose={() => setShowQRFullscreen(false)}
        qrUrl={qrUrl || 'https://nutriserpv.com/monedero'}
        patientName={patient?.name || '---'}
        walletNumber={wallet?.walletNumber || '---'}
      />

      {showCardSheet && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center md:justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCardSheet(false)} />
          {/* Sheet */}
          <div
            className="relative w-full md:max-w-[420px] md:rounded-3xl md:mx-auto bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ animation: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'fadeInScale 0.25s ease-out' : 'slideUp 0.3s ease-out' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1A1A1A]">{t('walletNutriser', lang)}</h2>
              <button onClick={() => setShowCardSheet(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Tarjeta grande — NutriserWalletCard unificado */}
            <div className="px-5 pt-5 pb-3">
              <NutriserWalletCard
                patientName={patient?.name || '---'}
                walletNumber={wallet?.walletNumber || '---'}
                qrUrl={qrUrl || 'https://nutriserpv.com/monedero'}
                isActive={wallet?.isActive ?? true}
                balance={wallet?.balance ?? 0}
                showBalance={true}
                onQRClick={() => setShowQRFullscreen(true)}
                discountPercent={wallet?.discountPercent ?? null}
              />
            </div>
            {/* Saldo y validez */}
            <div className="px-5 pb-2">
              <div className="bg-[#FAF7F2] rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">{t('availableBalance', lang)}</p>
                  <p className="text-[#C5A55A] font-black text-2xl">{formatMoney(wallet?.balance || 0)}</p>
                </div>
                {wallet?.balanceExpiresAt && wallet.balance > 0 && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold rounded-full px-2.5 py-1">
                    {t('validUntil', lang)} {new Date(wallet.balanceExpiresAt).toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
            {/* Botón cerrar / ir al monedero */}
            <div className="px-5 pb-8 pt-2">
              <button
                onClick={() => setShowCardSheet(false)}
                className="w-full bg-[#1A1A1A] text-white font-bold py-4 rounded-2xl text-base hover:bg-[#2D2D2D] active:scale-[0.98] transition-all shadow-lg"
              >
                {t('close', lang)}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes fadeInScale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}</style>
        </div>
      )}

    </div>
  );
}
