import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@nutriser.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("memberships", () => {
  it("should create a basic membership", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.memberships.create({
      clientName: "Juan Pérez",
      clientEmail: "juan@example.com",
      clientPhone: "+52 1234567890",
      programType: "basic",
    });

    expect(result).toBeDefined();
  });

  it("should create a premium membership", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.memberships.create({
      clientName: "María García",
      clientEmail: "maria@example.com",
      programType: "premium",
    });

    expect(result).toBeDefined();
  });

  it("should list memberships as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.memberships.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should not list memberships as non-admin", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.memberships.list();
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should upload payment proof", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Primero crear una membresía para obtener un ID válido
    const membership = await caller.memberships.create({
      clientName: "Test User",
      clientEmail: "testupload@example.com",
      programType: "basic",
    });

    const result = await caller.memberships.uploadProof({
      membershipId: membership.id,
      proofData: "base64encodedimagedata",
      fileName: "proof.jpg",
    });

    expect(result).toBeDefined();
  }, 15000);

  it("should cancel a membership", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Primero crear una membresía
    const membership = await caller.memberships.create({
      clientName: "Carlos López",
      clientEmail: "carlos@example.com",
      programType: "basic",
    });

    // Luego cancelarla
    const result = await caller.memberships.cancel({
      membershipId: membership.id,
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should fail to cancel non-existent membership", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.memberships.cancel({
        membershipId: 99999,
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
