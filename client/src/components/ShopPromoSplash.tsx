/*
 * ShopPromoSplash — Pop-up promocional de Nutriser Shop
 * Aparece automáticamente al abrir la app (antes del Splash 0), una vez por sesión.
 * Slide 0: tarjeta de Nutriser Shop con las 4 imágenes reales
 * Slide 1+: cupones/promociones activos (igual que PromoSplash en la tienda)
 * El usuario DEBE cerrarlo manualmente (X o "Después").
 */
import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { X, ShoppingBag, Gift, Clock, ChevronLeft, ChevronRight, Flame } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

const GRID_IMAGES = [
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hollywood-peel_9d9185ed.png",
    label: "Hollywood Peel",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/mesoterapia_0df94f56.png",
    label: "Mesoterapia",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/productos-nutriser_35a8adbb.png",
    label: "Farmacia Nutriser",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/libro-nutriser_2c47a34a.png",
    label: "Librería",
  },
];

interface ShopPromoSplashProps {
  onClose: () => void;
  onGoToShop: () => void;
}

interface Promo {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: string | null;
  regularPrice?: string | null;
  maxCoupons?: number | null;
  isActive: boolean;
  expiresAt?: Date | string | null;
  couponsSold?: number;
  couponsRemaining?: number | null;
}

/* ── Slide 0: Tarjeta de Nutriser Shop ── */
function ShopCard({ onAction }: { onAction: () => void }) {
  return (
    <div className="relative w-full flex-shrink-0">
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ background: "#141008", border: "1px solid rgba(197,165,90,0.2)" }}
      >
        {/* Logo */}
        <div className="flex justify-center pt-5 pb-3 px-4">
          <img
            src={LOGO_URL}
            alt="Nutriser"
            style={{
              height: 64,
              objectFit: "contain",
              filter: "drop-shadow(0 2px 8px rgba(197,165,90,0.4))",
            }}
          />
        </div>

        {/* 2x2 image grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            borderTop: "1px solid rgba(197,165,90,0.25)",
            borderBottom: "1px solid rgba(197,165,90,0.25)",
          }}
        >
          {GRID_IMAGES.map((img, i) => (
            <div key={i} className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
              <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
              <div
                className="absolute bottom-0 left-0 right-0 px-2 py-1"
                style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.75))" }}
              >
                <span style={{ color: "#C5A55A", fontSize: 11, fontWeight: 600 }}>{img.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom text + CTA */}
        <div className="px-5 pt-4 pb-5">
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 700,
              color: "#D4AF6A",
              lineHeight: 1.1,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            Nutriser Shop
          </h2>
          <p style={{ color: "#b8b0a0", fontSize: 13, textAlign: "center", marginBottom: 16 }}>
            Tu tienda digital de salud y bienestar
          </p>
          <button
            onClick={onAction}
            className="w-full font-bold rounded-full transition-opacity hover:opacity-90 active:opacity-75 flex items-center justify-center gap-2"
            style={{
              background: "#C5A55A",
              color: "#141008",
              fontSize: 15,
              padding: "13px 0",
            }}
          >
            <ShoppingBag size={18} />
            Visitar Tienda →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Slides 1+: Tarjeta de cupón/promoción (igual que PromoSplash) ── */
function PromoCard({ promo, onAction }: { promo: Promo; onAction: () => void }) {
  const soldPercent = promo.maxCoupons
    ? Math.min(100, Math.round(((promo.couponsSold || 0) / promo.maxCoupons) * 100))
    : 0;

  return (
    <div className="relative w-full flex-shrink-0">
      <div className="relative h-[55vh] min-h-[380px] max-h-[520px] w-full overflow-hidden rounded-2xl">
        {promo.imageUrl ? (
          <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#C5A55A] via-[#D4B96A] to-[#8B6914]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-pulse">
          <Flame className="w-3.5 h-3.5" />
          OFERTA
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
          <h3 className="text-white font-bold text-xl leading-tight drop-shadow-lg">{promo.title}</h3>
          {promo.description && (
            <p className="text-white/80 text-sm leading-relaxed line-clamp-2">{promo.description}</p>
          )}
          {(promo.price || promo.regularPrice) && (
            <div className="flex items-end gap-3">
              {promo.regularPrice && (
                <div>
                  <span className="text-white/50 text-[10px] uppercase tracking-wider">Antes</span>
                  <p className="text-white/50 text-lg line-through">{promo.regularPrice}</p>
                </div>
              )}
              {promo.price && (
                <div>
                  <span className="text-[#C5A55A] text-[10px] uppercase tracking-wider font-bold">Ahora</span>
                  <p className="text-[#C5A55A] text-3xl font-black">{promo.price}</p>
                </div>
              )}
            </div>
          )}
          {promo.maxCoupons && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#C5A55A] rounded-full transition-all" style={{ width: `${soldPercent}%` }} />
              </div>
              <span className="text-white/70 text-[10px] font-medium whitespace-nowrap">{soldPercent}% vendido</span>
            </div>
          )}
          <button
            onClick={onAction}
            className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C5A55A]/30 transition-all active:scale-[0.98]"
          >
            <Gift className="w-5 h-5" />
            ¡LO QUIERO!
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopPromoSplash({ onClose, onGoToShop }: ShopPromoSplashProps) {
  const { data: promotions = [] } = trpc.promotions.list.useQuery();
  const activePromos = (promotions as Promo[]).filter((p) => p.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Slide 0 = ShopCard, slides 1+ = active promos
  const totalSlides = activePromos.length + 1;
  const isShopSlide = currentIndex === 0;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleGoToShop = useCallback(() => {
    onGoToShop();
  }, [onGoToShop]);

  const handlePromoAction = useCallback((promoId: number) => {
    // Navigate to the coupon page
    window.location.href = `/cupon/${promoId}`;
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % totalSlides);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute right-4 z-[110] w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="w-full max-w-sm md:max-w-md relative">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-2 bg-[#C5A55A]/20 backdrop-blur-sm rounded-full px-4 py-2 mb-1">
            {isShopSlide ? (
              <ShoppingBag className="w-4 h-4 text-[#C5A55A]" />
            ) : (
              <Gift className="w-4 h-4 text-[#C5A55A]" />
            )}
            <span className="text-[#C5A55A] text-sm font-bold tracking-wide">
              {isShopSlide ? "NUTRISER SHOP" : "OFERTAS EXCLUSIVAS"}
            </span>
          </div>
          {totalSlides > 1 && (
            <p className="text-white/60 text-xs">{currentIndex + 1} de {totalSlides}</p>
          )}
        </div>

        {/* Slide content */}
        {isShopSlide ? (
          <ShopCard onAction={handleGoToShop} />
        ) : (
          activePromos[currentIndex - 1] && (
            <PromoCard
              promo={activePromos[currentIndex - 1]}
              onAction={() => handlePromoAction(activePromos[currentIndex - 1].id)}
            />
          )
        )}

        {/* Navigation arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {totalSlides > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex ? "bg-[#C5A55A] w-6" : "bg-white/30 hover:bg-white/50 w-2"
                }`}
              />
            ))}
          </div>
        )}

        {/* Dismiss text */}
        <button
          onClick={handleClose}
          className="w-full text-center mt-3 text-white/50 text-sm hover:text-white/70 transition"
        >
          Después
        </button>
      </div>
    </div>
  );
}
