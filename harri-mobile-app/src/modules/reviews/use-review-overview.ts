import { startTransition, useEffect, useState } from "react";

import { fetchMyReviewOverview } from "@/modules/reviews/api";
import type { ReviewOverview } from "@/modules/reviews/types";

type ReviewOverviewState = {
  data: ReviewOverview;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const emptyOverview: ReviewOverview = {
  pending: [],
  reviewed: [],
};

export function useReviewOverview(enabled: boolean): ReviewOverviewState {
  const [data, setData] = useState<ReviewOverview>(emptyOverview);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!enabled) {
      startTransition(() => {
        setData(emptyOverview);
        setIsLoading(false);
        setIsRefreshing(false);
        setError(null);
      });
      return;
    }

    setIsRefreshing(true);

    try {
      const nextOverview = await fetchMyReviewOverview();
      startTransition(() => {
        setData(nextOverview);
        setError(null);
      });
    } catch (nextError) {
      startTransition(() => {
        setError(nextError instanceof Error ? nextError.message : "Degerlendirmeler yuklenemedi.");
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
      setData(emptyOverview);
      setIsLoading(false);
      setIsRefreshing(false);
      setError(null);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    fetchMyReviewOverview()
      .then((nextOverview) => {
        if (!active) return;
        startTransition(() => {
          setData(nextOverview);
          setError(null);
          setIsLoading(false);
        });
      })
      .catch((nextError) => {
        if (!active) return;
        startTransition(() => {
          setData(emptyOverview);
          setError(nextError instanceof Error ? nextError.message : "Degerlendirmeler yuklenemedi.");
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
