/**
 * Tests para el sistema de eBook de Nutriser
 * Verifica: acceso con token inválido, acceso con token válido (mock),
 * y validación de entradas del router
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock de las funciones de base de datos
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getActiveEbook: vi.fn(),
    getAllEbooks: vi.fn(),
    getEbookPurchaseByToken: vi.fn(),
    getEbookPurchaseByEmail: vi.fn(),
    getAllEbookPurchases: vi.fn(),
    createEbookPurchase: vi.fn(),
    updateEbookPurchaseStatus: vi.fn(),
    upsertEbook: vi.fn(),
  };
});

// Mock del storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.pdf", key: "test.pdf" }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("ebook.getActive", () => {
  it("devuelve null cuando no hay ebook activo", async () => {
    const { getActiveEbook } = await import("./db");
    vi.mocked(getActiveEbook).mockResolvedValueOnce(null);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ebook.getActive();

    expect(result).toBeNull();
  });

  it("devuelve el ebook activo cuando existe", async () => {
    const { getActiveEbook } = await import("./db");
    const mockEbook = {
      id: 1,
      title: "Guía Nutricional Nutriser",
      description: "Descripción del ebook",
      price: "299.00",
      coverUrl: "https://cdn.example.com/cover.jpg",
      backCoverUrl: "https://cdn.example.com/backcover.jpg",
      pdfUrl: "https://cdn.example.com/ebook.pdf",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(getActiveEbook).mockResolvedValueOnce(mockEbook);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ebook.getActive();

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Guía Nutricional Nutriser");
    expect(result?.price).toBe("299.00");
  });
});

describe("ebook.getAccess", () => {
  it("lanza error cuando el token no existe", async () => {
    const { getEbookPurchaseByToken } = await import("./db");
    vi.mocked(getEbookPurchaseByToken).mockResolvedValueOnce(null);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.ebook.getAccess({ token: "invalid-token-xyz" })
    ).rejects.toThrow("Acceso no válido o pendiente de aprobación");
  });

  it("lanza error cuando la compra está pendiente", async () => {
    const { getEbookPurchaseByToken } = await import("./db");
    vi.mocked(getEbookPurchaseByToken).mockResolvedValueOnce({
      id: 1,
      ebookId: 1,
      buyerName: "Test User",
      buyerEmail: "test@example.com",
      proofUrl: "https://cdn.example.com/proof.jpg",
      accessToken: "valid-token",
      status: "pending",
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.ebook.getAccess({ token: "valid-token" })
    ).rejects.toThrow("Acceso no válido o pendiente de aprobación");
  });

  it("devuelve la URL del PDF cuando el token es válido y aprobado", async () => {
    const { getEbookPurchaseByToken, getActiveEbook } = await import("./db");
    
    vi.mocked(getEbookPurchaseByToken).mockResolvedValueOnce({
      id: 1,
      ebookId: 1,
      buyerName: "Test User",
      buyerEmail: "test@example.com",
      proofUrl: "https://cdn.example.com/proof.jpg",
      accessToken: "approved-token",
      status: "approved",
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(getActiveEbook).mockResolvedValueOnce({
      id: 1,
      title: "Guía Nutricional Nutriser",
      description: "Descripción",
      price: "299.00",
      coverUrl: null,
      backCoverUrl: null,
      pdfUrl: "https://cdn.example.com/ebook.pdf",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ebook.getAccess({ token: "approved-token" });

    expect(result.pdfUrl).toBe("https://cdn.example.com/ebook.pdf");
    expect(result.title).toBe("Guía Nutricional Nutriser");
  });
});

describe("ebook.login", () => {
  it("lanza error cuando el correo no existe", async () => {
    const { getEbookPurchaseByEmail } = await import("./db");
    vi.mocked(getEbookPurchaseByEmail).mockResolvedValueOnce(null);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.ebook.login({ email: "noexiste@example.com", password: "abc123" })
    ).rejects.toThrow("Correo no encontrado o compra pendiente de aprobación");
  });

  it("lanza error cuando la compra está pendiente", async () => {
    const { getEbookPurchaseByEmail } = await import("./db");
    vi.mocked(getEbookPurchaseByEmail).mockResolvedValueOnce({
      id: 1,
      ebookId: 1,
      buyerName: "Test User",
      buyerEmail: "test@example.com",
      proofUrl: "https://cdn.example.com/proof.jpg",
      accessToken: "token-1",
      accessPasswordHash: null,
      status: "pending",
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.ebook.login({ email: "test@example.com", password: "abc123" })
    ).rejects.toThrow("Correo no encontrado o compra pendiente de aprobación");
  });
});

describe("ebook.listPurchases", () => {
  it("devuelve lista vacía cuando no hay compras", async () => {
    const { getAllEbookPurchases } = await import("./db");
    vi.mocked(getAllEbookPurchases).mockResolvedValueOnce([]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ebook.listPurchases();

    expect(result).toEqual([]);
  });

  it("devuelve las compras existentes", async () => {
    const { getAllEbookPurchases } = await import("./db");
    vi.mocked(getAllEbookPurchases).mockResolvedValueOnce([
      {
        id: 1,
        ebookId: 1,
        buyerName: "Ana García",
        buyerEmail: "ana@example.com",
        proofUrl: "https://cdn.example.com/proof1.jpg",
        accessToken: "token-1",
        status: "pending",
        approvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ebook.listPurchases();

    expect(result).toHaveLength(1);
    expect(result[0]?.buyerName).toBe("Ana García");
    expect(result[0]?.status).toBe("pending");
  });
});
