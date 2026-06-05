import { fetchJson } from "@/lib/http-client";
import type { CouponOffer } from "@/modules/coupons/types";

type CouponEnvelope = {
  data?: unknown;
};

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : Number(value || 0);
}

function toCouponOffer(rawCoupon: unknown): CouponOffer | null {
  if (!rawCoupon || typeof rawCoupon !== "object") {
    return null;
  }

  const coupon = rawCoupon as Record<string, unknown>;
  const couponCode = readText(coupon.couponCode);
  if (!couponCode) {
    return null;
  }

  return {
    id: readText(coupon._id) || readText(coupon.id) || couponCode,
    title: readText(coupon.title) || couponCode,
    couponCode,
    discountPercentage: Math.max(0, readNumber(coupon.discountPercentage)),
    minimumAmount: Math.max(0, readNumber(coupon.minimumAmount)),
    productType: readText(coupon.productType),
    productScope: readText(coupon.productScope),
    status: readText(coupon.status),
    scope: readText(coupon.scope),
    assignedUserEmail: readText(coupon.assignedUserEmail),
    startTime: readText(coupon.startTime),
    endTime: readText(coupon.endTime),
  };
}

export async function fetchCouponOffers() {
  const response = await fetchJson<CouponEnvelope | unknown[]>("/api/coupon");
  const rawCoupons = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
  return rawCoupons.map(toCouponOffer).filter(Boolean) as CouponOffer[];
}
