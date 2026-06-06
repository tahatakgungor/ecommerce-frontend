import type { CatalogProduct } from "@/modules/catalog/types";

export type WishlistItem = CatalogProduct;

export function isWishlistItemMatch(item: WishlistItem, productId: string) {
  return item.id === productId;
}
