/**
 * WalletCardPrint -- Tarjeta fisica del Monedero Nutriser
 *
 * Formato CR-80 estandar: 85.5 x 54 mm (igual que tarjeta de credito)
 * Resolucion de impresion: 300 DPI -> 1011 x 638 px
 *
 * Dos modos de uso:
 *  1. <WalletCard /> -- Vista previa en pantalla (escala adaptable)
 *  2. <WalletCardPrintSheet cards={[...]} /> -- Hoja A4 con 8 tarjetas para imprimir
 */
import React from "react";
import { QRCodeSVG } from "qrcode.react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

const SILUETA_URL = "/manus-storage/nutriser-silueta_f6738ee7.png";

export interface WalletCardData {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
  isActive: boolean;
}

// -- Tarjeta individual en proporcion CR-80 ---------------------------------
// Usamos unidades absolutas en px para pantalla.
// En pantalla se escala con transform para caber en el contenedor.
export function WalletCard({ card, scale = 1 }: { card: WalletCardData; scale?: number }) {
  // CR-80: 85.5mm x 54mm @ 96dpi -> 323px x 204px
  const W = 323; // px a 96dpi
  const H = 204;

  return (
    <div
      className="wallet-card-cr80"
      style={{
        width: W,
        height: H,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        borderRadius: 10,
        overflow: "hidden",
        background: "linear-gradient(135deg, #1A1A1A 0%, #2a2010 60%, #1A1A1A 100%)",
        position: "relative",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        flexShrink: 0,
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      } as React.CSSProperties}
    >
      {/* Linea dorada superior */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #C5A55A 30%, #E8C97A 50%, #C5A55A 70%, transparent)" }} />

      {/* Silueta dorada de Nutriser — grande y visible a la derecha */}
      <img
        src={SILUETA_URL}
        alt=""
        style={{
          position: "absolute",
          right: 6,
          top: "50%",
          transform: "translateY(-50%)",
          height: "88%",
          width: "auto",
          objectFit: "contain",
          objectPosition: "center",
          opacity: 0.55,
          pointerEvents: "none",
          zIndex: 1,
          filter: "sepia(1) saturate(3) hue-rotate(5deg) brightness(1.4)",
        }}
      />

      {/* -- Fila superior: Logo + Titulo -- */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 12px 4px 12px", position: "relative", zIndex: 2 }}>
        <img src={LOGO_URL} alt="Nutriser" style={{ width: 28, height: 28, objectFit: "contain" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#C5A55A", fontWeight: 900, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Monedero Nutriser
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 7, letterSpacing: "0.12em" }}>
            aesthetic &amp; nutrition
          </div>
        </div>
      </div>

      {/* -- Fila central: QR + Placa dorada con nombre -- */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px 4px 12px", position: "relative", zIndex: 2 }}>
        {/* QR */}
        <div style={{ background: "#FFFFFF", borderRadius: 6, padding: 4, flexShrink: 0 }}>
          <QRCodeSVG
            value={card.qrUrl || "https://nutriserpv.com/monedero"}
            size={68}
            level="H"
            includeMargin={false}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>

        {/* Placa dorada con nombre y número */}
        <div style={{
          flex: 1,
          minWidth: 0,
          background: "linear-gradient(135deg, #8B6914 0%, #C5A55A 30%, #E8C97A 55%, #C5A55A 80%, #8B6914 100%)",
          borderRadius: 6,
          padding: "8px 10px",
          boxShadow: "0 2px 8px rgba(197,165,90,0.4)",
        }}>
          <div style={{
            color: "#1A1A1A",
            fontWeight: 900,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {card.patientName}
          </div>
          <div style={{
            color: "rgba(0,0,0,0.65)",
            fontFamily: "monospace",
            fontSize: 8.5,
            letterSpacing: "0.15em",
            marginTop: 3,
          }}>
            {card.walletNumber}
          </div>
        </div>
      </div>

      {/* -- Banda dorada inferior -- */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 22,
        background: "linear-gradient(90deg, #8B6914 0%, #C5A55A 25%, #E8C97A 50%, #C5A55A 75%, #8B6914 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        zIndex: 3,
      }}>
        <span style={{ color: "rgba(0,0,0,0.6)", fontSize: 6.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          nutriserpv.com/monedero
        </span>
        <span style={{ color: "rgba(0,0,0,0.5)", fontSize: 6, letterSpacing: "0.08em" }}>
          Valida solo en Nutriser PV
        </span>
      </div>
    </div>
  );
}

// -- Hoja A4 con 8 tarjetas para imprimir -----------------------------------
// A4: 210mm x 297mm -- caben 2 columnas x 4 filas con margen de 10mm
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

// -- Version en mm para impresion exacta ------------------------------------
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
      {/* Linea dorada superior */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "0.5mm", background: "linear-gradient(90deg, transparent, #C5A55A 30%, #E8C97A 50%, #C5A55A 70%, transparent)" }} />

      {/* Silueta dorada de Nutriser — grande y visible a la derecha */}
      <img
        src={SILUETA_URL}
        alt=""
        style={{
          position: "absolute",
          right: "1.5mm",
          top: "50%",
          transform: "translateY(-50%)",
          height: "88%",
          width: "auto",
          objectFit: "contain",
          objectPosition: "center",
          opacity: 0.55,
          pointerEvents: "none",
          zIndex: 1,
          filter: "sepia(1) saturate(3) hue-rotate(5deg) brightness(1.4)",
        }}
      />

      {/* Fila superior */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5mm", padding: "2.5mm 3mm 1mm 3mm", position: "relative", zIndex: 2 }}>
        <img src={LOGO_URL} alt="Nutriser" style={{ width: "7mm", height: "7mm", objectFit: "contain" }} />
        <div style={{ flex: 1 }}>
          <div style={{ color: "#C5A55A", fontWeight: 900, fontSize: "2.2mm", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Monedero Nutriser
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "1.7mm", letterSpacing: "0.12em" }}>
            aesthetic &amp; nutrition
          </div>
        </div>
      </div>

      {/* Fila central: QR + Placa dorada */}
      <div style={{ display: "flex", alignItems: "center", gap: "2mm", padding: "1mm 3mm", position: "relative", zIndex: 2 }}>
        <div style={{ background: "#FFFFFF", borderRadius: "1.5mm", padding: "1mm", flexShrink: 0 }}>
          <QRCodeSVG
            value={card.qrUrl || "https://nutriserpv.com/monedero"}
            size={80}
            level="H"
            includeMargin={false}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>
        {/* Placa dorada */}
        <div style={{
          flex: 1,
          minWidth: 0,
          background: "linear-gradient(135deg, #8B6914 0%, #C5A55A 30%, #E8C97A 55%, #C5A55A 80%, #8B6914 100%)",
          borderRadius: "1.5mm",
          padding: "2mm 2.5mm",
          boxShadow: "0 0.5mm 2mm rgba(197,165,90,0.4)",
        }}>
          <div style={{
            color: "#1A1A1A",
            fontWeight: 900,
            fontSize: "2.8mm",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {card.patientName}
          </div>
          <div style={{
            color: "rgba(0,0,0,0.65)",
            fontFamily: "monospace",
            fontSize: "2.1mm",
            letterSpacing: "0.15em",
            marginTop: "0.8mm",
          }}>
            {card.walletNumber}
          </div>
        </div>
      </div>

      {/* Banda dorada inferior */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "5.5mm",
        background: "linear-gradient(90deg, #8B6914 0%, #C5A55A 25%, #E8C97A 50%, #C5A55A 75%, #8B6914 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 3mm",
        zIndex: 3,
      }}>
        <span style={{ color: "rgba(0,0,0,0.6)", fontSize: "1.6mm", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          nutriserpv.com/monedero
        </span>
        <span style={{ color: "rgba(0,0,0,0.5)", fontSize: "1.5mm", letterSpacing: "0.08em" }}>
          Valida solo en Nutriser PV
        </span>
      </div>
    </div>
  );
}
