/*
 * Nutriser Shop — Rediseño limpio inspirado en apps de farmacia
 * Layout: Header con sesión + búsqueda → Categorías circulares → Grid de productos → WhatsApp flotante
 * Sesión unificada con usePatientAuth
 */
import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ShoppingBag, X, Upload, Loader2, Package, Search,
  User, LogOut, ChevronRight, ShoppingCart, MessageCircle,
} from "lucide-react";
import BackToSplash from "@/components/BackToSplash";
import NutriserAuthModal from "@/components/NutriserAuthModal";
import { usePatientAuth } from "@/hooks/usePatientAuth";

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  nutricionales: "Nutricionales",
  cosmeticos: "Cosméticos",
  suplementos: "Suplementos",
  cuidado_piel: "Cuidado de Piel",
  otros: "Otros",
};

const CATEGORY_ICONS: Record<string, string> = {
  general: "🏪",
  nutricionales: "🥗",
  cosmeticos: "✨",
  suplementos: "💊",
  cuidado_piel: "🧴",
  otros: "📦",
};

export default function Store() {
  const { patient, isLoggedIn, logout } = usePatientAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { data: products = [], isLoading } = trpc.products.list.useQuery();

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Group by category
  const categoryMap = useMemo(() => {
    const map = new Map<string, typeof products>();
    for (const p of products) {
      const cat = p.category || "general";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    }
    return map;
  }, [products]);

  const categories = useMemo(() =>
    Array.from(categoryMap.entries()).map(([id, items]) => ({
      id,
      label: CATEGORY_LABELS[id] || id,
      icon: CATEGORY_ICONS[id] || "📦",
      items,
    })),
    [categoryMap]
  );

  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Filtered products
  const filteredProducts = useMemo(() => {
    let items = activeCategory === "all" ? products : (categoryMap.get(activeCategory) || []);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    }
    return items;
  }, [activeCategory, products, categoryMap, searchQuery]);

  // ─── Modal de Compra ──────────────────────────────────────────────────────
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<(typeof products)[0] | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{ valid: boolean; discount: number | null; isGift: boolean; isTwoForOne: boolean; description: string | null } | null>(null);

  const purchaseMutation = trpc.productPurchases.create.useMutation({
    onSuccess: (data) => {
      setSuccessCode(data.purchaseCode);
      setIsSubmitting(false);
    },
    onError: (err) => {
      toast.error("Error al procesar: " + err.message);
      setIsSubmitting(false);
    },
  });

  const handleOpenPurchase = (product: (typeof products)[0]) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setSelectedProduct(product);
    // Pre-fill from session
    setBuyerName(patient?.name || "");
    setBuyerEmail(patient?.email || "");
    setBuyerPhone(patient?.phone || "");
    setQuantity(1);
    setProofFile(null);
    setSuccessCode("");
    setDiscountCode("");
    setDiscountInfo(null);
    setPurchaseModal(true);
  };

  const utils = trpc.useUtils();

  const handleValidateDiscount = async () => {
    const code = discountCode.trim();
    if (!code) return;
    try {
      const result = await utils.discountCodes.validate.fetch({ code });
      if (result?.valid) {
        setDiscountInfo({ valid: true, discount: result.discount, isGift: result.isGift ?? false, isTwoForOne: result.isTwoForOne ?? false, description: result.description ?? null });
        if (result.isTwoForOne) {
          toast.success("¡Código 2x1 aplicado!");
        } else if (result.isGift) {
          toast.success("¡Código de regalo aplicado!");
        } else {
          toast.success(`¡${result.discount}% de descuento aplicado!`);
        }
      } else {
        setDiscountInfo({ valid: false, discount: null, isGift: false, isTwoForOne: false, description: null });
        toast.error("Código inválido o no está activo.");
      }
    } catch {
      toast.error("Error al validar el código.");
    }
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
    if (!selectedProduct) return;
    setIsSubmitting(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      purchaseMutation.mutate({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        buyerName, buyerEmail,
        buyerPhone: buyerPhone || undefined,
        quantity,
        proofData: base64,
        proofMimeType: proofFile.type,
      });
    };
    reader.readAsDataURL(proofFile);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* ─── Top Bar ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        {/* Back + Brand + User */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <BackToSplash />
          <div className="flex-1 text-center">
            <h1 className="font-serif text-lg font-bold text-[#1A1A1A]">
              Nutriser <span className="text-[#C5A55A]">Shop</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-[#1A1A1A] leading-tight truncate max-w-[100px]">{patient?.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-8 h-8 rounded-full bg-[#C5A55A]/10 flex items-center justify-center text-[#C5A55A] hover:bg-[#C5A55A]/20 transition"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 bg-[#1A1A1A] text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-[#333] transition"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Iniciar sesión</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué estás buscando?"
              className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* ─── Content ─────────────────────────────────────────────────── */}
      <div className="pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" />
            <p className="text-sm text-gray-400">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 px-4">
            <div className="w-20 h-20 bg-[#C5A55A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-[#C5A55A]/40" />
            </div>
            <h2 className="font-serif text-2xl text-[#1A1A1A]/50 mb-2">Próximamente</h2>
            <p className="text-[#1A1A1A]/40 text-sm">Estamos preparando nuestra tienda. Vuelve pronto.</p>
          </div>
        ) : (
          <>
            {/* ─── Categories (circular icons, horizontal scroll) ─── */}
            {categories.length > 1 && (
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-[#1A1A1A]">Categorías</h2>
                  <span className="text-xs text-[#C5A55A] font-medium">{products.length} productos</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {/* All */}
                  <button
                    onClick={() => setActiveCategory("all")}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0"
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                      activeCategory === "all"
                        ? "bg-[#C5A55A] shadow-lg shadow-[#C5A55A]/30 ring-2 ring-[#C5A55A]/50"
                        : "bg-white shadow-md hover:shadow-lg"
                    }`}>
                      {activeCategory === "all" ? "⭐" : "🏷️"}
                    </div>
                    <span className={`text-[11px] font-medium text-center leading-tight ${
                      activeCategory === "all" ? "text-[#C5A55A] font-bold" : "text-gray-500"
                    }`}>
                      Todos
                    </span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className="flex flex-col items-center gap-1.5 flex-shrink-0"
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                        activeCategory === cat.id
                          ? "bg-[#C5A55A] shadow-lg shadow-[#C5A55A]/30 ring-2 ring-[#C5A55A]/50"
                          : "bg-white shadow-md hover:shadow-lg"
                      }`}>
                        {cat.icon}
                      </div>
                      <span className={`text-[11px] font-medium text-center leading-tight max-w-[64px] ${
                        activeCategory === cat.id ? "text-[#C5A55A] font-bold" : "text-gray-500"
                      }`}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-2 bg-gray-100 mt-2" />

            {/* ─── Products Section ─────────────────────────────────── */}
            <div className="px-4 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#1A1A1A]">
                  {activeCategory === "all" ? "Todos los productos" : CATEGORY_LABELS[activeCategory] || activeCategory}
                </h2>
                <span className="text-xs text-gray-400">{filteredProducts.length} resultados</span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No se encontraron productos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex hover:shadow-md transition-shadow"
                    >
                      {/* Product Image */}
                      <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-[#F5F0E8] flex items-center justify-center overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-10 h-10 text-[#C5A55A]/20" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <span className="text-[#C5A55A] text-[9px] tracking-[0.15em] uppercase font-bold">
                            {CATEGORY_LABELS[product.category] || product.category}
                          </span>
                          <h3 className="font-semibold text-[#1A1A1A] text-sm leading-snug mt-0.5 line-clamp-2">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-gray-400 text-xs leading-relaxed mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-end justify-between mt-2">
                          <div>
                            {product.price && (
                              <p className="text-[#C5A55A] font-black text-lg leading-none">{product.price}</p>
                            )}
                            {product.stock !== null && product.stock !== undefined && (
                              <p className={`text-[10px] mt-0.5 ${product.stock > 0 ? "text-green-500" : "text-red-400"}`}>
                                {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleOpenPurchase(product)}
                            disabled={product.stock === 0}
                            className="flex items-center gap-1 bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-sm"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            {product.stock === 0 ? "Agotado" : "Comprar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── WhatsApp Floating Button ────────────────────────────────── */}
      <a
        href="https://wa.me/523221007799?text=Hola%2C%20me%20interesa%20un%20producto%20de%20Nutriser%20Shop"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 hover:scale-110 transition-all duration-300"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      </a>

      {/* ─── Auth Modal ──────────────────────────────────────────────── */}
      <NutriserAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
        contextMessage="Inicia sesión para comprar productos y acceder a beneficios exclusivos."
      />

      {/* ─── Purchase Modal ──────────────────────────────────────────── */}
      {purchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center rounded-t-3xl sm:rounded-t-2xl">
              <div>
                <h2 className="font-bold text-lg text-[#1A1A1A] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#C5A55A]" /> Comprar
                </h2>
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{selectedProduct.name}</p>
              </div>
              <button onClick={() => setPurchaseModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {successCode ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="font-bold text-xl text-[#1A1A1A]">¡Compra Enviada!</h3>
                <p className="text-gray-500 text-sm">Tu comprobante fue recibido. Te confirmaremos por correo.</p>
                <div className="bg-[#FAF7F2] border-2 border-[#C5A55A] rounded-2xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tu código de compra</p>
                  <p className="font-mono font-black text-xl text-[#C5A55A] tracking-widest">{successCode}</p>
                </div>
                <button onClick={() => setPurchaseModal(false)} className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 rounded-xl font-bold transition">Cerrar</button>
              </div>
            ) : (
              <form onSubmit={handleSubmitPurchase} className="p-5 space-y-4">
                {/* Product summary */}
                <div className="flex gap-3 bg-[#FAF7F2] rounded-2xl p-3">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-16 h-16 object-cover rounded-xl" />
                  ) : (
                    <div className="w-16 h-16 bg-[#C5A55A]/10 rounded-xl flex items-center justify-center"><Package className="w-8 h-8 text-[#C5A55A]/40" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1A1A1A] text-sm line-clamp-2">{selectedProduct.name}</p>
                    {selectedProduct.price && <p className="text-[#C5A55A] font-bold mt-1">{selectedProduct.price}</p>}
                  </div>
                </div>

                {/* Payment info */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm">
                  <p className="font-bold text-amber-800 mb-2">Realiza tu pago:</p>
                  <p className="text-amber-700 text-xs">Transferencia bancaria a:</p>
                  <p className="font-mono font-bold text-amber-900 mt-1 text-sm">CLABE: 002470701448743487</p>
                  <p className="text-amber-700 text-xs mt-1">Banco: Banamex</p>
                  <p className="text-amber-700 text-xs mt-1">Concepto: <span className="font-semibold">{buyerName || "Tu nombre"} – {selectedProduct?.name}</span></p>
                  <p className="text-amber-600 text-xs mt-2">Después sube tu comprobante aquí abajo.</p>
                </div>

                {/* Form fields */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nombre completo</label>
                  <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Tu nombre" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30 focus:border-[#C5A55A] bg-gray-50" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Correo electrónico</label>
                  <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="tu@correo.com" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30 focus:border-[#C5A55A] bg-gray-50" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                  <input type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="322 000 0000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30 focus:border-[#C5A55A] bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={selectedProduct.stock || 99} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30 focus:border-[#C5A55A] bg-gray-50" />
                </div>

                {/* Discount code */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Código de descuento (opcional)</label>
                  <div className="flex gap-2">
                    <input type="text" value={discountCode} onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountInfo(null); }} placeholder="Ej: Nutriser10" className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30 focus:border-[#C5A55A] bg-gray-50" />
                    <button type="button" onClick={handleValidateDiscount} className="bg-[#C5A55A]/15 hover:bg-[#C5A55A]/25 text-[#C5A55A] px-4 py-2.5 rounded-xl font-semibold text-sm transition">Aplicar</button>
                  </div>
                  {discountInfo && discountInfo.valid && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-green-700 text-xs bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>
                          {discountInfo.isTwoForOne
                            ? "¡2x1 aplicado!"
                            : discountInfo.isGift
                            ? "¡Regalo aplicado! Producto gratis."
                            : `¡${discountInfo.discount}% de descuento!`}
                        </span>
                      </div>
                      {selectedProduct?.price && !discountInfo.isTwoForOne && (() => {
                        const numericPrice = parseFloat(selectedProduct.price.replace(/[^0-9.]/g, ''));
                        if (!isNaN(numericPrice) && discountInfo.discount) {
                          const discounted = discountInfo.isGift ? 0 : numericPrice * (1 - discountInfo.discount / 100);
                          const currency = selectedProduct.price.match(/[^0-9.,\s]/g)?.join('') || '';
                          return (
                            <div className="bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-2xl px-4 py-3 flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Original</p>
                                <p className="text-sm text-gray-400 line-through">{selectedProduct.price}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-[#C5A55A] font-semibold mb-0.5">Tu precio</p>
                                {discountInfo.isGift ? (
                                  <p className="text-xl font-black text-green-600">¡GRATIS!</p>
                                ) : (
                                  <p className="text-xl font-black text-[#C5A55A]">{currency}{discounted.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                  {discountInfo && !discountInfo.valid && (
                    <p className="mt-2 text-red-500 text-xs">Código inválido o no está activo.</p>
                  )}
                </div>

                {/* Proof upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Comprobante de pago *</label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#C5A55A]/40 rounded-2xl cursor-pointer hover:bg-[#C5A55A]/5 transition">
                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                    {proofFile ? (
                      <div className="text-center p-3"><div className="text-green-600 font-semibold text-sm">✓ {proofFile.name}</div><div className="text-gray-400 text-xs mt-1">Toca para cambiar</div></div>
                    ) : (
                      <div className="text-center p-3"><Upload className="w-5 h-5 text-[#C5A55A] mx-auto mb-1" /><div className="text-xs text-gray-500">Subir comprobante</div><div className="text-[10px] text-gray-400 mt-0.5">JPG, PNG o PDF · máx 5MB</div></div>
                    )}
                  </label>
                </div>

                <button type="submit" disabled={isSubmitting || !proofFile} className="w-full bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-[#C5A55A]/20">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><ShoppingBag className="w-4 h-4" /> Enviar Comprobante</>}
                </button>
                <p className="text-[10px] text-gray-400 text-center">Recibirás confirmación por correo cuando tu pago sea verificado.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
