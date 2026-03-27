/*
 * Nutriser - Tienda de Productos
 * Design: "Lujo Orgánico" — catálogo de productos con modal de compra
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ShoppingBag, X, Upload, Loader2, ArrowLeft, Package } from "lucide-react";
import { Link } from "wouter";
import BackToSplash from "@/components/BackToSplash";
import { usePageReady } from "@/App";

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  nutricionales: "Nutricionales",
  cosmeticos: "Cosméticos",
  suplementos: "Suplementos",
  cuidado_piel: "Cuidado de Piel",
  otros: "Otros",
};

export default function Store() {
  const { onPageReady } = usePageReady();
  // Notificar al splash que esta página está lista (elimina el flash del Home)
  useEffect(() => { onPageReady(); }, []);

  const { data: products = [], isLoading } = trpc.products.list.useQuery();

  // Group by category
  const categoryMap = new Map<string, typeof products>();
  for (const p of products) {
    const cat = p.category || "general";
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push(p);
  }
  const categories = Array.from(categoryMap.entries()).map(([id, items]) => ({
    id,
    label: CATEGORY_LABELS[id] || id,
    items,
  }));

  const [activeCategory, setActiveCategory] = useState<string>("");
  const activeId = activeCategory || categories[0]?.id || "";
  const activeItems = categoryMap.get(activeId) || [];

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
    setSelectedProduct(product);
    setBuyerName(""); setBuyerEmail(""); setBuyerPhone(""); setQuantity(1); setProofFile(null); setSuccessCode("");
    setDiscountCode(""); setDiscountInfo(null);
    setPurchaseModal(true);
  };

  const utils = trpc.useUtils();

  const handleValidateDiscount = async () => {
    const code = discountCode.trim();
    if (!code) return;
    try {
      // Usar fetch directo para evitar problemas de caché con useQuery
      const result = await utils.discountCodes.validate.fetch({ code });
      if (result?.valid) {
        setDiscountInfo({ valid: true, discount: result.discount, isGift: result.isGift ?? false, isTwoForOne: result.isTwoForOne ?? false, description: result.description ?? null });
        if (result.isTwoForOne) {
          toast.success("¡Código 2x1 aplicado! Compras un producto y obtienes uno doble.");
        } else if (result.isGift) {
          toast.success("¡Código de regalo aplicado! Tu producto es completamente gratis.");
        } else {
          toast.success(`¡Código válido! ${result.discount}% de descuento aplicado.`);
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
      <BackToSplash />
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">

          <h1 className="font-serif text-4xl lg:text-5xl text-white mb-3">
            Tienda de <span className="text-[#C5A55A] italic">Productos</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl">
            Complementa tus tratamientos con productos nutricionales y cosméticos de alta calidad.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <Package className="w-16 h-16 text-[#C5A55A]/30 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-[#1A1A1A]/50 mb-2">Próximamente</h2>
            <p className="text-[#1A1A1A]/40">Estamos preparando nuestra tienda. Vuelve pronto.</p>
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-10">
                <button
                  onClick={() => setActiveCategory("")}
                  className={`px-5 py-2.5 text-sm font-medium border transition-all ${
                    activeId === categories[0]?.id && !activeCategory
                      ? "bg-[#C5A55A] text-white border-[#C5A55A]"
                      : "bg-white text-[#1A1A1A]/60 border-[#1A1A1A]/10 hover:border-[#C5A55A]/40"
                  }`}
                >
                  Todos ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-5 py-2.5 text-sm font-medium border transition-all ${
                      activeId === cat.id && activeCategory === cat.id
                        ? "bg-[#C5A55A] text-white border-[#C5A55A]"
                        : "bg-white text-[#1A1A1A]/60 border-[#1A1A1A]/10 hover:border-[#C5A55A]/40"
                    }`}
                  >
                    {cat.label} ({cat.items.length})
                  </button>
                ))}
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(activeCategory ? activeItems : products).map((product) => (
                <div
                  key={product.id}
                  className="group bg-white border border-[#1A1A1A]/5 hover:border-[#C5A55A]/30 hover:shadow-lg hover:shadow-[#C5A55A]/5 transition-all duration-300 flex flex-col"
                >
                  {/* Product Image */}
                  <div className="w-full h-52 overflow-hidden bg-[#F5F0E8] flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-[#C5A55A]/20" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-[#C5A55A] text-[10px] tracking-[0.2em] uppercase font-semibold mb-1">
                      {CATEGORY_LABELS[product.category] || product.category}
                    </span>
                    <h3 className="font-serif text-lg text-[#1A1A1A] leading-snug mb-2 group-hover:text-[#C5A55A] transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-[#1A1A1A]/55 text-sm leading-relaxed flex-1 line-clamp-3">
                        {product.description}
                      </p>
                    )}
                    {product.price && (
                      <p className="text-[#C5A55A] font-bold text-xl mt-3">{product.price}</p>
                    )}
                    {product.stock !== null && product.stock !== undefined && (
                      <p className="text-xs text-[#1A1A1A]/40 mt-1">
                        {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-5 pb-5 pt-2 border-t border-[#1A1A1A]/5 flex gap-2">
                    <a
                      href={`https://wa.me/523221007799?text=${encodeURIComponent(`Hola, me gustaría pedir informes sobre el producto: ${product.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 border border-green-500 text-green-600 hover:bg-green-50 text-xs font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.967 1.523 9.9 9.9 0 001.563 19.231c2.693.47 5.455.082 7.978-1.125a9.9 9.9 0 00-4.57-19.629z"/>
                      </svg>
                      Info
                    </a>
                    <button
                      onClick={() => handleOpenPurchase(product)}
                      disabled={product.stock === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {product.stock === 0 ? "Agotado" : "Comprar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de Compra */}
      {purchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#C5A55A] to-[#B8963E] p-5 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> Comprar Producto
                </h2>
                <p className="text-white/80 text-sm mt-0.5 line-clamp-1">{selectedProduct.name}</p>
              </div>
              <button onClick={() => setPurchaseModal(false)} className="text-white hover:bg-white/20 p-2 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {successCode ? (
              <div className="p-6 text-center space-y-4">
                <div className="text-5xl mb-2">🎉</div>
                <h3 className="font-bold text-xl text-[#1A1A1A]">¡Compra Enviada!</h3>
                <p className="text-gray-600 text-sm">Tu comprobante fue recibido. El equipo de Nutriser verificará tu pago y te confirmará por correo.</p>
                <div className="bg-[#FAF7F2] border-2 border-[#C5A55A] rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tu código de compra</p>
                  <p className="font-mono font-black text-xl text-[#C5A55A] tracking-widest">{successCode}</p>
                  <p className="text-xs text-gray-400 mt-2">Guarda este código como referencia</p>
                </div>
                <button onClick={() => setPurchaseModal(false)} className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 rounded-xl font-bold transition">Cerrar</button>
              </div>
            ) : (
              <form onSubmit={handleSubmitPurchase} className="p-5 space-y-4">
                {/* Product summary */}
                <div className="flex gap-3 bg-[#FAF7F2] rounded-xl p-3">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 bg-[#C5A55A]/10 rounded-lg flex items-center justify-center"><Package className="w-8 h-8 text-[#C5A55A]/40" /></div>
                  )}
                  <div>
                    <p className="font-semibold text-[#1A1A1A] text-sm">{selectedProduct.name}</p>
                    {selectedProduct.price && <p className="text-[#C5A55A] font-bold">{selectedProduct.price}</p>}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                  <p className="font-bold text-amber-800 mb-2">💳 Realiza tu pago:</p>
                  <p className="text-amber-700 text-xs">Transferencia bancaria a:</p>
                  <p className="font-mono font-bold text-amber-900 mt-1 text-sm">CLABE: 002470701448743487</p>
                  <p className="text-amber-700 text-xs mt-1">Banco: Banamex</p>
                  <p className="text-amber-700 text-xs mt-1">Concepto: <span className="font-semibold">{buyerName ? `${buyerName} – ${selectedProduct?.name}` : `Tu nombre – ${selectedProduct?.name}`}</span></p>
                  <p className="text-amber-600 text-xs mt-2">Después sube tu comprobante aquí abajo.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Tu nombre" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                  <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="tu@correo.com" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
                  <input type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="322 000 0000" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={selectedProduct.stock || 99} className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código de descuento (opcional)</label>
                  <div className="flex gap-2">
                    <input type="text" value={discountCode} onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountInfo(null); }} placeholder="Ej: Nutriser10" className="flex-1 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A55A]" />
                    <button type="button" onClick={handleValidateDiscount} className="bg-[#C5A55A]/20 hover:bg-[#C5A55A]/30 text-[#C5A55A] px-4 py-2.5 rounded-lg font-semibold text-sm transition">Aplicar</button>
                  </div>
                  {discountInfo && discountInfo.valid && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-green-700 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>
                          {discountInfo.isTwoForOne
                            ? "¡2x1 aplicado! Llevas dos productos al precio de uno."
                            : discountInfo.isGift
                            ? "¡Regalo aplicado! Tu producto es completamente gratis."
                            : `¡Código válido! ${discountInfo.discount}% de descuento aplicado.`}
                        </span>
                      </div>
                      {selectedProduct?.price && !discountInfo.isTwoForOne && (
                        (() => {
                          const numericPrice = parseFloat(selectedProduct.price.replace(/[^0-9.]/g, ''));
                          if (!isNaN(numericPrice) && discountInfo.discount) {
                            const discounted = discountInfo.isGift ? 0 : numericPrice * (1 - discountInfo.discount / 100);
                            const currency = selectedProduct.price.match(/[^0-9.,\s]/g)?.join('') || '';
                            return (
                              <div className="bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-xl px-4 py-3 flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-gray-500 mb-0.5">Precio original</p>
                                  <p className="text-sm text-gray-400 line-through">{selectedProduct.price}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-[#C5A55A] font-semibold mb-0.5">Tu precio con descuento</p>
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
                        })()
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
                      <div className="text-center p-3"><div className="text-green-600 font-semibold text-sm">✓ {proofFile.name}</div><div className="text-gray-400 text-xs mt-1">Toca para cambiar</div></div>
                    ) : (
                      <div className="text-center p-3"><Upload className="w-6 h-6 text-[#C5A55A] mx-auto mb-1" /><div className="text-sm text-gray-500">Subir comprobante</div><div className="text-xs text-gray-400 mt-1">JPG, PNG o PDF · máx 5MB</div></div>
                    )}
                  </label>
                </div>

                <button type="submit" disabled={isSubmitting || !proofFile} className="w-full bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : '✓ Enviar Comprobante'}
                </button>
                <p className="text-xs text-gray-400 text-center">Recibirás confirmación por correo cuando tu pago sea verificado.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
