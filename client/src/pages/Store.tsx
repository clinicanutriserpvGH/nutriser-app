/*
 * Tienda Nutriser — Buscador unificado: Servicios + Productos + Ebooks
 * Layout: Header con sesión + búsqueda → Resultados de búsqueda unificados → Grid normal
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ShoppingBag, X, Upload, Loader2, Package, Search,
  User, LogOut, MessageCircle,
  Wallet, BookOpen, Scissors, Tag,
} from "lucide-react";
import { useLocation } from "wouter";
import BackToSplash from "@/components/BackToSplash";
import { NutriserWalletCard, QRFullscreenModal } from "@/components/NutriserWalletCard";
import PromoSplash from "@/components/PromoSplash";
import { usePatientAuth } from "@/hooks/usePatientAuth";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  nutricion: "Nutrición",
  corporales: "Corporales",
  faciales: "Faciales",
  medicina: "Medicina Estética",
  otros: "Otros",
};

const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  nutricionales: "Nutricionales",
  cosmeticos: "Cosméticos",
  suplementos: "Suplementos",
  cuidado_piel: "Cuidado de Piel",
  otros: "Otros",
};

// Tipo unificado para resultados de búsqueda
type SearchResult = {
  id: number;
  type: "service" | "product" | "ebook";
  name: string;
  description?: string | null;
  price?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  stock?: number | null;
  raw: unknown;
};

export default function Store() {
  const { patient, isLoggedIn, logout } = usePatientAuth();
  const [showPromoSplash, setShowPromoSplash] = useState(
    () => !sessionStorage.getItem("nutriser_store_promo_dismissed")
  );
  const [walletSheetOpen, setWalletSheetOpen] = useState(false);
  const [showQRFullscreen, setShowQRFullscreen] = useState(false);
  const [, navigate] = useLocation();

  // Wallet data for floating button & bottom sheet
  const walletQuery = trpc.wallet.getMyWallet.useQuery(
    { patientId: patient?.id ?? 0 },
    { enabled: isLoggedIn && !!patient?.id }
  );
  const walletData = walletQuery.data;
  const walletBalance = walletData?.wallet?.balance ?? 0;

  // Cargar las tres fuentes de datos
  const { data: products = [], isLoading: loadingProducts } = trpc.products.list.useQuery();
  const { data: services = [], isLoading: loadingServices } = trpc.services.list.useQuery();
  const { data: ebookActive } = trpc.ebook.getActive.useQuery();

  const isLoading = loadingProducts || loadingServices;

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "services" | "products" | "ebooks">("all");

  // Construir lista unificada de resultados
  const allItems = useMemo((): SearchResult[] => {
    const items: SearchResult[] = [];

    // Servicios
    for (const s of services) {
      items.push({
        id: s.id,
        type: "service",
        name: s.name,
        description: s.description,
        price: s.price,
        imageUrl: s.imageUrl,
        category: s.category,
        raw: s,
      });
    }

    // Productos
    for (const p of products) {
      items.push({
        id: p.id,
        type: "product",
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        category: p.category,
        stock: p.stock,
        raw: p,
      });
    }

    // Ebook activo
    if (ebookActive) {
      items.push({
        id: ebookActive.id,
        type: "ebook",
        name: ebookActive.title,
        description: ebookActive.description,
        price: ebookActive.presalePrice ? `$${ebookActive.presalePrice}` : `$${ebookActive.price}`,
        imageUrl: ebookActive.coverUrl,
        category: "ebook",
        raw: ebookActive,
      });
    }

    return items;
  }, [services, products, ebookActive]);

  // Helper: normalizar texto quitando tildes/acentos para búsqueda flexible
  const normalize = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Filtrar por búsqueda y pestaña activa
  const filteredItems = useMemo((): SearchResult[] => {
    let items = allItems;

    // Filtrar por pestaña
    if (activeTab === "services") items = items.filter(i => i.type === "service");
    else if (activeTab === "products") items = items.filter(i => i.type === "product");
    else if (activeTab === "ebooks") items = items.filter(i => i.type === "ebook");

    // Filtrar por búsqueda (sin tildes, sin mayúsculas)
    if (searchQuery.trim()) {
      const q = normalize(searchQuery);
      items = items.filter(i =>
        normalize(i.name).includes(q) ||
        normalize(i.description || "").includes(q) ||
        normalize(i.category || "").includes(q) ||
        normalize(SERVICE_CATEGORY_LABELS[i.category || ""] || "").includes(q) ||
        normalize(PRODUCT_CATEGORY_LABELS[i.category || ""] || "").includes(q)
      );
    }

    return items;
  }, [allItems, searchQuery, activeTab]);

  // ─── Modal de Compra (Producto) ────────────────────────────────────────────
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
  const [useWalletStore, setUseWalletStore] = useState(false);

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
      navigate("/mis-tratamientos?returnTo=/store");
      return;
    }
    setSelectedProduct(product);
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
        if (result.isTwoForOne) toast.success("¡Código 2x1 aplicado!");
        else if (result.isGift) toast.success("¡Código de regalo aplicado!");
        else toast.success(`¡${result.discount}% de descuento aplicado!`);
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
    const walletDiscountPesos = useWalletStore && walletBalance > 0 ? walletBalance / 100 : 0;
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
        walletDiscount: walletDiscountPesos > 0 ? walletDiscountPesos : undefined,
        patientEmail: walletDiscountPesos > 0 && patient?.email ? patient.email : undefined,
      });
    };
    reader.readAsDataURL(proofFile);
  };

  // Helper para obtener la etiqueta de categoría
  const getCategoryLabel = (item: SearchResult) => {
    if (item.type === "service") return SERVICE_CATEGORY_LABELS[item.category || ""] || item.category || "Servicio";
    if (item.type === "product") return PRODUCT_CATEGORY_LABELS[item.category || ""] || item.category || "Producto";
    if (item.type === "ebook") return "Libro Digital";
    return "";
  };

  // Helper para el icono de tipo
  const getTypeIcon = (type: SearchResult["type"]) => {
    if (type === "service") return <Scissors className="w-3 h-3" />;
    if (type === "product") return <Tag className="w-3 h-3" />;
    if (type === "ebook") return <BookOpen className="w-3 h-3" />;
    return null;
  };

  // Helper para el color de tipo
  const getTypeBadgeClass = (type: SearchResult["type"]) => {
    if (type === "service") return "bg-purple-100 text-purple-700";
    if (type === "product") return "bg-blue-100 text-blue-700";
    if (type === "ebook") return "bg-amber-100 text-amber-700";
    return "";
  };

  // Helper para el label de tipo
  const getTypeLabel = (type: SearchResult["type"]) => {
    if (type === "service") return "Servicio";
    if (type === "product") return "Producto";
    if (type === "ebook") return "Libro";
    return "";
  };

  // Acción al hacer clic en un resultado
  const handleItemClick = (item: SearchResult) => {
    if (item.type === "product") {
      handleOpenPurchase(item.raw as (typeof products)[0]);
    } else if (item.type === "ebook") {
      navigate("/ebook");
    } else if (item.type === "service") {
      navigate("/#servicios");
    }
  };

  const tabCounts = useMemo(() => ({
    all: allItems.length,
    services: allItems.filter(i => i.type === "service").length,
    products: allItems.filter(i => i.type === "product").length,
    ebooks: allItems.filter(i => i.type === "ebook").length,
  }), [allItems]);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* ─── Promo Splash ──────────────────────────────────────────────── */}
      {showPromoSplash && (
        <PromoSplash
          onClose={() => { sessionStorage.setItem("nutriser_store_promo_dismissed", "1"); setShowPromoSplash(false); }}
          onGoToCoupon={() => { sessionStorage.setItem("nutriser_store_promo_dismissed", "1"); setShowPromoSplash(false); }}
          isAuthenticated={isLoggedIn}
        />
      )}

      {/* ─── Top Bar ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        {/* Back + Brand + User */}
        <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4 border-b border-gray-100">
          <BackToSplash />
          <div className="flex-1 text-center">
            <h1 className="font-serif text-lg lg:text-2xl font-bold text-[#1A1A1A]">
              Nutriser <span className="text-[#C5A55A]">Shop</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs lg:text-sm font-semibold text-[#1A1A1A] leading-tight truncate max-w-[100px] lg:max-w-[160px]">{patient?.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#C5A55A]/10 flex items-center justify-center text-[#C5A55A] hover:bg-[#C5A55A]/20 transition"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/mis-tratamientos?returnTo=/store")}
                className="flex items-center gap-1.5 bg-[#1A1A1A] text-white text-xs lg:text-sm font-semibold px-3 lg:px-5 py-2 lg:py-2.5 rounded-full hover:bg-[#333] transition"
              >
                <User className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Crear Monedero Nutriser</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 lg:px-8 py-3">
          <div className="relative lg:max-w-2xl lg:mx-auto">
            <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar servicios, productos o libros..."
              className="w-full bg-gray-100 rounded-xl pl-10 lg:pl-12 pr-10 py-2.5 lg:py-3.5 text-sm lg:text-base text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs de filtro */}
        <div className="px-4 lg:px-8 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "all" as const, label: "Todo", count: tabCounts.all },
            { id: "services" as const, label: "Servicios", count: tabCounts.services },
            { id: "products" as const, label: "Skincare", count: tabCounts.products },
            { id: "ebooks" as const, label: "Libros", count: tabCounts.ebooks },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-[#C5A55A] text-white shadow-md shadow-[#C5A55A]/30"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Content ─────────────────────────────────────────────────── */}
      <div className="pb-32">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" />
            <p className="text-sm text-gray-400">Cargando...</p>
          </div>
        ) : (
          <div className="px-4 lg:px-8 pt-4">
            {/* Header de resultados */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base lg:text-xl font-bold text-[#1A1A1A]">
                {searchQuery.trim()
                  ? `Resultados para "${searchQuery}"`
                  : activeTab === "all" ? "Todo en Nutriser"
                  : activeTab === "services" ? "Servicios"
                  : activeTab === "products" ? "Skincare"
                  : "Libros Digitales"}
              </h2>
              <span className="text-xs lg:text-sm text-gray-400">{filteredItems.length} resultado{filteredItems.length !== 1 ? "s" : ""}</span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 text-sm font-medium">No se encontraron resultados</p>
                {searchQuery && (
                  <p className="text-gray-300 text-xs mt-1">Intenta con otro término de búsqueda</p>
                )}
                <button
                  onClick={() => { setSearchQuery(""); setActiveTab("all"); }}
                  className="mt-4 text-[#C5A55A] text-sm font-semibold underline"
                >
                  Ver todo
                </button>
              </div>
            ) : (
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {filteredItems.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  >
                    {/* Image */}
                    <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-44 lg:h-44 flex-shrink-0 bg-[#F5F0E8] flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : item.type === "ebook" ? (
                        <BookOpen className="w-10 h-10 text-[#C5A55A]/30" />
                      ) : item.type === "service" ? (
                        <Scissors className="w-10 h-10 text-[#C5A55A]/30" />
                      ) : (
                        <Package className="w-10 h-10 text-[#C5A55A]/20" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-3 lg:p-5 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Type badge + category */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className={`inline-flex items-center gap-1 text-[9px] lg:text-[10px] font-bold px-2 py-0.5 rounded-full ${getTypeBadgeClass(item.type)}`}>
                            {getTypeIcon(item.type)}
                            {getTypeLabel(item.type)}
                          </span>
                          <span className="text-[#C5A55A] text-[9px] lg:text-xs tracking-[0.1em] uppercase font-bold">
                            {getCategoryLabel(item)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-[#1A1A1A] text-sm lg:text-lg leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-gray-400 text-xs lg:text-sm leading-relaxed mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <div>
                          {item.price && (
                            <p className="text-[#C5A55A] font-black text-lg lg:text-xl leading-none">{item.price}</p>
                          )}
                          {item.type === "product" && item.stock !== null && item.stock !== undefined && (
                            <p className={`text-[10px] mt-0.5 ${item.stock > 0 ? "text-green-500" : "text-red-400"}`}>
                              {item.stock > 0 ? `${item.stock} disponibles` : "Agotado"}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                          disabled={item.type === "product" && item.stock === 0}
                          className="flex items-center gap-1 lg:gap-2 bg-[#C5A55A] hover:bg-[#B8963E] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs lg:text-sm font-bold px-3 lg:px-5 py-2 lg:py-2.5 rounded-xl transition-colors shadow-sm"
                        >
                          {item.type === "ebook" ? (
                            <><BookOpen className="w-3.5 h-3.5" /> Ver libro</>
                          ) : item.type === "service" ? (
                            <><Scissors className="w-3.5 h-3.5" /> Agendar</>
                          ) : item.stock === 0 ? (
                            "Agotado"
                          ) : (
                            <><ShoppingBag className="w-3.5 h-3.5" /> Comprar</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── WhatsApp Floating Button ────────────────────────────────── */}
      <a
        href="https://wa.me/523221007799?text=Hola%2C%20me%20interesa%20un%20servicio%20de%20Nutriser"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 hover:scale-110 transition-all duration-300"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      </a>

      {/* ─── Purchase Modal (solo para productos) ─────────────────────── */}
      {purchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
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
                <div className="flex gap-3 bg-[#FAF7F2] rounded-2xl p-3">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-16 h-16 object-cover rounded-xl" />
                  ) : (
                    <div className="w-16 h-16 bg-[#C5A55A]/10 rounded-xl flex items-center justify-center"><Package className="w-8 h-8 text-[#C5A55A]/40" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1A1A1A] text-sm line-clamp-2">{selectedProduct.name}</p>
                    {selectedProduct.price && (() => {
                      const walletDisc = walletData?.wallet?.discountPercent ?? 0;
                      const numP = parseFloat(selectedProduct.price!.replace(/[^0-9.]/g, ''));
                      if (walletDisc > 0 && !isNaN(numP) && !discountInfo?.isGift) {
                        const discountedP = Math.round(numP * (1 - walletDisc / 100));
                        return (
                          <div className="mt-1">
                            <p className="text-xs text-gray-400 line-through">{selectedProduct.price}</p>
                            <p className="text-[#C5A55A] font-bold">${discountedP.toLocaleString('es-MX')} MXN <span className="text-green-600 text-xs font-semibold">(-{walletDisc}%)</span></p>
                          </div>
                        );
                      }
                      return <p className="text-[#C5A55A] font-bold mt-1">{selectedProduct.price}</p>;
                    })()}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm">
                  <p className="font-bold text-amber-800 mb-2">Realiza tu pago:</p>
                  <p className="text-amber-700 text-xs">Transferencia bancaria a:</p>
                  <p className="font-mono font-bold text-amber-900 mt-1 text-sm">CLABE: 002470701448743487</p>
                  <p className="text-amber-700 text-xs mt-1">Banco: Banamex</p>
                  <p className="text-amber-700 text-xs mt-1">Concepto: <span className="font-semibold">{buyerName || "Tu nombre"} – {selectedProduct?.name}</span></p>
                  <p className="text-amber-600 text-xs mt-2">Después sube tu comprobante aquí abajo.</p>
                </div>

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
                          {discountInfo.isTwoForOne ? "¡2x1 aplicado!" : discountInfo.isGift ? "¡Regalo aplicado! Producto gratis." : `¡${discountInfo.discount}% de descuento!`}
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

                {isLoggedIn && walletBalance > 0 && (
                  <div className={`border rounded-xl p-3 transition-all ${useWalletStore ? 'border-[#C5A55A] bg-amber-50/50' : 'border-gray-200 bg-gray-50'}`}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={useWalletStore} onChange={(e) => setUseWalletStore(e.target.checked)} className="w-4 h-4 accent-[#C5A55A]" />
                      <Wallet className="w-5 h-5 text-[#C5A55A]" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">Usar saldo del monedero</p>
                        <p className="text-xs text-gray-500">Saldo: <span className="font-bold text-[#C5A55A]">${(walletBalance / 100).toFixed(2)} MXN</span></p>
                      </div>
                    </label>
                    {useWalletStore && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-green-600 font-semibold">Se descontarán ${(walletBalance / 100).toFixed(2)} MXN de tu monedero al enviar</p>
                      </div>
                    )}
                  </div>
                )}

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

      {/* ══════════════════════════════════════════════════════════════════════
          BOTÓN FLOTANTE MONEDERO
      ══════════════════════════════════════════════════════════════════════ */}
      <button
        onClick={() => {
          if (!isLoggedIn) { navigate("/mis-tratamientos?returnTo=/store"); return; }
          setWalletSheetOpen(true);
        }}
        className="fixed bottom-20 lg:bottom-24 left-1/2 -translate-x-1/2 z-40 w-[76px] h-[76px] lg:w-[96px] lg:h-[96px] rounded-full bg-gradient-to-br from-[#C5A55A] via-[#D4B96A] to-[#B8963E] shadow-[0_6px_32px_rgba(197,165,90,0.6),0_0_0_4px_rgba(255,255,255,0.9)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-[pulse_2s_ease-in-out_infinite]"
        aria-label="Mi Monedero Nutriser"
        style={{ animationDuration: '2.5s' }}
      >
        <div className="w-[62px] h-[62px] lg:w-[78px] lg:h-[78px] rounded-full bg-white/95 flex items-center justify-center">
          <img src={LOGO_URL} alt="Monedero Nutriser" className="w-10 h-10 lg:w-14 lg:h-14 object-contain" />
        </div>
        <span className="absolute -bottom-5 lg:-bottom-6 left-1/2 -translate-x-1/2 text-[10px] lg:text-xs font-bold text-[#C5A55A] bg-white/90 px-2 lg:px-3 py-0.5 lg:py-1 rounded-full shadow-sm whitespace-nowrap">Monedero</span>
      </button>

      {/* ══════════════════════════════════════════════════════════════════════
          BOTTOM SHEET — TARJETA MONEDERO
      ══════════════════════════════════════════════════════════════════════ */}
      {walletSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setWalletSheetOpen(false)} />
          <div className="relative w-full sm:max-w-[420px] sm:rounded-3xl bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto" style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <h2 className="text-center text-lg font-bold text-gray-900 pb-3">Tu Monedero Nutriser</h2>
            <div className="border-t border-gray-100" />

            <div className="p-5">
              {walletData ? (
                <NutriserWalletCard
                  patientName={patient?.name || '---'}
                  walletNumber={walletData.wallet.walletNumber || '---'}
                  qrUrl={`${window.location.origin}/monedero?id=${walletData.wallet.walletNumber}`}
                  isActive={walletData.wallet.isActive ?? true}
                  balance={walletBalance}
                  showBalance={true}
                  onQRClick={() => setShowQRFullscreen(true)}
                  discountPercent={walletData.wallet.discountPercent ?? null}
                />
              ) : (
                <div className="py-6 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#C5A55A] mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Cargando tu monedero...</p>
                </div>
              )}
            </div>

            <div className="px-5 pb-8">
              <button
                onClick={() => { setWalletSheetOpen(false); navigate("/monedero"); }}
                className="w-full bg-[#1A1A1A] text-white font-bold py-4 rounded-2xl text-base hover:bg-[#2D2D2D] active:scale-[0.98] transition-all shadow-lg"
              >
                Ir a mi monedero
              </button>
            </div>
          </div>
        </div>
      )}

      <QRFullscreenModal
        open={showQRFullscreen}
        onClose={() => setShowQRFullscreen(false)}
        qrUrl={walletData ? `${window.location.origin}/monedero?id=${walletData.wallet.walletNumber}` : 'https://nutriserpv.com/monedero'}
        patientName={patient?.name || '---'}
        walletNumber={walletData?.wallet?.walletNumber || '---'}
      />

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
