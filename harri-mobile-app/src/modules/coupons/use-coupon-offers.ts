import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { fetchCouponOffers } from "@/modules/coupons/api";
import type { CouponOffer } from "@/modules/coupons/types";

const FOCUS_REFRESH_INTERVAL_MS = 30_000;

export function useCouponOffers() {
  const [data, setData] = useState<CouponOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestDataRef = useRef<CouponOffer[]>([]);
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  const loadOffers = useCallback(async (options?: { force?: boolean }) => {
    const shouldShowLoading = latestDataRef.current.length === 0;
    if (shouldShowLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const offers = await fetchCouponOffers(options);
      setData(offers);
      setError(null);
      lastRefreshAtRef.current = Date.now();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Kuponlar yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  useFocusEffect(
    useCallback(() => {
      if (Date.now() - lastRefreshAtRef.current > FOCUS_REFRESH_INTERVAL_MS) {
        void loadOffers({ force: true });
      }

      return undefined;
    }, [loadOffers])
  );

  return {
    data,
    isLoading,
    error,
    refresh: () => loadOffers({ force: true }),
  };
}
