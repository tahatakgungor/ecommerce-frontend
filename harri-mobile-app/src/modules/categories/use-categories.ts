import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { fetchCategories, getFallbackCategories } from "@/modules/categories/api";
import type { CategoryItem } from "@/modules/categories/types";

const FOCUS_REFRESH_INTERVAL_MS = 30_000;

export function useCategories() {
  const [data, setData] = useState<CategoryItem[]>(() => getFallbackCategories());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastRefreshAtRef = useRef(0);

  const loadCategories = useCallback(async (options?: { force?: boolean }) => {
    setError(null);
    try {
      const categories = await fetchCategories(options);
      setData(categories);
      lastRefreshAtRef.current = Date.now();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Kategoriler yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useFocusEffect(
    useCallback(() => {
      if (Date.now() - lastRefreshAtRef.current > FOCUS_REFRESH_INTERVAL_MS) {
        void loadCategories({ force: true });
      }

      return undefined;
    }, [loadCategories])
  );

  return {
    data,
    isLoading,
    error,
    refresh: () => loadCategories({ force: true }),
  };
}
