import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { fetchSiteSettings, getDefaultSiteSettings } from "@/modules/site-settings/api";
import type { SiteSettings } from "@/modules/site-settings/types";

const FOCUS_REFRESH_INTERVAL_MS = 30_000;

export function useSiteSettings() {
  const [data, setData] = useState<SiteSettings>(getDefaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastRefreshAtRef = useRef(0);

  const loadSettings = useCallback(async (options?: { force?: boolean }) => {
    setError(null);
    try {
      const settings = await fetchSiteSettings(options);
      setData(settings);
      setError(null);
      lastRefreshAtRef.current = Date.now();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Site ayarlari yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useFocusEffect(
    useCallback(() => {
      if (Date.now() - lastRefreshAtRef.current > FOCUS_REFRESH_INTERVAL_MS) {
        void loadSettings({ force: true });
      }

      return undefined;
    }, [loadSettings])
  );

  return {
    data,
    isLoading,
    error,
    refresh: () => loadSettings({ force: true }),
  };
}
