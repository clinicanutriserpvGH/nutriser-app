import { describe, it, expect } from "vitest";
import { validateDiscountCode, getAllDiscountCodes } from "./db";

describe("Discount Codes System", () => {
  it("should validate active discount code Nutriser10", async () => {
    const code = await validateDiscountCode("Nutriser10");
    expect(code).toBeDefined();
    expect(code?.code).toBe("Nutriser10");
    expect(code?.discountPercent).toBe(10);
    expect(code?.isActive).toBe(true);
  });

  it("should validate active discount code Nutriser30", async () => {
    const code = await validateDiscountCode("Nutriser30");
    expect(code).toBeDefined();
    expect(code?.discountPercent).toBe(30);
    expect(code?.isActive).toBe(true);
  });

  it("should validate active discount code Nutriserfree (100%)", async () => {
    const code = await validateDiscountCode("Nutriserfree");
    expect(code).toBeDefined();
    expect(code?.discountPercent).toBe(100);
    expect(code?.isGift).toBe(true);
    expect(code?.isActive).toBe(true);
  });

  it("should validate active discount code Nutriser2x1", async () => {
    const code = await validateDiscountCode("Nutriser2x1");
    expect(code).toBeDefined();
    expect(code?.isTwoForOne).toBe(true);
    expect(code?.isActive).toBe(true);
  });

  it("should return null for invalid code", async () => {
    const code = await validateDiscountCode("INVALID_CODE_12345");
    expect(code).toBeNull();
  });

  it("should get all discount codes", async () => {
    const codes = await getAllDiscountCodes();
    expect(codes.length).toBeGreaterThan(0);
    const codeNames = codes.map(c => c.code);
    expect(codeNames).toContain("Nutriser10");
    expect(codeNames).toContain("Nutriser2x1");
  });
});
