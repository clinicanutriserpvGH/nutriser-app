/*
 * Nutriser - Hero Section
 * Design: Full-screen hero with real clinic reception photo
 * Gold accent lines, Playfair Display headline, fade-in animations
 */
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Gift, BookOpen, Ruler, CalendarCheck, ShoppingBag, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/clinic-reception_c595cea6.jpeg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-1_5c6ba72c.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-2_d6662dc0.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-3_c9c66a2b.webp",
];

export default function HeroSection() {
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
            alt="Clínica Nutriser - Puerto Vallarta"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
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
      <div className="relative z-10 container py-32 lg:py-0">
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
            className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.1] mb-6"
          >
            Tu salud y belleza{" "}
            <span className="italic text-[#C5A55A]">personalizada</span> en un
            solo lugar
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
            className="text-white/70 text-lg lg:text-xl leading-relaxed mb-10 max-w-lg"
          >
            En Nutriser no vendemos terapias, vendemos soluciones. Nutrición,
            tratamientos faciales, corporales y medicina estética con la mejor
            tecnología y experiencia profesional.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-2 gap-4 max-w-2xl"
          >
            <a
              href="/ebook"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-white/20 hover:shadow-lg border border-white/30"
            >
              <BookOpen className="w-5 h-5" />
              Tienda eBook
            </a>
            <a
              href="/memberships"
              className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] text-[#C5A55A] px-6 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-[#C5A55A] hover:text-[#1A1A1A] hover:shadow-lg hover:shadow-[#C5A55A]/40 border-2 border-[#C5A55A]"
            >
              <Gift className="w-5 h-5" />
              Comprar Programa Nutrición
            </a>
            <a
              href="https://portaldesaludnutriser.club"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-white/20 hover:shadow-lg border border-white/30"
            >
              <Ruler className="w-5 h-5" />
              Portal de Salud Nutriser
            </a>
            <a
              href="/appointment-form"
              onClick={(e) => { e.preventDefault(); window.location.href = '/appointment-form'; }}
              className="inline-flex items-center justify-center gap-2 bg-[#C5A55A] text-white px-6 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-[#B8963E] hover:shadow-lg hover:shadow-[#C5A55A]/30"
            >
              <CalendarCheck className="w-5 h-5" />
              Agenda tu Cita
            </a>
            <a
              href="#servicios"
              onClick={(e) => { e.preventDefault(); const el = document.querySelector("#servicios"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-white/20 hover:shadow-lg border border-white/30"
            >
              <ShoppingBag className="w-5 h-5" />
              Ver Servicios
            </a>
            <a
              href="/tienda"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-white/20 hover:shadow-lg border border-white/30"
            >
              <ShoppingBag className="w-5 h-5" />
              Tienda de Productos
            </a>
            <a
              href="/cursos"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-white/20 hover:shadow-lg border border-white/30"
            >
              <GraduationCap className="w-5 h-5" />
              Cursos Nutriser
            </a>
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector("#promociones");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="relative col-span-2 inline-flex items-center justify-center gap-3 bg-[#1A1A1A] text-[#C5A55A] px-10 py-5 text-base tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-[#C5A55A] hover:text-[#1A1A1A] hover:shadow-lg hover:shadow-[#C5A55A]/40 border-2 border-[#C5A55A] overflow-hidden group"
              animate={{ boxShadow: ["0 0 0 0 rgba(197, 165, 90, 0.7)", "0 0 0 18px rgba(197, 165, 90, 0)"] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#C5A55A]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Luz parpadeante */}
              <motion.span
                className="relative w-3 h-3 rounded-full bg-[#C5A55A] flex-shrink-0"
                animate={{ opacity: [1, 0.1, 1], scale: [1, 0.7, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <Gift className="relative w-5 h-5 flex-shrink-0" />
              <span className="relative">Cuponera de Descuentos</span>
            </motion.button>
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
