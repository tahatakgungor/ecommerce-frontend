import { startTransition, useEffect, useState } from "react";

import { fetchCatalogSnapshot, getLocalCatalogSnapshot } from "@/modules/catalog/api";
import { serializeCatalogQuery, type CatalogQuery } from "@/modules/catalog/query";
import type { CatalogSnapshot } from "@/modules/catalog/types";

type CatalogSnapshotState = {
  data: CatalogSnapshot | null;
  isLoading: boolean;
  error: string | null;
};

export function useCatalogSnapshot(query: CatalogQuery = {}) {
  const [state, setState] = useState<CatalogSnapshotState>({
    data: null,
    isLoading: true,
    error: null,
  });
  const queryKey = serializeCatalogQuery(query);

  useEffect(() => {
    let active = true;

    setState((current) => ({
      data: current.data,
      isLoading: !current.data,
      error: null,
    }));

    getLocalCatalogSnapshot(query).then((localSnapshot) => {
      if (!active || !localSnapshot) return;
      startTransition(() => {
        setState((current) => ({
          data: current.data || localSnapshot,
          isLoading: false,
          error: current.error,
        }));
      });
    });

    fetchCatalogSnapshot(query)
      .then((data) => {
        if (!active) return;
        startTransition(() => {
          setState({
            data,
            isLoading: false,
            error: null,
          });
        });
      })
      .catch((error) => {
        if (!active) return;
        startTransition(() => {
          setState({
            data: null,
            isLoading: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        });
      });

    return () => {
      active = false;
    };
  }, [queryKey]);

  return state;
}
