/*
 * NutriserHomePage — Página intermedia de Nutriser Home
 * Todas las tarjetas del mismo tamaño grande.
 * Última fila: Nutriser Academy + Página Web en 2 columnas iguales.
 */
import { useLocation } from "wouter";
import {
  BookOpen, CalendarCheck, GraduationCap, Globe, ShoppingBag, ChevronLeft,
} from "lucide-react";

/* ─── Assets ────────────────────────────────────────────────────────────── */
const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const CLINIC_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-reception-new_959bc342.png";
const IMG_NUTRICION =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-kit-nutricional_9ec4a70f.png";
const IMG_TIENDA =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-tienda-productos_71816223.png";
const IMG_EBOOK =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-ebook-tablet_dccb4840.png";
const IMG_ACADEMY =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-academy_52156a0e.png";

/* ─── Tarjeta grande (ancho completo) ───────────────────────────────────── */
function CardFull({
  img,
  icon: Icon,
  label,
  title,
  cta,
  onClick,
  accent = false,
  imgPosition = "center",
}: {
  img: string;
  icon: React.ElementType;
  label: string;
  title: string;
  cta: string;
  onClick: () => void;
  accent?: boolean;
  imgPosition?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-3xl overflow-hidden focus:outline-none"
      style={{ aspectRatio: "16 / 7" }}
    >
      <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ objectPosition: imgPosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/20" />
      <div className="relative h-full flex flex-col justify-between p-5 sm:p-6 text-left">
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
              accent ? "bg-[#C5A55A]" : "bg-white/20 backdrop-blur-sm"
            }`}
          >
            <Icon className={`w-5 h-5 ${accent ? "text-black" : "text-white"}`} />
          </div>
          <span className="text-white/80 text-xs font-semibold tracking-wide uppercase drop-shadow">
            {label}
          </span>
        </div>
        <div>
          <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-3 drop-shadow-lg">
            {title}
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide uppercase shadow-lg transition-all duration-200 group-hover:scale-105 ${
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

/* ─── Tarjeta media (mitad de ancho) ────────────────────────────────────── */
function CardHalf({
  img,
  icon: Icon,
  label,
  title,
  cta,
  onClick,
  accent = false,
  imgPosition = "center",
}: {
  img: string;
  icon: React.ElementType;
  label: string;
  title: string;
  cta: string;
  onClick: () => void;
  accent?: boolean;
  imgPosition?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-2xl overflow-hidden focus:outline-none"
      style={{ aspectRatio: "4 / 5" }}
    >
      <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ objectPosition: imgPosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />
      <div className="relative h-full flex flex-col justify-between p-3 sm:p-4 text-left">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
              accent ? "bg-[#C5A55A]" : "bg-white/20 backdrop-blur-sm"
            }`}
          >
            <Icon className={`w-4 h-4 ${accent ? "text-black" : "text-white"}`} />
          </div>
          <span className="text-white/70 text-[10px] font-semibold tracking-wide uppercase drop-shadow">
            {label}
          </span>
        </div>
        <div>
          <h3 className="text-white text-base sm:text-lg font-bold leading-tight mb-2 drop-shadow-lg">
            {title}
          </h3>
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase shadow transition-all duration-200 group-hover:scale-105 ${
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
export default function NutriserHomePage() {
  const [, navigate] = useLocation();

  const goTo = (path: string) => {
    window.location.href = path;
  };

  const goBack = () => {
    sessionStorage.removeItem("nutriser_splash_seen");
    window.location.href = "/";
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto"
      style={{
        background: "linear-gradient(160deg, #0f0f0f 0%, #1a1208 50%, #0f0f0f 100%)",
        paddingTop: "max(env(safe-area-inset-top, 0px), 0px)",
      }}
    >
      <div className="w-full flex flex-col items-center py-8 px-3 sm:px-4 md:px-6 box-border">
        <div className="w-full max-w-[480px] md:max-w-[700px] lg:max-w-[960px]">

          {/* ── Header ── */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-full flex items-center mb-4">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-white/50 hover:text-[#C5A55A] transition-colors text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Inicio
              </button>
            </div>

            <div className="relative mb-3">
              <div className="absolute inset-0 rounded-full bg-[#C5A55A]/20 blur-xl scale-150" />
              <img src={LOGO_URL} alt="Nutriser" className="relative w-14 h-14 md:w-16 md:h-16 object-contain" />
            </div>
            <p className="text-[#C5A55A] text-[10px] md:text-xs tracking-[0.3em] uppercase font-light mb-1">
              Aesthetic &amp; Nutrition
            </p>
            <h1 className="text-white text-lg md:text-xl font-bold tracking-wide text-center">
              Nutriser Home
            </h1>
            <div className="w-8 h-px bg-[#C5A55A]/60 mt-3" />
          </div>

          {/* ── Tarjeta 1: Paquetes Nutriser (ancho completo) ── */}
          <div className="mb-3 md:mb-4">
            <CardFull
              img={IMG_NUTRICION}
              icon={CalendarCheck}
              label="Nutrición"
              title="Paquetes Nutriser"
              cta="Ver Paquetes"
              onClick={() => goTo("/memberships")}
              accent
              imgPosition="center 40%"
            />
          </div>

          {/* ── Tarjeta 2: Tienda Productos (ancho completo) ── */}
          <div className="mb-3 md:mb-4">
            <CardFull
              img={IMG_TIENDA}
              icon={ShoppingBag}
              label="Tienda"
              title="Tienda Productos"
              cta="Ver Tienda"
              onClick={() => goTo("/tienda")}
              imgPosition="center 50%"
            />
          </div>

          {/* ── Tarjeta 3: Tienda eBook (ancho completo) ── */}
          <div className="mb-3 md:mb-4">
            <CardFull
              img={IMG_EBOOK}
              icon={BookOpen}
              label="eBooks"
              title="Tienda eBook"
              cta="Ver eBooks"
              onClick={() => goTo("/ebook")}
              imgPosition="center 30%"
            />
          </div>

          {/* ── Fila final: Nutriser Academy + Página Web (2 columnas) ── */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
            <CardHalf
              img={IMG_ACADEMY}
              icon={GraduationCap}
              label="Educación"
              title="Nutriser Academy"
              cta="Ver Cursos"
              onClick={() => goTo("/cursos")}
              imgPosition="center 30%"
            />
            <CardHalf
              img={CLINIC_IMG}
              icon={Globe}
              label="Sitio web"
              title="Página Web"
              cta="Visitar"
              onClick={() => {
                sessionStorage.setItem("nutriser_splash_seen", "1");
                window.location.href = "/";
              }}
              imgPosition="55% center"
            />
          </div>

          {/* ── Botón Administración ── */}
          <div className="flex justify-center mb-5">
            <button
              onClick={() => { window.location.href = '/admin/login'; }}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C5A55A]/30 text-white/40 hover:text-white/70 px-5 py-2 rounded-full text-xs font-medium transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Administración
            </button>
          </div>

          {/* ── Footer ── */}
          <p className="text-white/20 text-[10px] text-center pb-4">
            © 2025 Nutriser Aesthetic &amp; Nutrition · Todos los derechos reservados · nutriserpv.com
          </p>

        </div>
      </div>
    </div>
  );
}
