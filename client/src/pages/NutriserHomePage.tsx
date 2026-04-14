/*
 * NutriserHomePage — Splash 2 / Nutriser Shop
 * Soporta modo claro (crema) y oscuro (negro) con toggle palanca persistente
 */
import {
  BookOpen, CalendarCheck, GraduationCap, ShoppingBag, ChevronLeft,
} from "lucide-react";
import { useSplashTheme } from "@/contexts/SplashThemeContext";
import { useSplash } from "@/contexts/SplashContext";

/* ─── Assets ────────────────────────────────────────────────────────────── */
const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const IMG_NUTRICION =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-tratamientos-hub-LYqQYtUBc3Ef5CpkjsG9yP.webp";
const IMG_TIENDA =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-mall-store-nzYwk9Q398ZngFrhSkhokJ.webp";
const IMG_EBOOK =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-ebook-tablet_dccb4840.png";
const IMG_ACADEMY =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-academy-hub-v2-B6bpVdHqtSSKFqZdAvvqyS.webp";



/* ─── Tarjeta media (mitad de ancho) ────────────────────────────────────── */
function CardHalf({
  img, icon: Icon, label, title, cta, onClick, accent = false, imgPosition = "center center", isLight,
}: {
  img: string; icon: React.ElementType; label: string; title: string;
  cta: string; onClick: () => void; accent?: boolean; imgPosition?: string; isLight: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-2xl overflow-hidden focus:outline-none"
      style={{ aspectRatio: "4 / 5" }}
    >
      <img
        src={img} alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ objectPosition: imgPosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/75" />
      <div className="relative h-full flex flex-col justify-between p-3 sm:p-4 text-left">
        <div className="flex items-center gap-1.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${accent ? "bg-[#C5A55A]" : "bg-white/20 backdrop-blur-sm"}`}>
            <Icon className={`w-4 h-4 ${accent ? "text-black" : "text-white"}`} />
          </div>
          <span className="text-[10px] font-semibold tracking-wide uppercase drop-shadow text-white/90">{label}</span>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold leading-tight mb-2 drop-shadow-lg text-white">{title}</h3>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase shadow transition-all duration-200 group-hover:scale-105 ${
            accent
              ? "bg-[#C5A55A] text-black"
              : "bg-white/20 backdrop-blur-sm text-white border border-white/40"
          }`}>
            {cta}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function NutriserHomePage() {
  const { isLight } = useSplashTheme();
  const { showSplash1 } = useSplash();

  const goTo = (path: string) => { window.location.href = path; };
  const goBack = () => {
    // Inicio → Splash 0 (pantalla principal)
    sessionStorage.removeItem("nutriser_splash_seen");
    sessionStorage.removeItem("nutriser_chose_splash1");
    window.location.href = "/";
  };
  const goToSplash1 = () => {
    // Regresar → Splash 1 (hub con Sitio Web y Nutriser Shop)
    sessionStorage.setItem("nutriser_go_to_splash1", "1");
    window.location.href = "/";
  };

  // Colores dinámicos
  const bg = isLight
    ? "linear-gradient(160deg, #FAF7F2 0%, #F5EFE4 50%, #FAF7F2 100%)"
    : "linear-gradient(160deg, #0f0f0f 0%, #1a1208 50%, #0f0f0f 100%)";

  const backBtn = isLight
    ? "bg-[#2a1f0a]/80 hover:bg-[#2a1f0a] text-[#C5A55A] hover:text-[#d4b46a] border border-[#C5A55A]/40"
    : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-[#C5A55A] border border-white/10";

  const cardBgSubtle = isLight
    ? "bg-[#2a1f0a]/80 border-[#C5A55A]/40 hover:border-[#C5A55A]/80 hover:bg-[#2a1f0a]"
    : "bg-white/5 border-white/10 hover:border-[#C5A55A]/50 hover:bg-white/10";

  const footerBtn = isLight
    ? "bg-[#2a1f0a]/70 hover:bg-[#2a1f0a]/90 border-[#C5A55A]/30 hover:border-[#C5A55A]/60 text-[#C5A55A]/80 hover:text-[#C5A55A]"
    : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-[#C5A55A]/30 text-white/40 hover:text-white/70";

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto transition-all duration-500"
      style={{ background: bg }}
    >
      <div className="w-full flex flex-col items-center px-3 sm:px-4 md:px-8 lg:px-12 xl:px-16 box-border" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 16px, 32px)', paddingBottom: '24px' }}>
        <div className="w-full max-w-[480px] sm:max-w-[600px] md:max-w-[780px] lg:max-w-[1100px] xl:max-w-[1300px] 2xl:max-w-[1500px]">

          {/* ── Header horizontal compacto ── */}
          <div className={`flex items-center gap-2 mb-4 px-3 py-2.5 rounded-2xl transition-all duration-500 ${
            isLight ? "bg-[#2a1f0a]/90 shadow-lg shadow-[#C5A55A]/10" : "bg-transparent"
          }`} style={{ paddingTop: isLight ? undefined : 'env(safe-area-inset-top, 12px)' }}>
            {/* Botón Inicio → Splash 0 */}
            <button
              onClick={goBack}
              className={`flex items-center gap-1 transition-all text-xs font-medium px-2.5 py-1.5 rounded-full flex-shrink-0 ${backBtn}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Inicio
            </button>
            {/* Botón Regresar → Splash 1 */}
            <button
              onClick={goToSplash1}
              className={`flex items-center gap-1 transition-all text-xs font-medium px-2.5 py-1.5 rounded-full flex-shrink-0 ${backBtn}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Regresar
            </button>
            {/* Separador */}
            <div className="w-px h-8 bg-[#C5A55A]/20 flex-shrink-0" />
            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-[#C5A55A]/20 blur-lg scale-150" />
              <img src={LOGO_URL} alt="Nutriser" className="relative w-10 h-10 md:w-12 md:h-12 object-contain" />
            </div>
            {/* Separador */}
            <div className="w-px h-8 bg-[#C5A55A]/30 flex-shrink-0" />
            {/* Textos */}
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <p className="text-[#C5A55A] text-[8px] md:text-[9px] tracking-[0.2em] uppercase font-light leading-tight">
                Aesthetic &amp; Nutrition
              </p>
              <h1 className="text-white text-xs md:text-sm font-bold tracking-wide leading-tight mt-0.5">
                Nutriser Shop
              </h1>
            </div>
          </div>

          {/* ── 4 tarjetas en grid: 2 columnas en móvil, 4 columnas en desktop ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6">
            <CardHalf
              img={IMG_NUTRICION}
              icon={CalendarCheck}
              label="Tienda"
              title="Nutriser Tratamientos"
              cta="Ver Paquetes"
              onClick={() => goTo("/memberships")}
              accent
              imgPosition="center 40%"
              isLight={isLight}
            />
            <CardHalf
              img={IMG_TIENDA}
              icon={ShoppingBag}
              label="Tienda"
              title="Nutriser Farmacy"
              cta="Ver Tienda"
              onClick={() => goTo("/tienda")}
              imgPosition="center 50%"
              isLight={isLight}
            />
            <CardHalf
              img={IMG_ACADEMY}
              icon={GraduationCap}
              label="Educación"
              title="Nutriser Academy"
              cta="Ver Cursos"
              onClick={() => goTo("/cursos")}
              imgPosition="center 30%"
              isLight={isLight}
            />
            <CardHalf
              img={IMG_EBOOK}
              icon={BookOpen}
              label="Tienda"
              title="Nutriser Library"
              cta="Ver eBooks"
              onClick={() => goTo("/ebook")}
              imgPosition="center 30%"
              isLight={isLight}
            />
          </div>

          {/* ── Botón Cuponera parpadeante ── */}
          <div className="flex justify-center mb-5">
            <button
              onClick={() => {
                // Navegar directo al sitio principal (sección cupones) sin pasar por splash
                sessionStorage.setItem("nutriser_go_to_site", "1");
                sessionStorage.setItem("nutriser_scroll_to", "promociones");
                window.location.href = '/';
              }}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border border-[#C5A55A] text-black bg-[#C5A55A] hover:bg-[#d4b46a] shadow-lg shadow-[#C5A55A]/40 active:scale-95"
              style={{ animation: 'cuponera-pulse 2s ease-in-out infinite' }}
            >
              🏷️ Cuponera de Descuentos
              {/* Punto de notificación */}
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white" style={{ animation: 'cuponera-dot 1s ease-in-out infinite' }} />
            </button>
          </div>
          <style>{`
            @keyframes cuponera-pulse {
              0%, 100% { box-shadow: 0 0 8px 2px rgba(197,165,90,0.5), 0 4px 12px rgba(197,165,90,0.3); transform: scale(1); }
              50% { box-shadow: 0 0 20px 6px rgba(197,165,90,0.8), 0 6px 20px rgba(197,165,90,0.5); transform: scale(1.03); }
            }
            @keyframes cuponera-dot {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.4; transform: scale(1.3); }
            }
          `}</style>

          {/* ── Footer ── */}
          <p className={`text-[10px] text-center pb-4 pt-2 ${isLight ? "text-[#9a8050]/40" : "text-white/20"}`}>
            © 2025 Nutriser Aesthetic &amp; Nutrition · nutriserpv.com
          </p>

        </div>
      </div>
    </div>
  );
}
