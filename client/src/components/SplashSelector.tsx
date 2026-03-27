import { useEffect, useState } from "react";
import { Activity, BookOpen, CalendarCheck, GraduationCap, HeartPulse, ShoppingBag, Stethoscope } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

const CLINIC_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-1_5c6ba72c.jpg";

const PORTAL_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-3_c9c66a2b.webp";

const CLINIC_IMG2 =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-2_d6662dc0.jpg";

interface SplashSelectorProps {
  onEnterSite: () => void;
}

export default function SplashSelector({ onEnterSite }: SplashSelectorProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

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

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0f0f0f] overflow-y-auto py-8 px-4"
      style={{
        opacity: leaving ? 0 : visible ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    >
      {/* Logo + título */}
      <div className="flex flex-col items-center mb-6">
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
          className="group relative flex-1 h-52 sm:h-64 rounded-2xl overflow-hidden border border-white/10 hover:border-[#C5A55A]/60 transition-all duration-300 hover:scale-[1.02] focus:outline-none"
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
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[{ icon: CalendarCheck, label: "Citas" }].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5 text-white/80 text-xs">
                  <Icon className="w-3 h-3" />{label}
                </span>
              ))}
            </div>
            <div className="w-full bg-[#C5A55A] text-black text-xs font-bold tracking-widest uppercase py-2 rounded-lg text-center group-hover:bg-[#d4b46a] transition-colors">
              Entrar →
            </div>
          </div>
        </button>

        {/* Tarjeta: Portal de Salud */}
        <button
          onClick={handleEnterPortal}
          className="group relative flex-1 h-52 sm:h-64 rounded-2xl overflow-hidden border border-[#C5A55A]/30 hover:border-[#C5A55A] transition-all duration-300 hover:scale-[1.02] focus:outline-none"
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
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
        {/* Tienda de Productos */}
        <button
          onClick={() => handleNavigate("/tienda")}
          className="group relative flex-1 h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 hover:border-[#C5A55A]/60 transition-all duration-300 hover:scale-[1.02] focus:outline-none"
        >
          <img src={CLINIC_IMG2} alt="Tienda" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-left">
            <div className="w-7 h-7 rounded-full bg-[#C5A55A]/20 border border-[#C5A55A]/40 flex items-center justify-center mb-1">
              <ShoppingBag className="w-3.5 h-3.5 text-[#C5A55A]" />
            </div>
            <h3 className="text-white text-sm font-semibold mb-0.5">Tienda de Productos</h3>
            <p className="text-white/55 text-xs mb-2">Productos de nutrición y estética.</p>
            <div className="w-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-widest uppercase py-1.5 rounded-lg text-center group-hover:bg-[#C5A55A] group-hover:text-black group-hover:border-[#C5A55A] transition-colors">
              Ver tienda →
            </div>
          </div>
        </button>

        {/* Tienda eBook */}
        <button
          onClick={() => handleNavigate("/ebook")}
          className="group relative flex-1 h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 hover:border-[#C5A55A]/60 transition-all duration-300 hover:scale-[1.02] focus:outline-none"
        >
          <img src={PORTAL_IMG} alt="eBook" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-left">
            <div className="w-7 h-7 rounded-full bg-[#C5A55A]/20 border border-[#C5A55A]/40 flex items-center justify-center mb-1">
              <BookOpen className="w-3.5 h-3.5 text-[#C5A55A]" />
            </div>
            <h3 className="text-white text-sm font-semibold mb-0.5">Tienda eBook</h3>
            <p className="text-white/55 text-xs mb-2">Guías y recetarios digitales.</p>
            <div className="w-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-widest uppercase py-1.5 rounded-lg text-center group-hover:bg-[#C5A55A] group-hover:text-black group-hover:border-[#C5A55A] transition-colors">
              Ver eBooks →
            </div>
          </div>
        </button>

        {/* Nutriser Academy */}
        <button
          onClick={() => handleNavigate("/cursos")}
          className="group relative flex-1 h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 hover:border-[#C5A55A]/60 transition-all duration-300 hover:scale-[1.02] focus:outline-none"
        >
          <img src={CLINIC_IMG} alt="Academy" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-left">
            <div className="w-7 h-7 rounded-full bg-[#C5A55A]/20 border border-[#C5A55A]/40 flex items-center justify-center mb-1">
              <GraduationCap className="w-3.5 h-3.5 text-[#C5A55A]" />
            </div>
            <h3 className="text-white text-sm font-semibold mb-0.5">Nutriser Academy</h3>
            <p className="text-white/55 text-xs mb-2">Cursos y formación especializada.</p>
            <div className="w-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-widest uppercase py-1.5 rounded-lg text-center group-hover:bg-[#C5A55A] group-hover:text-black group-hover:border-[#C5A55A] transition-colors">
              Ver cursos →
            </div>
          </div>
        </button>
      </div>

      {/* Nota al pie */}
      <p className="text-white/30 text-xs mt-5 text-center px-4">
        El Portal de Salud es exclusivo para pacientes activos de Nutriser
      </p>
    </div>
  );
}
