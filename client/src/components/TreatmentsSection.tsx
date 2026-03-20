/*
 * Nutriser - Treatments Section
 * Design: Alternating left/right layout with gold accents
 * Each treatment card has image + text side by side
 * Staggered fade-in on scroll
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles, Zap, Heart, Sun } from "lucide-react";

const TREATMENT_SKIN =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/treatment-skin-XJ43g4KtW5EEFhtHaAz4P8.webp";
const TREATMENT_BODY =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/treatment-body-PRmqUazejmzzNeWyLfBRaw.webp";

const treatments = [
  {
    id: "estrias",
    number: "01",
    title: "Estrías",
    icon: Zap,
    problem:
      "Son marcas visibles que aparecen tras cambios de peso, embarazo o crecimiento rápido.",
    solution:
      "Aplicamos protocolos que combinan aparatología avanzada y bioestimulación dérmica para mejorar visiblemente su apariencia.",
    result: "Piel más firme, uniforme y renovada.",
    image: TREATMENT_BODY,
  },
  {
    id: "cicatrices",
    number: "02",
    title: "Cicatrices de Acné",
    icon: Sparkles,
    problem: "El acné puede dejar huellas permanentes en la piel.",
    solution:
      "Con protocolos personalizados de láser, microneedling y regeneración dérmica, reducimos cicatrices y devolvemos uniformidad a la piel.",
    result: "Textura más suave, piel más pareja y confianza recuperada.",
    image: TREATMENT_SKIN,
  },
  {
    id: "celulitis",
    number: "03",
    title: "Celulitis",
    icon: Heart,
    problem:
      "La piel de naranja afecta hasta a 9 de cada 10 mujeres, incluso sin sobrepeso.",
    solution:
      "Tratamientos combinados de aparatología para mejorar la circulación, estimular colágeno y reducir la apariencia de celulitis.",
    result: "Piel más lisa, firme y tonificada.",
    image: TREATMENT_BODY,
  },
  {
    id: "hiperpigmentacion",
    number: "04",
    title: "Hiperpigmentación Postinflamatoria",
    icon: Sun,
    problem:
      "Las manchas oscuras aparecen tras acné, lesiones o irritación.",
    solution:
      "Protocolos despigmentantes con láser, peelings y activos específicos para aclarar y unificar el tono de la piel.",
    result: "Un rostro más uniforme, luminoso y saludable.",
    image: TREATMENT_SKIN,
  },
];

function TreatmentCard({
  treatment,
  index,
}: {
  treatment: (typeof treatments)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isEven = index % 2 === 0;
  const Icon = treatment.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1 }}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
        !isEven ? "lg:direction-rtl" : ""
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden group ${
          !isEven ? "lg:order-2" : ""
        }`}
      >
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={treatment.image}
            alt={treatment.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        {/* Gold corner accent */}
        <div className="absolute top-0 left-0 w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-[#C5A55A]" />
          <div className="absolute top-0 left-0 w-[1px] h-full bg-[#C5A55A]" />
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16">
          <div className="absolute bottom-0 right-0 w-full h-[1px] bg-[#C5A55A]" />
          <div className="absolute bottom-0 right-0 w-[1px] h-full bg-[#C5A55A]" />
        </div>
      </div>

      {/* Content */}
      <div className={`${!isEven ? "lg:order-1" : ""} lg:direction-ltr`}>
        <div className="flex items-center gap-4 mb-4">
          <span className="font-serif text-5xl text-[#C5A55A]/20 font-bold">
            {treatment.number}
          </span>
          <div className="w-8 h-[1px] bg-[#C5A55A]" />
          <Icon className="w-5 h-5 text-[#C5A55A]" />
        </div>

        <h3 className="font-serif text-3xl lg:text-4xl text-warm-black mb-6">
          {treatment.title}
        </h3>

        <div className="space-y-4">
          <div>
            <span className="text-[#C5A55A] text-xs tracking-[0.2em] uppercase font-bold">
              Problema
            </span>
            <p className="text-warm-black/70 mt-1 leading-relaxed">
              {treatment.problem}
            </p>
          </div>

          <div>
            <span className="text-[#C5A55A] text-xs tracking-[0.2em] uppercase font-bold">
              Solución Nutriser
            </span>
            <p className="text-warm-black/70 mt-1 leading-relaxed">
              {treatment.solution}
            </p>
          </div>

          <div className="bg-[#C5A55A]/5 border-l-2 border-[#C5A55A] px-5 py-4">
            <span className="text-[#C5A55A] text-xs tracking-[0.2em] uppercase font-bold">
              Resultados
            </span>
            <p className="text-warm-black font-medium mt-1">
              {treatment.result}
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/523221007799"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 text-[#C5A55A] text-sm tracking-[0.1em] uppercase transition-all duration-300 hover:gap-4 group/link"
        >
          Consultar este tratamiento
          <span className="transition-transform duration-300 group-hover/link:translate-x-1">
            →
          </span>
        </a>
      </div>
    </motion.div>
  );
}

export default function TreatmentsSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section id="tratamientos" className="py-24 lg:py-32 bg-cream">
      <div className="container">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="text-[#C5A55A] text-xs tracking-[0.3em] uppercase">
            Nuestros Protocolos
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl text-warm-black mt-4 mb-6">
            Soluciones que <span className="italic">transforman</span>
          </h2>
          <div className="gold-line max-w-xs mx-auto" />
          <p className="text-warm-black/60 mt-6 max-w-xl mx-auto text-lg leading-relaxed">
            Cada protocolo está diseñado para resolver problemas específicos,
            combinando la mejor tecnología y experiencia médica.
          </p>
        </motion.div>

        {/* Treatment Cards */}
        <div className="space-y-24 lg:space-y-32">
          {treatments.map((treatment, i) => (
            <TreatmentCard key={treatment.id} treatment={treatment} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
