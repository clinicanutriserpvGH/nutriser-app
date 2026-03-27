import { useEffect, useState } from "react";
import { Activity, Bell, BookOpen, CalendarCheck, GraduationCap, HeartPulse, MessageCircle, ShoppingBag, Stethoscope } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

const CLINIC_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-1_5c6ba72c.jpg";

const PORTAL_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-3_c9c66a2b.webp";

const CLINIC_IMG2 =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-2_d6662dc0.jpg";

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
}

export default function SplashSelector({ onEnterSite }: SplashSelectorProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushDone, setPushDone] = useState(() =>
    localStorage.getItem("nutriser_push_enabled") === "true"
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

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleEnterSite = () => {
    setLeaving(true);
    setTimeout(() => onEnterSite(), 500);
  };

  const handleNavigate = (path: string) => {
    setLeaving(true);
    setTimeout(() => {
      onEnterSite();
      window.location.href = path;
    }, 500);
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
      const savedEmail = localStorage.getItem("nutriser_subscriber_email") || undefined;
      await pushSubscribeMutation.mutateAsync({ endpoint: subscription.endpoint, p256dh, auth, email: savedEmail });
    } catch (e: any) {
      toast.error("Error al activar notificaciones: " + e.message);
    }
    setPushLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0f0f0f] overflow-y-auto py-8 px-4"
      style={{
        opacity: leaving ? 0 : visible ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    >
      {/* Logo + título */}
      <div className="flex flex-col items-center mb-5">
        <img src={LOGO_URL} alt="Nutriser" className="w-16 h-16 object-contain mb-3" />
        <p className="text-[#C5A55A] text-xs tracking-[0.3em] uppercase font-light">
          Aesthetic & Nutrition
        </p>
        <h1 className="text-white text-lg font-light tracking-widest mt-2 text-center">
          Selecciona el apartado de tu interés
        </h1>
        <div className="w-12 h-px bg-[#C5A55A] mt-3" />
      </div>

      {/* ── Fila 1: Nutriser principal + Portal de Salud ── */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mb-3">
        {/* Tarjeta: Nutriser principal */}
        <button
          onClick={handleEnterSite}
          className="group relative flex-1 h-52 sm:h-60 rounded-2xl overflow-hidden border border-white/10 hover:border-[#C5A55A]/60 transition-all duration-300 hover:scale-[1.02] focus:outline-none"
        >
          <img src={CLINIC_IMG} alt="Nutriser" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-[#C5A55A]/20 border border-[#C5A55A]/40 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5 text-[#C5A55A]" />
              </div>
              <span className="text-[#C5A55A] text-xs tracking-widest uppercase font-medium">Clínica</span>
            </div>
            <h2 className="text-white text-lg font-semibold leading-tight mb-1">
              Nutriser
              <br />
              <span className="text-[#C5A55A] italic font-light text-sm">Aesthetic & Nutrition</span>
            </h2>
            <p className="text-white/60 text-xs leading-relaxed mb-2">
              Servicios, tratamientos, citas y programas de nutrición.
            </p>
            <div className="w-full bg-[#C5A55A] text-black text-xs font-bold tracking-widest uppercase py-2 rounded-lg text-center group-hover:bg-[#d4b46a] transition-colors">
              Entrar →
            </div>
          </div>
        </button>

        {/* Tarjeta: Portal de Salud */}
        <button
          onClick={handleEnterPortal}
          className="group relative flex-1 h-52 sm:h-60 rounded-2xl overflow-hidden border border-[#C5A55A]/30 hover:border-[#C5A55A] transition-all duration-300 hover:scale-[1.02] focus:outline-none"
        >
          <img src={PORTAL_IMG} alt="Portal de Salud" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#C5A55A]/10 rounded-full blur-2xl" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <div className="relative w-7 h-7 rounded-full bg-[#C5A55A]/20 border border-[#C5A55A]/60 flex items-center justify-center">
                <HeartPulse className="w-3.5 h-3.5 text-[#C5A55A]" />
                <span className="absolute inset-0 rounded-full border border-[#C5A55A]/40 animate-ping" />
              </div>
              <span className="text-[#C5A55A] text-xs tracking-widest uppercase font-medium">Pacientes activos</span>
            </div>
            <h2 className="text-white text-lg font-semibold leading-tight mb-1">
              Portal de Salud
              <br />
              <span className="text-[#C5A55A] italic font-light text-sm">Nutriser</span>
            </h2>
            <p className="text-white/60 text-xs leading-relaxed mb-2">
              Seguimiento de progreso, dietas, historial y citas.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[{ icon: Activity, label: "Progreso" }, { icon: Stethoscope, label: "Historial" }].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1 bg-[#C5A55A]/15 rounded-full px-2 py-0.5 text-[#C5A55A] text-xs border border-[#C5A55A]/20">
                  <Icon className="w-3 h-3" />{label}
                </span>
              ))}
            </div>
            <div className="w-full bg-[#C5A55A] text-black text-xs font-bold tracking-widest uppercase py-2 rounded-lg text-center group-hover:bg-[#d4b46a] transition-colors">
              Acceder →
            </div>
          </div>
        </button>
      </div>

      {/* ── Fila 2: Tienda Productos · Tienda eBook · Nutriser Academy ── */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mb-4">
        {/* Tienda de Productos */}
        <button
          onClick={() => handleNavigate("/tienda")}
          className="group relative flex-1 h-32 sm:h-40 rounded-2xl overflow-hidden border border-white/10 hover:border-[#C5A55A]/60 transition-all duration-300 hover:scale-[1.02] focus:outline-none"
        >
          <img src={CLINIC_IMG2} alt="Tienda" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
          <div className="absolute inset-0 flex flex-col justify-end p-3 text-left">
            <div className="w-6 h-6 rounded-full bg-[#C5A55A]/20 border border-[#C5A55A]/40 flex items-center justify-center mb-1">
              <ShoppingBag className="w-3 h-3 text-[#C5A55A]" />
            </div>
            <h3 className="text-white text-sm font-semibold mb-0.5">Tienda de Productos</h3>
            <div className="w-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-widest uppercase py-1.5 rounded-lg text-center group-hover:bg-[#C5A55A] group-hover:text-black group-hover:border-[#C5A55A] transition-colors">
              Ver tienda →
            </div>
          </div>
        </button>

        {/* Tienda eBook */}
        <button
          onClick={() => handleNavigate("/ebook")}
          className="group relative flex-1 h-32 sm:h-40 rounded-2xl overflow-hidden border border-white/10 hover:border-[#C5A55A]/60 transition-all duration-300 hover:scale-[1.02] focus:outline-none"
        >
          <img src={PORTAL_IMG} alt="eBook" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
          <div className="absolute inset-0 flex flex-col justify-end p-3 text-left">
            <div className="w-6 h-6 rounded-full bg-[#C5A55A]/20 border border-[#C5A55A]/40 flex items-center justify-center mb-1">
              <BookOpen className="w-3 h-3 text-[#C5A55A]" />
            </div>
            <h3 className="text-white text-sm font-semibold mb-0.5">Tienda eBook</h3>
            <div className="w-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-widest uppercase py-1.5 rounded-lg text-center group-hover:bg-[#C5A55A] group-hover:text-black group-hover:border-[#C5A55A] transition-colors">
              Ver eBooks →
            </div>
          </div>
        </button>

        {/* Nutriser Academy */}
        <button
          onClick={() => handleNavigate("/cursos")}
          className="group relative flex-1 h-32 sm:h-40 rounded-2xl overflow-hidden border border-white/10 hover:border-[#C5A55A]/60 transition-all duration-300 hover:scale-[1.02] focus:outline-none"
        >
          <img src={CLINIC_IMG} alt="Academy" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
          <div className="absolute inset-0 flex flex-col justify-end p-3 text-left">
            <div className="w-6 h-6 rounded-full bg-[#C5A55A]/20 border border-[#C5A55A]/40 flex items-center justify-center mb-1">
              <GraduationCap className="w-3 h-3 text-[#C5A55A]" />
            </div>
            <h3 className="text-white text-sm font-semibold mb-0.5">Nutriser Academy</h3>
            <div className="w-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-widest uppercase py-1.5 rounded-lg text-center group-hover:bg-[#C5A55A] group-hover:text-black group-hover:border-[#C5A55A] transition-colors">
              Ver cursos →
            </div>
          </div>
        </button>
      </div>

      {/* ── Fila 3: WhatsApp + Campana notificaciones ── */}
      <div className="flex gap-3 w-full max-w-2xl">
        {/* Botón WhatsApp */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2.5 bg-[#25D366] text-white px-5 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-[#25D366]/30 hover:bg-[#1ebe5d] hover:shadow-xl hover:shadow-[#25D366]/40 hover:scale-[1.02] transition-all duration-300"
        >
          {/* WhatsApp SVG icon */}
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>

        {/* Botón Campana — Activar notificaciones */}
        <button
          onClick={handleEnablePush}
          disabled={pushLoading || pushDone}
          className={`flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all duration-300 hover:scale-[1.02] ${
            pushDone
              ? "bg-[#C5A55A]/20 border border-[#C5A55A]/40 text-[#C5A55A] cursor-default"
              : "bg-[#1A1A1A] border-2 border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A] hover:text-black shadow-[#C5A55A]/20"
          }`}
        >
          <Bell className={`w-5 h-5 flex-shrink-0 ${pushLoading ? "animate-bounce" : ""}`} />
          {pushDone
            ? "Notificaciones activas ✓"
            : pushLoading
            ? "Activando..."
            : "Activa notificaciones de descuentos"}
        </button>
      </div>

      {/* Nota al pie */}
      <p className="text-white/30 text-xs mt-5 text-center px-4">
        El Portal de Salud es exclusivo para pacientes activos de Nutriser
      </p>
    </div>
  );
}
