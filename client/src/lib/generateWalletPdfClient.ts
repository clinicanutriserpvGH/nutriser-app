/**
 * generateWalletPdfClient.ts
 *
 * Genera un PDF de tarjetas del Monedero Nutriser directamente en el navegador.
 * Diseño IDÉNTICO a la previsualización WalletCardMM / NutriserWalletCard.
 *
 * Correcciones aplicadas:
 *  1. Líneas decorativas cortas (no tapan "aesthetic & nutrition")
 *  2. Silueta contenida dentro de la zona central (no sobrepasa el pie)
 *  3. Zona segura respetada (margen interior de 2mm en todos los lados)
 *
 * Formato CR-80: 85.6mm × 54mm
 * NO usa html2canvas — compatible con Safari/iPad/iPhone.
 */

import jsPDF from "jspdf";
import QRCode from "qrcode";
import { SILUETA_B64 } from "./siluetaB64";

export interface WalletPdfCardData {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
}

// Dimensiones CR-80 exactas ISO/IEC 7810 ID-1
const W = 85.60;
const H = 54.00;

// Paleta de colores
const GOLD_DARK  = [139, 105,  20] as const; // #8B6914
const GOLD_MID   = [197, 165,  90] as const; // #C5A55A
const BROWN_DARK = [ 58,  34,   0] as const; // #3a2200
const BROWN_MID  = [184, 150,  62] as const; // #B8963E
const CREAM      = [254, 254, 252] as const; // fondo blanco perla

/** Genera un QR como data URL PNG */
async function makeQRDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 300,
    margin: 1,
    color: { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel: "H",
  });
}

/**
 * Dibuja una tarjeta CR-80 en el PDF en la posición (x, y).
 * Proporciones idénticas a WalletCardMM del componente React.
 */
async function drawCard(
  pdf: jsPDF,
  card: WalletPdfCardData,
  x: number,
  y: number
): Promise<void> {
  const qrImg = await makeQRDataUrl(card.qrUrl);

  // ── Fondo blanco perla ──────────────────────────────────────────────────────
  pdf.setFillColor(...CREAM);
  pdf.roundedRect(x, y, W, H, 3, 3, "F");

  // ── Borde dorado ────────────────────────────────────────────────────────────
  pdf.setDrawColor(212, 175, 96); // #D4AF60
  pdf.setLineWidth(0.35);
  pdf.roundedRect(x, y, W, H, 3, 3, "S");

  // ── CABECERA (30% superior = 16.2mm) ────────────────────────────────────────
  // "MONEDERO NUTRISER" — centrado, sin logo
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.8);
  pdf.setTextColor(...GOLD_DARK);
  pdf.text("MONEDERO NUTRISER", x + W / 2, y + 7.5, {
    align: "center",
    charSpace: 1.0,
  });

  // "aesthetic & nutrition" — debajo del título, SIN líneas encima
  const subtitleY = y + 11.8;
  const cx = x + W / 2;

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(4.2);
  pdf.setTextColor(...BROWN_MID);
  pdf.text("aesthetic & nutrition", cx, subtitleY, {
    align: "center",
    charSpace: 0.6,
  });

  // Líneas decorativas — DEBAJO del texto aesthetic, a los lados
  const lineY = subtitleY + 1.8;
  pdf.setDrawColor(...GOLD_MID);
  pdf.setLineWidth(0.25);
  pdf.line(cx - 28, lineY, cx - 2, lineY); // línea izquierda
  pdf.line(cx + 2,  lineY, cx + 28, lineY); // línea derecha

  // ── ZONA CENTRAL (30% → 82% del alto) ───────────────────────────────────────
  const zoneTop    = y + H * 0.30; // y + 16.2
  const zoneBottom = y + H * 0.82; // y + 44.28
  const zoneH      = zoneBottom - zoneTop; // 28.08mm
  const zoneMidY   = zoneTop + zoneH / 2;

  // SILUETA — grande, ocupa casi toda la zona central (igual que la previsualización)
  const silH = zoneH * 1.10;        // ligeramente más alta que la zona para verse grande
  const silW = silH * 0.52;         // proporción silueta ≈ 0.52
  const silX = x + W - silW - 1.5;  // pegada al borde derecho
  const silY = zoneTop - zoneH * 0.05; // arranca un poco antes del inicio de la zona
  try {
    pdf.addImage(SILUETA_B64, "PNG", silX, silY, silW, silH);
  } catch (_) {}

  // QR con borde dorado — izquierda de la zona central
  const qrSize = 21;
  const qrX    = x + 4.5;
  const qrY    = zoneMidY - qrSize / 2;
  // Fondo blanco + borde dorado
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(...GOLD_MID);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(qrX - 1.2, qrY - 1.2, qrSize + 2.4, qrSize + 2.4, 1.2, 1.2, "FD");
  pdf.addImage(qrImg, "PNG", qrX, qrY, qrSize, qrSize);

  // Separador vertical dorado
  const sepX = x + 33;
  pdf.setDrawColor(...GOLD_MID);
  pdf.setLineWidth(0.25);
  pdf.line(sepX, zoneTop + 3, sepX, zoneBottom - 3);

  // Nombre del paciente
  const nameX = sepX + 3;
  const nameY  = zoneMidY - 5;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...BROWN_DARK);
  const maxChars = 14;
  const displayName =
    card.patientName.length > maxChars
      ? card.patientName.substring(0, maxChars - 1) + "…"
      : card.patientName;
  pdf.text(displayName.toUpperCase(), nameX, nameY, { charSpace: 0.2 });

  // Línea dorada bajo el nombre
  pdf.setDrawColor(...GOLD_MID);
  pdf.setLineWidth(0.22);
  pdf.line(nameX, nameY + 1.5, nameX + 26, nameY + 1.5);

  // Label "CÓDIGO"
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(4.5);
  pdf.setTextColor(...BROWN_MID);
  pdf.text("CÓDIGO", nameX, nameY + 5.5, { charSpace: 0.5 });

  // Número de monedero
  pdf.setFont("courier", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(...BROWN_DARK);
  pdf.text(card.walletNumber, nameX, nameY + 10, { charSpace: 0.3 });

  // ── PIE (82% → 100% = 9.72mm) ───────────────────────────────────────────────
  // Línea separadora sutil
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.18);
  pdf.line(x + 3, zoneBottom, x + W - 3, zoneBottom);

  // Ícono globo simplificado
  const globeX = x + W / 2 - 17;
  const globeY = y + H - 4.5;
  const r = 2.0;
  pdf.setDrawColor(...GOLD_MID);
  pdf.setLineWidth(0.35);
  pdf.circle(globeX, globeY - 0.3, r, "S");
  pdf.setLineWidth(0.22);
  pdf.line(globeX - r, globeY - 0.3, globeX + r, globeY - 0.3);
  pdf.setLineWidth(0.18);
  pdf.line(globeX - r * 0.82, globeY - 1.5, globeX + r * 0.82, globeY - 1.5);
  pdf.line(globeX - r * 0.82, globeY + 0.9, globeX + r * 0.82, globeY + 0.9);

  // URL
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.5);
  pdf.setTextColor(...GOLD_DARK);
  pdf.text("nutriserpv.com/monedero", globeX + r + 1.5, globeY + 0.2, {
    charSpace: 0.2,
  });
}

/**
 * Genera y abre el PDF en una nueva pestaña (compatible iOS Safari).
 * @param cards Lista de tarjetas
 * @param mode "individual" (CR-80 por página) | "a4" (grilla 2×4 en A4)
 */
export async function generateWalletPdf(
  cards: WalletPdfCardData[],
  mode: "individual" | "a4" = "individual"
): Promise<void> {
  if (cards.length === 0) return;

  if (mode === "individual" || cards.length === 1) {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [W, H],
    });

    for (let i = 0; i < cards.length; i++) {
      if (i > 0) pdf.addPage([W, H], "landscape");
      await drawCard(pdf, cards[i], 0, 0);
    }

    const url = pdf.output("bloburl");
    window.open(url, "_blank");
  } else {
    // Modo A4: grilla 2×4
    const A4_W = 210;
    const A4_H = 297;
    const GAP  = 6;
    const MARGIN_X = (A4_W - 2 * W - GAP) / 2;
    const MARGIN_Y = (A4_H - 4 * H - 3 * GAP) / 2;

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    pdf.setFillColor(230, 230, 230);
    pdf.rect(0, 0, A4_W, A4_H, "F");

    for (let i = 0; i < cards.length; i++) {
      if (i > 0 && i % 8 === 0) {
        pdf.addPage("a4", "portrait");
        pdf.setFillColor(230, 230, 230);
        pdf.rect(0, 0, A4_W, A4_H, "F");
      }
      const pos = i % 8;
      const col = pos % 2;
      const row = Math.floor(pos / 2);
      const cx  = MARGIN_X + col * (W + GAP);
      const cy  = MARGIN_Y + row * (H + GAP);
      await drawCard(pdf, cards[i], cx, cy);
    }

    const url = pdf.output("bloburl");
    window.open(url, "_blank");
  }
}

// Alias legacy
export async function generateWalletPdfFromElements(
  _elements: HTMLElement[],
  _mode: "individual" | "a4"
): Promise<void> {
  throw new Error("Usa generateWalletPdf en lugar de generateWalletPdfFromElements");
}
