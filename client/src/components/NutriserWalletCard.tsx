/**
 * NutriserWalletCard — Tarjeta del Monedero Nutriser
 *
 * Diseño premium (referencia visual aprobada):
 *  - Fondo blanco perla con borde dorado
 *  - Logo + "MONEDERO NUTRISER" centrado arriba con líneas decorativas
 *  - "aesthetic & nutrition" en cursiva debajo
 *  - Zona central: QR con borde dorado a la izquierda | separador | Nombre + CÓDIGO + número
 *  - Silueta dorada grande a la derecha con ondas decorativas
 *  - URL con ícono de globo centrado abajo
 *  - Badge ACTIVA/INACTIVA solo en digital (esquina superior derecha)
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
  scale?: number;
  compact?: boolean;
  discountPercent?: number | null; // Descuento activo (10, 15, 20, 25, 30) o null
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
  discountPercent,
}: NutriserWalletCardProps) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(walletNumber || "");
    toast.success("Número copiado");
  };

  const formatMoney = (cents: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 }).format(cents / 100);

  const fs = compact ? 0.75 : 1; // factor de escala de fuentes

  return (
    <div style={{
      width: "100%",
      aspectRatio: "85.5 / 54",
      position: "relative",
      borderRadius: compact ? 10 : 14,
      overflow: "hidden",
      background: "linear-gradient(135deg, #FEFEFE 0%, #FAF8F3 60%, #F5F0E8 100%)",
      boxShadow: "0 4px 28px rgba(197,165,90,0.22), 0 1px 4px rgba(0,0,0,0.08)",
      border: "1.5px solid #D4AF60",
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      transform: scale !== 1 ? `scale(${scale})` : undefined,
      transformOrigin: scale !== 1 ? "top left" : undefined,
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    }}>

      {/* ── ONDAS DECORATIVAS (esquina inferior derecha) ── */}
      <svg
        viewBox="0 0 200 120"
        style={{ position: "absolute", right: 0, bottom: 0, width: "55%", height: "75%", opacity: 0.18, pointerEvents: "none", zIndex: 1 }}
        preserveAspectRatio="xMaxYMax meet"
      >
        <path d="M200,120 Q160,80 120,100 Q80,120 40,90 Q0,60 0,120 Z" fill="#C5A55A"/>
        <path d="M200,120 Q170,70 130,90 Q90,110 50,80 Q20,60 0,100 L0,120 Z" fill="#E8C97A" opacity="0.6"/>
        <path d="M200,100 Q165,55 125,75 Q85,95 45,65 Q15,45 0,80 L0,120 L200,120 Z" fill="#C5A55A" opacity="0.4"/>
      </svg>

      {/* ── SILUETA DORADA (derecha, grande) ── */}
      <img
        src={SILUETA_URL}
        alt=""
        style={{
          position: "absolute",
          right: "2%",
          top: "8%",
          bottom: "18%",
          height: "74%",
          width: "auto",
          maxWidth: "38%",
          objectFit: "contain",
          objectPosition: "right center",
          opacity: 0.90,
          pointerEvents: "none",
          zIndex: 2,
          filter: "sepia(1) saturate(3) hue-rotate(2deg) brightness(0.85)",
        }}
      />

      {/* ── BADGE DESCUENTO (esquina superior izquierda, solo digital cuando hay descuento) ── */}
      {onQRClick && discountPercent && (
        <div style={{ position: "absolute", top: compact ? 5 : 7, left: compact ? 7 : 10, zIndex: 5 }}>
          <span style={{ background: "rgba(197,165,90,0.92)", color: "#fff", fontSize: compact ? 5 : 6.5, fontWeight: 900, padding: "2px 6px", borderRadius: 20, letterSpacing: "0.08em", boxShadow: "0 1px 4px rgba(197,165,90,0.4)" }}>
            {discountPercent}% DESC
          </span>
        </div>
      )}

      {/* ── BADGE ACTIVA/INACTIVA (esquina superior derecha, solo digital) ── */}
      {onQRClick && (
        <div style={{ position: "absolute", top: compact ? 5 : 7, right: compact ? 7 : 10, zIndex: 5 }}>
          {isActive ? (
            <span style={{ background: "rgba(20,120,60,0.12)", color: "#0a6632", fontSize: compact ? 5 : 6, fontWeight: 800, padding: "2px 6px", borderRadius: 20, border: "1px solid rgba(20,120,60,0.35)", letterSpacing: "0.1em" }}>
              ACTIVA
            </span>
          ) : (
            <span style={{ background: "rgba(180,30,30,0.10)", color: "#a01010", fontSize: compact ? 5 : 6, fontWeight: 800, padding: "2px 6px", borderRadius: 20, border: "1px solid rgba(180,30,30,0.30)", letterSpacing: "0.1em" }}>
              INACTIVA
            </span>
          )}
        </div>
      )}

      {/* ── CABECERA: solo texto, sin logo ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "30%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3,
        paddingTop: compact ? 3 : 5,
        gap: 1,
      }}>
        {/* MONEDERO NUTRISER — más grande, sin logo */}
        <div style={{
          color: "#8B6914",
          fontWeight: 900,
          fontSize: compact ? 10 : 13,
          letterSpacing: "0.20em",
          textTransform: "uppercase",
          lineHeight: 1.1,
        }}>
          MONEDERO NUTRISER
        </div>

        {/* Líneas decorativas + aesthetic & nutrition */}
        <div style={{ display: "flex", alignItems: "center", gap: compact ? 5 : 7, marginTop: 1 }}>
          <div style={{ height: 0.8, width: compact ? 18 : 26, background: "linear-gradient(90deg, transparent, #C5A55A)" }} />
          <span style={{ color: "#B8963E", fontSize: compact ? 5.5 : 7, letterSpacing: "0.18em", fontStyle: "italic" }}>
            aesthetic &amp; nutrition
          </span>
          <div style={{ height: 0.8, width: compact ? 18 : 26, background: "linear-gradient(90deg, #C5A55A, transparent)" }} />
        </div>
      </div>

      {/* ── ZONA CENTRAL: QR | separador | Nombre + Código ── */}
      <div style={{
        position: "absolute",
        top: "30%",
        bottom: "18%",
        left: 0,
        right: "30%", // dejar espacio para la silueta
        display: "flex",
        alignItems: "center",
        padding: compact ? "0 6px" : "0 10px",
        gap: compact ? 6 : 9,
        zIndex: 3,
        overflow: "hidden",
      }}>
        {/* QR con borde dorado */}
        <button
          onClick={onQRClick ? (e) => { e.stopPropagation(); onQRClick(); } : undefined}
          style={{
            background: "#FFFFFF",
            borderRadius: 6,
            padding: compact ? 3 : 4,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid #C5A55A",
            cursor: onQRClick ? "pointer" : "default",
            boxShadow: "0 2px 8px rgba(197,165,90,0.25)",
          }}
          title={onQRClick ? "Toca para ampliar el QR" : undefined}
        >
          <QRCodeSVG
            value={qrUrl || "https://nutriserpv.com/monedero"}
            size={compact ? 52 : 64}
            level="M"
            includeMargin={false}
            bgColor="#FFFFFF"
            fgColor="#1A1A1A"
          />
        </button>

        {/* Separador vertical dorado */}
        <div style={{ width: 1, alignSelf: "stretch", background: "linear-gradient(180deg, transparent, #C5A55A 30%, #C5A55A 70%, transparent)", margin: "4px 0", flexShrink: 0 }} />

        {/* Nombre + Código */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: compact ? 3 : 4 }}>
          <div style={{
            color: "#3a2200",
            fontWeight: 900,
            fontSize: compact ? 9 : 11,
            textTransform: "uppercase",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            letterSpacing: "0.03em",
            lineHeight: 1.1,
          }}>
            {patientName || "---"}
          </div>
          <div style={{ height: 0.7, background: "linear-gradient(90deg, #C5A55A, transparent)", width: "80%" }} />
          <div>
            <div style={{ color: "#B8963E", fontSize: compact ? 4.5 : 5.5, letterSpacing: "0.15em", fontWeight: 700, textTransform: "uppercase", marginBottom: 1 }}>
              CÓDIGO
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "#3a2200", fontFamily: "monospace", fontSize: compact ? 7 : 9, letterSpacing: "0.08em", fontWeight: 700, whiteSpace: "nowrap" }}>
                {walletNumber || "---"}
              </span>
              {onQRClick && (
                <button onClick={handleCopy} style={{ color: "#C5A55A", background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
                  <Copy style={{ width: 9, height: 9 }} />
                </button>
              )}
            </div>
          </div>
          {/* Saldo solo en digital */}
          {showBalance && balance !== undefined && (
            <div style={{ marginTop: 2 }}>
              <div style={{ color: "#B8963E", fontSize: compact ? 4.5 : 5.5, letterSpacing: "0.12em", fontWeight: 700, textTransform: "uppercase" }}>SALDO</div>
              <div style={{ color: "#3a2200", fontWeight: 900, fontSize: compact ? 9 : 12, lineHeight: 1 }}>{formatMoney(balance)}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── PIE: URL con ícono de globo ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "18%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? 3 : 5,
        zIndex: 3,
        borderTop: "0.8px solid rgba(197,165,90,0.35)",
        background: "rgba(255,255,255,0.6)",
      }}>
        {/* Ícono globo SVG */}
        <svg viewBox="0 0 16 16" style={{ width: compact ? 7 : 9, height: compact ? 7 : 9, flexShrink: 0 }} fill="none">
          <circle cx="8" cy="8" r="7" stroke="#C5A55A" strokeWidth="1.2"/>
          <ellipse cx="8" cy="8" rx="3" ry="7" stroke="#C5A55A" strokeWidth="1"/>
          <line x1="1" y1="8" x2="15" y2="8" stroke="#C5A55A" strokeWidth="1"/>
          <line x1="2" y1="4.5" x2="14" y2="4.5" stroke="#C5A55A" strokeWidth="0.8"/>
          <line x1="2" y1="11.5" x2="14" y2="11.5" stroke="#C5A55A" strokeWidth="0.8"/>
        </svg>
        <span style={{ color: "#8B6914", fontSize: compact ? 5.5 : 7, letterSpacing: "0.1em", fontWeight: 600 }}>
          nutriserpv.com/monedero
        </span>
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
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src={LOGO_URL} alt="Nutriser" style={{ width: 44, height: 44, objectFit: "contain" }} />
        <div>
          <div style={{ color: "#8B6914", fontWeight: 900, fontSize: 15, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Monedero Nutriser
          </div>
          <div style={{ color: "#B8963E", fontSize: 11, fontStyle: "italic" }}>aesthetic &amp; nutrition</div>
        </div>
      </div>

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

      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 20, color: "#3a2200", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
