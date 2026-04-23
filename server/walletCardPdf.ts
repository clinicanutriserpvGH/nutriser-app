/**
 * walletCardPdf.ts
 *
 * Genera un PDF con la tarjeta del Monedero Nutriser usando PDFKit.
 * Formato CR-80: 85.5mm x 54mm (tarjeta de crédito estándar).
 *
 * Diseño premium (igual que NutriserWalletCard en React):
 *  - Fondo blanco perla con borde dorado
 *  - Logo + "MONEDERO NUTRISER" centrado arriba con líneas decorativas
 *  - "aesthetic & nutrition" en cursiva debajo
 *  - Zona central: QR con borde dorado | separador | Nombre + CÓDIGO + número
 *  - Silueta dorada grande a la derecha
 *  - URL con ícono de globo centrado abajo
 *  - SIN badge ACTIVA/INACTIVA (tarjeta física)
 *  - SIN saldo (tarjeta física)
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
const GOLD       = "#C5A55A";
const GOLD_DARK  = "#8B6914";
const GOLD_MID   = "#B8963E";
const WHITE      = "#FFFFFF";
const DARK_BROWN = "#3a2200";

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

  let logoBuffer: Buffer | null = null;
  try {
    logoBuffer = await fetchImage(
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png"
    );
  } catch { logoBuffer = null; }

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
  const s = w / CARD_W;

  doc.save();

  // ── Fondo blanco perla ────────────────────────────────────────────────────
  doc.roundedRect(x, y, w, h, 6 * s).fill(WHITE);

  // ── Borde dorado ──────────────────────────────────────────────────────────
  doc.roundedRect(x + 0.5 * s, y + 0.5 * s, w - 1 * s, h - 1 * s, 6 * s)
    .lineWidth(1 * s)
    .stroke(GOLD);

  // ── Zonas (proporciones fijas) ────────────────────────────────────────────
  // Header: 34%  |  Central: 48%  |  Footer: 18%
  const headerH = h * 0.34;
  const footerH = h * 0.18;
  const midY    = y + headerH;
  const midH    = h - headerH - footerH;
  const footerY = y + h - footerH;

  // ── Silueta dorada (derecha, zona central+header) ─────────────────────────
  if (siluetaBuf) {
    const silH = midH * 0.88;
    const silW = silH; // cuadrado
    const silX = x + w - silW - 3 * s;
    const silY = midY + (midH - silH) / 2;
    doc.save();
    doc.opacity(0.85);
    doc.image(siluetaBuf, silX, silY, { width: silW, height: silH });
    doc.restore();
  }

  // ── HEADER: logo + MONEDERO NUTRISER + líneas + aesthetic & nutrition ─────
  const logoSize = headerH * 0.30;
  const logoX    = x + (w - logoSize) / 2;
  const logoY    = y + headerH * 0.08;
  if (logoBuf) {
    doc.image(logoBuf, logoX, logoY, { width: logoSize, height: logoSize });
  }

  // "MONEDERO NUTRISER"
  const titleY = logoY + logoSize + 2 * s;
  doc.fillColor(GOLD_DARK)
    .fontSize(9 * s)
    .font("Helvetica-Bold")
    .text("MONEDERO NUTRISER", x, titleY, {
      width: w,
      align: "center",
      lineBreak: false,
      characterSpacing: 1.5 * s,
    });

  // Líneas decorativas + "aesthetic & nutrition"
  const subY = titleY + 11 * s;
  const lineW = 22 * s;
  const centerX = x + w / 2;
  // Línea izquierda
  doc.moveTo(centerX - lineW - 28 * s, subY + 2.5 * s)
    .lineTo(centerX - 28 * s, subY + 2.5 * s)
    .lineWidth(0.6 * s)
    .stroke(GOLD);
  // Línea derecha
  doc.moveTo(centerX + 28 * s, subY + 2.5 * s)
    .lineTo(centerX + lineW + 28 * s, subY + 2.5 * s)
    .lineWidth(0.6 * s)
    .stroke(GOLD);

  doc.fillColor(GOLD_MID)
    .fontSize(5.5 * s)
    .font("Helvetica-Oblique")
    .text("aesthetic & nutrition", x, subY, {
      width: w,
      align: "center",
      lineBreak: false,
      characterSpacing: 1 * s,
    });

  // ── ZONA CENTRAL: QR | separador | Nombre + Código ────────────────────────
  const pad   = 6 * s;
  const midW  = w * 0.60; // zona izquierda (sin silueta)

  // QR
  const qrSize = Math.min(midH - pad * 2, midW * 0.42);
  const qrX    = x + pad;
  const qrY    = midY + (midH - qrSize) / 2;
  const qrPad  = 2.5 * s;

  doc.roundedRect(qrX - qrPad, qrY - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2, 3 * s)
    .fill(WHITE);
  doc.roundedRect(qrX - qrPad, qrY - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2, 3 * s)
    .lineWidth(0.8 * s)
    .stroke(GOLD);

  if (qrBuf) {
    doc.image(qrBuf, qrX, qrY, { width: qrSize, height: qrSize });
  }

  // Separador vertical dorado
  const sepX = qrX + qrSize + qrPad + 5 * s;
  doc.moveTo(sepX, midY + pad)
    .lineTo(sepX, midY + midH - pad)
    .lineWidth(0.7 * s)
    .stroke(GOLD);

  // Nombre + CÓDIGO + número
  const textX = sepX + 5 * s;
  const textW = midW - textX + x;

  // Nombre
  const nameStr = card.patientName.toUpperCase();
  doc.fillColor(DARK_BROWN)
    .fontSize(8.5 * s)
    .font("Helvetica-Bold")
    .text(nameStr, textX, midY + midH * 0.18, {
      width: textW,
      lineBreak: false,
      ellipsis: true,
    });

  // Línea separadora bajo el nombre
  doc.moveTo(textX, midY + midH * 0.38)
    .lineTo(textX + textW * 0.7, midY + midH * 0.38)
    .lineWidth(0.5 * s)
    .stroke(GOLD);

  // Label "CÓDIGO"
  doc.fillColor(GOLD_MID)
    .fontSize(4.5 * s)
    .font("Helvetica-Bold")
    .text("CÓDIGO", textX, midY + midH * 0.44, {
      width: textW,
      lineBreak: false,
      characterSpacing: 0.8 * s,
    });

  // Número de monedero
  doc.fillColor(DARK_BROWN)
    .fontSize(7 * s)
    .font("Courier-Bold")
    .text(card.walletNumber, textX, midY + midH * 0.58, {
      width: textW,
      lineBreak: false,
    });

  // ── FOOTER: ícono globo + URL ─────────────────────────────────────────────
  // Línea separadora superior del footer
  doc.moveTo(x + 8 * s, footerY)
    .lineTo(x + w - 8 * s, footerY)
    .lineWidth(0.5 * s)
    .stroke(GOLD + "88");

  // URL centrada
  const urlY = footerY + (footerH - 5.5 * s) / 2;
  doc.fillColor(GOLD_DARK)
    .fontSize(5.5 * s)
    .font("Helvetica-Bold")
    .text("nutriserpv.com/monedero", x, urlY, {
      width: w,
      align: "center",
      lineBreak: false,
      characterSpacing: 0.5 * s,
    });

  doc.restore();
}
