import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle } from "lucide-react";

export default function PromotionsSection() {
  const { data: promotions, isLoading } = trpc.promotions.list.useQuery();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (id: number) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const getImageUrl = (imageUrl: string | null) => {
    return imageUrl || '/uploads/nutriser-logo.jpeg';
  };

  return (
    <section id="promociones" className="py-20 bg-[#FAF7F2]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-4xl lg:text-5xl text-[#1A1A1A] mb-4">
            Promociones Vigentes
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#C5A55A] to-transparent mx-auto" />
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-[#C5A55A] animate-spin" />
          </div>
        ) : !promotions || promotions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-12 rounded-lg border-2 border-[#C5A55A]/20 text-center"
          >
            <p className="text-[#999] text-lg mb-2">
              Actualmente no existen promociones
            </p>
            <p className="text-[#666] text-sm">
              Vuelve pronto para conocer nuestras ofertas especiales
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-[#C5A55A]/10"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-[#FAF7F2] flex items-center justify-center">
                  {imageErrors[promo.id] ? (
                    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
                      <AlertCircle className="w-8 h-8 text-[#C5A55A]" />
                      <p className="text-sm text-[#999]">Imagen no disponible</p>
                    </div>
                  ) : (
                    <img
                      src={getImageUrl(promo.imageUrl)}
                      alt={promo.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={() => handleImageError(promo.id)}
                    />
                  )
                }</div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">
                    {promo.title}
                  </h3>
                  {promo.description && (
                    <p className="text-[#666] text-sm leading-relaxed">
                      {promo.description}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-[#C5A55A]/20">
                    <a
                      href={`https://wa.me/3221007799?text=${encodeURIComponent(`Quiero la promoción: ${promo.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-[#C5A55A] text-white py-2 text-sm tracking-[0.1em] uppercase font-bold transition-all duration-300 hover:bg-[#B8963E] text-center"
                    >
                      Lo Quiero
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
