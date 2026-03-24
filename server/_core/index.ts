import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

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
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Upload endpoint for promotions and other images - save to S3
  app.post("/api/upload", async (req, res) => {
    try {
      const { storagePut } = await import("../storage");
      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", async () => {
        try {
          const { storagePut } = await import("../storage");
          const buffer = Buffer.concat(chunks);
          const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          const relKey = `promotions/${filename}`;
          
          // Upload to S3
          const { url } = await storagePut(relKey, buffer, "image/jpeg");
          res.json({ url });
        } catch (error) {
          console.error("Upload error:", error);
          res.status(500).json({ error: "Upload failed: " + (error instanceof Error ? error.message : "Unknown error") });
        }
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
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
      // Use the coupon's own image, or fall back to the Nutriser logo
      const image = (promo.imageUrl && promo.imageUrl.startsWith('http'))
        ? promo.imageUrl
        : "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/icon-512x512_87a5c3e9.png";
      const priceInfo = promo.regularPrice && promo.price
        ? ` | Antes: ${promo.regularPrice} \u2192 Ahora: ${promo.price}`
        : promo.price ? ` | ${promo.price}` : "";
      const fullDescription = description + priceInfo;
      const canonicalUrl = `https://nutriserpv.com/cupon/${promoId}`;
      const redirectUrl = `https://nutriserpv.com/#cupon-${promoId}`;

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
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:site_name" content="Nutriser | Aesthetic &amp; Nutrition" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="\ud83c\udf81 ${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(fullDescription)}" />
  <meta name="twitter:image" content="${image}" />
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

  // /cupon/:id — shareable URL for coupons (used in WhatsApp, etc.)
  app.get("/cupon/:id", async (req, res) => {
    await buildCouponOGPage(parseInt(req.params.id), res);
  });

  // Legacy /api/og/cupon/:id — keep for backwards compatibility
  app.get("/api/og/cupon/:id", async (req, res) => {
    await buildCouponOGPage(parseInt(req.params.id), res);
  });

  function escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  
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

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
