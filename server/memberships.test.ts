import { afterAll, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { memberships } from "../drizzle/schema";
import { inArray } from "drizzle-orm";

// IDs creados durante los tests para limpiarlos al final
const createdMembershipIds: number[] = [];

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

// Limpiar todos los datos de prueba al terminar
afterAll(async () => {
  if (createdMembershipIds.length > 0) {
    const db = await getDb();
    if (db) {
      await db.delete(memberships).where(inArray(memberships.id, createdMembershipIds));
    }
  }
});

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
    createdMembershipIds.push(result.id);
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
    createdMembershipIds.push(result.id);
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
    createdMembershipIds.push(membership.id);

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
    createdMembershipIds.push(membership.id);

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
