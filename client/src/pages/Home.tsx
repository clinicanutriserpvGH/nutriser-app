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
import { useEffect } from "react";

export default function Home() {
  const { showSplash } = useSplash();

  // Scroll automático si viene desde el botón Cuponera del Hub
  useEffect(() => {
    const scrollTo = sessionStorage.getItem("nutriser_scroll_to");
    if (scrollTo) {
      sessionStorage.removeItem("nutriser_scroll_to");
      const timer = setTimeout(() => {
        const el = document.getElementById(scrollTo);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

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
