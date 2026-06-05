import { calculateCheckoutTotals, splitCustomerName, toCheckoutCartItems } from "../src/modules/checkout/checkout-logic";
import type { CartLineItem } from "../src/modules/cart/types";

const items: CartLineItem[] = [
  {
    productId: "product-1",
    title: "Humata Leo",
    brand: "SERRAVIT",
    parentCategory: "Yasam",
    category: "Takviye",
    imageUrl: null,
    price: 120,
    priceText: "₺120",
    quantity: 2,
    stockQuantity: 10,
  },
  {
    productId: "product-2",
    title: "Aloe",
    brand: "SERRAVIT",
    parentCategory: "Yasam",
    category: "Detoks",
    imageUrl: null,
    price: 200,
    priceText: "₺200",
    quantity: 1,
    stockQuantity: 5,
  },
];

describe("checkout logic", () => {
  it("calculates shipping and total with free shipping threshold", () => {
    const totals = calculateCheckoutTotals(items);

    expect(totals.subtotal).toBe(440);
    expect(totals.shippingCost).toBe(0);
    expect(totals.totalAmount).toBe(440);
    expect(totals.isFreeShipping).toBe(true);
  });

  it("maps cart items to backend checkout payload", () => {
    const payload = toCheckoutCartItems(items);

    expect(payload[0]).toMatchObject({
      _id: "product-1",
      title: "Humata Leo",
      orderQuantity: 2,
      parent: "Yasam",
      category: {
        name: "Takviye",
      },
    });
  });

  it("splits customer name for checkout init payload", () => {
    expect(splitCustomerName("  Tahat   Takgungor ")).toEqual({
      firstName: "Tahat",
      lastName: "Takgungor",
    });
  });
});
