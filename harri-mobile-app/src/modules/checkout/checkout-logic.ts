import { formatTryPrice } from "@harri/commerce-contracts";

import type { CartLineItem } from "@/modules/cart/types";
import { calculateCouponEligibleTotal } from "@/modules/coupons/logic";
import type { CouponOffer } from "@/modules/coupons/types";
import type { CheckoutCartItemPayload, CheckoutTotals } from "@/modules/checkout/types";

const DEFAULT_FREE_SHIPPING_THRESHOLD = 400;
const DEFAULT_SHIPPING_FEE = 49.9;

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function calculateCheckoutTotals(
  items: CartLineItem[],
  options?: {
    freeShippingThreshold?: number;
    defaultShippingFee?: number;
    coupon?: CouponOffer | null;
  }
): CheckoutTotals {
  const freeShippingThreshold =
    typeof options?.freeShippingThreshold === "number" && options.freeShippingThreshold > 0
      ? options.freeShippingThreshold
      : DEFAULT_FREE_SHIPPING_THRESHOLD;
  const defaultShippingFee =
    typeof options?.defaultShippingFee === "number" && options.defaultShippingFee >= 0
      ? options.defaultShippingFee
      : DEFAULT_SHIPPING_FEE;
  const subtotal = roundCurrency(items.reduce((total, item) => total + item.price * item.quantity, 0));
  const shippingCost = roundCurrency(subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : defaultShippingFee);
  const eligibleCouponTotal = options?.coupon ? calculateCouponEligibleTotal(items, options.coupon) : 0;
  const discountAmount = options?.coupon
    ? roundCurrency(eligibleCouponTotal * ((options.coupon.discountPercentage || 0) / 100))
    : 0;
  const totalAmount = roundCurrency(Math.max(0, subtotal + shippingCost - discountAmount));
  const remainingForFreeShipping = roundCurrency(Math.max(0, freeShippingThreshold - subtotal));

  return {
    subtotal,
    shippingCost,
    discountAmount,
    totalAmount,
    remainingForFreeShipping,
    isFreeShipping: shippingCost === 0,
    subtotalText: formatTryPrice(subtotal),
    shippingText: shippingCost === 0 ? "Ucretsiz" : formatTryPrice(shippingCost),
    discountText: discountAmount <= 0 ? "Yok" : `- ${formatTryPrice(discountAmount)}`,
    totalText: formatTryPrice(totalAmount),
  };
}

export function toCheckoutCartItems(items: CartLineItem[]): CheckoutCartItemPayload[] {
  return items.map((item) => ({
    _id: item.productId,
    title: item.title,
    price: item.price,
    quantity: item.stockQuantity,
    orderQuantity: item.quantity,
    parent: item.parentCategory,
    category: {
      name: item.category,
    },
  }));
}

export function splitCustomerName(fullName: string) {
  const safeName = fullName.trim().replace(/\s+/g, " ");
  if (!safeName) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  const parts = safeName.split(" ");
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") || "-",
  };
}
