import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import { readJsonValue, writeJsonValue } from "@/lib/json-store";
import type { CatalogProduct } from "@/modules/catalog/types";
import { removeWishlistItem, toggleWishlistItem } from "@/modules/wishlist/wishlist-logic";
import { isWishlistItemMatch, type WishlistItem } from "@/modules/wishlist/types";

const WISHLIST_STORAGE_KEY = "serravit.mobile.wishlist.v1";

type WishlistContextValue = {
  items: WishlistItem[];
  itemCount: number;
  isHydrating: boolean;
  hasItem: (productId: string) => boolean;
  toggleItem: (product: CatalogProduct) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let active = true;

    readJsonValue<WishlistItem[]>(WISHLIST_STORAGE_KEY, []).then((storedItems) => {
      if (!active) return;
      setItems(Array.isArray(storedItems) ? storedItems : []);
      setIsHydrating(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const persist = (nextItems: WishlistItem[]) => {
    setItems(nextItems);
    void writeJsonValue(WISHLIST_STORAGE_KEY, nextItems);
  };

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      itemCount: items.length,
      isHydrating,
      hasItem: (productId: string) => items.some((item) => isWishlistItemMatch(item, productId)),
      toggleItem: (product: CatalogProduct) => {
        persist(toggleWishlistItem(items, product));
      },
      removeItem: (productId: string) => {
        persist(removeWishlistItem(items, productId));
      },
      clearWishlist: () => {
        persist([]);
      },
    }),
    [isHydrating, items]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
