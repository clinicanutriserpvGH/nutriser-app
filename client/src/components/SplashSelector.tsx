import { useEffect, useState } from "react";
import { Activity, BookOpen, CalendarCheck, HeartPulse, ShoppingBag, Stethoscope } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

const CLINIC_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-1_5c6ba72c.jpg";

const PORTAL_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-3_c9c66a2b.webp";

interface SplashSelectorProps {
  onEnterSite: () => void;
}

export default function SplashSelector({ onEnterSite }: SplashSelectorProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Fade in on mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleEnterSite = () => {
    setLeaving(true);
    setTimeout(() => {
      onEnterSite();
    }, 500);
  };

  const handleEnterPortal = () => {
    window.open("https://portaldesaludnutriser.club", "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#1A1A1A]"
      style={{
        opacity: leaving ? 0 : visible ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    >
      {/* Logo + título */}
      <div className="flex flex-col items-center mb-8 px-4">
        <img
          src={LOGO_URL}
          alt="Nutriser"
          className="w-20 h-20 object-contain mb-3"
        />
        <p className="text-[#C5A55A] text-xs tracking-[0.3em] uppercase font-light">
          Aesthetic & Nutrition
        </p>
        <h1 className="text-white text-xl font-light tracking-widest mt-2 text-center">
          Selecciona el apartado de tu interés
        </h1>
        <div className="w-12 h-px bg-[#C5A55A] mt-3" />
      </div>

      {/* Tarjetas */}
      <div className="flex flex-col sm:flex-row gap-4 px-5 w-full max-w-2xl">
        {/* Tarjeta 1: Página principal */}
        <button
          onClick={handleEnterSite}
          className="group relative flex-1 h-64 sm:h-80 rounded-2xl overflow-hidden border border-white/10 hover:border-[#C5A55A]/60 transition-all duration-300 hover:scale-[1.02] focus:outline-none"
        >
          {/* Imagen de fondo */}
          <img
            src={CLINIC_IMG}
            alt="Nutriser Clínica"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay degradado */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          {/* Contenido */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#C5A55A]/20 border border-[#C5A55A]/40 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#C5A55A]" />
              </div>
              <span className="text-[#C5A55A] text-xs tracking-widest uppercase font-medium">
                Clínica & Tienda
              </span>
            </div>
            <h2 className="text-white text-xl font-semibold leading-tight mb-2">
              Nutriser
              <br />
              <span className="text-[#C5A55A] italic font-light">Aesthetic & Nutrition</span>
            </h2>
            <p className="text-white/70 text-xs leading-relaxed mb-3">
              Servicios, tratamientos, eBook, tienda de productos y programas de nutrición.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: CalendarCheck, label: "Citas" },
                { icon: BookOpen, label: "eBook" },
                { icon: ShoppingBag, label: "Tienda" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5 text-white/80 text-xs"
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-3 w-full bg-[#C5A55A] text-black text-xs font-bold tracking-widest uppercase py-2 rounded-lg text-center group-hover:bg-[#d4b46a] transition-colors">
              Entrar →
            </div>
          </div>
        </button>

        {/* Tarjeta 2: Portal de Salud */}
        <button
          onClick={handleEnterPortal}
          className="group relative flex-1 h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#C5A55A]/30 hover:border-[#C5A55A] transition-all duration-300 hover:scale-[1.02] focus:outline-none"
        >
          {/* Imagen de fondo */}
          <img
            src={PORTAL_IMG}
            alt="Portal de Salud"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay degradado más oscuro para el portal */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
          {/* Brillo dorado en la esquina superior */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A55A]/10 rounded-full blur-2xl" />
          {/* Contenido */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative w-8 h-8 rounded-full bg-[#C5A55A]/20 border border-[#C5A55A]/60 flex items-center justify-center">
                <HeartPulse className="w-4 h-4 text-[#C5A55A]" />
                {/* Pulso animado */}
                <span className="absolute inset-0 rounded-full border border-[#C5A55A]/40 animate-ping" />
              </div>
              <span className="text-[#C5A55A] text-xs tracking-widest uppercase font-medium">
                Pacientes activos
              </span>
            </div>
            <h2 className="text-white text-xl font-semibold leading-tight mb-2">
              Portal de Salud
              <br />
              <span className="text-[#C5A55A] italic font-light">Nutriser</span>
            </h2>
            <p className="text-white/70 text-xs leading-relaxed mb-3">
              Tu espacio personal: seguimiento de progreso, dietas, historial de consultas y citas.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Activity, label: "Progreso" },
                { icon: Stethoscope, label: "Historial" },
                { icon: CalendarCheck, label: "Citas" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1 bg-[#C5A55A]/15 rounded-full px-2 py-0.5 text-[#C5A55A] text-xs border border-[#C5A55A]/20"
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-3 w-full bg-[#C5A55A] text-black text-xs font-bold tracking-widest uppercase py-2 rounded-lg text-center group-hover:bg-[#d4b46a] transition-colors">
              Acceder →
            </div>
          </div>
        </button>
      </div>

      {/* Nota al pie */}
      <p className="text-white/30 text-xs mt-6 text-center px-4">
        El Portal de Salud es exclusivo para pacientes activos de Nutriser
      </p>
    </div>
  );
}
