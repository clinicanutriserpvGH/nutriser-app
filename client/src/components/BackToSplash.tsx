/**
 * BackToSplash — botón flotante "Inicio" que regresa al splash selector.
 * Se usa en todas las páginas internas (Tienda, eBook, Academy, Memberships, etc.)
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
import { Home } from "lucide-react";
import { useSplash } from "@/contexts/SplashContext";

export default function BackToSplash() {
  const { showSplash } = useSplash();

  const handleBack = () => {
    // Limpiar sessionStorage para que el splash vuelva a mostrarse
    sessionStorage.removeItem("nutriser_splash_seen");
    // Llamar al contexto — App.tsx maneja la navegación y muestra el splash
    // sin recargar la página ni pasar por Home
    showSplash();
  };

  return (
    <button
      onClick={handleBack}
      className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-[#C5A55A]/40 text-[#C5A55A] px-3 py-2 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#C5A55A] hover:text-black transition-all duration-300 shadow-lg"
      aria-label="Volver al inicio"
    >
      <Home className="w-3.5 h-3.5" />
      Inicio
    </button>
  );
}
