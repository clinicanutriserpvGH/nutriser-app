/*
 * Nutriser - Hero Section
 * Design: Full-screen hero with real clinic reception photo
 * Portal de Salud as the primary featured element
 */
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Gift, BookOpen, CalendarCheck, ShoppingBag, GraduationCap, Activity, Salad, ClipboardList, UserPlus, LineChart, HeartPulse } from "lucide-react";
import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/clinic-reception_c595cea6.jpeg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-1_5c6ba72c.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-2_d6662dc0.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hero-clinic-3_c9c66a2b.webp",
];

const PORTAL_FEATURES = [
  { icon: LineChart, label: "Seguimiento de progreso" },
  { icon: Salad, label: "Planes de dieta personalizados" },
  { icon: ClipboardList, label: "Historial de consultas" },
  { icon: Activity, label: "Métricas corporales" },
  { icon: HeartPulse, label: "Control de salud integral" },
  { icon: CalendarCheck, label: "Citas y recordatorios" },
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
      <div className="relative z-10 container py-28 lg:py-0">
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
            className="text-white/70 text-lg lg:text-xl leading-relaxed mb-8 max-w-lg"
          >
            En Nutriser no vendemos terapias, vendemos soluciones. Nutrición,
            tratamientos faciales, corporales y medicina estética con la mejor
            tecnología y experiencia profesional.
          </motion.p>

          {/* ─── PORTAL DE SALUD — Elemento Principal Destacado ─────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85 }}
            className="mb-6 rounded-2xl overflow-hidden border-2 border-[#C5A55A] shadow-[0_0_40px_rgba(197,165,90,0.35)]"
          >
            {/* Header del portal */}
            <div className="bg-gradient-to-r from-[#C5A55A] to-[#B8963E] px-5 py-3 flex items-center gap-3">
              <div className="flex items-center gap-2">
                {/* Ícono con pulso doble: anillo exterior + latido del ícono */}
                <div className="relative flex items-center justify-center">
                  <motion.span
                    className="absolute w-8 h-8 rounded-full bg-white/30"
                    animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.span
                    className="absolute w-6 h-6 rounded-full bg-white/20"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <HeartPulse className="w-5 h-5 text-white relative z-10" />
                  </motion.div>
                </div>
                <span className="text-white font-bold text-sm tracking-[0.15em] uppercase">
                  Portal de Salud Nutriser
                </span>
              </div>
              <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-semibold tracking-wide">
                Tu espacio personal
              </span>
            </div>

            {/* Cuerpo del portal */}
            <div className="bg-[#1A1A1A]/90 backdrop-blur-sm px-5 py-4">
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                Accede a tu historial completo, sigue tu progreso y consulta tus planes de dieta personalizados — todo en un solo lugar.
              </p>

              {/* Features grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {PORTAL_FEATURES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[#C5A55A] flex-shrink-0" />
                    <span className="text-white/70 text-xs">{label}</span>
                  </div>
                ))}
              </div>

              {/* CTAs del portal */}
              <div className="flex gap-3">
                <a
                  href="https://portaldesaludnutriser.club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#C5A55A] text-[#1A1A1A] px-4 py-3 text-xs tracking-[0.12em] uppercase font-bold transition-all duration-300 hover:bg-[#D4B46A] hover:shadow-lg hover:shadow-[#C5A55A]/40 rounded-lg"
                >
                  <Activity className="w-4 h-4" />
                  Iniciar sesión / Crear cuenta
                </a>
              </div>
            </div>
          </motion.div>

          {/* ─── Botones secundarios ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            className="grid grid-cols-2 gap-3 max-w-2xl"
          >
            <a
              href="/ebook"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-3.5 text-xs tracking-[0.12em] uppercase font-bold transition-all duration-300 hover:bg-white/20 hover:shadow-lg border border-white/25 rounded-lg"
            >
              <BookOpen className="w-4 h-4" />
              Tienda eBook
            </a>
            <a
              href="/memberships"
              className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A]/80 text-[#C5A55A] px-5 py-3.5 text-xs tracking-[0.12em] uppercase font-bold transition-all duration-300 hover:bg-[#C5A55A] hover:text-[#1A1A1A] hover:shadow-lg border border-[#C5A55A]/60 rounded-lg"
            >
              <Gift className="w-4 h-4" />
              <span className="flex flex-col items-center leading-tight">
                <span>Programa</span>
                <span>Nutrición</span>
              </span>
            </a>
            <a
              href="/appointment-form"
              onClick={(e) => { e.preventDefault(); window.location.href = '/appointment-form'; }}
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-3.5 text-xs tracking-[0.12em] uppercase font-bold transition-all duration-300 hover:bg-white/20 hover:shadow-lg border border-white/25 rounded-lg"
            >
              <CalendarCheck className="w-4 h-4" />
              Agenda tu Cita
            </a>
            <a
              href="#servicios"
              onClick={(e) => { e.preventDefault(); const el = document.querySelector("#servicios"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-3.5 text-xs tracking-[0.12em] uppercase font-bold transition-all duration-300 hover:bg-white/20 hover:shadow-lg border border-white/25 rounded-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              Ver Servicios
            </a>
            <a
              href="/tienda"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-3.5 text-xs tracking-[0.12em] uppercase font-bold transition-all duration-300 hover:bg-white/20 hover:shadow-lg border border-white/25 rounded-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              Tienda Productos
            </a>
            <a
              href="/cursos"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-3.5 text-xs tracking-[0.12em] uppercase font-bold transition-all duration-300 hover:bg-white/20 hover:shadow-lg border border-white/25 rounded-lg"
            >
              <GraduationCap className="w-4 h-4" />
              Nutriser Academy
            </a>
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector("#promociones");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="relative col-span-2 inline-flex items-center justify-center gap-3 bg-[#1A1A1A]/80 text-[#C5A55A] px-10 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-[#C5A55A] hover:text-[#1A1A1A] hover:shadow-lg hover:shadow-[#C5A55A]/40 border-2 border-[#C5A55A] overflow-hidden group rounded-lg"
              animate={{ boxShadow: ["0 0 0 0 rgba(197, 165, 90, 0.7)", "0 0 0 18px rgba(197, 165, 90, 0)"] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#C5A55A]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
