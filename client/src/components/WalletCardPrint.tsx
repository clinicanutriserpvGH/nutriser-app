/**
 * WalletCardPrint -- Tarjeta fisica del Monedero Nutriser
 *
 * Formato CR-80 estandar: 85.5 x 54 mm (igual que tarjeta de credito)
 *
 * Layout (como la imagen de referencia):
 *  - Fondo negro oscuro
 *  - Arriba izquierda: logo + "MONEDERO NUTRISER / aesthetic & nutrition"
 *  - Centro izquierda: QR + placa dorada con nombre (ocupan ~60% del ancho)
 *  - Derecha: silueta dorada grande y libre (ocupa ~40% del ancho)
 *  - Abajo: banda dorada con URL y "Valida solo en Nutriser PV"
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

// -- Tarjeta individual en proporcion CR-80 para pantalla ------------------
export function WalletCard({ card, scale = 1 }: { card: WalletCardData; scale?: number }) {
  const W = 323;
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
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, #C5A55A 30%, #E8C97A 50%, #C5A55A 70%, transparent)"
      }} />

      {/* Silueta dorada — ocupa el 40% derecho, libre de la placa */}
      <img
        src={SILUETA_URL}
        alt=""
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          height: "92%",
          width: "auto",
          objectFit: "contain",
          objectPosition: "center",
          opacity: 0.92,
          pointerEvents: "none",
          zIndex: 1,
          filter: "sepia(1) saturate(2.8) hue-rotate(3deg) brightness(1.05)",
        }}
      />

      {/* Contenido izquierdo: ocupa 62% del ancho, silueta queda libre a la derecha */}
      <div style={{ position: "relative", zIndex: 2, width: "62%", height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Fila superior: Logo + Titulo */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 10px 4px 10px" }}>
          <img src={LOGO_URL} alt="Nutriser" style={{ width: 26, height: 26, objectFit: "contain" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#C5A55A", fontWeight: 900, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Monedero Nutriser
            </div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 6.5, letterSpacing: "0.12em" }}>
              aesthetic &amp; nutrition
            </div>
          </div>
        </div>

        {/* Fila central: QR + Placa dorada */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 10px", flex: 1 }}>
          {/* QR */}
          <div style={{ background: "#FFFFFF", borderRadius: 5, padding: 3, flexShrink: 0 }}>
            <QRCodeSVG
              value={card.qrUrl || "https://nutriserpv.com/monedero"}
              size={66}
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
            borderRadius: 5,
            padding: "7px 8px",
            boxShadow: "0 2px 8px rgba(197,165,90,0.4)",
          }}>
            <div style={{
              color: "#1A1A1A",
              fontWeight: 900,
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {card.patientName}
            </div>
            <div style={{
              color: "rgba(0,0,0,0.6)",
              fontFamily: "monospace",
              fontSize: 8,
              letterSpacing: "0.14em",
              marginTop: 3,
            }}>
              {card.walletNumber}
            </div>
          </div>
        </div>
      </div>

      {/* Banda dorada inferior */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
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

      {/* Silueta dorada — ocupa el 40% derecho libre */}
      <img
        src={SILUETA_URL}
        alt=""
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          height: "92%",
          width: "auto",
          objectFit: "contain",
          objectPosition: "center",
          opacity: 0.92,
          pointerEvents: "none",
          zIndex: 1,
          filter: "sepia(1) saturate(2.8) hue-rotate(3deg) brightness(1.05)",
        }}
      />

      {/* Contenido izquierdo: 62% del ancho */}
      <div style={{ position: "relative", zIndex: 2, width: "62%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
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

        {/* Fila central: QR + Placa dorada — centrada verticalmente */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.8mm", padding: "0 2.5mm 7mm 2.5mm" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "1.2mm", padding: "0.8mm", flexShrink: 0 }}>
            <QRCodeSVG
              value={card.qrUrl || "https://nutriserpv.com/monedero"}
              size={55}
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
            borderRadius: "1.2mm",
            padding: "1.8mm 2mm",
            boxShadow: "0 0.5mm 2mm rgba(197,165,90,0.4)",
          }}>
            <div style={{
              color: "#1A1A1A",
              fontWeight: 900,
              fontSize: "2.6mm",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {card.patientName}
            </div>
            <div style={{
              color: "rgba(0,0,0,0.6)",
              fontFamily: "monospace",
              fontSize: "2mm",
              letterSpacing: "0.14em",
              marginTop: "0.8mm",
            }}>
              {card.walletNumber}
            </div>
          </div>
        </div>
      </div>

      {/* Banda dorada inferior */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
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
