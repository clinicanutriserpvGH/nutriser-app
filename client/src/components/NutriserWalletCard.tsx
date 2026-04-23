/**
 * NutriserWalletCard — Componente reutilizable para la tarjeta del Monedero Nutriser
 *
 * Layout unificado (igual en digital y física):
 *  - Fondo negro oscuro
 *  - Arriba izquierda: logo + "MONEDERO NUTRISER / aesthetic & nutrition" + badge ACTIVA/INACTIVA
 *  - Centro: QR grande a la izquierda + silueta dorada a la derecha (libres, sin superposición)
 *  - Banda dorada inferior: nombre + número + saldo (saldo solo en digital)
 *
 * Props:
 *  - patientName: string
 *  - walletNumber: string
 *  - qrUrl: string
 *  - isActive: boolean
 *  - balance?: number (en centavos, solo para digital)
 *  - showBalance?: boolean (default true si balance está definido)
 *  - onQRClick?: () => void (para abrir QR a pantalla completa)
 *  - scale?: number (para impresión, default 1)
 */

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const SILUETA_URL = "/manus-storage/nutriser-silueta_f6738ee7.png";

export interface NutriserWalletCardProps {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
  isActive?: boolean;
  balance?: number; // en centavos
  showBalance?: boolean;
  onQRClick?: () => void;
  /** Para impresión física: escala el componente. Default 1 */
  scale?: number;
  /** Modo compacto para bottom sheet pequeño */
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

  // Tamaños según modo
  const qrSize = compact ? 70 : 90;
  const cardStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: "85.5 / 54",
    position: "relative",
    borderRadius: compact ? 12 : 16,
    overflow: "hidden",
    background: "linear-gradient(135deg, #1A1A1A 0%, #252010 60%, #1A1A1A 100%)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(197,165,90,0.15)",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: scale !== 1 ? "top left" : undefined,
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  };

  return (
    <div style={cardStyle}>
      {/* Línea dorada superior */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, #C5A55A 30%, #E8C97A 50%, #C5A55A 70%, transparent)",
        zIndex: 4,
      }} />

      {/* ── SILUETA DORADA — derecha, libre de superposición ── */}
      <img
        src={SILUETA_URL}
        alt=""
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          height: "78%",
          width: "auto",
          objectFit: "contain",
          objectPosition: "right top",
          opacity: 0.92,
          pointerEvents: "none",
          zIndex: 1,
          filter: "sepia(1) saturate(2.8) hue-rotate(3deg) brightness(1.05)",
        }}
      />

      {/* ── CONTENIDO PRINCIPAL — ocupa 62% izquierdo ── */}
      <div style={{ position: "relative", zIndex: 2, width: "62%", height: "100%", display: "flex", flexDirection: "column" }}>

        {/* Fila superior: Logo + Título + Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px 4px 10px" }}>
          <img src={LOGO_URL} alt="Nutriser" style={{ width: compact ? 20 : 24, height: compact ? 20 : 24, objectFit: "contain", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#C5A55A", fontWeight: 900, fontSize: compact ? 7 : 8.5, letterSpacing: "0.15em", textTransform: "uppercase", lineHeight: 1.2 }}>
              Monedero Nutriser
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: compact ? 5.5 : 6.5, letterSpacing: "0.1em" }}>
              aesthetic &amp; nutrition
            </div>
          </div>
          {isActive ? (
            <span style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", fontSize: compact ? 5.5 : 6.5, fontWeight: 800, padding: "2px 5px", borderRadius: 20, border: "1px solid rgba(52,211,153,0.4)", letterSpacing: "0.1em", flexShrink: 0 }}>
              ACTIVA
            </span>
          ) : (
            <span style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: compact ? 5.5 : 6.5, fontWeight: 800, padding: "2px 5px", borderRadius: 20, border: "1px solid rgba(239,68,68,0.4)", letterSpacing: "0.1em", flexShrink: 0 }}>
              INACTIVA
            </span>
          )}
        </div>

        {/* QR grande — zona central */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 10px 4px 10px" }}>
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
              border: "none",
              cursor: onQRClick ? "pointer" : "default",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
            title={onQRClick ? "Toca para ampliar el QR" : undefined}
          >
            <QRCodeSVG
              value={qrUrl || "https://nutriserpv.com/monedero"}
              size={qrSize}
              level="M"
              includeMargin={false}
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </button>
        </div>
      </div>

      {/* ── BANDA DORADA INFERIOR ── */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "28%",
        background: "linear-gradient(90deg, #8B6914 0%, #C5A55A 25%, #E8C97A 50%, #C5A55A 75%, #8B6914 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
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
          }}>
            {patientName || "---"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
            <span style={{ color: "#5a3e00", fontFamily: "monospace", fontSize: compact ? 7 : 8, letterSpacing: "0.12em", fontWeight: 700 }}>
              {walletNumber || "---"}
            </span>
            {onQRClick && (
              <button
                onClick={handleCopy}
                style={{ color: "#5a3e00", flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 0, opacity: 0.7 }}
              >
                <Copy style={{ width: 10, height: 10 }} />
              </button>
            )}
          </div>
        </div>

        {/* Saldo (solo digital) */}
        {showBalance && balance !== undefined && (
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
            <div style={{ color: "rgba(0,0,0,0.5)", fontSize: 6, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>SALDO</div>
            <div style={{ color: "#1A1A1A", fontWeight: 900, fontSize: compact ? 11 : 14, lineHeight: 1 }}>
              {formatMoney(balance)}
            </div>
          </div>
        )}

        {/* URL (solo física / sin saldo) */}
        {!showBalance && (
          <span style={{ color: "rgba(0,0,0,0.5)", fontSize: 6, letterSpacing: "0.08em", flexShrink: 0 }}>
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
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src={LOGO_URL} alt="Nutriser" style={{ width: 40, height: 40, objectFit: "contain" }} />
        <div>
          <div style={{ color: "#C5A55A", fontWeight: 900, fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Monedero Nutriser
          </div>
          <div style={{ color: "#888", fontSize: 11 }}>aesthetic &amp; nutrition</div>
        </div>
      </div>

      {/* QR gigante */}
      <div style={{
        background: "#FFFFFF",
        padding: 16,
        borderRadius: 16,
        boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
        border: "2px solid #f0f0f0",
      }}>
        <QRCodeSVG
          value={qrUrl || "https://nutriserpv.com/monedero"}
          size={280}
          level="M"
          includeMargin={false}
          bgColor="#FFFFFF"
          fgColor="#000000"
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
