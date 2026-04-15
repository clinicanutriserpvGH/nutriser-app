/**
 * Tests for wallet checkout integration and cashback logic
 */
import { describe, it, expect } from "vitest";

// ─── Unit tests for checkout price calculation logic ───
describe("Checkout price calculation", () => {
  // Simulate the priceNum extraction logic from Memberships.tsx
  function extractPriceNum(priceStr: string | undefined | null): number {
    if (!priceStr) return NaN;
    return parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  }

  it("should parse numeric price correctly", () => {
    expect(extractPriceNum("$2,500")).toBe(2500);
    expect(extractPriceNum("$299")).toBe(299);
    expect(extractPriceNum("1500")).toBe(1500);
  });

  it("should return NaN for non-numeric prices", () => {
    expect(extractPriceNum("Consultar precio")).toBeNaN();
    expect(extractPriceNum("")).toBeNaN();
    expect(extractPriceNum(null)).toBeNaN();
    expect(extractPriceNum(undefined)).toBeNaN();
  });

  it("should handle hasValidPrice check correctly", () => {
    const hasValidPrice = (price: number) => !isNaN(price) && price > 0;

    expect(hasValidPrice(2500)).toBe(true);
    expect(hasValidPrice(299)).toBe(true);
    expect(hasValidPrice(0)).toBe(false);
    expect(hasValidPrice(NaN)).toBe(false);
    expect(hasValidPrice(-100)).toBe(false);
  });
});

// ─── Unit tests for cashback calculation ───
describe("Cashback calculation", () => {
  function calculateCashback(priceInCents: number, cashbackPercent: number): number {
    return Math.round(priceInCents * cashbackPercent / 100);
  }

  it("should calculate 1% cashback correctly", () => {
    // $2,500 MXN = 250000 centavos → 1% = 2500 centavos = $25.00
    expect(calculateCashback(250000, 1)).toBe(2500);
  });

  it("should calculate 5% cashback correctly", () => {
    // $2,500 MXN = 250000 centavos → 5% = 12500 centavos = $125.00
    expect(calculateCashback(250000, 5)).toBe(12500);
  });

  it("should handle small amounts", () => {
    // $10 MXN = 1000 centavos → 1% = 10 centavos = $0.10
    expect(calculateCashback(1000, 1)).toBe(10);
  });

  it("should handle zero price", () => {
    expect(calculateCashback(0, 1)).toBe(0);
  });

  it("should round to nearest centavo", () => {
    // $333 MXN = 33300 centavos → 1% = 333 centavos = $3.33
    expect(calculateCashback(33300, 1)).toBe(333);
  });
});

// ─── Unit tests for wallet balance after redemption ───
describe("Wallet balance after redemption", () => {
  function calculateCheckoutWithWallet(
    totalCents: number,
    walletBalanceCents: number,
    useWallet: boolean
  ) {
    const walletUsed = useWallet ? Math.min(walletBalanceCents, totalCents) : 0;
    const remaining = totalCents - walletUsed;
    const fullyCoveredByWallet = remaining === 0 && useWallet;

    return { walletUsed, remaining, fullyCoveredByWallet };
  }

  it("should cover full amount with wallet if balance is sufficient", () => {
    const result = calculateCheckoutWithWallet(250000, 300000, true);
    expect(result.walletUsed).toBe(250000);
    expect(result.remaining).toBe(0);
    expect(result.fullyCoveredByWallet).toBe(true);
  });

  it("should partially cover with wallet if balance is insufficient", () => {
    const result = calculateCheckoutWithWallet(250000, 100000, true);
    expect(result.walletUsed).toBe(100000);
    expect(result.remaining).toBe(150000);
    expect(result.fullyCoveredByWallet).toBe(false);
  });

  it("should not use wallet when useWallet is false", () => {
    const result = calculateCheckoutWithWallet(250000, 300000, false);
    expect(result.walletUsed).toBe(0);
    expect(result.remaining).toBe(250000);
    expect(result.fullyCoveredByWallet).toBe(false);
  });

  it("should handle exact balance match", () => {
    const result = calculateCheckoutWithWallet(250000, 250000, true);
    expect(result.walletUsed).toBe(250000);
    expect(result.remaining).toBe(0);
    expect(result.fullyCoveredByWallet).toBe(true);
  });

  it("should handle zero wallet balance", () => {
    const result = calculateCheckoutWithWallet(250000, 0, true);
    expect(result.walletUsed).toBe(0);
    expect(result.remaining).toBe(250000);
    expect(result.fullyCoveredByWallet).toBe(false);
  });
});

// ─── Unit tests for QR code wallet number extraction ───
describe("QR code wallet number extraction", () => {
  function extractWalletNumber(qrText: string): string | null {
    const match = qrText.match(/NTR[A-Z0-9]+/i);
    if (match) return match[0].toUpperCase();
    if (qrText.startsWith("NTR")) return qrText.toUpperCase();
    return null;
  }

  it("should extract wallet number from full URL", () => {
    expect(extractWalletNumber("https://nutriserpv.com/monedero/NTR7A8B9C")).toBe("NTR7A8B9C");
  });

  it("should extract wallet number from plain text", () => {
    expect(extractWalletNumber("NTR12345678")).toBe("NTR12345678");
  });

  it("should handle lowercase", () => {
    expect(extractWalletNumber("ntr7a8b9c")).toBe("NTR7A8B9C");
  });

  it("should return null for invalid QR", () => {
    expect(extractWalletNumber("https://example.com")).toBeNull();
    expect(extractWalletNumber("random text")).toBeNull();
  });
});

// ─── Unit tests for presential purchase cashback ───
describe("Presential purchase cashback", () => {
  it("should calculate cashback from custom price and percentage", () => {
    const customPrice = 2500; // $2,500 MXN
    const cashbackPercent = 1;
    const priceInCents = Math.round(customPrice * 100);
    const cashbackAmount = Math.round(priceInCents * cashbackPercent / 100);

    expect(priceInCents).toBe(250000);
    expect(cashbackAmount).toBe(2500); // $25.00 MXN
  });

  it("should handle custom cashback percentage", () => {
    const customPrice = 1000; // $1,000 MXN
    const cashbackPercent = 3;
    const priceInCents = Math.round(customPrice * 100);
    const cashbackAmount = Math.round(priceInCents * cashbackPercent / 100);

    expect(cashbackAmount).toBe(3000); // $30.00 MXN
  });
});
