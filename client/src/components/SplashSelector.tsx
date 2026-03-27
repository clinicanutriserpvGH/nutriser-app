import { useEffect, useState } from "react";
import {
  Activity, Bell, BellRing, BookOpen, CalendarCheck, Check, ClipboardList, FlaskConical, Gift, GraduationCap,
  HeartPulse, LayoutList, Loader2, Mail, MapPin, Pill, ShoppingBag, ShoppingCart, Stethoscope, Tag, TrendingUp, Utensils, X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const CLINIC_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-1_5c6ba72c.jpg";
const PORTAL_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-3_c9c66a2b.webp";
const IMG_NUTRICION =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutricion-bowl_314c08fe.jpg";
const IMG_TIENDA =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/tienda-productos_2c07d4aa.jpg";
const IMG_EBOOK =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/ebook-nutricion_4d2fbcf3.jpg";
const IMG_ACADEMY =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/academy-nutricion_8ac7b33a.webp";
const WHATSAPP_URL =
  "https://wa.me/523221007799?text=Hola%2C%20me%20interesa%20agendar%20una%20valoraci%C3%B3n%20en%20Nutriser";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) out[i] = rawData.charCodeAt(i);
  return out;
}

interface SplashSelectorProps {
  onEnterSite: () => void;
  onNavigate?: (path: string) => void;
  /** Cuando true, el splash está en modo transición (esperando que la página destino cargue) */
  isTransitioning?: boolean;
}

/* ─── Tarjeta grande ─────────────────────────────────────────────────────── */
function BigCard({
  img, badge, badgeIcon: Icon, title, subtitle, desc, chips, cta, onClick, highlight,
}: {
  img: string; badge: string; badgeIcon: React.ElementType; title: string; subtitle?: string;
  desc?: string; chips?: { icon: React.ElementType; label: string }[]; cta: string;
  onClick: () => void; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.015] focus:outline-none ${
        highlight ? "border-[#C5A55A]/60 hover:border-[#C5A55A]" : "border-white/10 hover:border-[#C5A55A]/60"
      }`}
    >
      <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      {/* Overlay más oscuro para mejor legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
      <div className="relative flex flex-col justify-end p-4 md:p-6 text-left min-h-[200px] md:min-h-[240px] lg:min-h-[280px]">
        {/* Badge con fondo sólido para máxima legibilidad */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-[#C5A55A] shadow-lg`}>
            <Icon className="w-3 h-3 md:w-3.5 md:h-3.5 text-black" />
          </div>
          <span className="text-[#C5A55A] text-[10px] md:text-xs tracking-widest uppercase font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">{badge}</span>
        </div>
        {/* Título con sombra de texto fuerte */}
        <h2 className="text-white text-lg md:text-2xl lg:text-3xl font-bold leading-tight mb-1 drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">
          {title}
          {subtitle && <><br /><span className="text-[#C5A55A] italic font-light text-sm md:text-base drop-shadow-[0_1px_4px_rgba(0,0,0,1)]">{subtitle}</span></>}
        </h2>
        {desc && (
          <div className="bg-black/50 rounded-lg px-3 py-2 mb-3 backdrop-blur-sm">
            <p className="text-white text-xs md:text-sm leading-relaxed">{desc}</p>
          </div>
        )}
        {chips && chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {chips.map(({ icon: CIcon, label }) => (
              <span key={label} className="flex items-center gap-1 bg-[#C5A55A] rounded-full px-2.5 py-1 text-black text-xs font-bold shadow-md">
                <CIcon className="w-3 h-3" />{label}
              </span>
            ))}
          </div>
        )}
        <div className="w-full bg-[#C5A55A] text-black text-xs md:text-sm font-bold tracking-widest uppercase py-2.5 md:py-3 rounded-lg text-center group-hover:bg-[#d4b46a] transition-colors shadow-lg">
          {cta}
        </div>
      </div>
    </button>
  );
}

/* ─── Tarjeta pequeña ────────────────────────────────────────────────────── */
function SmallCard({
  img, icon: Icon, title, cta, onClick, highlight,
}: {
  img: string; icon: React.ElementType; title: string; cta: string; onClick: () => void; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full rounded-xl overflow-hidden border transition-all duration-300 hover:scale-[1.015] focus:outline-none ${
        highlight ? "border-2 border-[#C5A55A]/60 hover:border-[#C5A55A]" : "border border-white/10 hover:border-[#C5A55A]/50"
      }`}
    >
      <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/35" />
      <div className="relative flex flex-col justify-end p-3 md:p-5 text-left min-h-[120px] md:min-h-[160px] lg:min-h-[190px]">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#C5A55A] flex items-center justify-center flex-shrink-0 shadow-md">
            <Icon className="w-2.5 h-2.5 md:w-3 md:h-3 text-black" />
          </div>
          <h3 className="text-white text-xs md:text-sm font-bold leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,1)]">{title}</h3>
        </div>
        <div className={`w-full text-xs md:text-sm font-bold tracking-wide uppercase py-2 md:py-2.5 rounded-lg text-center transition-colors ${
          highlight
            ? "bg-[#C5A55A] text-black group-hover:bg-[#d4b46a]"
            : "bg-white/10 border border-white/20 text-white group-hover:bg-[#C5A55A] group-hover:text-black group-hover:border-[#C5A55A]"
        }`}>
          {cta}
        </div>
      </div>
    </button>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function SplashSelector({ onEnterSite, onNavigate, isTransitioning }: SplashSelectorProps) {
  const [visible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  // Notificaciones push
  const [pushLoading, setPushLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(() => localStorage.getItem("nutriser_push_enabled") === "true");

  // Email
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailDone, setEmailDone] = useState(() => localStorage.getItem("nutriser_email_subscribed") === "true");

  // Modal de notificaciones (igual que PromotionsSection)
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Detectar iOS/Safari (igual que PromotionsSection)
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
    // Navegar de inmediato sin esperar animación de salida para evitar el flash de Home
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

  // Cuando estamos en modo transición, mostrar solo pantalla de carga negra
  // para cubrir el router mientras la página destino se monta
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

  return (
    <div
      className="fixed inset-0 z-[99999] bg-white overflow-y-auto"
      style={{ opacity: leaving ? 0 : 1, transition: leaving ? "opacity 0.4s ease" : "none" }}
    >
      {/* ── Contenedor principal: se expande en tablet/desktop ── */}
      <div className="min-h-full flex flex-col items-center justify-center py-8 px-4 md:px-8 lg:px-12">
        <div className="w-full max-w-[520px] md:max-w-[800px] lg:max-w-[1100px]">

          {/* Logo + título */}
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <img src={LOGO_URL} alt="Nutriser" className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain mb-2" />
            <p className="text-[#C5A55A] text-[10px] md:text-xs tracking-[0.3em] uppercase font-light">Aesthetic & Nutrition</p>
            <h1 className="text-[#1A1A1A] text-base md:text-xl lg:text-2xl font-light tracking-widest mt-2 text-center">
              Selecciona el apartado de tu interés
            </h1>
            <div className="w-10 md:w-16 h-px bg-[#C5A55A] mt-3" />
          </div>

          {/* ── MÓVIL: layout apilado ── */}
          {/* ── TABLET (md): 2 columnas ── */}
          {/* ── DESKTOP (lg): 3 columnas ── */}

          {/* Fila 1: Nutriser + Portal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
            <BigCard
              img={CLINIC_IMG}
              badge="Clínica Aesthetic & Nutrition"
              badgeIcon={ShoppingBag}
              title="Nutriser"
              subtitle="Tu salud y belleza en un solo lugar"
              chips={[
                { icon: LayoutList, label: "Catálogo de servicios" },
                { icon: CalendarCheck, label: "Agenda tu cita" },
                { icon: Tag, label: "Cuponera de descuentos" },
                { icon: MapPin, label: "Ubicación" },
              ]}
              cta="Entrar →"
              onClick={handleEnterSite}
            />
            <BigCard
              img={PORTAL_IMG}
              badge="Pacientes en línea & presencial"
              badgeIcon={HeartPulse}
              title="Portal de Salud"
              subtitle="Tu seguimiento personalizado"
              chips={[
                { icon: TrendingUp, label: "Mediciones" },
                { icon: Utensils, label: "Plan alimentario" },
                { icon: ClipboardList, label: "Hábitos" },
                { icon: Pill, label: "Suplementación" },
                { icon: Activity, label: "Seguimiento" },
                { icon: ShoppingCart, label: "Lista de compras" },
              ]}
              cta="Acceder →"
              onClick={() => window.open("https://portaldesaludnutriser.club", "_blank")}
              highlight
            />
          </div>

          {/* Fila 2: 4 tarjetas pequeñas — 2 cols en móvil, 4 cols en tablet+ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5">
            <SmallCard
              img={IMG_NUTRICION}
              icon={Gift}
              title="Programa Nutrición"
              cta="Adquirir →"
              onClick={() => handleNavigate("/memberships")}
              highlight
            />
            <SmallCard
              img={IMG_TIENDA}
              icon={ShoppingBag}
              title="Tienda Productos"
              cta="Ver tienda →"
              onClick={() => handleNavigate("/tienda")}
            />
            <SmallCard
              img={IMG_EBOOK}
              icon={BookOpen}
              title="Tienda eBook"
              cta="Ver eBooks →"
              onClick={() => handleNavigate("/ebook")}
            />
            <SmallCard
              img={IMG_ACADEMY}
              icon={GraduationCap}
              title="Nutriser Academy"
              cta="Ver cursos →"
              onClick={() => handleNavigate("/cursos")}
            />
          </div>

          {/* Fila inferior: Email + Campana + WhatsApp */}
          <div className="flex flex-col gap-2 md:gap-3 mb-4">

            {/* Email */}
            {!emailDone ? (
              !showEmailForm ? (
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 md:py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:scale-[1.01] bg-white border-2 border-[#C5A55A]/50 text-[#C5A55A] hover:border-[#C5A55A] hover:bg-[#C5A55A]/10"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs md:text-sm">Recibe descuentos en tu correo</span>
                </button>
              ) : (
                <form onSubmit={handleEmailSubmit} className="w-full">
                  <div className="flex items-center gap-2 bg-white border-2 border-[#C5A55A]/60 rounded-xl px-3 py-2.5 focus-within:border-[#C5A55A] transition-colors">
                    <Mail className="w-4 h-4 text-[#C5A55A] flex-shrink-0" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="tu@correo.com"
                      autoFocus
                      className="flex-1 bg-transparent text-[#1A1A1A] text-sm placeholder-black/30 outline-none min-w-0"
                    />
                    <button
                      type="submit"
                      disabled={emailSubmitting}
                      className="bg-[#C5A55A] text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#d4b46a] transition-colors disabled:opacity-60 flex-shrink-0"
                    >
                      {emailSubmitting ? "..." : "Suscribir"}
                    </button>
                    <button type="button" onClick={() => setShowEmailForm(false)} className="text-black/40 hover:text-black/70 transition-colors flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-black/35 text-[10px] text-center mt-1">Recibirás alertas de promociones y descuentos exclusivos</p>
                </form>
              )
            ) : (
              <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A]/30 text-[#C5A55A] text-xs md:text-sm font-semibold">
                <Mail className="w-4 h-4" /> ¡Suscrito a descuentos por correo! ✓
              </div>
            )}

            {/* Campana + WhatsApp */}
            <div className="flex items-center gap-3">
              {/* Botón campana — abre modal igual que PromotionsSection */}
              {pushEnabled ? (
                <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#C5A55A]/20 border border-[#C5A55A]/40 text-[#C5A55A] text-xs md:text-sm font-semibold">
                  <Bell className="w-4 h-4" /> Notificaciones activas ✓
                </div>
              ) : (
                <button
                  onClick={() => setShowNotifModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-3.5 rounded-xl font-bold text-xs md:text-sm tracking-wide border-2 border-[#C5A55A] text-[#C5A55A] bg-white hover:bg-[#C5A55A] hover:text-black transition-all duration-300 hover:scale-[1.01]"
                >
                  <Bell className="w-4 h-4 flex-shrink-0" />
                  Activa notificaciones de descuentos
                </button>
              )}

              {/* WhatsApp */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/40 hover:bg-[#1ebe5d] hover:scale-110 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <span className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-40" />
                <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          <p className="text-black/30 text-[10px] md:text-xs text-center pb-4">
            El Portal de Salud es exclusivo para pacientes activos de Nutriser
          </p>
        </div>
      </div>

      {/* ── Modal de Notificaciones (idéntico a PromotionsSection) ── */}
      {showNotifModal && (
        <div className="fixed inset-0 z-[100000] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2d2416] rounded-t-2xl p-5 flex items-start justify-between">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#C5A55A]" /> Suscribirse a Ofertas
                </h2>
                <p className="text-white/60 text-sm mt-1">Sé el primero en enterarte de nuevos cupones</p>
              </div>
              <button onClick={() => setShowNotifModal(false)} className="text-white/60 hover:text-white transition-colors ml-4 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Opción 1: Correo */}
              <div className="border-2 border-[#C5A55A]/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✉️</div>
                  <div>
                    <p className="font-bold text-[#1A1A1A] text-sm">Recibir por Correo</p>
                    <p className="text-gray-500 text-xs">Te avisamos cada vez que haya una nueva oferta</p>
                  </div>
                </div>
                {emailDone ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                    <Check className="w-4 h-4" /> ¡Ya estás suscrito por correo!
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="flex gap-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="tu@correo.com"
                      className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C5A55A] transition"
                      required
                    />
                    <button
                      type="submit"
                      disabled={emailSubmitting}
                      className="bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {emailSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Bell className="w-4 h-4" /> Suscribir</>}
                    </button>
                  </form>
                )}
              </div>

              {/* Separador */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">o también</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Opción 2: Push */}
              <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2d2416] rounded-xl p-4 border border-[#C5A55A]/30">
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-0.5">🔔</div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">Notificaciones push al instante</p>
                    <p className="text-white/60 text-xs mt-0.5">Aviso en tu celular aunque no estés en el sitio</p>

                    {pushEnabled ? (
                      <div className="mt-2 flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                        <Check className="w-4 h-4" /> ¡Notificaciones activadas!
                      </div>
                    ) : isIOSSafari && !isPWA ? (
                      /* iPhone en Safari: instrucciones para agregar a pantalla de inicio */
                      <div className="mt-3 space-y-2">
                        <p className="text-amber-300 text-xs font-semibold">📱 iPhone: un paso previo</p>
                        <p className="text-white/70 text-[11px] leading-relaxed">
                          Para activar notificaciones en iPhone, primero agrega esta página a tu pantalla de inicio:
                        </p>
                        <ol className="text-white/60 text-[11px] space-y-1 list-decimal list-inside">
                          <li>Toca el ícono <strong className="text-white">Compartir</strong>:{" "}
                            <span className="inline-flex items-center justify-center bg-white/20 rounded-md px-1 py-0.5 mx-0.5" style={{ verticalAlign: "middle" }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><rect x="4" y="11" width="16" height="11" rx="2"/>
                              </svg>
                            </span>{" "}
                            (en la barra inferior del navegador)
                          </li>
                          <li>Selecciona <strong className="text-white">"Agregar a pantalla de inicio"</strong></li>
                          <li>Abre la app desde tu pantalla de inicio</li>
                          <li>Regresa aquí y presiona el botón de abajo</li>
                        </ol>
                        <button
                          onClick={handleEnablePush}
                          disabled={pushLoading}
                          className="mt-1 bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                        >
                          {pushLoading
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Activando...</>
                            : <><BellRing className="w-3.5 h-3.5" /> Activar Notificaciones Push</>}
                        </button>
                      </div>
                    ) : (
                      /* Android / Chrome: un clic */
                      <div className="mt-2 space-y-2">
                        {!isIOSSafari && (
                          <p className="text-white/60 text-[11px]">✅ En Android/Chrome se activa con un solo clic</p>
                        )}
                        <button
                          onClick={handleEnablePush}
                          disabled={pushLoading}
                          className="bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
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

              <p className="text-xs text-gray-400 text-center">Puedes cancelar tu suscripción en cualquier momento.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
