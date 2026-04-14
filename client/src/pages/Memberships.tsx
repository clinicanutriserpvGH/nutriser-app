/*
 * Nutriser Shop — Tienda Unificada
 * Tabs: Tratamientos (servicios + paquetes) | Farmacy (productos) | Library (ebooks)
 * Carrito unificado · Checkout con comprobante · Estilo Alibaba
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
  Search, ArrowLeft, Upload, BookOpen, FlaskConical,
} from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import BackToSplash from "@/components/BackToSplash";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import NutriserAuthModal from "@/components/NutriserAuthModal";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type StoreTab = "tratamientos" | "farmacy" | "library";

interface CartItem {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  qty: number;
  imageUrl?: string | null;
  category?: string;
  itemType: "service" | "package" | "product" | "ebook";
  // para productos
  productId?: number;
  // para ebooks
  ebookId?: number;
}

// ─── Datos bancarios ──────────────────────────────────────────────────────────
const BANK_INFO = { bank: "Banamex", account: "002470701448743487" };

// ─── Paquetes destacados (hardcoded, igual que antes) ─────────────────────────
const PACKAGES = [
  {
    id: "pkg-nutricion",
    name: "Paquete Nutrición",
    price: 2500,
    regularPrice: 3200,
    badge: "Más popular",
    description: "Programa completo de asesoría nutricional personalizada con seguimiento y escaneos corporales.",
    features: [
      "4 asesorías nutricionales personalizadas",
      "4 escaneos corporales",
      "10% de descuento en tratamientos corporales",
      "Acceso a seguimiento online",
    ],
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/paquete-nutricion-iZYFQemGqyUBv8zktgvgAM.webp",
    category: "nutricion",
  },
  {
    id: "pkg-reductor",
    name: "Paquete Reductor Nutriser",
    price: 4500,
    regularPrice: 6500,
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
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/paquete-reductor-ZsAtHwV2VSTjMf52QKYuRC.webp",
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

const CATEGORY_ORDER = ["nutricion", "corporales", "faciales", "medicina", "otros", "productos", "general"];

// ─── CopyButton ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement("textarea");
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" onClick={handleCopy}
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${copied ? "bg-green-100 text-green-700 border border-green-300" : "bg-[#C5A55A]/15 text-[#C5A55A] border border-[#C5A55A]/30 hover:bg-[#C5A55A]/25"}`}>
      {copied ? <><CheckCheck className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Memberships() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<StoreTab>("tratamientos");

  // ─── Sesión unificada ────────────────────────────────────────────────
  const { patient, isLoggedIn, logout } = usePatientAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState<Omit<CartItem, "qty"> | null>(null);



  // ─── Carrito unificado ──────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = (item: Omit<CartItem, "qty">) => {
    // Requerir login antes de agregar al carrito
    if (!isLoggedIn) {
      setPendingCartItem(item);
      setShowAuthModal(true);
      return;
    }
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    toast.success(`"${item.name}" agregado al carrito`, { duration: 2000 });
  };

  // Cuando el usuario se loguea, agregar el item pendiente al carrito
  const handleAuthSuccess = (_patient?: any) => {
    if (pendingCartItem) {
      setCart(prev => {
        const existing = prev.find(c => c.id === pendingCartItem.id);
        if (existing) return prev.map(c => c.id === pendingCartItem.id ? { ...c, qty: c.qty + 1 } : c);
        return [...prev, { ...pendingCartItem, qty: 1 }];
      });
      toast.success(`"${pendingCartItem.name}" agregado al carrito`, { duration: 2000 });
      setPendingCartItem(null);
    }
    setShowAuthModal(false);
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  };

  // ─── Datos de la DB ─────────────────────────────────────────────────────────
  const { data: services = [], isLoading: loadingServices } = trpc.services.list.useQuery();
  const { data: products = [], isLoading: loadingProducts } = trpc.products.list.useQuery();
  const { data: ebook, isLoading: loadingEbook } = trpc.ebook.getActive.useQuery();

  // ─── Filtros Tratamientos ───────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const sortedCategories = useMemo(() => {
    const catSet = new Set<string>();
    services.forEach(s => { if (s.category) catSet.add(s.category); });
    const ordered = CATEGORY_ORDER.filter(c => catSet.has(c));
    catSet.forEach(c => { if (!CATEGORY_ORDER.includes(c)) ordered.push(c); });
    return ordered;
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchCat = activeCategory === "all" || activeCategory === "packages" || s.category === activeCategory;
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
  // Pre-llenar datos del checkout con la sesión activa
  useEffect(() => {
    if (patient) {
      setBuyerName(patient.name || "");
      setBuyerEmail(patient.email || "");
      setBuyerPhone((patient as any).phone || "");
    }
  }, [patient?.id]);

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountValidating, setDiscountValidating] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{
    valid: boolean; discount: number | null; isGift: boolean; isTwoForOne: boolean; description: string | null;
  } | null>(null);

  const utils = trpc.useUtils();
  const servicePurchaseMutation = trpc.servicePurchases.create.useMutation({
    onSuccess: () => { setSuccessCode("PENDIENTE"); setIsSubmitting(false); },
    onError: (err) => { toast.error("Error: " + err.message); setIsSubmitting(false); },
  });
  const productPurchaseMutation = trpc.productPurchases.create.useMutation({
    onSuccess: (data) => { setSuccessCode(data.purchaseCode); setIsSubmitting(false); },
    onError: (err) => { toast.error("Error: " + err.message); setIsSubmitting(false); },
  });
  const ebookPurchaseMutation = trpc.ebook.purchase.useMutation({
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
      const firstItem = checkoutItems[0];
      const itemNames = checkoutItems.map(i => `${i.qty}x ${i.name}`).join(", ");

      if (firstItem?.itemType === "product" && firstItem.productId) {
        productPurchaseMutation.mutate({
          productId: firstItem.productId,
          productName: firstItem.name,
          buyerName, buyerEmail,
          buyerPhone: buyerPhone || undefined,
          quantity: firstItem.qty,
          proofData: base64,
          proofMimeType: proofFile.type,
        });
      } else if (firstItem?.itemType === "ebook" && firstItem.ebookId) {
        ebookPurchaseMutation.mutate({
          ebookId: firstItem.ebookId,
          buyerName, buyerEmail,
          proofBase64: base64,
          discountCode: discountInfo?.valid ? discountCode.trim() : undefined,
        });
      } else {
        // servicios y paquetes
        servicePurchaseMutation.mutate({
          serviceName: itemNames,
          buyerName, buyerEmail, buyerPhone,
          proofData: base64,
          proofMimeType: proofFile.type,
          discountCode: discountInfo?.valid ? discountCode.trim() : undefined,
          discountPercent: discountInfo?.valid ? (discountInfo.discount ?? 0) : undefined,
          originalPrice: `$${checkoutTotal.toLocaleString("es-MX")} MXN`,
        });
      }
    };
    reader.readAsDataURL(proofFile);
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F1E8]" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 3.5rem)" }}>
      <BackToSplash />

      {/* Modal de autenticación unificada */}
      <NutriserAuthModal
        isOpen={showAuthModal}
        onClose={() => { setShowAuthModal(false); setPendingCartItem(null); }}
        onSuccess={handleAuthSuccess}
        contextMessage="Necesitas una cuenta para agregar productos al carrito y realizar compras."
      />

      {/* ── Carrito flotante ── */}
      {cartCount > 0 && (
        <button onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-4 z-40 bg-[#C5A55A] text-black rounded-full w-14 h-14 flex items-center justify-center shadow-xl shadow-[#C5A55A]/40 hover:bg-[#B8963E] transition-all active:scale-95">
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
        </button>
      )}

      {/* ── Header ── */}
      <div className="bg-[#1A1A1A] text-white px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[#C5A55A] text-xs tracking-widest uppercase font-semibold">Aesthetic & Nutrition</p>
              <h1 className="text-2xl font-bold">Nutriser Shop</h1>
              {/* Bienvenida con nombre del usuario */}
              {isLoggedIn && patient ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/60">Hola,</span>
                  <span className="text-xs text-[#C5A55A] font-semibold">{patient.name}</span>
                  <button onClick={logout} className="text-[10px] text-white/30 hover:text-white/60 transition-colors ml-1">(Cerrar sesión)</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="mt-1 text-xs text-[#C5A55A] hover:text-[#D4B46A] transition-colors flex items-center gap-1"
                >
                  <span>👤</span> Iniciar sesión
                </button>
              )}
            </div>
            <button onClick={() => setCartOpen(true)} className="relative p-2">
              <ShoppingCart className="w-6 h-6 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C5A55A] text-black text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
              )}
            </button>
          </div>
          {/* Buscador solo en tratamientos */}
          {activeTab === "tratamientos" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="text" placeholder="Buscar tratamientos..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#C5A55A]/60" />
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs principales ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {([
              { id: "tratamientos", label: "Tratamientos", icon: Sparkles },
              { id: "farmacy", label: "Farmacy", icon: FlaskConical },
              { id: "library", label: "Library", icon: BookOpen },
            ] as { id: StoreTab; label: string; icon: React.ElementType }[]).map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? "bg-[#C5A55A] text-black shadow-md shadow-[#C5A55A]/30" : "text-gray-500 hover:bg-gray-100"}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: TRATAMIENTOS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "tratamientos" && (
        <>
          {/* Filtros de categoría */}
          <div className="bg-white border-b border-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex gap-2 overflow-x-auto py-2.5 scrollbar-hide">
                <button onClick={() => setActiveCategory("all")}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === "all" ? "bg-[#C5A55A] text-black" : "bg-gray-100 text-gray-600"}`}>
                  Todos
                </button>
                <button onClick={() => setActiveCategory("packages")}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === "packages" ? "bg-[#C5A55A] text-black" : "bg-gray-100 text-gray-600"}`}>
                  <Star className="w-3 h-3" /> Paquetes
                </button>
                {sortedCategories.map(cat => {
                  const meta = CATEGORY_META[cat] ?? { label: cat, icon: Package, color: "#888" };
                  const Icon = meta.icon;
                  return (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === cat ? "bg-[#C5A55A] text-black" : "bg-gray-100 text-gray-600"}`}>
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-3 py-5 pb-28">
            {/* Paquetes Especiales */}
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
                        <div className="absolute top-3 left-3 z-10 bg-[#C5A55A] text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow">{pkg.badge}</div>
                        <div className="absolute top-3 right-3 z-10 bg-green-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">-{savingsPct}%</div>
                        <div className="h-44 overflow-hidden">
                          <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <p className="text-[10px] text-[#C5A55A] font-semibold uppercase tracking-wider mb-1">Paquete Especial</p>
                          <h3 className="font-bold text-[#1A1A1A] text-base leading-snug mb-1">{pkg.name}</h3>
                          <p className="text-gray-500 text-xs leading-relaxed mb-3">{pkg.description}</p>
                          <div className="flex items-end gap-2 mb-1">
                            <span className="text-2xl font-black text-[#C5A55A]">${pkg.price.toLocaleString("es-MX")}</span>
                            <span className="text-xs text-gray-400 mb-1">MXN</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-gray-400 line-through">${pkg.regularPrice.toLocaleString("es-MX")} MXN</span>
                            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Ahorras ${savings.toLocaleString("es-MX")} MXN</span>
                          </div>
                          <ul className="space-y-1 mb-4">
                            {pkg.features.slice(0, 3).map((f, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                                <Check className="w-3 h-3 text-[#C5A55A] mt-0.5 flex-shrink-0" />{f}
                              </li>
                            ))}
                            {pkg.features.length > 3 && <li className="text-xs text-[#C5A55A] font-semibold pl-4">+{pkg.features.length - 3} beneficios más</li>}
                          </ul>
                          <div className="flex gap-2">
                            <button onClick={() => addToCart({ id: pkg.id, name: pkg.name, price: pkg.price, priceLabel: `$${pkg.price.toLocaleString("es-MX")} MXN`, imageUrl: pkg.imageUrl, category: pkg.category, itemType: "package" })}
                              className="flex-1 flex items-center justify-center gap-1.5 border-2 border-[#C5A55A] text-[#C5A55A] font-bold text-xs py-2.5 rounded-xl hover:bg-[#C5A55A]/10 transition-all active:scale-95">
                              <ShoppingCart className="w-3.5 h-3.5" /> Al carrito
                            </button>
                            <button onClick={() => openCheckout({ id: pkg.id, name: pkg.name, price: pkg.price, priceLabel: `$${pkg.price.toLocaleString("es-MX")} MXN`, qty: 1, imageUrl: pkg.imageUrl, category: pkg.category, itemType: "package" })}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-[#C5A55A] text-black font-bold text-xs py-2.5 rounded-xl hover:bg-[#B8963E] transition-all active:scale-95 shadow-md shadow-[#C5A55A]/30">
                              <Zap className="w-3.5 h-3.5" /> Comprar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Servicios individuales */}
            {activeCategory !== "packages" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[#1A1A1A] text-base">
                    {activeCategory === "all" ? "Todos los Servicios" : (CATEGORY_META[activeCategory]?.label ?? activeCategory)}
                  </h2>
                  {!loadingServices && <span className="text-xs text-gray-400">{filteredServices.length} servicios</span>}
                </div>
                {loadingServices ? (
                  <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" /></div>
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
                      const priceNum = service.price ? parseInt(service.price.replace(/[^0-9]/g, "")) : null;
                      return (
                        <div key={service.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-md hover:border-[#C5A55A]/30 transition-all">
                          <div className="relative h-32 bg-gray-50 overflow-hidden">
                            {service.imageUrl ? (
                              <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: `${catMeta.color}15` }}>
                                <CatIcon className="w-10 h-10 opacity-30" style={{ color: catMeta.color }} />
                              </div>
                            )}
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm">
                              <CatIcon className="w-2.5 h-2.5" style={{ color: catMeta.color }} />
                              <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: catMeta.color }}>{catMeta.label}</span>
                            </div>
                          </div>
                          <div className="p-3 flex-1 flex flex-col">
                            <h3 className="font-bold text-[#1A1A1A] text-xs leading-snug mb-1 line-clamp-2">{service.name}</h3>
                            {service.description && <p className="text-gray-400 text-[10px] leading-relaxed line-clamp-2 mb-2">{service.description}</p>}
                            <div className="mt-auto">
                              {service.price ? (
                                <p className="text-[#C5A55A] font-black text-sm mb-2">{service.price}</p>
                              ) : (
                                <p className="text-gray-400 text-xs mb-2">Consultar precio</p>
                              )}
                              <div className="flex flex-col gap-1.5">
                                <button onClick={() => addToCart({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: service.price ?? "Consultar", imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" })}
                                  className="w-full flex items-center justify-center gap-1 border border-[#C5A55A] text-[#C5A55A] font-bold text-[10px] py-1.5 rounded-lg hover:bg-[#C5A55A]/10 transition-all active:scale-95">
                                  <ShoppingCart className="w-3 h-3" /> Agregar al carrito
                                </button>
                                <button onClick={() => openCheckout({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: service.price ?? "Consultar", qty: 1, imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" })}
                                  className="w-full flex items-center justify-center gap-1 bg-[#C5A55A] text-black font-bold text-[10px] py-1.5 rounded-lg hover:bg-[#B8963E] transition-all active:scale-95">
                                  <Zap className="w-3 h-3" /> Comprar ahora
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
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: FARMACY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "farmacy" && (
        <div className="max-w-7xl mx-auto px-3 py-5 pb-28">
          <div className="flex items-center gap-2 mb-5">
            <FlaskConical className="w-5 h-5 text-[#C5A55A]" />
            <h2 className="font-bold text-[#1A1A1A] text-lg">Nutriser Farmacy</h2>
          </div>
          {loadingProducts ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-[#C5A55A]/10 flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-10 h-10 text-[#C5A55A]/40" />
              </div>
              <h3 className="font-bold text-[#1A1A1A]/50 text-xl mb-2">Próximamente</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">Estamos preparando nuestra farmacia con productos nutricionales y cosméticos de alta calidad.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map(product => {
                const priceNum = product.price ? parseInt(product.price.replace(/[^0-9]/g, "")) : null;
                return (
                  <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-md hover:border-[#C5A55A]/30 transition-all">
                    <div className="relative h-36 bg-gray-50 overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#C5A55A]/5">
                          <FlaskConical className="w-10 h-10 text-[#C5A55A]/30" />
                        </div>
                      )}
                      {product.stock !== null && product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">Últimas {product.stock}</div>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="text-[9px] text-[#C5A55A] font-semibold uppercase tracking-wider mb-0.5">{product.category || "Producto"}</p>
                      <h3 className="font-bold text-[#1A1A1A] text-xs leading-snug mb-1 line-clamp-2">{product.name}</h3>
                      {product.description && <p className="text-gray-400 text-[10px] leading-relaxed line-clamp-2 mb-2">{product.description}</p>}
                      <div className="mt-auto">
                        {product.price ? (
                          <p className="text-[#C5A55A] font-black text-sm mb-2">{product.price}</p>
                        ) : (
                          <p className="text-gray-400 text-xs mb-2">Consultar precio</p>
                        )}
                        <div className="flex flex-col gap-1.5">
                          <button onClick={() => addToCart({ id: `prd-${product.id}`, name: product.name, price: priceNum ?? 0, priceLabel: product.price ?? "Consultar", imageUrl: product.imageUrl, category: product.category ?? "general", itemType: "product", productId: product.id })}
                            className="w-full flex items-center justify-center gap-1 border border-[#C5A55A] text-[#C5A55A] font-bold text-[10px] py-1.5 rounded-lg hover:bg-[#C5A55A]/10 transition-all active:scale-95">
                            <ShoppingCart className="w-3 h-3" /> Agregar al carrito
                          </button>
                          <button onClick={() => openCheckout({ id: `prd-${product.id}`, name: product.name, price: priceNum ?? 0, priceLabel: product.price ?? "Consultar", qty: 1, imageUrl: product.imageUrl, category: product.category ?? "general", itemType: "product", productId: product.id })}
                            className="w-full flex items-center justify-center gap-1 bg-[#C5A55A] text-black font-bold text-[10px] py-1.5 rounded-lg hover:bg-[#B8963E] transition-all active:scale-95">
                            <Zap className="w-3 h-3" /> Comprar ahora
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

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: LIBRARY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "library" && (
        <div className="max-w-7xl mx-auto px-3 py-5 pb-28">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-5 h-5 text-[#C5A55A]" />
            <h2 className="font-bold text-[#1A1A1A] text-lg">Nutriser Library</h2>
          </div>
          {loadingEbook ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" /></div>
          ) : !ebook ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-[#C5A55A]/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-[#C5A55A]/40" />
              </div>
              <h3 className="font-bold text-[#1A1A1A]/50 text-xl mb-2">Próximamente</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">Estamos preparando libros y recursos digitales exclusivos para ti.</p>
            </div>
          ) : (
            <div className="max-w-sm mx-auto">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[#C5A55A]/20">
                {ebook.coverUrl && (
                  <div className="bg-[#F5F1E8] flex items-center justify-center p-6">
                    <img src={ebook.coverUrl} alt={ebook.title} className="max-h-72 w-auto object-contain rounded-lg shadow-lg" />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[10px] text-[#C5A55A] font-semibold uppercase tracking-wider mb-1">eBook Digital</p>
                  <h3 className="font-bold text-[#1A1A1A] text-xl leading-snug mb-2">{ebook.title}</h3>
                  {ebook.description && <p className="text-gray-500 text-sm leading-relaxed mb-4">{ebook.description}</p>}
                  {/* presalePrice = precio de pre-compra (promoción) | price = precio original */}
                  {(ebook as any).presalePrice ? (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">Pre-compra</span>
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">Precio especial</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-[#C5A55A]">${parseFloat(String((ebook as any).presalePrice)).toLocaleString("es-MX", { minimumFractionDigits: 0 })}</span>
                        <span className="text-sm text-gray-400 mb-1">MXN</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Precio regular: <span className="line-through">${parseFloat(String(ebook.price)).toLocaleString("es-MX", { minimumFractionDigits: 0 })} MXN</span></p>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-3xl font-black text-[#C5A55A]">${parseFloat(String(ebook.price)).toLocaleString("es-MX", { minimumFractionDigits: 0 })}</span>
                      <span className="text-sm text-gray-400 mb-1">MXN</span>
                    </div>
                  )}
                  {ebook.comingSoon ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                      <p className="text-amber-700 font-bold text-sm">Próximamente disponible</p>
                      <p className="text-amber-600 text-xs mt-1">Suscríbete para recibir notificación de lanzamiento</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => addToCart({
                        id: `ebook-${ebook.id}`, name: ebook.title,
                        price: (ebook as any).presalePrice ? parseFloat(String((ebook as any).presalePrice)) : (parseFloat(String(ebook.price)) || 0),
                        priceLabel: `$${((ebook as any).presalePrice ? parseFloat(String((ebook as any).presalePrice)) : parseFloat(String(ebook.price))).toLocaleString("es-MX", { minimumFractionDigits: 0 })} MXN`, imageUrl: ebook.coverUrl,
                        category: "ebook", itemType: "ebook", ebookId: ebook.id,
                      })}
                        className="w-full flex items-center justify-center gap-2 border-2 border-[#C5A55A] text-[#C5A55A] font-bold py-3 rounded-xl hover:bg-[#C5A55A]/10 transition-all active:scale-95">
                        <ShoppingCart className="w-4 h-4" /> Agregar al carrito
                      </button>
                      <button onClick={() => openCheckout({
                        id: `ebook-${ebook.id}`, name: ebook.title,
                        price: (ebook as any).presalePrice ? parseFloat(String((ebook as any).presalePrice)) : (parseFloat(String(ebook.price)) || 0),
                        priceLabel: `$${((ebook as any).presalePrice ? parseFloat(String((ebook as any).presalePrice)) : parseFloat(String(ebook.price))).toLocaleString("es-MX", { minimumFractionDigits: 0 })} MXN`, qty: 1, imageUrl: ebook.coverUrl,
                        category: "ebook", itemType: "ebook", ebookId: ebook.id,
                      })}
                        className="w-full flex items-center justify-center gap-2 bg-[#C5A55A] text-black font-bold py-3 rounded-xl hover:bg-[#B8963E] transition-all active:scale-95 shadow-md shadow-[#C5A55A]/30">
                        <Zap className="w-4 h-4" /> Comprar ahora
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-4">Para ver el eBook completo, visita <button onClick={() => navigate("/ebook")} className="text-[#C5A55A] underline">Nutriser Library</button></p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL: CARRITO
      ══════════════════════════════════════════════════════════════════════ */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#C5A55A]" />
                <h2 className="font-bold text-[#1A1A1A]">Mi Carrito</h2>
                <span className="bg-[#C5A55A] text-black text-xs font-black px-2 py-0.5 rounded-full">{cartCount}</span>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium">Tu carrito está vacío</p>
                <p className="text-gray-300 text-sm mt-1">Agrega tratamientos, productos o libros</p>
              </div>
            ) : (
              <>
                <div className="flex-1 p-4 space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1A1A1A] text-sm leading-snug line-clamp-2">{item.name}</p>
                        <p className="text-[#C5A55A] font-black text-sm mt-0.5">{item.priceLabel}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                          <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                          <button onClick={() => removeFromCart(item.id)} className="ml-auto p-1 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100 space-y-3 sticky bottom-0 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1A1A1A]">Total</span>
                    <span className="text-xl font-black text-[#C5A55A]">${cartTotal.toLocaleString("es-MX")} MXN</span>
                  </div>
                  <button onClick={() => { setCartOpen(false); openCheckout(); }}
                    className="w-full bg-[#C5A55A] text-black font-black py-3.5 rounded-xl hover:bg-[#B8963E] transition-all active:scale-95 shadow-lg shadow-[#C5A55A]/30 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" /> Proceder al pago
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: CHECKOUT
      ══════════════════════════════════════════════════════════════════════ */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-[#1A1A1A] text-base">
                {successCode ? "¡Pedido Enviado!" : "Finalizar Compra"}
              </h2>
              <button onClick={() => setCheckoutOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            {successCode ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-[#1A1A1A] text-xl mb-2">¡Comprobante recibido!</h3>
                <p className="text-gray-500 text-sm mb-4">Tu pedido está en revisión. Te contactaremos pronto para confirmar.</p>
                <div className="bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Código de seguimiento</p>
                  <p className="font-black text-[#C5A55A] text-lg font-mono">{successCode}</p>
                </div>
                <button onClick={() => { setCheckoutOpen(false); setCart([]); }}
                  className="w-full bg-[#C5A55A] text-black font-bold py-3 rounded-xl hover:bg-[#B8963E] transition-all">
                  Listo
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitCheckout} className="p-4 space-y-5">
                {/* Resumen */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tu pedido</p>
                  {checkoutItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-[#1A1A1A] font-medium line-clamp-1 flex-1 mr-2">{item.qty}x {item.name}</span>
                      <span className="text-[#C5A55A] font-bold flex-shrink-0">{item.priceLabel}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 flex items-center justify-between font-bold">
                    <span>Total</span>
                    <span className="text-[#C5A55A]">${checkoutTotal.toLocaleString("es-MX")} MXN</span>
                  </div>
                </div>
                {/* Código de descuento */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Código de descuento</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="Ej: Nutriser20" className="pl-9" />
                    </div>
                    <Button type="button" onClick={handleValidateDiscount} disabled={discountValidating} className="bg-[#C5A55A] hover:bg-[#B8963E] text-black px-3 text-sm">
                      {discountValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                    </Button>
                  </div>
                  {discountInfo?.valid && (
                    <div className="mt-2 flex items-center gap-2 text-green-700 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{discountInfo.isGift ? "¡Regalo aplicado! Tu compra es gratis." : discountInfo.isTwoForOne ? "¡2x1 aplicado!" : `${discountInfo.discount}% de descuento — Total: $${discountedTotal.toLocaleString("es-MX")} MXN`}</span>
                    </div>
                  )}
                </div>
                {/* Datos del comprador */}
                {isLoggedIn && patient ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tus datos</p>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-green-800">{patient.name}</p>
                        <p className="text-xs text-green-700">{patient.email}</p>
                        {(patient as any).phone && <p className="text-xs text-green-600">{(patient as any).phone}</p>}
                      </div>
                    </div>
                  </div>
                ) : (
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
                )}
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
                  <p className="text-xs text-blue-500">Monto: <span className="font-black">${(discountInfo?.isGift ? 0 : discountedTotal).toLocaleString("es-MX")} MXN</span></p>
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
