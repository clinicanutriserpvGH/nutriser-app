/**
 * WalletCardPrint -- Tarjeta física del Monedero Nutriser
 *
 * Formato CR-80: 85.5 × 54 mm
 * Diseño: fondo BLANCO (ahorra tinta), franjas doradas arriba y abajo
 *  - Franja superior: logo + "MONEDERO NUTRISER" (SIN badge activa/inactiva)
 *  - Zona central: QR a la izquierda + silueta dorada a la derecha
 *  - Franja inferior: nombre + número + "NUTRISERPV.COM/MONEDERO" (SIN saldo)
 */
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { NutriserWalletCard } from "@/components/NutriserWalletCard";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const SILUETA_URL = "/manus-storage/nutriser-silueta_f6738ee7.png";

export interface WalletCardData {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
  isActive: boolean;
}

// -- Tarjeta individual en pantalla (usa NutriserWalletCard unificado) --------
export function WalletCard({ card, scale = 1 }: { card: WalletCardData; scale?: number }) {
  return (
    <div style={{ width: 323, transform: `scale(${scale})`, transformOrigin: "top left", flexShrink: 0 }}>
      <NutriserWalletCard
        patientName={card.patientName}
        walletNumber={card.walletNumber}
        qrUrl={card.qrUrl}
        isActive={card.isActive}
        showBalance={false}
      />
    </div>
  );
}

// -- Hoja A4 con hasta 8 tarjetas para imprimir ------------------------------
export function WalletCardPrintSheet({ cards }: { cards: WalletCardData[] }) {
  return (
    <div
      className="wallet-print-sheet"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#FFFFFF",
        padding: "10mm",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "85.5mm 85.5mm",
        gridTemplateRows: "repeat(4, 54mm)",
        gap: "5mm",
        justifyContent: "center",
        alignContent: "start",
      }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          style={{
            width: "85.5mm",
            height: "54mm",
            overflow: "hidden",
            borderRadius: "3.5mm",
            pageBreakInside: "avoid",
          }}
        >
          <WalletCardMM card={card} />
        </div>
      ))}
    </div>
  );
}

// -- Versión en mm para impresión exacta (fondo blanco, SIN badge, SIN saldo) -
function WalletCardMM({ card }: { card: WalletCardData }) {
  const GOLD = "linear-gradient(90deg, #8B6914 0%, #C5A55A 25%, #E8C97A 50%, #C5A55A 75%, #8B6914 100%)";
  const GOLD_DIAG = "linear-gradient(135deg, #8B6914 0%, #C5A55A 30%, #E8C97A 55%, #C5A55A 80%, #8B6914 100%)";

  return (
    <div style={{
      width: "85.5mm",
      height: "54mm",
      background: "#FFFFFF",
      border: "0.3mm solid #D4AF60",
      borderRadius: "3.5mm",
      position: "relative",
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      overflow: "hidden",
      boxSizing: "border-box",
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    } as React.CSSProperties}>

      {/* ── Franja dorada superior: logo + título (SIN badge) ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "24%",
        background: GOLD,
        display: "flex",
        alignItems: "center",
        padding: "0 2.5mm",
        gap: "1.5mm",
        zIndex: 3,
      }}>
        <img src={LOGO_URL} alt="Nutriser" style={{ width: "5mm", height: "5mm", objectFit: "contain", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ color: "#3a2200", fontWeight: 900, fontSize: "1.9mm", letterSpacing: "0.18em", textTransform: "uppercase", lineHeight: 1.2 }}>
            Monedero Nutriser
          </div>
          <div style={{ color: "rgba(58,34,0,0.6)", fontSize: "1.5mm", letterSpacing: "0.12em" }}>
            aesthetic &amp; nutrition
          </div>
        </div>
        {/* Sin badge activa/inactiva — es tarjeta física */}
      </div>

      {/* ── Silueta dorada — zona central derecha ── */}
      <img
        src={SILUETA_URL}
        alt=""
        style={{
          position: "absolute",
          right: "2%",
          top: "24%",
          bottom: "28%",
          height: "48%",
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

      {/* ── QR — zona central izquierda ── */}
      <div style={{
        position: "absolute",
        top: "24%",
        bottom: "28%",
        left: 0,
        width: "54%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        padding: "1mm 1.5mm",
      }}>
        <div style={{
          background: "#FFFFFF",
          borderRadius: "1.2mm",
          padding: "0.8mm",
          border: "0.3mm solid #D4AF60",
          boxShadow: "0 0.5mm 2mm rgba(197,165,90,0.2)",
        }}>
          <QRCodeSVG
            value={card.qrUrl || "https://nutriserpv.com/monedero"}
            size={58}
            level="M"
            includeMargin={false}
            bgColor="#FFFFFF"
            fgColor="#1A1A1A"
          />
        </div>
      </div>

      {/* ── Franja dorada inferior: nombre + número + URL (SIN saldo) ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "28%",
        background: GOLD_DIAG,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2.5mm",
        zIndex: 3,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: "#1A1A1A",
            fontWeight: 900,
            fontSize: "2.6mm",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.2,
          }}>
            {card.patientName}
          </div>
          <div style={{
            color: "rgba(58,34,0,0.7)",
            fontFamily: "monospace",
            fontSize: "2mm",
            letterSpacing: "0.14em",
            marginTop: "0.5mm",
          }}>
            {card.walletNumber}
          </div>
        </div>
        {/* URL visible y legible — sin saldo */}
        <span style={{
          color: "rgba(58,34,0,0.65)",
          fontSize: "1.6mm",
          letterSpacing: "0.06em",
          flexShrink: 0,
          fontWeight: 700,
        }}>
          nutriserpv.com/monedero
        </span>
      </div>
    </div>
  );
}
