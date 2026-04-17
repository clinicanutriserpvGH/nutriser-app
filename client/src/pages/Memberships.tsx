/**
 * Nutriser Shop — Tienda Digital Comercial
 * Estilo: Farmacia del Ahorro / e-commerce moderno
 * Fondo claro, scroll horizontal, carrusel de ofertas, categorías con iconos
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
  Search, ArrowLeft, Upload, BookOpen, FlaskConical, User,
  Crown, Heart, Shield, Award, ChevronLeft, Gift, Percent, Wallet, Home, MapPin, ClipboardList, Globe,
} from "lucide-react";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useWishlist } from "@/hooks/useWishlist";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import { useLocation } from "wouter";
import BackToSplash from "@/components/BackToSplash";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import NutriserAuthModal from "@/components/NutriserAuthModal";
import PromoSplash from "@/components/PromoSplash";
import { t, type Lang } from "@/lib/i18n";

// ─── Assets ──────────────────────────────────────────────────────────────────
const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type StoreTab = "tratamientos" | "misTratamientos" | "farmacy" | "library" | "monedero" | "wishlist";

interface CartItem {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  qty: number;
  imageUrl?: string | null;
  category?: string;
  itemType: "service" | "package" | "product" | "ebook";
  productId?: number;
  ebookId?: number;
}

// ─── Datos bancarios ──────────────────────────────────────────────────────────
const BANK_INFO = { bank: "Banamex", account: "002470701448743487" };

// ─── Paquetes destacados ─────────────────────────────────────────────────────
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

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  nutricion: { label: "Nutrición", icon: Apple, color: "#16a34a", bg: "#dcfce7" },
  corporales: { label: "Corporales", icon: Sparkles, color: "#C5A55A", bg: "#fef3c7" },
  faciales: { label: "Faciales", icon: Scan, color: "#ec4899", bg: "#fce7f3" },
  medicina: { label: "Medicina", icon: Syringe, color: "#7c3aed", bg: "#ede9fe" },
  otros: { label: "Otros", icon: Droplets, color: "#0891b2", bg: "#cffafe" },
  productos: { label: "Productos", icon: ShoppingBag, color: "#ea580c", bg: "#ffedd5" },
  general: { label: "General", icon: Package, color: "#6b7280", bg: "#f3f4f6" },
};

const CATEGORY_ORDER = ["nutricion", "corporales", "faciales", "medicina", "otros", "productos", "general"];

// ─── Horizontal Scroll Rail ──────────────────────────────────────────────────
function HScrollRail({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const check = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => { check(); window.addEventListener("resize", check); return () => window.removeEventListener("resize", check); }, [check, children]);

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div className={`relative group ${className}`}>
      {canLeft && (
        <button onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      )}
      <div ref={ref} onScroll={check}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
        {children}
      </div>
      {canRight && (
        <button onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Formatea precio de servicio: "$3500" → "$3,500 MXN", "$700" → "$700 MXN" */
function formatServicePrice(raw: string | null | undefined): string {
  if (!raw) return "Consultar precio";
  const num = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  if (isNaN(num)) return raw; // "Consultar precio" etc.
  return `$${num.toLocaleString("es-MX")} MXN`;
}

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
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${copied ? "bg-green-100 text-green-700 border border-green-300" : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"}`}>
      {copied ? <><CheckCheck className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
    </button>
  );
}

// ─── Banner Carousel ─────────────────────────────────────────────────────────
function PromoBanner({ onBannerClick }: { onBannerClick?: (pkgIndex: number) => void }) {
  const [idx, setIdx] = useState(0);
  const banners = [
    {
      title: "Paquete Nutrición",
      subtitle: "Ahorra $700 MXN",
      badge: "-22%",
      bg: "from-amber-500 to-amber-700",
      img: PACKAGES[0].imageUrl,
      pkgIndex: 0,
    },
    {
      title: "Paquete Reductor",
      subtitle: "Ahorra $2,000 MXN",
      badge: "-31%",
      bg: "from-emerald-500 to-emerald-700",
      img: PACKAGES[1].imageUrl,
      pkgIndex: 1,
    },
  ];

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  const b = banners[idx];
  return (
    <button
      onClick={() => onBannerClick?.(b.pkgIndex)}
      className="relative mx-4 mt-3 rounded-2xl overflow-hidden h-44 sm:h-52 lg:h-56 w-[calc(100%-2rem)] text-left cursor-pointer group"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${b.bg} transition-all duration-700`} />
      <img src={b.img} alt={b.title} className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-40 mix-blend-overlay group-hover:opacity-50 transition-opacity" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
      <div className="relative z-10 h-full flex flex-col justify-center px-6">
        <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-black px-3 py-1 rounded-full w-fit mb-2">
          {b.badge} DESCUENTO
        </span>
        <h3 className="text-white text-xl sm:text-2xl font-black leading-tight">{b.title}</h3>
        <p className="text-white/80 text-sm font-medium mt-1">{b.subtitle}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-white/90 text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit group-hover:bg-white/30 transition-all">
          <ShoppingCart className="w-3.5 h-3.5" /> Comprar ahora
        </span>
      </div>
      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {banners.map((_, i) => (
          <span key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === idx ? "bg-white w-5" : "bg-white/40"}`} />
        ))}
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function Memberships() {
  const [, navigate] = useLocation();
  const [lang, setLang] = useState<Lang>("ES");
  const toggleLang = () => setLang(prev => prev === "ES" ? "EN" : "ES");
  const [activeTab, setActiveTab] = useState<StoreTab>("tratamientos");

  // ─── Sesión unificada ────────────────────────────────────────────────
  const { patient, isLoggedIn, logout } = usePatientAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPromoSplash, setShowPromoSplash] = useState(true);
  const [pendingCartItem, setPendingCartItem] = useState<Omit<CartItem, "qty"> | null>(null);

  // ─── Carrito unificado (persistido en localStorage) ─────────────────
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("nutriser-cart");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Sincronizar carrito con localStorage
  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem("nutriser-cart", JSON.stringify(cart));
      } else {
        localStorage.removeItem("nutriser-cart");
      }
    } catch { /* ignore */ }
  }, [cart]);
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // ─── Lista de deseos (persistida en localStorage) ──────────────────
  const { wishlist, wishlistCount, isInWishlist, toggleWishlist, removeFromWishlist } = useWishlist();

  const addToCart = (item: Omit<CartItem, "qty">) => {
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

  // Group services by category for horizontal rails
  const servicesByCategory = useMemo(() => {
    const map: Record<string, typeof services> = {};
    filteredServices.forEach(s => {
      const cat = s.category || "general";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    return map;
  }, [filteredServices]);

  // ─── Checkout ───────────────────────────────────────────────────────────────
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
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

  //   // ─── Monedero Nutriser ─────────────────────────────────────────────
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [walletSheetOpen, setWalletSheetOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);

  const walletQuery = trpc.wallet.getMyWallet.useQuery(
    { patientId: patient?.id || 0 },
    { enabled: isLoggedIn && !!patient?.id }
  );
  const walletBalance = walletQuery.data?.wallet?.balance || 0;
  const walletData = walletQuery.data?.wallet;
  const walletRedeemMutation = trpc.wallet.redeem.useMutation();

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
  const checkoutTotal = checkoutItems.reduce((s, i) => s + (isNaN(i.price) ? 0 : i.price) * i.qty, 0);
  const hasValidPrice = checkoutItems.every(i => !isNaN(i.price) && i.price > 0);
  const discountedTotal = discountInfo?.valid && discountInfo.discount
    ? Math.round(checkoutTotal * (1 - discountInfo.discount / 100))
    : discountInfo?.isGift ? 0 : checkoutTotal;
  // Cashback: 2% de la compra
  const cashbackAmount = hasValidPrice ? Math.round(discountedTotal * 0.02) : 0;
  // Monto final a transferir (considerando monedero)
  const transferAmount = Math.max(0, (discountInfo?.isGift ? 0 : discountedTotal) - (useWallet ? walletAmount / 100 : 0));
  const fullyCoveredByWallet = useWallet && transferAmount <= 0;

  const openCheckout = (item?: CartItem) => {
    if (!isLoggedIn) {
      if (item) setPendingCartItem(item);
      setShowAuthModal(true);
      return;
    }
    setBuyNowItem(item || null);
    setBuyerName(patient?.name || ""); setBuyerEmail(patient?.email || ""); setBuyerPhone((patient as any)?.phone || "");
    setProofFile(null); setSuccessCode(""); setDiscountCode(""); setDiscountInfo(null);
    setUseWallet(false); setWalletAmount(0);
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
    if (!fullyCoveredByWallet && !proofFile) { toast.error("Sube el comprobante de pago"); return; }
    setIsSubmitting(true);

    // Si paga todo con monedero, hacer redeem y no necesita comprobante
    if (fullyCoveredByWallet) {
      try {
        const itemNames = checkoutItems.map(i => `${i.qty}x ${i.name}`).join(", ");
        await walletRedeemMutation.mutateAsync({
          patientId: patient?.id || 0,
          amount: walletAmount,
          description: `Compra con monedero: ${itemNames}`,
        });
        setSuccessCode("MONEDERO");
        walletQuery.refetch();
      } catch (err: any) {
        toast.error("Error al procesar pago con monedero: " + (err?.message || "Intenta de nuevo"));
      }
      setIsSubmitting(false);
      return;
    }
    // Pago con transferencia (con o sin monedero parcial)
    if (useWallet && walletAmount > 0) {
      try {
        const itemNames = checkoutItems.map(i => `${i.qty}x ${i.name}`).join(", ");
        await walletRedeemMutation.mutateAsync({
          patientId: patient?.id || 0,
          amount: walletAmount,
          description: `Pago parcial monedero: ${itemNames}`,
        });
        walletQuery.refetch();
      } catch (err: any) {
        toast.error("Error al descontar monedero: " + (err?.message || ""));
        setIsSubmitting(false);
        return;
      }
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      const firstItem = checkoutItems[0];
      const itemNames = checkoutItems.map(i => i.qty > 1 ? `${i.qty}x ${i.name}` : i.name).join(", ");

      if (firstItem?.itemType === "product" && firstItem.productId) {
        productPurchaseMutation.mutate({
          productId: firstItem.productId,
          productName: firstItem.name,
          buyerName, buyerEmail,
          buyerPhone: buyerPhone || undefined,
          quantity: firstItem.qty,
          proofData: base64,
          proofMimeType: proofFile!.type,
        });
      } else if (firstItem?.itemType === "ebook" && firstItem.ebookId) {
        ebookPurchaseMutation.mutate({
          ebookId: firstItem.ebookId,
          buyerName, buyerEmail,
          proofBase64: base64,
          discountCode: discountInfo?.valid ? discountCode.trim() : undefined,
        });
      } else {
        servicePurchaseMutation.mutate({
          serviceName: itemNames,
          buyerName, buyerEmail, buyerPhone,
          proofData: base64,
          proofMimeType: proofFile!.type,
          discountCode: discountInfo?.valid ? discountCode.trim() : undefined,
          discountPercent: discountInfo?.valid ? (discountInfo.discount ?? 0) : undefined,
          originalPrice: `$${discountedTotal.toLocaleString("es-MX")} MXN`,
        });
      }
    };
    reader.readAsDataURL(proofFile!);
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 3.5rem)" }}>
      {/* Botón Regresar inteligente:
          - Wishlist → vuelve a Tratamientos
          - Categoría específica (no "all") → vuelve a "all"
          - Pestaña distinta a tratamientos (farmacy, library, cuenta) → vuelve a tratamientos
          - Vista principal (tratamientos + all) → BackToSplash (sale al splash)
      */}
      {activeTab === "wishlist" ? (
        <div
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
          className="fixed left-3 z-[60] flex items-center gap-1.5"
        >
          <button
            onClick={() => setActiveTab("tratamientos")}
            className="flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/15 text-white/80 px-2.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide uppercase hover:bg-white/20 hover:text-white transition-all duration-300 shadow-md"
            aria-label="Regresar a la tienda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Regresar
          </button>
        </div>
      ) : (activeTab === "tratamientos" && activeCategory !== "all") ? (
        <div
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
          className="fixed left-3 z-[60] flex items-center gap-1.5"
        >
          <button
            onClick={() => setActiveCategory("all")}
            className="flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/15 text-white/80 px-2.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide uppercase hover:bg-white/20 hover:text-white transition-all duration-300 shadow-md"
            aria-label="Regresar a la tienda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Regresar
          </button>
        </div>
      ) : (activeTab !== "tratamientos") ? (
        <div
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
          className="fixed left-3 z-[60] flex items-center gap-1.5"
        >
          <button
            onClick={() => setActiveTab("tratamientos")}
            className="flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/15 text-white/80 px-2.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide uppercase hover:bg-white/20 hover:text-white transition-all duration-300 shadow-md"
            aria-label="Regresar a la tienda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Regresar
          </button>
        </div>
      ) : (
        <BackToSplash hideHome desktopBackTo="/" desktopBackLabel="Regresar" />
      )}

      {/* ── Pop-up de cupones/promociones ── */}
      {showPromoSplash && (
        <PromoSplash
          onClose={() => setShowPromoSplash(false)}
          onGoToCoupon={(promoId) => {
            setShowPromoSplash(false);
            navigate(`/cupon/${promoId}?from=store`);
          }}
          onOpenWallet={() => {
            setShowPromoSplash(false);
            if (isLoggedIn) {
              setWalletSheetOpen(true);
            } else {
              setShowAuthModal(true);
            }
          }}
        />
      )}

      {/* Modal de autenticación unificada */}
      <NutriserAuthModal
        isOpen={showAuthModal}
        onClose={() => { setShowAuthModal(false); setPendingCartItem(null); }}
        onSuccess={handleAuthSuccess}
        contextMessage="Necesitas una cuenta para acceder a tu monedero, cupones, beneficios de lealtad y realizar compras."
      />

      {/* ── Carrito flotante ── */}
      {cartCount > 0 && !checkoutOpen && !cartOpen && (
        <button onClick={() => setCartOpen(true)}
          className="fixed bottom-20 right-4 z-[55] bg-[#C5A55A] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:bg-[#B8963E] transition-all active:scale-95">
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
        </button>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          HEADER — Estilo tienda comercial
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 lg:py-4">
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Logo */}
            <img src={LOGO_URL} alt="Nutriser" className="w-10 h-10 lg:w-12 lg:h-12 object-contain flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[#C5A55A] text-[9px] lg:text-[10px] tracking-[0.2em] uppercase font-semibold">Aesthetic & Nutrition</p>
              <h1 className="text-gray-900 text-lg lg:text-xl font-black leading-tight">Nutriser Shop</h1>
            </div>

            {/* Session + Cart */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isLoggedIn && patient ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[#C5A55A] text-[10px] font-bold leading-tight">
                      {patient.name.split(' ')[0]}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]" />
                      <span className="text-green-600 text-[8px] font-semibold leading-tight">Activa</span>
                    </div>
                  </div>
                  <div className="relative w-8 h-8 rounded-full bg-[#C5A55A]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#C5A55A]" />
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                  <button onClick={logout} title="Cerrar sesión"
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 bg-[#C5A55A] text-white px-3 py-2 rounded-full text-xs font-bold hover:bg-[#B8963E] active:scale-95 transition-all">
                  <User className="w-3.5 h-3.5" />
                  Iniciar sesión
                </button>
              )}
              {/* Language toggle */}
              <button
                onClick={toggleLang}
                title={lang === "ES" ? "Switch to English" : "Cambiar a Español"}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all text-xs font-bold text-gray-600 active:scale-95"
              >
                <Globe className="w-3.5 h-3.5 text-[#C5A55A]" />
                <span>{lang}</span>
              </button>
              <button onClick={() => setCartOpen(true)} className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {activeTab === "tratamientos" && (
            <div className="relative mt-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="¿Qué estás buscando?"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 border-0 rounded-full pl-10 pr-4 py-2.5 lg:py-3 text-sm lg:text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/50 transition-all" />
            </div>
          )}
        </div>
      </div>

      {/* ── Banner Carrusel de Ofertas (clickeable → comprar paquete) ── */}
      <PromoBanner onBannerClick={(pkgIndex) => {
        const pkg = PACKAGES[pkgIndex];
        if (pkg) {
          openCheckout({
            id: pkg.id,
            name: pkg.name,
            price: pkg.price,
            priceLabel: `$${pkg.price.toLocaleString("es-MX")} MXN`,
            qty: 1,
            imageUrl: pkg.imageUrl,
            category: pkg.category,
            itemType: "package",
          });
        }
      }} />

      {/* ══════════════════════════════════════════════════════════════════════
          TABS — Estilo app comercial
      ══════════════════════════════════════════════════════════════════════ */}
      {/* Tabs moved to bottom navigation bar */}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: TRATAMIENTOS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "tratamientos" && (
        <div className="pb-28">
          {/* ── Categorías con iconos circulares (scroll horizontal) ── */}
          <div className="bg-white mt-2 py-4">
            <div className="max-w-7xl mx-auto px-4">
              <h3 className="text-gray-900 font-bold text-base mb-3">Categorías</h3>
              <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-1 lg:justify-center" style={{ scrollbarWidth: "none" }}>
                {/* Todos */}
                <button onClick={() => setActiveCategory("all")} className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[64px] lg:min-w-[80px]">
                  <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all ${
                    activeCategory === "all" ? "bg-[#C5A55A] shadow-lg shadow-[#C5A55A]/30" : "bg-gray-100"
                  }`}>
                    <Package className={`w-6 h-6 ${activeCategory === "all" ? "text-white" : "text-gray-500"}`} />
                  </div>
                  <span className={`text-[10px] font-semibold ${activeCategory === "all" ? "text-[#C5A55A]" : "text-gray-500"}`}>Todos</span>
                </button>
                {/* Paquetes */}
                <button onClick={() => setActiveCategory("packages")} className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[64px]">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    activeCategory === "packages" ? "bg-[#C5A55A] shadow-lg shadow-[#C5A55A]/30" : "bg-amber-50"
                  }`}>
                    <Crown className={`w-6 h-6 ${activeCategory === "packages" ? "text-white" : "text-amber-600"}`} />
                  </div>
                  <span className={`text-[10px] font-semibold ${activeCategory === "packages" ? "text-[#C5A55A]" : "text-gray-500"}`}>Paquetes</span>
                </button>
                {sortedCategories.map(cat => {
                  const meta = CATEGORY_META[cat] ?? { label: cat, icon: Package, color: "#888", bg: "#f3f4f6" };
                  const Icon = meta.icon;
                  const isActive = activeCategory === cat;
                  return (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[64px] lg:min-w-[80px]">
                      <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all ${
                        isActive ? "shadow-lg" : ""
                      }`} style={{ backgroundColor: isActive ? meta.color : meta.bg }}>
                        <Icon className="w-6 h-6" style={{ color: isActive ? "#fff" : meta.color }} />
                      </div>
                      <span className={`text-[10px] font-semibold ${isActive ? "text-gray-900" : "text-gray-500"}`}>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Paquetes Especiales (scroll horizontal) ── */}
          {(activeCategory === "all" || activeCategory === "packages") && (
            <div className="bg-white mt-2 py-5">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-black text-gray-900 text-lg">Paquetes Especiales</h2>
                    <p className="text-gray-400 text-xs">Los mejores precios en tratamientos combinados</p>
                  </div>
                  <span className="text-[#C5A55A] text-xs font-bold flex items-center gap-0.5">
                    Ver todo <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <HScrollRail className="lg:!flex lg:!gap-6">
                  {PACKAGES.map(pkg => {
                    const savings = pkg.regularPrice - pkg.price;
                    const savingsPct = Math.round((savings / pkg.regularPrice) * 100);
                    return (
                      <div key={pkg.id} className="flex-shrink-0 w-72 sm:w-80 lg:w-[calc(50%-0.75rem)] lg:flex-shrink bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                        {/* Image */}
                        <div className="relative h-40 overflow-hidden">
                          <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <div className="absolute top-2 left-2 bg-[#C5A55A] text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> {pkg.badge}
                          </div>
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); toggleWishlist({ id: pkg.id, name: pkg.name, price: pkg.price, priceLabel: `$${pkg.price.toLocaleString("es-MX")} MXN`, imageUrl: pkg.imageUrl, category: pkg.category, itemType: "package" }); }} className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all">
                              <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(pkg.id) ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                            </button>
                            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full">-{savingsPct}%</span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">{pkg.name}</h3>
                          <p className="text-gray-400 text-xs line-clamp-2 mb-3">{pkg.description}</p>

                          <div className="flex items-end gap-2 mb-1">
                            <span className="text-2xl font-black text-[#C5A55A]">${pkg.price.toLocaleString("es-MX")}</span>
                            <span className="text-xs text-gray-400 mb-0.5">MXN</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-gray-300 line-through">${pkg.regularPrice.toLocaleString("es-MX")}</span>
                            <span className="text-[10px] bg-green-50 text-green-600 font-bold px-2 py-0.5 rounded-full">
                              Ahorras ${savings.toLocaleString("es-MX")}
                            </span>
                          </div>

                          <ul className="space-y-1 mb-3">
                            {pkg.features.slice(0, 2).map((f, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-500">
                                <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />{f}
                              </li>
                            ))}
                            {pkg.features.length > 2 && (
                              <li className="text-[11px] text-[#C5A55A] font-semibold pl-4">+{pkg.features.length - 2} más</li>
                            )}
                          </ul>

                          <div className="flex gap-2">
                            <button onClick={() => addToCart({ id: pkg.id, name: pkg.name, price: pkg.price, priceLabel: `$${pkg.price.toLocaleString("es-MX")} MXN`, imageUrl: pkg.imageUrl, category: pkg.category, itemType: "package" })}
                              className="flex-1 flex items-center justify-center gap-1 border border-[#C5A55A] text-[#C5A55A] font-bold text-[11px] py-2.5 rounded-xl hover:bg-[#C5A55A]/5 transition-all active:scale-95">
                              <ShoppingCart className="w-3.5 h-3.5" /> Al carrito
                            </button>
                            <button onClick={() => openCheckout({ id: pkg.id, name: pkg.name, price: pkg.price, priceLabel: `$${pkg.price.toLocaleString("es-MX")} MXN`, qty: 1, imageUrl: pkg.imageUrl, category: pkg.category, itemType: "package" })}
                              className="flex-1 flex items-center justify-center gap-1 bg-[#C5A55A] text-white font-bold text-[11px] py-2.5 rounded-xl hover:bg-[#B8963E] transition-all active:scale-95">
                              <Zap className="w-3.5 h-3.5" /> Comprar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </HScrollRail>
              </div>
            </div>
          )}

          {/* ── Servicios por categoría (scroll horizontal por cada categoría) ── */}
          {activeCategory !== "packages" && (
            <div className="mt-2">
              {loadingServices ? (
                <div className="flex justify-center py-20 bg-white"><Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" /></div>
              ) : activeCategory === "all" ? (
                /* Mostrar cada categoría como sección con scroll horizontal */
                Object.entries(servicesByCategory).map(([cat, catServices]) => {
                  const meta = CATEGORY_META[cat] ?? CATEGORY_META.general;
                  const Icon = meta.icon;
                  return (
                    <div key={cat} className="bg-white mt-2 py-5">
                      <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: meta.bg }}>
                              <Icon className="w-4 h-4" style={{ color: meta.color }} />
                            </div>
                            <h2 className="font-bold text-gray-900 text-base">{meta.label}</h2>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{catServices.length}</span>
                          </div>
                          <button onClick={() => setActiveCategory(cat)} className="text-[#C5A55A] text-xs font-bold flex items-center gap-0.5">
                            Ver todo <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <HScrollRail>
                          {catServices.map(service => {
                            const priceNum = service.price ? parseInt(service.price.replace(/[^0-9]/g, "")) : null;
                            return (
                              <div key={service.id} className="flex-shrink-0 w-52 sm:w-56 lg:w-60 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="relative h-32 lg:h-40 overflow-hidden">
                                  {service.imageUrl ? (
                                    <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: meta.bg }}>
                                      <Icon className="w-10 h-10 opacity-30" style={{ color: meta.color }} />
                                    </div>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); toggleWishlist({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: formatServicePrice(service.price), imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" }); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all">
                                    <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(`svc-${service.id}`) ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                                  </button>
                                </div>
                                <div className="p-3">
                                  <h3 className="font-bold text-gray-900 text-xs lg:text-sm leading-snug mb-1 line-clamp-2">{service.name}</h3>
                                  {service.price && service.price !== "Consultar precio" ? (
                                    <p className="text-[#C5A55A] font-black text-sm mb-2">{formatServicePrice(service.price)}</p>
                                  ) : (
                                    <p className="text-gray-400 text-xs mb-2 italic">Consultar precio</p>
                                  )}
                                  <div className="flex gap-1.5">
                                    <button onClick={() => addToCart({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: formatServicePrice(service.price), imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" })}
                                      className="flex-1 flex items-center justify-center gap-0.5 border border-gray-200 text-gray-600 font-bold text-[10px] py-2 rounded-lg hover:bg-gray-50 transition-all active:scale-95">
                                      <ShoppingCart className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => openCheckout({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: formatServicePrice(service.price), qty: 1, imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" })}
                                      className="flex-1 flex items-center justify-center gap-0.5 bg-[#C5A55A] text-white font-bold text-[10px] py-2 rounded-lg hover:bg-[#B8963E] transition-all active:scale-95">
                                      <Zap className="w-3 h-3" /> Comprar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </HScrollRail>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Filtro de categoría específica — grid vertical */
                <div className="bg-white mt-2 py-5">
                  <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: (CATEGORY_META[activeCategory] ?? CATEGORY_META.general).bg }}>
                        {(() => { const Icon = (CATEGORY_META[activeCategory] ?? CATEGORY_META.general).icon; return <Icon className="w-4 h-4" style={{ color: (CATEGORY_META[activeCategory] ?? CATEGORY_META.general).color }} />; })()}
                      </div>
                      <h2 className="font-bold text-gray-900 text-lg">{(CATEGORY_META[activeCategory] ?? CATEGORY_META.general).label}</h2>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filteredServices.length}</span>
                    </div>
                    {filteredServices.length === 0 ? (
                      <div className="text-center py-16">
                        <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No se encontraron servicios</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
                        {filteredServices.map(service => {
                          const catMeta = CATEGORY_META[service.category ?? "general"] ?? CATEGORY_META.general;
                          const CatIcon = catMeta.icon;
                          const priceNum = service.price ? parseInt(service.price.replace(/[^0-9]/g, "")) : null;
                          return (
                            <div key={service.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                              <div className="relative h-32 overflow-hidden">
                                {service.imageUrl ? (
                                  <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: catMeta.bg }}>
                                    <CatIcon className="w-10 h-10 opacity-30" style={{ color: catMeta.color }} />
                                  </div>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); toggleWishlist({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: formatServicePrice(service.price), imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" }); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all">
                                  <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(`svc-${service.id}`) ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                                </button>
                              </div>
                              <div className="p-3 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1 line-clamp-2">{service.name}</h3>
                                {service.description && <p className="text-gray-400 text-[10px] line-clamp-2 mb-2">{service.description}</p>}
                                <div className="mt-auto">
                                  {service.price && service.price !== "Consultar precio" ? (
                                    <p className="text-[#C5A55A] font-black text-sm mb-2">{formatServicePrice(service.price)}</p>
                                  ) : (
                                    <p className="text-gray-400 text-xs mb-2 italic">Consultar precio</p>
                                  )}
                                  <div className="flex gap-1.5">
                                    <button onClick={() => addToCart({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: formatServicePrice(service.price), imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" })}
                                      className="flex-1 flex items-center justify-center gap-0.5 border border-gray-200 text-gray-600 font-bold text-[10px] py-2 rounded-lg hover:bg-gray-50 transition-all active:scale-95">
                                      <ShoppingCart className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => openCheckout({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: formatServicePrice(service.price), qty: 1, imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" })}
                                      className="flex-1 flex items-center justify-center gap-0.5 bg-[#C5A55A] text-white font-bold text-[10px] py-2 rounded-lg hover:bg-[#B8963E] transition-all active:scale-95">
                                      <Zap className="w-3 h-3" /> Comprar
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
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: FARMACY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "farmacy" && (
        <div className="pb-28 mt-2">
          <div className="bg-white py-5">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-lg">Nutriser Farmacy</h2>
                    <p className="text-gray-400 text-xs">Productos nutricionales y cosméticos premium</p>
                  </div>
                </div>
              </div>
              {loadingProducts ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" /></div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <FlaskConical className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-400 text-xl mb-2">Próximamente</h3>
                  <p className="text-gray-300 text-sm max-w-xs mx-auto">Estamos preparando nuestra farmacia con productos nutricionales y cosméticos de alta calidad.</p>
                </div>
              ) : (
                <HScrollRail>
                  {products.map(product => {
                    const priceNum = product.price ? parseInt(product.price.replace(/[^0-9]/g, "")) : null;
                    return (
                      <div key={product.id} className="flex-shrink-0 w-48 sm:w-52 lg:w-56 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="relative h-40 lg:h-48 overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <FlaskConical className="w-10 h-10 text-gray-200" />
                            </div>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); toggleWishlist({ id: `prd-${product.id}`, name: product.name, price: priceNum ?? 0, priceLabel: product.price ?? "Consultar", imageUrl: product.imageUrl, category: product.category ?? "general", itemType: "product" }); }} className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all">
                            <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(`prd-${product.id}`) ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                          </button>
                          {product.stock !== null && product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                              Últimas {product.stock}
                            </div>
                          )}
                        </div>
                        <div className="p-3 flex-1 flex flex-col">
                          <p className="text-[9px] text-purple-600 font-semibold uppercase tracking-wider mb-0.5">{product.category || "Producto"}</p>
                          <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1 line-clamp-2">{product.name}</h3>
                          <div className="mt-auto">
                            {product.price ? (
                              <p className="text-[#C5A55A] font-black text-sm mb-2">{product.price}</p>
                            ) : (
                              <p className="text-gray-400 text-xs mb-2 italic">Consultar</p>
                            )}
                            <div className="flex gap-1.5">
                              <button onClick={() => addToCart({ id: `prd-${product.id}`, name: product.name, price: priceNum ?? 0, priceLabel: product.price ?? "Consultar", imageUrl: product.imageUrl, category: product.category ?? "general", itemType: "product", productId: product.id })}
                                className="flex-1 flex items-center justify-center border border-gray-200 text-gray-600 font-bold text-[10px] py-2 rounded-lg hover:bg-gray-50 transition-all active:scale-95">
                                <ShoppingCart className="w-3 h-3" />
                              </button>
                              <button onClick={() => openCheckout({ id: `prd-${product.id}`, name: product.name, price: priceNum ?? 0, priceLabel: product.price ?? "Consultar", qty: 1, imageUrl: product.imageUrl, category: product.category ?? "general", itemType: "product", productId: product.id })}
                                className="flex-1 flex items-center justify-center bg-[#C5A55A] text-white font-bold text-[10px] py-2 rounded-lg hover:bg-[#B8963E] transition-all active:scale-95">
                                <Zap className="w-3 h-3" /> Comprar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </HScrollRail>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: LIBRARY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "library" && (
        <div className="pb-28 mt-2">
          <div className="bg-white py-5">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-lg">Nutriser Library</h2>
                  <p className="text-gray-400 text-xs">Recursos digitales exclusivos para tu bienestar</p>
                </div>
              </div>
              {loadingEbook ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" /></div>
              ) : !ebook ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-400 text-xl mb-2">Próximamente</h3>
                  <p className="text-gray-300 text-sm max-w-xs mx-auto">Estamos preparando libros y recursos digitales exclusivos para ti.</p>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md">
                    {ebook.coverUrl && (
                      <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-8">
                        <img src={ebook.coverUrl} alt={ebook.title} className="max-h-80 w-auto object-contain rounded-lg shadow-xl" />
                        <button onClick={(e) => { e.stopPropagation(); toggleWishlist({ id: `ebook-${ebook.id}`, name: ebook.title, price: (ebook as any).presalePrice ? parseFloat(String((ebook as any).presalePrice)) : parseFloat(String(ebook.price)), priceLabel: `$${((ebook as any).presalePrice ? parseFloat(String((ebook as any).presalePrice)) : parseFloat(String(ebook.price))).toLocaleString("es-MX")} MXN`, imageUrl: ebook.coverUrl, category: "ebook", itemType: "ebook" }); }} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all">
                          <Heart className={`w-4 h-4 transition-colors ${isInWishlist(`ebook-${ebook.id}`) ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                        </button>
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider mb-1">eBook Digital</p>
                      <h3 className="font-black text-gray-900 text-xl leading-snug mb-2">{ebook.title}</h3>
                      {ebook.description && <p className="text-gray-500 text-sm leading-relaxed mb-4">{ebook.description}</p>}
                      {(ebook as any).presalePrice ? (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">Pre-compra</span>
                            <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">Precio especial</span>
                          </div>
                          <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-[#C5A55A]">${parseFloat(String((ebook as any).presalePrice)).toLocaleString("es-MX", { minimumFractionDigits: 0 })}</span>
                            <span className="text-sm text-gray-400 mb-1">MXN</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">Precio regular: <span className="line-through">${parseFloat(String(ebook.price)).toLocaleString("es-MX", { minimumFractionDigits: 0 })} MXN</span></p>
                        </div>
                      ) : (
                        <div className="flex items-end gap-2 mb-4">
                          <span className="text-3xl font-black text-[#C5A55A]">${parseFloat(String(ebook.price)).toLocaleString("es-MX", { minimumFractionDigits: 0 })}</span>
                          <span className="text-sm text-gray-400 mb-1">MXN</span>
                        </div>
                      )}
                      {ebook.comingSoon ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                          <p className="text-amber-700 font-bold text-sm">Próximamente disponible</p>
                          <p className="text-gray-400 text-xs mt-1">Suscríbete para recibir notificación</p>
                        </div>
                      ) : (
                        <button onClick={() => openCheckout({
                          id: `ebook-${ebook.id}`, name: ebook.title,
                          price: (ebook as any).presalePrice ? parseFloat(String((ebook as any).presalePrice)) : parseFloat(String(ebook.price)),
                          priceLabel: `$${((ebook as any).presalePrice ? parseFloat(String((ebook as any).presalePrice)) : parseFloat(String(ebook.price))).toLocaleString("es-MX")} MXN`,
                          qty: 1, imageUrl: ebook.coverUrl,
                          category: "ebook", itemType: "ebook", ebookId: ebook.id,
                        })}
                          className="w-full flex items-center justify-center gap-2 bg-[#C5A55A] text-white font-bold py-3.5 rounded-xl hover:bg-[#B8963E] transition-all active:scale-95 shadow-md">
                          <Zap className="w-4 h-4" /> Comprar ahora
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-4">Para ver el eBook completo, visita <button onClick={() => navigate("/ebook")} className="text-[#C5A55A] underline hover:text-[#B8963E]">Nutriser Library</button></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: MIS TRATAMIENTOS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "misTratamientos" && (
        <div className="pb-28 mt-2">
          <div className="bg-white py-5">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-[#C5A55A]" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-lg">Mis Tratamientos</h2>
                  <p className="text-gray-400 text-xs">Tu historial, citas, cupones y consentimiento</p>
                </div>
              </div>
              {!isLoggedIn ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-[#FAF7F2] flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-10 h-10 text-[#C5A55A]" />
                  </div>
                  <h3 className="font-bold text-gray-700 text-xl mb-2">Accede a tu portal</h3>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">Inicia sesión para ver tus tratamientos, citas, cupones y contrato de consentimiento.</p>
                  <button
                    onClick={() => navigate("/mis-tratamientos")}
                    className="bg-[#C5A55A] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#B8963E] transition-all active:scale-95 shadow-md"
                  >
                    Ir a Mis Tratamientos
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/mis-tratamientos")}
                    className="w-full flex items-center justify-between bg-[#FAF7F2] border border-[#E8DCC8] rounded-2xl p-4 hover:bg-[#F5EFE3] transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#C5A55A]/10 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-[#C5A55A]" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm">Ver mis tratamientos</p>
                        <p className="text-gray-400 text-xs">Historial, citas y seguimiento</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => navigate("/mis-tratamientos")}
                    className="w-full flex items-center justify-between bg-[#FAF7F2] border border-[#E8DCC8] rounded-2xl p-4 hover:bg-[#F5EFE3] transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#C5A55A]/10 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-[#C5A55A]" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm">Mis cupones</p>
                        <p className="text-gray-400 text-xs">Descuentos y promociones activas</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => navigate("/mis-tratamientos")}
                    className="w-full flex items-center justify-between bg-[#FAF7F2] border border-[#E8DCC8] rounded-2xl p-4 hover:bg-[#F5EFE3] transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#C5A55A]/10 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-[#C5A55A]" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm">Mis compras</p>
                        <p className="text-gray-400 text-xs">Paquetes y servicios adquiridos</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => navigate("/mis-tratamientos")}
                    className="w-full flex items-center justify-between bg-[#FAF7F2] border border-[#E8DCC8] rounded-2xl p-4 hover:bg-[#F5EFE3] transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#C5A55A]/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-[#C5A55A]" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm">Consentimiento informado</p>
                        <p className="text-gray-400 text-xs">Contrato firmado digitalmente</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: LISTA DE DESEOS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "wishlist" && (
        <div className="pb-28 mt-2">
          <div className="bg-white py-5">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-lg">Lista de Deseos</h2>
                  <p className="text-gray-400 text-xs">{wishlistCount} {wishlistCount === 1 ? "artículo guardado" : "artículos guardados"}</p>
                </div>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-400 text-xl mb-2">Tu lista está vacía</h3>
                  <p className="text-gray-300 text-sm max-w-xs mx-auto">Toca el corazón en cualquier artículo para guardarlo aquí.</p>
                  <button onClick={() => setActiveTab("tratamientos")} className="mt-4 text-[#C5A55A] font-bold text-sm hover:underline">Explorar tratamientos</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {wishlist.map(item => {
                    const typeLabels: Record<string, string> = { service: "Tratamiento", package: "Paquete", product: "Producto", ebook: "eBook" };
                    return (
                      <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex">
                        {/* Image */}
                        <div className="relative w-24 h-24 flex-shrink-0 bg-gray-50">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Heart className="w-6 h-6 text-gray-200" />
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 p-3 flex flex-col min-w-0">
                          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">{typeLabels[item.itemType] || "Artículo"}</p>
                          <h3 className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 mt-0.5">{item.name}</h3>
                          <p className="text-[#C5A55A] font-black text-sm mt-auto">{item.priceLabel}</p>
                          <div className="flex gap-1.5 mt-2">
                            <button
                              onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, priceLabel: item.priceLabel, imageUrl: item.imageUrl, category: item.category ?? "general", itemType: item.itemType, productId: item.productId, ebookId: item.ebookId })}
                              className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-600 font-bold text-[10px] py-1.5 rounded-lg hover:bg-gray-50 transition-all active:scale-95"
                            >
                              <ShoppingCart className="w-3 h-3" /> Agregar
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-all active:scale-95"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL: CARRITO
      ══════════════════════════════════════════════════════════════════════ */}
      {cartOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          {/* Cart panel — bottom sheet en móvil, sidebar en desktop */}
          <div className="relative mt-auto sm:mt-0 sm:ml-auto w-full sm:w-full sm:max-w-sm bg-white sm:h-full max-h-[85vh] sm:max-h-full flex flex-col shadow-2xl rounded-t-3xl sm:rounded-none"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            {/* Handle bar (solo móvil) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#C5A55A]" />
                <h2 className="font-bold text-gray-900">Mi Carrito</h2>
                <span className="bg-[#C5A55A] text-white text-xs font-black px-2 py-0.5 rounded-full">{cartCount}</span>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            {/* Content */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium">Tu carrito está vacío</p>
                <p className="text-gray-300 text-sm mt-1">Agrega tratamientos, productos o libros</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{item.name}</p>
                        <p className="text-[#C5A55A] font-black text-sm mt-1">{item.priceLabel}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-500 active:scale-90 transition-all"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="text-sm font-bold w-5 text-center text-gray-900">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-500 active:scale-90 transition-all"><Plus className="w-3.5 h-3.5" /></button>
                          <button onClick={() => removeFromCart(item.id)} className="ml-auto p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Footer fijo */}
                <div className="p-4 border-t border-gray-100 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-xl font-black text-[#C5A55A]">${cartTotal.toLocaleString("es-MX")} MXN</span>
                  </div>
                  <button onClick={() => { setCartOpen(false); openCheckout(); }}
                    className="w-full bg-[#C5A55A] text-white font-black py-4 rounded-xl hover:bg-[#B8963E] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg text-base">
                    <Zap className="w-5 h-5" /> Proceder al pago
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900 text-base">
                {successCode ? "¡Pedido Enviado!" : "Finalizar Compra"}
              </h2>
              <button onClick={() => setCheckoutOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {successCode ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-2">¡Comprobante recibido!</h3>
                <p className="text-gray-500 text-sm mb-4">Tu pedido está en revisión. Te contactaremos pronto para confirmar.</p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-400 mb-1">Código de seguimiento</p>
                  <p className="font-black text-[#C5A55A] text-lg font-mono">{successCode}</p>
                </div>
                <button onClick={() => { setCheckoutOpen(false); setCart([]); }}
                  className="w-full bg-[#C5A55A] text-white font-bold py-3 rounded-xl hover:bg-[#B8963E] transition-all">
                  Listo
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitCheckout} className="p-4 space-y-5">
                {/* Resumen */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tu pedido</p>
                  {checkoutItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium line-clamp-1 flex-1 mr-2">{item.qty}x {item.name}</span>
                      <span className="text-[#C5A55A] font-bold flex-shrink-0">{item.priceLabel}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 flex items-center justify-between font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-[#C5A55A]">{hasValidPrice ? `$${checkoutTotal.toLocaleString("es-MX")} MXN` : "Consultar precio"}</span>
                  </div>
                </div>
                {/* Código de descuento */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Código de descuento</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <Input value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="Ingresa tu código de descuento" className="pl-9" />
                    </div>
                    <Button type="button" onClick={handleValidateDiscount} disabled={discountValidating} className="bg-[#C5A55A] hover:bg-[#B8963E] text-white px-3 text-sm">
                      {discountValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                    </Button>
                  </div>
                  {discountInfo?.valid && (
                    <div className="mt-2 flex items-center gap-2 text-green-600 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{discountInfo.isGift ? "¡Regalo aplicado! Tu compra es gratis." : discountInfo.isTwoForOne ? "¡2x1 aplicado!" : `${discountInfo.discount}% de descuento — Total: $${discountedTotal.toLocaleString("es-MX")} MXN`}</span>
                    </div>
                  )}
                </div>
                {/* Datos del comprador */}
                {isLoggedIn && patient ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tus datos</p>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-green-700">{patient.name}</p>
                        <p className="text-xs text-green-600">{patient.email}</p>
                        {(patient as any).phone && <p className="text-xs text-green-500">{(patient as any).phone}</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tus datos</p>
                    <div>
                      <Label htmlFor="co-name" className="text-sm text-gray-600">Nombre completo *</Label>
                      <Input id="co-name" value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Tu nombre completo" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="co-email" className="text-sm text-gray-600">Correo electrónico *</Label>
                      <Input id="co-email" type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="tu@email.com" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="co-phone" className="text-sm text-gray-600">Teléfono *</Label>
                      <Input id="co-phone" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="+52 322..." required className="mt-1" />
                    </div>
                  </div>
                )}
                {/* Monedero Nutriser */}
                {isLoggedIn && hasValidPrice && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Monedero Nutriser</p>
                    {/* Saldo y opción de usar */}
                    <div className={`border rounded-xl p-3 transition-all ${useWallet ? 'border-[#C5A55A] bg-amber-50/50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-[#C5A55A] flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">Tu saldo</p>
                          <p className="text-xs text-gray-500">Disponible: <span className="font-bold text-[#C5A55A]">${(walletBalance / 100).toFixed(2)} MXN</span></p>
                        </div>
                      </div>
                      {walletBalance > 0 && (
                        <label className="flex items-center gap-3 cursor-pointer mt-2 pt-2 border-t border-gray-200">
                          <input
                            type="checkbox"
                            checked={useWallet}
                            onChange={(e) => {
                              setUseWallet(e.target.checked);
                              if (e.target.checked) {
                                const maxApply = Math.min(walletBalance, discountedTotal * 100);
                                setWalletAmount(maxApply);
                              } else {
                                setWalletAmount(0);
                              }
                            }}
                            className="w-4 h-4 accent-[#C5A55A]"
                          />
                          <span className="text-sm text-gray-700">Usar saldo para pagar</span>
                        </label>
                      )}
                      {useWallet && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Descuento monedero:</span>
                            <span className="font-bold text-green-600">-${(walletAmount / 100).toFixed(2)} MXN</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-600">{fullyCoveredByWallet ? "Cubierto con monedero" : "Restante a transferir:"}:</span>
                            <span className={`font-bold ${fullyCoveredByWallet ? 'text-green-600' : 'text-[#C5A55A]'}`}>
                              {fullyCoveredByWallet ? "$0.00 MXN" : `$${transferAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Cashback informativo */}
                    {cashbackAmount > 0 && (
                      <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <p className="text-xs text-emerald-700">
                          Con esta compra ganarás <span className="font-bold">${cashbackAmount.toLocaleString("es-MX")} MXN</span> de cashback en tu monedero
                          <span className="text-emerald-500 block text-[10px] mt-0.5">(disponible para tu próxima compra)</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {/* Datos bancarios — ocultar si el monedero cubre todo */}
                {!fullyCoveredByWallet && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Datos para transferencia</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Banco: <span className="font-bold text-gray-700">{BANK_INFO.bank}</span></p>
                        <p className="text-xs text-gray-500">CLABE: <span className="font-bold font-mono text-gray-700">{BANK_INFO.account}</span></p>
                      </div>
                      <CopyButton text={BANK_INFO.account} />
                    </div>
                    <p className="text-xs text-gray-500">Monto: <span className="font-black text-[#C5A55A]">{hasValidPrice ? `$${transferAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN` : "Consultar precio"}</span>{useWallet && walletAmount > 0 && <span className="text-green-600 text-[10px] ml-1">(monedero: -${(walletAmount / 100).toFixed(2)})</span>}</p>
                  </div>
                )}
                {/* Comprobante — solo si necesita transferir */}
                {!fullyCoveredByWallet && (
                  <div>
                    <Label className="text-sm text-gray-600">Comprobante de pago *</Label>
                    <label className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:border-[#C5A55A] hover:bg-amber-50/50 transition-all">
                      {proofFile ? (
                        <div className="text-center">
                          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-green-700">{proofFile.name}</p>
                          <p className="text-xs text-gray-400">Toca para cambiar</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-1" />
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
                )}
                <Button type="submit" disabled={isSubmitting} className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-black py-3.5 text-base rounded-xl shadow-md">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (fullyCoveredByWallet ? "Confirmar compra con monedero" : "Enviar comprobante y confirmar pedido")}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          BARRA DE NAVEGACIÓN INFERIOR (estilo Farmacias del Ahorro)
      ══════════════════════════════════════════════════════════════════════ */}
      {!walletSheetOpen && !checkoutOpen && !cartOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[60]">
          <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
            <div className="max-w-lg lg:max-w-2xl mx-auto flex items-end justify-around px-1 lg:px-4 pt-1 lg:pt-2">
              {/* Servicios */}
              <button
                onClick={() => setActiveTab("tratamientos")}
                className={`flex flex-col items-center gap-0.5 lg:gap-1 py-1.5 lg:py-2 px-1 lg:px-2 min-w-[44px] lg:min-w-[60px] transition-colors ${
                  activeTab === "tratamientos" ? "text-[#C5A55A]" : "text-gray-400"
                }`}
              >
                <Sparkles className="w-5 h-5 lg:w-7 lg:h-7" />
                <span className="text-[9px] lg:text-xs font-semibold leading-tight">Servicios</span>
              </button>

              {/* Library */}
              <button
                onClick={() => setActiveTab("library")}
                className={`flex flex-col items-center gap-0.5 lg:gap-1 py-1.5 lg:py-2 px-1 lg:px-2 min-w-[44px] lg:min-w-[60px] transition-colors ${
                  activeTab === "library" ? "text-[#C5A55A]" : "text-gray-400"
                }`}
              >
                <BookOpen className="w-5 h-5 lg:w-7 lg:h-7" />
                <span className="text-[9px] lg:text-xs font-semibold leading-tight">Library</span>
              </button>

              {/* Farmacy */}
              <button
                onClick={() => setActiveTab("farmacy")}
                className={`flex flex-col items-center gap-0.5 lg:gap-1 py-1.5 lg:py-2 px-1 lg:px-2 min-w-[44px] lg:min-w-[60px] transition-colors ${
                  activeTab === "farmacy" ? "text-[#C5A55A]" : "text-gray-400"
                }`}
              >
                <FlaskConical className="w-5 h-5 lg:w-7 lg:h-7" />
                <span className="text-[9px] lg:text-xs font-semibold leading-tight">Farmacy</span>
              </button>

              {/* Monedero — Botón central flotante */}
              <button
                onClick={() => {
                  if (!isLoggedIn) { setShowAuthModal(true); return; }
                  setWalletSheetOpen(true);
                }}
                className="flex flex-col items-center -mt-6 lg:-mt-8 relative"
                aria-label="Mi Monedero Nutriser"
              >
                <div className="w-[58px] h-[58px] lg:w-[76px] lg:h-[76px] rounded-full bg-gradient-to-br from-[#C5A55A] via-[#D4B86A] to-[#B8963E] shadow-[0_4px_16px_rgba(197,165,90,0.5)] flex items-center justify-center border-[3px] lg:border-4 border-white hover:scale-105 active:scale-95 transition-all">
                  <div className="w-[44px] h-[44px] lg:w-[58px] lg:h-[58px] rounded-full bg-white flex items-center justify-center">
                    <img src={LOGO_URL} alt="Monedero" className="w-8 h-8 lg:w-11 lg:h-11 rounded-full object-contain" />
                  </div>
                </div>
                <span className="text-[9px] lg:text-xs font-bold text-[#C5A55A] mt-0.5 leading-tight">Monedero</span>
              </button>

              {/* Lista de Deseos */}
              <button
                onClick={() => setActiveTab("wishlist")}
                className={`flex flex-col items-center gap-0.5 lg:gap-1 py-1.5 lg:py-2 px-1 lg:px-2 min-w-[44px] lg:min-w-[60px] transition-colors relative ${
                  activeTab === "wishlist" ? "text-red-500" : "text-gray-400"
                }`}
              >
                <Heart className={`w-5 h-5 lg:w-7 lg:h-7 ${activeTab === "wishlist" || wishlistCount > 0 ? "" : ""}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 right-0 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount > 9 ? "9+" : wishlistCount}</span>
                )}
                <span className="text-[8px] lg:text-xs font-semibold leading-tight">Deseos</span>
              </button>

              {/* Mi Seguimiento */}
              <button
                onClick={() => navigate("/mis-tratamientos")}
                className="flex flex-col items-center gap-0.5 lg:gap-1 py-1.5 lg:py-2 px-1 lg:px-2 min-w-[44px] lg:min-w-[60px] transition-colors text-gray-400 hover:text-[#C5A55A]"
              >
                <ClipboardList className="w-5 h-5 lg:w-7 lg:h-7" />
                <span className="text-[9px] lg:text-xs font-semibold leading-tight">Mi Seguimiento</span>
              </button>

              {/* Cuenta */}
              <button
                onClick={() => {
                  if (!isLoggedIn) { setShowAuthModal(true); return; }
                  navigate("/monedero");
                }}
                className="flex flex-col items-center gap-0.5 lg:gap-1 py-1.5 lg:py-2 px-1 lg:px-2 min-w-[44px] lg:min-w-[60px] transition-colors text-gray-400"
              >
                <User className="w-5 h-5 lg:w-7 lg:h-7" />
                <span className="text-[9px] lg:text-xs font-semibold leading-tight">Cuenta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          BOTTOM SHEET — TARJETA MONEDERO
      ══════════════════════════════════════════════════════════════════════ */}
      {walletSheetOpen && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center md:justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setWalletSheetOpen(false)} />
          {/* Sheet: mobile = bottom sheet | desktop (md+) = centered card */}
          <div className="relative w-full md:max-w-[420px] md:rounded-3xl md:mx-auto bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto" style={{ animation: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'fadeInScale 0.25s ease-out' : 'slideUp 0.3s ease-out' }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            {/* Título */}
            <div className="text-center pb-3 px-5">
              <h2 className="text-lg font-bold text-gray-900">Tu Monedero Nutriser</h2>
            </div>

            {/* ── Tarjeta compacta estilo Farmacias del Ahorro ── */}
            <div className="px-5 pb-3">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Top dark section with logo + card info */}
                <div className="bg-gradient-to-br from-[#1A1A1A] via-[#222] to-[#1A1A1A] p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A55A] to-transparent" />
                  <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#C5A55A]/8 to-transparent rounded-bl-full" />

                  {/* Logo + Title + Status */}
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <img src={LOGO_URL} alt="Nutriser" className="w-10 h-10 object-contain" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#C5A55A] font-black text-xs tracking-widest uppercase">Monedero Nutriser</h3>
                      <p className="text-gray-500 text-[9px] tracking-wide">aesthetic & nutrition</p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider border border-emerald-500/30 flex-shrink-0">ACTIVA</span>
                  </div>

                  {/* QR + Info inline */}
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="bg-white rounded-xl p-2 flex-shrink-0">
                      {walletData ? (
                        <QRCodeSVG
                          value={`nutriser://wallet/${walletData.walletNumber || '0000000000'}`}
                          size={70}
                          level="H"
                          includeMargin={false}
                          bgColor="#FFFFFF"
                          fgColor="#1A1A1A"
                        />
                      ) : (
                        <div className="w-[70px] h-[70px] flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-[#C5A55A]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{patient?.name || '---'}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-white/70 font-mono text-[11px] tracking-wider truncate">{walletData?.walletNumber || '---'}</p>
                        <button onClick={() => { navigator.clipboard.writeText(walletData?.walletNumber || ""); toast.success("Número copiado"); }} className="text-[#C5A55A] flex-shrink-0">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex justify-end mt-1.5">
                        <img src={LOGO_URL} alt="" className="w-12 h-auto object-contain opacity-25" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom white section — saldo */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Saldo disponible</p>
                    <p className="text-[#C5A55A] font-black text-xl">${(walletBalance / 100).toFixed(2)}</p>
                  </div>
                  <button onClick={() => { setWalletSheetOpen(false); navigate("/monedero"); }} className="text-[#C5A55A] text-xs font-semibold hover:underline">Ver Estado de Cuenta</button>
                </div>
              </div>
            </div>

            {/* Botón Ir a mi monedero */}
            <div className="px-5 pb-8 pt-2">
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

      {/* CSS animations for wallet popup */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
