/*
 * Nutriser - Services Section (Dynamic from DB)
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
  Package,
  Tag,
  CheckCircle2,
  CalendarCheck,
  Info,
} from "lucide-react";
import { serviceDescriptions } from "@/lib/serviceDescriptions";

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

  // ─── Modal de Adquirir Servicio ─────────────────────────────────────────────
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedServicePrice, setSelectedServicePrice] = useState<string>("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState("");

  // ─── Modal de Más Información ─────────────────────────────────────────────
  const [infoModal, setInfoModal] = useState(false);
  const [selectedServiceInfo, setSelectedServiceInfo] = useState<string>("");

  // ─── Código de descuento ─────────────────────────────────────────────────────
  const [discountCode, setDiscountCode] = useState("");
  const [discountValidating, setDiscountValidating] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{
    valid: boolean;
    discount: number | null;
    isGift: boolean;
    isTwoForOne: boolean;
    description: string | null;
  } | null>(null);

  const utils = trpc.useUtils();

  const handleValidateCode = async () => {
    const code = discountCode.trim();
    if (!code) { toast.error("Ingresa un código de descuento"); return; }
    setDiscountValidating(true);
    try {
      // Usar fetch directo para evitar problemas de caché con useQuery
      const result = await utils.discountCodes.validate.fetch({ code });
      if (result) {
        setDiscountInfo(result);
        if (result.valid) {
          if (result.isTwoForOne) {
            toast.success("¡Código 2x1 aplicado! Compras un servicio y obtienes uno doble.");
          } else if (result.isGift) {
            toast.success("¡Código de regalo aplicado! Tu servicio es completamente gratis.");
          } else {
            toast.success(`¡Código válido! ${result.discount}% de descuento aplicado.`);
          }
        } else {
          toast.error("Código inválido o no está activo.");
        }
      }
    } catch {
      toast.error("Error al validar el código.");
    } finally {
      setDiscountValidating(false);
    }
  };

  const purchaseMutation = trpc.servicePurchases.create.useMutation({
    onSuccess: () => {
      setSuccessCode("PENDIENTE");
      setIsSubmitting(false);
    },
    onError: (err) => {
      toast.error("Error al procesar: " + err.message);
      setIsSubmitting(false);
    },
  });

  const handleOpenPurchase = (serviceName: string, servicePrice?: string | null) => {
    setSelectedService(serviceName);
    setSelectedServicePrice(servicePrice || "");
    setBuyerName(""); setBuyerEmail(""); setBuyerPhone(""); setProofFile(null);
    setSuccessCode("");
    setDiscountCode("");
    setDiscountInfo(null);
    setPurchaseModal(true);
  };

  const handleOpenInfo = (serviceName: string) => {
    setSelectedServiceInfo(serviceName);
    setInfoModal(true);
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
        discountCode: discountInfo?.valid ? discountCode.trim() : undefined,
        discountPercent: discountInfo?.valid ? (discountInfo.discount ?? 0) : undefined,
        originalPrice: selectedServicePrice || undefined,
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
                      {/* Fila 1: Más Información + Preguntar precio */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenInfo(service.name)}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-[#C5A55A]/40 text-[#C5A55A] hover:bg-[#C5A55A]/10 text-xs font-semibold py-2.5 rounded-lg transition-colors"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Más Info
                        </button>
                        <a
                          href={`https://wa.me/523221007799?text=${encodeURIComponent(`Hola, me gustaría pedir informes y precio sobre: ${service.name}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 border border-green-500 text-green-600 hover:bg-green-50 text-xs font-semibold py-2.5 rounded-lg transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.967 1.523 9.9 9.9 0 001.563 19.231c2.693.47 5.455.082 7.978-1.125a9.9 9.9 0 00-4.57-19.629z"/>
                          </svg>
                          WhatsApp
                        </a>
                      </div>
                      {/* Fila 2: Adquirir + Agendar Cita */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPurchase(service.name, service.price)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-[#C5A55A] hover:bg-[#B8963E] text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-sm"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Adquirir
                        </button>
                        <a
                          href={`/appointment-form?service=${encodeURIComponent(service.name)}`}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-[#C5A55A]/60 text-[#C5A55A] hover:bg-[#C5A55A] hover:text-white text-xs font-bold py-2.5 rounded-lg transition-all duration-300"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          Cita
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}

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
            href="/appointment-form?service=Valoraci%C3%B3n+General"
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
                type="button"
                onClick={() => setPurchaseModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {successCode ? (
              <div className="p-6 text-center space-y-4">
                <div className="text-5xl mb-2">📋</div>
                <h3 className="font-bold text-xl text-[#1A1A1A]">¡Solicitud Enviada!</h3>
                <p className="text-gray-600 text-sm">
                  Tu comprobante fue recibido. El equipo de Nutriser verificará tu pago.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider mb-1">⏳ Pendiente de autorización</p>
                  <p className="text-sm text-amber-800 mt-1">Recibirás tu código de servicio en tu correo electrónico una vez que el administrador autorice tu compra.</p>
                </div>
                <button
                   type="button"
                   onClick={() => setPurchaseModal(false)}
                  className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 rounded-xl font-bold transition"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitPurchase} className="p-5 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                  <p className="font-bold text-amber-800 mb-2">💳 Realiza tu pago:</p>
                  <p className="text-amber-700 text-xs">Transferencia bancaria a:</p>
                  <p className="font-mono font-bold text-amber-900 mt-1 text-sm">CLABE: 002470701448743487</p>
                  <p className="text-amber-700 text-xs mt-1">Banco: Banamex</p>
                  <p className="text-amber-700 text-xs mt-1">Concepto: <span className="font-semibold">{buyerName || 'Tu nombre'}</span></p>
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

                {/* ─── Código de Descuento ─────────────────────────────── */}
                <div className="border border-[#C5A55A]/30 rounded-xl p-4 bg-[#FAF7F2]">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#C5A55A]" />
                    Código de Promoción (opcional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={e => { setDiscountCode(e.target.value); setDiscountInfo(null); }}
                      placeholder="Ej: Nutriser20"
                      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]"
                    />
                    <button
                      type="button"
                      onClick={handleValidateCode}
                      disabled={discountValidating || !discountCode.trim()}
                      className="px-3 py-2 bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
                    >
                      {discountValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                    </button>
                  </div>
                  {discountInfo && discountInfo.valid && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-green-700 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {discountInfo.isTwoForOne
                            ? "¡2x1 aplicado! Compras un servicio y obtienes uno doble."
                            : discountInfo.isGift
                            ? "¡Regalo aplicado! Tu servicio es completamente gratis."
                            : `¡Código válido! ${discountInfo.discount}% de descuento aplicado.`}
                        </span>
                      </div>
                      {selectedServicePrice && !discountInfo.isTwoForOne && (
                        <div className="bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-xl px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Precio original</p>
                            <p className="text-sm text-gray-400 line-through">{selectedServicePrice}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[#C5A55A] font-semibold mb-0.5">Tu precio con descuento</p>
                            {discountInfo.isGift ? (
                              <p className="text-xl font-black text-green-600">¡GRATIS!</p>
                            ) : (() => {
                              const numericPrice = parseFloat(selectedServicePrice.replace(/[^0-9.]/g, ''));
                              if (!isNaN(numericPrice) && discountInfo.discount) {
                                const discounted = numericPrice * (1 - discountInfo.discount / 100);
                                const currency = selectedServicePrice.match(/[^0-9.,\s]/g)?.join('') || '';
                                return <p className="text-xl font-black text-[#C5A55A]">{currency}{discounted.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>;
                              }
                              return <p className="text-sm font-bold text-[#C5A55A]">{discountInfo.discount}% OFF</p>;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {discountInfo && !discountInfo.valid && (
                    <p className="mt-2 text-red-600 text-xs">Código inválido o no está activo.</p>
                  )}
                </div>

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

      {/* Modal de Más Información */}
      {infoModal && selectedServiceInfo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C5A55A] to-[#B8963E] p-6 flex justify-between items-start rounded-t-2xl sticky top-0">
              <div className="flex-1">
                <h2 className="text-white font-bold text-2xl mb-1">{selectedServiceInfo}</h2>
                <p className="text-white/80 text-sm">Información completa del servicio</p>
              </div>
              <button
                type="button"
                onClick={() => setInfoModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {serviceDescriptions[selectedServiceInfo as keyof typeof serviceDescriptions] ? (() => {
                const desc = serviceDescriptions[selectedServiceInfo as keyof typeof serviceDescriptions];
                return (
                  <>
                    {/* Qué es */}
                    <div>
                      <h3 className="text-lg font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#C5A55A] rounded"></span>
                        ¿Qué es?
                      </h3>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">{desc.whatIs}</p>
                    </div>

                    {/* Beneficios */}
                    <div>
                      <h3 className="text-lg font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#C5A55A] rounded"></span>
                        Beneficios principales
                      </h3>
                      <ul className="space-y-2">
                        {desc.benefits.map((benefit, i) => (
                          <li key={i} className="flex gap-3 text-[#1A1A1A]/70">
                            <span className="text-[#C5A55A] font-bold flex-shrink-0 mt-0.5">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Duración */}
                    <div>
                      <h3 className="text-lg font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#C5A55A] rounded"></span>
                        Duración
                      </h3>
                      <p className="text-[#1A1A1A]/70 bg-[#FAF7F2] p-4 rounded-lg border border-[#C5A55A]/20">
                        {desc.duration}
                      </p>
                    </div>

                    {/* Cuidados */}
                    <div>
                      <h3 className="text-lg font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#C5A55A] rounded"></span>
                        Cuidados post-tratamiento
                      </h3>
                      <ul className="space-y-2">
                        {desc.care.map((care, i) => (
                          <li key={i} className="flex gap-3 text-[#1A1A1A]/70">
                            <span className="text-[#C5A55A] font-bold flex-shrink-0 mt-0.5">•</span>
                            <span>{care}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setInfoModal(false);
                          handleOpenPurchase(selectedServiceInfo, "");
                        }}
                        className="flex-1 bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Adquirir Servicio
                      </button>
                      <a
                        href={`/appointment-form?service=${encodeURIComponent(selectedServiceInfo)}`}
                        className="flex-1 border-2 border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A] hover:text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                      >
                        <CalendarCheck className="w-4 h-4" />
                        Agendar Cita
                      </a>
                    </div>
                  </>
                );
              })() : (
                <p className="text-center text-gray-500 py-8">Información no disponible para este servicio.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
