import { useEffect, useState } from "react";
import { Activity, Bell, BookOpen, Gift, GraduationCap, HeartPulse, Mail, ShoppingBag, Stethoscope, X } from "lucide-react";
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
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

interface SplashSelectorProps {
  onEnterSite: () => void;
  /** Callback para navegar a una ruta interna usando el router de React (sin recargar la página) */
  onNavigate?: (path: string) => void;
}

/** Tarjeta grande (Nutriser / Portal) */
function BigCard({
  img, badge, badgeIcon: BadgeIcon, title, subtitle, desc, chips, cta, onClick, highlight,
}: {
  img: string; badge: string; badgeIcon: React.ElementType; title: string; subtitle?: string;
  desc: string; chips?: { icon: React.ElementType; label: string }[]; cta: string;
  onClick: () => void; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.01] focus:outline-none ${
        highlight ? "border-[#C5A55A]/50 hover:border-[#C5A55A]" : "border-white/10 hover:border-[#C5A55A]/60"
      }`}
      style={{ minHeight: "160px" }}
    >
      <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/20" />
      <div className="relative flex flex-col justify-end p-4 text-left" style={{ minHeight: "160px" }}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${highlight ? "bg-[#C5A55A]/20 border border-[#C5A55A]/60" : "bg-[#C5A55A]/20 border border-[#C5A55A]/40"}`}>
            <BadgeIcon className="w-3 h-3 text-[#C5A55A]" />
            {highlight && <span className="absolute inset-0 rounded-full border border-[#C5A55A]/40 animate-ping" />}
          </div>
          <span className="text-[#C5A55A] text-xs tracking-widest uppercase font-medium">{badge}</span>
        </div>
        <h2 className="text-white text-base font-semibold leading-tight mb-0.5">
          {title}
          {subtitle && <><br /><span className="text-[#C5A55A] italic font-light text-sm">{subtitle}</span></>}
        </h2>
        <p className="text-white/55 text-xs leading-relaxed mb-2">{desc}</p>
        {chips && chips.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {chips.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1 bg-[#C5A55A]/15 rounded-full px-2 py-0.5 text-[#C5A55A] text-xs border border-[#C5A55A]/20">
                <Icon className="w-3 h-3" />{label}
              </span>
            ))}
          </div>
        )}
        <div className="w-full bg-[#C5A55A] text-black text-xs font-bold tracking-widest uppercase py-2 rounded-lg text-center group-hover:bg-[#d4b46a] transition-colors">
          {cta}
        </div>
      </div>
    </button>
  );
}

/** Tarjeta pequeña (Nutrición, Tienda, eBook, Academy) */
function SmallCard({
  img, icon: Icon, title, cta, onClick, highlight,
}: {
  img: string; icon: React.ElementType; title: string; cta: string; onClick: () => void; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full rounded-xl overflow-hidden border transition-all duration-300 hover:scale-[1.01] focus:outline-none ${
        highlight ? "border-2 border-[#C5A55A]/60 hover:border-[#C5A55A]" : "border border-white/10 hover:border-[#C5A55A]/50"
      }`}
      style={{ minHeight: "90px" }}
    >
      <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/60 to-black/25" />
      <div className="relative flex flex-col justify-end p-3 text-left" style={{ minHeight: "90px" }}>
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-5 h-5 rounded-full bg-[#C5A55A]/20 border border-[#C5A55A]/50 flex items-center justify-center flex-shrink-0">
            <Icon className="w-2.5 h-2.5 text-[#C5A55A]" />
          </div>
          <h3 className="text-white text-xs font-semibold leading-tight">{title}</h3>
        </div>
        <div className={`w-full text-xs font-bold tracking-wide uppercase py-1.5 rounded-lg text-center transition-colors ${
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

export default function SplashSelector({ onEnterSite, onNavigate }: SplashSelectorProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushDone, setPushDone] = useState(() =>
    localStorage.getItem("nutriser_push_enabled") === "true"
  );

  // Estado del formulario de email
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailDone, setEmailDone] = useState(() =>
    localStorage.getItem("nutriser_email_subscribed") === "true"
  );

  const { data: vapidData } = trpc.push.getVapidPublicKey.useQuery();
  const pushSubscribeMutation = trpc.push.subscribe.useMutation({
    onSuccess: () => {
      setPushDone(true);
      localStorage.setItem("nutriser_push_enabled", "true");
      toast.success("🔔 ¡Notificaciones activadas! Te avisaremos de descuentos.");
    },
    onError: () => {
      toast.error("No se pudieron activar las notificaciones.");
    },
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

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleEnterSite = () => {
    setLeaving(true);
    setTimeout(() => onEnterSite(), 500);
  };

  /**
   * Navegar desde el splash a una ruta interna.
   * Usa onNavigate (router de wouter) si está disponible — SIN recargar la página, SIN flash del Home.
   * Fallback a window.location.href solo si no hay router disponible.
   */
  const handleNavigate = (path: string) => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    setLeaving(true);
    setTimeout(() => {
      if (onNavigate) {
        onNavigate(path);
      } else {
        window.location.href = path;
      }
    }, 400);
  };

  const handleEnterPortal = () => {
    window.open("https://portaldesaludnutriser.club", "_blank");
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
      if (!publicKey) {
        toast.error("Error de configuración.");
        setPushLoading(false);
        return;
      }
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }
      const p256dhArr = new Uint8Array(subscription.getKey("p256dh")!);
      const authArr = new Uint8Array(subscription.getKey("auth")!);
      const p256dh = btoa(Array.from(p256dhArr).map((b) => String.fromCharCode(b)).join(""));
      const auth = btoa(Array.from(authArr).map((b) => String.fromCharCode(b)).join(""));
      const savedEmail = emailInput || localStorage.getItem("nutriser_subscriber_email") || undefined;
      await pushSubscribeMutation.mutateAsync({ endpoint: subscription.endpoint, p256dh, auth, email: savedEmail });
    } catch (e: any) {
      toast.error("Error al activar notificaciones: " + e.message);
    }
    setPushLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes("@")) {
      toast.error("Ingresa un correo válido.");
      return;
    }
    setEmailSubmitting(true);
    localStorage.setItem("nutriser_subscriber_email", emailInput.trim());
    await emailSubscribeMutation.mutateAsync({ email: emailInput.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-[#0f0f0f] overflow-y-auto"
      style={{
        opacity: leaving ? 0 : visible ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    >
      {/* Contenedor interno — centrado, padding generoso, max-width para tablet/desktop */}
      <div className="min-h-full flex flex-col items-center justify-center py-6 px-4">
        <div className="w-full" style={{ maxWidth: "min(520px, 100%)" }}>

          {/* Logo + título */}
          <div className="flex flex-col items-center mb-5">
            <img src={LOGO_URL} alt="Nutriser" className="w-14 h-14 object-contain mb-2" />
            <p className="text-[#C5A55A] text-[10px] tracking-[0.3em] uppercase font-light">
              Aesthetic & Nutrition
            </p>
            <h1 className="text-white text-base font-light tracking-widest mt-1.5 text-center">
              Selecciona el apartado de tu interés
            </h1>
            <div className="w-10 h-px bg-[#C5A55A] mt-2.5" />
          </div>

          {/* Fila 1: Nutriser + Portal (en móvil apiladas, en sm lado a lado) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <BigCard
              img={CLINIC_IMG}
              badge="Clínica"
              badgeIcon={ShoppingBag}
              title="Nutriser"
              subtitle="Aesthetic & Nutrition"
              desc="Servicios, tratamientos, citas y programas de nutrición."
              cta="Entrar →"
              onClick={handleEnterSite}
            />
            <BigCard
              img={PORTAL_IMG}
              badge="Pacientes activos"
              badgeIcon={HeartPulse}
              title="Portal de Salud"
              subtitle="Nutriser"
              desc="Seguimiento de progreso, dietas, historial y citas."
              chips={[
                { icon: Activity, label: "Progreso" },
                { icon: Stethoscope, label: "Historial" },
              ]}
              cta="Acceder →"
              onClick={handleEnterPortal}
              highlight
            />
          </div>

          {/* Fila 2: Programa Nutrición + Tienda Productos */}
          <div className="grid grid-cols-2 gap-3 mb-3">
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
          </div>

          {/* Fila 3: eBook + Academy */}
          <div className="grid grid-cols-2 gap-3 mb-4">
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

          {/* Fila inferior: Campana + Email + WhatsApp */}
          <div className="flex flex-col gap-2 mb-4">

            {/* Formulario de correo */}
            {!emailDone ? (
              <div className="w-full">
                {!showEmailForm ? (
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all duration-300 hover:scale-[1.02] bg-[#1A1A1A] border-2 border-[#C5A55A]/50 text-[#C5A55A] hover:border-[#C5A55A] hover:bg-[#C5A55A]/10"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">Recibe descuentos en tu correo</span>
                  </button>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="w-full">
                    <div className="flex items-center gap-2 bg-[#1A1A1A] border-2 border-[#C5A55A]/60 rounded-xl px-3 py-2 focus-within:border-[#C5A55A] transition-colors">
                      <Mail className="w-4 h-4 text-[#C5A55A] flex-shrink-0" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="tu@correo.com"
                        autoFocus
                        className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none min-w-0"
                      />
                      <button
                        type="submit"
                        disabled={emailSubmitting}
                        className="bg-[#C5A55A] text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#d4b46a] transition-colors disabled:opacity-60 flex-shrink-0"
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
                    <p className="text-white/35 text-[10px] text-center mt-1 px-1">
                      Recibirás alertas de promociones y descuentos exclusivos
                    </p>
                  </form>
                )}
              </div>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A]/30 text-[#C5A55A] text-xs font-semibold">
                <Mail className="w-4 h-4" />
                ¡Suscrito a descuentos por correo! ✓
              </div>
            )}

            {/* Fila: Campana + WhatsApp */}
            <div className="flex items-center gap-3">
              {/* Campana */}
              <div className="flex-1 flex flex-col gap-1">
                <button
                  onClick={handleEnablePush}
                  disabled={pushLoading || pushDone}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                    pushDone
                      ? "bg-[#C5A55A]/20 border border-[#C5A55A]/40 text-[#C5A55A] cursor-default"
                      : "bg-[#1A1A1A] border-2 border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A] hover:text-black"
                  }`}
                >
                  <Bell className={`w-4 h-4 flex-shrink-0 ${pushLoading ? "animate-bounce" : ""}`} />
                  <span className="text-xs">
                    {pushDone
                      ? "Notificaciones activas ✓"
                      : pushLoading
                      ? "Activando..."
                      : "Activa notificaciones"}
                  </span>
                </button>
                {!pushDone && (
                  <p className="text-white/40 text-[10px] text-center leading-snug px-1">
                    Recibe alertas push de descuentos exclusivos
                  </p>
                )}
              </div>

              {/* WhatsApp circular */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex-shrink-0 w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/40 hover:bg-[#1ebe5d] hover:scale-110 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <span className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-40" />
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Nota al pie */}
          <p className="text-white/25 text-[10px] text-center px-4 pb-4">
            El Portal de Salud es exclusivo para pacientes activos de Nutriser
          </p>

        </div>
      </div>
    </div>
  );
}
