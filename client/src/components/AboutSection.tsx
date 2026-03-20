/*
 * Nutriser - About Section
 * Design: Split layout with clinic image and philosophy text
 * Gold accents, elegant typography
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Award, Users } from "lucide-react";

const CLINIC_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/clinic-interior-Fpsc8PF86R8Dneg3PQZwky.webp";
const ABOUT_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/about-section-hX4AVyjwSG4JsEMKZiumsp.webp";

const values = [
  {
    icon: Shield,
    title: "Tecnología Avanzada",
    description:
      "Equipos de última generación para tratamientos seguros y efectivos.",
  },
  {
    icon: Award,
    title: "Experiencia Médica",
    description:
      "Protocolos diseñados y supervisados por profesionales certificados.",
  },
  {
    icon: Users,
    title: "Atención Personalizada",
    description:
      "Cada protocolo es único, porque cada piel y cada cuerpo son diferentes.",
  },
];

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="nosotros" className="py-24 lg:py-32 bg-white">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Top: Split layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
            {/* Images */}
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={CLINIC_IMG}
                  alt="Interior de Nutriser"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Overlapping smaller image */}
              <div className="hidden lg:block absolute -bottom-8 -right-8 w-48 h-48 overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src={ABOUT_IMG}
                  alt="Equipamiento Nutriser"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Gold accent */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-[#C5A55A] hidden lg:block" />
            </div>

            {/* Text */}
            <div>
              <span className="text-[#C5A55A] text-xs tracking-[0.3em] uppercase">
                Sobre Nutriser
              </span>
              <h2 className="font-serif text-4xl lg:text-5xl text-warm-black mt-4 mb-6 leading-[1.15]">
                Diseñamos protocolos{" "}
                <span className="italic text-[#C5A55A]">únicos</span> para ti
              </h2>
              <div className="w-16 h-[1px] bg-[#C5A55A] mb-6" />
              <p className="text-warm-black/70 text-lg leading-relaxed mb-6">
                En Nutriser creemos que cada piel y cada cuerpo merecen
                soluciones reales. No ofrecemos tratamientos genéricos: cada
                protocolo es personalizado, combinando la mejor tecnología con
                experiencia médica comprobada.
              </p>
              <p className="text-warm-black/70 text-lg leading-relaxed mb-8">
                Nuestra misión es acompañarte en tu transformación, brindándote
                resultados visibles y duraderos en un ambiente de confianza y
                profesionalismo.
              </p>
              <a
                href="https://wa.me/523221007799"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-[#C5A55A] text-white px-8 py-4 text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#B8963E] hover:shadow-lg hover:shadow-[#C5A55A]/30"
              >
                Agenda tu Valoración
              </a>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                  className="text-center p-8 bg-cream group hover:bg-[#C5A55A]/5 transition-colors duration-500"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 border border-[#C5A55A]/30 mb-5 group-hover:border-[#C5A55A] transition-colors duration-500">
                    <Icon className="w-6 h-6 text-[#C5A55A]" />
                  </div>
                  <h4 className="font-serif text-xl text-warm-black mb-3">
                    {value.title}
                  </h4>
                  <p className="text-warm-black/60 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
