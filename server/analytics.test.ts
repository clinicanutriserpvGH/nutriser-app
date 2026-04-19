import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: {
      headers: {},
      cookies: {},
    } as any,
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as any,
  };
}

describe("analytics router", () => {
  it("track mutation returns ok:true", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.analytics.track({
      itemType: "service",
      itemId: "svc-test-1",
      itemName: "Test Service",
      eventType: "info",
      sessionId: "test-session-abc",
    });
    expect(result).toEqual({ ok: true });
  });

  it("getSummary returns an object with all event keys", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.analytics.getSummary({ days: 7 });
    expect(result).toHaveProperty("view");
    expect(result).toHaveProperty("info");
    expect(result).toHaveProperty("cart");
    expect(result).toHaveProperty("wishlist");
    expect(result).toHaveProperty("purchase");
    // All values should be numbers
    for (const val of Object.values(result)) {
      expect(typeof val).toBe("number");
    }
  });

  it("getTrend returns an array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.analytics.getTrend({ days: 7 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("getTopItems returns an array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.analytics.getTopItems({
      eventType: "info",
      itemType: "service",
      limit: 5,
      days: 7,
    });
    expect(Array.isArray(result)).toBe(true);
  });
});
