import Navbar from "@/components/Navbar";
import PromotionsSection from "@/components/PromotionsSection";
import { useSplash } from "@/contexts/SplashContext";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function Cupones() {
  const { showSplash } = useSplash();
  const [, navigate] = useLocation();

  // Al regresar desde Cupones, volver a la Tienda (no al Splash)
  const handleRegresar = () => navigate("/memberships");

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Navbar sin logo (para no exponer el acceso al admin) y sin links del sitio */}
      <Navbar
        onShowSplash={showSplash}
        hideNavLinks
        hideLogo
        lightBg
      />
      {/* Botón Regresar visible en desktop (el Navbar móvil ya tiene el botón Regresar) */}
      <div className="hidden lg:flex items-center pt-24 pb-2 px-6 max-w-7xl mx-auto w-full">
        <button
          onClick={handleRegresar}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#C5A55A] hover:text-[#B8963E] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Regresar a la Tienda
        </button>
      </div>
      <main className="flex-1">
        <PromotionsSection />
      </main>
    </div>
  );
}
