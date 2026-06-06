import { useEffect, useState } from "react";

import { fetchCategories } from "@/modules/categories/api";
import type { CategoryItem } from "@/modules/categories/types";

export function useCategories() {
  const [data, setData] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
