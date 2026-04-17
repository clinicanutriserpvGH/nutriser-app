/*
 * Nutriser - CTA Banner
 * Design: Gold gradient banner with social media links
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Instagram, Facebook } from "lucide-react";

export default function CtaBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
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
        <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">
          Síguenos en nuestras redes sociales y mantente al día con
          tratamientos, consejos y promociones exclusivas.
        </p>

        {/* Redes sociales */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
          {/* Instagram */}
          <a
            href="https://instagram.com/nutriserpv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-[#B8963E] px-8 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-white/90 hover:shadow-2xl hover:shadow-black/20 rounded-sm"
          >
            <Instagram className="w-5 h-5" />
            Instagram
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com/nutriserpv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white/15 border-2 border-white text-white px-8 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-white hover:text-[#B8963E] hover:shadow-2xl hover:shadow-black/20 rounded-sm"
          >
            <Facebook className="w-5 h-5" />
            Facebook
          </a>


        </div>
      </motion.div>
    </section>
  );
}
