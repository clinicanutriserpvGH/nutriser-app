/*
 * Nutriser - Hero Section
 * Design: Full-screen hero with real clinic reception photo
 * Portal de Salud as the primary featured element
 */
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";


const HERO_IMAGES = [
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-recepcion-hero_de9ce8ee.png",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-sala-espera-v2_7daaa376.png",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-2_d6662dc0.jpg",
];

export default function HeroSection() {
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Navegación directa sin guard — el login se pide solo al intentar comprar/agregar al carrito
  const handleTienda = () => { window.location.href = "/memberships"; };
  const handleAcademia = () => { window.location.href = "/cursos"; };

  // Visibilidad de Academia (controlada por el admin)
  const { data: academiaConfig } = trpc.siteVisibility.getAcademiaVisible.useQuery();
  const academiaVisible = academiaConfig?.visible ?? false;

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-start overflow-hidden"
    >
      {/* Background image carousel */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.img
            key={currentImg}
            src={HERO_IMAGES[currentImg]}
            alt="Clínica Nutriser"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/35" />
      </div>

      {/* Carousel dots */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImg(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentImg ? "bg-[#C5A55A] w-6" : "bg-white/40"
            }`}
            aria-label={`Imagen ${i + 1}`}
          />
        ))}
      </div>

      {/* Decorative gold line */}
      <div className="absolute left-8 top-1/4 bottom-1/4 w-[1px] bg-gradient-to-b from-transparent via-[#C5A55A]/50 to-transparent hidden lg:block" />

      {/* Content */}
      <div className="relative z-10 container py-28 lg:py-0" style={{ paddingTop: 'max(8rem, calc(6rem + env(safe-area-inset-top, 0px)))' }}>
        <div className="max-w-2xl lg:ml-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block text-[#C5A55A] text-sm tracking-[0.3em] uppercase mb-6">
              Aesthetic & Nutrition
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.1] mb-4"
          >
            Clínica de Nutrición y Estética en{" "}
            <span className="text-[#C5A55A]">Puerto Vallarta</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-16 h-[1px] bg-[#C5A55A] mb-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-white/70 text-lg lg:text-xl leading-relaxed mb-2 max-w-lg italic"
          >
            Tu salud y belleza personalizada en un solo lugar
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="text-white/70 text-lg lg:text-xl leading-relaxed mb-8 max-w-lg"
          >
            En Nutriser no vendemos terapias, vendemos soluciones. Nutrición,
            tratamientos faciales, corporales y medicina estética con la mejor
            tecnología y experiencia profesional.
          </motion.p>

          {/* ─── Botones (WhatsApp + Academia Nutriser) ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="flex flex-col gap-3 max-w-2xl"
          >
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/523221007799"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3.5 text-sm tracking-[0.12em] uppercase font-bold transition-all duration-300 hover:bg-[#20BA5A] hover:shadow-lg hover:shadow-[#25D366]/40 border-2 border-[#25D366] overflow-hidden group rounded-lg"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#25D366]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <MessageCircle className="relative w-4 h-4 flex-shrink-0" />
              <span className="relative">WhatsApp</span>
            </a>
            {/* 3. Academia Nutriser — solo visible cuando el admin la activa */}
            {academiaVisible && (
              <a
                href="/cursos"
                onClick={handleAcademia}
                className="relative inline-flex items-center justify-center gap-3 bg-[#1A1A1A]/80 text-[#C5A55A] px-5 py-3.5 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-[#C5A55A] hover:text-[#1A1A1A] hover:shadow-lg hover:shadow-[#C5A55A]/40 border-2 border-[#C5A55A] overflow-hidden group rounded-lg"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#C5A55A]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <BookOpen className="relative w-5 h-5 flex-shrink-0" />
                <span className="relative">Academia Nutriser</span>
              </a>
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-xs tracking-[0.2em] uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="w-5 h-5 text-[#C5A55A]/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
