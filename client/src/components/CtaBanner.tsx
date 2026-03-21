/*
 * Nutriser - CTA Banner
 * Design: Gold gradient banner with call to action
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, Gift, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function CtaBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [, navigate] = useLocation();

  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#C5A55A] via-[#B8963E] to-[#C5A55A]" />
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(255,255,255,0.1) 20px,
            rgba(255,255,255,0.1) 21px
          )`,
        }}
      />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="relative z-10 container text-center"
      >
        <h2 className="font-serif text-3xl lg:text-5xl text-white mb-4 leading-tight">
          Cada piel y cada cuerpo merecen{" "}
          <span className="italic">soluciones reales</span>
        </h2>
        <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
          Agenda tu valoración personalizada y descubre el protocolo ideal para
          ti.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <button
            onClick={() => navigate("/appointment-form")}
            className="inline-flex items-center gap-3 bg-white text-[#B8963E] px-8 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-white/90 hover:shadow-2xl hover:shadow-black/20"
          >
            <Phone className="w-4 h-4" />
            Agendar Valoración
          </button>
          <a
            href="https://wa.me/523221007799"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-600 text-white px-8 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-green-700 hover:shadow-2xl hover:shadow-green-600/20"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <button
            onClick={() => navigate("/memberships")}
            className="inline-flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-[#2A2A2A] hover:shadow-2xl hover:shadow-black/20"
          >
            <Gift className="w-4 h-4" />
            Adquirir Programa
          </button>
        </div>
      </motion.div>
    </section>
  );
}
