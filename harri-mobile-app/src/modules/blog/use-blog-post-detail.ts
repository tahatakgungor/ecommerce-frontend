import { useEffect, useState } from "react";

import { fetchBlogPostBySlug } from "@/modules/blog/api";
import type { BlogPost } from "@/modules/blog/types";

export function useBlogPostDetail(slug: string) {
  const [data, setData] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setData(null);
      setError("Blog slug eksik.");
      setIsLoading(false);
      return;
    }

    let active = true;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const post = await fetchBlogPostBySlug(slug);
        if (!active) return;
        setData(post);
      } catch (nextError) {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Blog yazisi yuklenemedi.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  return { data, isLoading, error };
}
