import { useEffect, useState } from "react";

import { fetchSiteSettings, getDefaultSiteSettings } from "@/modules/site-settings/api";
import type { SiteSettings } from "@/modules/site-settings/types";

export function useSiteSettings() {
  const [data, setData] = useState<SiteSettings>(getDefaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchSiteSettings()
      .then((settings) => {
        if (!active) return;
        setData(settings);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Site settings yuklenemedi.");
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
