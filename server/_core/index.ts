import express from "express";
import { createServer } from "http";
import net from "net";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdir, appendFile, stat } from "fs/promises";
import { existsSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { createRequire } from "module";

const execFileAsync = promisify(execFile);

// Obtener el binario de ffmpeg-static (incluido en node_modules, no requiere instalación en el servidor)
const _require = createRequire(import.meta.url);
let ffmpegBinary: string = 'ffmpeg'; // fallback al ffmpeg del sistema
try {
  ffmpegBinary = _require('ffmpeg-static');
  console.log('[FFmpeg] Using bundled ffmpeg-static:', ffmpegBinary);
} catch (e) {
  console.log('[FFmpeg] ffmpeg-static not found, using system ffmpeg');
}
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { generateCouponImage } from "../couponImageGenerator";
import { getPromotionById } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));


  // Storage proxy for /manus-storage/* paths
  registerStorageProxy(app);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Upload endpoint for promotions, course videos, and documents - save to S3
  app.post("/api/upload", (req, res, next) => {
    // Extender timeout a 10 minutos para archivos grandes (videos 4K)
    req.setTimeout(600000);
    res.setTimeout(600000);
    next();
  }, async (req, res) => {
    try {
      const { storagePut } = await import("../storage");
      const busboy = await import("busboy");
      const bb = busboy.default({ headers: req.headers, limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB max
      let fileBuffer: Buffer | null = null;
      let fileType = "application/octet-stream";
      let originalFilename = "file";
      
      bb.on("file", (fieldname: string, file: any, info: any) => {
        const chunks: Buffer[] = [];
        fileType = info.mimeType || "application/octet-stream";
        originalFilename = info.filename || "file";
        file.on("data", (chunk: Buffer) => chunks.push(chunk));
        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });
      
      bb.on("close", async () => {
        try {
          if (!fileBuffer) {
            return res.status(400).json({ error: "No file uploaded" });
          }
          // Preserve original extension for correct playback/download
          const ext = originalFilename.includes('.')
            ? originalFilename.split('.').pop()?.toLowerCase() || 'bin'
            : 'bin';
          // Choose S3 folder based on MIME type or extension
          const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'wmv', 'flv', '3gp'];
          const docExts = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xlsx', 'xls'];
          let folder = 'uploads';
          const isVideo = fileType.startsWith('video/') || videoExts.includes(ext);
          const isDoc = fileType === 'application/pdf' ||
            fileType.includes('document') ||
            fileType.includes('spreadsheet') ||
            fileType.includes('presentation') ||
            docExts.includes(ext);
          if (isVideo) folder = 'course-videos';
          else if (isDoc) folder = 'course-docs';
          else if (fileType.startsWith('image/')) folder = 'promotions';

          let finalBuffer = fileBuffer;
          let finalExt = ext;
          let uploadMimeType = fileType;

          // Convertir videos no-MP4 (MOV, AVI, MKV, etc.) a MP4 para compatibilidad universal
          const needsConversion = isVideo && ext !== 'mp4' && ext !== 'webm';
          if (needsConversion) {
            console.log(`[Upload] Converting ${ext} to mp4 for browser compatibility...`);
            const tmpInput = path.join(tmpdir(), `upload-in-${Date.now()}.${ext}`);
            const tmpOutput = path.join(tmpdir(), `upload-out-${Date.now()}.mp4`);
            try {
              await writeFile(tmpInput, fileBuffer);
              await execFileAsync(ffmpegBinary, [
                '-i', tmpInput,
                '-c:v', 'libx264',   // H.264 codec - compatible con todos los navegadores
                '-c:a', 'aac',       // AAC audio
                '-movflags', '+faststart', // Permite reproducción mientras carga
                '-preset', 'fast',   // Balance entre velocidad y calidad
                '-crf', '23',        // Calidad visual buena (0=lossless, 51=peor)
                '-y',                // Sobreescribir si existe
                tmpOutput
              ], { timeout: 300000 }); // 5 min timeout para conversión
              finalBuffer = await readFile(tmpOutput);
              finalExt = 'mp4';
              uploadMimeType = 'video/mp4';
              console.log(`[Upload] Conversion complete: ${fileBuffer.length} bytes -> ${finalBuffer.length} bytes`);
            } catch (convErr) {
              console.error('[Upload] FFmpeg conversion failed, uploading original:', convErr);
              // Si falla la conversión, subir el original
              finalBuffer = fileBuffer;
              finalExt = ext;
              uploadMimeType = ext === 'mov' ? 'video/quicktime' : (fileType || 'video/mp4');
            } finally {
              // Limpiar archivos temporales
              unlink(tmpInput).catch(() => {});
              unlink(tmpOutput).catch(() => {});
            }
          } else if (ext === 'mp4' && !fileType.startsWith('video/')) {
            uploadMimeType = 'video/mp4';
          }

          const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${finalExt}`;
          const relKey = `${folder}/${safeName}`;
          const { url } = await storagePut(relKey, finalBuffer, uploadMimeType);
          res.json({ url });
        } catch (error) {
          console.error("Upload error:", error);
          res.status(500).json({ error: "Upload failed: " + (error instanceof Error ? error.message : "Unknown error") });
        }
      });
      
      req.pipe(bb);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
  
  // ─── Notification Image Upload ───────────────────────────────────────────────
  // POST /api/upload-notif-image — carga imágenes para notificaciones
  app.post("/api/upload-notif-image", (req, res, next) => {
    req.setTimeout(30000);
    res.setTimeout(30000);
    next();
  }, async (req, res) => {
    try {
      const { storagePut } = await import("../storage");
      const busboy = await import("busboy");
      const bb = busboy.default({ headers: req.headers, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB max
      let fileBuffer: Buffer | null = null;
      let fileType = "application/octet-stream";
      let originalFilename = "image";
      
      bb.on("file", (fieldname: string, file: any, info: any) => {
        const chunks: Buffer[] = [];
        fileType = info.mimeType || "application/octet-stream";
        originalFilename = info.filename || "image";
        file.on("data", (chunk: Buffer) => chunks.push(chunk));
        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });
      
      bb.on("close", async () => {
        try {
          if (!fileBuffer) {
            return res.status(400).json({ error: "No file uploaded" });
          }
          
          // Validar que sea imagen
          if (!fileType.startsWith('image/')) {
            return res.status(400).json({ error: "Solo se permiten imágenes" });
          }
          
          // Obtener extensión
          const ext = originalFilename.includes('.')
            ? originalFilename.split('.').pop()?.toLowerCase() || 'jpg'
            : 'jpg';
          
          // Generar nombre único para la imagen
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);
          const filename = `notif-${timestamp}-${random}.${ext}`;
          
          // Subir a S3
          const { url } = await storagePut(`notifications/${filename}`, fileBuffer, fileType);
          
          res.status(200).json({ url, success: true });
        } catch (error) {
          console.error("Notification image upload error:", error);
          res.status(500).json({ error: "Upload failed: " + (error instanceof Error ? error.message : "Unknown error") });
        }
      });
      
      req.pipe(bb);
    } catch (error) {
      console.error("Notification image upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
  
  // ─── Chunked Upload Endpoints ──────────────────────────────────────────────
  // POST /api/upload-chunk — recibe un chunk del video y lo guarda en disco
  app.post("/api/upload-chunk", (req, res, next) => {
    req.setTimeout(120000);
    res.setTimeout(120000);
    next();
  }, async (req, res) => {
    try {
      const busboy = await import("busboy");
      const bb = busboy.default({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max per chunk
      let chunkBuffer: Buffer | null = null;
      let uploadId = '';
      let chunkIndex = 0;
      let totalChunks = 0;
      let originalFilename = 'file';

      bb.on('field', (name: string, val: string) => {
        if (name === 'uploadId') uploadId = val;
        if (name === 'chunkIndex') chunkIndex = parseInt(val);
        if (name === 'totalChunks') totalChunks = parseInt(val);
        if (name === 'filename') originalFilename = val;
      });

      bb.on('file', (_: string, file: any) => {
        const chunks: Buffer[] = [];
        file.on('data', (chunk: Buffer) => chunks.push(chunk));
        file.on('end', () => { chunkBuffer = Buffer.concat(chunks); });
      });

      bb.on('close', async () => {
        try {
          if (!chunkBuffer || !uploadId) {
            return res.status(400).json({ error: 'Missing chunk data or uploadId' });
          }
          // Guardar chunk en disco temporal
          const chunkDir = path.join(tmpdir(), `upload-${uploadId}`);
          if (!existsSync(chunkDir)) await mkdir(chunkDir, { recursive: true });
          const chunkPath = path.join(chunkDir, `chunk-${String(chunkIndex).padStart(6, '0')}`);
          await writeFile(chunkPath, chunkBuffer);
          console.log(`[Chunk] Saved chunk ${chunkIndex + 1}/${totalChunks} for upload ${uploadId}`);
          res.json({ ok: true, chunkIndex });
        } catch (err) {
          console.error('[Chunk] Error saving chunk:', err);
          res.status(500).json({ error: 'Failed to save chunk' });
        }
      });

      req.pipe(bb);
    } catch (err) {
      console.error('[Chunk] Error:', err);
      res.status(500).json({ error: 'Chunk upload failed' });
    }
  });

  // POST /api/upload-chunk-finalize — ensambla todos los chunks, convierte a MP4 y sube a S3
  app.post("/api/upload-chunk-finalize", async (req, res) => {
    const { uploadId, filename, mimeType, totalChunks } = req.body;
    if (!uploadId || !filename) {
      return res.status(400).json({ error: 'Missing uploadId or filename' });
    }
    const expectedChunks = parseInt(totalChunks || '0');
    const chunkDir = path.join(tmpdir(), `upload-${uploadId}`);
    const assembledPath = path.join(tmpdir(), `assembled-${uploadId}-${filename}`);
    const ext = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() || 'bin' : 'bin';
    try {
      // Esperar hasta que todos los chunks estén presentes (máx 30s)
      const { readdirSync } = await import('fs');
      if (expectedChunks > 0) {
        let waited = 0;
        while (waited < 30000) {
          const present = readdirSync(chunkDir).filter((f: string) => f.startsWith('chunk-')).length;
          console.log(`[Finalize] Waiting for chunks: ${present}/${expectedChunks}`);
          if (present >= expectedChunks) break;
          await new Promise(r => setTimeout(r, 500));
          waited += 500;
        }
      }
      // Leer y ensamblar todos los chunks en orden
      const chunkFiles = readdirSync(chunkDir)
        .filter((f: string) => f.startsWith('chunk-'))
        .sort();
      console.log(`[Finalize] Assembling ${chunkFiles.length} chunks for ${filename} (expected: ${expectedChunks})`);
      for (const chunkFile of chunkFiles) {
        const chunkData = await readFile(path.join(chunkDir, chunkFile));
        await appendFile(assembledPath, chunkData);
      }
      const assembledStat = await stat(assembledPath);
      console.log(`[Finalize] Assembled file size: ${assembledStat.size} bytes`);

      const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'wmv', 'flv', '3gp'];
      const isVideo = (mimeType || '').startsWith('video/') || videoExts.includes(ext);

      if (isVideo) {
        // Subir a Cloudinary — convierte automáticamente a MP4 H.264 compatible con todos los dispositivos
        const { ENV } = await import('./env');
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: ENV.cloudinaryCloudName,
          api_key: ENV.cloudinaryApiKey,
          api_secret: ENV.cloudinaryApiSecret,
        });
        console.log(`[Finalize] Uploading video to Cloudinary for conversion, size: ${assembledStat.size} bytes`);
        const uploadResult = await cloudinary.uploader.upload(assembledPath, {
          resource_type: 'video',
          folder: 'nutriser-course-videos',
          eager: [{ format: 'mp4', transformation: [{ quality: 'auto', fetch_format: 'mp4' }] }],
          eager_async: false,
          format: 'mp4',
        });
        const videoUrl = uploadResult.secure_url;
        console.log(`[Finalize] Cloudinary upload OK: ${videoUrl}`);
        res.json({ url: videoUrl });
      } else {
        // Para documentos/imágenes: subir a S3 directamente
        const { storagePut } = await import('../storage');
        const finalBuffer: Buffer = await readFile(assembledPath);
        const folder = (mimeType || '').startsWith('image/') ? 'promotions' : 'course-docs';
        const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { url } = await storagePut(`${folder}/${safeName}`, finalBuffer, mimeType || 'application/octet-stream');
        console.log(`[Finalize] Uploaded doc to S3: ${url}`);
        res.json({ url });
      }
    } catch (err) {
      console.error('[Finalize] Error:', err);
      res.status(500).json({ error: 'Finalize failed: ' + (err instanceof Error ? err.message : 'Unknown') });
    } finally {
      // Limpiar archivos temporales
      unlink(assembledPath).catch(() => {});
      const { rm } = await import('fs/promises');
      rm(chunkDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  // Endpoint para servir logo como fallback (no se usa, pero lo dejamos por compatibilidad)
  app.get("/api/logo", (req, res) => {
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    // Redirigir a una imagen placeholder
    res.redirect("https://via.placeholder.com/400x300?text=Nutriser");
  });
  
  // Serve uploaded images
  app.use("/uploads", express.static("dist/uploads"));

  // Helper to build the OG HTML page for a coupon
  async function buildCouponOGPage(promoId: number, res: any) {
    try {
      const { getPromotionById } = await import("../db");
      if (isNaN(promoId)) return res.redirect("https://nutriserpv.com/");
      const promo = await getPromotionById(promoId);
      if (!promo) return res.redirect("https://nutriserpv.com/");

      const title = promo.title || "Promoci\u00f3n Nutriser";
      const description = promo.description || "Aprovecha esta promoci\u00f3n especial en Nutriser Aesthetic & Nutrition";
      const priceInfo = promo.regularPrice && promo.price
        ? ` | Antes: ${promo.regularPrice} \u2192 Ahora: ${promo.price}`
        : promo.price ? ` | ${promo.price}` : "";
      const fullDescription = description + priceInfo;
      const canonicalUrl = `https://nutriserpv.com/api/og/cupon/${promoId}`;
      const redirectUrl = `https://nutriserpv.com/cupon/${promoId}`;
      // Use stored imageUrl directly if available (better WhatsApp compatibility)
      // Fall back to dynamically generated image if no stored image
      const ogImage = (promo.imageUrl && promo.imageUrl.startsWith('http'))
        ? promo.imageUrl
        : `https://nutriserpv.com/api/og/cupon-image/${promoId}`;

      // Always return OG HTML — WhatsApp/bots read the meta tags, users get JS redirect
      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Nutriser</title>
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="\ud83c\udf81 ${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(fullDescription)}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:secure_url" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:site_name" content="Nutriser | Aesthetic &amp; Nutrition" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="\ud83c\udf81 ${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(fullDescription)}" />
  <meta name="twitter:image" content="${ogImage}" />
</head>
<body>
  <p>Cargando oferta... <a href="${redirectUrl}">${escapeHtml(title)}</a></p>
  <script>window.location.replace("${redirectUrl}");<\/script>
</body>
</html>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store");
      res.send(html);
    } catch (err) {
      console.error("[OG Cupon] Error:", err);
      res.redirect("https://nutriserpv.com/");
    }
  }

  // Endpoint para generar imagen PNG del cupón (para og:image)
  app.get("/api/og/cupon-image/:id", async (req, res) => {
    try {
      const promoId = parseInt(req.params.id);
      if (isNaN(promoId)) return res.status(400).send('Invalid ID');
      const promo = await getPromotionById(promoId);
      if (!promo) return res.status(404).send('Not found');
      const pngBuffer = await generateCouponImage({
        title: promo.title || 'Oferta Especial',
        description: promo.description || undefined,
        price: promo.price || undefined,
        regularPrice: promo.regularPrice || undefined,
        imageUrl: promo.imageUrl || undefined,
      });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(pngBuffer);
    } catch (err) {
      console.error('[CouponImage] Error:', err);
      res.status(500).send('Error generating image');
    }
  });

  // /cupon/:id — shareable URL for coupons (used in WhatsApp, etc.)
  // Only serve OG HTML to bots (WhatsApp, Facebook, Telegram, etc.)
  // Human users get the React SPA which handles /cupon/:id as a dedicated page
  app.get("/cupon/:id", async (req, res, next) => {
    const ua = req.headers['user-agent'] || '';
    const isBot = /facebookexternalhit|WhatsApp|Twitterbot|Slackbot|TelegramBot|LinkedInBot|Discordbot|Pinterest|Googlebot|bingbot|Applebot|Embedly|Quora|Snapchat|vkShare|W3C_Validator|curl|wget|python-requests/i.test(ua);
    if (isBot) {
      // Serve OG HTML for bots so they can read meta tags
      await buildCouponOGPage(parseInt(req.params.id), res);
    } else {
      // Let Vite/React handle this route for human users
      next();
    }
  });

  // Legacy /api/og/cupon/:id — keep for backwards compatibility
  app.get("/api/og/cupon/:id", async (req, res) => {
    await buildCouponOGPage(parseInt(req.params.id), res);
  });

  function escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  
  // ─── Wallet Card PDF ─────────────────────────────────────────────────────
  // GET /api/wallet/card-pdf?wallets=[{patientName,walletNumber,qrUrl},...]
  // Genera un PDF con la(s) tarjeta(s) del monedero y lo sirve directamente.
  // No requiere autenticación para simplificar el flujo en iOS.
  app.get("/api/wallet/card-pdf", async (req, res) => {
    try {
      const raw = req.query.wallets as string;
      if (!raw) return res.status(400).json({ error: "Missing wallets param" });
      const cards = JSON.parse(decodeURIComponent(raw));
      if (!Array.isArray(cards) || cards.length === 0) {
        return res.status(400).json({ error: "Invalid wallets param" });
      }
      const mode = (req.query.mode as string) === "a4" ? "a4" : "individual";
      const { generateWalletCardPdf } = await import("../walletCardPdf");
      const pdfBuffer = await generateWalletCardPdf(cards, mode);
      const filename = cards.length === 1
        ? `tarjeta-${cards[0].walletNumber || "nutriser"}.pdf`
        : `tarjetas-nutriser-${cards.length}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Cache-Control", "no-cache");
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[WalletPDF] Error:", err);
      res.status(500).json({ error: "Error generating PDF" });
    }
  });

  // Proxy seguro para PDF del ebook desde el Monedero (usa accessToken)
  app.get("/api/ebook-proxy", async (req, res) => {
    try {
      const token = req.query.token as string;
      if (!token) { res.status(400).send("Token requerido"); return; }
      const { getEbookPurchaseByToken } = await import("../db");
      const purchase = await getEbookPurchaseByToken(token);
      if (!purchase || purchase.status !== 'approved') {
        res.status(403).send("Acceso no autorizado");
        return;
      }
      // Obtener el ebook por ID
      const { getAllEbooks } = await import("../db");
      const allEbooks = await getAllEbooks();
      const ebook = allEbooks.find((e: any) => e.id === purchase.ebookId);
      if (!ebook || !ebook.pdfUrl) { res.status(404).send("Libro no disponible"); return; }
      const pdfResp = await fetch(ebook.pdfUrl);
      if (!pdfResp.ok) { res.status(502).send("Error al obtener el libro"); return; }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      const buffer = await pdfResp.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err) {
      console.error("[EbookProxy] Error:", err);
      res.status(500).send("Error interno");
    }
  });

  // Proxy seguro para PDF del ebook - sirve el PDF sin exponer la URL de S3
  // Solo accesible con token válido y aprobado
  app.get("/api/ebook/pdf/:token", async (req, res) => {
    try {
      const { token } = req.params;
      if (!token) { res.status(400).send("Token requerido"); return; }
      const { getEbookPurchaseByToken } = await import("../db");
      const { getActiveEbook } = await import("../db");
      const purchase = await getEbookPurchaseByToken(token);
      if (!purchase || purchase.status !== 'approved') {
        res.status(403).send("Acceso no autorizado");
        return;
      }
      const ebook = await getActiveEbook();
      if (!ebook || !ebook.pdfUrl) { res.status(404).send("Ebook no disponible"); return; }
      // Hacer proxy del PDF desde S3 sin exponer la URL
      const pdfResp = await fetch(ebook.pdfUrl);
      if (!pdfResp.ok) { res.status(502).send("Error al obtener el PDF"); return; }
      // Cabeceras anti-descarga: no-cache, no-store, inline only
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      // Transmitir el PDF como stream
      const buffer = await pdfResp.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err) {
      console.error("[EbookProxy] Error:", err);
      res.status(500).send("Error interno");
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // Timeout extendido para subida de archivos grandes (10 minutos)
  server.timeout = 600000;
  server.keepAliveTimeout = 620000;
  server.headersTimeout = 630000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // ─── Jobs automáticos (cron) ─────────────────────────────────────────────
  const cron = await import('node-cron');
  const { sendAppointmentReminders, sendBirthdayGreetings, sendCashbackExpiryReminders } = await import('../jobs');

  // Recordatorio de citas: cada día a las 10:00 AM hora de México
  cron.default.schedule('0 0 10 * * *', async () => {
    console.log('[Cron] Ejecutando recordatorio de citas...');
    await sendAppointmentReminders();
  }, { timezone: 'America/Mexico_City' });

  // Felicitaciones de cumpleaños: cada día a las 9:00 AM hora de México
  cron.default.schedule('0 0 9 * * *', async () => {
    console.log('[Cron] Ejecutando felicitaciones de cumpleaños...');
    await sendBirthdayGreetings();
  }, { timezone: 'America/Mexico_City' });

   // Auto-desactivar promociones vencidas: cada hora en punto
  cron.default.schedule('0 0 * * * *', async () => {
    try {
      const { autoDeactivateExpiredPromotions } = await import('../db');
      const count = await autoDeactivateExpiredPromotions();
      if (count > 0) console.log(`[Cron] ${count} promoción(es) vencida(s) desactivada(s) automáticamente`);
    } catch (e) {
      console.error('[Cron] Error al desactivar promociones vencidas:', e);
    }
  }, { timezone: 'America/Mexico_City' });
  // Recordatorio semanal de cashback: cada lunes a las 10:00 AM hora de México
  cron.default.schedule('0 0 10 * * 1', async () => {
    console.log('[Cron] Ejecutando recordatorio de vencimiento de cashback...');
    await sendCashbackExpiryReminders();
  }, { timezone: 'America/Mexico_City' });
  console.log('[Cron] Jobs programados: cumpleaños (9:00 AM), citas (10:00 AM), cashback semanal (lunes 10:00 AM), auto-desactivar promociones (cada hora)');
}
startServer().catch(console.error);
