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

describe("promotions.list", () => {
  it("returns an array of promotions (public procedure)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.promotions.list();

    // Should return an array
    expect(Array.isArray(result)).toBe(true);

    // Each promotion should have the expected shape
    for (const promo of result) {
      expect(promo).toHaveProperty("id");
      expect(promo).toHaveProperty("title");
      expect(promo).toHaveProperty("isActive");
      expect(promo).toHaveProperty("couponsSold");
      expect(promo).toHaveProperty("couponsRemaining");
      // isActive should be true (list only returns active promos)
      expect(promo.isActive).toBe(true);
      // couponsSold should be a number >= 0
      expect(typeof promo.couponsSold).toBe("number");
      expect(promo.couponsSold).toBeGreaterThanOrEqual(0);
    }
  });

  it("each promotion has correct field types", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.promotions.list();

    for (const promo of result) {
      expect(typeof promo.id).toBe("number");
      expect(typeof promo.title).toBe("string");
      expect(promo.title.length).toBeGreaterThan(0);
      // Optional fields should be string or null
      if (promo.description !== null && promo.description !== undefined) {
        expect(typeof promo.description).toBe("string");
      }
      if (promo.price !== null && promo.price !== undefined) {
        expect(typeof promo.price).toBe("string");
      }
      if (promo.regularPrice !== null && promo.regularPrice !== undefined) {
        expect(typeof promo.regularPrice).toBe("string");
      }
      if (promo.maxCoupons !== null && promo.maxCoupons !== undefined) {
        expect(typeof promo.maxCoupons).toBe("number");
      }
    }
  });
});

describe("autoDeactivateExpiredPromotions", () => {
  it("returns a number (count of deactivated promotions)", async () => {
    const { autoDeactivateExpiredPromotions } = await import("./db");
    const count = await autoDeactivateExpiredPromotions();
    // Should return a non-negative number
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
