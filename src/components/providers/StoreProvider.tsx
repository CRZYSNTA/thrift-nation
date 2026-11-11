"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MotionConfig } from "framer-motion";
import { SessionProvider, useSession } from "next-auth/react";
import type { ProductCardItem } from "@/types/catalog";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  size: string;
  condition: string;
  image: string;
  quantity: number;
  maxStock: number;
}

interface StoreContextValue {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  wishlistIds: string[];
  isCartOpen: boolean;
  isSearchOpen: boolean;
  quickViewProduct: ProductCardItem | null;
  toastMessage: string | null;
  addToCart: (product: ProductCardItem, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string, productName?: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openQuickView: (product: ProductCardItem) => void;
  closeQuickView: () => void;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "tn_cart_v1";
const WISHLIST_STORAGE_KEY = "tn_wishlist_v1";

function StoreProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] =
    useState<ProductCardItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Hydrate cart & wishlist from localStorage asynchronously to avoid synchronous setState in effect
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) setCart(parsed);
        }
        const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (savedWishlist) {
          const parsed = JSON.parse(savedWishlist);
          if (Array.isArray(parsed)) setWishlistIds(parsed);
        }
      } catch {
        // Ignore malformed storage
      } finally {
        setHydrated(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore quota errors
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore quota errors
    }
  }, [wishlistIds, hydrated]);

  // Sync wishlist with database if authenticated
  useEffect(() => {
    if (!session?.user?.id) return;
    let active = true;
    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && Array.isArray(data.productIds)) {
          setWishlistIds((prev) =>
            Array.from(new Set([...prev, ...data.productIds]))
          );
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const addToCart = useCallback(
    (product: ProductCardItem, quantity = 1) => {
      if (product.stockQuantity <= 0) {
        showToast("This one-of-a-kind piece has already been claimed.");
        return;
      }

      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          if (existing.quantity >= product.stockQuantity) {
            showToast("Maximum available archive quantity reached in bag.");
            return prev;
          }
          const nextQty = Math.min(
            existing.quantity + quantity,
            product.stockQuantity
          );
          return prev.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: nextQty, maxStock: product.stockQuantity }
              : item
          );
        }

        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            price: product.price,
            originalPrice: product.originalPriceVerified
              ? product.originalPrice
              : null,
            size: product.size,
            condition: product.condition,
            image: product.images[0]?.url || "/images/prod-trench.jpg",
            quantity: Math.min(quantity, product.stockQuantity),
            maxStock: product.stockQuantity,
          },
        ];
      });
      setIsCartOpen(true);
    },
    [showToast]
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
        return;
      }
      setCart((prev) =>
        prev.map((item) => {
          if (item.productId !== productId) return item;
          const clamped = Math.min(quantity, item.maxStock);
          if (quantity > item.maxStock) {
            showToast("Only " + item.maxStock + " piece available in archive.");
          }
          return { ...item, quantity: clamped };
        })
      );
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback(
    async (productId: string, productName?: string) => {
      const exists = wishlistIds.includes(productId);
      setWishlistIds((prev) =>
        exists ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
      showToast(
        exists
          ? "Removed from your wishlist"
          : productName
            ? `${productName} saved to wishlist`
            : "Saved to wishlist"
      );

      if (session?.user?.id) {
        try {
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
        } catch {
          // Local wishlist persists
        }
      }
    },
    [wishlistIds, session?.user?.id, showToast]
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      cartCount,
      cartSubtotal,
      wishlistIds,
      isCartOpen,
      isSearchOpen,
      quickViewProduct,
      toastMessage,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      openSearch: () => setIsSearchOpen(true),
      closeSearch: () => setIsSearchOpen(false),
      openQuickView: (p) => setQuickViewProduct(p),
      closeQuickView: () => setQuickViewProduct(null),
      showToast,
    }),
    [
      cart,
      cartCount,
      cartSubtotal,
      wishlistIds,
      isCartOpen,
      isSearchOpen,
      quickViewProduct,
      toastMessage,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      showToast,
    ]
  );

  return (
    <MotionConfig reducedMotion="user">
      <StoreContext.Provider value={value}>
        {children}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 bg-charcoal px-6 py-3 text-xs tracking-[0.14em] uppercase text-ivory shadow-lg border border-ivory/15"
          >
            {toastMessage}
          </div>
        )}
      </StoreContext.Provider>
    </MotionConfig>
  );
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StoreProviderInner>{children}</StoreProviderInner>
    </SessionProvider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return ctx;
}
