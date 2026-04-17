import Navbar from "@/components/Navbar";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useSplash } from "@/contexts/SplashContext";

export default function Transformaciones() {
  const { showSplash } = useSplash();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onShowSplash={showSplash} />
      <main>
        <BeforeAfterSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
