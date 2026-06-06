import { useEffect, useState } from "react";

import { fetchCouponOffers } from "@/modules/coupons/api";
import type { CouponOffer } from "@/modules/coupons/types";

export function useCouponOffers() {
  const [data, setData] = useState<CouponOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchCouponOffers()
      .then((offers) => {
        if (!active) return;
        setData(offers);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Kuponlar yuklenemedi.");
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
  };
}
