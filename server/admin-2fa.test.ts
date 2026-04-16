import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock email sending to avoid actual emails
vi.mock("./_core/email", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    sendLoginAuthorizationEmail: vi.fn().mockResolvedValue(undefined),
  };
});

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

describe("admin 2FA login", () => {
  it("adminLogin rejects invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.adminLogin({
        email: "nonexistent@test.com",
        password: "wrong",
        origin: "https://nutriserpv.com",
      })
    ).rejects.toThrow("Credenciales inválidas");
  });

  it("checkLoginAuthorization returns false when no pending auth", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.checkLoginAuthorization({
      email: "nobody@test.com",
    });

    expect(result).toEqual({ authorized: false });
  });

  it("authorizeLogin rejects invalid token", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.authorizeLogin({
        token: "invalid-token-12345",
      })
    ).rejects.toThrow("Token inválido o expirado");
  });
});
