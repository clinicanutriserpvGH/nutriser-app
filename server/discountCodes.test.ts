import { describe, it, expect } from "vitest";
import { getDiscountCodeByCode, getAllDiscountCodes } from "./db";

describe("Discount Codes System", () => {
  it("should have predefined discount codes", async () => {
    const codes = ["Nutriser10", "Nutriser15", "Nutriser20", "Nutriser25", "Nutriser30", "Nutriserfree"];
    
    for (const code of codes) {
      const result = await getDiscountCodeByCode(code);
      expect(result).toBeDefined();
      expect(result?.isActive).toBe(true);
    }
  });

  it("should validate discount code Nutriser10", async () => {
    const code = await getDiscountCodeByCode("Nutriser10");
    expect(code?.code).toBe("Nutriser10");
    expect(code?.discountPercentage).toBe(10);
    expect(code?.isActive).toBe(true);
  });

  it("should validate discount code Nutriser30", async () => {
    const code = await getDiscountCodeByCode("Nutriser30");
    expect(code?.code).toBe("Nutriser30");
    expect(code?.discountPercentage).toBe(30);
    expect(code?.isActive).toBe(true);
  });

  it("should validate discount code Nutriserfree", async () => {
    const code = await getDiscountCodeByCode("Nutriserfree");
    expect(code?.code).toBe("Nutriserfree");
    expect(code?.discountPercentage).toBe(100);
    expect(code?.isActive).toBe(true);
  });

  it("should return undefined for invalid code", async () => {
    const code = await getDiscountCodeByCode("INVALID_CODE_12345");
    expect(code).toBeUndefined();
  });

  it("should get all active discount codes", async () => {
    const codes = await getAllDiscountCodes();
    expect(codes.length).toBeGreaterThan(0);
    expect(codes.every(c => c.isActive)).toBe(true);
  });
});
