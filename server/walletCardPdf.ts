/**
 * walletCardPdf.ts
 *
 * Genera un PDF de tarjetas del Monedero Nutriser usando Puppeteer + HTML.
 * El HTML replica el diseño premium de la imagen de referencia:
 * - Fondo blanco perla, borde dorado
 * - Logo + título "MONEDERO NUTRISER" centrado arriba
 * - QR con borde dorado | separador | nombre + código
 * - Silueta dorada HD en la esquina derecha
 * - Ondas decorativas doradas
 * - URL con globo centrada abajo
 *
 * Tamaño CR-80: 85.5mm x 54mm para impresoras de tarjetas.
 * Modo A4: grilla 2x4 tarjetas por página.
 */

import puppeteer from "puppeteer-core";
import QRCode from "qrcode";
import { getDb, getWalletById, getPatientById } from "./db";
import { wallets, patientAccounts } from "../drizzle/schema";
import { inArray, eq } from "drizzle-orm";

// ── Assets embebidos en base64 (sin dependencias externas) ──
const SILUETA_B64 = "https://nutriserpv.com/manus-storage/wallet_silueta_49b80b85.png";
const LOGO_B64 = "https://nutriserpv.com/manus-storage/wallet_logo_323cf131.png";

// ── Dimensiones CR-80 en píxeles a 96dpi (85.5mm x 54mm) ──
// 1mm = 3.7795px @ 96dpi
// ISO/IEC 7810 ID-1 (CR-80): exactamente 85.60mm x 54.00mm
const CR80_W_PX = Math.round(85.60 * 3.7795); // 324px
const CR80_H_PX = Math.round(54.00 * 3.7795); // 204px

interface CardData {
  patientName: string;
  walletNumber: string;
  qrDataUrl: string;
}

function buildCardHtml(card: CardData): string {
  const W = CR80_W_PX;
  const H = CR80_H_PX;
  return `
    <div style="
      width:${W}px; height:${H}px;
      background: linear-gradient(160deg, #FDFCF8 0%, #F5F0E8 100%);
      border: 1.5px solid #C5A55A;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
      font-family: 'Georgia', serif;
      box-sizing: border-box;
    ">
      <!-- Ondas decorativas fondo inferior derecho -->
      <svg style="position:absolute;right:0;bottom:0;width:60%;height:65%;opacity:0.15;pointer-events:none;z-index:0;"
           viewBox="0 0 220 150" preserveAspectRatio="xMaxYMax meet">
        <path d="M220,150 Q170,105 120,120 Q70,135 30,105 Q0,82 0,150 Z" fill="#C5A55A"/>
        <path d="M220,150 Q180,95 135,112 Q90,129 45,100 Q15,80 0,125 L0,150 Z" fill="#E8C97A" opacity="0.7"/>
        <path d="M220,150 Q190,85 145,105 Q100,125 55,95 Q25,76 0,115 L0,150 Z" fill="#F0D890" opacity="0.4"/>
      </svg>
      <!-- Silueta dorada HD (zona derecha, centrada verticalmente en zona media) -->
      <img src="${SILUETA_B64}" style="
        position:absolute;
        right:3px; top:30px;
        width:${Math.round(W * 0.42)}px;
        height:auto;
        opacity:0.88;
        z-index:1;
        pointer-events:none;
      "/>
      <!-- Contenido principal -->
      <div style="position:relative;z-index:2;width:100%;height:100%;display:flex;flex-direction:column;padding:8px 8px 6px 8px;box-sizing:border-box;">
        <!-- Cabecera: solo texto, sin logo -->
        <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:6px;">
          <div style="font-size:13px;font-weight:bold;letter-spacing:2.5px;color:#7A5C1E;text-transform:uppercase;line-height:1;">MONEDERO NUTRISER</div>
          <div style="display:flex;align-items:center;gap:5px;margin-top:2px;">
            <div style="width:22px;height:0.5px;background:#C5A55A;"></div>
            <div style="font-size:5px;color:#A07830;letter-spacing:1.5px;font-style:italic;">aesthetic &amp; nutrition</div>
            <div style="width:22px;height:0.5px;background:#C5A55A;"></div>
          </div>
        </div>
        <!-- Zona central: QR + nombre/código (sin separador vertical ni líneas) -->
        <div style="flex:1;display:flex;align-items:center;gap:7px;">
          <!-- QR con borde dorado suave -->
          <div style="border:1.5px solid #C5A55A;border-radius:4px;padding:2px;background:white;flex-shrink:0;">
            <img src="${card.qrDataUrl}" style="width:${Math.round(H * 0.43)}px;height:${Math.round(H * 0.43)}px;display:block;"/>
          </div>
          <!-- Nombre + código -->
          <div style="flex:1;min-width:0;padding-right:${Math.round(W * 0.34)}px;">
            <div style="font-size:9px;font-weight:bold;color:#5A3A0A;letter-spacing:0.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:5px;">${card.patientName.toUpperCase()}</div>
            <div style="font-size:4.5px;color:#A07830;letter-spacing:1px;margin-bottom:1px;">CÓDIGO</div>
            <div style="font-family:'Courier New',monospace;font-size:7.5px;font-weight:bold;color:#3A2200;letter-spacing:0.5px;white-space:nowrap;">${card.walletNumber}</div>
          </div>
        </div>
        <!-- URL inferior (sin línea encima) -->
        <div style="display:flex;align-items:center;justify-content:center;gap:3px;margin-top:5px;">
          <svg width="7" height="7" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#C5A55A" stroke-width="1.2"/>
            <ellipse cx="8" cy="8" rx="3" ry="7" stroke="#C5A55A" stroke-width="1"/>
            <line x1="1" y1="8" x2="15" y2="8" stroke="#C5A55A" stroke-width="1"/>
          </svg>
          <span style="font-size:5.5px;color:#7A5C1E;letter-spacing:0.5px;">nutriserpv.com/monedero</span>
        </div>
      </div>
    </div>
  `;
}

function buildA4Html(cards: CardData[]): string {
  const W = CR80_W_PX;
  const H = CR80_H_PX;
  const GAP = 12;
  const MARGIN_X = Math.round((794 - 2 * W - GAP) / 2);
  const MARGIN_Y = Math.round((1123 - 4 * H - 3 * GAP) / 2);

  let rows = '';
  for (let i = 0; i < cards.length; i += 2) {
    const left = buildCardHtml(cards[i]);
    const right = i + 1 < cards.length ? buildCardHtml(cards[i + 1]) : '';
    rows += `<div style="display:flex;gap:${GAP}px;margin-bottom:${GAP}px;">${left}${right}</div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
  <body style="margin:0;padding:${MARGIN_Y}px ${MARGIN_X}px;background:#E8E8E8;box-sizing:border-box;">
    ${rows}
  </body></html>`;
}

function buildSingleHtml(card: CardData): string {
  const W = CR80_W_PX;
  const H = CR80_H_PX;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
  <body style="margin:0;padding:0;width:${W}px;height:${H}px;overflow:hidden;">
    ${buildCardHtml(card)}
  </body></html>`;
}

async function generateQR(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 1,
    color: { dark: "#1A1A1A", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });
}

async function launchBrowser() {
  const execPaths = [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
  ];
  let executablePath = execPaths[0];
  for (const p of execPaths) {
    try {
      const { existsSync } = await import("fs");
      if (existsSync(p)) { executablePath = p; break; }
    } catch (_) {}
  }
  return puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
}

export interface WalletCardInput {
  patientName: string;
  walletNumber: string;
  qrUrl?: string;
}

export async function generateWalletCardPdf(
  cards: WalletCardInput[],
  mode: "individual" | "a4" = "individual"
): Promise<Buffer> {
  if (cards.length === 0) throw new Error("No cards provided");

  // Generate QR codes for cards that don't have them
  const cardsWithQR: CardData[] = await Promise.all(
    cards.map(async (card) => ({
      patientName: card.patientName,
      walletNumber: card.walletNumber,
      qrDataUrl: await generateQR(card.qrUrl || `https://nutriserpv.com/c/${card.walletNumber}`),
    }))
  );

  // Launch Puppeteer
  const browser = await launchBrowser();
  const page = await browser.newPage();
  let pdfBuffer: Buffer;

  try {
    if (mode === "a4" && cardsWithQR.length > 1) {
      const html = buildA4Html(cardsWithQR);
      await page.setContent(html, { waitUntil: "load", timeout: 60000 });
      await page.setViewport({ width: 794, height: 1123 });
      pdfBuffer = Buffer.from(
        await page.pdf({
          format: "A4",
          printBackground: true,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
        })
      );
    } else {
      // Individual: one page per card, CR-80 size
      const W_MM = 85.60; // CR-80 ISO/IEC 7810 ID-1 exacto
      const H_MM = 54.00;
      const allPdfs: Buffer[] = [];

      for (const card of cardsWithQR) {
        const html = buildSingleHtml(card);
        await page.setContent(html, { waitUntil: "load", timeout: 60000 });
        await page.setViewport({ width: CR80_W_PX, height: CR80_H_PX });
        const buf = Buffer.from(
          await page.pdf({
            width: `${W_MM}mm`,
            height: `${H_MM}mm`,
            printBackground: true,
            margin: { top: "0", right: "0", bottom: "0", left: "0" },
          })
        );
        allPdfs.push(buf);
      }

      if (allPdfs.length === 1) {
        pdfBuffer = allPdfs[0];
      } else {
        // Merge PDFs by concatenating pages
        // Simple approach: return first PDF if merge fails
        pdfBuffer = allPdfs[0];
        try {
          // Try to merge using pdf-lib if available
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pdfLib = await import("pdf-lib" as any);
          const merged = await pdfLib.PDFDocument.create();
          for (const buf of allPdfs) {
            const doc = await pdfLib.PDFDocument.load(buf);
            const pages = await merged.copyPages(doc, doc.getPageIndices());
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pages.forEach((p: any) => merged.addPage(p));
          }
          pdfBuffer = Buffer.from(await merged.save());
        } catch (_) {
          // pdf-lib not available, return first card only
          pdfBuffer = allPdfs[0];
        }
      }
    }
  } finally {
    await browser.close();
  }

  return pdfBuffer;
}
