import { useFocusEffect } from "expo-router";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";

import { toUserFriendlyErrorMessage } from "@/lib/http-client";
import { fetchCatalogSnapshot, getLocalCatalogSnapshot } from "@/modules/catalog/api";
import { serializeCatalogQuery, type CatalogQuery } from "@/modules/catalog/query";
import type { CatalogSnapshot } from "@/modules/catalog/types";

type CatalogSnapshotState = {
  data: CatalogSnapshot | null;
  isLoading: boolean;
  error: string | null;
};

type UseCatalogSnapshotOptions = {
  enabled?: boolean;
};

const FOCUS_REFRESH_INTERVAL_MS = 30_000;

export function useCatalogSnapshot(query: CatalogQuery = {}, options: UseCatalogSnapshotOptions = {}) {
  const enabled = options.enabled ?? true;
  const [state, setState] = useState<CatalogSnapshotState>({
    data: null,
    isLoading: enabled,
    error: null,
  });
  const queryKey = serializeCatalogQuery(query);
  const lastRefreshAtRef = useRef(0);

  const loadSnapshot = useCallback(async (options?: { force?: boolean }) => {
    if (!enabled) {
      return;
    }

    setState((current) => ({
      data: current.data,
      isLoading: !current.data,
      error: null,
    }));

    const localSnapshot = await getLocalCatalogSnapshot(query);
    if (localSnapshot) {
      startTransition(() => {
        setState({
          data: localSnapshot,
          isLoading: false,
          error: null,
        });
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
          error: toUserFriendlyErrorMessage(error, "Katalog yüklenemedi."),
        }));
      });
    }
  }, [enabled, query]);

  useEffect(() => {
    if (!enabled) {
      startTransition(() => {
        setState((current) => ({
          data: current.data,
          isLoading: false,
          error: null,
        }));
      });
      return;
    }

    void loadSnapshot();
  }, [enabled, loadSnapshot, queryKey]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return undefined;
      }

      if (Date.now() - lastRefreshAtRef.current > FOCUS_REFRESH_INTERVAL_MS) {
        void loadSnapshot({ force: true });
      }

      return undefined;
    }, [enabled, loadSnapshot])
  );

  return state;
}
