import jsPDF from "jspdf";
import QRCode from "qrcode";
// Silueta image loaded from CDN
const SILUETA_CDN_URL = "/manus-storage/silueta_cropped_60db8b78.png";

async function loadImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export interface WalletPdfCardData {
  patientName: string;
  walletNumber: string;
  qrUrl: string;
}

const W = 85.60;
const H = 54.00;

async function makeQR(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 300, margin: 1,
    color: { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel: "H",
  });
}

async function drawCard(pdf: jsPDF, card: WalletPdfCardData, x: number, y: number, siluetaDataUrl?: string) {
  const qrImg = await makeQR(card.qrUrl);
  // Fondo
  pdf.setFillColor(254, 254, 252);
  pdf.rect(x, y, W, H, "F");
  // Borde dorado recto
  pdf.setDrawColor(212, 175, 96);
  pdf.setLineWidth(0.35);
  pdf.rect(x, y, W, H, "S");
  const cx = x + W / 2;
  // Titulo
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.8);
  pdf.setTextColor(139, 105, 20);
  pdf.text("MONEDERO NUTRISER", cx, y + 7.5, { align: "center", charSpace: 1.0 });
  // Subtitulo sin lineas
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(4.2);
  pdf.setTextColor(184, 150, 62);
  pdf.text("aesthetic & nutrition", cx, y + 12.5, { align: "center", charSpace: 0.6 });
  // Silueta recortada (233x887px ratio 0.263)
  const silH = H * 0.65;
  const silW = silH * 0.263;
  const silX = x + W - silW - 3.5;
  const silY = y + H * 0.12;
  try { if (siluetaDataUrl) pdf.addImage(siluetaDataUrl, "PNG", silX, silY, silW, silH); } catch (_) {}
  // Zona central
  const zTop    = y + H * 0.30;
  const zBottom = y + H * 0.82;
  const zMid    = zTop + (zBottom - zTop) / 2;
  // QR
  const qrSize = 21;
  const qrX    = x + 4.5;
  const qrY    = zMid - qrSize / 2;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.4);
  pdf.rect(qrX - 1.2, qrY - 1.2, qrSize + 2.4, qrSize + 2.4, "FD");
  pdf.addImage(qrImg, "PNG", qrX, qrY, qrSize, qrSize);
  // Separador vertical
  const sepX = x + 33;
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.25);
  pdf.line(sepX, zTop + 3, sepX, zBottom - 3);
  // Nombre
  const nameX = sepX + 3;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(58, 34, 0);
  const name = card.patientName.length > 14 ? card.patientName.substring(0, 13) + "..." : card.patientName;
  pdf.text(name.toUpperCase(), nameX, zMid - 5, { charSpace: 0.2 });
  // CODIGO
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(4.5);
  pdf.setTextColor(184, 150, 62);
  pdf.text("CODIGO", nameX, zMid + 2, { charSpace: 0.5 });
  // Numero
  pdf.setFont("courier", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(58, 34, 0);
  pdf.text(card.walletNumber, nameX, zMid + 7, { charSpace: 0.3 });
  // Linea pie
  pdf.setDrawColor(197, 165, 90);
  pdf.setLineWidth(0.18);
  pdf.line(x + 3, zBottom, x + W - 3, zBottom);
  // Icono globo
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
  // Load silueta image from CDN once
  let siluetaDataUrl: string | undefined;
  try { siluetaDataUrl = await loadImageAsDataUrl(SILUETA_CDN_URL); } catch (_) {}
  let pdf: jsPDF;
  if (mode === "a4" && cards.length > 1) {
    pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    for (let i = 0; i < cards.length; i++) {
      if (i > 0 && i % 8 === 0) pdf.addPage();
      const col = i % 2;
      const row = Math.floor(i / 2) % 4;
      await drawCard(pdf, cards[i], 10 + col * (W + 5), 10 + row * (H + 5), siluetaDataUrl);
    }
  } else {
    pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [W, H] });
    await drawCard(pdf, cards[0], 0, 0, siluetaDataUrl);
    for (let i = 1; i < cards.length; i++) {
      pdf.addPage([W, H], "landscape");
      await drawCard(pdf, cards[i], 0, 0, siluetaDataUrl);
    }
  }
  const fileName = cards.length === 1
    ? "tarjeta-" + cards[0].walletNumber + ".pdf"
    : "tarjetas-nutriser-" + cards.length + ".pdf";

  // Subir PDF a S3 via tRPC para obtener URL HTTPS real (funciona en iOS WebView)
  const pdfBase64 = pdf.output("datauristring").split(",")[1];
  try {
    const res = await fetch("/api/trpc/wallet.uploadPdf", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ json: { pdfBase64, fileName } }),
    });
    const data = await res.json();
    const url: string = data?.result?.data?.json?.url;
    if (url) {
      // Abrir URL HTTPS real — funciona en Safari, WebView y cualquier navegador
      window.location.href = url;
      return;
    }
  } catch (_) { /* fallback abajo */ }

  // Fallback: descarga directa con blob (funciona en desktop/Android)
  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = pdfUrl;
  a.download = fileName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(pdfUrl); a.remove(); }, 3000);
}

export async function generateWalletPdfFromElements(
  _e: HTMLElement[],
  _m: "individual" | "a4"
): Promise<void> {
  throw new Error("Usa generateWalletPdf");
}
