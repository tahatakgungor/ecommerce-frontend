import { startTransition, useEffect, useState } from "react";

import { fetchUserOrders } from "@/modules/orders/api";
import type { OrderSummary } from "@/modules/orders/types";

type OrderHistoryState = {
  data: OrderSummary[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useOrderHistory(enabled: boolean): OrderHistoryState {
  const [data, setData] = useState<OrderSummary[]>([]);
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
      const nextOrders = await fetchUserOrders();
      startTransition(() => {
        setData(nextOrders);
        setError(null);
      });
    } catch (nextError) {
      startTransition(() => {
        setError(nextError instanceof Error ? nextError.message : "Siparişler yüklenemedi.");
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
    fetchUserOrders()
      .then((nextOrders) => {
        if (!active) return;
        startTransition(() => {
          setData(nextOrders);
          setError(null);
          setIsLoading(false);
        });
      })
      .catch((nextError) => {
        if (!active) return;
        startTransition(() => {
          setData([]);
          setError(nextError instanceof Error ? nextError.message : "Siparişler yüklenemedi.");
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
