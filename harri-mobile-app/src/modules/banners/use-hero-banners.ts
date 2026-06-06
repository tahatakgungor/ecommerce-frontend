import { useEffect, useState } from "react";

import { buildFallbackBanners, fetchHeroBanners } from "@/modules/banners/api";
import type { HeroBanner } from "@/modules/banners/types";

export function useHeroBanners() {
  const [data, setData] = useState<HeroBanner[]>(() => buildFallbackBanners());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchHeroBanners()
      .then((banners) => {
        if (!active) return;
        setData(banners);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Bannerlar alınamadı.");
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
