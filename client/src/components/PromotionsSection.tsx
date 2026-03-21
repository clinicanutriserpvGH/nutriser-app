import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Loader2, Gift, Sparkles, Share2, Mail, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function PromotionsSection() {
  const { data: promotions, isLoading } = trpc.promotions.list.useQuery();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleShareWhatsApp = (title: string, description: string) => {
    const message = `🎁 *${title}*\n\n${description}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = (title: string, description: string) => {
    const subject = `Promoción Nutriser: ${title}`;
    const body = `Mira esta promoción de Nutriser:\n\n${title}\n\n${description}\n\nQuiero aprovechar esta oferta.`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = (id: number, title: string, description: string | null) => {
    const cuponeText = `🎁 ${title}\n\n${description || ''}`;
    navigator.clipboard.writeText(cuponeText);
    setCopiedId(id);
    toast.success("Cupón copiado al portapapeles");
    setTimeout(() => setCopiedId(null), 2000);
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
            Cuponera de Promociones
          </h2>
          <p className="text-[#666] mb-4">Comparte nuestras ofertas con tus amigos</p>
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
                {/* Cuponera Container */}
                <div className="relative">
                  {/* Cupón Principal */}
                  <div className="bg-gradient-to-br from-[#C5A55A] to-[#B8963E] rounded-t-2xl overflow-hidden shadow-xl">
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

                  {/* Línea de corte */}
                  <div className="h-1 bg-[#C5A55A]/30 relative flex items-center justify-center">
                    <div className="absolute left-0 right-0 flex justify-between px-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-[#C5A55A] rounded-full" />
                      ))}
                    </div>
                  </div>

                  {/* Sección de Compartir */}
                  <div className="bg-white rounded-b-2xl p-6 shadow-xl border-t-2 border-[#C5A55A]/20">
                    <p className="text-xs font-semibold text-[#666] mb-3 uppercase tracking-wider">
                      Compartir con:
                    </p>
                    
                    <div className="flex gap-3 flex-wrap">
                      {/* Botón WhatsApp */}
                      <button
                        onClick={() => handleShareWhatsApp(promo.title, promo.description || "")}
                        className="flex-1 min-w-[100px] flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold text-sm"
                        title="Compartir por WhatsApp"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.967 1.523 9.9 9.9 0 001.563 19.231c2.693.47 5.455.082 7.978-1.125a9.9 9.9 0 00-4.57-19.629z"/>
                        </svg>
                        WhatsApp
                      </button>

                      {/* Botón Email */}
                      <button
                        onClick={() => handleShareEmail(promo.title, promo.description || "")}
                        className="flex-1 min-w-[100px] flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold text-sm"
                        title="Compartir por Email"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </button>

                      {/* Botón Copiar */}
                <button
                  onClick={() => handleCopyLink(promo.id, promo.title, promo.description)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                  title="Copiar cupón"
                >
                  {copiedId === promo.id ? (
                    <>
                      <Check size={18} />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
                    </div>
                  </div>

                  {/* Sombra decorativa */}
                  <div className="absolute -bottom-2 left-4 right-4 h-2 bg-[#C5A55A]/20 rounded-full blur-xl" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
