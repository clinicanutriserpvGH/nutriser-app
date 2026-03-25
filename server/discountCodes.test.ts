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

  it("should return null for inactive discount code Nutriser30", async () => {
    // Nutriser30 exists in DB but is inactive — validateDiscountCode filters by isActive
    const code = await validateDiscountCode("Nutriser30");
    expect(code).toBeNull();
  });

  it("should return null for inactive discount code Nutriserfree", async () => {
    // Nutriserfree exists in DB but is inactive
    const code = await validateDiscountCode("Nutriserfree");
    expect(code).toBeNull();
  });

  it("should return null for inactive discount code Nutriser2x1", async () => {
    // Nutriser2x1 exists in DB but is inactive
    const code = await validateDiscountCode("Nutriser2x1");
    expect(code).toBeNull();
  });

  it("should return null for invalid code", async () => {
    const code = await validateDiscountCode("INVALID_CODE_12345");
    expect(code).toBeNull();
  });

  it("should get all discount codes (including inactive)", async () => {
    const codes = await getAllDiscountCodes();
    expect(codes.length).toBeGreaterThan(0);
    const codeNames = codes.map(c => c.code);
    expect(codeNames).toContain("Nutriser10");
    expect(codeNames).toContain("Nutriser2x1");
  });
});
