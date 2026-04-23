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
 * - Zona central: QR grande a la izquierda + silueta dorada a la derecha
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
        const x = MARGIN + col * (cw + GAP);
        const y = MARGIN + row * (ch + GAP);
        drawCard(doc, card, qrBuffers[i], logoBuffer, siluetaBuffer, x, y, cw, ch);
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
  doc.roundedRect(x, y, w, h, 7 * s).fill(WHITE);
  doc.roundedRect(x + 0.5, y + 0.5, w - 1, h - 1, 7 * s)
    .lineWidth(1 * s)
    .stroke(GOLD);

  // ── Proporciones de las franjas ────────────────────────────────────────────
  const topBarH  = h * 0.24;  // 24% superior
  const botBarH  = h * 0.28;  // 28% inferior
  const midTop   = y + topBarH;
  const midBot   = y + h - botBarH;
  const midH     = midBot - midTop; // zona central

  // ── Franja dorada SUPERIOR ─────────────────────────────────────────────────
  doc.save();
  doc.roundedRect(x, y, w, topBarH + 7 * s, 7 * s).clip();
  doc.rect(x, y, w, topBarH).fill(GOLD);
  doc.restore();

  // Logo en la franja superior
  const logoSize = topBarH * 0.65;
  const logoX = x + 6 * s;
  const logoY = y + (topBarH - logoSize) / 2;
  if (logoBuf) {
    doc.image(logoBuf, logoX, logoY, { width: logoSize, height: logoSize });
  } else {
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2).fill(GOLD_DARK);
  }

  // Texto "MONEDERO NUTRISER" en la franja superior
  const titleX = logoX + logoSize + 4 * s;
  const titleMaxW = w * 0.65;
  doc.fillColor(DARK_BROWN)
    .fontSize(6.5 * s)
    .font("Helvetica-Bold")
    .text("MONEDERO NUTRISER", titleX, y + topBarH * 0.18, { width: titleMaxW, lineBreak: false });

  doc.fillColor("rgba(58,34,0,0.6)")
    .fontSize(4.8 * s)
    .font("Helvetica")
    .text("aesthetic & nutrition", titleX, y + topBarH * 0.58, { width: titleMaxW, lineBreak: false });

  // ── Silueta dorada — zona central derecha (46% del ancho) ─────────────────
  if (siluetaBuf) {
    const silW = w * 0.44;
    const silH = midH * 0.92;
    const silX = x + w - silW - 2 * s;
    const silY = midTop + (midH - silH) / 2;
    doc.save();
    doc.opacity(0.88);
    doc.image(siluetaBuf, silX, silY, { width: silW, height: silH });
    doc.restore();
  }

  // ── QR — zona central izquierda (54% del ancho) ───────────────────────────
  const qrMaxSize = Math.min(w * 0.46, midH * 0.88);
  const qrSize = qrMaxSize;
  const qrX = x + (w * 0.54 - qrSize) / 2 + 4 * s;
  const qrY = midTop + (midH - qrSize) / 2;

  // Marco blanco con borde dorado
  const qrPad = 3 * s;
  doc.roundedRect(qrX - qrPad, qrY - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2, 3 * s)
    .fill(WHITE);
  doc.roundedRect(qrX - qrPad, qrY - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2, 3 * s)
    .lineWidth(0.8 * s)
    .stroke(GOLD);

  if (qrBuf) {
    doc.image(qrBuf, qrX, qrY, { width: qrSize, height: qrSize });
  }

  // ── Franja dorada INFERIOR ─────────────────────────────────────────────────
  doc.save();
  doc.roundedRect(x, midBot - 7 * s, w, botBarH + 7 * s, 7 * s).clip();
  doc.rect(x, midBot, w, botBarH).fill(GOLD_LIGHT);
  doc.restore();

  // Nombre del paciente (izquierda)
  const nameStr = card.patientName.toUpperCase();
  doc.fillColor(NEAR_BLACK)
    .fontSize(8 * s)
    .font("Helvetica-Bold")
    .text(nameStr, x + 8 * s, midBot + botBarH * 0.1, {
      width: w * 0.62,
      lineBreak: false,
      ellipsis: true,
    });

  // Número de monedero (izquierda, debajo del nombre)
  doc.fillColor(DARK_BROWN)
    .fontSize(5.5 * s)
    .font("Courier-Bold")
    .text(card.walletNumber, x + 8 * s, midBot + botBarH * 0.52, {
      width: w * 0.55,
      lineBreak: false,
    });

  // URL (derecha)
  doc.fillColor("rgba(58,34,0,0.65)")
    .fontSize(4.5 * s)
    .font("Helvetica-Bold")
    .text("nutriserpv.com/monedero", x + w * 0.52, midBot + botBarH * 0.35, {
      width: w * 0.46,
      align: "right",
      lineBreak: false,
    });

  doc.restore();
}
