/**
 * CouponPage - Página dedicada para ver un cupón específico
 * Se abre cuando alguien hace clic en el link compartido por WhatsApp
 * URL: /cupon/:id
 */
import { useEffect, useState, useRef } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, ArrowRight, Clock, Flame, AlertTriangle, Upload, CheckCircle, X, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CouponPage() {
  const params = useParams<{ id: string }>();
  const couponId = parseInt(params.id || "0", 10);

  // Estados principales
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  // Estados del flujo de pago
  const [payName, setPayName] = useState('');
  const [payPhone, setPayPhone] = useState('');
  const [payEmail, setPayEmail] = useState('');
  const [payProofFile, setPayProofFile] = useState<File | null>(null);
  const [payStep, setPayStep] = useState<'form' | 'uploading' | 'done'>('form');
  const payProofRef = useRef<HTMLInputElement>(null);

  const { data: promotions, isLoading } = trpc.promotions.list.useQuery();
  const promo = promotions?.find((p) => p.id === couponId);

  // Mutaciones
  const createServicePurchaseMutation = trpc.servicePurchases.create.useMutation({
    onSuccess: () => {
      setPayStep('done');
      toast.success('¡Comprobante enviado! El equipo Nutriser verificará tu pago.');
    },
    onError: (e) => {
      setPayStep('form');
      toast.error('Error al enviar: ' + e.message);
    },
  });

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

  const handleBack = () => {
    sessionStorage.setItem("nutriser_scroll_to", "promociones");
    window.location.replace("/");
  };

  // Enviar comprobante de pago
  const handleSubmitPayment = async () => {
    if (!payName.trim() || !payPhone.trim()) {
      toast.error('Nombre y teléfono son requeridos');
      return;
    }
    if (!payProofFile) {
      toast.error('Sube el comprobante de pago');
      return;
    }
    if (!promo) return;

    setPayStep('uploading');
    try {
      const formData = new FormData();
      formData.append('file', payProofFile);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      const proofUrl = data.url;

      // Convertir el archivo a base64 para enviarlo al servidor
      const reader = new FileReader();
      const base64Data: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(payProofFile);
      });

      await createServicePurchaseMutation.mutateAsync({
        buyerName: payName.trim(),
        buyerPhone: payPhone.trim(),
        buyerEmail: payEmail.trim() || 'sin-correo@nutriser.com',
        serviceName: promo.title,
        proofData: base64Data,
        proofMimeType: payProofFile.type || 'image/jpeg',
        originalPrice: promo.price || undefined,
      });
    } catch (err: any) {
      setPayStep('form');
      toast.error('Error: ' + err.message);
    }
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
              <button onClick={handleBack} className="bg-[#C5A55A] hover:bg-[#B8963E] text-white px-6 py-3 rounded-xl font-bold transition">
                Ver otras promociones
              </button>
            </div>
          ) : (() => {
            const urgency = getUrgencyLevel(promo.couponsRemaining, promo.maxCoupons);
            const isSoldOut = urgency === "sold";
            const isCritical = urgency === "critical";
            const isLow = urgency === "low";
            // Porcentaje pseudo-aleatorio pero consistente por cupón (40-75%)
            const pct = isSoldOut ? 100 : 40 + ((promo.id * 17 + 7) % 36);

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
                      <Flame className="w-4 h-4" /> ¡ÚTIMOS CUPONES DISPONIBLES! <Flame className="w-4 h-4" />
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
                      <div className="bg-black/20 rounded-xl p-4 mb-5">
                        <div className="flex items-center justify-between">
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
                          <span className={`text-sm font-bold flex items-center gap-1 ${isCritical ? 'text-red-200' : isLow ? 'text-orange-200' : 'text-white/80'}`}>
                            {isCritical && <Flame className="w-4 h-4" />}
                            {isSoldOut ? '❌ AGOTADO' : '⚡ Cupones limitados'}
                          </span>
                          <span className="text-white/60 text-sm">{pct}% vendido</span>
                        </div>
                        <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${isCritical ? 'bg-red-500 animate-pulse' : isLow ? 'bg-orange-400' : 'bg-green-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      onClick={() => setShowPaymentFlow(true)}
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



                {/* ═══════════════════════════════════════════════════════
                     MODAL: PAGO CON COMPROBANTE + CÓDIGO EXTRA
                    ═══════════════════════════════════════════════════════ */}
                {showPaymentFlow && (
                  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 my-4 shadow-2xl">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">💳 Adquirir cupón</h2>
                        <button onClick={() => { setShowPaymentFlow(false); setPayStep('form'); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                      </div>

                      {payStep === 'done' ? (
                        <div className="text-center py-6">
                          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                          <h3 className="font-bold text-lg text-[#1A1A1A] mb-2">¡Comprobante enviado!</h3>
                          <p className="text-gray-500 text-sm mb-2">El equipo Nutriser verificará tu pago y te confirmará por WhatsApp.</p>
                          <p className="text-[#C5A55A] font-semibold text-sm">📞 322 450 3257</p>
                          <Button className="mt-5 bg-[#C5A55A] hover:bg-[#B8963E] text-white" onClick={() => { setShowPaymentFlow(false); setPayStep('form'); }}>
                            Cerrar
                          </Button>
                        </div>
                      ) : (
                        <>
                          {/* Resumen del cupón */}
                          <div className="bg-[#FAF7F2] rounded-xl p-4 mb-4">
                            <p className="font-semibold text-[#1A1A1A] text-sm mb-1">{promo.title}</p>
                            <div className="flex items-center gap-3">
                              {promo.regularPrice && <span className="text-gray-400 line-through text-sm">{promo.regularPrice}</span>}
                              {promo.price && <span className="text-[#C5A55A] font-black text-xl">{promo.price}</span>}
                            </div>
                          </div>

                          {/* Datos del cliente */}
                          <div className="space-y-3 mb-4">
                            <div>
                              <label className="text-xs font-semibold text-[#1A1A1A] mb-1 block">Nombre completo *</label>
                              <Input placeholder="Tony Robles" value={payName} onChange={e => setPayName(e.target.value)} className="text-[#1A1A1A] placeholder:text-gray-400" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[#1A1A1A] mb-1 block">Correo electrónico *</label>
                              <Input placeholder="tu@correo.com" value={payEmail} onChange={e => setPayEmail(e.target.value)} className="text-[#1A1A1A] placeholder:text-gray-400" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[#1A1A1A] mb-1 block">Teléfono *</label>
                              <Input placeholder="322 000 0000" value={payPhone} onChange={e => setPayPhone(e.target.value)} className="text-[#1A1A1A] placeholder:text-gray-400" />
                            </div>
                          </div>

                          {/* Instrucciones de pago */}
                          <div className="bg-[#1A1A1A] rounded-xl p-4 mb-4 text-white text-sm">
                            <p className="font-bold mb-2">💳 Datos para transferencia:</p>
                            <p className="text-gray-300">Banco: Banamex</p>
                            <p className="text-gray-300">CLABE Interbancaria: <span className="font-mono font-bold text-white">002470701448743487</span></p>
                            <p className="text-[#C5A55A] font-bold mt-2">
                              Monto a pagar: {promo.price}
                            </p>
                          </div>

                          {/* Subir comprobante */}
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-[#1A1A1A] mb-2">Comprobante de pago *</p>
                            <button
                              onClick={() => payProofRef.current?.click()}
                              className={`w-full border-2 border-dashed rounded-xl py-4 text-center transition ${payProofFile ? 'border-green-400 bg-green-50' : 'border-[#C5A55A]/50 hover:bg-[#C5A55A]/5'}`}
                            >
                              {payProofFile ? (
                                <div className="text-green-600">
                                  <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                                  <span className="text-sm font-medium">{payProofFile.name}</span>
                                </div>
                              ) : (
                                <div className="text-[#C5A55A]">
                                  <Upload className="w-6 h-6 mx-auto mb-1" />
                                  <span className="text-sm font-medium">Toca para subir comprobante</span>
                                </div>
                              )}
                            </button>
                            <input
                              ref={payProofRef}
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={e => setPayProofFile(e.target.files?.[0] || null)}
                            />
                          </div>

                          <Button
                            onClick={handleSubmitPayment}
                            disabled={payStep === 'uploading' || !payName || !payPhone || !payProofFile}
                            className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold py-3"
                          >
                            {payStep === 'uploading' ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
                            ) : (
                              '📤 Enviar comprobante de pago'
                            )}
                          </Button>
                          <p className="text-xs text-gray-400 text-center mt-2">El equipo Nutriser verificará tu pago y te confirmará por WhatsApp</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
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
