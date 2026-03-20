/*
 * Nutriser - Home Page
 * Design: "Lujo Orgánico" — Neo-Art Deco con Calidez Natural
 * Sections: Hero → Treatments → CTA → About → Contact → Footer
 * Color: Gold (#C5A55A), Cream (#FAF7F2), Warm Black (#1A1A1A)
 * Fonts: Playfair Display (serif titles), Lato (sans body)
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TreatmentsSection from "@/components/TreatmentsSection";
import CtaBanner from "@/components/CtaBanner";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <HeroSection />
        <TreatmentsSection />
        <CtaBanner />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
