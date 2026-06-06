import { useEffect, useState } from "react";

import { fetchBlogPosts } from "@/modules/blog/api";
import type { BlogPost } from "@/modules/blog/types";

export function useBlogPosts() {
  const [data, setData] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const posts = await fetchBlogPosts();
        if (!active) return;
        setData(posts);
      } catch (nextError) {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Blog yuklenemedi.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return { data, isLoading, error };
}
