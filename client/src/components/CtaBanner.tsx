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

          {/* TikTok */}
          <a
            href="https://tiktok.com/@nutriserpv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white/15 border-2 border-white text-white px-8 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-white hover:text-[#B8963E] hover:shadow-2xl hover:shadow-black/20 rounded-sm"
          >
            {/* TikTok icon SVG */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
            </svg>
            TikTok
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/523221007799?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20Nutriser"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-[#1ebe5d] hover:shadow-2xl hover:shadow-black/20 rounded-sm"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </motion.div>
    </section>
  );
}
