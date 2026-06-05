import { formatTryPrice } from "@harri/commerce-contracts";

import type { CartLineItem } from "@/modules/cart/types";
import type { CheckoutCartItemPayload, CheckoutTotals } from "@/modules/checkout/types";

const FREE_SHIPPING_THRESHOLD = 400;
const DEFAULT_SHIPPING_FEE = 49.9;

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function calculateCheckoutTotals(items: CartLineItem[]): CheckoutTotals {
  const subtotal = roundCurrency(items.reduce((total, item) => total + item.price * item.quantity, 0));
  const shippingCost = roundCurrency(subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : DEFAULT_SHIPPING_FEE);
  const totalAmount = roundCurrency(subtotal + shippingCost);
  const remainingForFreeShipping = roundCurrency(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal));

  return {
    subtotal,
    shippingCost,
    totalAmount,
    remainingForFreeShipping,
    isFreeShipping: shippingCost === 0,
    subtotalText: formatTryPrice(subtotal),
    shippingText: shippingCost === 0 ? "Ucretsiz" : formatTryPrice(shippingCost),
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
