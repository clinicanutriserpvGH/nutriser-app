/*
 * Nutriser Tratamientos — Tienda E-commerce estilo Alibaba
 * Grid de servicios con imagen, precio, "Agregar al carrito" y "Comprar ahora"
 * Carrito flotante + checkout con comprobante de pago
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ShoppingCart, X, Plus, Minus, Trash2, Tag, CheckCircle2,
  Loader2, Copy, CheckCheck, Apple, Sparkles, Scan, Syringe,
  Droplets, ShoppingBag, Package, Star, Zap, Check, ChevronRight,
  Search, SlidersHorizontal, ArrowLeft, Upload
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import BackToSplash from "@/components/BackToSplash";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface CartItem {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  qty: number;
  imageUrl?: string | null;
  category?: string;
  isPackage?: boolean;
}

// ─── Datos de banco ───────────────────────────────────────────────────────────
const BANK_INFO = {
  bank: "Banamex",
  account: "002470701448743487",
};

// ─── Paquetes destacados ──────────────────────────────────────────────────────
const PACKAGES = [
  {
    id: "pkg-nutricion",
    name: "Paquete Nutrición",
    price: 2500,
    regularPrice: 3200,
    color: "#C5A55A",
    badge: "Más popular",
    description: "Programa completo de asesoría nutricional personalizada con seguimiento y escaneos corporales.",
    features: [
      "4 asesorías nutricionales personalizadas",
      "4 escaneos corporales",
      "10% de descuento en tratamientos corporales",
      "Acceso a seguimiento online",
    ],
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/treatment-skin-XJ43g4KtW5EEFhtHaAz4P8.webp",
    category: "nutricion",
  },
  {
    id: "pkg-reductor",
    name: "Paquete Reductor Nutriser",
    price: 4500,
    regularPrice: 6500,
    color: "#D4AF37",
    badge: "Ahorro máximo",
    description: "Paquete integral de reducción corporal: cavitaciones, radiofrecuencias y mesoterapia reductora.",
    features: [
      "4 asesorías nutricionales personalizadas",
      "4 sesiones de Cavitación corporal",
      "4 sesiones de Radiofrecuencia corporal",
      "4 sesiones de Mesoterapia reductora",
      "10% de descuento en tratamientos faciales",
      "10% de descuento en compra de productos",
    ],
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/treatment-body-PRmqUazejmzzNeWyLfBRaw.webp",
    category: "corporales",
  },
];

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  nutricion: { label: "Nutrición", icon: Apple, color: "#6B8E5B" },
  corporales: { label: "Corporales", icon: Sparkles, color: "#C5A55A" },
  faciales: { label: "Faciales", icon: Scan, color: "#D4A0A0" },
  medicina: { label: "Medicina", icon: Syringe, color: "#8E6B8E" },
  otros: { label: "Otros", icon: Droplets, color: "#5B8E8E" },
  productos: { label: "Productos", icon: ShoppingBag, color: "#C5855A" },
  general: { label: "General", icon: Package, color: "#888" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" onClick={handleCopy}
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${copied ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-[#C5A55A]/15 text-[#C5A55A] border border-[#C5A55A]/30 hover:bg-[#C5A55A]/25'}`}>
      {copied ? <><CheckCheck className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Memberships() {
  const [, navigate] = useLocation();

  // ─── Carrito ────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = (item: Omit<CartItem, "qty">) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    toast.success(`"${item.name}" agregado al carrito`, { duration: 2000 });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  // ─── Servicios desde DB ─────────────────────────────────────────────────────
  const { data: services = [], isLoading } = trpc.services.list.useQuery();

  // ─── Filtros ────────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const catSet = new Set<string>();
    services.forEach(s => { if (s.category) catSet.add(s.category); });
    return Array.from(catSet);
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchCat = activeCategory === "all" || s.category === activeCategory;
      const matchSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, activeCategory, searchQuery]);

  // ─── Checkout ───────────────────────────────────────────────────────────────
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountValidating, setDiscountValidating] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{ valid: boolean; discount: number | null; isGift: boolean; isTwoForOne: boolean; description: string | null } | null>(null);

  const utils = trpc.useUtils();
  const purchaseMutation = trpc.servicePurchases.create.useMutation({
    onSuccess: () => { setSuccessCode("PENDIENTE"); setIsSubmitting(false); },
    onError: (err) => { toast.error("Error: " + err.message); setIsSubmitting(false); },
  });
  const membershipMutation = trpc.memberships.create.useMutation({
    onSuccess: () => { setSuccessCode("PENDIENTE"); setIsSubmitting(false); },
    onError: (err) => { toast.error("Error: " + err.message); setIsSubmitting(false); },
  });

  const checkoutItems = buyNowItem ? [buyNowItem] : cart;
  const checkoutTotal = checkoutItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discountedTotal = discountInfo?.valid && discountInfo.discount
    ? Math.round(checkoutTotal * (1 - discountInfo.discount / 100))
    : discountInfo?.isGift ? 0 : checkoutTotal;

  const openCheckout = (item?: CartItem) => {
    setBuyNowItem(item || null);
    setBuyerName(""); setBuyerEmail(""); setBuyerPhone("");
    setProofFile(null); setSuccessCode(""); setDiscountCode(""); setDiscountInfo(null);
    setCheckoutOpen(true);
  };

  const handleValidateDiscount = async () => {
    const code = discountCode.trim();
    if (!code) { toast.error("Ingresa un código"); return; }
    setDiscountValidating(true);
    try {
      const result = await utils.discountCodes.validate.fetch({ code });
      if (result) {
        setDiscountInfo(result);
        if (result.valid) {
          if (result.isTwoForOne) toast.success("¡Código 2x1 aplicado!");
          else if (result.isGift) toast.success("¡Código de regalo aplicado!");
          else toast.success(`¡${result.discount}% de descuento aplicado!`);
        } else toast.error("Código inválido o no está activo.");
      }
    } catch { toast.error("Error al validar el código."); }
    finally { setDiscountValidating(false); }
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) { toast.error("Ingresa tu nombre"); return; }
    if (!buyerEmail.trim()) { toast.error("Ingresa tu correo"); return; }
    if (!buyerPhone.trim()) { toast.error("Ingresa tu teléfono"); return; }
    if (!proofFile) { toast.error("Sube el comprobante de pago"); return; }
    setIsSubmitting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      // Si es un paquete, usar memberships.create; si es servicio, usar servicePurchases.create
      const firstItem = checkoutItems[0];
      const itemNames = checkoutItems.map(i => `${i.qty}x ${i.name}`).join(", ");
      if (firstItem?.isPackage) {
        // Para paquetes: usar servicePurchases.create (acepta proofData directamente)
        purchaseMutation.mutate({
          serviceName: firstItem.name,
          buyerName,
          buyerEmail,
          buyerPhone,
          proofData: base64,
          proofMimeType: proofFile.type,
          discountCode: discountInfo?.valid ? discountCode.trim() : undefined,
          discountPercent: discountInfo?.valid ? (discountInfo.discount ?? 0) : undefined,
          originalPrice: `$${firstItem.price.toLocaleString('es-MX')} MXN`,
        });
      } else {
        purchaseMutation.mutate({
          serviceName: itemNames,
          buyerName,
          buyerEmail,
          buyerPhone,
          proofData: base64,
          proofMimeType: proofFile.type,
          discountCode: discountInfo?.valid ? discountCode.trim() : undefined,
          discountPercent: discountInfo?.valid ? (discountInfo.discount ?? 0) : undefined,
          originalPrice: `$${checkoutTotal.toLocaleString('es-MX')} MXN`,
        });
      }
    };
    reader.readAsDataURL(proofFile);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F1E8]" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 3.5rem)' }}>
      <BackToSplash />

      {/* ── Carrito flotante ── */}
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-4 z-40 bg-[#C5A55A] text-black rounded-full w-14 h-14 flex items-center justify-center shadow-xl shadow-[#C5A55A]/40 hover:bg-[#B8963E] transition-all active:scale-95"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        </button>
      )}

      {/* ── Header de la tienda ── */}
      <div className="bg-[#1A1A1A] text-white px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[#C5A55A] text-xs tracking-widest uppercase font-semibold">Aesthetic & Nutrition</p>
              <h1 className="text-2xl font-bold">Nutriser Tratamientos</h1>
            </div>
            <button onClick={() => setCartOpen(true)} className="relative p-2">
              <ShoppingCart className="w-6 h-6 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C5A55A] text-black text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Buscar tratamientos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#C5A55A]/60"
            />
          </div>
        </div>
      </div>

      {/* ── Filtros de categoría ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === "all" ? "bg-[#C5A55A] text-black" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveCategory("packages")}
              className={`flex-shrink-0 flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === "packages" ? "bg-[#C5A55A] text-black" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Star className="w-3 h-3" /> Paquetes
            </button>
            {categories.map(cat => {
              const meta = CATEGORY_META[cat] ?? { label: cat, icon: Package };
              const Icon = meta.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === cat ? "bg-[#C5A55A] text-black" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  <Icon className="w-3 h-3" />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-5 pb-28">

        {/* ── Paquetes Destacados ── */}
        {(activeCategory === "all" || activeCategory === "packages") && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-[#C5A55A] fill-[#C5A55A]" />
              <h2 className="font-bold text-[#1A1A1A] text-base">Paquetes Especiales</h2>
              <span className="text-xs text-gray-400">— Mayor ahorro</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PACKAGES.map(pkg => {
                const savings = pkg.regularPrice - pkg.price;
                const savingsPct = Math.round((savings / pkg.regularPrice) * 100);
                return (
                  <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden shadow-md border border-[#C5A55A]/20 relative">
                    {/* Badge */}
                    <div className="absolute top-3 left-3 z-10 bg-[#C5A55A] text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                      {pkg.badge}
                    </div>
                    <div className="absolute top-3 right-3 z-10 bg-green-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                      -{savingsPct}%
                    </div>
                    {/* Imagen */}
                    <div className="h-44 overflow-hidden">
                      <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                    </div>
                    {/* Info */}
                    <div className="p-4">
                      <p className="text-[10px] text-[#C5A55A] font-semibold uppercase tracking-wider mb-1">Paquete Especial</p>
                      <h3 className="font-bold text-[#1A1A1A] text-base leading-snug mb-1">{pkg.name}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed mb-3">{pkg.description}</p>
                      {/* Precio */}
                      <div className="flex items-end gap-2 mb-1">
                        <span className="text-2xl font-black text-[#C5A55A]">${pkg.price.toLocaleString('es-MX')}</span>
                        <span className="text-xs text-gray-400 mb-1">MXN</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-400 line-through">${pkg.regularPrice.toLocaleString('es-MX')} MXN</span>
                        <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                          Ahorras ${savings.toLocaleString('es-MX')} MXN
                        </span>
                      </div>
                      {/* Features */}
                      <ul className="space-y-1 mb-4">
                        {pkg.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-[#C5A55A] mt-0.5 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                        {pkg.features.length > 3 && (
                          <li className="text-xs text-[#C5A55A] font-semibold pl-4">+{pkg.features.length - 3} beneficios más</li>
                        )}
                      </ul>
                      {/* Botones */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart({ id: pkg.id, name: pkg.name, price: pkg.price, priceLabel: `$${pkg.price.toLocaleString('es-MX')} MXN`, imageUrl: pkg.imageUrl, category: pkg.category, isPackage: true })}
                          className="flex-1 flex items-center justify-center gap-1.5 border-2 border-[#C5A55A] text-[#C5A55A] font-bold text-xs py-2.5 rounded-xl hover:bg-[#C5A55A]/10 transition-all active:scale-95"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Al carrito
                        </button>
                        <button
                          onClick={() => openCheckout({ id: pkg.id, name: pkg.name, price: pkg.price, priceLabel: `$${pkg.price.toLocaleString('es-MX')} MXN`, qty: 1, imageUrl: pkg.imageUrl, category: pkg.category, isPackage: true })}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-[#C5A55A] text-black font-bold text-xs py-2.5 rounded-xl hover:bg-[#B8963E] transition-all active:scale-95 shadow-md shadow-[#C5A55A]/30"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Comprar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Servicios Individuales ── */}
        {activeCategory !== "packages" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                <h2 className="font-bold text-[#1A1A1A] text-base">
                  {activeCategory === "all" ? "Todos los Servicios" : (CATEGORY_META[activeCategory]?.label ?? activeCategory)}
                </h2>
              </div>
              {!isLoading && (
                <span className="text-xs text-gray-400">{filteredServices.length} servicios</span>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" />
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No se encontraron servicios</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredServices.map(service => {
                  const catMeta = CATEGORY_META[service.category ?? "general"] ?? CATEGORY_META.general;
                  const CatIcon = catMeta.icon;
                  // Extraer precio numérico si existe
                  const priceNum = service.price ? parseInt(service.price.replace(/[^0-9]/g, "")) : null;
                  return (
                    <div key={service.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-md hover:border-[#C5A55A]/30 transition-all">
                      {/* Imagen */}
                      <div className="relative h-32 bg-gray-50 overflow-hidden">
                        {service.imageUrl ? (
                          <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: `${catMeta.color}15` }}>
                            <CatIcon className="w-10 h-10 opacity-30" style={{ color: catMeta.color }} />
                          </div>
                        )}
                        {/* Badge categoría */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm">
                          <CatIcon className="w-2.5 h-2.5" style={{ color: catMeta.color }} />
                          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: catMeta.color }}>
                            {catMeta.label}
                          </span>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-bold text-[#1A1A1A] text-xs leading-snug mb-1 line-clamp-2">{service.name}</h3>
                        {service.description && (
                          <p className="text-gray-400 text-[10px] leading-relaxed line-clamp-2 mb-2">{service.description}</p>
                        )}
                        {/* Precio */}
                        <div className="mt-auto">
                          {service.price ? (
                            <p className="text-[#C5A55A] font-black text-sm mb-2">{service.price}</p>
                          ) : (
                            <p className="text-gray-400 text-xs mb-2">Consultar precio</p>
                          )}
                          {/* Botones */}
                          <div className="flex flex-col gap-1.5">
                            <button
                              onClick={() => addToCart({
                                id: `svc-${service.id}`,
                                name: service.name,
                                price: priceNum ?? 0,
                                priceLabel: service.price ?? "Consultar",
                                imageUrl: service.imageUrl,
                                category: service.category ?? "general",
                                isPackage: false,
                              })}
                              className="w-full flex items-center justify-center gap-1 border border-[#C5A55A] text-[#C5A55A] font-bold text-[10px] py-1.5 rounded-lg hover:bg-[#C5A55A]/10 transition-all active:scale-95"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              Agregar al carrito
                            </button>
                            <button
                              onClick={() => {
                                if (priceNum && priceNum > 0) {
                                  openCheckout({ id: `svc-${service.id}`, name: service.name, price: priceNum, priceLabel: service.price ?? "", qty: 1, imageUrl: service.imageUrl, category: service.category ?? "general", isPackage: false });
                                } else {
                                  window.open(`https://wa.me/523221007799?text=${encodeURIComponent(`Hola, me gustaría comprar: ${service.name}`)}`, "_blank");
                                }
                              }}
                              className="w-full flex items-center justify-center gap-1 bg-[#C5A55A] text-black font-bold text-[10px] py-1.5 rounded-lg hover:bg-[#B8963E] transition-all active:scale-95"
                            >
                              <Zap className="w-3 h-3" />
                              Comprar ahora
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL DEL CARRITO
      ══════════════════════════════════════════════════════════════════════ */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-sm bg-white h-full overflow-y-auto flex flex-col shadow-2xl">
            {/* Header */}
            <div className="bg-[#1A1A1A] text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#C5A55A]" />
                <span className="font-bold">Mi Carrito</span>
                <span className="bg-[#C5A55A] text-black text-xs font-black px-2 py-0.5 rounded-full">{cartCount}</span>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-semibold">Tu carrito está vacío</p>
                <p className="text-sm mt-1">Agrega servicios o paquetes para continuar</p>
                <button onClick={() => setCartOpen(false)} className="mt-6 bg-[#C5A55A] text-black font-bold px-6 py-2.5 rounded-xl text-sm">
                  Explorar servicios
                </button>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-[#C5A55A]/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-[#C5A55A]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#1A1A1A] leading-snug line-clamp-2">{item.name}</p>
                        <p className="text-[#C5A55A] font-black text-sm mt-0.5">
                          {item.price > 0 ? `$${(item.price * item.qty).toLocaleString('es-MX')} MXN` : item.priceLabel}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition">
                            <Plus className="w-3 h-3" />
                          </button>
                          <button onClick={() => removeFromCart(item.id)} className="ml-auto p-1 text-red-400 hover:text-red-600 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer del carrito */}
                <div className="border-t border-gray-100 p-4 flex-shrink-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Total estimado</span>
                    <span className="text-xl font-black text-[#C5A55A]">${cartTotal.toLocaleString('es-MX')} MXN</span>
                  </div>
                  <button
                    onClick={() => { setCartOpen(false); openCheckout(); }}
                    className="w-full bg-[#C5A55A] text-black font-black py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#B8963E] transition active:scale-95 shadow-lg shadow-[#C5A55A]/30"
                  >
                    <Zap className="w-4 h-4" />
                    Proceder al pago
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setCartOpen(false)} className="w-full border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                    Seguir comprando
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL DE CHECKOUT
      ══════════════════════════════════════════════════════════════════════ */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl max-h-[95vh] overflow-y-auto flex flex-col rounded-t-3xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C5A55A] to-[#B8963E] p-5 flex justify-between items-center rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
              <div>
                <h2 className="text-white font-black text-lg">Finalizar Compra</h2>
                <p className="text-white/80 text-xs mt-0.5">
                  {checkoutItems.length === 1 ? checkoutItems[0].name : `${checkoutItems.length} servicios`}
                </p>
              </div>
              <button onClick={() => setCheckoutOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successCode ? (
              <div className="p-6 text-center space-y-4">
                <div className="text-5xl mb-2">✅</div>
                <h3 className="font-black text-xl text-[#1A1A1A]">¡Solicitud Enviada!</h3>
                <p className="text-gray-500 text-sm">Tu comprobante fue recibido. El equipo de Nutriser verificará tu pago.</p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">⏳ Pendiente de autorización</p>
                  <p className="text-sm text-amber-800 mt-1">Recibirás confirmación en tu correo electrónico una vez que el administrador autorice tu compra.</p>
                </div>
                <button
                  onClick={() => { setCheckoutOpen(false); setCart([]); }}
                  className="w-full bg-[#C5A55A] text-black font-black py-3 rounded-xl"
                >
                  Listo
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitCheckout} className="p-5 space-y-4">
                {/* Resumen del pedido */}
                <div className="bg-[#FAF7F2] rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resumen del pedido</p>
                  {checkoutItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 flex-1 pr-2 line-clamp-1">{item.qty > 1 ? `${item.qty}x ` : ""}{item.name}</span>
                      <span className="font-bold text-[#C5A55A] flex-shrink-0">
                        {item.price > 0 ? `$${(item.price * item.qty).toLocaleString('es-MX')}` : item.priceLabel}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-black">
                    <span>Total</span>
                    <span className="text-[#C5A55A]">${checkoutTotal.toLocaleString('es-MX')} MXN</span>
                  </div>
                </div>

                {/* Código de descuento */}
                <div className="border border-[#C5A55A]/30 rounded-xl p-4 bg-white">
                  <label className="block text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#C5A55A]" /> ¿Tienes un código de promoción?
                  </label>
                  <div className="flex gap-2">
                    <Input value={discountCode} onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountInfo(null); }} placeholder="Ej: Nutriser20" className="flex-1 text-sm" />
                    <Button type="button" onClick={handleValidateDiscount} disabled={discountValidating || !discountCode.trim()} className="bg-[#C5A55A] hover:bg-[#B8963E] text-white px-3 text-sm">
                      {discountValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                    </Button>
                  </div>
                  {discountInfo?.valid && (
                    <div className="mt-2 flex items-center gap-2 text-green-700 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {discountInfo.isGift ? "¡Regalo aplicado! Tu compra es gratis."
                          : discountInfo.isTwoForOne ? "¡2x1 aplicado!"
                          : `${discountInfo.discount}% de descuento — Total: $${discountedTotal.toLocaleString('es-MX')} MXN`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Datos del comprador */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tus datos</p>
                  <div>
                    <Label htmlFor="co-name" className="text-sm">Nombre completo *</Label>
                    <Input id="co-name" value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Tu nombre completo" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="co-email" className="text-sm">Correo electrónico *</Label>
                    <Input id="co-email" type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="tu@email.com" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="co-phone" className="text-sm">Teléfono *</Label>
                    <Input id="co-phone" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="+52 322..." required className="mt-1" />
                  </div>
                </div>

                {/* Datos bancarios */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Datos para transferencia</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-600">Banco: <span className="font-bold">{BANK_INFO.bank}</span></p>
                      <p className="text-xs text-blue-600">CLABE: <span className="font-bold font-mono">{BANK_INFO.account}</span></p>
                    </div>
                    <CopyButton text={BANK_INFO.account} />
                  </div>
                  <p className="text-xs text-blue-500">Monto a transferir: <span className="font-black">${(discountInfo?.isGift ? 0 : discountedTotal).toLocaleString('es-MX')} MXN</span></p>
                </div>

                {/* Comprobante */}
                <div>
                  <Label className="text-sm">Comprobante de pago *</Label>
                  <label className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-[#C5A55A]/40 rounded-xl p-5 cursor-pointer hover:border-[#C5A55A] hover:bg-[#C5A55A]/5 transition-all">
                    {proofFile ? (
                      <div className="text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-green-700">{proofFile.name}</p>
                        <p className="text-xs text-gray-400">Toca para cambiar</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-[#C5A55A]/50 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-gray-600">Subir comprobante</p>
                        <p className="text-xs text-gray-400">JPG, PNG o PDF — máx. 5MB</p>
                      </div>
                    )}
                    <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) { toast.error("Máximo 5MB"); return; }
                      setProofFile(file);
                    }} />
                  </label>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-black font-black py-3.5 text-base rounded-xl shadow-lg shadow-[#C5A55A]/30">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar comprobante y confirmar pedido"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
