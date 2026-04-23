/**
 * WalletCardPrint -- Tarjeta física del Monedero Nutriser
 *
 * Formato CR-80 estándar: 85.5 x 54 mm (igual que tarjeta de crédito)
 *
 * La vista de pantalla usa NutriserWalletCard (diseño unificado).
 * La hoja de impresión A4 usa WalletCardMM (versión en mm para impresión exacta).
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

// -- Hoja A4 con 8 tarjetas para imprimir ------------------------------------
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

// -- Versión en mm para impresión exacta ------------------------------------
function WalletCardMM({ card }: { card: WalletCardData }) {
  return (
    <div style={{
      width: "85.5mm",
      height: "54mm",
      background: "linear-gradient(135deg, #1A1A1A 0%, #2a2010 60%, #1A1A1A 100%)",
      position: "relative",
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      overflow: "hidden",
      boxSizing: "border-box",
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    } as React.CSSProperties}>
      {/* Línea dorada superior */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "0.5mm", background: "linear-gradient(90deg, transparent, #C5A55A 30%, #E8C97A 50%, #C5A55A 70%, transparent)" }} />

      {/* Silueta dorada — ocupa el 40% derecho libre */}
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

      {/* Contenido izquierdo: 62% del ancho */}
      <div style={{ position: "relative", zIndex: 2, width: "62%", height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Fila superior */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5mm", padding: "2mm 2.5mm 1mm 2.5mm" }}>
          <img src={LOGO_URL} alt="Nutriser" style={{ width: "5.5mm", height: "5.5mm", objectFit: "contain" }} />
          <div style={{ flex: 1 }}>
            <div style={{ color: "#C5A55A", fontWeight: 900, fontSize: "1.9mm", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Monedero Nutriser
            </div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "1.5mm", letterSpacing: "0.12em" }}>
              aesthetic &amp; nutrition
            </div>
          </div>
        </div>

        {/* QR grande — zona central */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 2.5mm 7mm 2.5mm" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "1.2mm", padding: "0.8mm", flexShrink: 0, boxShadow: "0 0.5mm 2mm rgba(0,0,0,0.3)" }}>
            <QRCodeSVG
              value={card.qrUrl || "https://nutriserpv.com/monedero"}
              size={55}
              level="M"
              includeMargin={false}
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>
        </div>
      </div>

      {/* Banda dorada inferior */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "28%",
        background: "linear-gradient(90deg, #8B6914 0%, #C5A55A 25%, #E8C97A 50%, #C5A55A 75%, #8B6914 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 3mm",
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
            color: "rgba(0,0,0,0.6)",
            fontFamily: "monospace",
            fontSize: "2mm",
            letterSpacing: "0.14em",
            marginTop: "0.5mm",
          }}>
            {card.walletNumber}
          </div>
        </div>
        <span style={{ color: "rgba(0,0,0,0.5)", fontSize: "1.5mm", letterSpacing: "0.08em", flexShrink: 0 }}>
          nutriserpv.com
        </span>
      </div>
    </div>
  );
}
