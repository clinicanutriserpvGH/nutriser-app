import { useState, useEffect, useCallback } from "react";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  imageUrl?: string | null;
  category?: string;
  itemType: "service" | "package" | "product" | "ebook";
  productId?: number;
  ebookId?: number;
  addedAt: number; // timestamp
}

const STORAGE_KEY = "nutriser-wishlist";

function loadWishlist(): WishlistItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveWishlist(items: WishlistItem[]) {
  try {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* ignore */ }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(loadWishlist);

  // Sync to localStorage on every change
  useEffect(() => {
    saveWishlist(wishlist);
  }, [wishlist]);

  const isInWishlist = useCallback(
    (id: string) => wishlist.some((item) => item.id === id),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (item: Omit<WishlistItem, "addedAt">) => {
      setWishlist((prev) => {
        const exists = prev.some((w) => w.id === item.id);
        if (exists) {
          return prev.filter((w) => w.id !== item.id);
        }
        return [...prev, { ...item, addedAt: Date.now() }];
      });
    },
    []
  );

  const removeFromWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  return {
    wishlist,
    wishlistCount: wishlist.length,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
  };
}
