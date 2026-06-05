import type { CartLineItem } from "@/modules/cart/types";
import type { CouponOffer } from "@/modules/coupons/types";

function normalizeText(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "");
}

function roundCurrency(value: number) {
  return Number(Number(value || 0).toFixed(2));
}

function isAllProductsScope(coupon: CouponOffer) {
  return normalizeText(coupon.productScope) === "all_products";
}

function getCouponCandidates(item: CartLineItem) {
  return [item.parentCategory, item.category].map(normalizeText).filter(Boolean);
}

export function calculateCouponEligibleTotal(items: CartLineItem[], coupon: CouponOffer) {
  if (isAllProductsScope(coupon)) {
    return roundCurrency(items.reduce((total, item) => total + item.price * item.quantity, 0));
  }

  const couponType = normalizeText(coupon.productType);
  if (!couponType) {
    return 0;
  }

  return roundCurrency(
    items.reduce((total, item) => {
      if (!getCouponCandidates(item).includes(couponType)) {
        return total;
      }
      return total + item.price * item.quantity;
    }, 0)
  );
}

export function validateCouponForCheckout(
  items: CartLineItem[],
  coupon: CouponOffer,
  customerEmail: string,
  now = new Date()
) {
  const normalizedEmail = normalizeText(customerEmail);
  const couponStatus = normalizeText(coupon.status);
  const couponScope = normalizeText(coupon.scope);
  const assignedUserEmail = normalizeText(coupon.assignedUserEmail);
  const subtotal = roundCurrency(items.reduce((total, item) => total + item.price * item.quantity, 0));

  if (couponStatus && couponStatus !== "active") {
    return { ok: false as const, reason: "Bu kupon su anda aktif degil." };
  }

  if (coupon.startTime) {
    const startTime = new Date(coupon.startTime);
    if (!Number.isNaN(startTime.getTime()) && startTime.getTime() > now.getTime()) {
      return { ok: false as const, reason: "Bu kupon henuz aktif degil." };
    }
  }

  if (coupon.endTime) {
    const endTime = new Date(coupon.endTime);
    if (!Number.isNaN(endTime.getTime()) && endTime.getTime() < now.getTime()) {
      return { ok: false as const, reason: "Bu kuponun suresi dolmus." };
    }
  }

  if (couponScope === "user") {
    if (!normalizedEmail) {
      return { ok: false as const, reason: "Bu kupon icin e-posta gerekli." };
    }

    if (assignedUserEmail && normalizedEmail !== assignedUserEmail) {
      return { ok: false as const, reason: "Bu kupon yalnizca atanmis kullanici hesabinda gecerli." };
    }
  }

  if (subtotal < coupon.minimumAmount) {
    return { ok: false as const, reason: `Kupon icin minimum sepet tutari ${coupon.minimumAmount} TL.` };
  }

  const eligibleTotal = calculateCouponEligibleTotal(items, coupon);
  if (eligibleTotal <= 0) {
    return { ok: false as const, reason: "Bu kupon sepetteki urunlere uygulanamiyor." };
  }

  return {
    ok: true as const,
    eligibleTotal,
    discountAmount: roundCurrency(eligibleTotal * (coupon.discountPercentage / 100)),
  };
}
