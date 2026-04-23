/**
 * walletCardPdf.ts
 *
 * Genera un PDF con la tarjeta del Monedero Nutriser usando Puppeteer.
 * Renderiza exactamente el mismo diseño que NutriserWalletCard en React.
 *
 * Formato CR-80: 85.5mm x 54mm (tarjeta de crédito estándar).
 * - Modo individual: página exacta CR-80 para impresoras de tarjetas
 * - Modo hoja A4: 8 tarjetas por página en grilla 2×4
 */

import puppeteer from "puppeteer";
import QRCode from "qrcode";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const SILUETA_URL =
  "https://nutriserpv.com/manus-storage/nutriser-silueta_f6738ee7.png";

export interface WalletPdfCard {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
}

function buildCardHtml(card: WalletPdfCard, qrDataUrl: string, scale: number = 1): string {
  const w = 85.5 * scale;
  const h = 54 * scale;
  const unit = scale > 1 ? "mm" : "mm";

  return `
    <div class="card" style="
      width: ${w}mm;
      height: ${h}mm;
      position: relative;
      border-radius: ${2.5 * scale}mm;
      overflow: hidden;
      background: linear-gradient(135deg, #FEFEFE 0%, #FAF8F3 60%, #F5F0E8 100%);
      border: ${0.4 * scale}mm solid #C5A55A;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    ">
      <!-- Ondas decorativas SVG fondo -->
      <svg viewBox="0 0 200 120" style="
        position: absolute; right: 0; bottom: 0;
        width: 55%; height: 75%;
        opacity: 0.15; pointer-events: none; z-index: 1;
      " preserveAspectRatio="xMaxYMax meet">
        <path d="M200,120 Q160,80 120,100 Q80,120 40,90 Q0,60 0,120 Z" fill="#C5A55A"/>
        <path d="M200,120 Q170,70 130,90 Q90,110 50,80 Q20,60 0,100 L0,120 Z" fill="#E8C97A" opacity="0.6"/>
        <path d="M200,100 Q165,55 125,75 Q85,95 45,65 Q15,45 0,80 L0,120 L200,120 Z" fill="#C5A55A" opacity="0.4"/>
      </svg>

      <!-- Silueta dorada -->
      <img src="${SILUETA_URL}" alt="" style="
        position: absolute;
        right: ${0.8 * scale}mm;
        top: 8%;
        height: 74%;
        width: auto;
        max-width: 36%;
        object-fit: contain;
        object-position: right center;
        opacity: 0.88;
        z-index: 2;
        filter: sepia(1) saturate(3) hue-rotate(2deg) brightness(0.85);
      "/>

      <!-- CABECERA: logo + título -->
      <div style="
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 34%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 3;
        padding-top: ${0.8 * scale}mm;
        gap: ${0.3 * scale}mm;
      ">
        <img src="${LOGO_URL}" alt="Nutriser" style="
          width: ${7 * scale}mm;
          height: ${7 * scale}mm;
          object-fit: contain;
        "/>
        <div style="
          color: #8B6914;
          font-weight: 900;
          font-size: ${3.2 * scale}mm;
          letter-spacing: ${0.6 * scale}mm;
          text-transform: uppercase;
          line-height: 1.1;
          margin-top: ${0.5 * scale}mm;
        ">MONEDERO NUTRISER</div>
        <div style="
          display: flex;
          align-items: center;
          gap: ${1.5 * scale}mm;
          margin-top: ${0.3 * scale}mm;
        ">
          <div style="height: ${0.2 * scale}mm; width: ${6 * scale}mm; background: linear-gradient(90deg, transparent, #C5A55A);"></div>
          <span style="color: #B8963E; font-size: ${1.8 * scale}mm; letter-spacing: ${0.4 * scale}mm; font-style: italic;">
            aesthetic &amp; nutrition
          </span>
          <div style="height: ${0.2 * scale}mm; width: ${6 * scale}mm; background: linear-gradient(90deg, #C5A55A, transparent);"></div>
        </div>
      </div>

      <!-- ZONA CENTRAL: QR | separador | Nombre + Código -->
      <div style="
        position: absolute;
        top: 34%; bottom: 18%;
        left: 0; right: 38%;
        display: flex;
        align-items: center;
        padding: 0 ${2.5 * scale}mm;
        gap: ${2 * scale}mm;
        z-index: 3;
      ">
        <!-- QR con borde dorado -->
        <div style="
          background: #FFFFFF;
          border-radius: ${1.5 * scale}mm;
          padding: ${0.8 * scale}mm;
          flex-shrink: 0;
          border: ${0.4 * scale}mm solid #C5A55A;
          box-shadow: 0 ${0.5 * scale}mm ${2 * scale}mm rgba(197,165,90,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <img src="${qrDataUrl}" style="
            width: ${14 * scale}mm;
            height: ${14 * scale}mm;
            display: block;
          "/>
        </div>

        <!-- Separador vertical -->
        <div style="
          width: ${0.2 * scale}mm;
          align-self: stretch;
          background: linear-gradient(180deg, transparent, #C5A55A 30%, #C5A55A 70%, transparent);
          margin: ${1 * scale}mm 0;
          flex-shrink: 0;
        "></div>

        <!-- Nombre + Código -->
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: ${1 * scale}mm;">
          <div style="
            color: #3a2200;
            font-weight: 900;
            font-size: ${3.2 * scale}mm;
            text-transform: uppercase;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            letter-spacing: ${0.1 * scale}mm;
            line-height: 1.1;
          ">${card.patientName || "---"}</div>
          <div style="height: ${0.2 * scale}mm; background: linear-gradient(90deg, #C5A55A, transparent); width: 80%;"></div>
          <div>
            <div style="
              color: #B8963E;
              font-size: ${1.5 * scale}mm;
              letter-spacing: ${0.4 * scale}mm;
              font-weight: 700;
              text-transform: uppercase;
              margin-bottom: ${0.3 * scale}mm;
            ">CÓDIGO</div>
            <div style="
              color: #3a2200;
              font-family: 'Courier New', monospace;
              font-size: ${2.8 * scale}mm;
              letter-spacing: ${0.35 * scale}mm;
              font-weight: 700;
              white-space: nowrap;
            ">${card.walletNumber || "---"}</div>
          </div>
        </div>
      </div>

      <!-- PIE: URL con ícono de globo -->
      <div style="
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 18%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: ${1.2 * scale}mm;
        z-index: 3;
        border-top: ${0.2 * scale}mm solid rgba(197,165,90,0.35);
        background: rgba(255,255,255,0.6);
      ">
        <svg viewBox="0 0 16 16" style="width: ${2.5 * scale}mm; height: ${2.5 * scale}mm; flex-shrink: 0;" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#C5A55A" stroke-width="1.2"/>
          <ellipse cx="8" cy="8" rx="3" ry="7" stroke="#C5A55A" stroke-width="1"/>
          <line x1="1" y1="8" x2="15" y2="8" stroke="#C5A55A" stroke-width="1"/>
          <line x1="2" y1="4.5" x2="14" y2="4.5" stroke="#C5A55A" stroke-width="0.8"/>
          <line x1="2" y1="11.5" x2="14" y2="11.5" stroke="#C5A55A" stroke-width="0.8"/>
        </svg>
        <span style="
          color: #8B6914;
          font-size: ${1.9 * scale}mm;
          letter-spacing: ${0.25 * scale}mm;
          font-weight: 600;
        ">nutriserpv.com/monedero</span>
      </div>
    </div>
  `;
}

function buildSinglePageHtml(card: WalletPdfCard, qrDataUrl: string): string {
  const cardHtml = buildCardHtml(card, qrDataUrl, 1);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 85.5mm;
    height: 54mm;
    overflow: hidden;
    background: transparent;
  }
  .card { display: block; }
  @media print {
    html, body { width: 85.5mm; height: 54mm; }
  }
</style>
</head>
<body>${cardHtml}</body>
</html>`;
}

function buildA4PageHtml(cards: WalletPdfCard[], qrDataUrls: string[]): string {
  // A4: 210mm × 297mm, 8 tarjetas en grilla 2×4
  // Margen: 10mm, gap: 5mm
  // Ancho tarjeta: (210 - 20 - 5) / 2 = 92.5mm → escalar a CR-80 ratio
  // Usamos escala 1 (85.5mm) con márgenes calculados para centrar
  const marginX = (210 - 2 * 85.5 - 5) / 2; // ~17mm
  const marginY = (297 - 4 * 54 - 3 * 5) / 2; // ~25.5mm

  const cardsHtml = cards.slice(0, 8).map((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const left = marginX + col * (85.5 + 5);
    const top = marginY + row * (54 + 5);
    return `
      <div style="position: absolute; left: ${left}mm; top: ${top}mm;">
        ${buildCardHtml(card, qrDataUrls[i] || "", 1)}
      </div>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 210mm;
    height: 297mm;
    overflow: hidden;
    background: #F0F0F0;
  }
  .page {
    position: relative;
    width: 210mm;
    height: 297mm;
    background: #F0F0F0;
  }
  @media print {
    html, body { width: 210mm; height: 297mm; }
    .page { background: white; }
  }
</style>
</head>
<body>
  <div class="page">${cardsHtml}</div>
</body>
</html>`;
}

export async function generateWalletCardPdf(cards: WalletPdfCard[]): Promise<Buffer> {
  // Generar QR data URLs
  const qrDataUrls = await Promise.all(
    cards.map(async (card) => {
      try {
        return await QRCode.toDataURL(card.qrUrl || `https://nutriserpv.com/c/${card.walletNumber}`, {
          type: "image/png",
          width: 300,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#000000", light: "#FFFFFF" },
        });
      } catch {
        return "";
      }
    })
  );

  const isSingle = cards.length === 1;
  const html = isSingle
    ? buildSinglePageHtml(cards[0], qrDataUrls[0])
    : buildA4PageHtml(cards, qrDataUrls);

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Esperar a que las imágenes carguen
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });

    const pdfBuffer = await page.pdf(
      isSingle
        ? {
            width: "85.5mm",
            height: "54mm",
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          }
        : {
            format: "A4",
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          }
    );

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
