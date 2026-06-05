import { useEffect, useState } from "react";

import { fetchCatalogSnapshot } from "@/modules/catalog/api";
import type { CatalogSnapshot } from "@/modules/catalog/types";

type CatalogSnapshotState = {
  data: CatalogSnapshot | null;
  isLoading: boolean;
  error: string | null;
};

export function useCatalogSnapshot(page = 1, size = 8) {
  const [state, setState] = useState<CatalogSnapshotState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    setState((current) => ({
      data: current.data,
      isLoading: true,
      error: null,
    }));

    fetchCatalogSnapshot(page, size)
      .then((data) => {
        if (!active) return;
        setState({
          data,
          isLoading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (!active) return;
        setState({
          data: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });

    return () => {
      active = false;
    };
  }, [page, size]);

  return state;
}
