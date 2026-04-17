/*
 * ShopPromoSplash — Pop-up promocional de Nutriser Shop
 * Aparece automáticamente al abrir la app (antes del Splash 0), una vez por sesión.
 * Slide 0: tarjeta de Nutriser Shop con las 4 imágenes reales
 * Slide 1+: cupones/promociones activos (igual que PromoSplash en la tienda)
 * El usuario DEBE cerrarlo manualmente (X o "Después").
 */
import { useState, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { X, ShoppingBag, Gift, Clock, ChevronLeft, ChevronRight, Flame } from "lucide-react";

function useCountdown(expiresAt: Date | string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (!expiresAt) { setTimeLeft(""); return; }
    const target = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expirado"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return timeLeft;
}

const SHOP_SPLASH_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-shop-splash-v2_e9a3a5ff.png";

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
      <button
        onClick={onAction}
        className="relative w-full overflow-hidden rounded-2xl block transition-opacity hover:opacity-95 active:opacity-80"
        style={{ background: "#141008", border: "1px solid rgba(197,165,90,0.2)", padding: 0 }}
      >
        {/* Imagen completa del splash */}
        <img
          src={SHOP_SPLASH_IMAGE}
          alt="Nutriser Shop"
          className="w-full h-auto block"
          style={{ display: "block" }}
        />
      </button>
    </div>
  );
}

/* ── Slides 1+: Tarjeta de cupón/promoción (igual que PromoSplash) ── */
function PromoCard({ promo, onAction }: { promo: Promo; onAction: () => void }) {
  // Porcentaje ficticio entre 40-75% basado en ID del cupón (igual que cuponera) para generar urgencia
  const soldPercent = promo.maxCoupons
    ? 40 + ((promo.id * 17 + 7) % 36)
    : 0;
  const countdown = useCountdown(promo.expiresAt);

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
          <div className="flex items-center gap-4">
            {countdown && countdown !== "Expirado" && (
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C5A55A]" />
                <span className="text-white text-xs font-medium">{countdown}</span>
              </div>
            )}
            {promo.maxCoupons && (
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 h-2.5 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full transition-all duration-700" style={{ width: `${soldPercent}%` }} />
                </div>
                <span className="text-orange-200 text-[10px] font-bold whitespace-nowrap">🔥 {soldPercent}% vendido</span>
              </div>
            )}
          </div>
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
