import { formatTryPrice } from "@harri/commerce-contracts";

import type { CatalogProduct } from "@/modules/catalog/types";

export type CartLineItem = {
  productId: string;
  title: string;
  brand: string;
  parentCategory: string;
  category: string;
  imageUrl: string | null;
  price: number;
  priceText: string;
  quantity: number;
  stockQuantity: number;
};

export type CartSeedItem = Omit<CartLineItem, "quantity" | "priceText"> & {
  quantity?: number;
  priceText?: string;
};

export function toCartLineItem(product: CatalogProduct, quantity: number): CartLineItem {
  return {
    productId: product.id,
    title: product.title,
    brand: product.brand,
    parentCategory: product.parentCategory,
    category: product.category,
    imageUrl: product.imageUrl,
    price: product.price,
    priceText: product.priceText,
    quantity,
    stockQuantity: product.stockQuantity,
  };
}

export function toCartSeedLineItem(item: CartSeedItem, quantity: number): CartLineItem {
  return {
    ...item,
    quantity,
    priceText: item.priceText || formatTryPrice(item.price),
  };
}
