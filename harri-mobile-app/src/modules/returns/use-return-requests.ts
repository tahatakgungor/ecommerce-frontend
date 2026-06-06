import { startTransition, useEffect, useState } from "react";

import { fetchMyReturnRequests } from "@/modules/returns/api";
import type { ReturnRequest } from "@/modules/returns/types";

type ReturnRequestsState = {
  data: ReturnRequest[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useReturnRequests(enabled: boolean): ReturnRequestsState {
  const [data, setData] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!enabled) {
      startTransition(() => {
        setData([]);
        setIsLoading(false);
        setIsRefreshing(false);
        setError(null);
      });
      return;
    }

    setIsRefreshing(true);

    try {
      const nextReturns = await fetchMyReturnRequests();
      startTransition(() => {
        setData(nextReturns);
        setError(null);
      });
    } catch (nextError) {
      startTransition(() => {
        setError(nextError instanceof Error ? nextError.message : "Iadeler yuklenemedi.");
      });
    } finally {
      startTransition(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
    }
  };

  useEffect(() => {
    let active = true;

    if (!enabled) {
      setData([]);
      setIsLoading(false);
      setIsRefreshing(false);
      setError(null);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    fetchMyReturnRequests()
      .then((nextReturns) => {
        if (!active) return;
        startTransition(() => {
          setData(nextReturns);
          setError(null);
          setIsLoading(false);
        });
      })
      .catch((nextError) => {
        if (!active) return;
        startTransition(() => {
          setData([]);
          setError(nextError instanceof Error ? nextError.message : "Iadeler yuklenemedi.");
          setIsLoading(false);
        });
      });

    return () => {
      active = false;
    };
  }, [enabled]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
