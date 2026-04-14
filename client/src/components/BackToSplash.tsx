/**
 * BackToSplash — botones flotantes de navegación
 * hideHome: si true, solo muestra "← Regresar" (sin botón Inicio)
 * Inicio: regresa al Splash 0 (pantalla de entrada principal)
 * Regresar: regresa al Splash 1 (hub con Nutriser Shop / Academy / Mis Tratamientos)
 */
import { Home, ChevronLeft } from "lucide-react";
import { useSplash } from "@/contexts/SplashContext";

interface BackToSplashProps {
  hideHome?: boolean;
}

export default function BackToSplash({ hideHome = false }: BackToSplashProps) {
  const { showSplash, showSplash1 } = useSplash();

  const handleGoHome = () => {
    // Limpiar sessionStorage para que el splash vuelva a mostrarse desde el inicio
    sessionStorage.removeItem("nutriser_splash_seen");
    sessionStorage.removeItem("nutriser_chose_splash1");
    showSplash();
  };

  const handleGoBack = () => {
    // Volver al Splash 1 (hub de Nutriser Shop / Web / Academy)
    showSplash1();
  };

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
