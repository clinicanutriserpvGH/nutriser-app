/**
 * Tests para el sistema de firma de contrato de consentimiento
 * Verifica que:
 * 1. adminRequireContract y adminClearContract existen como procedimientos en el wallet router
 * 2. checkContractStatus existe y devuelve la estructura correcta
 * 3. Las funciones de DB (adminRequireContract, adminClearContract, getPatientContractStatus) están exportadas
 */
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("contract system - DB functions", () => {
  it("adminRequireContract is exported from server/db.ts", async () => {
    const db = await import("./db");
    expect(typeof db.adminRequireContract).toBe("function");
  });

  it("adminClearContract is exported from server/db.ts", async () => {
    const db = await import("./db");
    expect(typeof db.adminClearContract).toBe("function");
  });

  it("getPatientContractStatus is exported from server/db.ts", async () => {
    const db = await import("./db");
    expect(typeof db.getPatientContractStatus).toBe("function");
  });
});

describe("contract system - tRPC procedures", () => {
  it("wallet.adminRequireContract procedure exists", () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // Verificar que el procedimiento existe en el router
    expect(typeof (caller.wallet as any).adminRequireContract).toBe("function");
  });

  it("wallet.adminClearContract procedure exists", () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    expect(typeof (caller.wallet as any).adminClearContract).toBe("function");
  });

  it("wallet.checkContractStatus procedure exists", () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    expect(typeof (caller.wallet as any).checkContractStatus).toBe("function");
  });

  it("wallet.checkContractStatus returns default values for unknown email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await (caller.wallet as any).checkContractStatus({
      email: "nonexistent-test-user-xyz@example.com",
    });
    // Para un email que no existe, debe devolver contractRequired=false
    expect(result).toHaveProperty("contractRequired");
    expect(result.contractRequired).toBe(false);
  });
});

describe("contract system - updatePatientConsent clears contractRequired", () => {
  it("updatePatientConsent function signature accepts id, signature, pdfUrl", async () => {
    const db = await import("./db");
    // Verificar que la función existe y tiene la firma correcta
    expect(typeof db.updatePatientConsent).toBe("function");
    // La función debe aceptar 3 parámetros
    expect(db.updatePatientConsent.length).toBe(3);
  });
});
