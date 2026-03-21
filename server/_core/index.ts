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
