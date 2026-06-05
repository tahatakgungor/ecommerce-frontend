import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import { readJsonValue, writeJsonValue } from "@/lib/json-store";
import { formatTryPrice } from "@harri/commerce-contracts";
import type { CatalogProduct } from "@/modules/catalog/types";
import { addCartItem, removeCartItem, updateCartItemQuantity } from "@/modules/cart/cart-logic";
import { CartLineItem } from "@/modules/cart/types";

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
    persist(addCartItem(items, product, quantity));
  };

  const removeItem = (productId: string) => {
    persist(removeCartItem(items, productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    persist(updateCartItemQuantity(items, productId, quantity));
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
