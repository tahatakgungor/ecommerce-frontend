import type { CatalogProduct } from "@/modules/catalog/types";
import { CartLineItem, CartSeedItem, toCartLineItem, toCartSeedLineItem } from "@/modules/cart/types";

export function addCartItem(
  currentItems: CartLineItem[],
  product: CatalogProduct,
  quantity = 1
) {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  const existingItem = currentItems.find((item) => item.productId === product.id);

  if (!existingItem) {
    return [...currentItems, toCartLineItem(product, safeQuantity)];
  }

  const maxQuantity = existingItem.stockQuantity > 0 ? existingItem.stockQuantity : Infinity;
  const nextQuantity = Math.min(existingItem.quantity + safeQuantity, maxQuantity);

  return currentItems.map((item) =>
    item.productId === product.id ? { ...item, quantity: nextQuantity } : item
  );
}

export function updateCartItemQuantity(
  currentItems: CartLineItem[],
  productId: string,
  quantity: number
) {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  return currentItems.map((item) => {
    if (item.productId !== productId) return item;
    const maxQuantity = item.stockQuantity > 0 ? item.stockQuantity : Infinity;
    return { ...item, quantity: Math.min(safeQuantity, maxQuantity) };
  });
}

export function removeCartItem(currentItems: CartLineItem[], productId: string) {
  return currentItems.filter((item) => item.productId !== productId);
}

export function addCartSeedItem(currentItems: CartLineItem[], item: CartSeedItem) {
  const safeQuantity = Math.max(1, Math.floor(item.quantity || 1));
  const existingItem = currentItems.find((entry) => entry.productId === item.productId);

  if (!existingItem) {
    return [...currentItems, toCartSeedLineItem(item, safeQuantity)];
  }

  const maxQuantity = existingItem.stockQuantity > 0 ? existingItem.stockQuantity : Infinity;
  const nextQuantity = Math.min(existingItem.quantity + safeQuantity, maxQuantity);

  return currentItems.map((entry) => (entry.productId === item.productId ? { ...entry, quantity: nextQuantity } : entry));
}
