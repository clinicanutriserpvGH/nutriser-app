import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CouponCardProps {
  couponCode: string;
  promotionTitle: string;
  promotionDescription: string;
  holderName: string;
  isGift?: boolean;
  recipientName?: string;
  expiresAt?: Date | string | null;
}

export default function CouponCard({
  couponCode,
  promotionTitle,
  promotionDescription,
  holderName,
  isGift,
  recipientName,
  expiresAt,
}: CouponCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const displayName = isGift && recipientName ? recipientName : holderName;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `cupon-nutriser-${couponCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      // Intentar compartir con Web Share API si está disponible
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], `cupon-nutriser-${couponCode}.png`, { type: "image/png" });
          try {
            await navigator.share({
              title: `Cupón Nutriser: ${promotionTitle}`,
              text: `🎁 ¡Te comparto este cupón de Nutriser!\n\n✨ ${promotionTitle}\n📋 Código: ${couponCode}\n👤 A nombre de: ${displayName}\n\n📍 Visítanos en nutriserpv.com`,
              files: [file],
            });
          } catch {
            // Fallback a WhatsApp web
            const msg = encodeURIComponent(
              `🎁 ¡Cupón Nutriser!\n\n✨ *${promotionTitle}*\n${promotionDescription}\n\n📋 *Código:* ${couponCode}\n👤 *A nombre de:* ${displayName}\n\n📍 Visítanos: nutriserpv.com`
            );
            window.open(`https://wa.me/?text=${msg}`, "_blank");
          }
        } else {
          // Fallback a WhatsApp web
          const msg = encodeURIComponent(
            `🎁 ¡Cupón Nutriser!\n\n✨ *${promotionTitle}*\n${promotionDescription}\n\n📋 *Código:* ${couponCode}\n👤 *A nombre de:* ${displayName}\n\n📍 Visítanos: nutriserpv.com`
          );
          window.open(`https://wa.me/?text=${msg}`, "_blank");
        }
      }, "image/png");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Tarjeta visual del cupón */}
      <div
        ref={cardRef}
        style={{
          width: "360px",
          background: "linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%)",
          borderRadius: "20px",
          overflow: "hidden",
          fontFamily: "'Georgia', serif",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Borde dorado superior */}
        <div style={{ height: "4px", background: "linear-gradient(90deg, #C5A55A, #F0D080, #C5A55A)" }} />

        {/* Header con logo */}
        <div style={{ padding: "24px 28px 16px", textAlign: "center" }}>
          <div style={{
            fontSize: "11px",
            letterSpacing: "4px",
            color: "#C5A55A",
            textTransform: "uppercase",
            marginBottom: "4px",
            fontFamily: "sans-serif",
          }}>
            AESTHETIC & NUTRITION
          </div>
          <div style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#F0D080",
            letterSpacing: "2px",
            fontFamily: "'Georgia', serif",
          }}>
            nutriser
          </div>
        </div>

        {/* Línea decorativa */}
        <div style={{ margin: "0 28px", height: "1px", background: "linear-gradient(90deg, transparent, #C5A55A, transparent)" }} />

        {/* Icono regalo */}
        <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
          <div style={{ fontSize: "36px" }}>🎁</div>
        </div>

        {/* Título de la promoción */}
        <div style={{ padding: "0 28px 16px", textAlign: "center" }}>
          <div style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#FFFFFF",
            lineHeight: "1.3",
            marginBottom: "8px",
          }}>
            {promotionTitle}
          </div>
          <div style={{
            fontSize: "13px",
            color: "#AAAAAA",
            lineHeight: "1.5",
            fontFamily: "sans-serif",
          }}>
            {promotionDescription}
          </div>
        </div>

        {/* Línea punteada de corte */}
        <div style={{
          margin: "0 16px",
          borderTop: "2px dashed #C5A55A44",
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            left: "-16px",
            top: "-10px",
            width: "20px",
            height: "20px",
            background: "#111",
            borderRadius: "50%",
          }} />
          <div style={{
            position: "absolute",
            right: "-16px",
            top: "-10px",
            width: "20px",
            height: "20px",
            background: "#111",
            borderRadius: "50%",
          }} />
        </div>

        {/* Sección inferior: titular y código */}
        <div style={{ padding: "20px 28px 24px" }}>
          {/* A nombre de */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{
              fontSize: "10px",
              letterSpacing: "2px",
              color: "#C5A55A",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
              marginBottom: "4px",
            }}>
              {isGift && recipientName ? "PARA" : "A NOMBRE DE"}
            </div>
            <div style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#FFFFFF",
              fontFamily: "'Georgia', serif",
            }}>
              {displayName}
            </div>
            {isGift && recipientName && (
              <div style={{ fontSize: "11px", color: "#888", fontFamily: "sans-serif", marginTop: "2px" }}>
                De parte de: {holderName}
              </div>
            )}
          </div>

          {/* Código único */}
          <div style={{
            background: "linear-gradient(135deg, #C5A55A22, #C5A55A11)",
            border: "1px solid #C5A55A44",
            borderRadius: "12px",
            padding: "14px",
            textAlign: "center",
            marginBottom: "16px",
          }}>
            <div style={{
              fontSize: "10px",
              letterSpacing: "2px",
              color: "#C5A55A",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
              marginBottom: "6px",
            }}>
              CÓDIGO DE CUPÓN
            </div>
            <div style={{
              fontSize: "22px",
              fontWeight: "bold",
              color: "#F0D080",
              letterSpacing: "4px",
              fontFamily: "monospace",
            }}>
              {couponCode}
            </div>
          </div>

          {/* Fecha límite */}
          {expiresAt && (
            <div style={{
              background: "#C5A55A22",
              border: "1px solid #C5A55A44",
              borderRadius: "8px",
              padding: "8px 12px",
              textAlign: "center",
              marginBottom: "12px",
            }}>
              <div style={{ fontSize: "10px", letterSpacing: "1px", color: "#C5A55A", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "2px" }}>
                Válido hasta
              </div>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#F0D080", fontFamily: "sans-serif" }}>
                {new Date(expiresAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          )}

          {/* Aviso de cita previa */}
          <div style={{
            background: "#FFFFFF11",
            border: "1px solid #FFFFFF22",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            marginBottom: "12px",
          }}>
            <div style={{ fontSize: "11px", color: "#CCCCCC", fontFamily: "sans-serif" }}>
              📞 Requiere cita previa • Llama al 322 450 3257
            </div>
          </div>

          {/* Validez */}
          <div style={{
            textAlign: "center",
            fontSize: "11px",
            color: "#666",
            fontFamily: "sans-serif",
            lineHeight: "1.5",
          }}>
            ✓ Cupón válido • Presentar al momento del servicio<br />
            <span style={{ color: "#C5A55A" }}>nutriserpv.com</span>
          </div>
        </div>

        {/* Borde dorado inferior */}
        <div style={{ height: "4px", background: "linear-gradient(90deg, #C5A55A, #F0D080, #C5A55A)" }} />
      </div>

      {/* Incentivo de compartir */}
      <div className="w-full max-w-[360px] bg-gradient-to-r from-[#C5A55A]/15 to-[#F0D080]/15 border border-[#C5A55A]/40 rounded-xl px-4 py-3 text-center">
        <p className="text-[#8B6914] font-bold text-sm mb-0.5">🎁 ¡Comparte con 5 personas y obtén 5% extra de descuento!</p>
        <p className="text-[#666] text-xs">Comparte este cupón por WhatsApp con 5 amigos y presenta las capturas al momento de tu cita para recibir tu descuento adicional.</p>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 w-full max-w-[360px]">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          variant="outline"
          className="flex-1 border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A]/10"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar
        </Button>
        <Button
          onClick={handleShareWhatsApp}
          disabled={downloading}
          className="flex-1 bg-[#25D366] hover:bg-[#1DA851] text-white"
        >
          <Share2 className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
      </div>
    </div>
  );
}
