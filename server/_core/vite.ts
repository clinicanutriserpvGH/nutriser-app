import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import express from "express";
import viteConfig from "../../vite.config";

export async function setupVite(app: express.Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // REDIRECCIÓN CRÍTICA: Móviles/Tablets → Portal de Salud ANTES de servir HTML
    const userAgent = req.headers['user-agent'] || '';
    const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Kindle|Silk/i.test(userAgent);
    
    if (isMobileOrTablet) {
      console.log(`[Mobile Redirect] Detectado dispositivo móvil`);
      return res.redirect(301, 'https://portaldesaludnutriser.club');
    }
    
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: express.Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // REDIRECCIÓN CRÍTICA: Móviles/Tablets → Portal de Salud ANTES de servir cualquier contenido
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userAgent = req.headers['user-agent'] || '';
    const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Kindle|Silk/i.test(userAgent);
    const isApiRoute = req.path.startsWith('/api/');
    
    if (isMobileOrTablet && !isApiRoute) {
      console.log(`[Mobile Redirect] Detectado dispositivo móvil en producción`);
      return res.redirect(301, 'https://portaldesaludnutriser.club');
    }
    
    next();
  });

  // Serve static files but EXCLUDE /cupon/* routes so Express handlers can intercept them
  // Use a custom static middleware that skips /cupon/* paths
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const url = req.originalUrl;
    // Let Express handle /cupon/* and /api/* routes — don't serve static for these
    if (url.startsWith("/cupon/") || url.startsWith("/api/")) {
      return next();
    }
    express.static(distPath)(req, res, next);
  });

  // Serve index.html for any remaining routes (SPA fallback)
  app.use((req: express.Request, res: express.Response) => {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("index.html not found");
    }
  });
}
