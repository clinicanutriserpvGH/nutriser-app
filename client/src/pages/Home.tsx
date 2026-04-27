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
import CtaBanner from "@/components/CtaBanner";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useSplash } from "@/contexts/SplashContext";
import { useEffect, useState } from "react";
import ShopPromoSplash from "@/components/ShopPromoSplash";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { useDeviceType } from "@/hooks/useDeviceType";

export default function Home() {
  const { showSplash } = useSplash();
  const { isLoggedIn: patientIsLoggedIn } = usePatientAuth();
  const { isMobile } = useDeviceType();
  const [showShopPromoSplash, setShowShopPromoSplash] = useState(false);

  // Mostrar ShopPromoSplash automáticamente al cargar Home en móvil (si no fue cerrado en esta sesión)
  useEffect(() => {
    if (isMobile) {
      const dismissed = sessionStorage.getItem('nutriser_shop_promo_dismissed');
      if (!dismissed) {
        setShowShopPromoSplash(true);
      }
    }
  }, [isMobile]);

  // Scroll automático si viene desde el botón Cuponera/Servicios del Hub
  useEffect(() => {
    const scrollTo = sessionStorage.getItem("nutriser_scroll_to");
    if (scrollTo) {
      sessionStorage.removeItem("nutriser_scroll_to");
      // Intentar scroll con reintentos para asegurar que la sección esté cargada
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById(scrollTo);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (attempts < 5) {
          attempts++;
          setTimeout(tryScroll, 400);
        }
      };
      const timer = setTimeout(tryScroll, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ShopPromoSplash - Aparadores del inicio */}
      {showShopPromoSplash && (
        <ShopPromoSplash
          isAuthenticated={patientIsLoggedIn}
          onClose={() => {
            sessionStorage.setItem('nutriser_shop_promo_dismissed', '1');
            setShowShopPromoSplash(false);
          }}
          onGoToShop={() => {
            sessionStorage.setItem('nutriser_shop_promo_dismissed', '1');
            setShowShopPromoSplash(false);
            window.location.href = '/memberships';
          }}
        />
      )}
      <Navbar onShowSplash={showSplash} isHome />
      <main>
        <HeroSection />
        <CtaBanner />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
