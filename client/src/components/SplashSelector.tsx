import { useState } from "react";
import {
  Activity, Bell, BellRing, BookOpen, CalendarCheck, Check,
  ClipboardList, GraduationCap, HeartPulse, Loader2, Mail,
  MapPin, Pill, Share2, ShoppingBag, ShoppingCart, Tag,
  TrendingUp, Utensils, X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/* ─── Assets ────────────────────────────────────────────────────────────── */
const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const CLINIC_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-recepcion_c1095589.jpeg";
const CLINIC_IMG2 =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-recepcion-v2_284927a7.jpeg";
const PORTAL_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-wall_ec00965e.jpeg";
const IMG_NUTRICION =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-membresia_cad68daf.png";
const IMG_TIENDA =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/tienda-productos_2c07d4aa.jpg";
const IMG_EBOOK =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-ebook-portada_0437617d.png";
const IMG_ACADEMY =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/academy-nutricion_8ac7b33a.webp";
const WHATSAPP_URL =
  "https://wa.me/523221007799?text=Hola%2C%20me%20interesa%20agendar%20una%20valoraci%C3%B3n%20en%20Nutriser";

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface SplashSelectorProps {
  onEnterSite: () => void;
  onNavigate?: (path: string) => void;
  isTransitioning?: boolean;
}

/* ─── Widget grande (ocupa 2 columnas) ──────────────────────────────────── */
function WidgetLarge({
  img, icon: Icon, label, title, cta, onClick, accent = false,
}: {
  img: string;
  icon: React.ElementType;
  label: string;
  title: string;
  cta: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-3xl overflow-hidden focus:outline-none"
      style={{ aspectRatio: "2 / 1" }}
    >
      {/* Background image */}
      <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/20" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-4 sm:p-5 text-left">
        {/* Top: icon + label */}
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
              accent ? "bg-[#C5A55A]" : "bg-white/20 backdrop-blur-sm"
            }`}
          >
            <Icon className={`w-5 h-5 ${accent ? "text-black" : "text-white"}`} />
          </div>
          <span className="text-white/80 text-[11px] sm:text-xs font-semibold tracking-wide uppercase drop-shadow">
            {label}
          </span>
        </div>

        {/* Bottom: title + CTA */}
        <div>
          <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-3 drop-shadow-lg">
            {title}
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase shadow-lg transition-all duration-200 group-hover:scale-105 ${
              accent
                ? "bg-[#C5A55A] text-black"
                : "bg-white/20 backdrop-blur-sm text-white border border-white/30"
            }`}
          >
            {cta}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─── Widget cuadrado (1 columna) ────────────────────────────────────────── */
function WidgetSquare({
  img, icon: Icon, title, cta, onClick, accent = false,
}: {
  img: string;
  icon: React.ElementType;
  title: string;
  cta: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-2xl overflow-hidden focus:outline-none"
      style={{ aspectRatio: "1 / 1" }}
    >
      {/* Background image */}
      <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-3 sm:p-4">
        {/* Top: icon */}
        <div className="flex justify-end">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
              accent ? "bg-[#C5A55A]" : "bg-white/20 backdrop-blur-sm"
            }`}
          >
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${accent ? "text-black" : "text-white"}`} />
          </div>
        </div>

        {/* Bottom: title + CTA */}
        <div>
          <h3 className="text-white text-sm sm:text-base font-bold leading-tight mb-2 drop-shadow-lg">
            {title}
          </h3>
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow transition-all duration-200 group-hover:scale-105 ${
              accent
                ? "bg-[#C5A55A] text-black"
                : "bg-white/20 backdrop-blur-sm text-white border border-white/30"
            }`}
          >
            {cta}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function SplashSelector({ onEnterSite, onNavigate, isTransitioning }: SplashSelectorProps) {
  const [leaving, setLeaving] = useState(false);

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

  // Detectar iOS/Safari
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOSSafari = isIOS && isSafari;
  const isPWA = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

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
    if (onNavigate) onNavigate(path);
    else window.location.href = path;
  };

  const handleEnablePush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Tu navegador no soporta notificaciones push.");
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
      const publicKey = vapidData?.publicKey || import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicKey) { toast.error("Error de configuración."); setPushLoading(false); return; }
      const padding = "=".repeat((4 - publicKey.length % 4) % 4);
      const base64 = (publicKey + padding).replace(/-/g, "+").replace(/_/g, "/");
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: outputArray });
      }
      const p256dhArr = new Uint8Array(subscription.getKey("p256dh")!);
      const authArr = new Uint8Array(subscription.getKey("auth")!);
      const p256dh = btoa(Array.from(p256dhArr).map(b => String.fromCharCode(b)).join(""));
      const auth = btoa(Array.from(authArr).map(b => String.fromCharCode(b)).join(""));
      const savedEmail = emailInput || localStorage.getItem("nutriser_subscriber_email") || undefined;
      await pushSubscribeMutation.mutateAsync({ endpoint: subscription.endpoint, p256dh, auth, email: savedEmail });
    } catch (e: any) {
      toast.error("Error al activar notificaciones: " + e.message);
    }
    setPushLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes("@")) { toast.error("Ingresa un correo válido."); return; }
    setEmailSubmitting(true);
    localStorage.setItem("nutriser_subscriber_email", emailInput.trim());
    await emailSubscribeMutation.mutateAsync({ email: emailInput.trim() });
  };

  /* ── Pantalla de transición ── */
  if (isTransitioning) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-28 h-28 rounded-full border-t-2 border-[#C5A55A] animate-spin" />
            <div className="absolute w-28 h-28 rounded-full border border-[#C5A55A]/20" />
            <img src={LOGO_URL} alt="Nutriser" className="w-20 h-20 object-contain" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[#C5A55A] text-xs tracking-[0.4em] uppercase font-light animate-pulse">Cargando</p>
            <p className="text-black/40 text-[10px] tracking-[0.2em] uppercase">Aesthetic &amp; Nutrition</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Hub principal ── */
  return (
    <div
      className="fixed inset-0 z-[99999] overflow-x-hidden overflow-y-auto"
      style={{
        background: "linear-gradient(160deg, #0f0f0f 0%, #1a1208 50%, #0f0f0f 100%)",
        opacity: leaving ? 0 : 1,
        transition: leaving ? "opacity 0.4s ease" : "none",
      }}
    >
      <div className="min-h-full w-full flex flex-col items-center py-8 px-3 sm:px-4 md:px-6 box-border">
        <div className="w-full max-w-[480px] md:max-w-[700px] lg:max-w-[960px]">

          {/* ── Header ── */}
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="relative mb-3">
              <div className="absolute inset-0 rounded-full bg-[#C5A55A]/20 blur-xl scale-150" />
              <img src={LOGO_URL} alt="Nutriser" className="relative w-16 h-16 md:w-20 md:h-20 object-contain" />
            </div>
            <p className="text-[#C5A55A] text-[10px] md:text-xs tracking-[0.3em] uppercase font-light mb-1">
              Aesthetic &amp; Nutrition
            </p>
            <h1 className="text-[#C5A55A] text-sm md:text-base font-semibold tracking-widest text-center uppercase">
              Soy Nutriser y Vivo Mejor
            </h1>
            <div className="w-8 h-px bg-[#C5A55A]/60 mt-3 mb-4" />

            {/* Botón compartir */}
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
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/60 text-[11px] tracking-widest uppercase hover:border-[#C5A55A]/60 hover:text-[#C5A55A] transition-all duration-200"
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartir
            </button>
          </div>

          {/* ── Grid de widgets ── */}

          {/* Fila 1: dos widgets grandes (2 cols) */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
            {/* Widget Nutriser — ancho completo en móvil, mitad en desktop */}
            <div className="col-span-2 md:col-span-1">
              <WidgetLarge
                img={CLINIC_IMG2}
                icon={ShoppingBag}
                label="Clínica"
                title="Nutriser"
                cta="Entrar"
                onClick={handleEnterSite}
                accent
              />
            </div>
            {/* Widget Portal de Salud */}
            <div className="col-span-2 md:col-span-1">
              <WidgetLarge
                img={PORTAL_IMG}
                icon={HeartPulse}
                label="Pacientes"
                title="Portal de Salud"
                cta="Acceder"
                onClick={() => window.open("https://portaldesaludnutriser.club", "_blank")}
              />
            </div>
          </div>

          {/* Fila 2: 4 widgets cuadrados */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4">
            <WidgetSquare
              img={IMG_NUTRICION}
              icon={CalendarCheck}
              title="Membresía Nutrición"
              cta="Adquirir"
              onClick={() => handleNavigate("/memberships")}
              accent
            />
            <WidgetSquare
              img={IMG_TIENDA}
              icon={ShoppingBag}
              title="Tienda Productos"
              cta="Ver tienda"
              onClick={() => handleNavigate("/tienda")}
            />
            <WidgetSquare
              img={IMG_EBOOK}
              icon={BookOpen}
              title="Tienda eBook"
              cta="Ver eBooks"
              onClick={() => handleNavigate("/ebook")}
            />
            <WidgetSquare
              img={IMG_ACADEMY}
              icon={GraduationCap}
              title="Nutriser Academy"
              cta="Ver cursos"
              onClick={() => handleNavigate("/cursos")}
            />
          </div>

          {/* ── Barra de acciones rápidas ── */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-5">
            {/* Email / Cuponera */}
            {!emailDone ? (
              !showEmailForm ? (
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C5A55A]/50 hover:bg-white/10 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#C5A55A]/20 flex items-center justify-center group-hover:bg-[#C5A55A]/30 transition-colors">
                    <Mail className="w-5 h-5 text-[#C5A55A]" />
                  </div>
                  <span className="text-white/70 text-[10px] sm:text-xs font-semibold text-center leading-tight">
                    Cuponera
                  </span>
                </button>
              ) : (
                <div className="col-span-3">
                  <form onSubmit={handleEmailSubmit}>
                    <div className="flex items-center gap-2 bg-white/10 border border-[#C5A55A]/40 rounded-2xl px-3 py-2.5 focus-within:border-[#C5A55A] transition-colors">
                      <Mail className="w-4 h-4 text-[#C5A55A] flex-shrink-0" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="tu@correo.com"
                        autoFocus
                        className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none min-w-0"
                      />
                      <button
                        type="submit"
                        disabled={emailSubmitting}
                        className="bg-[#C5A55A] text-black text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#d4b46a] transition-colors disabled:opacity-60 flex-shrink-0"
                      >
                        {emailSubmitting ? "..." : "Suscribir"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-white/30 text-[10px] text-center mt-1.5">
                      Recibe alertas de promociones y descuentos exclusivos
                    </p>
                  </form>
                </div>
              )
            ) : (
              <button
                disabled
                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-[#C5A55A]/10 border border-[#C5A55A]/30"
              >
                <div className="w-9 h-9 rounded-xl bg-[#C5A55A]/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#C5A55A]" />
                </div>
                <span className="text-[#C5A55A] text-[10px] sm:text-xs font-semibold text-center leading-tight">
                  Suscrito ✓
                </span>
              </button>
            )}

            {/* Campana push */}
            {!showEmailForm && (
              pushEnabled ? (
                <div className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-[#C5A55A]/10 border border-[#C5A55A]/30">
                  <div className="relative w-9 h-9 rounded-xl bg-[#C5A55A]/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#C5A55A]" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border border-black flex items-center justify-center">
                      <span className="text-white text-[7px] font-bold">✓</span>
                    </span>
                  </div>
                  <span className="text-[#C5A55A] text-[10px] sm:text-xs font-semibold text-center leading-tight">
                    Activa ✓
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setShowNotifModal(true)}
                  className="relative flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C5A55A]/50 hover:bg-white/10 transition-all duration-200 group overflow-hidden"
                >
                  {/* Pulso de fondo */}
                  <span className="absolute inset-0 rounded-2xl bg-[#C5A55A]/10 animate-ping opacity-60" style={{ animationDuration: "2.5s" }} />
                  <div className="relative w-9 h-9 rounded-xl bg-[#C5A55A] flex items-center justify-center shadow-lg shadow-[#C5A55A]/40 group-hover:bg-[#d4b46a] transition-colors">
                    <BellRing className="w-5 h-5 text-black" />
                  </div>
                  <span className="relative text-white/70 text-[10px] sm:text-xs font-semibold text-center leading-tight">
                    Campana
                  </span>
                </button>
              )
            )}

            {/* WhatsApp */}
            {!showEmailForm && (
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-white/5 border border-white/10 hover:border-[#25D366]/50 hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30 group-hover:bg-[#1ebe5d] transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span className="text-white/70 text-[10px] sm:text-xs font-semibold text-center leading-tight">
                  WhatsApp
                </span>
              </a>
            )}
          </div>

          {/* ── Íconos sociales ── */}
          <div className="flex items-center justify-center gap-3 mb-5">
            {/* Instagram */}
            <a
              href="https://instagram.com/nutriserpv"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all duration-200"
              style={{ background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}
              aria-label="Instagram @nutriserpv"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com/nutriserpv"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Facebook @nutriserpv"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>


          </div>

          {/* ── Footer ── */}
          <p className="text-white/20 text-[10px] text-center pb-4">
            © 2025 Nutriser Aesthetic &amp; Nutrition · Todos los derechos reservados · nutriserpv.com
          </p>

        </div>
      </div>

      {/* ── Modal de Notificaciones ── */}
      {showNotifModal && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C5A55A]/20 to-[#C5A55A]/5 rounded-t-3xl p-5 flex items-start justify-between border-b border-white/10">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#C5A55A]" /> Suscribirse a Ofertas
                </h2>
                <p className="text-white/50 text-sm mt-1">Sé el primero en enterarte de nuevos cupones</p>
              </div>
              <button
                onClick={() => setShowNotifModal(false)}
                className="text-white/40 hover:text-white transition-colors ml-4 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Opción 1: Correo */}
              <div className="border border-[#C5A55A]/30 rounded-2xl p-4 space-y-3 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✉️</div>
                  <div>
                    <p className="font-bold text-white text-sm">Recibir por Correo</p>
                    <p className="text-white/50 text-xs">Te avisamos cada vez que haya una nueva oferta</p>
                  </div>
                </div>
                {emailDone ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                    <Check className="w-4 h-4" /> ¡Ya estás suscrito por correo!
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

              {/* Separador */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/30 uppercase tracking-wider">o también</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Opción 2: Push */}
              <div className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent rounded-2xl p-4 border border-[#C5A55A]/20">
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-0.5">🔔</div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">Notificaciones push al instante</p>
                    <p className="text-white/50 text-xs mt-0.5">Aviso en tu celular aunque no estés en el sitio</p>

                    {pushEnabled ? (
                      <div className="mt-2 flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                        <Check className="w-4 h-4" /> ¡Notificaciones activadas!
                      </div>
                    ) : isIOSSafari && !isPWA ? (
                      <div className="mt-3 space-y-2">
                        <p className="text-amber-300 text-xs font-semibold">📱 iPhone: un paso previo</p>
                        <p className="text-white/60 text-[11px] leading-relaxed">
                          Para activar notificaciones en iPhone, primero agrega esta página a tu pantalla de inicio:
                        </p>
                        <ol className="text-white/50 text-[11px] space-y-1 list-decimal list-inside">
                          <li>Toca el ícono <strong className="text-white">Compartir</strong>{" "}
                            <span className="inline-flex items-center justify-center bg-white/20 rounded-md px-1 py-0.5 mx-0.5" style={{ verticalAlign: "middle" }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><rect x="4" y="11" width="16" height="11" rx="2"/>
                              </svg>
                            </span>
                          </li>
                          <li>Selecciona <strong className="text-white">"Agregar a pantalla de inicio"</strong></li>
                          <li>Abre la app desde tu pantalla de inicio</li>
                          <li>Regresa aquí y presiona el botón de abajo</li>
                        </ol>
                        <button
                          onClick={handleEnablePush}
                          disabled={pushLoading}
                          className="mt-1 bg-[#C5A55A] hover:bg-[#d4b46a] disabled:opacity-50 text-black px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          {pushLoading
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Activando...</>
                            : <><BellRing className="w-3.5 h-3.5" /> Activar Notificaciones Push</>}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {!isIOSSafari && (
                          <p className="text-white/50 text-[11px]">✅ En Android/Chrome se activa con un solo clic</p>
                        )}
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
                Puedes cancelar tu suscripción en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
