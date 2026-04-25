import Navbar from "@/components/Navbar";
import PromotionsSection from "@/components/PromotionsSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useSplash } from "@/contexts/SplashContext";
import { useLocation } from "wouter";

export default function Cupones() {
  const { showSplash } = useSplash();
  const [, navigate] = useLocation();

  // Al regresar desde Cupones, volver a la Tienda (no al Splash)
  const handleRegresar = () => navigate("/memberships");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onShowSplash={showSplash} onRegresar={handleRegresar} hideNavLinks lightBg />
      <main>
        <PromotionsSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
