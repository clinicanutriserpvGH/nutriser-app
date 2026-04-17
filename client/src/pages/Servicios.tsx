import Navbar from "@/components/Navbar";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useSplash } from "@/contexts/SplashContext";

export default function Servicios() {
  const { showSplash } = useSplash();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onShowSplash={showSplash} />
      <main>
        <ServicesSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
