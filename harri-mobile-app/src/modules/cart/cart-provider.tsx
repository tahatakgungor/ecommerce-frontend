import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import { readJsonValue, writeJsonValue } from "@/lib/json-store";
import { formatTryPrice } from "@harri/commerce-contracts";
import type { CatalogProduct } from "@/modules/catalog/types";
import { CartLineItem, toCartLineItem } from "@/modules/cart/types";

const CART_STORAGE_KEY = "serravit.mobile.cart.v1";

type CartContextValue = {
  items: CartLineItem[];
  itemCount: number;
  subtotalText: string;
  isHydrating: boolean;
  addItem: (product: CatalogProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let active = true;
    readJsonValue<CartLineItem[]>(CART_STORAGE_KEY, []).then((storedItems) => {
      if (!active) return;
      setItems(Array.isArray(storedItems) ? storedItems : []);
      setIsHydrating(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const persist = (nextItems: CartLineItem[]) => {
    setItems(nextItems);
    void writeJsonValue(CART_STORAGE_KEY, nextItems);
  };

  const addItem = (product: CatalogProduct, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const existingItem = items.find((item) => item.productId === product.id);
    if (!existingItem) {
      persist([...items, toCartLineItem(product, safeQuantity)]);
      return;
    }

    const maxQuantity = existingItem.stockQuantity > 0 ? existingItem.stockQuantity : Infinity;
    const nextQuantity = Math.min(existingItem.quantity + safeQuantity, maxQuantity);
    persist(
      items.map((item) =>
        item.productId === product.id ? { ...item, quantity: nextQuantity } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    persist(items.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    persist(
      items.map((item) => {
        if (item.productId !== productId) return item;
        const maxQuantity = item.stockQuantity > 0 ? item.stockQuantity : Infinity;
        return { ...item, quantity: Math.min(safeQuantity, maxQuantity) };
      })
    );
  };

  const clearCart = () => {
    persist([]);
  };

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    return {
      items,
      itemCount,
      subtotalText: formatTryPrice(subtotal),
      isHydrating,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [isHydrating, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
