/**
 * walletCardPdf.ts
 *
 * Genera un PDF con la tarjeta del Monedero Nutriser usando PDFKit.
 * Formato CR-80: 85.5mm x 54mm (tarjeta de crédito estándar).
 *
 * Diseño (igual que NutriserWalletCard en React):
 * - Fondo BLANCO (ahorra tinta, estilo tarjeta PVC de clínica)
 * - Borde dorado sutil
 * - Franja dorada superior: logo + "MONEDERO NUTRISER / aesthetic & nutrition" (SIN badge)
 * - Zona central: QR a la izquierda + silueta dorada a la derecha (todo dentro de los límites)
 * - Franja dorada inferior: nombre + número + "nutriserpv.com/monedero" (SIN saldo)
 */

import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import https from "https";
import http from "http";

// CR-80 en puntos (1mm = 2.8346pt)
const MM = 2.8346;
const CARD_W = 85.5 * MM; // ~242pt
const CARD_H = 54 * MM;   // ~153pt

// Colores
const GOLD        = "#C5A55A";
const GOLD_LIGHT  = "#E8C97A";
const GOLD_DARK   = "#8B6914";
const WHITE       = "#FFFFFF";
const DARK_BROWN  = "#3a2200";
const NEAR_BLACK  = "#1A1A1A";

// Descarga una imagen remota como Buffer
function fetchImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchImage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

export interface WalletPdfCard {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
}

export async function generateWalletCardPdf(cards: WalletPdfCard[]): Promise<Buffer> {
  // Generar QR para cada tarjeta
  const qrBuffers: (Buffer | null)[] = await Promise.all(
    cards.map(async (card) => {
      try {
        return await QRCode.toBuffer(card.qrUrl || `https://nutriserpv.com/c/${card.walletNumber}`, {
          type: "png", width: 240, margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#000000", light: "#FFFFFF" },
        });
      } catch { return null; }
    })
  );

  // Descargar logo
  let logoBuffer: Buffer | null = null;
  try {
    logoBuffer = await fetchImage(
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png"
    );
  } catch { logoBuffer = null; }

  // Descargar silueta
  let siluetaBuffer: Buffer | null = null;
  try {
    siluetaBuffer = await fetchImage(
      "https://nutriserpv.com/manus-storage/nutriser-silueta_f6738ee7.png"
    );
  } catch { siluetaBuffer = null; }

  return new Promise((resolve, reject) => {
    const isSingle = cards.length === 1;

    const doc = new PDFDocument({
      size: isSingle ? [CARD_W, CARD_H] : "A4",
      margin: 0,
      compress: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    if (isSingle) {
      drawCard(doc, cards[0], qrBuffers[0], logoBuffer, siluetaBuffer, 0, 0, CARD_W, CARD_H);
    } else {
      const PAGE_W = 595.28;
      const MARGIN = 20;
      const GAP = 8;
      const cols = 2;
      const cw = (PAGE_W - MARGIN * 2 - GAP * (cols - 1)) / cols;
      const ch = cw * (CARD_H / CARD_W);

      cards.slice(0, 8).forEach((card, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx = MARGIN + col * (cw + GAP);
        const cy = MARGIN + row * (ch + GAP);
        drawCard(doc, card, qrBuffers[i], logoBuffer, siluetaBuffer, cx, cy, cw, ch);
      });
    }

    doc.end();
  });
}

function drawCard(
  doc: PDFKit.PDFDocument,
  card: WalletPdfCard,
  qrBuf: Buffer | null,
  logoBuf: Buffer | null,
  siluetaBuf: Buffer | null,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const s = w / CARD_W; // factor de escala

  doc.save();

  // ── Fondo BLANCO con borde dorado ──────────────────────────────────────────
  doc.roundedRect(x, y, w, h, 6 * s).fill(WHITE);
  doc.roundedRect(x + 0.5 * s, y + 0.5 * s, w - 1 * s, h - 1 * s, 6 * s)
    .lineWidth(1 * s)
    .stroke(GOLD);

  // ── Proporciones estrictas (deben sumar exactamente h) ────────────────────
  // Franja superior: 22% de h
  // Zona central:   50% de h
  // Franja inferior: 28% de h
  const topBarH = Math.round(h * 0.22);
  const botBarH = Math.round(h * 0.28);
  const midH    = h - topBarH - botBarH;

  const topBarY = y;
  const midY    = y + topBarH;
  const botBarY = y + topBarH + midH;

  // ── Franja dorada SUPERIOR ─────────────────────────────────────────────────
  // Clip para que respete las esquinas redondeadas arriba
  doc.save();
  doc.roundedRect(x, topBarY, w, topBarH + 6 * s, 6 * s).clip();
  doc.rect(x, topBarY, w, topBarH).fill(GOLD);
  doc.restore();

  // Logo en la franja superior
  const logoSize = topBarH * 0.62;
  const logoX    = x + 6 * s;
  const logoY    = topBarY + (topBarH - logoSize) / 2;
  if (logoBuf) {
    doc.image(logoBuf, logoX, logoY, { width: logoSize, height: logoSize });
  } else {
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2).fill(GOLD_DARK);
  }

  // Texto "MONEDERO NUTRISER" en la franja superior
  const titleX    = logoX + logoSize + 4 * s;
  const titleMaxW = w - titleX - 6 * s;
  doc.fillColor(DARK_BROWN)
    .fontSize(6.5 * s)
    .font("Helvetica-Bold")
    .text("MONEDERO NUTRISER", titleX, topBarY + topBarH * 0.15, {
      width: titleMaxW,
      lineBreak: false,
    });

  doc.fillColor(DARK_BROWN)
    .fontSize(4.5 * s)
    .font("Helvetica")
    .text("aesthetic & nutrition", titleX, topBarY + topBarH * 0.58, {
      width: titleMaxW,
      lineBreak: false,
    });

  // ── Zona central: QR izquierda + Silueta derecha ──────────────────────────
  const pad = 4 * s; // padding interior de la zona central

  // QR: ocupa el 50% izquierdo de la zona central, cuadrado
  const qrAreaW  = w * 0.50;
  const qrSize   = Math.min(qrAreaW - pad * 2, midH - pad * 2); // cuadrado, sin salirse
  const qrX      = x + pad + (qrAreaW - pad * 2 - qrSize) / 2;
  const qrY      = midY + (midH - qrSize) / 2;
  const qrPad    = 2.5 * s;

  // Marco blanco con borde dorado para el QR
  doc.roundedRect(qrX - qrPad, qrY - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2, 3 * s)
    .fill(WHITE);
  doc.roundedRect(qrX - qrPad, qrY - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2, 3 * s)
    .lineWidth(0.8 * s)
    .stroke(GOLD);

  if (qrBuf) {
    doc.image(qrBuf, qrX, qrY, { width: qrSize, height: qrSize });
  }

  // Silueta: ocupa el 50% derecho de la zona central
  if (siluetaBuf) {
    const silAreaX = x + w * 0.50;
    const silAreaW = w * 0.50;
    const silSize  = Math.min(silAreaW - pad * 2, midH - pad * 2);
    const silX     = silAreaX + (silAreaW - silSize) / 2;
    const silY     = midY + (midH - silSize) / 2;
    doc.save();
    doc.opacity(0.88);
    doc.image(siluetaBuf, silX, silY, { width: silSize, height: silSize });
    doc.restore();
  }

  // ── Franja dorada INFERIOR ─────────────────────────────────────────────────
  // Clip para que respete las esquinas redondeadas abajo
  doc.save();
  doc.roundedRect(x, botBarY - 6 * s, w, botBarH + 6 * s, 6 * s).clip();
  doc.rect(x, botBarY, w, botBarH).fill(GOLD_LIGHT);
  doc.restore();

  // Nombre del paciente (izquierda, arriba en la franja)
  const nameStr = card.patientName.toUpperCase();
  doc.fillColor(NEAR_BLACK)
    .fontSize(7.5 * s)
    .font("Helvetica-Bold")
    .text(nameStr, x + 7 * s, botBarY + botBarH * 0.08, {
      width: w * 0.60,
      lineBreak: false,
      ellipsis: true,
    });

  // Número de monedero (izquierda, abajo en la franja)
  doc.fillColor(DARK_BROWN)
    .fontSize(5 * s)
    .font("Courier-Bold")
    .text(card.walletNumber, x + 7 * s, botBarY + botBarH * 0.52, {
      width: w * 0.55,
      lineBreak: false,
    });

  // URL (derecha, centrada verticalmente en la franja)
  doc.fillColor(DARK_BROWN)
    .fontSize(4.2 * s)
    .font("Helvetica-Bold")
    .text("nutriserpv.com/monedero", x + w * 0.50, botBarY + botBarH * 0.35, {
      width: w * 0.48,
      align: "right",
      lineBreak: false,
    });

  doc.restore();
}
