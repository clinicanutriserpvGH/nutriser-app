/**
 * walletCardCanvas.ts
 *
 * Dibuja la tarjeta del Monedero Nutriser directamente en un Canvas HTML.
 * No depende de imágenes externas (evita errores CORS en iOS/Safari).
 * La silueta y el logo se cargan con crossOrigin="anonymous" y se manejan
 * con fallback en caso de fallo.
 *
 * Uso:
 *   const canvas = await drawWalletCardToCanvas({ patientName, walletNumber, qrUrl });
 *   const png = canvas.toDataURL("image/png");
 */

export interface WalletCanvasData {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
}

// Genera un QR como imagen PNG usando la API de QR Server (sin dependencias)
async function generateQRImage(text: string, size: number): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    // API pública de QR que devuelve PNG sin CORS issues
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&ecc=H`;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    setTimeout(() => resolve(null), 5000);
  });
}

// Carga una imagen con crossOrigin="anonymous"
async function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    setTimeout(() => resolve(null), 5000);
  });
}

// Dibuja texto con truncado automático
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) {
  ctx.fillText(text, x, y, maxWidth);
}

// Dibuja un rectángulo con esquinas redondeadas
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Dibuja UNA tarjeta CR-80 en el canvas.
 * Escala: 1 unidad = 1px a 96dpi. La tarjeta mide 323×204px.
 * Para impresión de alta calidad, usar scale=3 → 969×612px.
 */
export async function drawWalletCardToCanvas(
  data: WalletCanvasData,
  scale = 3
): Promise<HTMLCanvasElement> {
  const W = 323 * scale;
  const H = 204 * scale;
  const s = scale; // multiplicador de escala

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Fondo oscuro con degradado ──────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#1A1A1A");
  bgGrad.addColorStop(0.6, "#2a2010");
  bgGrad.addColorStop(1, "#1A1A1A");

  roundRect(ctx, 0, 0, W, H, 10 * s);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // ── Línea dorada superior ───────────────────────────────────────────────
  const topLineGrad = ctx.createLinearGradient(0, 0, W, 0);
  topLineGrad.addColorStop(0, "rgba(197,165,90,0)");
  topLineGrad.addColorStop(0.3, "#C5A55A");
  topLineGrad.addColorStop(0.5, "#E8C97A");
  topLineGrad.addColorStop(0.7, "#C5A55A");
  topLineGrad.addColorStop(1, "rgba(197,165,90,0)");
  ctx.fillStyle = topLineGrad;
  ctx.fillRect(0, 0, W, 2 * s);

  // ── Brillo decorativo esquina superior derecha ──────────────────────────
  const glowGrad = ctx.createRadialGradient(W - 20 * s, 20 * s, 0, W - 20 * s, 20 * s, 80 * s);
  glowGrad.addColorStop(0, "rgba(197,165,90,0.12)");
  glowGrad.addColorStop(1, "rgba(197,165,90,0)");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Cargar imágenes en paralelo ─────────────────────────────────────────
  const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
  const SILUETA_URL = `${window.location.origin}/manus-storage/nutriser-silueta_f6738ee7.png`;
  const qrText = data.qrUrl || `https://nutriserpv.com/c/${data.walletNumber}`;

  const [logoImg, siluetaImg, qrImg] = await Promise.all([
    loadImage(LOGO_URL),
    loadImage(SILUETA_URL),
    generateQRImage(qrText, 72 * s),
  ]);

  // ── Silueta dorada (marca de agua) ──────────────────────────────────────
  if (siluetaImg) {
    const silH = H * 0.78;
    const silW = (siluetaImg.width / siluetaImg.height) * silH;
    ctx.save();
    ctx.globalAlpha = 0.18;
    // Filtro dorado: sepia + saturate + hue-rotate no disponible en Canvas,
    // usamos una aproximación con compositing
    ctx.filter = "sepia(1) saturate(2) brightness(1.2)";
    ctx.drawImage(siluetaImg, W - silW - 8 * s, H - silH - 22 * s, silW, silH);
    ctx.filter = "none";
    ctx.restore();
  } else {
    // Fallback: silueta simplificada dibujada con Canvas (figura femenina abstracta)
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#C5A55A";
    ctx.lineWidth = 2 * s;
    // Cabeza
    ctx.beginPath();
    ctx.arc(W - 55 * s, 50 * s, 12 * s, 0, Math.PI * 2);
    ctx.stroke();
    // Cuerpo
    ctx.beginPath();
    ctx.moveTo(W - 55 * s, 62 * s);
    ctx.bezierCurveTo(W - 70 * s, 90 * s, W - 70 * s, 110 * s, W - 55 * s, 130 * s);
    ctx.bezierCurveTo(W - 40 * s, 110 * s, W - 40 * s, 90 * s, W - 55 * s, 62 * s);
    ctx.stroke();
    ctx.restore();
  }

  // ── Logo Nutriser ───────────────────────────────────────────────────────
  const logoSize = 28 * s;
  if (logoImg) {
    ctx.drawImage(logoImg, 12 * s, 10 * s, logoSize, logoSize);
  } else {
    // Fallback: círculo dorado con "N"
    ctx.fillStyle = "#C5A55A";
    ctx.beginPath();
    ctx.arc(12 * s + logoSize / 2, 10 * s + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1A1A1A";
    ctx.font = `bold ${14 * s}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", 12 * s + logoSize / 2, 10 * s + logoSize / 2);
  }

  // ── Título "MONEDERO NUTRISER" ──────────────────────────────────────────
  const titleX = 12 * s + logoSize + 6 * s;
  ctx.fillStyle = "#C5A55A";
  ctx.font = `900 ${9 * s}px 'Helvetica Neue', Arial, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.letterSpacing = `${0.18 * 9 * s}px`;
  drawText(ctx, "MONEDERO NUTRISER", titleX, 12 * s, W - titleX - 12 * s);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = `${7 * s}px 'Helvetica Neue', Arial, sans-serif`;
  ctx.letterSpacing = `${0.12 * 7 * s}px`;
  drawText(ctx, "aesthetic & nutrition", titleX, 24 * s, W - titleX - 12 * s);
  ctx.letterSpacing = "0px";

  // ── QR Code ─────────────────────────────────────────────────────────────
  const qrPad = 5 * s;
  const qrSize = 72 * s;
  const qrX = 12 * s;
  const qrY = 46 * s;

  // Fondo blanco del QR
  roundRect(ctx, qrX - qrPad, qrY - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2, 6 * s);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  if (qrImg) {
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } else {
    // Fallback: patrón de cuadrícula simulando QR
    ctx.fillStyle = "#000000";
    const cell = qrSize / 10;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillRect(qrX + c * cell, qrY + r * cell, cell, cell);
        }
      }
    }
  }

  // ── Nombre del paciente ─────────────────────────────────────────────────
  const dataX = qrX + qrSize + qrPad * 2 + 4 * s;
  const dataMaxW = W - dataX - 12 * s;
  const nameY = qrY + 8 * s;

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 ${11 * s}px 'Helvetica Neue', Arial, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  drawText(ctx, data.patientName.toUpperCase(), dataX, nameY, dataMaxW);

  // ── Número de monedero ──────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `${9 * s}px 'Courier New', monospace`;
  drawText(ctx, data.walletNumber, dataX, nameY + 16 * s, dataMaxW);

  // ── Banda dorada inferior ───────────────────────────────────────────────
  const bandH = 22 * s;
  const bandY = H - bandH;

  const bandGrad = ctx.createLinearGradient(0, bandY, W, bandY);
  bandGrad.addColorStop(0, "#8B6914");
  bandGrad.addColorStop(0.25, "#C5A55A");
  bandGrad.addColorStop(0.5, "#E8C97A");
  bandGrad.addColorStop(0.75, "#C5A55A");
  bandGrad.addColorStop(1, "#8B6914");
  ctx.fillStyle = bandGrad;
  ctx.fillRect(0, bandY, W, bandH);

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.font = `700 ${6.5 * s}px 'Helvetica Neue', Arial, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  drawText(ctx, "NUTRISERPV.COM/MONEDERO", 12 * s, bandY + bandH / 2, W / 2);

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.font = `${6 * s}px 'Helvetica Neue', Arial, sans-serif`;
  ctx.textAlign = "right";
  drawText(ctx, "Valida solo en Nutriser PV", W - 12 * s, bandY + bandH / 2, W / 2);

  return canvas;
}

/**
 * Genera un canvas con múltiples tarjetas en hoja A4 (2 columnas x 4 filas).
 * A4 a 300dpi = 2480×3508px. Cada tarjeta CR-80 a 300dpi = 1011×638px.
 */
export async function drawWalletSheetToCanvas(
  cards: WalletCanvasData[]
): Promise<HTMLCanvasElement> {
  // A4 a 150dpi para balance calidad/tamaño (2480×3508 / 2)
  const PAGE_W = 1240;
  const PAGE_H = 1754;
  const MARGIN = 50;
  const GAP = 20;
  const CARD_W = Math.floor((PAGE_W - MARGIN * 2 - GAP) / 2);
  const CARD_H = Math.floor(CARD_W * (204 / 323));

  const canvas = document.createElement("canvas");
  canvas.width = PAGE_W;
  canvas.height = PAGE_H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);

  const scale = CARD_W / 323;

  // Renderizar cada tarjeta y colocarla en la hoja
  for (let i = 0; i < Math.min(cards.length, 8); i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN + col * (CARD_W + GAP);
    const y = MARGIN + row * (CARD_H + GAP);

    const cardCanvas = await drawWalletCardToCanvas(cards[i], scale);
    ctx.drawImage(cardCanvas, x, y, CARD_W, CARD_H);
  }

  return canvas;
}
