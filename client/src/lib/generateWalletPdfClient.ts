/**
 * generateWalletPdfClient.ts
 *
 * Genera un PDF de tarjetas del Monedero Nutriser directamente en el navegador
 * usando jsPDF + QRCode puro. NO usa html2canvas (incompatible con Safari/iPad).
 *
 * Formato CR-80: 85.5mm x 54mm (tarjeta de crédito estándar).
 * - Modo individual (1 tarjeta): página exacta CR-80
 * - Modo A4 (2+ tarjetas): página A4 con grilla 2×4
 */

import jsPDF from "jspdf";
import QRCode from "qrcode";

export interface WalletPdfCardData {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
}

// Dimensiones CR-80 en mm
const W = 85.5;
const H = 54;

// Colores
const GOLD = "#C5A55A";
const DARK_GOLD = "#8B6914";
const TEXT_DARK = "#3a2200";
const TEXT_LIGHT = "#6b4c1e";

/**
 * Genera un QR como data URL PNG usando la librería qrcode
 */
async function makeQRDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 200,
    margin: 1,
    color: { dark: "#1A1A1A", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });
}

/**
 * Dibuja una tarjeta CR-80 en el PDF en la posición (x, y)
 */
async function drawCard(
  pdf: jsPDF,
  card: WalletPdfCardData,
  x: number,
  y: number
): Promise<void> {
  const qrImg = await makeQRDataUrl(card.qrUrl);

  // ── Fondo blanco con borde redondeado ──
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, W, H, 3, 3, "F");

  // ── Borde dorado exterior ──
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(x, y, W, H, 3, 3, "S");

  // ── Franja dorada superior (logo + título) ──
  const topH = 13;
  pdf.setFillColor(197, 165, 90);
  pdf.rect(x, y, W, topH, "F");

  // Título "MONEDERO NUTRISER"
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(58, 34, 0);
  pdf.text("MONEDERO NUTRISER", x + W / 2, y + 5.5, { align: "center" });

  // Subtítulo
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5);
  pdf.setTextColor(90, 60, 10);
  pdf.text("aesthetic & nutrition", x + W / 2, y + 9.5, { align: "center" });

  // ── Zona central (QR + nombre/código + silueta) ──
  const midY = y + topH;
  const midH = H - topH - 12; // 12mm para franja inferior

  // QR (izquierda)
  const qrSize = 20;
  const qrX = x + 4;
  const qrY = midY + (midH - qrSize) / 2;

  // Marco dorado del QR
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.3);
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 1, 1, "FD");
  pdf.addImage(qrImg, "PNG", qrX, qrY, qrSize, qrSize);

  // Separador vertical dorado
  const sepX = x + 30;
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.25);
  pdf.line(sepX, midY + 3, sepX, midY + midH - 3);

  // Nombre del paciente
  const nameX = sepX + 4;
  const nameY = midY + 7;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(58, 34, 0);
  // Truncar nombre si es muy largo
  const maxName = 18;
  const displayName = card.patientName.length > maxName
    ? card.patientName.substring(0, maxName - 1) + "…"
    : card.patientName;
  pdf.text(displayName.toUpperCase(), nameX, nameY);

  // Línea bajo el nombre
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.2);
  pdf.line(nameX, nameY + 1.5, nameX + 46, nameY + 1.5);

  // Label "CÓDIGO"
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(4.5);
  pdf.setTextColor(139, 105, 20);
  pdf.text("CÓDIGO", nameX, nameY + 5);

  // Número de monedero
  pdf.setFont("courier", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(58, 34, 0);
  pdf.text(card.walletNumber, nameX, nameY + 9);

  // ── Franja dorada inferior ──
  const botY = y + H - 12;
  pdf.setFillColor(197, 165, 90);
  pdf.rect(x, botY, W, 12, "F");

  // URL
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5);
  pdf.setTextColor(58, 34, 0);
  pdf.text("nutriserpv.com/monedero", x + W / 2, botY + 7, { align: "center" });
}

/**
 * Genera y descarga el PDF de tarjetas del monedero.
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

    pdf.save(cards.length === 1 ? "tarjeta-nutriser.pdf" : `tarjetas-nutriser-${cards.length}.pdf`);
  } else {
    // Modo A4: grilla 2×4
    const A4_W = 210;
    const A4_H = 297;
    const GAP = 5;
    const MARGIN_X = (A4_W - 2 * W - GAP) / 2;
    const MARGIN_Y = (A4_H - 4 * H - 3 * GAP) / 2;

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    pdf.setFillColor(240, 240, 240);
    pdf.rect(0, 0, A4_W, A4_H, "F");

    for (let i = 0; i < cards.length; i++) {
      if (i > 0 && i % 8 === 0) {
        pdf.addPage("a4", "portrait");
        pdf.setFillColor(240, 240, 240);
        pdf.rect(0, 0, A4_W, A4_H, "F");
      }
      const pos = i % 8;
      const col = pos % 2;
      const row = Math.floor(pos / 2);
      const cx = MARGIN_X + col * (W + GAP);
      const cy = MARGIN_Y + row * (H + GAP);
      await drawCard(pdf, cards[i], cx, cy);
    }

    pdf.save(`tarjetas-nutriser-${cards.length}.pdf`);
  }
}

// Alias para compatibilidad con AdminWalletTab
export async function generateWalletPdfFromElements(
  _elements: HTMLElement[],
  _mode: "individual" | "a4"
): Promise<void> {
  // Esta función ya no se usa — usar generateWalletPdf directamente
  throw new Error("Usa generateWalletPdf en lugar de generateWalletPdfFromElements");
}
