/*
 * PromoSplash — Pop-up de publicidad al entrar a Nutriser Shop
 * Muestra automáticamente los cupones/promociones activos de la cuponera.
 * Diseño tipo aparador de publicidad con carrusel de ofertas.
 * El usuario puede cerrar con X o "Después" y seguir navegando.
 */
import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { X, Gift, Clock, ChevronLeft, ChevronRight, Flame } from "lucide-react";

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

interface PromoSplashProps {
  onClose: () => void;
  onGoToCoupon?: () => void; // Navegar a la cuponera
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

function PromoCard({
  promo,
  onAction,
}: {
  promo: Promo;
  onAction: () => void;
}) {
  const countdown = useCountdown(promo.expiresAt);
  const soldPercent = promo.maxCoupons
    ? Math.min(100, Math.round(((promo.couponsSold || 0) / promo.maxCoupons) * 100))
    : 0;

  return (
    <div className="relative w-full flex-shrink-0">
      {/* Background image */}
      <div className="relative h-[55vh] min-h-[380px] max-h-[520px] w-full overflow-hidden rounded-2xl">
        {promo.imageUrl ? (
          <img
            src={promo.imageUrl}
            alt={promo.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#C5A55A] via-[#D4B96A] to-[#8B6914]" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        {/* Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-pulse">
          <Flame className="w-3.5 h-3.5" />
          OFERTA
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
          {/* Title */}
          <h3 className="text-white font-bold text-xl leading-tight drop-shadow-lg">
            {promo.title}
          </h3>

          {promo.description && (
            <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
              {promo.description}
            </p>
          )}

          {/* Prices */}
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

          {/* Timer + Stock */}
          <div className="flex items-center gap-4">
            {countdown && countdown !== "Expirado" && (
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C5A55A]" />
                <span className="text-white text-xs font-medium">{countdown}</span>
              </div>
            )}
            {promo.maxCoupons && (
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C5A55A] rounded-full transition-all"
                    style={{ width: `${soldPercent}%` }}
                  />
                </div>
                <span className="text-white/70 text-[10px] font-medium whitespace-nowrap">
                  {soldPercent}% vendido
                </span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={onAction}
            className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#C5A55A]/30 transition-all active:scale-[0.98]"
          >
            <Gift className="w-5 h-5" />
            ¡LO QUIERO!
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromoSplash({ onClose, onGoToCoupon }: PromoSplashProps) {
  const { data: promotions = [] } = trpc.promotions.list.useQuery();
  const activePromos = (promotions as Promo[]).filter((p) => p.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Don't show if no active promotions or already dismissed
  const shouldShow = activePromos.length > 0 && !dismissed;

  // Check if already shown in this session
  useEffect(() => {
    const lastShown = sessionStorage.getItem("nutriser_promo_splash_shown");
    if (lastShown) {
      setDismissed(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    setDismissed(true);
    sessionStorage.setItem("nutriser_promo_splash_shown", "1");
    onClose();
  }, [onClose]);

  const handleAction = useCallback(() => {
    sessionStorage.setItem("nutriser_promo_splash_shown", "1");
    if (onGoToCoupon) {
      onGoToCoupon();
    }
    handleClose();
  }, [onGoToCoupon, handleClose]);

  const goNext = () => setCurrentIndex((i) => (i + 1) % activePromos.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + activePromos.length) % activePromos.length);

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-[110] w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="w-full max-w-sm relative">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-[#C5A55A]/20 backdrop-blur-sm rounded-full px-4 py-2 mb-2">
            <Gift className="w-4 h-4 text-[#C5A55A]" />
            <span className="text-[#C5A55A] text-sm font-bold tracking-wide">OFERTAS EXCLUSIVAS</span>
          </div>
          {activePromos.length > 1 && (
            <p className="text-white/60 text-xs">{currentIndex + 1} de {activePromos.length} ofertas</p>
          )}
        </div>

        {/* Promo Card */}
        {activePromos[currentIndex] && (
          <PromoCard
            promo={activePromos[currentIndex]}
            onAction={handleAction}
          />
        )}

        {/* Navigation arrows */}
        {activePromos.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {activePromos.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {activePromos.map((_: Promo, i: number) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? "bg-[#C5A55A] w-6"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Dismiss text */}
        <button
          onClick={handleClose}
          className="w-full text-center mt-4 text-white/50 text-sm hover:text-white/70 transition"
        >
          Después
        </button>
      </div>
    </div>
  );
}
