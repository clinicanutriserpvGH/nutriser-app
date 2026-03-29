/**
 * CouponPage - Página dedicada para ver un cupón específico
 * Se abre cuando alguien hace clic en el link compartido por WhatsApp
 * URL: /cupon/:id
 */
import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, ArrowRight, Clock, Flame, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function CouponPage() {
  const params = useParams<{ id: string }>();
  const couponId = parseInt(params.id || "0", 10);
  const [giftModalOpen, setGiftModalOpen] = useState(false);

  const { data: promotions, isLoading } = trpc.promotions.list.useQuery();

  const promo = promotions?.find((p) => p.id === couponId);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const getUrgencyLevel = (remaining: number | null | undefined, max: number | null | undefined) => {
    if (!max || remaining === null || remaining === undefined) return "none";
    if (remaining === 0) return "sold";
    if (remaining <= 3) return "critical";
    if (remaining <= Math.ceil(max * 0.3)) return "low";
    return "ok";
  };

  const handleLoQuiero = () => {
    // Redirect to home with hash to open the purchase modal
    window.location.href = `/#cupon-${couponId}`;
  };

  const handleBack = () => {
    sessionStorage.setItem("nutriser_scroll_to", "promociones");
    window.location.replace("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container max-w-2xl mx-auto px-4">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#C5A55A] hover:text-[#B8963E] font-semibold mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Ver todas las promociones
          </button>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-10 h-10 text-[#C5A55A] animate-spin" />
            </div>
          ) : !promo ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="font-serif text-2xl text-[#1A1A1A] mb-2">Cupón no encontrado</h2>
              <p className="text-[#666] mb-6">Este cupón ya no está disponible o ha expirado.</p>
              <button
                onClick={handleBack}
                className="bg-[#C5A55A] hover:bg-[#B8963E] text-white px-6 py-3 rounded-xl font-bold transition"
              >
                Ver otras promociones
              </button>
            </div>
          ) : (() => {
            const urgency = getUrgencyLevel(promo.couponsRemaining, promo.maxCoupons);
            const isSoldOut = urgency === "sold";
            const isCritical = urgency === "critical";
            const isLow = urgency === "low";
            const pct = promo.maxCoupons && promo.couponsRemaining != null
              ? Math.round(((promo.maxCoupons - promo.couponsRemaining) / promo.maxCoupons) * 100)
              : 0;

            return (
              <div>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-block bg-[#C5A55A]/20 text-[#8B6914] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
                    🎁 Oferta Exclusiva Nutriser
                  </div>
                  <h1 className="font-serif text-3xl lg:text-4xl text-[#1A1A1A] leading-tight">
                    {promo.title}
                  </h1>
                </div>

                {/* Coupon card */}
                <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C5A55A]/30">
                  {/* Urgency ribbon */}
                  {isCritical && !isSoldOut && (
                    <div className="bg-red-600 text-white text-center py-2 text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2 animate-pulse">
                      <Flame className="w-4 h-4" /> ¡ÚLTIMOS {promo.couponsRemaining} CUPONES! <Flame className="w-4 h-4" />
                    </div>
                  )}
                  {isLow && !isSoldOut && (
                    <div className="bg-orange-500 text-white text-center py-2 text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Pocos cupones disponibles
                    </div>
                  )}

                  {/* Image */}
                  {promo.imageUrl ? (
                    <div className="relative overflow-hidden" style={{ height: "260px" }}>
                      <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      {promo.regularPrice && promo.price && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-black shadow-lg">
                          🔥 OFERTA
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h2 className="font-serif text-2xl text-white leading-tight drop-shadow-lg">{promo.title}</h2>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#333] p-6">
                      {promo.regularPrice && promo.price && (
                        <div className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black mb-3">🔥 OFERTA</div>
                      )}
                      <h2 className="font-serif text-2xl text-white leading-tight">{promo.title}</h2>
                    </div>
                  )}

                  {/* Gold body */}
                  <div className="bg-gradient-to-br from-[#C5A55A] via-[#B8963E] to-[#9E7D2A] p-6">
                    {promo.description && (
                      <p className="text-white/90 text-base leading-relaxed mb-5">{promo.description}</p>
                    )}

                    {/* Price comparison */}
                    {(promo.regularPrice || promo.price) && (
                      <div className="bg-black/20 rounded-xl p-4 mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {promo.regularPrice && (
                            <div className="text-center">
                              <div className="text-white/50 text-xs uppercase tracking-wider">Antes</div>
                              <div className="text-white/60 text-xl line-through font-semibold">{promo.regularPrice}</div>
                            </div>
                          )}
                          {promo.regularPrice && promo.price && (
                            <ArrowRight className="w-6 h-6 text-white/60 flex-shrink-0" />
                          )}
                          {promo.price && (
                            <div className="text-center">
                              <div className="text-yellow-200 text-xs uppercase tracking-wider font-bold">Ahora</div>
                              <div className="text-white text-3xl font-black">{promo.price}</div>
                            </div>
                          )}
                        </div>
                        {promo.regularPrice && promo.price && (
                          <div className="bg-green-500 text-white text-sm font-black px-3 py-2 rounded-lg text-center">
                            ¡AHORRA!
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expiry date */}
                    {promo.expiresAt && (
                      <div className="flex items-center gap-2 mb-4 text-white/80 text-sm">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>Válido hasta el <strong className="text-white">{new Date(promo.expiresAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                      </div>
                    )}

                    {/* Coupon progress */}
                    {promo.maxCoupons != null && promo.couponsRemaining != null && (
                      <div className="mb-5">
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm font-bold flex items-center gap-1 ${
                            isCritical ? 'text-red-200' : isLow ? 'text-orange-200' : 'text-white/80'
                          }`}>
                            {isCritical && <Flame className="w-4 h-4" />}
                            {isSoldOut ? '❌ AGOTADO' : `${promo.couponsRemaining} cupones restantes`}
                          </span>
                          <span className="text-white/60 text-sm">{pct}% vendido</span>
                        </div>
                        <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isCritical ? 'bg-red-500 animate-pulse' : isLow ? 'bg-orange-400' : 'bg-green-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      onClick={handleLoQuiero}
                      disabled={isSoldOut}
                      className={`block w-full py-4 px-4 rounded-xl font-black text-base text-center uppercase tracking-widest transition-all duration-200 shadow-lg ${
                        isSoldOut
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-white text-[#8B6914] hover:bg-[#FAF7F2] hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {isSoldOut ? '❌ Agotado' : '🎁 ¡Lo Quiero! — Adquirir Cupón'}
                    </button>

                    <p className="text-white/60 text-xs text-center mt-3">
                      * Previa cita requerida · Válido en Nutriser Puerto Vallarta
                    </p>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-8 text-center">
                  <p className="text-[#666] text-sm mb-4">¿Quieres ver más ofertas?</p>
                  <button
                    onClick={handleBack}
                    className="bg-[#1A1A1A] hover:bg-[#333] text-[#C5A55A] border border-[#C5A55A] px-6 py-3 rounded-xl font-bold transition"
                  >
                    Ver todas las promociones
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
