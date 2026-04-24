import jsPDF from "jspdf";
import QRCode from "qrcode";
import { SILUETA_CROPPED_B64 } from "./siluetaCroppedB64";

export interface WalletPdfCardData {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
}

const W = 85.60; // CR-80 ancho mm
const H = 54.00; // CR-80 alto mm

async function makeQR(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 300, margin: 1,
    color: { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel: "H",
  });
}

async function drawCard(pdf: jsPDF, card: WalletPdfCardData, x: number, y: number) {
  const qrImg = await makeQR(card.qrUrl);

  // Fondo blanco perla
  pdf.setFillColor(254, 254, 252);
  pdf.roundedRect(x, y, W, H, 3, 3, "F");

  // Borde dorado
  pdf.setDrawColor(212, 175, 96);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(x, y, W, H, 3, 3, "S");

  // ── CABECERA ──────────────────────────────────────────────────────────────
  const cx = x + W / 2;

  // "MONEDERO NUTRISER"
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.8);
  pdf.setTextColor(139, 105, 20);
  pdf.text("MONEDERO NUTRISER", cx, y + 7.5, { align: "center", charSpace: 1.0 });

  // "aesthetic & nutrition" — solo el texto, sin líneas que lo tapen
  const subTextY = y + 12.5;
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(4.2);
  pdf.setTextColor(184, 150, 62);
  pdf.text("aesthetic & nutrition", cx, subTextY, { align: "center", charSpace: 0.6 });

  // ── SILUETA ───────────────────────────────────────────────────────────────
  // Imagen recortada 233x887px (ratio ancho/alto = 0.263)
  // En la referencia ocupa ~65% del alto, posicionada en zona derecha
  const silH = H * 0.65;
  const silW = silH * 0.263;
  const silX = x + W - silW - 3.5;
  const silY = y + H * 0.12;
  try {
    pdf.addImage(SILUETA_CROPPED_B64, "PNG", silX, silY, silW, silH);
  } catch (_) {}

  // ── ZONA CENTRAL ──────────────────────────────────────────────────────────
  const zTop    = y + H * 0.30;
  const zBottom = y + H * 0.82;
  const zH      = zBottom - zTop;
  const zMid    = zTop + zH / 2;

  // QR con borde dorado
  const qrSize = 21;
  const qrX    = x + 4.5;
  const qrY    = zMid - qrSize / 2;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(qrX - 1.2, qrY - 1.2, qrSize + 2.4, qrSize + 2.4, 1.2, 1.2, "FD");
  pdf.addImage(qrImg, "PNG", qrX, qrY, qrSize, qrSize);

  // Separador vertical
  const sepX = x + 33;
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.25);
  pdf.line(sepX, zTop + 3, sepX, zBottom - 3);

  // Nombre — SIN línea debajo
  const nameX = sepX + 3;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(58, 34, 0);
  const name = card.patientName.length > 14
    ? card.patientName.substring(0, 13) + "…"
    : card.patientName;
  pdf.text(name.toUpperCase(), nameX, zMid - 5, { charSpace: 0.2 });

  // "CÓDIGO"
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(4.5);
  pdf.setTextColor(184, 150, 62);
  pdf.text("CÓDIGO", nameX, zMid + 2, { charSpace: 0.5 });

  // Número
  pdf.setFont("courier", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(58, 34, 0);
  pdf.text(card.walletNumber, nameX, zMid + 7, { charSpace: 0.3 });

  // ── PIE ───────────────────────────────────────────────────────────────────
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.18);
  pdf.line(x + 3, zBottom, x + W - 3, zBottom);

  // Ícono globo
  const gx = x + W / 2 - 17;
  const gy = y + H - 4.5;
  const r  = 2.0;
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.32);
  pdf.circle(gx, gy - 0.3, r, "S");
  pdf.setLineWidth(0.20);
  pdf.line(gx - r, gy - 0.3, gx + r, gy - 0.3);
  pdf.setLineWidth(0.16);
  pdf.line(gx - r * 0.8, gy - 1.5, gx + r * 0.8, gy - 1.5);
  pdf.line(gx - r * 0.8, gy + 0.9, gx + r * 0.8, gy + 0.9);

  // URL
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.5);
  pdf.setTextColor(139, 105, 20);
  pdf.text("nutriserpv.com/monedero", gx + r + 1.5, gy + 0.2, { charSpace: 0.2 });
}

export async function generateWalletPdf(
  cards: WalletPdfCardData[],
  mode: "individual" | "a4" = "individual"
): Promise<void> {
  if (cards.length === 0) return;

  if (mode === "individual" || cards.length === 1) {
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [W, H] });
    for (let i = 0; i < cards.length; i++) {
      if (i > 0) pdf.addPage([W, H], "landscape");
      await drawCard(pdf, cards[i], 0, 0);
    }
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "monedero-nutriser.pdf";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  } else {
    const A4_W = 210, A4_H = 297, GAP = 6;
    const MX = (A4_W - 2 * W - GAP) / 2;
    const MY = (A4_H - 4 * H - 3 * GAP) / 2;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    pdf.setFillColor(220, 220, 220);
    pdf.rect(0, 0, A4_W, A4_H, "F");
    for (let i = 0; i < cards.length; i++) {
      if (i > 0 && i % 8 === 0) {
        pdf.addPage("a4", "portrait");
        pdf.setFillColor(220, 220, 220);
        pdf.rect(0, 0, A4_W, A4_H, "F");
      }
      const p = i % 8;
      await drawCard(pdf, cards[i], MX + (p % 2) * (W + GAP), MY + Math.floor(p / 2) * (H + GAP));
    }
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "monedero-nutriser-a4.pdf";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }
}

export async function generateWalletPdfFromElements(_e: HTMLElement[], _m: "individual" | "a4"): Promise<void> {
  throw new Error("Usa generateWalletPdf");
}
