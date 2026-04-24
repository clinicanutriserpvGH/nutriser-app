/**
 * generateWalletPdfClient.ts
 *
 * Genera un PDF de tarjetas del Monedero Nutriser directamente en el navegador
 * usando jsPDF + QRCode puro + silueta y logo embebidos en base64.
 * NO usa html2canvas — compatible con Safari/iPad.
 *
 * Formato CR-80 exacto ISO/IEC 7810 ID-1: 85.60mm × 54.00mm
 * Zona segura: 3mm de margen en todos los lados (contenido entre 3mm y 82.6mm × 51mm)
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

// Zona segura: 3mm de margen en todos los lados
const SAFE = 3;
// Área útil dentro de la zona segura
const INNER_W = W - SAFE * 2;  // 79.6mm
const INNER_H = H - SAFE * 2;  // 48mm

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
 * Todo el contenido está dentro de la zona segura (3mm de margen)
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
  pdf.setLineWidth(0.4);
  pdf.roundedRect(x, y, W, H, 3, 3, "S");

  // ── Zona segura: todo el contenido empieza en x+SAFE, y+SAFE ──
  const sx = x + SAFE;   // 3mm desde borde izquierdo
  const sy = y + SAFE;   // 3mm desde borde superior

  // ── Logo centrado arriba (dentro de zona segura) ──
  const logoSize = 5.5;
  const logoX = x + (W - logoSize) / 2;
  const logoY = sy;  // 3mm desde arriba
  try {
    pdf.addImage(LOGO_B64, "PNG", logoX, logoY, logoSize, logoSize);
  } catch (_) {}

  // ── Título "MONEDERO NUTRISER" ──
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(122, 92, 30);
  pdf.text("MONEDERO NUTRISER", x + W / 2, sy + 7, { align: "center" });

  // ── Subtítulo con líneas decorativas ──
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.2);
  pdf.line(sx + 2, sy + 9, sx + 14, sy + 9);
  pdf.line(x + W - SAFE - 14, sy + 9, x + W - SAFE - 2, sy + 9);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(4);
  pdf.setTextColor(160, 120, 48);
  pdf.text("aesthetic & nutrition", x + W / 2, sy + 9.5, { align: "center" });

  // ── Silueta dorada (derecha, dentro de zona segura) ──
  // Zona disponible: desde sy+11 hasta y+H-SAFE-5 (para dejar espacio a URL)
  const silAvailH = H - SAFE - 5 - (sy + 11);  // altura disponible
  const silH = Math.min(silAvailH, 28);
  const silW = silH;  // cuadrada
  const silX = x + W - SAFE - silW;  // pegada al borde derecho de zona segura
  const silY = sy + 11;
  try {
    pdf.addImage(SILUETA_B64, "PNG", silX, silY, silW, silH);
  } catch (_) {}

  // ── QR con borde dorado (izquierda, dentro de zona segura) ──
  const qrSize = 22;
  const qrX = sx;  // 3mm desde borde izquierdo
  const qrY = sy + 11;
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.3);
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(qrX - 0.5, qrY - 0.5, qrSize + 1, qrSize + 1, 1, 1, "FD");
  pdf.addImage(qrImg, "PNG", qrX, qrY, qrSize, qrSize);

  // ── Nombre del paciente (centro-derecha, dentro de zona segura) ──
  const nameX = sx + qrSize + 3;  // después del QR + gap
  const nameY = sy + 17;
  const maxNameW = W - SAFE - (qrSize + 3 + SAFE) - silW - 1;  // ancho disponible

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(58, 34, 0);
  const maxChars = 14;
  const displayName = card.patientName.length > maxChars
    ? card.patientName.substring(0, maxChars - 1) + "…"
    : card.patientName;
  pdf.text(displayName.toUpperCase(), nameX, nameY);

  // ── Label "CÓDIGO" ──
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(4);
  pdf.setTextColor(139, 105, 20);
  pdf.text("CÓDIGO", nameX, nameY + 5);

  // ── Número de monedero ──
  pdf.setFont("courier", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(58, 34, 0);
  pdf.text(card.walletNumber, nameX, nameY + 9.5);

  // ── URL en la parte inferior (dentro de zona segura, 3mm del borde inferior) ──
  const urlY = y + H - SAFE - 0.5;  // 3mm desde borde inferior
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.15);
  // Línea separadora
  pdf.line(sx, urlY - 2.5, x + W - SAFE, urlY - 2.5);
  // Ícono círculo (globo)
  pdf.circle(sx + 1.2, urlY - 0.8, 1.1, "S");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5);
  pdf.setTextColor(122, 92, 30);
  pdf.text("nutriserpv.com/monedero", sx + 3.5, urlY, { align: "left" });
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
    // Página exacta CR-80 — landscape para que la orientación sea correcta
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [H, W],  // jsPDF landscape: [alto, ancho] → resultado: W×H
    });

    for (let i = 0; i < cards.length; i++) {
      if (i > 0) pdf.addPage([H, W], "landscape");
      await drawCard(pdf, cards[i], 0, 0);
    }

    pdf.save(
      cards.length === 1
        ? "tarjeta-nutriser.pdf"
        : `tarjetas-nutriser-${cards.length}.pdf`
    );
  } else {
    // Modo A4: grilla 2×4 (8 tarjetas por página)
    const A4_W = 210;
    const A4_H = 297;
    const GAP = 5;
    const MARGIN_X = (A4_W - 2 * W - GAP) / 2;
    const MARGIN_Y = 15;  // margen superior fijo para mejor presentación

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    pdf.setFillColor(235, 235, 235);
    pdf.rect(0, 0, A4_W, A4_H, "F");

    for (let i = 0; i < cards.length; i++) {
      if (i > 0 && i % 8 === 0) {
        pdf.addPage("a4", "portrait");
        pdf.setFillColor(235, 235, 235);
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
