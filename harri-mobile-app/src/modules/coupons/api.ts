import { fetchJson } from "@/lib/http-client";
import type { CouponOffer } from "@/modules/coupons/types";

type CouponEnvelope = {
  data?: unknown;
};
const COUPON_CACHE_TTL_MS = 5 * 60 * 1000;

let couponOffersCache: { value: CouponOffer[]; expiresAt: number } | null = null;
let couponOffersRequest: Promise<CouponOffer[]> | null = null;

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

function normalizeCouponOffers(response: CouponEnvelope | unknown[]) {
  const rawCoupons = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
  return rawCoupons.map(toCouponOffer).filter(Boolean) as CouponOffer[];
}

export async function fetchCouponOffers(options?: { force?: boolean }) {
  const now = Date.now();
  if (!options?.force && couponOffersCache && couponOffersCache.expiresAt > now) {
    return couponOffersCache.value;
  }

  if (!options?.force && couponOffersRequest) {
    return couponOffersRequest;
  }

  couponOffersRequest = fetchJson<CouponEnvelope | unknown[]>("/api/coupon")
    .then((response) => {
      const normalized = normalizeCouponOffers(response);
      couponOffersCache = {
        value: normalized,
        expiresAt: Date.now() + COUPON_CACHE_TTL_MS,
      };
      return normalized;
    })
    .finally(() => {
      couponOffersRequest = null;
    });

  return couponOffersRequest;
}
