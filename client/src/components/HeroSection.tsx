/*
 * Nutriser - Hero Section
 * Design: Full-screen hero with real clinic reception photo
 * Gold accent lines, Playfair Display headline, fade-in animations
 */
import { motion } from "framer-motion";
import { ChevronDown, Gift } from "lucide-react";

const HERO_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/clinic-reception_c595cea6.jpeg";

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-start overflow-hidden"
    >
      {/* Background image - real clinic photo */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMG}
          alt="Recepción de Nutriser - Clínica de Estética en Puerto Vallarta"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />
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
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="/memberships"
              className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] text-[#C5A55A] px-8 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-[#C5A55A] hover:text-[#1A1A1A] hover:shadow-lg hover:shadow-[#C5A55A]/40 border-2 border-[#C5A55A]"
            >
              <Gift className="w-5 h-5" />
              Adquirir Programa
            </a>
            <a
              href="/appointment-form"
              className="inline-flex items-center justify-center bg-[#C5A55A] text-white px-8 py-4 text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#B8963E] hover:shadow-lg hover:shadow-[#C5A55A]/30"
            >
              Agenda tu Cita
            </a>
            <a
              href="https://wa.me/523221007799"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#C5A55A] text-white px-8 py-4 text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#B8963E] hover:shadow-lg hover:shadow-[#C5A55A]/30"
            >
              Agenda por WhatsApp
            </a>
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector("#promociones");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="relative inline-flex items-center justify-center gap-2 bg-[#1A1A1A] text-[#C5A55A] px-8 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-[#C5A55A] hover:text-[#1A1A1A] hover:shadow-lg hover:shadow-[#C5A55A]/40 border-2 border-[#C5A55A] overflow-hidden group"
              animate={{ boxShadow: ["0 0 0 0 rgba(197, 165, 90, 0.6)", "0 0 0 15px rgba(197, 165, 90, 0)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#C5A55A]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">Promociones Vigentes</span>
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
