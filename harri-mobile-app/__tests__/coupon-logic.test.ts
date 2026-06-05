import { calculateCouponEligibleTotal, validateCouponForCheckout } from "../src/modules/coupons/logic";
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

const publicCoupon: CouponOffer = {
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

const assignedCoupon: CouponOffer = {
  ...publicCoupon,
  couponCode: "USER15",
  scope: "USER",
  assignedUserEmail: "customer+smoke@test.invalid",
};

describe("coupon logic", () => {
  it("calculates eligible total for matching category coupon", () => {
    expect(calculateCouponEligibleTotal(items, publicCoupon)).toBe(240);
  });

  it("validates public coupon when subtotal and category match", () => {
    expect(validateCouponForCheckout(items, publicCoupon, "")).toEqual({
      ok: true,
      eligibleTotal: 240,
      discountAmount: 24,
    });
  });

  it("rejects assigned coupon for wrong email", () => {
    expect(validateCouponForCheckout(items, assignedCoupon, "someone@example.com")).toEqual({
      ok: false,
      reason: "Bu kupon yalnizca atanmis kullanici hesabinda gecerli.",
    });
  });

  it("rejects coupon when cart does not match product type", () => {
    expect(
      validateCouponForCheckout(items, {
        ...publicCoupon,
        productType: "kozmetik",
      }, "")
    ).toEqual({
      ok: false,
      reason: "Bu kupon sepetteki urunlere uygulanamiyor.",
    });
  });
});
