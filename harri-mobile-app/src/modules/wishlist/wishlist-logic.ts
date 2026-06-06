import type { CatalogProduct } from "@/modules/catalog/types";
import { isWishlistItemMatch, type WishlistItem } from "@/modules/wishlist/types";

export function toggleWishlistItem(items: WishlistItem[], product: CatalogProduct) {
  const exists = items.some((item) => isWishlistItemMatch(item, product.id));
  if (exists) {
    return items.filter((item) => !isWishlistItemMatch(item, product.id));
  }

  return [product, ...items];
}

export function removeWishlistItem(items: WishlistItem[], productId: string) {
  return items.filter((item) => !isWishlistItemMatch(item, productId));
}
