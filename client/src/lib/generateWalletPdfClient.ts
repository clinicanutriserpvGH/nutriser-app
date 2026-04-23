/**
 * generateWalletPdfClient.ts
 *
 * Genera un PDF de tarjetas del Monedero Nutriser directamente en el navegador
 * usando html2canvas + jsPDF. No requiere servidor ni Puppeteer.
 *
 * Formato CR-80: 85.5mm x 54mm (tarjeta de crédito estándar).
 * - Modo individual (1 tarjeta): página exacta CR-80
 * - Modo A4 (2-8 tarjetas): página A4 con grilla 2×4
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface WalletPdfCardData {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
}

// Dimensiones CR-80 en mm
const CR80_W = 85.5;
const CR80_H = 54;

// DPI para renderizado de alta calidad
const RENDER_SCALE = 3;

/**
 * Renderiza un elemento DOM a canvas con alta resolución
 */
async function elementToCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(el, {
    scale: RENDER_SCALE,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#FFFFFF",
    logging: false,
    imageTimeout: 15000,
    onclone: (doc) => {
      // Asegurar que los estilos de impresión se apliquen
      const style = doc.createElement("style");
      style.textContent = `
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        img { max-width: none !important; }
      `;
      doc.head.appendChild(style);
    },
  });
}

/**
 * Genera el PDF de tarjetas del monedero en el cliente.
 * @param cards Lista de tarjetas a incluir
 * @param cardElements Lista de elementos DOM que representan cada tarjeta (ya renderizados)
 * @param mode "individual" (CR-80) | "a4" (A4 con grilla)
 */
export async function generateWalletPdfFromElements(
  cardElements: HTMLElement[],
  mode: "individual" | "a4" = "individual"
): Promise<void> {
  if (cardElements.length === 0) return;

  if (mode === "individual" || cardElements.length === 1) {
    // Una tarjeta por página CR-80
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [CR80_W, CR80_H],
    });

    for (let i = 0; i < cardElements.length; i++) {
      if (i > 0) pdf.addPage([CR80_W, CR80_H], "landscape");
      const canvas = await elementToCanvas(cardElements[i]);
      const imgData = canvas.toDataURL("image/png", 1.0);
      pdf.addImage(imgData, "PNG", 0, 0, CR80_W, CR80_H, undefined, "FAST");
    }

    const filename =
      cardElements.length === 1
        ? `tarjeta-nutriser.pdf`
        : `tarjetas-nutriser-${cardElements.length}.pdf`;
    pdf.save(filename);
  } else {
    // Modo A4: grilla 2×4 (máximo 8 tarjetas por página)
    const A4_W = 210;
    const A4_H = 297;
    const GAP = 5;
    const MARGIN_X = (A4_W - 2 * CR80_W - GAP) / 2; // ~17mm
    const MARGIN_Y = (A4_H - 4 * CR80_H - 3 * GAP) / 2; // ~25.5mm

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Fondo gris claro para la hoja A4
    pdf.setFillColor(240, 240, 240);
    pdf.rect(0, 0, A4_W, A4_H, "F");

    for (let i = 0; i < Math.min(cardElements.length, 8); i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = MARGIN_X + col * (CR80_W + GAP);
      const y = MARGIN_Y + row * (CR80_H + GAP);

      const canvas = await elementToCanvas(cardElements[i]);
      const imgData = canvas.toDataURL("image/png", 1.0);
      pdf.addImage(imgData, "PNG", x, y, CR80_W, CR80_H, undefined, "FAST");
    }

    // Si hay más de 8 tarjetas, agregar páginas adicionales
    if (cardElements.length > 8) {
      const remaining = cardElements.slice(8);
      // Recursión para páginas adicionales
      for (let pageStart = 0; pageStart < remaining.length; pageStart += 8) {
        pdf.addPage("a4", "portrait");
        pdf.setFillColor(240, 240, 240);
        pdf.rect(0, 0, A4_W, A4_H, "F");

        const pageCards = remaining.slice(pageStart, pageStart + 8);
        for (let i = 0; i < pageCards.length; i++) {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = MARGIN_X + col * (CR80_W + GAP);
          const y = MARGIN_Y + row * (CR80_H + GAP);
          const canvas = await elementToCanvas(pageCards[i]);
          const imgData = canvas.toDataURL("image/png", 1.0);
          pdf.addImage(imgData, "PNG", x, y, CR80_W, CR80_H, undefined, "FAST");
        }
      }
    }

    pdf.save(`tarjetas-nutriser-${cardElements.length}.pdf`);
  }
}
