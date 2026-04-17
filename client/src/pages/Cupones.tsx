import Navbar from "@/components/Navbar";
import PromotionsSection from "@/components/PromotionsSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useSplash } from "@/contexts/SplashContext";

export default function Cupones() {
  const { showSplash } = useSplash();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onShowSplash={showSplash} />
      <main>
        <PromotionsSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
