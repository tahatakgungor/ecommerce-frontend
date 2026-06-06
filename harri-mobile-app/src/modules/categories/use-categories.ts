import { useEffect, useState } from "react";

import { fetchCategories, getFallbackCategories } from "@/modules/categories/api";
import type { CategoryItem } from "@/modules/categories/types";

export function useCategories() {
  const [data, setData] = useState<CategoryItem[]>(() => getFallbackCategories());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchCategories()
      .then((categories) => {
        if (!active) return;
        setData(categories);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Kategoriler yuklenemedi.");
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
