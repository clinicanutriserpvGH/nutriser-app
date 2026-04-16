/*
 * PromoSplash — Pop-up de publicidad al entrar a Nutriser Shop
 * Muestra automáticamente los cupones/promociones activos de la cuponera
 * + una tarjeta promocional del Monedero Nutriser invitando a crear cuenta.
 * La tarjeta del monedero es la PRIMERA slide del carrusel.
 */
import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { X, Gift, Clock, ChevronLeft, ChevronRight, Flame, Wallet, Star, Percent, Sparkles } from "lucide-react";

const WALLET_CARD_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-wallet-card-promo_af671ddf.png";

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
  onGoToCoupon?: (promoId: number) => void;
  onOpenWallet?: () => void;
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

/* ── Tarjeta de oferta/cupón ── */
function PromoCard({ promo, onAction }: { promo: Promo; onAction: () => void }) {
  const countdown = useCountdown(promo.expiresAt);
  const soldPercent = promo.maxCoupons
    ? Math.min(100, Math.round(((promo.couponsSold || 0) / promo.maxCoupons) * 100))
    : 0;

  return (
    <div className="relative w-full flex-shrink-0">
      <div className="relative h-[55vh] min-h-[380px] max-h-[520px] md:max-h-[600px] lg:max-h-[700px] w-full overflow-hidden rounded-2xl">
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
          <h3 className="text-white font-bold text-xl md:text-2xl lg:text-3xl leading-tight drop-shadow-lg">{promo.title}</h3>
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
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-[#C5A55A] rounded-full transition-all" style={{ width: `${soldPercent}%` }} />
                </div>
                <span className="text-white/70 text-[10px] font-medium whitespace-nowrap">{soldPercent}% vendido</span>
              </div>
            )}
          </div>
          <button
            onClick={onAction}
            className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold py-3.5 md:py-4 rounded-xl text-sm md:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#C5A55A]/30 transition-all active:scale-[0.98]"
          >
            <Gift className="w-5 h-5" />
            ¡LO QUIERO!
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta promocional del Monedero Nutriser — compacta, tipo crédito ── */
function MonederoPromoCard({ onAction }: { onAction: () => void }) {
  return (
    <div className="relative w-full flex-shrink-0">
      <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#1A1A1A] via-[#222222] to-[#1A1A1A] border border-[#C5A55A]/20">
        {/* Decorative gold line top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A55A]/60 to-transparent" />

        <div className="relative z-10 flex flex-col items-center px-5 py-6">
          {/* Credit card image — compact */}
          <div className="w-full max-w-[240px] md:max-w-[300px] lg:max-w-[360px] mb-4 md:mb-6">
            <img
              src={WALLET_CARD_IMG}
              alt="Monedero Nutriser"
              className="w-full h-auto rounded-lg shadow-[0_6px_24px_rgba(197,165,90,0.25)]"
            />
          </div>

          {/* Title */}
          <h3 className="text-[#C5A55A] font-black text-lg md:text-xl lg:text-2xl text-center leading-tight mb-1">
            Crea tu Monedero Nutriser
          </h3>
          <p className="text-gray-400 text-xs md:text-sm text-center leading-relaxed mb-4 md:mb-5 max-w-[260px] md:max-w-[320px]">
            Regístrate y obtén tu tarjeta digital con beneficios exclusivos
          </p>

          {/* Benefits — compact 2-column grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:gap-x-4 md:gap-y-3 mb-5 md:mb-6 w-full max-w-[280px] md:max-w-[340px]">
            {[
              { icon: Percent, text: "Cashback en compras" },
              { icon: Star, text: "Lealtad y recompensas" },
              { icon: Sparkles, text: "4ta consulta GRATIS" },
              { icon: Wallet, text: "Saldo electrónico" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#C5A55A]/15 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-2.5 h-2.5 text-[#C5A55A]" />
                </div>
                <span className="text-white/80 text-[11px] md:text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={onAction}
            className="w-full max-w-[260px] md:max-w-[320px] bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold py-3 md:py-4 rounded-xl text-sm md:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#C5A55A]/30 transition-all active:scale-[0.98]"
          >
            <Wallet className="w-4 h-4" />
            ¡Crear mi Monedero!
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromoSplash({ onClose, onGoToCoupon, onOpenWallet }: PromoSplashProps) {
  const { data: promotions = [] } = trpc.promotions.list.useQuery();
  const activePromos = (promotions as Promo[]).filter((p) => p.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Monedero is always slide 0, promos start at index 1
  const totalSlides = activePromos.length + 1;
  const isMonederoSlide = currentIndex === 0;

  const shouldShow = totalSlides > 0 && !dismissed;

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

  const handleAction = useCallback((promoId: number) => {
    sessionStorage.setItem("nutriser_promo_splash_shown", "1");
    if (onGoToCoupon) {
      onGoToCoupon(promoId);
    } else {
      handleClose();
    }
  }, [onGoToCoupon, handleClose]);

  const handleMonederoAction = useCallback(() => {
    sessionStorage.setItem("nutriser_promo_splash_shown", "1");
    if (onOpenWallet) {
      onOpenWallet();
    }
    handleClose();
  }, [onOpenWallet, handleClose]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % totalSlides);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  if (!shouldShow) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
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
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl relative">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-2 bg-[#C5A55A]/20 backdrop-blur-sm rounded-full px-4 py-2 mb-1">
            <Gift className="w-4 h-4 text-[#C5A55A]" />
            <span className="text-[#C5A55A] text-sm md:text-base lg:text-lg font-bold tracking-wide">
              {isMonederoSlide ? "BENEFICIOS EXCLUSIVOS" : "OFERTAS EXCLUSIVAS"}
            </span>
          </div>
          {totalSlides > 1 && (
            <p className="text-white/60 text-xs">
              {currentIndex + 1} de {totalSlides}
            </p>
          )}
        </div>

        {/* Card — monedero first (index 0), then promos */}
        {isMonederoSlide ? (
          <MonederoPromoCard onAction={handleMonederoAction} />
        ) : (
          activePromos[currentIndex - 1] && (
            <PromoCard
              promo={activePromos[currentIndex - 1]}
              onAction={() => handleAction(activePromos[currentIndex - 1].id)}
            />
          )
        )}

        {/* Navigation arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition z-20"
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
                  i === currentIndex
                    ? "bg-[#C5A55A] w-6"
                    : "bg-white/30 hover:bg-white/50 w-2"
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
