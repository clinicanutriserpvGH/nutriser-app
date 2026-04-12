import { useState } from "react";
import {
  Bell, BellRing, BookOpen, CalendarCheck, Camera, Check,
  ClipboardList, Flame, Globe, GraduationCap, HeartPulse, Loader2, Mail,
  MapPin, Moon, PauseCircle, Pill, Repeat2, Ruler, Share2, ShoppingBag, ShoppingCart, Sparkles, Sun, Tag,
  TrendingUp, Utensils, X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useSplashTheme } from "@/contexts/SplashThemeContext";

/* ─── Assets ────────────────────────────────────────────────────────────── */
const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const CLINIC_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-mall-hub-24WMGfbpx5UmTi5DXECtgS.webp";
const CLINIC_IMG2 =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-imac-web-T2sERsyMxZB3iGgxpbi7eW.webp";
const PORTAL_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-portal-salud-v2_e87113cf.png";
const IMG_TREATMENTS =
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80";

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface SplashSelectorProps {
  onEnterSite: () => void;
  onNavigate?: (path: string) => void;
  isTransitioning?: boolean;
  onBack?: () => void; // ← volver al Splash 0
}

/* ─── Toggle palanca Modo Claro / Oscuro (discreto, pie de página) ──────────── */
function ThemeToggle({
  isLight,
  isAuto,
  onToggle,
  onResetAuto,
}: {
  isLight: boolean;
  isAuto: boolean;
  onToggle: () => void;
  onResetAuto: () => void;
}) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      {/* Palanca mínima */}
      <button
        onClick={onToggle}
        aria-label={isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] transition-all duration-300 ${
          isLight ? "text-[#9a8050]/50 hover:text-[#7a6030]" : "text-white/20 hover:text-white/50"
        }`}
      >
        {isLight ? (
          <Sun className="w-3 h-3" />
        ) : (
          <Moon className="w-3 h-3" />
        )}
        <span className="tracking-wide">{isLight ? "Claro" : "Oscuro"}</span>
        <span
          className={`relative inline-block w-6 h-3 rounded-full transition-colors duration-300 flex-shrink-0 ${
            isLight ? "bg-[#C5A55A]/50" : "bg-white/15"
          }`}
        >
          <span
            className={`absolute top-0.5 w-2 h-2 rounded-full bg-white/70 shadow transition-transform duration-300 ${
              isLight ? "translate-x-3" : "translate-x-0.5"
            }`}
          />
        </span>
      </button>
      {/* Sub-etiqueta auto / restablecer */}
      {isAuto ? (
        <span className={`text-[8px] pr-1 ${isLight ? "text-[#9a8050]/30" : "text-white/15"}`}>
          auto
        </span>
      ) : (
        <button
          onClick={onResetAuto}
          className={`text-[8px] pr-1 underline underline-offset-1 transition-colors ${
            isLight ? "text-[#9a8050]/40 hover:text-[#7a6030]" : "text-white/20 hover:text-white/50"
          }`}
        >
          auto
        </button>
      )}
    </div>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function SplashSelector({ onEnterSite, onNavigate, isTransitioning, onBack }: SplashSelectorProps) {
  const [leaving, setLeaving] = useState(false);
  const { isLight, isAuto, toggleSplashTheme, resetToAuto } = useSplashTheme();

  // Notificaciones push
  const [pushLoading, setPushLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(() => localStorage.getItem("nutriser_push_enabled") === "true");

  // Email
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailDone, setEmailDone] = useState(() => localStorage.getItem("nutriser_email_subscribed") === "true");

  // Modal de notificaciones
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Detectar sesión activa del paciente
  const [activePatient] = useState<{ name: string } | null>(() => {
    try {
      const stored = localStorage.getItem("nutriser_patient");
      if (stored) return JSON.parse(stored) as { name: string };
    } catch {}
    return null;
  });

  // Detectar iOS/Safari y WKWebView (app nativa de Xcode)
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOSSafari = isIOS && isSafari;
  const isPWA = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
  const isWKWebView = isIOS && !("serviceWorker" in navigator);

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
      setShowEmailForm(false);
      localStorage.setItem("nutriser_email_subscribed", "true");
      toast.success("✉️ ¡Listo! Recibirás alertas de descuentos en tu correo.");
    },
    onError: () => {
      setEmailSubmitting(false);
      toast.error("No se pudo guardar tu correo. Intenta de nuevo.");
    },
  });

  const handleEnterSite = () => {
    setLeaving(true);
    setTimeout(() => onEnterSite(), 400);
  };

  const handleNavigate = (path: string) => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    setLeaving(true);
    setTimeout(() => {
      if (onNavigate) onNavigate(path);
      else window.location.href = path;
    }, 400);
  };

  const handleEnablePush = async () => {
    if (isIOS && !isPWA && !isWKWebView) {
      toast(
        <div className="text-sm">
          <p className="font-bold mb-1">📱 Paso previo en iPhone:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Toca el ícono <strong>Compartir</strong> (cuadro con flecha ↑) en Safari</li>
            <li>Selecciona <strong>"Agregar a pantalla de inicio"</strong></li>
            <li>Abre la app desde tu pantalla de inicio</li>
            <li>Regresa aquí y activa las notificaciones</li>
          </ol>
        </div>,
        { duration: 8000 }
      );
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Las notificaciones push no están disponibles en este navegador.");
      return;
    }
    setPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permiso de notificaciones denegado.");
        setPushLoading(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const publicKey = vapidData?.publicKey;
      if (!publicKey) throw new Error("No VAPID key");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });
      const subJson = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await pushSubscribeMutation.mutateAsync({
        endpoint: subJson.endpoint,
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
      });
    } catch (err) {
      toast.error("No se pudieron activar las notificaciones.");
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

  // ── Colores según tema ──────────────────────────────────────────────────
  // Fondo principal
  const bg = isLight
    ? "linear-gradient(160deg, #FAF7F2 0%, #F5EFE4 50%, #FAF7F2 100%)"
    : "linear-gradient(160deg, #0f0f0f 0%, #1a1208 50%, #0f0f0f 100%)";

  // Texto principal
  const textPrimary = isLight ? "text-[#2a1f0a]" : "text-white";
  const textSecondary = isLight ? "text-[#7a6030]" : "text-white/60";
  const textMuted = isLight ? "text-[#9a8050]/60" : "text-white/20";

  // Bordes y fondos de tarjetas pequeñas
  const cardBg = isLight ? "bg-[#EDE5D5]/60 border-[#C5A55A]/30 hover:border-[#C5A55A] hover:bg-[#E8DEC8]/80" : "bg-white/5 border-[#C5A55A]/40 hover:border-[#C5A55A] hover:bg-white/10";
  const cardBgSubtle = isLight ? "bg-[#EDE5D5]/40 border-[#C5A55A]/20 hover:border-[#C5A55A]/50 hover:bg-[#E8DEC8]/60" : "bg-white/5 border-white/10 hover:border-[#C5A55A]/50 hover:bg-white/10";
  const iconBgSubtle = isLight ? "bg-[#C5A55A]/20 group-hover:bg-[#C5A55A]/30" : "bg-[#C5A55A]/20 group-hover:bg-[#C5A55A]/30";
  const iconTextSubtle = "text-[#C5A55A]";

  // Botones de footer
  const footerBtn = isLight
    ? "bg-[#EDE5D5]/60 hover:bg-[#E0D5C0]/80 border-[#C5A55A]/20 hover:border-[#C5A55A]/50 text-[#9a8050] hover:text-[#7a6030]"
    : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-[#C5A55A]/30 text-white/40 hover:text-white/70";

  // Íconos sociales
  const socialBg = isLight
    ? "background: 'linear-gradient(145deg, #EDE5D5 0%, #E0D5C0 50%, #F5EFE4 100%)', border: '1px solid rgba(197,165,90,0.4)'"
    : "background: 'linear-gradient(145deg, #2a1f0a 0%, #3d2e10 50%, #1a1208 100%)', border: '1px solid rgba(197,165,90,0.4)'";
  const socialIconStyle = isLight
    ? { background: 'linear-gradient(145deg, #EDE5D5 0%, #E0D5C0 50%, #F5EFE4 100%)', border: '1px solid rgba(197,165,90,0.4)' }
    : { background: 'linear-gradient(145deg, #2a1f0a 0%, #3d2e10 50%, #1a1208 100%)', border: '1px solid rgba(197,165,90,0.4)' };
  const socialIconFill = isLight ? "#7a6030" : "white";

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
            <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Aesthetic &amp; Nutrition</p>
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
        className="min-h-full w-full flex flex-col items-center px-3 sm:px-4 md:px-8 lg:px-12 xl:px-16 box-border"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 16px, 24px)', paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 8px, 16px)' }}
      >
        <div className="w-full max-w-[480px] sm:max-w-[600px] md:max-w-[780px] lg:max-w-[1100px] xl:max-w-[1300px] 2xl:max-w-[1500px]">

          {/* ── Botón Regresar al Splash 0 ── */}
          {onBack && (
            <button
              onClick={onBack}
              className={`flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                isLight
                  ? "bg-[#C5A55A] text-black border-[#C5A55A] hover:bg-[#d4b46a]"
                  : "bg-[#C5A55A] text-black border-[#C5A55A] hover:bg-[#d4b46a]"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Regresar
            </button>
          )}

          {/* ── Header horizontal compacto ── */}
          <div className={`flex items-center gap-3 mb-4 md:mb-5 px-3 py-2.5 rounded-2xl transition-all duration-500 ${
            isLight
              ? "bg-[#2a1f0a]/90 shadow-lg shadow-[#C5A55A]/10"
              : "bg-transparent"
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
                Aesthetic &amp; Nutrition
              </p>
              <h1 className="text-white text-xs md:text-sm font-semibold tracking-wider uppercase leading-tight mt-0.5">
                Soy Nutriser y Vivo Mejor
              </h1>
            </div>
            {/* Campana — al lado del texto */}
            {!showEmailForm && (
              pushEnabled ? (
                <div className={`flex-shrink-0 flex flex-col items-center gap-0.5`}>
                  <div className="relative w-9 h-9 rounded-xl bg-[#C5A55A]/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#C5A55A]" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border border-black flex items-center justify-center">
                      <span className="text-white text-[7px] font-bold">✓</span>
                    </span>
                  </div>
                  <span className="text-[#C5A55A] text-[8px] font-semibold">Activa ✓</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowNotifModal(true)}
                  className={`flex-shrink-0 relative flex flex-col items-center gap-0.5 p-1.5 rounded-xl border transition-all duration-200 group overflow-hidden ${
                    isLight
                      ? "bg-[#EDE5D5]/40 border-[#C5A55A]/20 hover:border-[#C5A55A]/50"
                      : "bg-white/5 border-white/10 hover:border-[#C5A55A]/50"
                  }`}
                >
                  <span className="absolute inset-0 rounded-xl bg-[#C5A55A]/10 animate-ping opacity-60" style={{ animationDuration: "2.5s" }} />
                  <div className="relative w-8 h-8 rounded-xl bg-[#C5A55A] flex items-center justify-center shadow-lg shadow-[#C5A55A]/40 group-hover:bg-[#d4b46a] transition-colors">
                    <BellRing className="w-4 h-4 text-black" />
                  </div>
                  <span className={`relative text-[8px] font-semibold text-center leading-tight ${
                    isLight ? "text-[#5a3a10]" : "text-white/70"
                  }`}>Campana</span>
                </button>
              )
            )}
          </div>

          {/* ── Grid de widgets ── */}

          {/* Fila 1: Nutriser Home | Nutriser Mall (2 columnas iguales) */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6 mb-3 md:mb-4 lg:mb-6">
            {/* Widget Nutriser Home (sitio web) — izquierda, prioridad */}
            <div className="col-span-1">
              <button
                onClick={() => handleEnterSite()}
                className="group relative w-full rounded-3xl overflow-hidden focus:outline-none"
                style={{ aspectRatio: "1 / 1", minHeight: "200px" }}
              >
                <img src={CLINIC_IMG2} alt="Nutriser Home" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: 'center center' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/75" />
                <div className="relative h-full flex flex-col justify-between p-3 sm:p-4 text-left">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 bg-[#C5A55A]">
                      <Globe className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide uppercase drop-shadow text-white/90">Sitio Web</span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold leading-tight mb-2 drop-shadow-lg text-white">Nutriser Web</h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-lg transition-all duration-200 group-hover:scale-105 bg-[#C5A55A] text-black">
                      Entrar
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Widget Nutriser Mall (tienda/shop) — derecha */}
            <div className="col-span-1">
              <button
                onClick={() => handleNavigate('/nutriser-home')}
                className="group relative w-full rounded-3xl overflow-hidden focus:outline-none"
                style={{ aspectRatio: "1 / 1", minHeight: "200px" }}
              >
                <img src={CLINIC_IMG} alt="Nutriser Mall" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: 'center 30%' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/75" />
                <div className="relative h-full flex flex-col justify-between p-3 sm:p-4 text-left">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 bg-white/20 backdrop-blur-sm">
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide uppercase drop-shadow text-white/90">Tienda</span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold leading-tight mb-2 drop-shadow-lg text-white">Nutriser Mall</h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-lg transition-all duration-200 group-hover:scale-105 bg-white/20 backdrop-blur-sm text-white border border-white/40">
                      Visitar
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ── Mis Tratamientos + Agendar Cita ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-5 lg:mb-6">

            {/* Mis Tratamientos */}
            <button
              onClick={() => handleNavigate('/mis-tratamientos')}
              className={`relative rounded-2xl overflow-hidden border transition-all duration-200 group ${isLight ? "border-[#C5A55A]/30 hover:border-[#C5A55A]" : "border-[#C5A55A]/30 hover:border-[#C5A55A]"}`}
              style={{ minHeight: "90px", height: "100%" }}
            >
              <div className="absolute inset-0">
                <img src={IMG_TREATMENTS} alt="Mis Tratamientos" className="w-full h-full object-cover transition-opacity opacity-50 group-hover:opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>
              <div className="relative flex flex-col items-center justify-center gap-2 p-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-[#C5A55A] flex items-center justify-center shadow-lg shadow-[#C5A55A]/50 flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-xs sm:text-sm text-white drop-shadow">Mis Tratamientos</p>
                  {activePatient ? (
                    <p className="text-[#C5A55A] text-[9px] sm:text-[10px] leading-tight mt-0.5 font-semibold">
                      ✓ {activePatient.name.split(' ')[0]}
                    </p>
                  ) : (
                    <p className="text-[9px] sm:text-[10px] leading-tight mt-0.5 text-white/70">
                      Seguimiento y descuentos
                    </p>
                  )}
                </div>
              </div>
            </button>

            {/* Agendar Cita */}
            <button
              onClick={() => handleNavigate('/appointment-form')}
              className={`relative rounded-2xl overflow-hidden border transition-all duration-200 group ${isLight ? "border-[#C5A55A]/30 hover:border-[#C5A55A]" : "border-[#C5A55A]/30 hover:border-[#C5A55A]"}`}
              style={{ minHeight: "90px" }}
            >
              <div className="absolute inset-0">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-agendar-cita_49e2eca2.jpg"
                  alt="Agendar Cita"
                  className="w-full h-full object-cover transition-opacity opacity-50 group-hover:opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>
              <div className="relative flex flex-col items-center justify-center gap-2 p-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-[#C5A55A]/80 flex items-center justify-center shadow-lg shadow-[#C5A55A]/30 flex-shrink-0">
                  <CalendarCheck className="w-5 h-5 text-black" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-xs sm:text-sm text-white drop-shadow">Agendar Cita</p>
                  <p className="text-[9px] sm:text-[10px] leading-tight mt-0.5 text-white/70">
                    Reserva tu servicio personalizado
                  </p>
                </div>
              </div>
            </button>

          </div>

          {/* ── Barra de acciones rápidas: solo Cuponera y Servicios ── */}
          <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-6 mb-4 md:mb-5 lg:mb-6">
            {/* Cuponera de Descuentos */}
            <button
              onClick={() => handleNavigate('/coupons')}
              className={`relative flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border transition-all duration-200 group overflow-hidden ${
                isLight
                  ? "bg-[#2a1f0a]/85 border-[#C5A55A]/60 hover:border-[#C5A55A] hover:bg-[#2a1f0a]"
                  : "bg-white/5 border-[#C5A55A]/40 hover:border-[#C5A55A] hover:bg-white/10"
              }`}
            >
              <span className="absolute inset-0 rounded-2xl bg-[#C5A55A]/10 animate-pulse" style={{ animationDuration: "2s" }} />
              <div className="relative w-9 h-9 rounded-xl bg-[#C5A55A] flex items-center justify-center shadow-lg shadow-[#C5A55A]/50">
                <Tag className="w-5 h-5 text-black" />
              </div>
              <span className="relative text-[10px] sm:text-xs font-bold text-center leading-tight text-white">
                Cuponera de Descuentos
              </span>
            </button>

            {/* Catálogo de Servicios */}
            {!showEmailForm && (
              <button
                onClick={() => handleNavigate('/services')}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border transition-all duration-200 group ${
                  isLight
                    ? "bg-[#2a1f0a]/75 border-[#C5A55A]/40 hover:border-[#C5A55A]/80 hover:bg-[#2a1f0a]/90"
                    : "bg-white/5 border-white/10 hover:border-[#C5A55A]/50 hover:bg-white/10"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#C5A55A]/30 group-hover:bg-[#C5A55A]/50 flex items-center justify-center transition-colors">
                  <ClipboardList className="w-5 h-5 text-[#C5A55A]" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight text-white/90">
                  Servicios
                </span>
              </button>
            )}
          </div>

          {/* ── Botones Compartir + Administración ── */}
          <div className="flex justify-center gap-3 mb-5">
            <button
              onClick={() => {
                const url = "https://nutriserpv.com";
                if (navigator.share) {
                  navigator.share({ title: "Nutriser Aesthetic & Nutrition", url });
                } else {
                  navigator.clipboard.writeText(url)
                    .then(() => toast.success("¡Enlace copiado! Pégalo donde quieras compartirlo."))
                    .catch(() => toast.error("No se pudo copiar el enlace."));
                }
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${footerBtn}`}
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartir
            </button>
            <button
              onClick={() => { window.location.href = '/admin/login'; }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${footerBtn}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Administración
            </button>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between pb-4 pt-2">
            <p className={`text-[10px] ${isLight ? "text-[#9a8050]/50" : "text-white/20"}`}>
              © 2025 Nutriser Aesthetic &amp; Nutrition · nutriserpv.com
            </p>
            {/* Toggle discreto en esquina inferior derecha */}
            <ThemeToggle isLight={isLight} isAuto={isAuto} onToggle={toggleSplashTheme} onResetAuto={resetToAuto} />
          </div>

        </div>
      </div>

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
              <button
                onClick={() => setShowNotifModal(false)}
                className="text-white/40 hover:text-white transition-colors ml-4 flex-shrink-0"
              >
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

              {!isWKWebView && (<>
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

                    {isIOS && !isPWA && !isWKWebView && (
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
              </>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
