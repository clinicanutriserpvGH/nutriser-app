/*
 * Nutriser - Services Section (Complete Catalog)
 * Design: Category tabs with service cards + Adquirir button + purchase modal
 */
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Apple,
  Sparkles,
  Scan,
  Syringe,
  Droplets,
  ShoppingBag,
  X,
  Loader2,
  Upload,
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
        price: "Consultar precio",
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
        price: "Consultar precio",
      },
      {
        name: "Radiofrecuencia Corporal",
        desc: "Reafirma tu piel y combate la celulitis estimulando colágeno y elastina.",
        price: "Consultar precio",
      },
      {
        name: "Vacuumterapia",
        desc: "Mejora la circulación, moldea y ayuda en la reducción de celulitis.",
        price: "Consultar precio",
      },
      {
        name: "Láser Lipolítico No Invasivo (Hipoláser)",
        desc: "Reduce medidas y grasa localizada con tecnología láser indolora.",
        price: "Consultar precio",
      },
      {
        name: "Martillo Vibrador Corporal",
        desc: "Favorece el drenaje linfático y la relajación muscular.",
        price: "Consultar precio",
      },
      {
        name: "Vacuum con Copas para Glúteos",
        desc: "Levanta y tonifica de manera natural, mejorando la firmeza.",
        price: "Consultar precio",
      },
      {
        name: "Aplicación de Enzimas Reductoras",
        desc: "Tratamiento estético para eliminar grasa localizada y moldear la figura.",
        price: "Consultar precio",
      },
      {
        name: "Mesoterapia Reductora",
        desc: "Tratamiento localizado que ayuda a reducir grasa y mejorar la silueta.",
        price: "Consultar precio",
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
        price: "Consultar precio",
      },
      {
        name: "Limpieza Facial Profunda",
        desc: "Elimina impurezas, puntos negros y células muertas para una piel radiante.",
        price: "Consultar precio",
      },
      {
        name: "Hidratación Facial con Ácido Hialurónico",
        desc: "Rellena y revitaliza la piel con hidratación profunda de larga duración.",
        price: "Consultar precio",
      },
      {
        name: "Radiofrecuencia Facial",
        desc: "Reafirma y rejuvenece la piel estimulando la producción de colágeno.",
        price: "Consultar precio",
      },
      {
        name: "Peeling Químico",
        desc: "Renueva la piel, reduce manchas y mejora la textura con ácidos especializados.",
        price: "Consultar precio",
      },
      {
        name: "Microdermoabrasión",
        desc: "Exfoliación mecánica que suaviza cicatrices, líneas finas y manchas.",
        price: "Consultar precio",
      },
      {
        name: "Plasma Rico en Plaquetas (PRP Facial)",
        desc: "Regenera y rejuvenece la piel usando tus propias plaquetas.",
        price: "Consultar precio",
      },
      {
        name: "Luz Pulsada Intensa (IPL)",
        desc: "Elimina manchas, rojeces y mejora la textura de la piel.",
        price: "Consultar precio",
      },
      {
        name: "Mesoterapia Facial",
        desc: "Vitaminas y nutrientes inyectados para revitalizar y rejuvenecer el rostro.",
        price: "Consultar precio",
      },
      {
        name: "Toxina Botulínica (Bótox)",
        desc: "Suaviza líneas de expresión y arrugas para un aspecto más joven y natural.",
        price: "Consultar precio",
      },
    ],
  },
  {
    id: "medicina",
    label: "Medicina",
    icon: Syringe,
    color: "#8E6B8E",
    services: [
      {
        name: "Relleno de Ácido Hialurónico (Russian Lips)",
        desc: "Labios más definidos, naturales y armoniosos.",
        price: "Consultar precio",
      },
      {
        name: "Rellenos Faciales",
        desc: "Restaura volumen y suaviza líneas profundas en ojeras y surcos nasogenianos.",
        price: "Consultar precio",
      },
      {
        name: "Bioestimuladores de Colágeno",
        desc: "Estimula la producción natural de colágeno para una piel más firme y joven.",
        price: "Consultar precio",
      },
    ],
  },
  {
    id: "otros",
    label: "Otros",
    icon: Droplets,
    color: "#5B8E8E",
    services: [
      {
        name: "Detox Iónico",
        desc: "Elimina toxinas y equilibra tu organismo con un baño desintoxicante.",
        price: "Consultar precio",
      },
      {
        name: "Retiro de Tatuajes con Láser",
        desc: "Tecnología avanzada para eliminar tatuajes de manera progresiva y segura.",
        price: "Consultar precio",
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
        price: "Consultar precio",
      },
    ],
  },
];

export default function ServicesSection() {
  const [activeCategory, setActiveCategory] = useState("nutricion");
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  const activeCat = categories.find((c) => c.id === activeCategory)!;

  // ─── Modal de Adquirir Servicio ─────────────────────────────────────────────
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState("");

  const purchaseMutation = trpc.servicePurchases.create.useMutation({
    onSuccess: (data) => {
      setSuccessCode(data.serviceCode);
      setIsSubmitting(false);
    },
    onError: (err) => {
      toast.error("Error al procesar: " + err.message);
      setIsSubmitting(false);
    },
  });

  const handleOpenPurchase = (serviceName: string) => {
    setSelectedService(serviceName);
    setBuyerName(""); setBuyerEmail(""); setBuyerPhone(""); setProofFile(null);
    setSuccessCode("");
    setPurchaseModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("El archivo no debe superar 5MB"); return; }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      toast.error("Solo se aceptan JPG, PNG o PDF"); return;
    }
    setProofFile(file);
  };

  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) { toast.error("Ingresa tu nombre"); return; }
    if (!buyerEmail.trim()) { toast.error("Ingresa tu correo"); return; }
    if (!proofFile) { toast.error("Sube el comprobante de pago"); return; }
    setIsSubmitting(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      purchaseMutation.mutate({
        serviceName: selectedService,
        buyerName, buyerEmail,
        buyerPhone: buyerPhone || undefined,
        proofData: base64,
        proofMimeType: proofFile.type,
      });
    };
    reader.readAsDataURL(proofFile);
  };

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
              className="group bg-white border border-[#1A1A1A]/5 hover:border-[#C5A55A]/30 transition-all duration-400 hover:shadow-lg hover:shadow-[#C5A55A]/5 flex flex-col"
            >
              {/* Card body */}
              <div className="p-6 flex-1">
                <h4 className="font-serif text-lg text-[#1A1A1A] leading-snug group-hover:text-[#C5A55A] transition-colors duration-300 mb-3">
                  {service.name}
                </h4>
                <p className="text-[#1A1A1A]/55 text-sm leading-relaxed">
                  {service.desc}
                </p>
              </div>

              {/* Card footer with buttons */}
              <div className="px-6 pb-5 pt-2 border-t border-[#1A1A1A]/5 flex gap-2">
                <a
                  href={`https://wa.me/523221007799?text=${encodeURIComponent(`Hola, me gustaría pedir informes y precio sobre: ${service.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 border border-green-500 text-green-600 hover:bg-green-50 text-xs font-semibold py-2.5 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.967 1.523 9.9 9.9 0 001.563 19.231c2.693.47 5.455.082 7.978-1.125a9.9 9.9 0 00-4.57-19.629z"/>
                  </svg>
                  Precio
                </a>
                <button
                  onClick={() => handleOpenPurchase(service.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#C5A55A] hover:bg-[#B8963E] text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Adquirir
                </button>
              </div>
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

      {/* Modal de Adquirir Servicio */}
      {purchaseModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C5A55A] to-[#B8963E] p-5 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> Adquirir Servicio
                </h2>
                <p className="text-white/80 text-sm mt-0.5 line-clamp-1">{selectedService}</p>
              </div>
              <button
                onClick={() => setPurchaseModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {successCode ? (
              /* Success state */
              <div className="p-6 text-center space-y-4">
                <div className="text-5xl mb-2">🎉</div>
                <h3 className="font-bold text-xl text-[#1A1A1A]">¡Solicitud Enviada!</h3>
                <p className="text-gray-600 text-sm">
                  Tu comprobante fue recibido. El equipo de Nutriser verificará tu pago y te confirmará por correo.
                </p>
                <div className="bg-[#FAF7F2] border-2 border-[#C5A55A] rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tu código de servicio</p>
                  <p className="font-mono font-black text-xl text-[#C5A55A] tracking-widest">{successCode}</p>
                  <p className="text-xs text-gray-400 mt-2">Guarda este código como referencia</p>
                </div>
                <button
                  onClick={() => setPurchaseModal(false)}
                  className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 rounded-xl font-bold transition"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmitPurchase} className="p-5 space-y-4">
                {/* Instrucciones de pago */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                  <p className="font-bold text-amber-800 mb-2">💳 Realiza tu pago:</p>
                  <p className="text-amber-700 text-xs">Transferencia bancaria a:</p>
                  <p className="font-mono font-bold text-amber-900 mt-1 text-sm">CLABE: 002470701448743487</p>
                  <p className="text-amber-700 text-xs mt-1">Banco: Banamex · Titular: Nutriser</p>
                  <p className="text-amber-600 text-xs mt-2">Después sube tu comprobante aquí abajo.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={e => setBuyerEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={e => setBuyerPhone(e.target.value)}
                    placeholder="322 000 0000"
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]"
                  />
                </div>

                {/* Upload comprobante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comprobante de pago *</label>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#C5A55A]/50 rounded-xl cursor-pointer hover:bg-[#C5A55A]/5 transition">
                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                    {proofFile ? (
                      <div className="text-center p-3">
                        <div className="text-green-600 font-semibold text-sm">✓ {proofFile.name}</div>
                        <div className="text-gray-400 text-xs mt-1">Toca para cambiar</div>
                      </div>
                    ) : (
                      <div className="text-center p-3">
                        <Upload className="w-6 h-6 text-[#C5A55A] mx-auto mb-1" />
                        <div className="text-sm text-gray-500">Toca para subir comprobante</div>
                        <div className="text-xs text-gray-400 mt-1">JPG, PNG o PDF · máx 5MB</div>
                      </div>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !proofFile}
                  className="w-full bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                    : '✓ Enviar Comprobante'
                  }
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Recibirás confirmación por correo cuando tu pago sea verificado.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
