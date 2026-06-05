import type { CatalogProduct } from "@/modules/catalog/types";

export type CartLineItem = {
  productId: string;
  title: string;
  brand: string;
  imageUrl: string | null;
  price: number;
  priceText: string;
  quantity: number;
  stockQuantity: number;
};

export function toCartLineItem(product: CatalogProduct, quantity: number): CartLineItem {
  return {
    productId: product.id,
    title: product.title,
    brand: product.brand,
    imageUrl: product.imageUrl,
    price: product.price,
    priceText: product.priceText,
    quantity,
    stockQuantity: product.stockQuantity,
  };
}
