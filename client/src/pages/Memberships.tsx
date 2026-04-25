/**
 * Tienda Nutriser — Tienda Digital Comercial
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
  Loader2, Copy, CheckCheck, Apple, Wand2, Scan, Syringe,
  Droplets, ShoppingBag, Package, Star, Zap, Check, ChevronRight,
  Search, ArrowLeft, Upload, BookOpen, User, LogOut,
  Crown, Heart, Shield, Award, ChevronLeft, Gift, Percent, Wallet, Home, MapPin, ClipboardList, Globe,
  Info, Clock, Tag as TagIcon, DollarSign, PersonStanding, ScanFace, Smile, Bell,
  Leaf, Sparkles, Pill,
} from "lucide-react";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useWishlist } from "@/hooks/useWishlist";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import { useLocation } from "wouter";
import BackToSplash from "@/components/BackToSplash";
import { NutriserWalletCard, QRFullscreenModal } from "@/components/NutriserWalletCard";
import NutriserAuthModal from "@/components/NutriserAuthModal";
import { useDeviceType } from "@/hooks/useDeviceType";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import PromoSplash from "@/components/PromoSplash";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { t, type Lang } from "@/lib/i18n";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import DebtBlockBanner from "@/components/DebtBlockBanner";
import { useDebtCheck } from "@/hooks/useDebtCheck";
import ContractBlockModal from "@/components/ContractBlockModal";

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
function getPackages(lang: Lang) {
  return [
    {
      id: "pkg-nutricion",
      name: lang === "EN" ? "Nutrition Package" : "Paquete Nutrición",
      price: 2000,
      regularPrice: 3200,
      badge: "mostPopular",
      description: lang === "EN"
        ? "Complete personalized nutritional counseling program with follow-up and body scans."
        : "Programa completo de asesoría nutricional personalizada con seguimiento y escaneos corporales.",
      features: lang === "EN" ? [
        "4 personalized nutritional consultations",
        "4 body scans",
        "10% discount on body treatments",
        "Access to online follow-up",
      ] : [
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
      name: lang === "EN" ? "Nutriser Slimming Package" : "Paquete Reductor Nutriser",
      price: 4500,
      regularPrice: 7500,
      badge: "maxSavings",
      description: lang === "EN"
        ? "Comprehensive body slimming package: cavitation, radiofrequency and reducing mesotherapy."
        : "Paquete integral de reducción corporal: cavitaciones, radiofrecuencias y mesoterapia reductora.",
      features: lang === "EN" ? [
        "4 personalized nutritional consultations",
        "4 body cavitation sessions",
        "4 body radiofrequency sessions",
        "4 reducing mesotherapy sessions",
        "10% discount on facial treatments",
        "10% discount on product purchases",
      ] : [
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
}
const PACKAGES = getPackages("ES"); // fallback estático para PromoBanner

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  nutricion: { label: "catNutricion", icon: Apple, color: "#16a34a", bg: "#dcfce7" },
  corporales: { label: "catCorporales", icon: PersonStanding, color: "#C5A55A", bg: "#fef3c7" },
  faciales: { label: "catFaciales", icon: ScanFace, color: "#ec4899", bg: "#fce7f3" },
  medicina: { label: "catMedicina", icon: Syringe, color: "#7c3aed", bg: "#ede9fe" },
  otros: { label: "catOtros", icon: Smile, color: "#0891b2", bg: "#cffafe" },
  productos: { label: "catProductos", icon: Droplets, color: "#C5A55A", bg: "#fef3c7" },
  general: { label: "catGeneral", icon: Package, color: "#6b7280", bg: "#f3f4f6" },
};

const CATEGORY_ORDER = ["nutricion", "corporales", "faciales", "medicina", "otros", "productos", "general"];

const PRODUCT_CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  nutricionales: { label: "catNutricionales", icon: Leaf,     color: "#16a34a", bg: "#dcfce7" },
  cosmeticos:    { label: "catCosmeticos",    icon: Sparkles, color: "#db2777", bg: "#fce7f3" },
  suplementos:   { label: "catSuplementos",   icon: Pill,     color: "#7c3aed", bg: "#ede9fe" },
  cuidado_piel:  { label: "catCuidadoPiel",   icon: Heart,    color: "#C5A55A", bg: "#fef3c7" },
  otros:         { label: "catOtros",         icon: Smile,    color: "#0891b2", bg: "#cffafe" },
  general:       { label: "catGeneral",       icon: Package,  color: "#6b7280", bg: "#f3f4f6" },
};

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
  if (!raw) return "consultPrice";
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
// ─── PromoBanner: carrusel de ancho completo estilo Farmacias del Ahorro ────
const WA_NUMBER = "523221007799";

function PromoBanner({ lang, storeBanners: rawBanners = [], onBannerClick, onSystemBannerClick }: {
  lang: Lang;
  storeBanners?: Array<{ id: number; imageUrl?: string | null; title?: string | null; linkUrl?: string | null; isSystem?: boolean; linkTarget?: string | null }>;
  onBannerClick?: (banner: { id: number; imageUrl?: string | null; title?: string | null }) => void;
  onSystemBannerClick?: (linkTarget: string) => void;
}) {
  // Filtrar banners que no tienen imagen asignada
  const activeBanners = rawBanners.filter(b => b.imageUrl);
  const [idx, setIdx] = useState(0);
  const totalSlides = activeBanners.length;

  useEffect(() => {
    if (totalSlides === 0) return;
    const timer = setInterval(() => setIdx(i => (i + 1) % totalSlides), 5000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  // Si no hay banners activos, no mostrar nada
  if (totalSlides === 0) return null;

  const banner = activeBanners[idx];
  return (
    <div className="relative w-full overflow-hidden" style={{ margin: '0 -0px' }}>
      {/* Aspecto 16:9 edge-to-edge — object-contain para ver imagen completa sin recortar */}
      <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
        <img
          src={banner.imageUrl!}
          alt={banner.title || 'Promo Nutriser'}
          className="absolute inset-0 w-full h-full object-contain cursor-pointer select-none"
          draggable={false}
          onClick={() => {
            if (banner.isSystem && banner.linkTarget && banner.linkTarget !== 'none') {
              onSystemBannerClick?.(banner.linkTarget);
            } else {
              onBannerClick?.(banner);
            }
          }}
        />

        {/* Overlay con nombre para banners del sistema */}
        {banner.isSystem && banner.title && (
          <div
            className="absolute inset-0 flex flex-col justify-end cursor-pointer"
            onClick={() => {
              if (banner.linkTarget && banner.linkTarget !== 'none') {
                onSystemBannerClick?.(banner.linkTarget);
              }
            }}
          >
            {/* Gradiente inferior */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)' }} />
            <div className="relative z-10 px-4 pb-4">
              <p className="text-[#C5A55A] text-[10px] font-bold uppercase tracking-widest mb-0.5">Paquete Especial</p>
              <h3 className="text-white font-black text-xl leading-tight drop-shadow-lg">{banner.title}</h3>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-[#C5A55A] text-[#1A1A1A] font-bold text-xs px-3 py-1.5 rounded-full">
                Ver paquete
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </div>
        )}

        {/* Flechas de navegación */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + totalSlides) % totalSlides); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all z-10"
            >
              &#8249;
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % totalSlides); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all z-10"
            >
              &#8250;
            </button>
          </>
        )}
      </div>
      {/* Dots */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-2 py-2 bg-white">
          {activeBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === idx ? 'bg-[#C5A55A] w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function Memberships() {
  const [, navigate] = useLocation();
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("nutriser-lang");
    return (saved === "EN" || saved === "ES") ? saved as Lang : "ES";
  });
  const toggleLang = () => setLang(prev => {
    const next = prev === "ES" ? "EN" : "ES";
    localStorage.setItem("nutriser-lang", next);
    return next;
  });
  const [activeTab, setActiveTab] = useState<StoreTab>("tratamientos");

  // ─── Sesión unificada ────────────────────────────────────────────────
  const { patient, isLoggedIn, logout } = usePatientAuth();
  const { isMobile } = useDeviceType();
  // ─── Verificación de deuda activa ─────────────────────────────────────────────────────────────────────────
  const { hasDebt: patientHasDebt } = useDebtCheck(patient?.id);
  // ─── Verificación de contrato pendiente ──────────────────────────────────────
  const [contractSigned, setContractSigned] = useState(false);
  const contractStatusQuery = trpc.wallet.checkContractStatus.useQuery(
    { email: patient?.email ?? '' },
    { enabled: isLoggedIn && !!patient?.email, refetchOnWindowFocus: true }
  );
  const contractBlocking = isLoggedIn && !!patient &&
    !contractSigned &&
    contractStatusQuery.data?.contractRequired === true &&
    !contractStatusQuery.data?.consentAcceptedAt;
  const [showPromoSplash, setShowPromoSplash] = useState(
    () => !sessionStorage.getItem("nutriser_tienda_promo_dismissed")
  );
  const [pendingCartItem] = useState<Omit<CartItem, "qty"> | null>(null); // reservado para uso futuro

  // ─── Modal de acción al hacer clic en banner ──────────────────────────────────────
  const [bannerActionModal, setBannerActionModal] = useState<{
    open: boolean;
    banner: { id: number; imageUrl?: string | null; title?: string | null } | null;
  }>({ open: false, banner: null });

  // Diálogo de confirmación antes de guardar el interés
  const [bannerConfirmDialog, setBannerConfirmDialog] = useState<{
    open: boolean;
    banner: { id: number; imageUrl?: string | null; title?: string | null } | null;
  }>({ open: false, banner: null });

  // Mutation tRPC para registrar interés en banner
  const createBannerInterestMutation = trpc.bannerInterests.create.useMutation({
    onSuccess: () => {
      setBannerConfirmDialog({ open: false, banner: null });
      toast.success('¡Interés registrado! Preséntate en la clínica con tu Monedero Nutriser.', { duration: 4000 });
      navigate('/monedero');
    },
    onError: (err) => {
      toast.error('No se pudo registrar tu interés. Intenta de nuevo.');
      console.error('[BannerInterest]', err);
    },
  });

  const handleBannerClick = (banner: { id: number; imageUrl?: string | null; title?: string | null }) => {
    setBannerActionModal({ open: true, banner });
  };

  const handleBannerBuyInClinic = () => {
    const banner = bannerActionModal.banner;
    if (!requireAuth('registrar tu interés en esta promoción')) return;
    // Cerrar el modal de acción y abrir el diálogo de confirmación
    setBannerActionModal({ open: false, banner: null });
    setBannerConfirmDialog({ open: true, banner });
  };

  const handleConfirmBannerInterest = () => {
    const banner = bannerConfirmDialog.banner;
    if (!banner) return;
    createBannerInterestMutation.mutate({
      bannerId: banner.id,
      bannerTitle: banner.title ?? undefined,
      bannerImageUrl: banner.imageUrl ?? undefined,
      patientId: patient?.id ?? undefined,
      patientName: patient?.name ?? undefined,
      patientEmail: patient?.email ?? undefined,
    });
  };

  const handleBannerWhatsApp = () => {
    const banner = bannerActionModal.banner;
    setBannerActionModal({ open: false, banner: null });
    const promoTitle = banner?.title || 'una promoción';
    // Incluir título exacto y URL de la imagen para que el admin sepa qué promoción es
    let msg = `🏷️ Hola Nutriser! Me interesa la promoción: *${promoTitle}*`;
    if (banner?.imageUrl) {
      msg += `\n\n🖼️ Ver imagen de la promoción: ${banner.imageUrl}`;
    }
    msg += `\n\n¿Me pueden dar más información y el precio?`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ─── Guard móvil ───────────────────────────────────────────────────────────────────────
  const [mobileGuardOpen, setMobileGuardOpen] = useState(false);
  const [mobileGuardFeature, setMobileGuardFeature] = useState("acceder a esta función");

  /** Redirige a /mis-tratamientos para crear cuenta o iniciar sesión */
  const requireAuth = (featureDescription: string): boolean => {
    if (isLoggedIn) return true;
    navigate("/mis-tratamientos?returnTo=/memberships");
    return false;
  };

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

  // Limpiar carrito cuando el usuario cierra sesión
  useEffect(() => {
    if (!isLoggedIn && cart.length > 0) {
      setCart([]);
      localStorage.removeItem("nutriser-cart");
    }
  }, [isLoggedIn]);
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

   // ─── Lista de deseos (persistida en localStorage) ──────────────────
  const { wishlist, wishlistCount, isInWishlist, toggleWishlist, removeFromWishlist } = useWishlist(patient?.id);

  // ─── Toast de bienvenida al iniciar sesión (solo una vez por sesión) ──────────
  const welcomeToastShownRef = useRef(false);
  useEffect(() => {
    if (!patient?.id) return;
    // Clave única por usuario y sesión del navegador
    const sessionKey = `welcome_shown_${patient.id}`;
    const alreadyShown = sessionStorage.getItem(sessionKey);
    if (alreadyShown || welcomeToastShownRef.current) return;
    welcomeToastShownRef.current = true;
    sessionStorage.setItem(sessionKey, '1');
    const firstName = patient.name?.split(' ')[0] || patient.name || 'de vuelta';
    const wCount = wishlistCount;
    const cCount = cartCount;
    const parts: string[] = [];
    if (wCount > 0) parts.push(`${wCount} ${wCount === 1 ? 'artículo' : 'artículos'} en tu lista de deseos`);
    if (cCount > 0) parts.push(`${cCount} ${cCount === 1 ? 'artículo' : 'artículos'} en tu carrito`);
    const suffix = parts.length > 0 ? ` Tienes ${parts.join(' y ')}.` : '';
    toast(`👋 ¡Hola de nuevo, ${firstName}!${suffix}`, {
      duration: parts.length > 0 ? 5000 : 3000,
      style: { background: '#1A1A1A', color: '#FAF7F2', borderLeft: '4px solid #C5A55A' },
    });
  }, [patient?.id]);

  const addToCart = (item: Omit<CartItem, "qty">) => {
    // Tracking: evento cart
    track(item.itemType as any, item.id, item.name, "cart");
    if (!requireAuth("agregar al carrito y realizar compras")) return;
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    toast.success(`"${item.name}" agregado al carrito`, { duration: 2000 });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  };

  // ─── Datos de la DB ─────────────────────────────────────────────────────────
  const { data: services = [], isLoading: loadingServices } = trpc.services.list.useQuery();
  const { data: products = [], isLoading: loadingProducts } = trpc.products.list.useQuery();
  const { data: ebook, isLoading: loadingEbook } = trpc.ebook.getActive.useQuery();
  const { data: storeBannersData = [] } = trpc.storeBanners.getActive.useQuery();

  // ─── Traducción automática con LLM ─────────────────────────────────────────
  // Recopila todos los textos del backend que necesitan traducción al EN
  const allTranslatableTexts = useMemo(() => {
    const texts: string[] = [];
    const parseJsonArray = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(Boolean);
      try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed.filter(Boolean) : []; } catch { return []; }
    };
    services.forEach(s => {
      if (s.name) texts.push(s.name);
      if (s.description) texts.push(s.description);
      if ((s as any).duration) texts.push((s as any).duration);
      parseJsonArray((s as any).benefits).forEach(b => texts.push(b));
      parseJsonArray((s as any).aftercare).forEach(a => texts.push(a));
      parseJsonArray((s as any).includes).forEach(i => texts.push(i));
    });
    products.forEach(p => {
      if (p.name) texts.push(p.name);
      if (p.description) texts.push(p.description);
    });
    if (ebook) {
      if (ebook.title) texts.push(ebook.title);
      if (ebook.description) texts.push(ebook.description);
    }
    return Array.from(new Set(texts.filter(Boolean)));
  }, [services, products, ebook]);

  const { tx, isTranslating } = useAutoTranslate(allTranslatableTexts, lang);

  // ─── Filtros Tratamientos ───────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  // ─── Filtros Skincare (productos) ──────────────────────────────────────────
  const [activeProdCategory, setActiveProdCategory] = useState<string>("all");

  // ─── Normalización de texto (quita tildes, minúsculas) ─────────────────────
  const normalize = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  // ─── Búsqueda unificada (servicios + productos + ebook) ────────────────────
  const unifiedSearchResults = useMemo(() => {
    const q = normalize(searchQuery);
    if (!q) return null;
    const results: Array<{
      id: string;
      name: string;
      description?: string | null;
      price?: string | null;
      imageUrl?: string | null;
      category?: string | null;
      itemType: "service" | "product" | "ebook";
      originalId: number;
    }> = [];
    services.forEach(s => {
      if (
        normalize(s.name).includes(q) ||
        (s.description && normalize(s.description).includes(q)) ||
        (s.category && normalize(s.category).includes(q))
      ) {
        results.push({ id: `svc-${s.id}`, name: s.name, description: s.description, price: s.price, imageUrl: s.imageUrl, category: s.category, itemType: "service", originalId: s.id });
      }
    });
    products.forEach(p => {
      if (
        normalize(p.name).includes(q) ||
        (p.description && normalize(p.description).includes(q)) ||
        (p.category && normalize(p.category).includes(q))
      ) {
        results.push({ id: `prd-${p.id}`, name: p.name, description: p.description, price: p.price, imageUrl: p.imageUrl, category: p.category, itemType: "product", originalId: p.id });
      }
    });
    if (ebook) {
      if (
        normalize(ebook.title).includes(q) ||
        (ebook.description && normalize(ebook.description).includes(q)) ||
        normalize("libro ebook digital").includes(q)
      ) {
        results.push({ id: `ebook-${ebook.id}`, name: ebook.title, description: ebook.description, price: (ebook as any).presalePrice ? String((ebook as any).presalePrice) : String(ebook.price), imageUrl: ebook.coverUrl, category: "Libro Digital", itemType: "ebook", originalId: ebook.id });
      }
    }
    return results;
  }, [searchQuery, services, products, ebook]);

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
  // ─── Filtros de categoría para productos ──────────────────────────────────
  const prodCategories = useMemo(() => {
    if (!products || products.length === 0) return [];
    const cats = [...new Set(products.map((p: any) => p.category).filter(Boolean))] as string[];
    return cats;
  }, [products]);
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (activeProdCategory === "all") return products;
    return products.filter((p: any) => p.category === activeProdCategory);
  }, [products, activeProdCategory]);
  // ─── Modal de detalle ──────────────────────────────────────────────────────────
  type DetailItem = {
    name: string;
    description?: string | null;
    price?: string | null;
    priceNum?: number | null;
    category?: string | null;
    imageUrl?: string | null;
    features?: string[];       // paquetes: lista de lo que incluye
    benefits?: string[];       // servicios/productos: beneficios
    howToUse?: string[];       // productos: modo de uso
    ingredients?: string | null; // productos: ingredientes
    disclaimer?: string | null;  // productos: nota de precaución
    duration?: string | null;  // servicios: duración del tratamiento
    aftercare?: string[];      // servicios: cuidados post-tratamiento
    regularPrice?: number | null;
    badge?: string | null;
    itemType: "service" | "package" | "product";
    id: string;
    productId?: number;
    isLoadingAI?: boolean;
  };
  const [detailItem, setDetailItem] = useState<DetailItem | null>(null);
  const generateProductInfoMutation = trpc.products.generateInfo.useMutation();

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
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer');
  const [discountCode, setDiscountCode] = useState("");
  const [discountValidating, setDiscountValidating] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{
    valid: boolean; discount: number | null; isGift: boolean; isTwoForOne: boolean; description: string | null;
  } | null>(null);

  //   // ─── Monedero Nutriser ─────────────────────────────────────────────
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [walletSheetOpen, setWalletSheetOpen] = useState(false);
  const [showQRFullscreen, setShowQRFullscreen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);

  const walletQuery = trpc.wallet.getMyWallet.useQuery(
    { patientId: patient?.id || 0 },
    {
      enabled: isLoggedIn && !!patient?.id,
      staleTime: 30_000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }
  );
  const walletBalance = walletQuery.data?.wallet?.balance || 0;
  const walletData = walletQuery.data?.wallet;
  const walletRedeemMutation = trpc.wallet.redeem.useMutation();

  // ── Notificaciones del Admin (contador en campanita del monedero) ──
  const adminNotifsQuery = trpc.adminNotifs.getByWalletId.useQuery(
    { walletId: walletData?.id || 0 },
    { enabled: isLoggedIn && !!walletData?.id }
  );
  const adminUnreadCount = (adminNotifsQuery.data || []).filter((n: any) => !n.isRead).length;

  // Refetch wallet data when sheet opens to ensure fresh data
  useEffect(() => {
    if (walletSheetOpen && isLoggedIn && patient?.id) {
      walletQuery.refetch();
    }
  }, [walletSheetOpen]);

  const utils = trpc.useUtils();

  // ─── Analítica de Comportamiento ────────────────────────────────────────────
  const trackMutation = trpc.analytics.track.useMutation();
  const sessionId = useMemo(() => {
    let sid = sessionStorage.getItem("nutriser-sid");
    if (!sid) { sid = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem("nutriser-sid", sid); }
    return sid;
  }, []);
  const track = (itemType: "service" | "product" | "ebook" | "package" | "promotion", itemId: string, itemName: string, eventType: "view" | "wishlist" | "cart" | "info" | "purchase") => {
    trackMutation.mutate({ itemType, itemId, itemName, eventType, sessionId, patientId: patient?.id ?? undefined });
  };

  const servicePurchaseMutation = trpc.servicePurchases.create.useMutation({
    onSuccess: () => { setSuccessCode("PENDIENTE"); setIsSubmitting(false); },
    onError: (err) => { toast.error("Error: " + err.message); setIsSubmitting(false); },
  });
  const cashPendingMutation = trpc.cashPayments.createPending.useMutation({
    onSuccess: () => { setSuccessCode("EFECTIVO"); setIsSubmitting(false); },
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
  // Descuento del monedero: se aplica automáticamente si el paciente tiene uno activo
  const walletDiscountPercent = walletData?.discountPercent ?? 0;
  // Primero aplicar cupón de descuento (si hay), luego el descuento del monedero
  const afterCouponTotal = discountInfo?.valid && discountInfo.discount
    ? Math.round(checkoutTotal * (1 - discountInfo.discount / 100))
    : discountInfo?.isGift ? 0 : checkoutTotal;
  const discountedTotal = walletDiscountPercent > 0 && !discountInfo?.isGift
    ? Math.round(afterCouponTotal * (1 - walletDiscountPercent / 100))
    : afterCouponTotal;
  const walletDiscountAmount = checkoutTotal - discountedTotal; // ahorro total
  // Cashback: 2% de la compra
  const cashbackAmount = hasValidPrice ? Math.round(discountedTotal * 0.02) : 0;
  // Monto final a transferir (considerando monedero)
  const transferAmount = Math.max(0, (discountInfo?.isGift ? 0 : discountedTotal) - (useWallet ? walletAmount / 100 : 0));
  const fullyCoveredByWallet = useWallet && transferAmount <= 0;

  const openCheckout = (item?: CartItem) => {
    // Tracking: evento view (intención de compra)
    if (item) track(item.itemType as any, item.id, item.name, "view");
    if (!requireAuth("realizar compras en la tienda")) return;
    setBuyNowItem(item || null);
    setBuyerName(patient?.name || ""); setBuyerEmail(patient?.email || ""); setBuyerPhone((patient as any)?.phone || "");
    setProofFile(null); setSuccessCode(""); setDiscountCode(""); setDiscountInfo(null);
    setUseWallet(false); setWalletAmount(0); setPaymentMethod('transfer');
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
    // ─── Bloqueo por deuda activa ─────────────────────────────────────────────────────────────────────────
    if (patientHasDebt) {
      toast.error("⚠️ Tienes una deuda activa. Tus compras están pendientes de autorización por administración. Acércate a la clínica para regularizar tu situación.", { duration: 6000 });
      return;
    }

    // — Pago en Efectivo: crear pendiente en monedero —
    if (paymentMethod === 'cash' && !fullyCoveredByWallet) {
      if (!walletData?.id || !patient?.id) {
        toast.error("Necesitas tener un monedero activo para usar pago en clínica.");
        return;
      }
      setIsSubmitting(true);
      const itemNames = checkoutItems.map(i => i.qty > 1 ? `${i.qty}x ${i.name}` : i.name).join(", ");
      const firstItem = checkoutItems[0];
      // El saldo del monedero a usar se descuenta al confirmar el admin
      const walletUsedCents = useWallet ? Math.min(walletAmount, Math.round(discountedTotal * 100)) : 0;
      cashPendingMutation.mutate({
        walletId: walletData.id,
        patientId: patient.id,
        concept: itemNames,
        itemType: (firstItem?.itemType === 'product' ? 'product' : firstItem?.itemType === 'ebook' ? 'ebook' : firstItem?.itemType === 'package' ? 'package' : 'service') as any,
        itemId: firstItem?.id,
        amountCents: Math.round(discountedTotal * 100),
        walletAmountUsedCents: walletUsedCents,
        cashbackPercent: 2,
        notes: `Pago en clínica solicitado por ${buyerName}`,
      });
      return;
    }

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
      {/* Cuando el checkout está abierto, Regresar cierra el checkout */}
      {checkoutOpen ? (
        <div
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
          className="fixed left-3 z-[60] flex items-center gap-1.5"
        >
          <button
            onClick={() => setCheckoutOpen(false)}
            className="flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/15 text-white/80 px-2.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide uppercase hover:bg-white/20 hover:text-white transition-all duration-300 shadow-md"
            aria-label={t('back', lang)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {t('back', lang)}
          </button>
        </div>
      ) : activeTab === "wishlist" ? (
        <div
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
          className="fixed left-3 z-[60] flex items-center gap-1.5"
        >
          <button
            onClick={() => setActiveTab("tratamientos")}
            className="flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/15 text-white/80 px-2.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide uppercase hover:bg-white/20 hover:text-white transition-all duration-300 shadow-md"
            aria-label={t('back', lang)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {t('back', lang)}
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
            aria-label={t('back', lang)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {t('back', lang)}
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
            aria-label={t('back', lang)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {t('back', lang)}
          </button>
        </div>
      ) : (
        <BackToSplash hideHome desktopBackTo="/" desktopBackLabel={t('back', lang)} />
      )}

      {/* ── Modal bloqueante de contrato de consentimiento ── */}
      {contractBlocking && patient && (
        <ContractBlockModal
          patientId={patient.id}
          patientName={patient.name}
          onSigned={() => {
            setContractSigned(true);
            contractStatusQuery.refetch();
          }}
        />
      )}
      {/* ── Pop-up de cupones/promociones ── */}
      {showPromoSplash && (
        <PromoSplash
          isAuthenticated={isLoggedIn}
          onClose={() => { sessionStorage.setItem("nutriser_tienda_promo_dismissed", "1"); setShowPromoSplash(false); }}
          onGoToCoupon={(promoId) => {
            // Solo se llama si isAuthenticated=true (el guard ya intercepta si no hay sesión)
            sessionStorage.setItem("nutriser_tienda_promo_dismissed", "1");
            setShowPromoSplash(false);
            navigate(`/cupon/${promoId}?from=store`);
          }}
          onOpenWallet={() => {
            // Solo se llama si isAuthenticated=true
            sessionStorage.setItem("nutriser_tienda_promo_dismissed", "1");
            setShowPromoSplash(false);
            setWalletSheetOpen(true);
          }}
        />
      )}

      {/* Modal de login/registro integrado — funciona sin salir de la página */}
      <NutriserAuthModal
        isOpen={mobileGuardOpen}
        onClose={() => setMobileGuardOpen(false)}
        contextMessage={`Inicia sesión para ${mobileGuardFeature}`}
        onSuccess={() => setMobileGuardOpen(false)}
      />

      {/* ── Modal de detalle de servicio/paquete ── */}
      <Dialog open={!!detailItem} onOpenChange={(open) => { if (!open) setDetailItem(null); }}>
        <DialogContent
          className="max-w-sm w-full p-0 rounded-2xl border-0 flex flex-col"
          style={{ background: "#1A1A1A", maxHeight: "min(85dvh, 600px)", overflow: "hidden" }}
        >
          {detailItem && (
            <>
              {/* Zona scrollable: imagen + contenido */}
              <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: "contain" }}>
                {/* Imagen */}
                {detailItem.imageUrl ? (
                  <div className="relative w-full" style={{ height: "clamp(120px, 25dvh, 220px)" }}>
                    <img src={detailItem.imageUrl} alt={detailItem.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,26,26,0.9) 0%, transparent 60%)" }} />
                    {detailItem.badge && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black" style={{ background: "#C5A55A", color: "#1A1A1A" }}>
                        <Star className="w-3 h-3 fill-current" /> {t(detailItem.badge as any, lang)}
                      </div>
                    )}
                    {detailItem.category && (
                      <div className="absolute bottom-3 left-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#C5A55A" }}>
                          {t((CATEGORY_META[detailItem.category] ?? CATEGORY_META.general).label as any, lang)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center" style={{ height: 120, background: "#2a2a2a" }}>
                    <Package className="w-12 h-12" style={{ color: "#C5A55A", opacity: 0.4 }} />
                  </div>
                )}

                {/* Contenido */}
                <div className="px-5 pt-4 pb-4">
                  {/* Indicador de traducción en progreso */}
                  {isTranslating && lang === "EN" && (
                    <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-lg" style={{ background: "rgba(197,165,90,0.08)", border: "1px solid rgba(197,165,90,0.15)" }}>
                      <div className="w-2 h-2 rounded-full bg-[#C5A55A] animate-pulse" />
                      <span style={{ color: "#C5A55A", fontSize: 10, fontWeight: 600, letterSpacing: "0.05em" }}>Translating...</span>
                    </div>
                  )}
                  <DialogHeader>
                    <DialogTitle
                      style={{ fontFamily: "'Playfair Display', serif", color: "#FAF7F2", fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}
                      className="mb-1"
                    >
                      {tx(detailItem.name)}
                    </DialogTitle>
                  </DialogHeader>

                  {/* Precio */}
                  {detailItem.price && (
                    <div className="flex items-end gap-2 mt-2 mb-3">
                      <span style={{ color: "#C5A55A", fontSize: 26, fontWeight: 900 }}>
                        {detailItem.priceNum ? `$${detailItem.priceNum.toLocaleString("es-MX")}` : detailItem.price}
                      </span>
                      {detailItem.priceNum && <span style={{ color: "#b8b0a0", fontSize: 13, marginBottom: 2 }}>MXN</span>}
                      {detailItem.regularPrice && (
                        <span style={{ color: "#666", fontSize: 13, textDecoration: "line-through", marginBottom: 2 }}>
                          ${detailItem.regularPrice.toLocaleString("es-MX")}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Separador dorado */}
                  <div style={{ height: 1, background: "linear-gradient(to right, #C5A55A, transparent)", marginBottom: 16 }} />

                  {/* Descripción */}
                  {detailItem.description && (
                    <div className="mb-4">
                      <p style={{ color: "#b8b0a0", fontSize: 14, lineHeight: 1.6 }}>{tx(detailItem.description)}</p>
                    </div>
                  )}

                  {/* Duración del tratamiento (solo servicios) */}
                  {detailItem.duration && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl" style={{ background: "rgba(197,165,90,0.08)", border: "1px solid rgba(197,165,90,0.2)" }}>
                      <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "#C5A55A" }} />
                      <div>
                        <span style={{ color: "#C5A55A", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t('duration', lang)}</span>
                        <p style={{ color: "#FAF7F2", fontSize: 13, fontWeight: 600, marginTop: 1 }}>{detailItem.duration}</p>
                      </div>
                    </div>
                  )}

                  {/* Beneficios (servicios) */}
                  {detailItem.benefits && detailItem.benefits.length > 0 && (
                    <div className="mb-5">
                      <p style={{ color: "#C5A55A", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>{t('benefits', lang)}</p>
                      <ul className="space-y-2">
                        {detailItem.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#C5A55A" }} />
                            <span style={{ color: "#FAF7F2", fontSize: 13 }}>{tx(b)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Incluye (paquetes) */}
                  {detailItem.features && detailItem.features.length > 0 && (
                    <div className="mb-5">
                      <p style={{ color: "#C5A55A", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>{t('includes', lang)}</p>
                      <ul className="space-y-2">
                        {detailItem.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#C5A55A" }} />
                            <span style={{ color: "#FAF7F2", fontSize: 13 }}>{tx(f)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cargando IA (productos) */}
                  {detailItem.itemType === "product" && detailItem.isLoadingAI && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-3 rounded-xl" style={{ background: "rgba(197,165,90,0.08)", border: "1px solid rgba(197,165,90,0.2)" }}>
                      <div className="w-4 h-4 rounded-full border-2 border-[#C5A55A] border-t-transparent animate-spin flex-shrink-0" />
                      <span style={{ color: "#C5A55A", fontSize: 12, fontWeight: 600 }}>Nutriser generando información...</span>
                    </div>
                  )}

                  {/* Modo de uso (productos) */}
                  {detailItem.itemType === "product" && detailItem.howToUse && detailItem.howToUse.length > 0 && (
                    <div className="mb-5">
                      <p style={{ color: "#C5A55A", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Modo de uso</p>
                      <ol className="space-y-2">
                        {detailItem.howToUse.map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span style={{ color: "#C5A55A", fontSize: 11, fontWeight: 900, minWidth: 18, marginTop: 1 }}>{i + 1}.</span>
                            <span style={{ color: "#FAF7F2", fontSize: 13 }}>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Ingredientes (productos) */}
                  {detailItem.itemType === "product" && detailItem.ingredients && (
                    <div className="mb-4 px-3 py-2 rounded-xl" style={{ background: "rgba(197,165,90,0.05)", border: "1px solid rgba(197,165,90,0.15)" }}>
                      <p style={{ color: "#C5A55A", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Ingredientes principales</p>
                      <p style={{ color: "#b8b0a0", fontSize: 12, lineHeight: 1.5 }}>{detailItem.ingredients}</p>
                    </div>
                  )}

                  {/* Disclaimer (productos) */}
                  {detailItem.itemType === "product" && detailItem.disclaimer && (
                    <div className="mb-4 flex items-start gap-2">
                      <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#8BC4A8" }} />
                      <p style={{ color: "#888", fontSize: 11, fontStyle: "italic" }}>{detailItem.disclaimer}</p>
                    </div>
                  )}

                  {/* Cuidados post-tratamiento (servicios) */}
                  {detailItem.aftercare && detailItem.aftercare.length > 0 && (
                    <div className="mb-4">
                      <p style={{ color: "#C5A55A", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>{t('aftercare', lang)}</p>
                      <ul className="space-y-2">
                        {detailItem.aftercare.map((a, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#8BC4A8" }} />
                            <span style={{ color: "#b8b0a0", fontSize: 13 }}>{tx(a)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Categoría */}
                  {detailItem.category && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: (CATEGORY_META[detailItem.category] ?? CATEGORY_META.general).bg }}>
                        {(() => { const Icon = (CATEGORY_META[detailItem.category] ?? CATEGORY_META.general).icon; return <Icon className="w-3.5 h-3.5" style={{ color: (CATEGORY_META[detailItem.category] ?? CATEGORY_META.general).color }} />; })()}
                      </div>
                      <span style={{ color: "#888", fontSize: 12 }}>{t((CATEGORY_META[detailItem.category] ?? CATEGORY_META.general).label as any, lang)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones fijos en la parte inferior — siempre visibles */}
              <div className="flex-shrink-0 flex gap-2 px-5 py-4" style={{ background: "#1A1A1A", borderTop: "1px solid rgba(197,165,90,0.15)" }}>
                <button
                  onClick={() => {
                    addToCart({ id: detailItem.id, name: detailItem.name, price: detailItem.priceNum ?? 0, priceLabel: detailItem.price ? formatServicePrice(detailItem.price) : "Consultar precio", imageUrl: detailItem.imageUrl, category: detailItem.category ?? "general", itemType: detailItem.itemType });
                    setDetailItem(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 font-bold text-sm py-3 rounded-xl transition-all active:scale-95"
                  style={{ border: "1px solid #C5A55A", color: "#C5A55A", background: "transparent" }}
                >
                  <ShoppingCart className="w-4 h-4" /> Al carrito
                </button>
                <button
                  onClick={() => {
                    openCheckout({ id: detailItem.id, name: detailItem.name, price: detailItem.priceNum ?? 0, priceLabel: detailItem.price ? formatServicePrice(detailItem.price) : "Consultar precio", qty: 1, imageUrl: detailItem.imageUrl, category: detailItem.category ?? "general", itemType: detailItem.itemType });
                    setDetailItem(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 font-bold text-sm py-3 rounded-xl transition-all active:scale-95"
                  style={{ background: "#C5A55A", color: "#1A1A1A" }}
                >
                  <Zap className="w-4 h-4" /> Comprar
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
              <p className="text-[#C5A55A] text-[9px] lg:text-[10px] tracking-[0.2em] uppercase font-semibold">{t("aestheticNutrition", lang)}</p>
              <h1 className="text-gray-900 text-lg lg:text-xl font-black leading-tight">{t("nutriserShop", lang)}</h1>
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
                      <span className="text-green-600 text-[8px] font-semibold leading-tight">{t("active", lang)}</span>
                    </div>
                  </div>
                  <div className="relative w-8 h-8 rounded-full bg-[#C5A55A]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#C5A55A]" />
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                  {/* Cerrar sesión — solo visible en desktop */}
                  <button
                    onClick={() => logout()}
                    title={t("closeSession", lang)}
                    className="hidden md:flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // Solo visible en escritorio — en móvil el usuario inicia sesión desde Mi Cuenta Nutriser en el splash
                <button onClick={() => navigate("/mis-tratamientos?returnTo=/memberships")}
                  className="hidden md:flex items-center gap-1.5 bg-[#C5A55A] text-white px-3 py-2 rounded-full text-xs font-bold hover:bg-[#B8963E] active:scale-95 transition-all">
                  <User className="w-3.5 h-3.5" />
                  {t("signIn", lang)}
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

          {/* Search bar — siempre visible, busca en servicios + productos + libros */}
          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder", lang)}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 border-0 rounded-full pl-10 pr-10 py-2.5 lg:py-3 text-sm lg:text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center hover:bg-gray-400 transition-all"
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Banner Carrusel de Ofertas (clickeable → comprar paquete) ── */}
      {/* Ocultar banner cuando hay búsqueda activa */}
      {!searchQuery && <PromoBanner
        lang={lang}
        storeBanners={storeBannersData}
        onBannerClick={handleBannerClick}
        onSystemBannerClick={(linkTarget) => {
          // Abrir directamente el modal de detalles del paquete correspondiente
          if (linkTarget === 'paquete-nutricion') {
            const pkg = getPackages(lang).find(p => p.id === 'pkg-nutricion');
            if (pkg) {
              setDetailItem({
                id: pkg.id,
                name: pkg.name,
                description: pkg.description,
                price: `$${pkg.price.toLocaleString('es-MX')} MXN`,
                priceNum: pkg.price,
                category: pkg.category,
                imageUrl: pkg.imageUrl,
                features: pkg.features,
                regularPrice: pkg.regularPrice,
                badge: pkg.badge,
                itemType: 'package',
              });
            }
          } else if (linkTarget === 'paquete-reductor') {
            const pkg = getPackages(lang).find(p => p.id === 'pkg-reductor');
            if (pkg) {
              setDetailItem({
                id: pkg.id,
                name: pkg.name,
                description: pkg.description,
                price: `$${pkg.price.toLocaleString('es-MX')} MXN`,
                priceNum: pkg.price,
                category: pkg.category,
                imageUrl: pkg.imageUrl,
                features: pkg.features,
                regularPrice: pkg.regularPrice,
                badge: pkg.badge,
                itemType: 'package',
              });
            }
          }
        }}
      />}

      {/* ════════════════════════════════════════════════════════════════════
          VISTA DE RESULTADOS DE BÚSqueda UNIFICADA
      ════════════════════════════════════════════════════════════════════ */}
      {unifiedSearchResults !== null && (
        <div className="pb-28 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 py-5">
            {/* Header de resultados */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-black text-gray-900 text-lg">
                  {unifiedSearchResults.length > 0
                    ? `${unifiedSearchResults.length} ${t("resultsFor", lang)} "${searchQuery}"`
                    : `${t("noResultsFor", lang)} "${searchQuery}"`}
                </h2>
                {unifiedSearchResults.length > 0 && (
                  <p className="text-gray-400 text-xs mt-0.5">{t("searchAllTypes", lang)}</p>
                )}
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="text-[#C5A55A] text-xs font-bold flex items-center gap-1 hover:underline"
              >
                <X className="w-3.5 h-3.5" /> {t("clear", lang)}
              </button>
            </div>

            {/* Estado vacío */}
            {unifiedSearchResults.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-400 text-xl mb-2">{t("noResults", lang)}</h3>
                <p className="text-gray-300 text-sm max-w-xs mx-auto">
                  {t("noResultsDesc", lang)} "{searchQuery}". {t("tryOtherWord", lang)}
                </p>
              </div>
            )}

            {/* Grid de resultados */}
            {unifiedSearchResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
                {unifiedSearchResults.map(item => {
                  const catMeta = CATEGORY_META[item.category ?? "general"] ?? CATEGORY_META.general;
                  const CatIcon = catMeta.icon;
                  const priceNum = item.price ? Math.round(parseFloat(item.price.replace(/[^0-9.]/g, ""))) : null;
                  const typeLabel = item.itemType === "service" ? t("typeService", lang) : item.itemType === "product" ? t("typeProduct", lang) : t("typeBook", lang);
                  const typeBg = item.itemType === "service" ? "bg-[#C5A55A]/10 text-[#C5A55A]" : item.itemType === "product" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600";
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer active:scale-95"
                      onClick={() => {
                        if (item.itemType === "service") {
                          track("service", item.id, item.name, "info");
                          const svc = services.find(s => s.id === item.originalId);
                          if (svc) setDetailItem({ id: item.id, name: svc.name, description: svc.description, price: svc.price, priceNum, category: svc.category, imageUrl: svc.imageUrl, itemType: "service" });
                        } else if (item.itemType === "product") {
                          track("product", item.id, item.name, "view");
                          openCheckout({ id: item.id, name: item.name, price: priceNum ?? 0, priceLabel: item.price ?? "Consultar", qty: 1, imageUrl: item.imageUrl, category: item.category ?? "general", itemType: "product", productId: item.originalId });
                        } else if (item.itemType === "ebook") {
                          track("ebook", item.id, item.name, "view");
                          openCheckout({ id: item.id, name: item.name, price: priceNum ?? 0, priceLabel: `$${(priceNum ?? 0).toLocaleString("es-MX")} MXN`, qty: 1, imageUrl: item.imageUrl, category: "ebook", itemType: "ebook", ebookId: item.originalId });
                        }
                      }}
                    >
                      <div className="relative h-32 overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: catMeta.bg }}>
                            <CatIcon className="w-10 h-10 opacity-30" style={{ color: catMeta.color }} />
                          </div>
                        )}
                        <span className={`absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full ${typeBg}`}>{typeLabel}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist({ id: item.id, name: item.name, price: priceNum ?? 0, priceLabel: item.price ?? "Consultar", imageUrl: item.imageUrl, category: item.category ?? "general", itemType: item.itemType });
                          }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all"
                        >
                          <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(item.id) ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                        </button>
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1 line-clamp-2">{tx(item.name)}</h3>
                        {item.description && <p className="text-gray-400 text-[10px] line-clamp-2 mb-2">{tx(item.description)}</p>}
                        <div className="mt-auto">
                          {item.price && priceNum && priceNum > 0 ? (
                            <p className="text-[#C5A55A] font-black text-sm mb-2">
                              {item.itemType === "service" ? formatServicePrice(item.price) : `$${priceNum.toLocaleString("es-MX")} MXN`}
                            </p>
                          ) : (
                            <p className="text-gray-400 text-xs mb-2 italic">{t("consultPrice", lang)}</p>
                          )}
                          {/* Servicios: Ver detalles + Al carrito + Comprar */}
                          {item.itemType === "service" ? (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); const svc = services.find(s => s.id === item.originalId); if (svc) { const pn = parseInt((svc.price ?? "").replace(/[^0-9]/g, ""), 10); const b = (() => { try { return JSON.parse(svc.benefits ?? "[]"); } catch { return []; } })(); const a = (() => { try { return JSON.parse(svc.aftercare ?? "[]"); } catch { return []; } })(); setDetailItem({ id: `svc-${svc.id}`, name: svc.name, description: svc.description, price: svc.price, priceNum: isNaN(pn) ? null : pn, category: svc.category, imageUrl: svc.imageUrl, itemType: "service", benefits: b, duration: svc.duration, aftercare: a }); } }}
                                className="w-full flex items-center justify-center gap-1 font-semibold text-[10px] py-2 rounded-xl border mb-1.5 transition-all active:scale-95"
                                style={{ borderColor: "#C5A55A", color: "#C5A55A", background: "transparent" }}
                              >
                                <Info className="w-3 h-3" />
                                {t("seeDetails", lang)}
                              </button>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={(e) => { e.stopPropagation(); const svc = services.find(s => s.id === item.originalId); if (svc) addToCart({ id: item.id, name: svc.name, price: priceNum ?? 0, priceLabel: formatServicePrice(svc.price), imageUrl: svc.imageUrl, category: svc.category ?? "general", itemType: "service" }); }}
                                  className="flex-1 flex items-center justify-center py-2 rounded-xl border transition-all active:scale-95"
                                  style={{ borderColor: "#C5A55A", color: "#C5A55A", background: "transparent" }}
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); const svc = services.find(s => s.id === item.originalId); if (svc) openCheckout({ id: item.id, name: svc.name, price: priceNum ?? 0, priceLabel: formatServicePrice(svc.price), qty: 1, imageUrl: svc.imageUrl, category: svc.category ?? "general", itemType: "service", productId: undefined, ebookId: undefined }); }}
                                  className="flex-1 flex items-center justify-center gap-1 font-bold text-[10px] py-2 rounded-xl transition-all active:scale-95 text-white"
                                  style={{ background: "#C5A55A" }}
                                >
                                  <Zap className="w-3 h-3" />
                                  {t("buy", lang)}
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.itemType === "product") {
                                  openCheckout({ id: item.id, name: item.name, price: priceNum ?? 0, priceLabel: item.price ?? "Consultar", qty: 1, imageUrl: item.imageUrl, category: item.category ?? "general", itemType: "product", productId: item.originalId });
                                } else {
                                  openCheckout({ id: item.id, name: item.name, price: priceNum ?? 0, priceLabel: `$${(priceNum ?? 0).toLocaleString("es-MX")} MXN`, qty: 1, imageUrl: item.imageUrl, category: "ebook", itemType: "ebook", ebookId: item.originalId });
                                }
                              }}
                              className="w-full flex items-center justify-center gap-1 font-bold text-[10px] py-2 rounded-xl transition-all active:scale-95 text-white"
                              style={{ background: "#C5A55A" }}
                            >
                              <Zap className="w-3 h-3" />
                              {item.itemType === "ebook" ? t("buyBook", lang) : t("buy", lang)}
                            </button>
                          )}
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

      {/* ════════════════════════════════════════════════════════════════════
          TABS — Estilo app comercial
      ════════════════════════════════════════════════════════════════════ */}
      {/* Tabs moved to bottom navigation bar */}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: TRATAMIENTOS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "tratamientos" && !searchQuery && (
        <div className="pb-28">
          {/* ── Categorías con iconos circulares (scroll horizontal) ── */}
          <div className="bg-white mt-2 py-4">
            <div className="max-w-7xl mx-auto px-4">
              <h3 className="text-gray-900 font-bold text-base mb-3">{t("categories", lang)}</h3>
              <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-1 lg:justify-center" style={{ scrollbarWidth: "none" }}>
                {/* Todos */}
                <button onClick={() => setActiveCategory("all")} className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[64px] lg:min-w-[80px]">
                  <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all ${
                    activeCategory === "all" ? "bg-[#C5A55A] shadow-lg shadow-[#C5A55A]/30" : "bg-gray-100"
                  }`}>
                    <Package className={`w-6 h-6 ${activeCategory === "all" ? "text-white" : "text-gray-500"}`} />
                  </div>
                  <span className={`text-[10px] font-semibold ${activeCategory === "all" ? "text-[#C5A55A]" : "text-gray-500"}`}>{t("catAll", lang)}</span>
                </button>
                {/* Paquetes */}
                <button onClick={() => setActiveCategory("packages")} className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[64px]">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    activeCategory === "packages" ? "bg-[#C5A55A] shadow-lg shadow-[#C5A55A]/30" : "bg-amber-50"
                  }`}>
                    <Crown className={`w-6 h-6 ${activeCategory === "packages" ? "text-white" : "text-amber-600"}`} />
                  </div>
                  <span className={`text-[10px] font-semibold ${activeCategory === "packages" ? "text-[#C5A55A]" : "text-gray-500"}`}>{t("catPackages", lang)}</span>
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
                      <span className={`text-[10px] font-semibold ${isActive ? "text-gray-900" : "text-gray-500"}`}>{t(meta.label as any, lang)}</span>
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
                    <h2 className="font-black text-gray-900 text-lg">{t("specialPackages", lang)}</h2>
                    <p className="text-gray-400 text-xs">{t("specialPackagesSubtitle", lang)}</p>
                  </div>
                  <span className="text-[#C5A55A] text-xs font-bold flex items-center gap-0.5">
                    {t("viewAll", lang)} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <HScrollRail className="lg:!flex lg:!gap-6">
                  {getPackages(lang).map(pkg => {
                    const savings = pkg.regularPrice - pkg.price;
                    const savingsPct = Math.round((savings / pkg.regularPrice) * 100);
                    return (
                      <div key={pkg.id} className="flex-shrink-0 w-72 sm:w-80 lg:w-[calc(50%-0.75rem)] lg:flex-shrink bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                        {/* Image */}
                        <div className="relative h-40 overflow-hidden">
                          <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <div className="absolute top-2 left-2 bg-[#C5A55A] text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> {t(pkg.badge as any, lang)}
                          </div>
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); track("package", pkg.id, pkg.name, "wishlist"); toggleWishlist({ id: pkg.id, name: pkg.name, price: pkg.price, priceLabel: `$${pkg.price.toLocaleString("es-MX")} MXN`, imageUrl: pkg.imageUrl, category: pkg.category, itemType: "package" }); }} className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all">
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
                              {t("savings", lang)} ${savings.toLocaleString("es-MX")}
                            </span>
                          </div>

                          <ul className="space-y-1 mb-3">
                            {pkg.features.slice(0, 2).map((f, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-500">
                                <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />{f}
                              </li>
                            ))}
                            {pkg.features.length > 2 && (
                              <li className="text-[11px] text-[#C5A55A] font-semibold pl-4">+{pkg.features.length - 2} {lang === "EN" ? "more" : "más"}</li>
                            )}
                          </ul>

                          <button
                            onClick={() => { track("package", pkg.id, pkg.name, "info"); setDetailItem({ id: pkg.id, name: pkg.name, description: pkg.description, price: `$${pkg.price.toLocaleString("es-MX")} MXN`, priceNum: pkg.price, category: pkg.category, imageUrl: pkg.imageUrl, features: pkg.features, regularPrice: pkg.regularPrice, badge: pkg.badge, itemType: "package" }); }}
                            className="w-full flex items-center justify-center gap-1.5 font-semibold text-[11px] py-2 rounded-xl mb-2 transition-all active:scale-95"
                            style={{ border: "1px solid rgba(197,165,90,0.4)", color: "#C5A55A", background: "rgba(197,165,90,0.06)" }}
                          >
                            <Info className="w-3.5 h-3.5" /> {t("seeDetails", lang)}
                          </button>
                          <div className="flex gap-2">
                            <button onClick={() => addToCart({ id: pkg.id, name: pkg.name, price: pkg.price, priceLabel: `$${pkg.price.toLocaleString("es-MX")} MXN`, imageUrl: pkg.imageUrl, category: pkg.category, itemType: "package" })}
                              className="flex-1 flex items-center justify-center gap-1 border border-[#C5A55A] text-[#C5A55A] font-bold text-[11px] py-2.5 rounded-xl hover:bg-[#C5A55A]/5 transition-all active:scale-95">
                              <ShoppingCart className="w-3.5 h-3.5" /> {t("addToCart", lang)}
                            </button>
                            <button onClick={() => openCheckout({ id: pkg.id, name: pkg.name, price: pkg.price, priceLabel: `$${pkg.price.toLocaleString("es-MX")} MXN`, qty: 1, imageUrl: pkg.imageUrl, category: pkg.category, itemType: "package" })}
                              className="flex-1 flex items-center justify-center gap-1 bg-[#C5A55A] text-white font-bold text-[11px] py-2.5 rounded-xl hover:bg-[#B8963E] transition-all active:scale-95">
                              <Zap className="w-3.5 h-3.5" /> {t("buy", lang)}
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
                            <h2 className="font-bold text-gray-900 text-base">{t(meta.label as any, lang)}</h2>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{catServices.length}</span>
                          </div>
                          <button onClick={() => setActiveCategory(cat)} className="text-[#C5A55A] text-xs font-bold flex items-center gap-0.5">
                            {t("viewAll", lang)} <ChevronRight className="w-3.5 h-3.5" />
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
                                  <button onClick={(e) => { e.stopPropagation(); track("service", `svc-${service.id}`, service.name, "wishlist"); toggleWishlist({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: formatServicePrice(service.price), imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" }); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all">
                                    <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(`svc-${service.id}`) ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                                  </button>
                                </div>
                                <div className="p-3">
                                  <h3 className="font-bold text-gray-900 text-xs lg:text-sm leading-snug mb-1 line-clamp-2">{tx(service.name)}</h3>
                                  {service.price && service.price !== "Consultar precio" ? (
                                    <p className="text-[#C5A55A] font-black text-sm mb-2">{formatServicePrice(service.price)}</p>
                                  ) : (
                                    <p className="text-gray-400 text-xs mb-2 italic">{t("consultPrice", lang)}</p>
                                  )}
                                  <button
onClick={() => {
                                       const b = service.benefits ? (() => { try { return JSON.parse(service.benefits as string); } catch { return []; } })() : [];
                                       const a = service.aftercare ? (() => { try { return JSON.parse(service.aftercare as string); } catch { return []; } })() : [];
                                       track("service", `svc-${service.id}`, service.name, "info");
                                       setDetailItem({ id: `svc-${service.id}`, name: service.name, description: service.description, price: service.price, priceNum, category: service.category, imageUrl: service.imageUrl, itemType: "service", benefits: b, duration: service.duration, aftercare: a });
                                     }}
                                     className="w-full flex items-center justify-center gap-1 font-semibold text-[10px] py-1.5 rounded-lg mb-1.5 transition-all active:scale-95"
                                     style={{ border: "1px solid rgba(197,165,90,0.35)", color: "#C5A55A", background: "rgba(197,165,90,0.05)" }}
                                   >
                                     <Info className="w-3 h-3" /> {t("seeDetails", lang)}
                                   </button>
                                   <div className="flex gap-1.5">
                                     <button onClick={() => addToCart({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: formatServicePrice(service.price), imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" })}
                                       className="flex-1 flex items-center justify-center gap-0.5 border border-gray-200 text-gray-600 font-bold text-[10px] py-2 rounded-lg hover:bg-gray-50 transition-all active:scale-95">
                                       <ShoppingCart className="w-3 h-3" />
                                     </button>
                                    <button onClick={() => openCheckout({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: formatServicePrice(service.price), qty: 1, imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" })}
                                      className="flex-1 flex items-center justify-center gap-0.5 bg-[#C5A55A] text-white font-bold text-[10px] py-2 rounded-lg hover:bg-[#B8963E] transition-all active:scale-95">
                                      <Zap className="w-3 h-3" /> {t("buy", lang)}
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
                      <h2 className="font-bold text-gray-900 text-lg">{t((CATEGORY_META[activeCategory] ?? CATEGORY_META.general).label as any, lang)}</h2>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filteredServices.length}</span>
                    </div>
                    {filteredServices.length === 0 ? (
                      <div className="text-center py-16">
                        <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">{t("noServicesFound", lang)}</p>
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
                                <button onClick={(e) => { e.stopPropagation(); track("service", `svc-${service.id}`, service.name, "wishlist"); toggleWishlist({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: formatServicePrice(service.price), imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" }); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all">
                                  <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(`svc-${service.id}`) ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                                </button>
                              </div>
                              <div className="p-3 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1 line-clamp-2">{tx(service.name)}</h3>
                                {service.description && <p className="text-gray-400 text-[10px] line-clamp-2 mb-2">{tx(service.description)}</p>}
                                <div className="mt-auto">
                                  {service.price && service.price !== "Consultar precio" ? (
                                    <p className="text-[#C5A55A] font-black text-sm mb-2">{formatServicePrice(service.price)}</p>
                                  ) : (
                                    <p className="text-gray-400 text-xs mb-2 italic">{t("consultPrice", lang)}</p>
                                  )}
                                  <button
                                    onClick={() => { track("service", `svc-${service.id}`, service.name, "info"); setDetailItem({ id: `svc-${service.id}`, name: service.name, description: service.description, price: service.price, priceNum, category: service.category, imageUrl: service.imageUrl, itemType: "service" }); }}
                                    className="w-full flex items-center justify-center gap-1 font-semibold text-[10px] py-1.5 rounded-lg mb-1.5 transition-all active:scale-95"
                                    style={{ border: "1px solid rgba(197,165,90,0.35)", color: "#C5A55A", background: "rgba(197,165,90,0.05)" }}
                                  >
                                    <Info className="w-3 h-3" /> {t("seeDetails", lang)}
                                  </button>
                                  <div className="flex gap-1.5">
                                    <button onClick={() => addToCart({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: formatServicePrice(service.price), imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" })}
                                      className="flex-1 flex items-center justify-center gap-0.5 border border-gray-200 text-gray-600 font-bold text-[10px] py-2 rounded-lg hover:bg-gray-50 transition-all active:scale-95">
                                      <ShoppingCart className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => openCheckout({ id: `svc-${service.id}`, name: service.name, price: priceNum ?? 0, priceLabel: formatServicePrice(service.price), qty: 1, imageUrl: service.imageUrl, category: service.category ?? "general", itemType: "service" })}
                                      className="flex-1 flex items-center justify-center gap-0.5 bg-[#C5A55A] text-white font-bold text-[10px] py-2 rounded-lg hover:bg-[#B8963E] transition-all active:scale-95">
                                      <Zap className="w-3 h-3" /> {t("buy", lang)}
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
      {activeTab === "farmacy" && !searchQuery && (
        <div className="pb-28 mt-2">
          <div className="bg-white py-5">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-[#C5A55A]" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-lg">{t("pharmacyTitle", lang)}</h2>
                    <p className="text-gray-400 text-xs">{t("pharmacySubtitle", lang)}</p>
                  </div>
                </div>
              </div>
              {loadingProducts ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" /></div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Droplets className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-400 text-xl mb-2">{t("comingSoon", lang)}</h3>
                  <p className="text-gray-300 text-sm max-w-xs mx-auto">{t("pharmacyEmpty", lang)}</p>
                </div>
              ) : (
                <>
                  {/* ── Barra de filtros de categoría Skincare ── */}
                  {prodCategories.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-gray-900 font-bold text-base mb-3">{t("categories", lang)}</h3>
                      <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-1 lg:justify-start" style={{ scrollbarWidth: "none" }}>
                        {/* Todos */}
                        <button onClick={() => setActiveProdCategory("all")} className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[64px] lg:min-w-[80px]">
                          <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all ${
                            activeProdCategory === "all" ? "bg-[#C5A55A] shadow-lg shadow-[#C5A55A]/30" : "bg-gray-100"
                          }`}>
                            <Package className={`w-6 h-6 ${activeProdCategory === "all" ? "text-white" : "text-gray-500"}`} />
                          </div>
                          <span className={`text-[10px] font-semibold ${activeProdCategory === "all" ? "text-[#C5A55A]" : "text-gray-500"}`}>{t("catAll", lang)}</span>
                        </button>
                        {prodCategories.map(cat => {
                          const meta = PRODUCT_CATEGORY_META[cat] ?? { label: cat, icon: Package, color: "#888", bg: "#f3f4f6" };
                          const Icon = meta.icon;
                          const isActive = activeProdCategory === cat;
                          return (
                            <button key={cat} onClick={() => setActiveProdCategory(cat)} className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[64px] lg:min-w-[80px]">
                              <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all ${
                                isActive ? "shadow-lg" : ""
                              }`} style={{ backgroundColor: isActive ? meta.color : meta.bg }}>
                                <Icon className="w-6 h-6" style={{ color: isActive ? "#fff" : meta.color }} />
                              </div>
                              <span className={`text-[10px] font-semibold ${isActive ? "text-gray-900" : "text-gray-500"}`}>{t(meta.label as any, lang)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <HScrollRail>
                  {filteredProducts.map(product => {
                    const salePrice = (product as any).salePrice;
                    const priceNum = salePrice
                      ? parseInt(String(salePrice).replace(/[^0-9]/g, ""))
                      : product.price ? parseInt(product.price.replace(/[^0-9]/g, "")) : null;
                    const regularPriceNum = product.price ? parseInt(product.price.replace(/[^0-9]/g, "")) : null;
                    const savingPct = salePrice && regularPriceNum && priceNum && regularPriceNum > priceNum
                      ? Math.round((1 - priceNum / regularPriceNum) * 100) : 0;
                    const lowStockThreshold = (product as any).lowStockAlert ?? 0;
                    const stockLeft = product.stock ?? null;
                    // El número real de stock NUNCA se muestra al cliente.
                    // Solo se muestra el badge de urgencia cuando el admin configuró un umbral > 0
                    const isLowStock = lowStockThreshold > 0 && stockLeft !== null && stockLeft > 0 && stockLeft <= lowStockThreshold;
                    const isOutOfStock = stockLeft !== null && stockLeft === 0;
                    return (
                      <div key={product.id} className={`flex-shrink-0 w-48 sm:w-52 lg:w-56 bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col ${isOutOfStock ? 'opacity-60 border-gray-200' : 'border-gray-100'}`}>
                        <div className="relative h-40 lg:h-48 overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <Droplets className="w-10 h-10 text-gray-200" />
                            </div>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); track("product", `prd-${product.id}`, product.name, "wishlist"); toggleWishlist({ id: `prd-${product.id}`, name: product.name, price: priceNum ?? 0, priceLabel: salePrice ?? product.price ?? "Consultar", imageUrl: product.imageUrl, category: product.category ?? "general", itemType: "product" }); }} className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all">
                            <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(`prd-${product.id}`) ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                          </button>
                          {savingPct > 0 && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                              -{savingPct}% AHORRO
                            </div>
                          )}
                          {isLowStock && !savingPct && (
                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                              Últimas {stockLeft} pzs
                            </div>
                          )}
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="bg-white text-gray-800 font-black text-xs px-3 py-1 rounded-full">Agotado</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 flex-1 flex flex-col">
                          <p className="text-[9px] text-purple-600 font-semibold uppercase tracking-wider mb-0.5">{product.category || t("typeProduct", lang)}</p>
                          <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1 line-clamp-2">{tx(product.name)}</h3>
                          <div className="mt-auto">
                            {salePrice ? (
                              <div className="mb-2">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-[#C5A55A] font-black text-sm">${parseInt(String(salePrice).replace(/[^0-9]/g,"")).toLocaleString("es-MX")}</span>
                                  <span className="line-through text-gray-400 text-[10px]">${parseInt((product.price||"").replace(/[^0-9]/g,"")).toLocaleString("es-MX")}</span>
                                </div>
                                {savingPct > 0 && (
                                  <p className="text-green-600 text-[9px] font-bold">Ahorras {savingPct}% hoy</p>
                                )}
                              </div>
                            ) : product.price ? (
                              <p className="text-[#C5A55A] font-black text-sm mb-2">${parseInt((product.price||"").replace(/[^0-9]/g,"")).toLocaleString("es-MX")} MXN</p>
                            ) : (
                              <p className="text-gray-400 text-xs mb-2 italic">{t("consultPrice", lang)}</p>
                            )}
                            {/* Botón Más información */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const salePriceLabel = salePrice ? `$${parseInt(String(salePrice).replace(/[^0-9]/g,"")).toLocaleString("es-MX")} MXN` : null;
                                const regularPriceLabel = product.price ? `$${parseInt((product.price||"").replace(/[^0-9]/g,"")).toLocaleString("es-MX")} MXN` : null;
                                const item: DetailItem = {
                                  id: `prd-${product.id}`,
                                  productId: product.id,
                                  name: product.name,
                                  description: product.description,
                                  price: salePriceLabel ?? regularPriceLabel,
                                  priceNum: priceNum,
                                  regularPrice: salePrice && regularPriceNum ? regularPriceNum : null,
                                  category: product.category,
                                  imageUrl: product.imageUrl,
                                  itemType: "product",
                                  isLoadingAI: true,
                                };
                                setDetailItem(item);
                                generateProductInfoMutation.mutate(
                                  { name: product.name, description: product.description ?? undefined, category: product.category ?? undefined },
                                  {
                                    onSuccess: (data) => {
                                      setDetailItem(prev => prev && prev.id === `prd-${product.id}` ? {
                                        ...prev,
                                        benefits: data.benefits,
                                        howToUse: data.howToUse,
                                        ingredients: data.ingredients,
                                        disclaimer: data.disclaimer,
                                        isLoadingAI: false,
                                      } : prev);
                                    },
                                    onError: () => {
                                      setDetailItem(prev => prev ? { ...prev, isLoadingAI: false } : prev);
                                    },
                                  }
                                );
                              }}
                              className="w-full flex items-center justify-center gap-1 font-semibold text-[10px] py-1.5 rounded-lg mb-1.5 transition-all active:scale-95"
                              style={{ border: "1px solid rgba(197,165,90,0.35)", color: "#C5A55A", background: "rgba(197,165,90,0.05)" }}
                            >
                              <Info className="w-3 h-3" /> Más información
                            </button>
                            <div className="flex gap-1.5">
                              <button
                                disabled={isOutOfStock}
                                onClick={() => !isOutOfStock && addToCart({ id: `prd-${product.id}`, name: product.name, price: priceNum ?? 0, priceLabel: salePrice ? `$${parseInt(String(salePrice).replace(/[^0-9]/g,"")).toLocaleString("es-MX")} MXN` : product.price ?? "Consultar", imageUrl: product.imageUrl, category: product.category ?? "general", itemType: "product", productId: product.id })}
                                className="flex-1 flex items-center justify-center border border-gray-200 text-gray-600 font-bold text-[10px] py-2 rounded-lg hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                                <ShoppingCart className="w-3 h-3" />
                              </button>
                              <button
                                disabled={isOutOfStock}
                                onClick={() => !isOutOfStock && openCheckout({ id: `prd-${product.id}`, name: product.name, price: priceNum ?? 0, priceLabel: salePrice ? `$${parseInt(String(salePrice).replace(/[^0-9]/g,"")).toLocaleString("es-MX")} MXN` : product.price ?? "Consultar", qty: 1, imageUrl: product.imageUrl, category: product.category ?? "general", itemType: "product", productId: product.id })}
                                className="flex-1 flex items-center justify-center bg-[#C5A55A] text-white font-bold text-[10px] py-2 rounded-lg hover:bg-[#B8963E] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                                <Zap className="w-3 h-3" /> {isOutOfStock ? "Agotado" : t("buy", lang)}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </HScrollRail>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ══════════════════════════════════════════════════════════════════════
          TAB: LIBRARYY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "library" && !searchQuery && (
        <div className="pb-28 mt-2">
          <div className="bg-white py-5">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-lg">{lang === "EN" ? "Nutriser Library" : "Librería Nutriser"}</h2>
                  <p className="text-gray-400 text-xs">{lang === "EN" ? "Exclusive digital resources for your well-being" : "Recursos digitales exclusivos para tu bienestar"}</p>
                </div>
              </div>
              {loadingEbook ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" /></div>
              ) : !ebook ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-400 text-xl mb-2">{t("comingSoon", lang)}</h3>
                  <p className="text-gray-300 text-sm max-w-xs mx-auto">{t("libraryEmpty", lang)}</p>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md">
                    {ebook.coverUrl && (
                      <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-8">
                        <img src={ebook.coverUrl} alt={ebook.title} className="max-h-80 w-auto object-contain rounded-lg shadow-xl" />
                        <button onClick={(e) => { e.stopPropagation(); track("ebook", `ebook-${ebook.id}`, ebook.title, "wishlist"); toggleWishlist({ id: `ebook-${ebook.id}`, name: ebook.title, price: (ebook as any).presalePrice ? parseFloat(String((ebook as any).presalePrice)) : parseFloat(String(ebook.price)), priceLabel: `$${((ebook as any).presalePrice ? parseFloat(String((ebook as any).presalePrice)) : parseFloat(String(ebook.price))).toLocaleString("es-MX")} MXN`, imageUrl: ebook.coverUrl, category: "ebook", itemType: "ebook" }); }} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all">
                          <Heart className={`w-4 h-4 transition-colors ${isInWishlist(`ebook-${ebook.id}`) ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                        </button>
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider mb-1">{t("typeDigitalEbook", lang)}</p>
                      <h3 className="font-black text-gray-900 text-xl leading-snug mb-2">{tx(ebook.title)}</h3>
                      {ebook.description && <p className="text-gray-500 text-sm leading-relaxed mb-4">{tx(ebook.description)}</p>}
                      {(ebook as any).presalePrice ? (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">Pre-compra</span>
                            <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">{t("specialPrice", lang)}</span>
                          </div>
                          <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-[#C5A55A]">${parseFloat(String((ebook as any).presalePrice)).toLocaleString("es-MX", { minimumFractionDigits: 0 })}</span>
                            <span className="text-sm text-gray-400 mb-1">MXN</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{t("regularPrice", lang)}: <span className="line-through">${parseFloat(String(ebook.price)).toLocaleString("es-MX", { minimumFractionDigits: 0 })} MXN</span></p>
                        </div>
                      ) : (
                        <div className="flex items-end gap-2 mb-4">
                          <span className="text-3xl font-black text-[#C5A55A]">${parseFloat(String(ebook.price)).toLocaleString("es-MX", { minimumFractionDigits: 0 })}</span>
                          <span className="text-sm text-gray-400 mb-1">MXN</span>
                        </div>
                      )}
                      {/* Aviso de preventa si aplica */}
                      {ebook.comingSoon && (ebook as any).presalePrice && (
                        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-3 flex items-start gap-2">
                          <span className="text-lg">⏳</span>
                          <div>
                            <p className="text-amber-800 font-bold text-xs mb-0.5">{lang === "EN" ? "Presale available" : "Pre-venta disponible"}</p>
                            <p className="text-amber-700 text-xs leading-relaxed">{lang === "EN" ? "Buy now at the special price. Reading access activates automatically when the book is published." : "Compra ahora al precio especial. El acceso para leer se activa automáticamente cuando el libro sea publicado."}</p>
                          </div>
                        </div>
                      )}
                      {ebook.comingSoon && !(ebook as any).presalePrice ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                          <p className="text-amber-700 font-bold text-sm">{t("comingSoonAvailable", lang)}</p>
                          <p className="text-gray-400 text-xs mt-1">{lang === "EN" ? "Subscribe to receive notification" : "Suscríbete para recibir notificación"}</p>
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
                          <Zap className="w-4 h-4" />
                          {(ebook as any).presalePrice ? (lang === "EN" ? "Pre-purchase now" : "Pre-comprar ahora") : t("buyNow", lang)}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: MIS TRATAMIENTOS — movido al Splash Hub */}
      {activeTab === "misTratamientos" && !searchQuery && (
        <div className="pb-28 mt-2 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center px-6">
            <div className="w-20 h-20 rounded-full bg-[#FAF7F2] flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-10 h-10 text-[#C5A55A]" />
            </div>
            <h2 className="font-black text-gray-900 text-xl mb-2">{t("myTreatments", lang)}</h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">{lang === "EN" ? "Access your treatment tracking, photos and consent form from the app home." : "Accede a tu seguimiento de tratamientos, fotos y contrato de consentimiento desde el inicio de la app."}</p>
            <button
              onClick={() => navigate("/mis-tratamientos")}
              className="bg-[#C5A55A] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#B8963E] transition-all active:scale-95 shadow-md"
            >
              {t("goToMyTreatments", lang)}
            </button>
          </div>
        </div>
      )}
      {false && (
        <div className="hidden">
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
      {activeTab === "wishlist" && !searchQuery && (
        <div className="pb-28 mt-2">
          <div className="bg-white py-5">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-lg">{t("wishlist", lang)}</h2>
                  <p className="text-gray-400 text-xs">{wishlistCount} {wishlistCount === 1 ? (lang === "EN" ? "saved item" : "artículo guardado") : (lang === "EN" ? "saved items" : "artículos guardados")}</p>
                </div>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-400 text-xl mb-2">{t("emptyWishlist", lang)}</h3>
                  <p className="text-gray-300 text-sm max-w-xs mx-auto">{t("wishlistEmpty", lang)}</p>
                  <button onClick={() => setActiveTab("tratamientos")} className="mt-4 text-[#C5A55A] font-bold text-sm hover:underline">{lang === "EN" ? "Explore treatments" : "Explorar tratamientos"}</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {wishlist.map(item => {
                    const typeLabels: Record<string, string> = { service: t("typeTreatment", lang), package: t("typePackage", lang), product: t("typeProduct", lang), ebook: t("typeEbook", lang) };
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
                          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">{typeLabels[item.itemType] || (lang === "EN" ? "Item" : "Artículo")}</p>
                          <h3 className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 mt-0.5">{item.name}</h3>
                          <p className="text-[#C5A55A] font-black text-sm mt-auto">{item.priceLabel}</p>
                          <div className="flex gap-1.5 mt-2">
                            <button
                              onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, priceLabel: item.priceLabel, imageUrl: item.imageUrl, category: item.category ?? "general", itemType: item.itemType, productId: item.productId, ebookId: item.ebookId })}
                              className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-600 font-bold text-[10px] py-1.5 rounded-lg hover:bg-gray-50 transition-all active:scale-95"
                            >
                              <ShoppingCart className="w-3 h-3" /> {t("add", lang)}
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
                <h2 className="font-bold text-gray-900">{t("myCart", lang)}</h2>
                <span className="bg-[#C5A55A] text-white text-xs font-black px-2 py-0.5 rounded-full">{cartCount}</span>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            {/* Content */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium">{t("cartEmpty", lang)}</p>
                <p className="text-gray-300 text-sm mt-1">{t("cartEmptyDesc", lang)}</p>
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
                    <span className="font-bold text-gray-900">{t("total", lang)}</span>
                    <span className="text-xl font-black text-[#C5A55A]">${cartTotal.toLocaleString("es-MX")} MXN</span>
                  </div>
                  <button onClick={() => { setCartOpen(false); openCheckout(); }}
                    className="w-full bg-[#C5A55A] text-white font-black py-4 rounded-xl hover:bg-[#B8963E] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg text-base">
                    <Zap className="w-5 h-5" /> {t("proceedToCheckout", lang)}
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
                {successCode ? t("orderSent", lang) : t("finalizeOrder", lang)}
              </h2>
              <button onClick={() => setCheckoutOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {successCode ? (
              <div className="p-6 text-center">
                {successCode === 'EFECTIVO' ? (
                  <>
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-200">
                      <span className="text-3xl">💵</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">{t("cashPendingRegistered", lang)}</h3>
                    <p className="text-gray-500 text-sm mb-4">{lang === "EN" ? <>Your order was saved as a <strong>pending clinic payment</strong> in your wallet.</> : <>Tu pedido quedó guardado como <strong>pago en clínica pendiente</strong> en tu monedero.</>}</p>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 text-left space-y-2">
                      <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">{lang === "EN" ? "What's next?" : "¿Qué sigue?"}</p>
                      <p className="text-sm text-orange-800">1. {lang === "EN" ? "Go to the clinic to complete your payment." : "Acúde a la clínica para realizar tu pago."}</p>
                      <p className="text-sm text-orange-800">2. {t("cashStep2", lang)}</p>
                      <p className="text-sm text-orange-800">3. {t("cashStep3", lang)}</p>
                    </div>
                    <button onClick={() => { setCheckoutOpen(false); setCart([]); }}
                      className="w-full bg-[#C5A55A] text-white font-bold py-3 rounded-xl hover:bg-[#B8963E] transition-all">
                      {lang === "EN" ? "Got it" : "Entendido"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">{t("receiptReceived", lang)}</h3>
                    <p className="text-gray-500 text-sm mb-4">{lang === "EN" ? "Your order is under review. We will contact you soon to confirm." : "Tu pedido está en revisión. Te contactaremos pronto para confirmar."}</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                      <p className="text-xs text-gray-400 mb-1">{lang === "EN" ? "Tracking code" : "Código de seguimiento"}</p>
                      <p className="font-black text-[#C5A55A] text-lg font-mono">{successCode}</p>
                    </div>
                    <button onClick={() => { setCheckoutOpen(false); setCart([]); }}
                      className="w-full bg-[#C5A55A] text-white font-bold py-3 rounded-xl hover:bg-[#B8963E] transition-all">
                      {t("done", lang)}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitCheckout} className="p-4 space-y-5">
                {/* Banner de deuda activa o monedero suspendido */}
                {isLoggedIn && (patientHasDebt || walletData?.isActive === false) && (
                  <DebtBlockBanner
                    hasDebt={patientHasDebt}
                    isSuspended={walletData?.isActive === false}
                    className="mb-2"
                  />
                )}
                {/* Resumen */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("yourOrder", lang)}</p>
                  {checkoutItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium line-clamp-1 flex-1 mr-2">{item.qty}x {item.name}</span>
                      <span className="text-[#C5A55A] font-bold flex-shrink-0">{item.priceLabel}</span>
                    </div>
                  ))}
                  {/* Descuento del monedero aplicado automáticamente */}
                  {walletDiscountPercent > 0 && hasValidPrice && !discountInfo?.isGift && (
                    <div className="flex items-center justify-between text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-2 py-1.5">
                      <span className="font-semibold">🏷️ Descuento Monedero ({walletDiscountPercent}%)</span>
                      <span className="font-bold">-${walletDiscountAmount.toLocaleString("es-MX")} MXN</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex items-center justify-between font-bold">
                    <span className="text-gray-900">{t("total", lang)}</span>
                    <div className="text-right">
                      {walletDiscountPercent > 0 && hasValidPrice && !discountInfo?.isGift && (
                        <div className="text-xs text-gray-400 line-through">${checkoutTotal.toLocaleString("es-MX")} MXN</div>
                      )}
                      <span className="text-[#C5A55A]">{hasValidPrice ? `$${discountedTotal.toLocaleString("es-MX")} MXN` : t("consultPrice", lang)}</span>
                    </div>
                  </div>
                </div>
                {/* Código de descuento */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t("discountCode", lang)}</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <Input value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder={t("enterDiscountCode", lang)} className="pl-9" />
                    </div>
                    <Button type="button" onClick={handleValidateDiscount} disabled={discountValidating} className="bg-[#C5A55A] hover:bg-[#B8963E] text-white px-3 text-sm">
                      {discountValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : t("apply", lang)}
                    </Button>
                  </div>
                  {discountInfo?.valid && (
                    <div className="mt-2 flex items-center gap-2 text-green-600 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{discountInfo.isGift ? (lang === "EN" ? "Gift applied! Your purchase is free." : "¡Regalo aplicado! Tu compra es gratis.") : discountInfo.isTwoForOne ? (lang === "EN" ? "2x1 applied!" : "¡2x1 aplicado!") : `${discountInfo.discount}% ${t("discountToast", lang)} — Total: $${discountedTotal.toLocaleString("es-MX")} MXN`}</span>
                    </div>
                  )}
                </div>
                {/* Datos del comprador */}
                {isLoggedIn && patient ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("yourData", lang)}</p>
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
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("yourData", lang)}</p>
                    <div>
                      <Label htmlFor="co-name" className="text-sm text-gray-600">{t("fullName", lang)}</Label>
                      <Input id="co-name" value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder={lang === "EN" ? "Your full name" : "Tu nombre completo"} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="co-email" className="text-sm text-gray-600">{t("emailLabel", lang)}</Label>
                      <Input id="co-email" type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="tu@email.com" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="co-phone" className="text-sm text-gray-600">{t("phoneLabel", lang)}</Label>
                      <Input id="co-phone" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="+52 322..." required className="mt-1" />
                    </div>
                  </div>
                )}
                {/* Monedero Nutriser */}
                {isLoggedIn && hasValidPrice && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{lang === "EN" ? "Nutriser Wallet" : "Monedero Nutriser"}</p>
                    {/* Saldo y opción de usar */}
                    <div className={`border rounded-xl p-3 transition-all ${useWallet ? 'border-[#C5A55A] bg-amber-50/50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-[#C5A55A] flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{t("yourSaldo", lang)}</p>
                          <p className="text-xs text-gray-500">{t("available", lang)}: <span className="font-bold text-[#C5A55A]">${(walletBalance / 100).toFixed(2)} MXN</span></p>
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
                          <span className="text-sm text-gray-700">{t("useSaldoToPay", lang)}</span>
                        </label>
                      )}
                      {useWallet && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{t("walletDiscount", lang)}</span>
                            <span className="font-bold text-green-600">-${(walletAmount / 100).toFixed(2)} MXN</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-600">{fullyCoveredByWallet ? t("coveredByWallet", lang) : t("remainingToTransfer", lang)}</span>
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
                          {t("cashbackEarn", lang)} <span className="font-bold">${cashbackAmount.toLocaleString("es-MX")} MXN</span> {t("cashbackOf", lang)}
                          <span className="text-emerald-500 block text-[10px] mt-0.5">{t("cashbackNextPurchase", lang)}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {/* — Selector de método de pago — */}
                {!fullyCoveredByWallet && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t("paymentMethod", lang)}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('transfer')}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                          paymentMethod === 'transfer'
                            ? 'border-[#C5A55A] bg-amber-50 text-[#C5A55A]'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xl">🏦</span>
                        <span className="text-xs font-bold">{t("transfer", lang)}</span>
                        <span className="text-[10px] text-center leading-tight opacity-70">{t("uploadReceipt", lang)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                          paymentMethod === 'cash'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xl">💵</span>
                        <span className="text-xs font-bold">{t("cash", lang)}</span>
                        <span className="text-[10px] text-center leading-tight opacity-70">{t("payAtClinic", lang)}</span>
                      </button>
                    </div>
                    {paymentMethod === 'cash' && !walletData?.id && (
                      <p className="text-xs text-orange-600 mt-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                        ⚠️ {t("needWalletAccount", lang)}
                      </p>
                    )}
                    {paymentMethod === 'cash' && walletData?.id && (() => {
                      const totalCents = Math.round(discountedTotal * 100);
                      const walletUsedCents = useWallet ? Math.min(walletAmount, totalCents) : 0;
                      const cashCents = totalCents - walletUsedCents;
                      return (
                        <div className="mt-2 bg-green-50 border border-green-200 rounded-xl p-3 space-y-2">
                          <p className="text-xs font-bold text-green-700">{t("cashPendingTitle", lang)}</p>
                          {walletUsedCents > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">{t("walletBalance2", lang)}</span>
                              <span className="font-bold text-[#C5A55A]">-${(walletUsedCents / 100).toFixed(2)} MXN</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">{t("cashToPay", lang)}</span>
                            <span className="font-bold text-green-700">${(cashCents / 100).toFixed(2)} MXN</span>
                          </div>
                          <p className="text-xs text-green-600">{t("adminWillConfirm", lang)}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
                {/* Datos bancarios — solo si es transferencia y no cubre monedero */}
                {!fullyCoveredByWallet && paymentMethod === 'transfer' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">{t("transferDataTitle", lang)}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">{t("bankLabel", lang)} <span className="font-bold text-gray-700">{BANK_INFO.bank}</span></p>
                        <p className="text-xs text-gray-500">{t("clabeLabel", lang)} <span className="font-bold font-mono text-gray-700">{BANK_INFO.account}</span></p>
                      </div>
                      <CopyButton text={BANK_INFO.account} />
                    </div>
                    <p className="text-xs text-gray-500">{t("amountLabel", lang)} <span className="font-black text-[#C5A55A]">{hasValidPrice ? `$${transferAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN` : t("consultPrice", lang)}</span>{useWallet && walletAmount > 0 && <span className="text-green-600 text-[10px] ml-1">({lang === "EN" ? "wallet" : "monedero"}: -${(walletAmount / 100).toFixed(2)})</span>}</p>
                  </div>
                )}
                {/* Comprobante — solo si es transferencia */}
                {!fullyCoveredByWallet && paymentMethod === 'transfer' && (
                  <div>
                    <Label className="text-sm text-gray-600">{t("proofLabel", lang)}</Label>
                    <label className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:border-[#C5A55A] hover:bg-amber-50/50 transition-all">
                      {proofFile ? (
                        <div className="text-center">
                          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-green-700">{proofFile.name}</p>
                          <p className="text-xs text-gray-400">{t("tapToChange", lang)}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                          <p className="text-sm font-semibold text-gray-600">{t("uploadReceipt2", lang)}</p>
                          <p className="text-xs text-gray-400">{t("fileFormats", lang)}</p>
                        </div>
                      )}
                      <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) { toast.error(t("maxFileSize", lang)); return; }
                        setProofFile(file);
                      }} />
                    </label>
                  </div>
                )}
                <Button type="submit" disabled={isSubmitting} className={`w-full text-white font-black py-3.5 text-base rounded-xl shadow-md ${
                  paymentMethod === 'cash' && !fullyCoveredByWallet
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-[#C5A55A] hover:bg-[#B8963E]'
                }`}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    fullyCoveredByWallet ? t("confirmWithWallet", lang) :
                    paymentMethod === 'cash' ? `💵 ${t("registerCashPayment", lang)}` :
                    t("sendReceiptAndConfirm", lang)
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          BARRA DE NAVEGACIÓN INFERIOR — Monedero FAB centrado (estilo Monedero del Ahorro)
      ══════════════════════════════════════════════════════════════════════ */}
      {!walletSheetOpen && !checkoutOpen && !cartOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[60]">
          {/* Tarjeta Monedero FAB — sobresale hacia arriba de la barra, estilo Monedero del Ahorro */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ zIndex: 10, bottom: 'calc(100% - 10px)' }}>
            <button
              onClick={() => {
                if (!requireAuth("ver tu Monedero Nutriser")) return;
                if (!walletData && patient?.id) walletQuery.refetch();
                setWalletSheetOpen(true);
              }}
              className="flex flex-col items-center relative group"
              aria-label="Mi Monedero Nutriser"
            >
              {/* Contador de notificaciones no leídas */}
              {adminUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 z-10 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  {adminUnreadCount > 9 ? '9+' : adminUnreadCount}
                </span>
              )}
              {/* Tarjeta CR-80 Nutriser — más grande para que se vea el diseño */}
              <div
                className="relative overflow-hidden group-hover:scale-105 active:scale-95 transition-all"
                style={{
                  width: 80,
                  height: 52,
                  borderRadius: 9,
                  background: '#FFFFFF',
                  boxShadow: '0 -4px 20px rgba(197,165,90,0.5), 0 4px 16px rgba(197,165,90,0.4), 0 0 0 2px #C5A55A',
                }}
              >
                {/* Franja dorada superior */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 11, background: 'linear-gradient(90deg, #8B6914, #C5A55A, #E8C97A, #C5A55A, #8B6914)', display: 'flex', alignItems: 'center', paddingLeft: 5, gap: 3 }}>
                  <img src={LOGO_URL} alt="" style={{ width: 14, height: 14, objectFit: 'contain', flexShrink: 0 }} />
                  <span style={{ color: '#3a2200', fontWeight: 900, fontSize: 5.5, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1 }}>Monedero</span>
                </div>
                {/* Silueta dorada */}
                <img src="/manus-storage/nutriser-silueta_f6738ee7.png" alt="" style={{ position: 'absolute', right: 2, top: 10, bottom: 10, height: 'calc(100% - 22px)', width: 'auto', objectFit: 'contain', opacity: 0.85, filter: 'sepia(1) saturate(2.8) hue-rotate(3deg) brightness(0.9)', pointerEvents: 'none' }} />
                {/* Franja dorada inferior */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 11, background: 'linear-gradient(135deg, #8B6914, #C5A55A, #E8C97A, #C5A55A, #8B6914)', display: 'flex', alignItems: 'center', paddingLeft: 5 }}>
                  <span style={{ color: '#1A1A1A', fontWeight: 900, fontSize: 5.5, textTransform: 'uppercase', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 55 }}>{patient?.name?.split(' ')[0] || 'Nutriser'}</span>
                </div>
              </div>
            </button>
          </div>

          {/* Barra inferior con 4 pestañas: 2 izquierda + espacio central + 2 derecha */}
          <div className="relative bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
            {/* Bump semicircular para el FAB */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-[1px]" style={{ width: 96, height: 20, overflow: 'hidden', pointerEvents: 'none' }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'white', border: '1px solid #e5e7eb', position: 'absolute', top: 0, left: 0, boxShadow: '0 -4px 10px rgba(0,0,0,0.06)' }} />
            </div>
            <div className="absolute left-0 right-0 -top-[1px] border-t border-gray-200" style={{ zIndex: 0 }} />
            <div className="w-full max-w-screen-lg mx-auto flex items-center pt-2 pb-1 px-2">
              {/* Izquierda: Tratamientos + Skincare */}
              <div className="flex flex-1 justify-around">
                {/* Tratamientos */}
                <button
                  onClick={() => setActiveTab("tratamientos")}
                  className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
                    activeTab === "tratamientos" ? "text-[#C5A55A]" : "text-gray-400"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="3.5" r="1.8" />
                    <path d="M8.5 7.5 C9 6 10.5 5.5 12 5.5 C13.5 5.5 15 6 15.5 7.5" />
                    <path d="M8.5 7.5 L8 11.5 C7.8 13 9.5 13.8 12 13.8 C14.5 13.8 16.2 13 16 11.5 L15.5 7.5" />
                    <path d="M8 11.5 L7.5 15.5 C7.5 17 9.5 17.8 12 17.8 C14.5 17.8 16.5 17 16.5 15.5 L16 11.5" />
                    <path d="M9.5 17.8 L9 22 M14.5 17.8 L15 22" />
                    <path d="M4.5 11 L6.5 12.5 M4.5 14 L6.5 12.5" strokeWidth="1.3" />
                    <path d="M19.5 11 L17.5 12.5 M19.5 14 L17.5 12.5" strokeWidth="1.3" />
                  </svg>
                  <span className="text-[10px] font-semibold leading-tight">{t("tabServices", lang)}</span>
                </button>
                {/* Skincare */}
                <button
                  onClick={() => setActiveTab("farmacy")}
                  className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
                    activeTab === "farmacy" ? "text-[#C5A55A]" : "text-gray-400"
                  }`}
                >
                  <Droplets className="w-6 h-6" />
                  <span className="text-[10px] font-semibold leading-tight">{t("tabProducts", lang)}</span>
                </button>
              </div>

              {/* Centro: espacio para la tarjeta FAB + etiqueta Monedero */}
              <div style={{ width: 96, flexShrink: 0 }} className="flex flex-col items-center justify-end pb-1">
                <span className="text-[10px] font-bold text-[#C5A55A] leading-tight">{t("tabWallet", lang)}</span>
              </div>

              {/* Derecha: Librería + Deseos + Cuenta */}
              <div className="flex flex-1 justify-around">
                {/* Librería */}
                <button
                  onClick={() => setActiveTab("library")}
                  className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
                    activeTab === "library" ? "text-[#C5A55A]" : "text-gray-400"
                  }`}
                >
                  <BookOpen className="w-6 h-6" />
                  <span className="text-[10px] font-semibold leading-tight">{t("tabLibrary", lang)}</span>
                </button>
                {/* Deseos */}
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors relative ${
                    activeTab === "wishlist" ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  <Heart className="w-6 h-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount > 9 ? "9+" : wishlistCount}</span>
                  )}
                  <span className="text-[10px] font-semibold leading-tight">{t("tabWishlist", lang)}</span>
                </button>
                {/* Cuenta */}
                <button
                  onClick={() => {
                    if (!requireAuth("ver tu cuenta y estado de monedero")) return;
                    navigate("/monedero");
                  }}
                  className="flex flex-col items-center gap-0.5 py-1 px-2 transition-colors text-gray-400"
                >
                  <User className="w-6 h-6" />
                  <span className="text-[10px] font-semibold leading-tight">{t("tabAccount", lang)}</span>
                </button>
              </div>
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
              <h2 className="text-lg font-bold text-gray-900">{t("walletPanelTitle", lang)}</h2>
            </div>

            {/* ── Tarjeta digital — NutriserWalletCard (fondo blanco, diseño unificado) ── */}
            <div className="px-5 pb-3">
              {walletData ? (
                <NutriserWalletCard
                  patientName={patient?.name || '---'}
                  walletNumber={walletData.walletNumber || '---'}
                  qrUrl={`https://nutriserpv.com/c/${walletData.walletNumber || ''}`}
                  isActive={walletData.isActive !== false}
                  balance={walletBalance}
                  showBalance={true}
                  onQRClick={() => setShowQRFullscreen(true)}
                  discountPercent={walletData.discountPercent ?? null}
                />
              ) : (
                <div style={{ aspectRatio: "85.5/54", background: "#f9f6f0", borderRadius: 14, border: "1.5px solid #D4AF60", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Loader2 className="w-6 h-6 animate-spin text-[#C5A55A]" />
                </div>
              )}
            </div>

            {/* Ver Estado de Cuenta */}
            <div className="px-5 pb-1">
              <button
                onClick={() => { setWalletSheetOpen(false); navigate("/monedero"); }}
                className="w-full text-[#C5A55A] text-sm font-bold py-2 underline"
              >
                {t("viewStatement", lang)}
              </button>
            </div>

            {/* Botón Ir a mi monedero */}
            <div className="px-5 pb-8 pt-1">
              <button
                onClick={() => { setWalletSheetOpen(false); navigate("/monedero"); }}
                className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold py-4 rounded-2xl text-base active:scale-[0.98] transition-all shadow-lg shadow-[#C5A55A]/20"
              >
                {t("goToMyWallet", lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Fullscreen para escanear con iPad */}
      <QRFullscreenModal
        open={showQRFullscreen}
        qrUrl={walletData ? `https://nutriserpv.com/c/${walletData.walletNumber || ''}` : ''}
        patientName={patient?.name || '---'}
        walletNumber={walletData?.walletNumber || '---'}
        onClose={() => setShowQRFullscreen(false)}
      />

      {/* ══════════════════════════════════════════════════════════════════
          MODAL DE ACCIÓN AL HACER CLIC EN BANNER
      ══════════════════════════════════════════════════════════════════ */}
      {bannerActionModal.open && (
        <div className="fixed inset-0 z-[90] flex items-end md:items-center md:justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setBannerActionModal({ open: false, banner: null })}
          />
          {/* Sheet */}
          <div className="relative w-full md:max-w-sm md:mx-auto bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden" style={{ animation: 'slideUp 0.28s ease-out' }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Imagen del banner en miniatura */}
            {bannerActionModal.banner?.imageUrl && (
              <div className="mx-4 mt-3 mb-0 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/5' }}>
                <img
                  src={bannerActionModal.banner.imageUrl}
                  alt={bannerActionModal.banner.title || 'Promo'}
                  className="w-full h-full object-contain bg-black"
                />
              </div>
            )}

            <div className="px-5 pt-4 pb-2">
              <h2 className="text-[#1A1A1A] font-black text-lg text-center leading-tight">
                {bannerActionModal.banner?.title
                  ? `¿Qué deseas hacer con esta promoción?`
                  : '¿Qué deseas hacer?'}
              </h2>
              {bannerActionModal.banner?.title && (
                <p className="text-[#C5A55A] text-sm font-semibold text-center mt-1">{bannerActionModal.banner.title}</p>
              )}
            </div>

            {/* Botón 1: Comprar en clínica */}
            <div className="px-5 pt-3 pb-2">
              <button
                onClick={handleBannerBuyInClinic}
                className="w-full bg-[#1A1A1A] text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 hover:bg-[#2D2D2D] active:scale-[0.98] transition-all shadow-md"
              >
                <Wallet className="w-5 h-5 text-[#C5A55A]" />
                Comprar en clínica
              </button>
              <p className="text-gray-400 text-[11px] text-center mt-1.5">Registra tu interés en el monedero y págalo en la clínica</p>
            </div>

            {/* Botón 2: Pedir informes por WhatsApp */}
            <div className="px-5 pb-6">
              <button
                onClick={handleBannerWhatsApp}
                className="w-full bg-[#25D366] text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 hover:bg-[#1ebe5d] active:scale-[0.98] transition-all shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Pedir informes por WhatsApp
              </button>
              <p className="text-gray-400 text-[11px] text-center mt-1.5">Chatea con nosotros y te damos precio y detalles</p>
            </div>

            {/* Cancelar */}
            <div className="px-5 pb-8">
              <button
                onClick={() => setBannerActionModal({ open: false, banner: null })}
                className="w-full text-gray-400 font-semibold py-2 text-sm hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Diálogo de confirmación de interés en banner ─────────────────────── */}
      {bannerConfirmDialog.open && bannerConfirmDialog.banner && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeInScale_0.2s_ease-out]">
            {/* Imagen miniatura */}
            {bannerConfirmDialog.banner.imageUrl && (
              <div className="w-full h-36 bg-black">
                <img
                  src={bannerConfirmDialog.banner.imageUrl}
                  alt={bannerConfirmDialog.banner.title || 'Promo'}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="px-6 pt-5 pb-2 text-center">
              <div className="w-12 h-12 rounded-full bg-[#C5A55A]/10 flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-[#C5A55A]" />
              </div>
              <h3 className="text-[#1A1A1A] font-black text-lg leading-tight">¿Confirmas tu interés?</h3>
              {bannerConfirmDialog.banner.title && (
                <p className="text-[#C5A55A] font-bold text-sm mt-1">{bannerConfirmDialog.banner.title}</p>
              )}
              <p className="text-gray-500 text-sm mt-2 leading-snug">
                Se registrará en tu Monedero Nutriser. Preséntate en la clínica y el equipo te dará el precio y lo acreditará a tu saldo.
              </p>
            </div>
            <div className="px-6 pb-6 pt-3 flex flex-col gap-3">
              <button
                onClick={handleConfirmBannerInterest}
                disabled={createBannerInterestMutation.isPending}
                className="w-full bg-[#C5A55A] text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 hover:bg-[#b8944d] active:scale-[0.98] transition-all shadow-md disabled:opacity-60"
              >
                {createBannerInterestMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Registrando...</>
                ) : (
                  <><Check className="w-5 h-5" /> Confirmar interés</>
                )}
              </button>
              <button
                onClick={() => setBannerConfirmDialog({ open: false, banner: null })}
                disabled={createBannerInterestMutation.isPending}
                className="w-full text-gray-400 font-semibold py-2 text-sm hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS animations moved to index.css */}
    </div>
  );
}
