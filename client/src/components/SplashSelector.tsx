/**
 * SplashSelector — Splash 1: Hub de servicios Nutriser
 *
 * Estructura:
 *   - Header: Logo + "Iniciar sesión" / "Hola, [Nombre]" + Cerrar sesión
 *   - 3 tarjetas: Nutriser Shop | Nutriser Academy | Mis Tratamientos
 *   - Botón Regresar → Splash 0
 *
 * La sesión es compartida con Shop, Academy y Mis Tratamientos.
 */
import { useState } from "react";
import {
  Bell, BellRing, Check, Globe, GraduationCap, Loader2,
  LogIn, LogOut, Moon, ShoppingBag, Sparkles, Sun, User, X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { checkIOSPushReadiness, isPushSupported, subscribeToPush, isIOSDevice, isPWAStandalone, isWKWebView as checkIsWKWebView, isNativeApp as checkIsNativeApp, requestNativePushPermission, isAnyPushAvailable } from "@/lib/pushHelper";
import { useSplashTheme } from "@/contexts/SplashThemeContext";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import NutriserAuthModal from "@/components/NutriserAuthModal";

/* ─── Assets ────────────────────────────────────────────────────────────── */
const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const CLINIC_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-shop-entrance-v4-HUPan3L87bBgmsrQt8NsWo.webp";
const IMG_ACADEMY =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-academy-hub-v2-B6bpVdHqtSSKFqZdAvvqyS.webp";
const IMG_TRATAMIENTOS =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-tratamientos-hub-LYqQYtUBc3Ef5CpkjsG9yP.webp";

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface SplashSelectorProps {
  onEnterSite: () => void;
  onNavigate?: (path: string) => void;
  isTransitioning?: boolean;
  onBack?: () => void;
}

/* ─── Toggle Tema ───────────────────────────────────────────────────────── */
function ThemeToggle({ isLight, isAuto, onToggle, onResetAuto }: {
  isLight: boolean; isAuto: boolean; onToggle: () => void; onResetAuto: () => void;
}) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        onClick={onToggle}
        aria-label={isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] transition-all duration-300 ${
          isLight ? "text-[#9a8050]/50 hover:text-[#7a6030]" : "text-white/20 hover:text-white/50"
        }`}
      >
        {isLight ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
        <span className="tracking-wide">{isLight ? "Claro" : "Oscuro"}</span>
        <span className={`relative inline-block w-6 h-3 rounded-full transition-colors duration-300 flex-shrink-0 ${
          isLight ? "bg-[#C5A55A]/50" : "bg-white/15"
        }`}>
          <span className={`absolute top-0.5 w-2 h-2 rounded-full bg-white/70 shadow transition-transform duration-300 ${
            isLight ? "translate-x-3" : "translate-x-0.5"
          }`} />
        </span>
      </button>
      {isAuto ? (
        <span className={`text-[8px] pr-1 ${isLight ? "text-[#9a8050]/30" : "text-white/15"}`}>auto</span>
      ) : (
        <button onClick={onResetAuto} className={`text-[8px] pr-1 underline underline-offset-1 transition-colors ${
          isLight ? "text-[#9a8050]/40 hover:text-[#7a6030]" : "text-white/20 hover:text-white/50"
        }`}>auto</button>
      )}
    </div>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function SplashSelector({ onEnterSite, onNavigate, isTransitioning, onBack }: SplashSelectorProps) {
  const [leaving, setLeaving] = useState(false);
  const { isLight, isAuto, toggleSplashTheme, resetToAuto } = useSplashTheme();
  const { patient, isLoggedIn, logout } = usePatientAuth();

  // Modal de autenticación
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Notificaciones push
  const [pushLoading, setPushLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(() => localStorage.getItem("nutriser_push_enabled") === "true");
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Email
  const [emailInput, setEmailInput] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailDone, setEmailDone] = useState(() => localStorage.getItem("nutriser_email_subscribed") === "true");

  // iOS detection via pushHelper
  const isIOS = isIOSDevice();
  const isPWA = isPWAStandalone();
  const isNativeAppFlag = checkIsNativeApp();
  // isWKWebViewFlag: true only for generic WKWebViews WITHOUT our bridge (Instagram, etc.)
  const isWKWebViewFlag = isNativeAppFlag ? false : checkIsWKWebView();
  // Show push section if: native app (APNs) OR web push supported
  const showPushSection = isNativeAppFlag || !isWKWebViewFlag;

  const { data: vapidData } = trpc.push.getVapidPublicKey.useQuery();

  const pushSubscribeMutation = trpc.push.subscribe.useMutation({
    onSuccess: () => {
      setPushEnabled(true);
      localStorage.setItem("nutriser_push_enabled", "true");
      toast.success("🔔 ¡Notificaciones activadas!");
      setShowNotifModal(false);
    },
    onError: () => toast.error("No se pudieron activar las notificaciones push."),
  });

  const emailSubscribeMutation = trpc.couponSubscribers.subscribe.useMutation({
    onSuccess: () => {
      setEmailDone(true);
      setEmailSubmitting(false);
      localStorage.setItem("nutriser_email_subscribed", "true");
      toast.success("✉️ ¡Listo! Recibirás alertas de descuentos en tu correo.");
    },
    onError: () => {
      setEmailSubmitting(false);
      toast.error("No se pudo guardar tu correo. Intenta de nuevo.");
    },
  });

  const handleNavigate = (path: string) => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    setLeaving(true);
    setTimeout(() => {
      if (onNavigate) onNavigate(path);
      else window.location.href = path;
    }, 400);
  };

  const handleEnablePush = async () => {
    // ---- Native iOS App: use APNs bridge ----
    if (isNativeAppFlag) {
      setPushLoading(true);
      try {
        const result = await requestNativePushPermission();
        if (result.status === 'granted') {
          setPushEnabled(true);
          localStorage.setItem('nutriser_push_enabled', 'true');
          toast.success('🔔 ¡Notificaciones activadas!');
          setShowNotifModal(false);
        }
      } catch (e: any) {
        if (e?.message === 'PERMISSION_DENIED_NATIVE') {
          toast.error('Permiso denegado. Ve a Ajustes > Nutriser > Notificaciones para activarlas.');
        } else {
          console.error('Native push error:', e);
          toast.error('Error al activar notificaciones. Inténtalo de nuevo.');
        }
      } finally {
        setPushLoading(false);
      }
      return;
    }

    // ---- Web Push (browsers + iOS PWA) ----
    const iosCheck = checkIOSPushReadiness();
    if (!iosCheck.ready) {
      if (iosCheck.reason === 'not_standalone') {
        toast(
          <div className="text-sm">
            <p className="font-bold mb-1">📱 Paso previo en iPhone:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Toca el ícono <strong>Compartir</strong> (cuadro con flecha ↑) en Safari</li>
              <li>Selecciona <strong>"Agregar a pantalla de inicio"</strong></li>
              <li>Abre la app desde tu pantalla de inicio</li>
              <li>Regresa aquí y toca la campanita para activar notificaciones</li>
            </ol>
          </div>,
          { duration: 10000 }
        );
      } else if (iosCheck.message) {
        toast.error(iosCheck.message);
      }
      return;
    }

    if (!isPushSupported()) {
      toast.error("Las notificaciones push no están disponibles en este navegador.");
      return;
    }

    setPushLoading(true);
    try {
      const publicKey = vapidData?.publicKey;
      if (!publicKey) throw new Error("No VAPID key");

      const { endpoint, p256dh, auth } = await subscribeToPush(publicKey);
      await pushSubscribeMutation.mutateAsync({ endpoint, p256dh, auth });
    } catch (e: any) {
      if (e?.message === 'PERMISSION_DENIED') {
        toast.error("Permiso de notificaciones denegado. Ve a Ajustes > Nutriser > Notificaciones para activarlas.");
      } else {
        console.error('Push subscription error:', e);
        toast.error("No se pudieron activar las notificaciones.");
      }
    } finally {
      setPushLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setEmailSubmitting(true);
    await emailSubscribeMutation.mutateAsync({ email: emailInput.trim() });
  };

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada. ¡Hasta pronto!");
  };

  // ── Colores según tema ──────────────────────────────────────────────────
  const bg = isLight
    ? "linear-gradient(160deg, #FAF7F2 0%, #F5EFE4 50%, #FAF7F2 100%)"
    : "linear-gradient(160deg, #0f0f0f 0%, #1a1208 50%, #0f0f0f 100%)";

  /* ── Pantalla de transición ── */
  if (isTransitioning) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-28 h-28 rounded-full border-t-2 border-[#C5A55A] animate-spin" />
            <div className="absolute w-28 h-28 rounded-full border border-[#C5A55A]/20" />
            <img src={LOGO_URL} alt="Nutriser" className="w-20 h-20 object-contain" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[#C5A55A] text-xs tracking-[0.4em] uppercase font-light animate-pulse">Cargando</p>
            <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Aesthetic & Nutrition</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Hub principal ── */
  return (
    <div
      className="fixed inset-0 z-[99999] overflow-x-hidden overflow-y-auto transition-all duration-500"
      style={{
        background: bg,
        opacity: leaving ? 0 : 1,
        transition: leaving ? "opacity 0.4s ease" : "background 0.5s ease",
      }}
    >
      <div
        className="h-full min-h-screen w-full flex flex-col items-center justify-start px-3 sm:px-4 md:px-8 lg:px-12 xl:px-16 box-border"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 16px, 24px)', paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 8px, 24px)' }}
      >
        <div className="w-full max-w-[480px] sm:max-w-[600px] md:max-w-[780px] lg:max-w-[1100px] xl:max-w-[1300px] 2xl:max-w-[1500px] flex flex-col" style={{ minHeight: 'calc(100vh - max(env(safe-area-inset-top, 0px) + 16px, 24px) - max(env(safe-area-inset-bottom, 0px) + 8px, 24px))' }}>

          {/* ── Botón Regresar al Splash 0 ── */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border bg-[#C5A55A] text-black border-[#C5A55A] hover:bg-[#d4b46a] self-start"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Regresar
            </button>
          )}

          {/* ── Header: Logo + Sesión ── */}
          <div className={`flex items-center gap-3 mb-4 md:mb-5 px-3 py-2.5 rounded-2xl transition-all duration-500 ${
            isLight ? "bg-[#2a1f0a]/90 shadow-lg shadow-[#C5A55A]/10" : "bg-black/40 backdrop-blur-sm border border-white/5"
          }`}>
            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-[#C5A55A]/30 blur-lg scale-150" />
              <img src={LOGO_URL} alt="Nutriser" className="relative w-12 h-12 md:w-14 md:h-14 object-contain" />
            </div>
            {/* Separador vertical */}
            <div className="w-px h-10 bg-[#C5A55A]/50 flex-shrink-0" />
            {/* Textos */}
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <p className="text-[#C5A55A] text-[9px] md:text-[10px] tracking-[0.25em] uppercase font-light leading-tight">
                Aesthetic & Nutrition
              </p>
              <h1 className="text-white text-xs md:text-sm font-semibold tracking-wider uppercase leading-tight mt-0.5">
                Bienvenido a Nutriser
              </h1>
            </div>

            {/* ── Botón de sesión ── */}
            {isLoggedIn && patient ? (
              /* Usuario logueado: muestra nombre + cerrar sesión */
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-[#C5A55A] text-[10px] font-bold leading-tight">
                    Hola, {patient.name.split(' ')[0]}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                    <span className="text-green-400 text-[8px] font-semibold leading-tight">Activa</span>
                  </div>
                </div>
                <div className="relative w-8 h-8 rounded-full bg-[#C5A55A]/20 border border-[#C5A55A]/40 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[#C5A55A]" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#2a1f0a]" />
                </div>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 flex items-center justify-center flex-shrink-0 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 text-white/50 hover:text-red-400" />
                </button>
              </div>
            ) : (
              /* No logueado: botón "Iniciar sesión / Crear cuenta" */
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex flex-col items-center gap-0 px-3 py-1.5 rounded-xl transition-all duration-200 bg-[#C5A55A] text-black hover:bg-[#d4b46a] active:scale-95 flex-shrink-0"
              >
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="text-[11px] font-bold leading-tight">Iniciar sesión</span>
                </div>
                <span className="text-[8px] font-medium opacity-70 leading-tight">Accede a tu cuenta Nutriser</span>
              </button>
            )}

            {/* Campana de notificaciones */}
            {pushEnabled ? (
              <div className="flex-shrink-0 flex flex-col items-center gap-0.5 ml-1">
                <div className="relative w-8 h-8 rounded-xl bg-[#C5A55A]/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-[#C5A55A]" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border border-black flex items-center justify-center">
                    <span className="text-white text-[6px] font-bold">✓</span>
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNotifModal(true)}
                className="flex-shrink-0 relative w-8 h-8 rounded-xl border transition-all duration-200 group overflow-hidden bg-white/5 border-white/10 hover:border-[#C5A55A]/50 flex items-center justify-center ml-1"
              >
                <span className="absolute inset-0 rounded-xl bg-[#C5A55A]/10 animate-ping opacity-60" style={{ animationDuration: "2.5s" }} />
                <div className="relative w-full h-full rounded-xl bg-[#C5A55A] flex items-center justify-center shadow-lg shadow-[#C5A55A]/40 group-hover:bg-[#d4b46a] transition-colors">
                  <BellRing className="w-3.5 h-3.5 text-black" />
                </div>
              </button>
            )}
          </div>

          {/* ── 3 Tarjetas: Shop + Academy + Nutriser Web ── */}
          <div className="flex flex-col gap-2 mb-2 flex-1">

            {/* Tarjeta 1: Nutriser Shop */}
            <div className="flex-1 min-h-[130px]">
              <button
                onClick={() => handleNavigate('/memberships')}
                className="group relative w-full rounded-3xl overflow-hidden focus:outline-none h-full"
                style={{ minHeight: "130px" }}
              >
                <img src={CLINIC_IMG} alt="Nutriser Shop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: 'center 30%' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/85" />
                <div className="relative h-full flex flex-col justify-between p-3 sm:p-4 text-left">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 bg-[#C5A55A]">
                      <ShoppingBag className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide uppercase drop-shadow text-white/90">Tienda</span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold leading-tight mb-2 drop-shadow-lg text-white">Nutriser Shop</h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-lg transition-all duration-200 group-hover:scale-105 bg-[#C5A55A] text-black">
                      <ShoppingBag className="w-3 h-3" /> Visitar
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Tarjeta 2: Nutriser Academy */}
            <div className="flex-1 min-h-[130px]">
              <button
                onClick={() => handleNavigate('/cursos')}
                className="group relative w-full rounded-3xl overflow-hidden focus:outline-none h-full"
                style={{ minHeight: "130px" }}
              >
                <img src={IMG_ACADEMY} alt="Nutriser Academy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: 'center center' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />
                <div className="relative h-full flex flex-col justify-between p-3 sm:p-4 text-left">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 bg-white/20 backdrop-blur-sm">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide uppercase drop-shadow text-white/90">Educación</span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold leading-tight mb-2 drop-shadow-lg text-white">Nutriser Academy</h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-lg transition-all duration-200 group-hover:scale-105 bg-white/20 backdrop-blur-sm text-white border border-white/40">
                      <GraduationCap className="w-3 h-3" /> Ver cursos
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Tarjeta 3: Nutriser Web → sitio web oficial */}
            <div className="flex-1 min-h-[130px]">
              <button
                onClick={() => { if (onEnterSite) onEnterSite(); }}
                className="group relative w-full rounded-3xl overflow-hidden focus:outline-none h-full"
                style={{ minHeight: "130px" }}
              >
                <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-imac-web-T2sERsyMxZB3iGgxpbi7eW.webp" alt="Nutriser Web" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: 'center center' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/85" />
                <div className="relative h-full flex flex-col justify-between p-3 sm:p-4 text-left">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 bg-white/20 backdrop-blur-sm">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide uppercase drop-shadow text-white/90">Sitio Web</span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold leading-tight mb-2 drop-shadow-lg text-white">Nutriser Web</h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-lg transition-all duration-200 group-hover:scale-105 bg-white/20 backdrop-blur-sm text-white border border-white/40">
                      <Globe className="w-3 h-3" /> Ver sitio
                    </span>
                  </div>
                </div>
              </button>
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between pb-2 pt-1">
            <p className={`text-[10px] ${isLight ? "text-[#9a8050]/50" : "text-white/20"}`}>
              © 2025 Nutriser Aesthetic & Nutrition · nutriserpv.com
            </p>
            <ThemeToggle
              isLight={isLight}
              isAuto={isAuto}
              onToggle={toggleSplashTheme}
              onResetAuto={resetToAuto}
            />
          </div>

        </div>
      </div>

      {/* ── Modal de Autenticación ── */}
      <NutriserAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        contextMessage="Inicia sesión para acceder a tu monedero, cupones, beneficios de lealtad, Nutriser Shop y Academy."
        onSuccess={() => setShowAuthModal(false)}
      />

      {/* ── Modal de Notificaciones ── */}
      {showNotifModal && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#C5A55A]/20 to-[#C5A55A]/5 rounded-t-3xl p-5 flex items-start justify-between border-b border-white/10">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#C5A55A]" /> Accede a Descuentos Exclusivos
                </h2>
                <p className="text-white/50 text-sm mt-1">Cupos limitados — cupones que no encontrarás en ningún otro lugar</p>
              </div>
              <button onClick={() => setShowNotifModal(false)} className="text-white/40 hover:text-white transition-colors ml-4 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="border border-[#C5A55A]/30 rounded-2xl p-4 space-y-3 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✉️</div>
                  <div>
                    <p className="font-bold text-white text-sm">✉️ Descuentos exclusivos en tu correo</p>
                    <p className="text-white/50 text-xs">Suscríbete y recibe ofertas que no encontrarás en ningún otro lugar</p>
                  </div>
                </div>
                {emailDone ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                    <Check className="w-4 h-4" /> ¡Ya eres parte de la comunidad Nutriser!
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="flex gap-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="tu@correo.com"
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C5A55A] transition"
                      required
                    />
                    <button
                      type="submit"
                      disabled={emailSubmitting}
                      className="bg-[#C5A55A] hover:bg-[#d4b46a] disabled:opacity-50 text-black px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {emailSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Bell className="w-4 h-4" /> Suscribir</>}
                    </button>
                  </form>
                )}
              </div>

              {showPushSection && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-white/30 uppercase tracking-wider">o también</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <div className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent rounded-2xl p-4 border border-[#C5A55A]/20">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl mt-0.5">🔔</div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">Activa las notificaciones y no te pierdas nada</p>
                        <p className="text-white/50 text-xs mt-0.5">Recibe promociones y cupones exclusivos al instante</p>
                        {isIOS && !isPWA && !isNativeAppFlag && !isWKWebViewFlag && (
                          <div className="mt-2 bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-xl p-3">
                            <p className="text-[#C5A55A] text-xs font-bold mb-1">📱 Para activar en iPhone:</p>
                            <ol className="text-white/60 text-[11px] space-y-0.5 list-decimal list-inside">
                              <li>Toca el ícono <strong className="text-white/80">Compartir</strong> (↑) en Safari</li>
                              <li>Selecciona <strong className="text-white/80">"Agregar a pantalla de inicio"</strong></li>
                              <li>Abre la app desde tu pantalla de inicio</li>
                              <li>Regresa aquí y activa las notificaciones</li>
                            </ol>
                          </div>
                        )}
                        {pushEnabled ? (
                          <div className="mt-2 flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                            <Check className="w-4 h-4" /> ¡Notificaciones activadas!
                          </div>
                        ) : (
                          <div className="mt-2">
                            <button
                              onClick={handleEnablePush}
                              disabled={pushLoading}
                              className="bg-[#C5A55A] hover:bg-[#d4b46a] disabled:opacity-50 text-black px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                            >
                              {pushLoading
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Activando...</>
                                : <><BellRing className="w-3.5 h-3.5" /> Activar Notificaciones</>}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-white/30 text-center">
                    Sin spam, solo ofertas reales. Puedes cancelar cuando quieras.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
