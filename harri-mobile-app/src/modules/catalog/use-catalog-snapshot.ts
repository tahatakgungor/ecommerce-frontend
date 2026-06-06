import { useFocusEffect } from "expo-router";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";

import { fetchCatalogSnapshot, getLocalCatalogSnapshot } from "@/modules/catalog/api";
import { serializeCatalogQuery, type CatalogQuery } from "@/modules/catalog/query";
import type { CatalogSnapshot } from "@/modules/catalog/types";

type CatalogSnapshotState = {
  data: CatalogSnapshot | null;
  isLoading: boolean;
  error: string | null;
};

const FOCUS_REFRESH_INTERVAL_MS = 30_000;

export function useCatalogSnapshot(query: CatalogQuery = {}) {
  const [state, setState] = useState<CatalogSnapshotState>({
    data: null,
    isLoading: true,
    error: null,
  });
  const queryKey = serializeCatalogQuery(query);
  const lastRefreshAtRef = useRef(0);

  const loadSnapshot = useCallback(async (options?: { force?: boolean }) => {
    setState((current) => ({
      data: current.data,
      isLoading: !current.data,
      error: null,
    }));

    const localSnapshot = await getLocalCatalogSnapshot(query);
    if (localSnapshot) {
      startTransition(() => {
        setState((current) => ({
          data: current.data || localSnapshot,
          isLoading: false,
          error: current.error,
        }));
      });
    }

    try {
      const data = await fetchCatalogSnapshot(query, options);
      startTransition(() => {
        setState({
          data,
          isLoading: false,
          error: null,
        });
      });
      lastRefreshAtRef.current = Date.now();
    } catch (error) {
      startTransition(() => {
        setState((current) => ({
          data: current.data,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      });
    }
  }, [query]);

  useEffect(() => {
    void loadSnapshot();
  }, [loadSnapshot, queryKey]);

  useFocusEffect(
    useCallback(() => {
      if (Date.now() - lastRefreshAtRef.current > FOCUS_REFRESH_INTERVAL_MS) {
        void loadSnapshot({ force: true });
      }

      return undefined;
    }, [loadSnapshot])
  );

  return state;
}
