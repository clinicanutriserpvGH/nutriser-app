/**
 * generateWalletPdfClient.ts
 *
 * Genera un PDF de tarjetas del Monedero Nutriser directamente en el navegador
 * usando jsPDF + QRCode puro + silueta y logo embebidos en base64.
 * NO usa html2canvas — compatible con Safari/iPad.
 *
 * Formato CR-80: 85.5mm x 54mm (tarjeta de crédito estándar).
 * - Modo individual (1 tarjeta): página exacta CR-80
 * - Modo A4 (2+ tarjetas): página A4 con grilla 2×4
 */

import jsPDF from "jspdf";
import QRCode from "qrcode";
import { SILUETA_B64 } from "./siluetaB64";
import { LOGO_B64 } from "./logoB64";

export interface WalletPdfCardData {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
}

// Dimensiones CR-80 exactas ISO/IEC 7810 ID-1
const W = 85.60;
const H = 54.00;

/**
 * Genera un QR como data URL PNG
 */
async function makeQRDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 300,
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

  // ── Fondo blanco perla con gradiente suave ──
  pdf.setFillColor(253, 252, 248);
  pdf.roundedRect(x, y, W, H, 3, 3, "F");

  // ── Borde dorado exterior (único borde de la tarjeta) ──
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(x, y, W, H, 3, 3, "S");

  // ── Silueta dorada (esquina derecha, proporción 1:1) ──
  const silW = 30;
  const silH = 30;
  const silX = x + W - silW - 2;
  const silY = y + 15;
  try {
    pdf.addImage(SILUETA_B64, "PNG", silX, silY, silW, silH);
  } catch (_) {}

  // ── Logo centrado arriba ──
  const logoSize = 6;
  const logoX = x + (W - logoSize) / 2;
  try {
    pdf.addImage(LOGO_B64, "PNG", logoX, y + 3, logoSize, logoSize);
  } catch (_) {}

  // ── Título "MONEDERO NUTRISER" ──
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(122, 92, 30);
  pdf.text("MONEDERO NUTRISER", x + W / 2, y + 11, { align: "center" });

  // ── Subtítulo "aesthetic & nutrition" con líneas decorativas cortas ──
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.2);
  pdf.line(x + 12, y + 13.2, x + 26, y + 13.2);
  pdf.line(x + W - 26, y + 13.2, x + W - 12, y + 13.2);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(4);
  pdf.setTextColor(160, 120, 48);
  pdf.text("aesthetic & nutrition", x + W / 2, y + 13.5, { align: "center" });

  // ── QR con borde dorado suave ──
  const qrSize = 22;
  const qrX = x + 4;
  const qrY = y + 17;
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.4);
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 1, 1, "FD");
  pdf.addImage(qrImg, "PNG", qrX, qrY, qrSize, qrSize);

  // ── Nombre del paciente ──
  const nameX = x + 31;
  const nameY = y + 24;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(58, 34, 0);
  const maxName = 16;
  const displayName = card.patientName.length > maxName
    ? card.patientName.substring(0, maxName - 1) + "…"
    : card.patientName;
  pdf.text(displayName.toUpperCase(), nameX, nameY);

  // ── Label "CÓDIGO" ──
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(4.5);
  pdf.setTextColor(139, 105, 20);
  pdf.text("CÓDIGO", nameX, nameY + 5);

  // ── Número de monedero ──
  pdf.setFont("courier", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(58, 34, 0);
  pdf.text(card.walletNumber, nameX, nameY + 9.5);

  // ── URL con ícono globo (sin línea encima) ──
  const urlY = y + H - 5;
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.2);
  pdf.circle(x + W / 2 - 18, urlY - 0.5, 1.2, "S");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.5);
  pdf.setTextColor(122, 92, 30);
  pdf.text("nutriserpv.com/monedero", x + W / 2 - 14, urlY, { align: "left" });
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

    const url = pdf.output("bloburl");
    window.open(url, "_blank");
  } else {
    // Modo A4: grilla 2×4
    const A4_W = 210;
    const A4_H = 297;
    const GAP = 6;
    const MARGIN_X = (A4_W - 2 * W - GAP) / 2;
    const MARGIN_Y = (A4_H - 4 * H - 3 * GAP) / 2;

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    pdf.setFillColor(232, 232, 232);
    pdf.rect(0, 0, A4_W, A4_H, "F");

    for (let i = 0; i < cards.length; i++) {
      if (i > 0 && i % 8 === 0) {
        pdf.addPage("a4", "portrait");
        pdf.setFillColor(232, 232, 232);
        pdf.rect(0, 0, A4_W, A4_H, "F");
      }
      const pos = i % 8;
      const col = pos % 2;
      const row = Math.floor(pos / 2);
      const cx = MARGIN_X + col * (W + GAP);
      const cy = MARGIN_Y + row * (H + GAP);
      await drawCard(pdf, cards[i], cx, cy);
    }

    const url = pdf.output("bloburl");
    window.open(url, "_blank");
  }
}

// Alias legacy — no se usa
export async function generateWalletPdfFromElements(
  _elements: HTMLElement[],
  _mode: "individual" | "a4"
): Promise<void> {
  throw new Error("Usa generateWalletPdf en lugar de generateWalletPdfFromElements");
}
