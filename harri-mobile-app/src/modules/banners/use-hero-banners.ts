import { useEffect, useState } from "react";

import { fetchHeroBanners } from "@/modules/banners/api";
import type { HeroBanner } from "@/modules/banners/types";

export function useHeroBanners() {
  const [data, setData] = useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
