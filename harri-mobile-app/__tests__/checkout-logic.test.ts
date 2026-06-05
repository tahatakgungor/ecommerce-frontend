import { calculateCheckoutTotals, splitCustomerName, toCheckoutCartItems } from "../src/modules/checkout/checkout-logic";
import type { CouponOffer } from "../src/modules/coupons/types";
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

const categoryCoupon: CouponOffer = {
  id: "coupon-1",
  title: "Takviye indirimi",
  couponCode: "TAKVIYE10",
  discountPercentage: 10,
  minimumAmount: 200,
  productType: "takviye",
  productScope: "CATEGORY",
  status: "Active",
  scope: "PUBLIC",
  assignedUserEmail: "",
  startTime: "",
  endTime: "",
};

describe("checkout logic", () => {
  it("calculates shipping and total with free shipping threshold", () => {
    const totals = calculateCheckoutTotals(items);

    expect(totals.subtotal).toBe(440);
    expect(totals.shippingCost).toBe(0);
    expect(totals.discountAmount).toBe(0);
    expect(totals.totalAmount).toBe(440);
    expect(totals.isFreeShipping).toBe(true);
  });

  it("calculates discount amount from coupon eligible category", () => {
    const totals = calculateCheckoutTotals(items, {
      freeShippingThreshold: 500,
      defaultShippingFee: 49.9,
      coupon: categoryCoupon,
    });

    expect(totals.subtotal).toBe(440);
    expect(totals.shippingCost).toBe(49.9);
    expect(totals.discountAmount).toBe(24);
    expect(totals.totalAmount).toBe(465.9);
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
