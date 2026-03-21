import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Loader2, Gift, Sparkles } from "lucide-react";

export default function PromotionsSection() {
  const { data: promotions, isLoading } = trpc.promotions.list.useQuery();

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {/* Cupón Container */}
                <div className="bg-gradient-to-br from-[#C5A55A] to-[#B8963E] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  {/* Decoración superior */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                  
                  {/* Contenido principal */}
                  <div className="p-8 relative">
                    {/* Logo y regalo en la esquina */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 animate-bounce">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>

                    {/* Título */}
                    <h3 className="font-serif text-2xl lg:text-3xl text-white mb-4 pr-20 leading-tight">
                      {promo.title}
                    </h3>

                    {/* Descripción */}
                    {promo.description && (
                      <p className="text-white/90 text-sm lg:text-base leading-relaxed mb-6 font-light">
                        {promo.description}
                      </p>
                    )}

                    {/* Línea divisoria */}
                    <div className="h-px bg-white/30 my-6" />

                    {/* Botón Lo Quiero */}
                    <a
                      href={`https://wa.me/3221007799?text=${encodeURIComponent(`Quiero la promoción: ${promo.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-white text-[#C5A55A] py-3 px-4 rounded-lg font-bold text-center uppercase tracking-[0.1em] transition-all duration-300 hover:bg-[#FAF7F2] hover:shadow-lg transform hover:scale-105 active:scale-95"
                    >
                      Lo Quiero
                    </a>
                  </div>

                  {/* Efecto de puntos decorativos */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 py-2 opacity-20">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>

                {/* Sombra decorativa */}
                <div className="absolute -bottom-2 left-4 right-4 h-2 bg-[#C5A55A]/20 rounded-full blur-xl" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
