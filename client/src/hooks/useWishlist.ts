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

// La clave incluye el patientId para que cada usuario tenga su propia lista.
// Si no hay usuario autenticado, se usa una clave temporal que se limpia al
// detectar que no hay sesión.
const STORAGE_KEY_PREFIX = "nutriser-wishlist";
const SESSION_KEY = "nutriser_patient";

function getStorageKey(): string {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const patient = JSON.parse(raw);
      if (patient?.id) return `${STORAGE_KEY_PREFIX}-${patient.id}`;
    }
  } catch { /* ignore */ }
  return `${STORAGE_KEY_PREFIX}-guest`;
}

function loadWishlist(): WishlistItem[] {
  try {
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveWishlist(items: WishlistItem[]) {
  try {
    const key = getStorageKey();
    if (items.length > 0) {
      localStorage.setItem(key, JSON.stringify(items));
    } else {
      localStorage.removeItem(key);
    }
  } catch { /* ignore */ }
}

export function useWishlist(patientId?: number) {
  // Re-inicializar la lista cuando cambia el patientId (login/logout)
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    // Si hay patientId, cargar la lista de ese usuario específico
    if (patientId) {
      try {
        const key = `${STORAGE_KEY_PREFIX}-${patientId}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
      } catch { return []; }
    }
    // Sin usuario: lista vacía (no cargar la del guest)
    return [];
  });

  // Cuando cambia el patientId, recargar la lista del usuario correcto
  useEffect(() => {
    if (patientId) {
      try {
        const key = `${STORAGE_KEY_PREFIX}-${patientId}`;
        const saved = localStorage.getItem(key);
        setWishlist(saved ? JSON.parse(saved) : []);
      } catch {
        setWishlist([]);
      }
    } else {
      // Sin usuario autenticado: limpiar la lista en memoria
      setWishlist([]);
    }
  }, [patientId]);

  // Sync to localStorage on every change
  useEffect(() => {
    if (patientId) {
      const key = `${STORAGE_KEY_PREFIX}-${patientId}`;
      if (wishlist.length > 0) {
        localStorage.setItem(key, JSON.stringify(wishlist));
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [wishlist, patientId]);

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
