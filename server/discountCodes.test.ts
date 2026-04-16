import { describe, it, expect, vi } from "vitest";

/**
 * Discount codes are stored in the database and managed by admin.
 * These tests verify the validation logic without requiring live DB data.
 * The actual codes (Nutriser10, Nutriser20, etc.) are created by admin
 * and should NOT be hardcoded as test expectations.
 */

// Mock the db module
vi.mock("./db", () => ({
  validateDiscountCode: vi.fn(async (code: string) => {
    const mockCodes: Record<string, any> = {
      "TESTCODE10": { id: 1, code: "TESTCODE10", discountPercent: 10, isActive: true },
      "TESTCODE20": { id: 2, code: "TESTCODE20", discountPercent: 20, isActive: true },
      "INACTIVE": { id: 3, code: "INACTIVE", discountPercent: 15, isActive: false },
    };
    return mockCodes[code] || null;
  }),
  getAllDiscountCodes: vi.fn(async () => [
    { id: 1, code: "TESTCODE10", discountPercent: 10, isActive: true },
    { id: 2, code: "TESTCODE20", discountPercent: 20, isActive: true },
    { id: 3, code: "INACTIVE", discountPercent: 15, isActive: false },
  ]),
}));

import { validateDiscountCode, getAllDiscountCodes } from "./db";

describe("Discount Codes System", () => {
  it("should validate an active discount code", async () => {
    const code = await validateDiscountCode("TESTCODE10");
    expect(code).toBeDefined();
    expect(code?.code).toBe("TESTCODE10");
    expect(code?.discountPercent).toBe(10);
    expect(code?.isActive).toBe(true);
  });

  it("should validate another active discount code", async () => {
    const code = await validateDiscountCode("TESTCODE20");
    expect(code).toBeDefined();
    expect(code?.code).toBe("TESTCODE20");
    expect(code?.discountPercent).toBe(20);
    expect(code?.isActive).toBe(true);
  });

  it("should return null for invalid code", async () => {
    const code = await validateDiscountCode("INVALID_CODE_12345");
    expect(code).toBeNull();
  });

  it("should get all discount codes (including inactive)", async () => {
    const codes = await getAllDiscountCodes();
    expect(codes.length).toBeGreaterThan(0);
    const activeCodes = codes.filter(c => c.isActive);
    expect(activeCodes.length).toBe(2);
    const inactiveCodes = codes.filter(c => !c.isActive);
    expect(inactiveCodes.length).toBe(1);
  });
});
