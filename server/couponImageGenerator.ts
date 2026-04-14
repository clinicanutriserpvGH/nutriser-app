/**
 * Coupon Image Generator
 * Generates a PNG image of a coupon using SVG + @resvg/resvg-js
 * This image is used as the og:image for WhatsApp/social media previews
 */

interface CouponImageData {
  title: string;
  description?: string;
  price?: string;
  regularPrice?: string;
  imageUrl?: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Downloads an image from a URL and returns it as a base64 data URI
 */
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const https = await import('https');
    const http = await import('http');
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https.default : http.default;
      const req = client.get(url, { timeout: 5000 }, (res) => {
        if (res.statusCode !== 200) { resolve(null); return; }
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          const contentType = res.headers['content-type'] || 'image/jpeg';
          resolve(`data:${contentType};base64,${buf.toString('base64')}`);
        });
        res.on('error', () => resolve(null));
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
    });
  } catch {
    return null;
  }
}

/**
 * Generates a PNG buffer of the coupon image
 * Width: 1200px, Height: 630px (standard OG image size)
 */
export async function generateCouponImage(data: CouponImageData): Promise<Buffer> {
  const { Resvg } = await import('@resvg/resvg-js');

  const W = 1200;
  const H = 630;
  const GOLD = '#C5A55A';
  const DARK = '#1A1A1A';
  const CREAM = '#FAF7F2';
  const WHITE = '#FFFFFF';

  const title = data.title || 'Oferta Especial';
  const description = data.description || 'Aprovecha esta promoción especial en Nutriser';

  // Adapt font size based on title length
  const titleFontSize = title.length > 40 ? 38 : title.length > 28 ? 44 : 52;
  const titleCharsPerLine = title.length > 40 ? 22 : title.length > 28 ? 26 : 30;

  // Wrap text for display
  const titleLines = wrapText(title, titleCharsPerLine);
  const descLines = wrapText(description, 55);

  // Build price section
  let priceSection = '';
  if (data.regularPrice && data.price) {
    priceSection = `
      <rect x="40" y="490" width="520" height="90" rx="12" fill="${GOLD}" opacity="0.12"/>
      <text x="300" y="530" font-family="Noto Sans" font-size="22" fill="${DARK}" opacity="0.6" text-anchor="middle" text-decoration="line-through">${escapeXml(data.regularPrice)}</text>
      <text x="300" y="565" font-family="Noto Serif" font-size="38" font-weight="bold" fill="${GOLD}" text-anchor="middle">${escapeXml(data.price)}</text>
    `;
  } else if (data.price) {
    priceSection = `
      <rect x="40" y="490" width="520" height="90" rx="12" fill="${GOLD}" opacity="0.12"/>
      <text x="300" y="555" font-family="Noto Serif" font-size="42" font-weight="bold" fill="${GOLD}" text-anchor="middle">${escapeXml(data.price)}</text>
    `;
  }

  // Build title SVG lines
  const titleY0 = 200;
  const titleLineHeight = titleFontSize + 12;
  const titleSvg = titleLines.slice(0, 3).map((line, i) =>
    `<text x="300" y="${titleY0 + i * titleLineHeight}" font-family="Noto Serif" font-size="${titleFontSize}" font-weight="bold" fill="${DARK}" text-anchor="middle">${escapeXml(line)}</text>`
  ).join('\n');

  // Build description SVG lines
  const descY0 = titleY0 + titleLines.slice(0, 3).length * titleLineHeight + 20;
  const descSvg = descLines.slice(0, 3).map((line, i) =>
    `<text x="300" y="${descY0 + i * 34}" font-family="Noto Sans" font-size="24" fill="${DARK}" opacity="0.65" text-anchor="middle">${escapeXml(line)}</text>`
  ).join('\n');

  // Right panel: coupon image or decorative pattern
  // Fetch image as base64 if URL is provided (resvg cannot load external URLs)
  let imageBase64: string | null = null;
  if (data.imageUrl && data.imageUrl.startsWith('http')) {
    imageBase64 = await fetchImageAsBase64(data.imageUrl);
  }

  let rightPanel = '';
  if (imageBase64) {
    // Use base64 encoded image
    rightPanel = `
      <rect x="620" y="0" width="580" height="${H}" fill="${DARK}"/>
      <image href="${imageBase64}" x="620" y="0" width="580" height="${H}" preserveAspectRatio="xMidYMid slice" clip-path="url(#rightClip)"/>
      <rect x="620" y="0" width="580" height="${H}" fill="${DARK}" opacity="0.35"/>
      <text x="900" y="295" font-family="Noto Serif" font-size="32" font-weight="bold" fill="${GOLD}" text-anchor="middle" opacity="0.95">NUTRISER</text>
      <text x="900" y="330" font-family="Noto Sans" font-size="16" fill="white" text-anchor="middle" opacity="0.7" letter-spacing="3">AESTHETIC &amp; NUTRITION</text>
    `;
  } else {
    // Decorative panel with gradient-like effect
    rightPanel = `
      <!-- Right panel background -->
      <rect x="620" y="0" width="580" height="${H}" fill="${DARK}"/>
      <!-- Gradient overlay circles -->
      <circle cx="1050" cy="100" r="300" fill="${GOLD}" opacity="0.08"/>
      <circle cx="700" cy="500" r="250" fill="${GOLD}" opacity="0.06"/>
      <!-- Large decorative circle -->
      <circle cx="900" cy="315" r="200" fill="none" stroke="${GOLD}" stroke-width="1" opacity="0.2"/>
      <circle cx="900" cy="315" r="160" fill="none" stroke="${GOLD}" stroke-width="1" opacity="0.15"/>
      <circle cx="900" cy="315" r="120" fill="${GOLD}" opacity="0.08"/>
      <!-- Diamond shape -->
      <polygon points="900,155 1020,315 900,475 780,315" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.3"/>
      <!-- Inner diamond -->
      <polygon points="900,215 960,315 900,415 840,315" fill="${GOLD}" opacity="0.12"/>
      <!-- Brand name -->
      <text x="900" y="295" font-family="Noto Serif" font-size="42" font-weight="bold" fill="${GOLD}" text-anchor="middle" opacity="0.9">NUTRISER</text>
      <text x="900" y="340" font-family="Noto Sans" font-size="18" fill="${GOLD}" text-anchor="middle" opacity="0.6" letter-spacing="4">AESTHETIC &amp; NUTRITION</text>
      <!-- Horizontal lines -->
      <line x1="730" y1="365" x2="870" y2="365" stroke="${GOLD}" stroke-width="1" opacity="0.3"/>
      <line x1="930" y1="365" x2="1070" y2="365" stroke="${GOLD}" stroke-width="1" opacity="0.3"/>
      <circle cx="900" cy="365" r="4" fill="${GOLD}" opacity="0.5"/>
      <!-- Ubicación -->
      <text x="900" y="400" font-family="Noto Sans" font-size="14" fill="${GOLD}" text-anchor="middle" opacity="0.4"></text>
      <!-- Corner decorations -->
      <rect x="640" y="20" width="40" height="2" fill="${GOLD}" opacity="0.3"/>
      <rect x="640" y="20" width="2" height="40" fill="${GOLD}" opacity="0.3"/>
      <rect x="1160" y="20" width="-40" height="2" fill="${GOLD}" opacity="0.3"/>
      <rect x="1158" y="20" width="2" height="40" fill="${GOLD}" opacity="0.3"/>
      <rect x="640" y="610" width="40" height="2" fill="${GOLD}" opacity="0.3"/>
      <rect x="640" y="570" width="2" height="40" fill="${GOLD}" opacity="0.3"/>
      <rect x="1160" y="610" width="-40" height="2" fill="${GOLD}" opacity="0.3"/>
      <rect x="1158" y="570" width="2" height="40" fill="${GOLD}" opacity="0.3"/>
    `;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <clipPath id="rightClip">
      <rect x="620" y="0" width="580" height="${H}" rx="0"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${CREAM}"/>

  <!-- Left panel content area -->
  <rect x="0" y="0" width="620" height="${H}" fill="${WHITE}"/>

  <!-- Gold top accent bar -->
  <rect x="0" y="0" width="620" height="8" fill="${GOLD}"/>

  <!-- OFERTA badge -->
  <rect x="40" y="30" width="120" height="36" rx="18" fill="${GOLD}"/>
  <text x="100" y="54" font-family="Noto Sans" font-size="16" font-weight="bold" fill="${WHITE}" text-anchor="middle" letter-spacing="2">OFERTA</text>

  <!-- Nutriser logo text -->
  <text x="580" y="54" font-family="Noto Serif" font-size="20" fill="${GOLD}" text-anchor="end" opacity="0.8">Nutriser</text>

  <!-- Divider line -->
  <line x1="40" y1="80" x2="580" y2="80" stroke="${GOLD}" stroke-width="1" opacity="0.3"/>

  <!-- Title -->
  ${titleSvg}

  <!-- Description -->
  ${descSvg}

  <!-- Price section -->
  ${priceSection}

  <!-- Bottom footer -->
  <rect x="0" y="590" width="620" height="40" fill="${GOLD}" opacity="0.08"/>
  <text x="300" y="615" font-family="Noto Sans" font-size="16" fill="${GOLD}" text-anchor="middle" opacity="0.9">nutriserpv.com · </text>

  <!-- Right panel -->
  ${rightPanel}

  <!-- Vertical divider -->
  <line x1="620" y1="0" x2="620" y2="${H}" stroke="${GOLD}" stroke-width="3" opacity="0.4"/>

  <!-- Decorative dots on divider -->
  <circle cx="620" cy="100" r="6" fill="${GOLD}" opacity="0.5"/>
  <circle cx="620" cy="315" r="8" fill="${GOLD}" opacity="0.7"/>
  <circle cx="620" cy="530" r="6" fill="${GOLD}" opacity="0.5"/>
</svg>`;

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Noto Sans',
    },
  });
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}
