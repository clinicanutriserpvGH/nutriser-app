/*
 * Nutriser - Services Section (Dynamic from DB)
 * Design: Category tabs with informative service cards and WhatsApp contact
 */
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Apple,
  Sparkles,
  Scan,
  Syringe,
  Droplets,
  Package,
  Loader2,
  MessageCircle,
} from "lucide-react";

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

export default function ServicesSection() {
  const { data: services = [], isLoading } = trpc.services.list.useQuery();

  // Build categories from DB data
  const categoryMap = new Map<string, typeof services>();
  for (const svc of services) {
    const cat = svc.category || "general";
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push(svc);
  }

  // Sort categories by predefined order
  const categories = CATEGORY_ORDER
    .filter(id => categoryMap.has(id))
    .map(id => ({
      id,
      ...(CATEGORY_META[id] ?? { label: id, icon: Package, color: "#888" }),
      services: categoryMap.get(id)!,
    }));

  // Add any unknown categories at the end
  for (const [id, svcs] of Array.from(categoryMap.entries())) {
    if (!CATEGORY_ORDER.includes(id)) {
      categories.push({
        id,
        ...(CATEGORY_META[id] ?? { label: id, icon: Package, color: "#888" }),
        services: svcs,
      });
    }
  }

  const [activeCategory, setActiveCategory] = useState<string>("");
  const activeId = activeCategory || categories[0]?.id || "";
  const activeCat = categories.find((c) => c.id === activeId);

  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

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

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-[#1A1A1A]/50 py-16">No hay servicios disponibles.</p>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeId === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveCategory(cat.id); }}
                    className={`flex items-center gap-2 px-5 py-3 text-sm tracking-[0.05em] transition-all duration-300 border ${
                      isActive
                        ? "bg-[#C5A55A] text-white border-[#C5A55A] shadow-lg shadow-[#C5A55A]/20"
                        : "bg-white text-[#1A1A1A]/60 border-[#1A1A1A]/10 hover:border-[#C5A55A]/40 hover:text-[#C5A55A]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat.label}</span>
                    <span className="sm:hidden">{cat.label.split(" ")[0]}</span>

                  </button>
                );
              })}
            </div>

            {/* Services Grid */}
            {activeCat && (
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {activeCat.services.map((service, i) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group bg-white border border-[#1A1A1A]/5 hover:border-[#C5A55A]/30 transition-all duration-400 hover:shadow-lg hover:shadow-[#C5A55A]/5 flex flex-col"
                  >
                    {/* Service image if available */}
                    {service.imageUrl && (
                      <div className="w-full h-40 overflow-hidden">
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    {/* Card body */}
                    <div className="p-6 flex-1">
                      <h4 className="font-serif text-lg text-[#1A1A1A] leading-snug group-hover:text-[#C5A55A] transition-colors duration-300 mb-3">
                        {service.name}
                      </h4>
                      {service.description && (
                        <p className="text-[#1A1A1A]/55 text-sm leading-relaxed">
                          {service.description}
                        </p>
                      )}
                      {service.price && (
                        <p className="text-[#C5A55A] font-semibold text-sm mt-3">{service.price}</p>
                      )}
                    </div>

                    {/* Card footer with buttons */}
                    <div className="px-6 pb-5 pt-2 border-t border-[#1A1A1A]/5 flex flex-col gap-2">
                      {/* Única acción disponible: contacto por WhatsApp */}
                      <div className="flex">
                        <a
                          href={`https://wa.me/523221007799?text=${encodeURIComponent(`Hola, me gustaría pedir informes sobre: ${service.name}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-1.5 border border-green-500 text-green-600 hover:bg-green-50 text-xs font-semibold py-2.5 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}

        {/* Bottom CTA - Contacto por WhatsApp */}
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
            href="https://wa.me/523221007799"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#20BA5A] hover:shadow-lg hover:shadow-[#25D366]/30"
          >
            <MessageCircle className="w-5 h-5" />
            Contáctanos por WhatsApp
          </a>
        </motion.div>
      </div>

    </section>
  );
}
