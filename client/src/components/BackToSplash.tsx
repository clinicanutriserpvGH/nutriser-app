/**
 * BackToSplash — botones flotantes "Inicio" y "← Regresar"
 * Inicio: regresa al splash principal (selector principal)
 * Regresar: regresa a /nutriser-home (página intermedia de secciones)
 *
 * SOLUCIÓN AL FLASH DEL HOME:
 * En lugar de navegar a "/" (que carga Home antes del splash),
 * usamos el SplashContext que está disponible en toda la app.
 * El contexto llama handleShowSplash() en App.tsx, que:
 *   1. Borra sessionStorage
 *   2. Hace pushState a "/"
 *   3. Setea showSplash=true → el overlay aparece INMEDIATAMENTE
 * Resultado: el splash aparece sin ningún flash del Home.
 */
import { Home, ChevronLeft } from "lucide-react";
import { useSplash } from "@/contexts/SplashContext";

export default function BackToSplash() {
  const { showSplash } = useSplash();

  const handleGoHome = () => {
    // Limpiar sessionStorage para que el splash vuelva a mostrarse
    sessionStorage.removeItem("nutriser_splash_seen");
    // Llamar al contexto — App.tsx maneja la navegación y muestra el splash
    // sin recargar la página ni pasar por Home
    showSplash();
  };

  const handleGoBack = () => {
    // Navegar a la página intermedia Nutriser Home
    window.location.href = "/nutriser-home";
  };

  return (
    <div
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      className="fixed left-4 z-50 flex items-center gap-2"
    >
      {/* Botón Inicio → splash principal */}
      <button
        onClick={handleGoHome}
        className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm border border-[#C5A55A]/40 text-[#C5A55A] px-3 py-2 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#C5A55A] hover:text-black transition-all duration-300 shadow-lg"
        aria-label="Volver al inicio"
      >
        <Home className="w-3.5 h-3.5" />
        Inicio
      </button>

      {/* Botón Regresar → /nutriser-home */}
      <button
        onClick={handleGoBack}
        className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm border border-white/20 text-white/70 px-3 py-2 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-white/20 hover:text-white transition-all duration-300 shadow-lg"
        aria-label="Regresar a Nutriser Home"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Regresar
      </button>
    </div>
  );
}
