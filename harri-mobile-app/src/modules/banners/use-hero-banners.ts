import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { buildFallbackBanners, fetchHeroBanners } from "@/modules/banners/api";
import type { HeroBanner } from "@/modules/banners/types";

const FOCUS_REFRESH_INTERVAL_MS = 30_000;

export function useHeroBanners() {
  const [data, setData] = useState<HeroBanner[]>(() => buildFallbackBanners());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastRefreshAtRef = useRef(0);

  const loadBanners = useCallback(async (options?: { force?: boolean }) => {
    setError(null);
    try {
      const banners = await fetchHeroBanners(options);
      setData(banners);
      setError(null);
      lastRefreshAtRef.current = Date.now();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Bannerlar alınamadı.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  useFocusEffect(
    useCallback(() => {
      if (Date.now() - lastRefreshAtRef.current > FOCUS_REFRESH_INTERVAL_MS) {
        void loadBanners({ force: true });
      }

      return undefined;
    }, [loadBanners])
  );

  return {
    data,
    isLoading,
    error,
    refresh: () => loadBanners({ force: true }),
  };
}
