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

// Dimensiones CR-80 en mm
const W = 85.5;
const H = 54;

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

  // ── Fondo blanco perla ──
  pdf.setFillColor(253, 252, 248);
  pdf.roundedRect(x, y, W, H, 3, 3, "F");

  // ── Borde dorado exterior ──
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(x, y, W, H, 3, 3, "S");

  // ── Cabecera blanca con logo + título ──
  const topH = 14;

  // Logo centrado
  const logoSize = 7;
  const logoX = x + (W - logoSize) / 2;
  try {
    pdf.addImage(LOGO_B64, "PNG", logoX, y + 1.5, logoSize, logoSize);
  } catch (_) {}

  // Título "MONEDERO NUTRISER"
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(122, 92, 30);
  pdf.text("MONEDERO NUTRISER", x + W / 2, y + 10.5, { align: "center" });

  // Líneas decorativas + subtítulo
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.2);
  pdf.line(x + 10, y + 12.5, x + 30, y + 12.5);
  pdf.line(x + W - 30, y + 12.5, x + W - 10, y + 12.5);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(4);
  pdf.setTextColor(160, 120, 48);
  pdf.text("aesthetic & nutrition", x + W / 2, y + 13, { align: "center" });

  // Línea separadora bajo cabecera
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.3);
  pdf.line(x + 5, y + topH, x + W - 5, y + topH);

  // ── Zona central (QR + separador + nombre/código) ──
  const midY = y + topH + 1;
  const midH = H - topH - 10;

  // Silueta dorada a la derecha
  const silW = 20;
  const silH = midH + 4;
  const silX = x + W - silW - 1;
  const silY = midY - 1;
  try {
    pdf.addImage(SILUETA_B64, "PNG", silX, silY, silW, silH);
  } catch (_) {
    pdf.setFillColor(197, 165, 90);
    pdf.rect(silX + silW * 0.3, silY, silW * 0.4, silH, "F");
  }

  // QR (izquierda)
  const qrSize = 22;
  const qrX = x + 3;
  const qrY = midY + (midH - qrSize) / 2;

  // Marco dorado del QR
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.4);
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 1, 1, "FD");
  pdf.addImage(qrImg, "PNG", qrX, qrY, qrSize, qrSize);

  // Separador vertical dorado
  const sepX = x + 31;
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.3);
  pdf.line(sepX, midY + 2, sepX, midY + midH - 2);

  // Nombre del paciente
  const nameX = sepX + 3;
  const nameY = midY + 7;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(58, 34, 0);
  const maxName = 15;
  const displayName =
    card.patientName.length > maxName
      ? card.patientName.substring(0, maxName - 1) + "…"
      : card.patientName;
  pdf.text(displayName.toUpperCase(), nameX, nameY);

  // Línea bajo el nombre
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.2);
  pdf.line(nameX, nameY + 1.5, nameX + 34, nameY + 1.5);

  // Label "CÓDIGO"
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(4.5);
  pdf.setTextColor(139, 105, 20);
  pdf.text("CÓDIGO", nameX, nameY + 5.5);

  // Número de monedero
  pdf.setFont("courier", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(58, 34, 0);
  pdf.text(card.walletNumber, nameX, nameY + 10);

  // ── Línea separadora inferior ──
  const botLineY = y + H - 10;
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.3);
  pdf.line(x + 5, botLineY, x + W - 5, botLineY);

  // URL con ícono de globo (simulado con círculo)
  const urlY = y + H - 5.5;
  // Círculo pequeño como "globo"
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

    pdf.save(
      cards.length === 1
        ? "tarjeta-nutriser.pdf"
        : `tarjetas-nutriser-${cards.length}.pdf`
    );
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

    pdf.save(`tarjetas-nutriser-${cards.length}.pdf`);
  }
}

// Alias legacy — no se usa
export async function generateWalletPdfFromElements(
  _elements: HTMLElement[],
  _mode: "individual" | "a4"
): Promise<void> {
  throw new Error("Usa generateWalletPdf en lugar de generateWalletPdfFromElements");
}
