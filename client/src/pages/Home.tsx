/*
 * Nutriser - Home Page
 * Design: "Lujo Orgánico" — Neo-Art Deco con Calidez Natural
 * Sections: Hero → Services (27 services) → CTA → About → Contact → Footer
 * Color: Gold (#C5A55A), Cream (#FAF7F2), Warm Black (#1A1A1A)
 * Fonts: Playfair Display (serif titles), Lato (sans body)
 * Uses real clinic photos and official logo
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PromotionsSection from "@/components/PromotionsSection";
import ServicesSection from "@/components/ServicesSection";
import CtaBanner from "@/components/CtaBanner";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useSplash } from "@/contexts/SplashContext";

export default function Home() {
  const { showSplash } = useSplash();

  // Si el splash guardó una ruta destino, redirigir inmediatamente sin renderizar el Home.
  // Esto evita el flash de la página Home al navegar desde el splash a rutas internas.
  const pendingRoute = sessionStorage.getItem("nutriser_pending_route");
  if (pendingRoute) {
    sessionStorage.removeItem("nutriser_pending_route");
    window.location.replace(pendingRoute);
    // Devolver pantalla negra mientras redirige
    return <div style={{ position: "fixed", inset: 0, background: "#0f0f0f", zIndex: 99999 }} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onShowSplash={showSplash} />
      <main>
        <HeroSection />
        <PromotionsSection />
        <ServicesSection />
        <CtaBanner />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
