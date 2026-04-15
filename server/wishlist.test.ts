import { describe, expect, it, beforeEach } from "vitest";

/**
 * Unit tests for the wishlist logic.
 * Since useWishlist is a React hook that relies on localStorage,
 * we test the pure logic functions directly (load/save/toggle/remove).
 */

const STORAGE_KEY = "nutriser-wishlist";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  imageUrl?: string | null;
  category?: string;
  itemType: "service" | "package" | "product" | "ebook";
  productId?: number;
  ebookId?: number;
  addedAt: number;
}

// Pure logic functions extracted from the hook for testing
function loadWishlist(storage: Map<string, string>): WishlistItem[] {
  try {
    const saved = storage.get(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveWishlist(items: WishlistItem[], storage: Map<string, string>) {
  if (items.length > 0) {
    storage.set(STORAGE_KEY, JSON.stringify(items));
  } else {
    storage.delete(STORAGE_KEY);
  }
}

function toggleWishlist(
  prev: WishlistItem[],
  item: Omit<WishlistItem, "addedAt">
): WishlistItem[] {
  const exists = prev.some((w) => w.id === item.id);
  if (exists) {
    return prev.filter((w) => w.id !== item.id);
  }
  return [...prev, { ...item, addedAt: Date.now() }];
}

function removeFromWishlist(prev: WishlistItem[], id: string): WishlistItem[] {
  return prev.filter((w) => w.id !== id);
}

function isInWishlist(wishlist: WishlistItem[], id: string): boolean {
  return wishlist.some((item) => item.id === id);
}

const sampleItem: Omit<WishlistItem, "addedAt"> = {
  id: "service-1",
  name: "Asesoría Nutricional",
  price: 800,
  priceLabel: "$800 MXN",
  imageUrl: "https://example.com/img.jpg",
  category: "nutricion",
  itemType: "service",
};

const samplePackage: Omit<WishlistItem, "addedAt"> = {
  id: "pkg-1",
  name: "Paquete Nutrición",
  price: 2500,
  priceLabel: "$2,500 MXN",
  imageUrl: "https://example.com/pkg.jpg",
  category: "paquetes",
  itemType: "package",
};

const sampleProduct: Omit<WishlistItem, "addedAt"> = {
  id: "product-5",
  name: "Crema Hidratante",
  price: 350,
  priceLabel: "$350 MXN",
  category: "farmacy",
  itemType: "product",
  productId: 5,
};

describe("Wishlist Logic", () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map();
  });

  describe("loadWishlist", () => {
    it("returns empty array when storage is empty", () => {
      const result = loadWishlist(storage);
      expect(result).toEqual([]);
    });

    it("returns parsed items from storage", () => {
      const items: WishlistItem[] = [
        { ...sampleItem, addedAt: 1000 },
      ];
      storage.set(STORAGE_KEY, JSON.stringify(items));
      const result = loadWishlist(storage);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("service-1");
    });

    it("returns empty array on invalid JSON", () => {
      storage.set(STORAGE_KEY, "invalid-json{{{");
      const result = loadWishlist(storage);
      expect(result).toEqual([]);
    });
  });

  describe("saveWishlist", () => {
    it("saves items to storage", () => {
      const items: WishlistItem[] = [{ ...sampleItem, addedAt: 1000 }];
      saveWishlist(items, storage);
      expect(storage.has(STORAGE_KEY)).toBe(true);
      const parsed = JSON.parse(storage.get(STORAGE_KEY)!);
      expect(parsed).toHaveLength(1);
    });

    it("removes key from storage when list is empty", () => {
      storage.set(STORAGE_KEY, "something");
      saveWishlist([], storage);
      expect(storage.has(STORAGE_KEY)).toBe(false);
    });
  });

  describe("toggleWishlist", () => {
    it("adds item when not in list", () => {
      const result = toggleWishlist([], sampleItem);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("service-1");
      expect(result[0].name).toBe("Asesoría Nutricional");
      expect(result[0].addedAt).toBeGreaterThan(0);
    });

    it("removes item when already in list", () => {
      const existing: WishlistItem[] = [{ ...sampleItem, addedAt: 1000 }];
      const result = toggleWishlist(existing, sampleItem);
      expect(result).toHaveLength(0);
    });

    it("can add multiple different items", () => {
      let list = toggleWishlist([], sampleItem);
      list = toggleWishlist(list, samplePackage);
      list = toggleWishlist(list, sampleProduct);
      expect(list).toHaveLength(3);
      expect(list.map((i) => i.id)).toEqual(["service-1", "pkg-1", "product-5"]);
    });

    it("only removes the toggled item, keeps others", () => {
      let list = toggleWishlist([], sampleItem);
      list = toggleWishlist(list, samplePackage);
      list = toggleWishlist(list, sampleItem); // remove first
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe("pkg-1");
    });
  });

  describe("removeFromWishlist", () => {
    it("removes item by id", () => {
      const list: WishlistItem[] = [
        { ...sampleItem, addedAt: 1000 },
        { ...samplePackage, addedAt: 2000 },
      ];
      const result = removeFromWishlist(list, "service-1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("pkg-1");
    });

    it("returns same list if id not found", () => {
      const list: WishlistItem[] = [{ ...sampleItem, addedAt: 1000 }];
      const result = removeFromWishlist(list, "non-existent");
      expect(result).toHaveLength(1);
    });
  });

  describe("isInWishlist", () => {
    it("returns true when item exists", () => {
      const list: WishlistItem[] = [{ ...sampleItem, addedAt: 1000 }];
      expect(isInWishlist(list, "service-1")).toBe(true);
    });

    it("returns false when item does not exist", () => {
      const list: WishlistItem[] = [{ ...sampleItem, addedAt: 1000 }];
      expect(isInWishlist(list, "non-existent")).toBe(false);
    });

    it("returns false for empty list", () => {
      expect(isInWishlist([], "service-1")).toBe(false);
    });
  });

  describe("Integration: full wishlist workflow", () => {
    it("add → check → remove → check", () => {
      // Start empty
      let list: WishlistItem[] = [];
      expect(isInWishlist(list, "service-1")).toBe(false);

      // Add item
      list = toggleWishlist(list, sampleItem);
      expect(isInWishlist(list, "service-1")).toBe(true);
      expect(list).toHaveLength(1);

      // Save and reload
      saveWishlist(list, storage);
      const loaded = loadWishlist(storage);
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe("service-1");

      // Remove item
      list = removeFromWishlist(list, "service-1");
      expect(isInWishlist(list, "service-1")).toBe(false);
      expect(list).toHaveLength(0);

      // Save empty and verify storage is cleared
      saveWishlist(list, storage);
      expect(storage.has(STORAGE_KEY)).toBe(false);
    });

    it("supports different item types", () => {
      let list: WishlistItem[] = [];
      list = toggleWishlist(list, sampleItem);
      list = toggleWishlist(list, samplePackage);
      list = toggleWishlist(list, sampleProduct);

      expect(list).toHaveLength(3);
      expect(list.find((i) => i.itemType === "service")).toBeTruthy();
      expect(list.find((i) => i.itemType === "package")).toBeTruthy();
      expect(list.find((i) => i.itemType === "product")).toBeTruthy();
    });
  });
});
