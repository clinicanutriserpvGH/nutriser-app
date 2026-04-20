/**
 * walletCardPdf.ts
 *
 * Genera un PDF con la tarjeta del Monedero Nutriser usando PDFKit.
 * Formato CR-80: 85.5mm x 54mm (tarjeta de crédito estándar).
 *
 * Diseño de referencia:
 * - Fondo negro brillante con esquinas redondeadas
 * - Logo Nutriser + "MONEDERO NUTRISER / aesthetic & nutrition" arriba izquierda
 * - Silueta dorada grande a la derecha (marca de agua visible)
 * - QR blanco a la izquierda centro
 * - Placa dorada (rectángulo) con nombre del paciente y número de monedero
 * - Banda dorada inferior con URL y "Valida solo en Nutriser PV"
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
const BLACK       = "#1A1A1A";
const WHITE       = "#FFFFFF";
const GRAY_DIM    = "#888888";

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
          type: "png", width: 220, margin: 1,
          errorCorrectionLevel: "H",
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

  // ── Fondo negro ────────────────────────────────────────────────────────────
  doc.roundedRect(x, y, w, h, 7 * s).fill(BLACK);

  // ── Banda dorada inferior ──────────────────────────────────────────────────
  const bandH = 13 * s;
  const bandY = y + h - bandH;
  doc.rect(x, bandY, w, bandH).fill(GOLD);

  // Texto izquierdo en la banda
  doc.fillColor(BLACK)
    .fontSize(4.8 * s)
    .font("Helvetica-Bold")
    .text("NUTRISERPV.COM/MONEDERO", x + 7 * s, bandY + bandH / 2 - 3 * s, {
      width: w * 0.52,
      lineBreak: false,
    });

  // Texto derecho en la banda
  doc.fillColor("#3a2800")
    .fontSize(4.2 * s)
    .font("Helvetica")
    .text("Valida solo en Nutriser PV", x + w * 0.54, bandY + bandH / 2 - 2.5 * s, {
      width: w * 0.44,
      align: "right",
      lineBreak: false,
    });

  // ── Silueta dorada grande a la derecha ─────────────────────────────────────
  // La imagen es 1024×1024 cuadrada; la dibujamos como cuadrado para no estirar
  if (siluetaBuf) {
    const silSize = (h - bandH) * 0.88; // cuadrado que cabe en la altura disponible
    const silX = x + w - silSize - 2 * s;
    const silY = y + (h - bandH - silSize) / 2; // centrada verticalmente
    doc.save();
    doc.opacity(0.85); // visible, no solo marca de agua
    doc.image(siluetaBuf, silX, silY, { width: silSize, height: silSize });
    doc.restore();
  }

  // ── Logo Nutriser arriba izquierda ─────────────────────────────────────────
  const logoSize = 18 * s;
  const logoX = x + 8 * s;
  const logoY = y + 7 * s;
  if (logoBuf) {
    doc.image(logoBuf, logoX, logoY, { width: logoSize, height: logoSize });
  } else {
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2).fill(GOLD);
    doc.fillColor(BLACK).fontSize(9 * s).font("Helvetica-Bold")
      .text("N", logoX, logoY + logoSize * 0.2, { width: logoSize, align: "center" });
  }

  // ── Título "MONEDERO NUTRISER" ─────────────────────────────────────────────
  const titleX = logoX + logoSize + 5 * s;
  const titleMaxW = w * 0.52; // no solapar con la silueta
  doc.fillColor(GOLD)
    .fontSize(7 * s)
    .font("Helvetica-Bold")
    .text("MONEDERO NUTRISER", titleX, y + 8 * s, { width: titleMaxW, lineBreak: false });

  doc.fillColor(GRAY_DIM)
    .fontSize(5 * s)
    .font("Helvetica")
    .text("aesthetic & nutrition", titleX, y + 17 * s, { width: titleMaxW, lineBreak: false });

   // ── QR Code ────────────────────────────────────────────────────────────
  const qrPad   = 3 * s;
  const qrSize  = 52 * s;
  const qrX     = x + 8 * s;
  // Posicionar el QR en la mitad inferior: centrado entre el header (y+28*s) y la banda inferior
  const contentTop = y + 28 * s;   // justo debajo del header
  const contentBot = bandY - 4 * s; // justo encima de la banda dorada
  const qrY = contentTop + (contentBot - contentTop - qrSize) / 2;

  // Fondo blanco del QR con borde redondeado
  doc.roundedRect(qrX - qrPad, qrY - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2, 3 * s)
    .fill(WHITE);

  if (qrBuf) {
    doc.image(qrBuf, qrX, qrY, { width: qrSize, height: qrSize });
  }

  // ── Placa dorada con nombre y número ──────────────────────────────────────
  const plateX  = qrX + qrSize + qrPad * 2 + 5 * s;
  const plateW  = w * 0.34;
  const plateH  = 24 * s;
  const plateY  = qrY + (qrSize - plateH) / 2;

  // Rectángulo dorado (placa)
  doc.roundedRect(plateX, plateY, plateW, plateH, 3 * s).fill(GOLD_LIGHT);

  // Nombre del paciente en la placa (texto oscuro sobre dorado)
  const nameStr = card.patientName.toUpperCase();
  doc.fillColor(BLACK)
    .fontSize(7.5 * s)
    .font("Helvetica-Bold")
    .text(nameStr, plateX + 4 * s, plateY + 4 * s, {
      width: plateW - 8 * s,
      lineBreak: false,
      ellipsis: true,
    });

  // Número de monedero en la placa
  doc.fillColor(GOLD_DARK)
    .fontSize(5.5 * s)
    .font("Courier-Bold")
    .text(card.walletNumber, plateX + 4 * s, plateY + 14 * s, {
      width: plateW - 8 * s,
      lineBreak: false,
    });

  doc.restore();
}
