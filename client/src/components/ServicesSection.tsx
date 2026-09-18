/*
 * Nutriser - Services Section
 * Catálogo informativo con detalle ampliado y contacto por WhatsApp.
 */
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { serviceDescriptions } from "@/lib/serviceDescriptions";
import {
  Apple,
  Sparkles,
  Scan,
  Syringe,
  Droplets,
  Package,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Clock3,
  HeartPulse,
  X,
} from "lucide-react";

const WHATSAPP_NUMBER = "523221007799";

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  nutricion: { label: "Nutrición", icon: Apple, color: "#6B8E5B" },
  corporales: { label: "Corporales", icon: Sparkles, color: "#C5A55A" },
  faciales: { label: "Faciales", icon: Scan, color: "#D4A0A0" },
  medicina: { label: "Medicina", icon: Syringe, color: "#8E6B8E" },
  otros: { label: "Otros", icon: Droplets, color: "#5B8E8E" },
  productos: { label: "Skincare", icon: Droplets, color: "#C5A55A" },
  general: { label: "General", icon: Package, color: "#888" },
};

const CATEGORY_ORDER = ["nutricion", "corporales", "faciales", "medicina", "otros", "productos", "general"];

function recommendationFor(category: string) {
  switch (category) {
    case "nutricion":
      return "Personas que buscan acompañamiento profesional para mejorar hábitos, composición corporal y bienestar general.";
    case "corporales":
      return "Personas que desean trabajar grasa localizada, celulitis, flacidez o contorno corporal con un protocolo personalizado.";
    case "faciales":
      return "Personas que quieren mejorar hidratación, textura, manchas, poros, luminosidad o signos visibles de la edad.";
    case "medicina":
      return "Personas que requieren valoración profesional antes de elegir un tratamiento médico-estético seguro y personalizado.";
    default:
      return "La recomendación depende de una valoración inicial y de los objetivos, antecedentes y necesidades de cada persona.";
  }
}

function whatsappUrl(serviceName: string) {
  const message = encodeURIComponent(`Hola, me gustaría pedir informes sobre: ${serviceName}`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export default function ServicesSection() {
  const { data: services = [], isLoading } = trpc.services.list.useQuery();
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  const categoryMap = new Map<string, typeof services>();
  for (const service of services) {
    const category = service.category || "general";
    if (!categoryMap.has(category)) categoryMap.set(category, []);
    categoryMap.get(category)!.push(service);
  }

  const categories = CATEGORY_ORDER
    .filter((id) => categoryMap.has(id))
    .map((id) => ({
      id,
      ...(CATEGORY_META[id] ?? { label: id, icon: Package, color: "#888" }),
      services: categoryMap.get(id)!,
    }));

  for (const [id, categoryServices] of Array.from(categoryMap.entries())) {
    if (!CATEGORY_ORDER.includes(id)) {
      categories.push({
        id,
        ...(CATEGORY_META[id] ?? { label: id, icon: Package, color: "#888" }),
        services: categoryServices,
      });
    }
  }

  const activeId = activeCategory || categories[0]?.id || "";
  const activeCat = categories.find((category) => category.id === activeId);

  return (
    <section id="servicios" className="py-24 lg:py-32 bg-[#FAF7F2]">
      <div className="container">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl lg:text-5xl text-[#1A1A1A] mt-4 mb-6">
            Nuestros <span className="italic">Servicios</span>
          </h2>
          <div className="h-[1px] max-w-xs mx-auto bg-gradient-to-r from-transparent via-[#C5A55A] to-transparent" />
          <p className="text-[#1A1A1A]/60 mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
            Conoce cada tratamiento, sus beneficios y el número aproximado de sesiones. Te orientamos para elegir el protocolo ideal para ti.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" /></div>
        ) : categories.length === 0 ? (
          <p className="text-center text-[#1A1A1A]/50 py-16">No hay servicios disponibles.</p>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeId === category.id;
                return (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm tracking-[0.05em] transition-all duration-300 border ${
                      isActive
                        ? "bg-[#C5A55A] text-white border-[#C5A55A] shadow-lg shadow-[#C5A55A]/20"
                        : "bg-white text-[#1A1A1A]/60 border-[#1A1A1A]/10 hover:border-[#C5A55A]/40 hover:text-[#C5A55A]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                    <span className="sm:hidden">{category.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {activeCat && (
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {activeCat.services.map((service, index) => (
                  <motion.article
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group bg-white border border-[#1A1A1A]/5 hover:border-[#C5A55A]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#C5A55A]/5 flex flex-col min-w-0"
                  >
                    {service.imageUrl && (
                      <div className="w-full h-40 overflow-hidden">
                        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <h3 className="font-serif text-lg text-[#1A1A1A] leading-snug group-hover:text-[#C5A55A] transition-colors duration-300 mb-3">{service.name}</h3>
                      {service.description && <p className="text-[#1A1A1A]/55 text-sm leading-relaxed line-clamp-3">{service.description}</p>}
                      {service.price && <p className="text-[#C5A55A] font-semibold text-sm mt-3">{service.price}</p>}
                    </div>
                    <div className="px-6 pb-5 pt-2 border-t border-[#1A1A1A]/5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedService(service)}
                        className="inline-flex items-center justify-center gap-1.5 border border-[#C5A55A]/50 text-[#A78334] hover:bg-[#C5A55A]/10 text-xs font-semibold py-2.5 rounded-lg transition-colors"
                      >
                        Ver información <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={whatsappUrl(service.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] text-white hover:bg-[#20BA5A] text-xs font-semibold py-2.5 rounded-lg transition-colors"
                      >
                        Pedir informes
                      </a>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </>
        )}

        <motion.div initial={{ opacity: 0 }} animate={headerInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }} className="text-center mt-16">
          <p className="text-[#1A1A1A]/50 text-sm mb-4">¿Tienes dudas sobre qué tratamiento elegir?</p>
          <a href={whatsappUrl("una valoración personalizada")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#20BA5A] hover:shadow-lg hover:shadow-[#25D366]/30">
            Pedir informes
          </a>
        </motion.div>
      </div>

      {selectedService && (() => {
        const details = serviceDescriptions[selectedService.name as keyof typeof serviceDescriptions];
        const category = selectedService.category || "general";
        const fallbackDescription = selectedService.description || "Tratamiento personalizado de Nutriser.";
        return (
          <div className="fixed inset-0 z-[70] bg-black/70 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={`Información de ${selectedService.name}`}>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-[#C5A55A] to-[#B8963E] px-6 py-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white/75 text-xs uppercase tracking-[0.18em] mb-1">Información del servicio</p>
                  <h2 className="font-serif text-2xl md:text-3xl text-white">{details?.title || selectedService.name}</h2>
                </div>
                <button type="button" onClick={() => setSelectedService(null)} className="text-white/90 hover:text-white p-1" aria-label="Cerrar información"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 md:p-8 space-y-7 text-[#1A1A1A]">
                <div>
                  <h3 className="font-serif text-xl mb-2">¿Qué es?</h3>
                  <p className="text-[#1A1A1A]/70 leading-relaxed">{details?.whatIs || fallbackDescription}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-[#FAF7F2] border border-[#C5A55A]/20 p-4">
                    <div className="flex items-center gap-2 text-[#A78334] font-semibold text-sm mb-2"><Clock3 className="w-4 h-4" /> Sesiones y duración</div>
                    <p className="text-sm text-[#1A1A1A]/70 leading-relaxed">{details?.duration || "El número de sesiones se define después de una valoración personalizada."}</p>
                  </div>
                  <div className="rounded-xl bg-[#FAF7F2] border border-[#C5A55A]/20 p-4">
                    <div className="flex items-center gap-2 text-[#A78334] font-semibold text-sm mb-2"><HeartPulse className="w-4 h-4" /> ¿Para quién se recomienda?</div>
                    <p className="text-sm text-[#1A1A1A]/70 leading-relaxed">{recommendationFor(category)}</p>
                  </div>
                </div>
                {details?.benefits?.length ? (
                  <div>
                    <h3 className="font-serif text-xl mb-3">Beneficios principales</h3>
                    <ul className="grid sm:grid-cols-2 gap-2 text-sm text-[#1A1A1A]/70">
                      {details.benefits.map((benefit) => <li key={benefit} className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-[#C5A55A] flex-shrink-0" />{benefit}</li>)}
                    </ul>
                  </div>
                ) : null}
                {details?.care?.length ? (
                  <div>
                    <h3 className="font-serif text-xl mb-3">Cuidados y dudas frecuentes</h3>
                    <ul className="space-y-2 text-sm text-[#1A1A1A]/70">
                      {details.care.map((care) => <li key={care} className="flex gap-2"><span className="text-[#C5A55A] font-bold">•</span>{care}</li>)}
                    </ul>
                    <p className="text-xs text-[#1A1A1A]/50 mt-4">La valoración profesional confirma si este servicio es adecuado para ti y resuelve cualquier duda antes de comenzar.</p>
                  </div>
                ) : null}
                <a href={whatsappUrl(selectedService.name)} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center bg-[#25D366] hover:bg-[#20BA5A] text-white py-3.5 rounded-xl font-semibold transition-colors">Pedir informes por WhatsApp</a>
              </div>
            </motion.div>
          </div>
        );
      })()}
    </section>
  );
}
