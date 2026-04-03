/*
 * NutriserHomePage — Página intermedia de Nutriser Home
 * Muestra: Paquetes, Tienda Productos, Tienda eBook, Nutriser Academy + Página Web
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

/* ─── Tarjeta grande ─────────────────────────────────────────────────────── */
function CardLarge({
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

/* ─── Tarjeta cuadrada ───────────────────────────────────────────────────── */
function CardSquare({
  img,
  icon: Icon,
  title,
  cta,
  onClick,
  accent = false,
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
      <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />
      <div className="relative h-full flex flex-col justify-between p-3 sm:p-4">
        <div className="flex justify-end">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
              accent ? "bg-[#C5A55A]" : "bg-white/20 backdrop-blur-sm"
            }`}
          >
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${accent ? "text-black" : "text-white"}`} />
          </div>
        </div>
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
            {/* Botón volver */}
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

          {/* ── Tarjeta grande: Paquetes Nutriser ── */}
          <div className="mb-3 md:mb-4">
            <CardLarge
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

          {/* ── Grid 2 columnas: Tienda + eBook ── */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
            <CardSquare
              img={IMG_TIENDA}
              icon={ShoppingBag}
              title="Tienda Productos"
              cta="Ver Tienda"
              onClick={() => goTo("/tienda")}
            />
            <CardSquare
              img={IMG_EBOOK}
              icon={BookOpen}
              title="Tienda eBook"
              cta="Ver eBooks"
              onClick={() => goTo("/ebook")}
            />
          </div>

          {/* ── Tarjeta grande: Nutriser Academy ── */}
          <div className="mb-3 md:mb-4">
            <CardLarge
              img={IMG_ACADEMY}
              icon={GraduationCap}
              label="Educación"
              title="Nutriser Academy"
              cta="Ver Cursos"
              onClick={() => goTo("/cursos")}
              imgPosition="center 30%"
            />
          </div>

          {/* ── Botón Página Web ── */}
          <div className="mb-6">
            <button
              onClick={() => {
                // Marcar splash como visto para ir directo al Home (con cupones, servicios, etc.)
                sessionStorage.setItem("nutriser_splash_seen", "1");
                window.location.href = "/";
              }}
              className="group relative w-full rounded-2xl overflow-hidden flex items-center gap-4 p-4 border border-white/10 hover:border-[#C5A55A]/50 bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
              {/* Imagen de fondo con overlay */}
              <img
                src={CLINIC_IMG}
                alt="Página Web Nutriser"
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ objectPosition: "center 30%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

              {/* Contenido */}
              <div className="relative w-12 h-12 rounded-xl bg-[#C5A55A]/20 border border-[#C5A55A]/30 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C5A55A]/30 transition-colors">
                <Globe className="w-6 h-6 text-[#C5A55A]" />
              </div>
              <div className="relative flex-1 text-left">
                <p className="text-white font-bold text-sm sm:text-base">Página Web Nutriser</p>
                <p className="text-white/50 text-xs mt-0.5">nutriserpv.com — Sitio oficial</p>
              </div>
              <div className="relative flex-shrink-0">
                <span className="text-[#C5A55A] text-xs font-bold">Visitar ›</span>
              </div>
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
