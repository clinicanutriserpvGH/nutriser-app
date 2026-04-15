/**
 * BackToSplash — botones flotantes de navegación
 *
 * LÓGICA DE DISPOSITIVOS:
 * ─ Móvil/Tableta (PWA): Muestra botones Inicio (→ Splash 0) y Regresar (→ Splash 1)
 * ─ Desktop (computadora): Muestra botón Regresar que lleva al sitio web (/) o a una ruta personalizada
 *   Los splashes son exclusivos de la app móvil, desktop NO debe ir a splashes.
 *
 * Props:
 * - hideHome: si true, solo muestra "← Regresar" (sin botón Inicio) en móvil
 * - desktopBackTo: ruta a la que navega el botón Regresar en desktop (default: "/" = sitio web)
 * - desktopBackLabel: texto del botón Regresar en desktop (default: "Regresar")
 * - mobileBackTo: ruta de destino del botón Regresar en móvil (si se define, navega ahí en vez de Splash 1)
 */
import { Home, ChevronLeft, ShoppingBag } from "lucide-react";
import { useSplash } from "@/contexts/SplashContext";
import { useDeviceType } from "@/hooks/useDeviceType";
import { useLocation } from "wouter";

interface BackToSplashProps {
  hideHome?: boolean;
  /** Ruta de destino del botón Regresar en desktop (default: "/" sitio web) */
  desktopBackTo?: string;
  /** Texto del botón Regresar en desktop */
  desktopBackLabel?: string;
  /** Ruta de destino del botón Regresar en móvil (si se define, navega ahí en vez de Splash 1) */
  mobileBackTo?: string;
}

export default function BackToSplash({
  hideHome = false,
  desktopBackTo = "/",
  desktopBackLabel = "Regresar",
  mobileBackTo,
}: BackToSplashProps) {
  const { showSplash, showSplash1 } = useSplash();
  const { isDesktop } = useDeviceType();
  const [, navigate] = useLocation();

  // ── Handlers para MÓVIL/TABLETA ──
  const handleGoHome = () => {
    sessionStorage.removeItem("nutriser_splash_seen");
    sessionStorage.removeItem("nutriser_chose_splash1");
    showSplash();
  };

  const handleGoBack = () => {
    if (mobileBackTo) {
      navigate(mobileBackTo);
    } else {
      showSplash1();
    }
  };

  // ── Handlers para DESKTOP ──
  const handleDesktopBack = () => {
    navigate(desktopBackTo);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DESKTOP: Solo un botón "Regresar" que lleva al sitio web (o ruta custom)
  // ═══════════════════════════════════════════════════════════════════════════
  if (isDesktop) {
    return (
      <div
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
        className="fixed left-3 z-[60] flex items-center gap-1.5"
      >
        <button
          onClick={handleDesktopBack}
          className="flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/15 text-white/80 px-2.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase hover:bg-white/20 hover:text-white transition-all duration-300 shadow-md"
          aria-label={desktopBackLabel}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {desktopBackLabel}
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MÓVIL/TABLETA: Botones Inicio (→ Splash 0) y Regresar (→ Splash 1)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
      className="fixed left-3 z-[60] flex items-center gap-1.5"
    >
      {/* Botón Inicio → Splash 0 (oculto si hideHome=true) */}
      {!hideHome && (
        <button
          onClick={handleGoHome}
          className="flex items-center gap-1 bg-[#C5A55A] border border-[#C5A55A] text-black px-2.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase hover:bg-[#B8944A] hover:border-[#B8944A] active:scale-95 transition-all duration-200 shadow-md shadow-[#C5A55A]/30"
          aria-label="Volver al inicio"
        >
          <Home className="w-3 h-3" />
          Inicio
        </button>
      )}

      {/* Botón Regresar → Splash 1 (o mobileBackTo si se define) */}
      <button
        onClick={handleGoBack}
        className="flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/15 text-white/80 px-2.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide uppercase hover:bg-white/20 hover:text-white transition-all duration-300 shadow-md"
        aria-label="Regresar"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Regresar
      </button>
    </div>
  );
}
