import { addCartItem, removeCartItem, updateCartItemQuantity } from "../src/modules/cart/cart-logic";
import type { CatalogProduct } from "../src/modules/catalog/types";

const product: CatalogProduct = {
  id: "product-1",
  title: "Humata Leo",
  description: "Aciklama",
  brand: "SERRAVIT",
  category: "Takviye",
  parentCategory: "Yasam",
  childCategory: "Alt",
  imageUrl: null,
  gallery: [],
  price: 1200,
  priceText: "₺1.200",
  originalPrice: 1500,
  originalPriceText: "₺1.500",
  discount: 20,
  stockQuantity: 4,
  tags: [],
  colors: [],
  sku: "SKU-1",
  status: "Active",
};

describe("cart logic", () => {
  it("adds a new product to the cart", () => {
    const items = addCartItem([], product, 2);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      productId: "product-1",
      quantity: 2,
      price: 1200,
    });
  });

  it("caps quantity at available stock when the same product is added again", () => {
    const initial = addCartItem([], product, 3);
    const updated = addCartItem(initial, product, 3);

    expect(updated[0]?.quantity).toBe(4);
  });

  it("prevents quantity decrement below one and supports item removal", () => {
    const initial = addCartItem([], product, 2);
    const reduced = updateCartItemQuantity(initial, "product-1", 0);
    const removed = removeCartItem(reduced, "product-1");

    expect(reduced[0]?.quantity).toBe(1);
    expect(removed).toHaveLength(0);
  });
});
