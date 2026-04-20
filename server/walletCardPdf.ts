/**
 * walletCardPdf.ts
 *
 * Genera un PDF con la tarjeta del Monedero Nutriser usando PDFKit.
 * Formato CR-80: 85.5mm x 54mm (tarjeta de crédito estándar).
 * El PDF se genera en el servidor y se sirve directamente al cliente,
 * sin depender de Canvas, html2canvas ni imágenes externas con CORS.
 *
 * El QR se genera con la librería `qrcode` directamente en el servidor.
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
const GOLD = "#C5A55A";
const GOLD_LIGHT = "#E8C97A";
const GOLD_DARK = "#8B6914";
const BLACK = "#1A1A1A";
const DARK_WARM = "#2a2010";
const WHITE = "#FFFFFF";
const WHITE_DIM = "rgba(255,255,255,0.55)";

// Descarga una imagen remota como Buffer
function fetchImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Seguir redirecciones
        fetchImage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error("Timeout fetching image"));
    });
  });
}

export interface WalletPdfCard {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
}

/**
 * Genera un PDF con una o varias tarjetas del monedero.
 * Si hay más de 1 tarjeta, las acomoda en hoja A4 (2 columnas x 4 filas).
 * Devuelve un Buffer con el PDF completo.
 */
export async function generateWalletCardPdf(cards: WalletPdfCard[]): Promise<Buffer> {
  // Generar QR para cada tarjeta como PNG buffer
  const qrBuffers: (Buffer | null)[] = await Promise.all(
    cards.map(async (card) => {
      try {
        const qrUrl = card.qrUrl || `https://nutriserpv.com/c/${card.walletNumber}`;
        const pngBuffer = await QRCode.toBuffer(qrUrl, {
          type: "png",
          width: 200,
          margin: 1,
          errorCorrectionLevel: "H",
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        return pngBuffer;
      } catch {
        return null;
      }
    })
  );

  // Intentar descargar el logo de Nutriser
  let logoBuffer: Buffer | null = null;
  try {
    logoBuffer = await fetchImage(
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png"
    );
  } catch {
    logoBuffer = null;
  }

  // Intentar descargar la silueta
  let siluetaBuffer: Buffer | null = null;
  try {
    // Usar la URL absoluta de producción para el servidor
    siluetaBuffer = await fetchImage(
      "https://nutriserpv.com/manus-storage/nutriser-silueta_f6738ee7.png"
    );
  } catch {
    siluetaBuffer = null;
  }

  return new Promise((resolve, reject) => {
    const isSingle = cards.length === 1;

    // Para una sola tarjeta: página del tamaño exacto de la tarjeta
    // Para múltiples: página A4
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
      // A4: 595.28 x 841.89 pt
      const PAGE_W = 595.28;
      const PAGE_H = 841.89;
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

  // ── Fondo oscuro ──────────────────────────────────────────────────────────
  doc.save();
  doc.roundedRect(x, y, w, h, 6 * s).fill(BLACK);

  // Degradado cálido en el centro (simulado con un rectángulo semitransparente)
  doc.roundedRect(x + w * 0.2, y, w * 0.6, h, 6 * s)
    .fillOpacity(0.15)
    .fill(DARK_WARM);
  doc.fillOpacity(1);

  // ── Línea dorada superior ─────────────────────────────────────────────────
  doc.rect(x, y, w, 1.5 * s).fill(GOLD);

  // ── Silueta como marca de agua ────────────────────────────────────────────
  if (siluetaBuf) {
    const silH = h * 0.72;
    const silW = silH * 0.55; // proporción aproximada de la silueta
    doc.save();
    doc.opacity(0.18);
    doc.image(siluetaBuf, x + w - silW - 6 * s, y + h * 0.05, {
      width: silW,
      height: silH,
    });
    doc.restore();
  }

  // ── Logo Nutriser ─────────────────────────────────────────────────────────
  const logoSize = 20 * s;
  const logoX = x + 10 * s;
  const logoY = y + 8 * s;
  if (logoBuf) {
    doc.image(logoBuf, logoX, logoY, { width: logoSize, height: logoSize });
  } else {
    // Fallback: círculo dorado con "N"
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2)
      .fill(GOLD);
    doc.fillColor(BLACK)
      .fontSize(10 * s)
      .font("Helvetica-Bold")
      .text("N", logoX, logoY + logoSize * 0.2, { width: logoSize, align: "center" });
  }

  // ── Título "MONEDERO NUTRISER" ────────────────────────────────────────────
  const titleX = logoX + logoSize + 5 * s;
  const titleW = w - titleX - 10 * s + x;
  doc.fillColor(GOLD)
    .fontSize(6.5 * s)
    .font("Helvetica-Bold")
    .text("MONEDERO NUTRISER", titleX, y + 9 * s, { width: titleW, lineBreak: false });

  doc.fillColor("#888888")
    .fontSize(5 * s)
    .font("Helvetica")
    .text("aesthetic & nutrition", titleX, y + 17 * s, { width: titleW, lineBreak: false });

  // ── QR Code ───────────────────────────────────────────────────────────────
  const qrPad = 3 * s;
  const qrSize = 52 * s;
  const qrX = x + 10 * s;
  const qrY = y + 30 * s;

  // Fondo blanco del QR
  doc.roundedRect(qrX - qrPad, qrY - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2, 3 * s)
    .fill(WHITE);

  if (qrBuf) {
    doc.image(qrBuf, qrX, qrY, { width: qrSize, height: qrSize });
  }

  // ── Nombre del paciente ───────────────────────────────────────────────────
  const dataX = qrX + qrSize + qrPad * 2 + 4 * s;
  const dataW = w - (dataX - x) - 8 * s;
  const nameY = qrY + 4 * s;

  doc.fillColor(WHITE)
    .fontSize(8 * s)
    .font("Helvetica-Bold")
    .text(card.patientName.toUpperCase(), dataX, nameY, {
      width: dataW,
      lineBreak: false,
      ellipsis: true,
    });

  // ── Número de monedero ────────────────────────────────────────────────────
  doc.fillColor("#888888")
    .fontSize(6 * s)
    .font("Courier")
    .text(card.walletNumber, dataX, nameY + 13 * s, {
      width: dataW,
      lineBreak: false,
    });

  // ── Banda dorada inferior ─────────────────────────────────────────────────
  const bandH = 14 * s;
  const bandY = y + h - bandH;

  doc.rect(x, bandY, w, bandH).fill(GOLD);

  // Texto izquierdo en la banda
  doc.fillColor(BLACK)
    .fontSize(4.5 * s)
    .font("Helvetica-Bold")
    .text("NUTRISERPV.COM/MONEDERO", x + 8 * s, bandY + bandH / 2 - 3 * s, {
      width: w * 0.55,
      lineBreak: false,
    });

  // Texto derecho en la banda
  doc.fillColor("rgba(0,0,0,0.6)")
    .fontSize(4 * s)
    .font("Helvetica")
    .text("Valida solo en Nutriser PV", x + w * 0.55, bandY + bandH / 2 - 2.5 * s, {
      width: w * 0.42,
      align: "right",
      lineBreak: false,
    });

  doc.restore();
}
