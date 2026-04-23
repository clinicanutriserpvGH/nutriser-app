/**
 * NutriserWalletCard — Tarjeta del Monedero Nutriser
 *
 * Diseño: tarjeta PVC blanca estilo clínica premium
 *  - Fondo blanco (sin tinta negra, ahorra tinta en impresión)
 *  - Borde dorado sutil
 *  - Franja dorada superior con logo + "MONEDERO NUTRISER" + badge
 *  - Zona central: QR grande a la izquierda + silueta dorada a la derecha
 *  - Franja dorada inferior: nombre + número + saldo (saldo solo en digital)
 *
 * Props:
 *  - patientName, walletNumber, qrUrl, isActive
 *  - balance?: number (centavos), showBalance?: boolean
 *  - onQRClick?: () => void (abre QR a pantalla completa)
 *  - scale?: number (para impresión)
 *  - compact?: boolean
 */

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const SILUETA_URL = "/manus-storage/nutriser-silueta_f6738ee7.png";

// Gradiente dorado reutilizable
const GOLD_GRADIENT = "linear-gradient(90deg, #8B6914 0%, #C5A55A 25%, #E8C97A 50%, #C5A55A 75%, #8B6914 100%)";
const GOLD_GRADIENT_DIAG = "linear-gradient(135deg, #8B6914 0%, #C5A55A 30%, #E8C97A 55%, #C5A55A 80%, #8B6914 100%)";

export interface NutriserWalletCardProps {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
  isActive?: boolean;
  balance?: number; // en centavos
  showBalance?: boolean;
  onQRClick?: () => void;
  scale?: number;
  compact?: boolean;
}

export function NutriserWalletCard({
  patientName,
  walletNumber,
  qrUrl,
  isActive = true,
  balance,
  showBalance = balance !== undefined,
  onQRClick,
  scale = 1,
  compact = false,
}: NutriserWalletCardProps) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(walletNumber || "");
    toast.success("Número copiado");
  };

  const formatMoney = (cents: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 }).format(cents / 100);

  // Proporciones CR-80: 85.5 × 54 mm → relación 85.5/54 ≈ 1.583
  const cardStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: "85.5 / 54",
    position: "relative",
    borderRadius: compact ? 10 : 14,
    overflow: "hidden",
    background: "#FFFFFF",
    boxShadow: "0 4px 24px rgba(197,165,90,0.25), 0 1px 4px rgba(0,0,0,0.10)",
    border: "1.5px solid #D4AF60",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: scale !== 1 ? "top left" : undefined,
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  };

  const topBarH = compact ? "22%" : "24%";
  const bottomBarH = compact ? "26%" : "28%";
  // La zona central ocupa el espacio entre las dos barras
  // topBarH + bottomBarH = ~52%, zona central = ~48%

  return (
    <div style={cardStyle}>

      {/* ── FRANJA SUPERIOR DORADA: logo + título + badge ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: topBarH,
        background: GOLD_GRADIENT,
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
        gap: 7,
        zIndex: 3,
      }}>
        <img src={LOGO_URL} alt="Nutriser" style={{ width: compact ? 18 : 22, height: compact ? 18 : 22, objectFit: "contain", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#3a2200", fontWeight: 900, fontSize: compact ? 7 : 8.5, letterSpacing: "0.18em", textTransform: "uppercase", lineHeight: 1.2 }}>
            Monedero Nutriser
          </div>
          <div style={{ color: "rgba(58,34,0,0.6)", fontSize: compact ? 5 : 6, letterSpacing: "0.12em" }}>
            aesthetic &amp; nutrition
          </div>
        </div>
        {/* Badge activa/inactiva */}
        {isActive ? (
          <span style={{ background: "rgba(20,120,60,0.15)", color: "#0a6632", fontSize: compact ? 5.5 : 6.5, fontWeight: 800, padding: "2px 6px", borderRadius: 20, border: "1px solid rgba(20,120,60,0.4)", letterSpacing: "0.1em", flexShrink: 0, whiteSpace: "nowrap" }}>
            ACTIVA
          </span>
        ) : (
          <span style={{ background: "rgba(180,30,30,0.12)", color: "#a01010", fontSize: compact ? 5.5 : 6.5, fontWeight: 800, padding: "2px 6px", borderRadius: 20, border: "1px solid rgba(180,30,30,0.35)", letterSpacing: "0.1em", flexShrink: 0, whiteSpace: "nowrap" }}>
            INACTIVA
          </span>
        )}
      </div>

      {/* ── ZONA CENTRAL: QR izquierda + silueta derecha ── */}
      {/* Silueta dorada — ocupa la mitad derecha de la zona central, libre */}
      <img
        src={SILUETA_URL}
        alt=""
        style={{
          position: "absolute",
          right: "2%",
          top: topBarH,
          bottom: bottomBarH,
          height: `calc(100% - ${topBarH} - ${bottomBarH})`,
          width: "auto",
          maxWidth: "45%",
          objectFit: "contain",
          objectPosition: "center",
          opacity: 0.88,
          pointerEvents: "none",
          zIndex: 1,
          filter: "sepia(1) saturate(2.8) hue-rotate(3deg) brightness(0.9)",
        }}
      />

      {/* QR grande — zona izquierda de la zona central */}
      <div style={{
        position: "absolute",
        top: topBarH,
        bottom: bottomBarH,
        left: 0,
        width: "54%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        padding: "4px 6px",
      }}>
        <button
          onClick={onQRClick ? (e) => { e.stopPropagation(); onQRClick(); } : undefined}
          style={{
            background: "#FFFFFF",
            borderRadius: 6,
            padding: 4,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid #D4AF60",
            cursor: onQRClick ? "pointer" : "default",
            boxShadow: "0 2px 8px rgba(197,165,90,0.2)",
          }}
          title={onQRClick ? "Toca para ampliar el QR" : undefined}
        >
          <QRCodeSVG
            value={qrUrl || "https://nutriserpv.com/monedero"}
            size={compact ? 68 : 82}
            level="M"
            includeMargin={false}
            bgColor="#FFFFFF"
            fgColor="#1A1A1A"
          />
        </button>
      </div>

      {/* ── FRANJA INFERIOR DORADA: nombre + número + saldo ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: bottomBarH,
        background: GOLD_GRADIENT_DIAG,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
        zIndex: 3,
      }}>
        {/* Nombre + número */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: "#1A1A1A",
            fontWeight: 900,
            fontSize: compact ? 9 : 11,
            textTransform: "uppercase",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.2,
            letterSpacing: "0.03em",
          }}>
            {patientName || "---"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
            <span style={{ color: "#3a2200", fontFamily: "monospace", fontSize: compact ? 7 : 8.5, letterSpacing: "0.12em", fontWeight: 700 }}>
              {walletNumber || "---"}
            </span>
            {onQRClick && (
              <button
                onClick={handleCopy}
                style={{ color: "#3a2200", flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 0, opacity: 0.65 }}
              >
                <Copy style={{ width: 10, height: 10 }} />
              </button>
            )}
          </div>
        </div>

        {/* Saldo (solo digital) */}
        {showBalance && balance !== undefined && (
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
            <div style={{ color: "rgba(58,34,0,0.55)", fontSize: 6, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>SALDO</div>
            <div style={{ color: "#1A1A1A", fontWeight: 900, fontSize: compact ? 12 : 15, lineHeight: 1 }}>
              {formatMoney(balance)}
            </div>
          </div>
        )}

        {/* URL (solo física / sin saldo) */}
        {!showBalance && (
          <span style={{ color: "rgba(58,34,0,0.5)", fontSize: 6, letterSpacing: "0.08em", flexShrink: 0 }}>
            nutriserpv.com
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Modal de QR a pantalla completa — para escanear con iPad
 */
export function QRFullscreenModal({
  open,
  qrUrl,
  patientName,
  walletNumber,
  onClose,
}: {
  open?: boolean;
  qrUrl: string;
  patientName: string;
  walletNumber: string;
  onClose: () => void;
}) {
  if (open === false) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      {/* Logo + título */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src={LOGO_URL} alt="Nutriser" style={{ width: 44, height: 44, objectFit: "contain" }} />
        <div>
          <div style={{ color: "#C5A55A", fontWeight: 900, fontSize: 15, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Monedero Nutriser
          </div>
          <div style={{ color: "#aaa", fontSize: 11 }}>aesthetic &amp; nutrition</div>
        </div>
      </div>

      {/* QR gigante con borde dorado */}
      <div style={{
        background: "#FFFFFF",
        padding: 18,
        borderRadius: 16,
        boxShadow: "0 4px 32px rgba(197,165,90,0.25)",
        border: "2px solid #D4AF60",
      }}>
        <QRCodeSVG
          value={qrUrl || "https://nutriserpv.com/monedero"}
          size={280}
          level="M"
          includeMargin={false}
          bgColor="#FFFFFF"
          fgColor="#1A1A1A"
        />
      </div>

      {/* Nombre y número */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 20, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {patientName || "---"}
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 15, color: "#C5A55A", fontWeight: 700, letterSpacing: "0.15em", marginTop: 4 }}>
          {walletNumber || "---"}
        </div>
      </div>

      <div style={{ color: "#aaa", fontSize: 13, textAlign: "center", maxWidth: 280 }}>
        Muestra este código al escáner de la clínica
      </div>
      <div style={{ color: "#ccc", fontSize: 12 }}>Toca en cualquier lugar para cerrar</div>
    </div>
  );
}
