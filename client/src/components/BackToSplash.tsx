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
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
        className="fixed left-4 z-50 flex items-center gap-2"
      >
        <button
          onClick={handleDesktopBack}
          className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm border border-white/20 text-white/80 px-3 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase hover:bg-white/20 hover:text-white transition-all duration-300 shadow-lg"
          aria-label={desktopBackLabel}
        >
          <ChevronLeft className="w-4 h-4" />
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
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      className="fixed left-4 z-50 flex items-center gap-2"
    >
      {/* Botón Inicio → Splash 0 (oculto si hideHome=true) */}
      {!hideHome && (
        <button
          onClick={handleGoHome}
          className="flex items-center gap-2 bg-[#C5A55A] border-2 border-[#C5A55A] text-black px-4 py-2.5 rounded-full text-sm font-extrabold tracking-widest uppercase hover:bg-[#B8944A] hover:border-[#B8944A] active:scale-95 transition-all duration-200 shadow-xl shadow-[#C5A55A]/40"
          aria-label="Volver al inicio"
        >
          <Home className="w-4 h-4" />
          INICIO
        </button>
      )}

      {/* Botón Regresar → Splash 1 */}
      <button
        onClick={handleGoBack}
        className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm border border-white/20 text-white/80 px-3 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase hover:bg-white/20 hover:text-white transition-all duration-300 shadow-lg"
        aria-label="Regresar"
      >
        <ChevronLeft className="w-4 h-4" />
        Regresar
      </button>
    </div>
  );
}
