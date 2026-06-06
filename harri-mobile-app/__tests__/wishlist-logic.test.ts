import type { CatalogProduct } from "../src/modules/catalog/types";
import { removeWishlistItem, toggleWishlistItem } from "../src/modules/wishlist/wishlist-logic";

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

describe("wishlist logic", () => {
  it("adds a new product when it is not present", () => {
    const items = toggleWishlistItem([], product);
    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe("product-1");
  });

  it("removes a product when toggled again", () => {
    const items = toggleWishlistItem([product], product);
    expect(items).toHaveLength(0);
  });

  it("removes a product by id", () => {
    const items = removeWishlistItem([product], "product-1");
    expect(items).toHaveLength(0);
  });
});
