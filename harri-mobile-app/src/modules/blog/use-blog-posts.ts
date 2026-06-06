import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { fetchBlogPosts, getFallbackPosts } from "@/modules/blog/api";
import type { BlogPost } from "@/modules/blog/types";

const FOCUS_REFRESH_INTERVAL_MS = 30_000;

export function useBlogPosts() {
  const [data, setData] = useState<BlogPost[]>(() => getFallbackPosts());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestDataRef = useRef<BlogPost[]>(getFallbackPosts());
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  const loadPosts = useCallback(async (options?: { force?: boolean }) => {
    const shouldShowLoading = latestDataRef.current.length === 0;
    if (shouldShowLoading) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const posts = await fetchBlogPosts(options);
      setData(posts);
      setError(null);
      lastRefreshAtRef.current = Date.now();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Blog yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  useFocusEffect(
    useCallback(() => {
      if (Date.now() - lastRefreshAtRef.current > FOCUS_REFRESH_INTERVAL_MS) {
        void loadPosts({ force: true });
      }

      return undefined;
    }, [loadPosts])
  );

  return { data, isLoading, error, refresh: () => loadPosts({ force: true }) };
}
