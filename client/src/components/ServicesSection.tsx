/*
 * Nutriser - Services Section (Complete Catalog)
 * Design: Category tabs with service cards
 * 6 categories, 27 services total
 * Gold accents, elegant card layout, scroll animations
 */
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Apple,
  Sparkles,
  Scan,
  Syringe,
  Droplets,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";

const categories = [
  {
    id: "nutricion",
    label: "Nutrición",
    icon: Apple,
    color: "#6B8E5B",
    services: [
      {
        name: "Asesoría Nutricional Personalizada",
        desc: "Planes hechos a tu medida para mejorar tu salud, alcanzar tus metas y optimizar tu bienestar.",
      },
    ],
  },
  {
    id: "corporales",
    label: "Corporales",
    icon: Sparkles,
    color: "#C5A55A",
    services: [
      {
        name: "Cavitación 80K y 120K",
        desc: "Elimina grasa localizada con ultrasonido avanzado, remodelando tu figura.",
      },
      {
        name: "Radiofrecuencia Corporal",
        desc: "Reafirma tu piel y combate la celulitis estimulando colágeno y elastina.",
      },
      {
        name: "Vacunterapia",
        desc: "Mejora la circulación, moldea y ayuda en la reducción de celulitis.",
      },
      {
        name: "Láser Lipolítico No Invasivo (Hipoláser)",
        desc: "Reduce medidas y grasa localizada con tecnología láser indolora.",
      },
      {
        name: "Martillo Vibrador Corporal",
        desc: "Favorece el drenaje linfático y la relajación muscular.",
      },
      {
        name: "Vacuum con Copas para Glúteos",
        desc: "Levanta y tonifica de manera natural, mejorando la firmeza.",
      },
      {
        name: "Aplicación de Enzimas Reductoras",
        desc: "Tratamiento estético para eliminar grasa localizada y moldear la figura.",
      },
      {
        name: "Mesoterapia Reductora",
        desc: "Tratamiento localizado que ayuda a reducir grasa y mejorar la silueta.",
      },
    ],
  },
  {
    id: "faciales",
    label: "Faciales",
    icon: Scan,
    color: "#D4A0A0",
    services: [
      {
        name: "Diagnóstico Facial con Monitor de Piel",
        desc: "Análisis digital avanzado para personalizar tus tratamientos faciales.",
      },
      {
        name: "Limpieza Facial Profunda",
        desc: "Elimina impurezas y puntos negros para una piel fresca y saludable.",
      },
      {
        name: "Dermaplaning",
        desc: "Exfoliación avanzada que elimina células muertas y vello facial para una piel más suave y luminosa.",
      },
      {
        name: "Radiofrecuencia Facial",
        desc: "Rejuvenece tu rostro, mejora flacidez y líneas de expresión.",
      },
      {
        name: "Hollywood Peel con Láser PicoSegundos",
        desc: "Piel más joven, luminosa y uniforme en minutos.",
      },
      {
        name: "Microneedling Profesional (Dermapen)",
        desc: "Estimula colágeno y elastina para mejorar cicatrices, arrugas y textura de la piel.",
      },
      {
        name: "Plasma Rico en Plaquetas (PRP)",
        desc: "Repara y regenera tu piel de forma natural con factores de crecimiento.",
      },
      {
        name: "Martillo Frío Facial",
        desc: "Calma, desinflama y revitaliza tu piel después de tratamientos.",
      },
      {
        name: "Blefaroplastia No Quirúrgica",
        desc: "Rejuvenece tu mirada reduciendo párpados caídos y arrugas finas con Plasma Pen o Láser CO₂.",
      },
      {
        name: "Láser CO₂ Fraccionado",
        desc: "Tratamiento avanzado para cicatrices, arrugas profundas y manchas.",
      },
    ],
  },
  {
    id: "medicina",
    label: "Medicina Estética",
    icon: Syringe,
    color: "#8B7EC8",
    services: [
      {
        name: "Toxina Botulínica (Botox)",
        desc: "Relaja arrugas de expresión y brinda un aspecto más joven.",
      },
      {
        name: "Relleno de Ácido Hialurónico (Russian Lips)",
        desc: "Labios más definidos, naturales y armoniosos.",
      },
      {
        name: "Rellenos Faciales",
        desc: "Restaura volumen y suaviza líneas profundas en ojeras y surcos nasogenianos.",
      },
    ],
  },
  {
    id: "otros",
    label: "Otros Servicios",
    icon: Droplets,
    color: "#5B8E8E",
    services: [
      {
        name: "Detox Iónico",
        desc: "Elimina toxinas y equilibra tu organismo con un baño desintoxicante.",
      },
      {
        name: "Retiro de Tatuajes con Láser",
        desc: "Tecnología avanzada para eliminar tatuajes de manera progresiva y segura.",
      },
    ],
  },
  {
    id: "productos",
    label: "Productos",
    icon: ShoppingBag,
    color: "#C5855A",
    services: [
      {
        name: "Productos Nutricionales y Cosméticos",
        desc: "Complementa tus tratamientos con productos de alta calidad para cuidar tu salud y belleza.",
      },
    ],
  },
];

export default function ServicesSection() {
  const [activeCategory, setActiveCategory] = useState("nutricion");
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  const activeCat = categories.find((c) => c.id === activeCategory)!;

  return (
    <section id="servicios" className="py-24 lg:py-32 bg-[#FAF7F2]">
      <div className="container">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-[#C5A55A] text-xs tracking-[0.3em] uppercase">
            Catálogo Completo
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl text-[#1A1A1A] mt-4 mb-6">
            Nuestros <span className="italic">Servicios</span>
          </h2>
          <div className="h-[1px] max-w-xs mx-auto bg-gradient-to-r from-transparent via-[#C5A55A] to-transparent" />
          <p className="text-[#1A1A1A]/60 mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
            Más de 25 tratamientos y servicios especializados en nutrición,
            estética facial, corporal y medicina estética para tu transformación
            integral.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm tracking-[0.05em] transition-all duration-300 border ${
                  isActive
                    ? "bg-[#C5A55A] text-white border-[#C5A55A] shadow-lg shadow-[#C5A55A]/20"
                    : "bg-white text-[#1A1A1A]/60 border-[#1A1A1A]/10 hover:border-[#C5A55A]/40 hover:text-[#C5A55A]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.label.split(" ")[0]}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#1A1A1A]/5 text-[#1A1A1A]/40"
                  }`}
                >
                  {cat.services.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {activeCat.services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group bg-white p-6 border border-[#1A1A1A]/5 hover:border-[#C5A55A]/30 transition-all duration-400 hover:shadow-lg hover:shadow-[#C5A55A]/5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className="font-serif text-lg text-[#1A1A1A] leading-snug group-hover:text-[#C5A55A] transition-colors duration-300">
                  {service.name}
                </h4>
                <ChevronRight className="w-4 h-4 text-[#C5A55A]/0 group-hover:text-[#C5A55A] transition-all duration-300 flex-shrink-0 mt-1" />
              </div>
              <p className="text-[#1A1A1A]/55 text-sm leading-relaxed">
                {service.desc}
              </p>
              <a
                href="https://wa.me/523221007799"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-4 text-[#C5A55A] text-xs tracking-[0.1em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                Consultar
                <ChevronRight className="w-3 h-3" />
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={headerInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-[#1A1A1A]/50 text-sm mb-4">
            ¿No encuentras lo que buscas? Contáctanos para una valoración
            personalizada.
          </p>
          <a
            href="/appointment-form"
            className="inline-flex items-center gap-2 bg-[#C5A55A] text-white px-8 py-4 text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#B8963E] hover:shadow-lg hover:shadow-[#C5A55A]/30"
          >
            Agendar Cita
          </a>
        </motion.div>
      </div>
    </section>
  );
}
