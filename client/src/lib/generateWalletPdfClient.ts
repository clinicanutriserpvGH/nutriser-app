import jsPDF from "jspdf";
import QRCode from "qrcode";
import { SILUETA_CROPPED_B64 } from "./siluetaCroppedB64";

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

async function drawCard(pdf: jsPDF, card: WalletPdfCardData, x: number, y: number) {
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
  try { pdf.addImage(SILUETA_CROPPED_B64, "PNG", silX, silY, silW, silH); } catch (_) {}
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
  let pdf: jsPDF;
  if (mode === "a4" && cards.length > 1) {
    pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    for (let i = 0; i < cards.length; i++) {
      if (i > 0 && i % 8 === 0) pdf.addPage();
      const col = i % 2;
      const row = Math.floor(i / 2) % 4;
      await drawCard(pdf, cards[i], 10 + col * (W + 5), 10 + row * (H + 5));
    }
  } else {
    pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [W, H] });
    await drawCard(pdf, cards[0], 0, 0);
    for (let i = 1; i < cards.length; i++) {
      pdf.addPage([W, H], "landscape");
      await drawCard(pdf, cards[i], 0, 0);
    }
  }
  const fileName = cards.length === 1
    ? "tarjeta-" + cards[0].walletNumber + ".pdf"
    : "tarjetas-nutriser-" + cards.length + ".pdf";
  const pdfDataUri = pdf.output("datauristring");
  // Pagina HTML con botones accesibles en iOS WebView
  // safe-area-inset-top garantiza que los botones no queden detras del Dynamic Island
  const html = [
    "<!DOCTYPE html><html lang='es'><head>",
    "<meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1.0,viewport-fit=cover'>",
    "<title>Monedero Nutriser</title>",
    "<style>",
    "*{margin:0;padding:0;box-sizing:border-box}",
    "body{background:#111;font-family:-apple-system,sans-serif;min-height:100vh;display:flex;flex-direction:column}",
    ".bar{position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,#C5A55A,#A07830);",
    "padding-top:max(env(safe-area-inset-top),50px);padding-bottom:14px;padding-left:16px;padding-right:16px;",
    "display:flex;gap:12px;justify-content:center;align-items:center;z-index:999;box-shadow:0 3px 12px rgba(0,0,0,.5)}",
    ".btn{display:inline-flex;align-items:center;gap:6px;padding:12px 22px;border-radius:10px;",
    "font-size:15px;font-weight:700;cursor:pointer;border:none;text-decoration:none;-webkit-tap-highlight-color:transparent}",
    ".save{background:white;color:#7A5C1E}",
    ".print{background:#1a1a1a;color:#C5A55A;border:2px solid #C5A55A}",
    ".gap{height:calc(max(env(safe-area-inset-top),50px) + 80px)}",
    ".body{flex:1;display:flex;flex-direction:column;align-items:center;padding:16px;",
    "padding-bottom:max(env(safe-area-inset-bottom),20px)}",
    "embed{width:100%;max-width:600px;height:72vh;border:none;border-radius:8px;background:white}",
    ".tip{color:#888;font-size:13px;text-align:center;margin-top:14px;line-height:1.6;max-width:340px}",
    ".tip b{color:#C5A55A}",
    "</style></head><body>",
    "<div class='bar'>",
    "<a class='btn save' href='" + pdfDataUri + "' download='" + fileName + "'>&#11015; Guardar PDF</a>",
    "<button class='btn print' onclick='window.print()'>&#128424; Imprimir</button>",
    "</div>",
    "<div class='gap'></div>",
    "<div class='body'>",
    "<embed src='" + pdfDataUri + "' type='application/pdf'/>",
    "<p class='tip'>Toca <b>Guardar PDF</b> para descargarlo<br>o <b>Imprimir</b> para enviarlo a tu impresora.</p>",
    "</div></body></html>"
  ].join("");
  const blob = new Blob([html], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, "_blank");
  if (!win) {
    // Fallback WebView: descarga directa del PDF
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
  setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
}

export async function generateWalletPdfFromElements(
  _e: HTMLElement[],
  _m: "individual" | "a4"
): Promise<void> {
  throw new Error("Usa generateWalletPdf");
}
