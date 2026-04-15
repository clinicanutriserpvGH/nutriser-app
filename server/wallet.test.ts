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

describe("wallet router", () => {
  const caller = appRouter.createCaller(createPublicContext());

  describe("adminListAll", () => {
    it("returns an array of wallets", async () => {
      const result = await caller.wallet.adminListAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("adminListPlans", () => {
    it("returns an array of loyalty plans", async () => {
      const result = await caller.wallet.adminListPlans();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getMyWallet", () => {
    it("returns wallet data for a patient", async () => {
      const result = await caller.wallet.getMyWallet({ patientId: 1 });
      // getMyWallet creates a wallet if it doesn't exist, so it always returns something
      expect(result).toBeDefined();
      expect(result).toHaveProperty("wallet");
    });
  });

  describe("adminCreatePlan and adminDeletePlan", () => {
    it("creates a loyalty plan and then deletes it", async () => {
      const plan = await caller.wallet.adminCreatePlan({
        name: "Test Plan Vitest",
        productName: "Producto Test Vitest",
        category: "product",
        requiredPurchases: 3,
        rewardDescription: "1 GRATIS",
      });
      expect(plan).toBeDefined();
      expect(plan.productName).toBe("Producto Test Vitest");
      expect(plan.requiredPurchases).toBe(3);
      expect(plan.isActive).toBe(true);

      // Clean up
      const deleteResult = await caller.wallet.adminDeletePlan({ id: plan.id });
      expect(deleteResult.success).toBe(true);
    });
  });

  describe("adminUpdatePlan", () => {
    it("updates a loyalty plan", async () => {
      const plan = await caller.wallet.adminCreatePlan({
        name: "Update Test",
        productName: "Update Product",
        category: "service",
        requiredPurchases: 5,
      });

      const updateResult = await caller.wallet.adminUpdatePlan({
        id: plan.id,
        productName: "Updated Product Name",
        requiredPurchases: 4,
      });
      expect(updateResult.success).toBe(true);

      // Verify update
      const allPlans = await caller.wallet.adminListPlans();
      const updated = allPlans.find((p: any) => p.id === plan.id);
      expect(updated?.productName).toBe("Updated Product Name");
      expect(updated?.requiredPurchases).toBe(4);

      // Clean up
      await caller.wallet.adminDeletePlan({ id: plan.id });
    });
  });

  describe("redeem", () => {
    it("rejects redeem for non-existent wallet", async () => {
      await expect(
        caller.wallet.redeem({ walletId: 999999, amount: 100, description: "test" })
      ).rejects.toThrow();
    });
  });

  describe("adminAddCashback", () => {
    it("rejects cashback for non-existent wallet", async () => {
      await expect(
        caller.wallet.adminAddCashback({
          walletId: 999999,
          amount: 100,
          description: "test cashback",
        })
      ).rejects.toThrow();
    });
  });

  describe("adminAddBonus", () => {
    it("rejects bonus for non-existent wallet", async () => {
      await expect(
        caller.wallet.adminAddBonus({
          walletId: 999999,
          amount: 500,
          description: "test bonus",
        })
      ).rejects.toThrow();
    });
  });
});
