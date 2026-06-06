import { fetchJson } from "@/lib/http-client";
import { activeTenant } from "@/domain/active-tenant";
import type { BlogPost, RawBlogPost } from "@/modules/blog/types";
import { normalizeBlogPost } from "@/modules/blog/utils";

type BlogListResponse = {
  posts?: RawBlogPost[];
};

type BlogDetailResponse = {
  post?: RawBlogPost;
};

const BLOG_CACHE_TTL_MS = 5 * 60 * 1000;

let blogListCache: { value: BlogPost[]; expiresAt: number } | null = null;
let blogListRequest: Promise<BlogPost[]> | null = null;
const blogDetailCache = new Map<string, { value: BlogPost; expiresAt: number }>();
const blogDetailRequests = new Map<string, Promise<BlogPost>>();

export function getFallbackPosts(): BlogPost[] {
  return [
    {
      id: "fallback-blog-1",
      title: `${activeTenant.brandName} ürünleri nasıl seçilir?`,
      slug: "serravit-urun-secim-rehberi",
      summary: "Kategori, kullanım amacı ve ürün tipi arasında hızlı karar vermek için temel noktalar.",
      coverImage: null,
      contentText: "Serravit ürünlerinde seçim yaparken kategori, kullanım amacı ve içerik beklentisini birlikte değerlendirmek gerekir.",
      relatedProductIds: [],
      publishedAt: "2026-06-01T09:00:00+03:00",
      updatedAt: "2026-06-01T09:00:00+03:00",
    },
    {
      id: "fallback-blog-2",
      title: "Mobil sipariş akışında dikkat edilmesi gerekenler",
      slug: "mobil-siparis-akisi-rehberi",
      summary: "Sepet, kupon ve ödeme adımlarını daha hızlı tamamlamak için kısa rehber.",
      coverImage: null,
      contentText: "Mobil sipariş akışında sepet, kupon ve ödeme adımlarını mümkün olduğunca kısa ve net tutmak dönüşümü güçlendirir.",
      relatedProductIds: [],
      publishedAt: "2026-05-28T09:00:00+03:00",
      updatedAt: "2026-05-28T09:00:00+03:00",
    },
  ];
}

function primeBlogDetailCache(posts: BlogPost[]) {
  const expiresAt = Date.now() + BLOG_CACHE_TTL_MS;
  posts.forEach((post) => {
    blogDetailCache.set(post.slug, {
      value: post,
      expiresAt,
    });
  });
}

export async function fetchBlogPosts(options?: { force?: boolean }): Promise<BlogPost[]> {
  const now = Date.now();
  if (!options?.force && blogListCache && blogListCache.expiresAt > now) {
    return blogListCache.value;
  }

  if (!options?.force && blogListRequest) {
    return blogListRequest;
  }

  blogListRequest = fetchJson<BlogListResponse>("/api/blog", { timeoutMs: 5000 })
    .then((response) => {
      const posts = Array.isArray(response?.posts) ? response.posts : [];
      const normalizedPosts = posts.map(normalizeBlogPost).filter(Boolean) as BlogPost[];
      const resolvedPosts = normalizedPosts.length ? normalizedPosts : getFallbackPosts();
      blogListCache = {
        value: resolvedPosts,
        expiresAt: Date.now() + BLOG_CACHE_TTL_MS,
      };
      primeBlogDetailCache(resolvedPosts);
      return resolvedPosts;
    })
    .catch(() => {
      if (blogListCache?.value?.length) {
        return blogListCache.value;
      }
      const fallback = getFallbackPosts();
      primeBlogDetailCache(fallback);
      return fallback;
    })
    .finally(() => {
      blogListRequest = null;
    });

  return blogListRequest;
}

export async function fetchBlogPostBySlug(slug: string, options?: { force?: boolean }): Promise<BlogPost> {
  const normalizedSlug = slug.trim();
  const now = Date.now();
  const cachedPost = blogDetailCache.get(normalizedSlug);

  if (!options?.force && cachedPost && cachedPost.expiresAt > now) {
    return cachedPost.value;
  }

  if (!options?.force && blogDetailRequests.has(normalizedSlug)) {
    return blogDetailRequests.get(normalizedSlug)!;
  }

  const request = fetchJson<BlogDetailResponse>(`/api/blog/${encodeURIComponent(normalizedSlug)}`)
    .then((response) => {
      const post = normalizeBlogPost(response?.post || {});
      if (!post) {
        throw new Error("Blog yazısı bulunamadı.");
      }

      blogDetailCache.set(normalizedSlug, {
        value: post,
        expiresAt: Date.now() + BLOG_CACHE_TTL_MS,
      });

      return post;
    })
    .catch((error) => {
      const fallbackPost = cachedPost?.value || getFallbackPosts().find((post) => post.slug === normalizedSlug);
      if (fallbackPost) {
        return fallbackPost;
      }
      throw error;
    })
    .finally(() => {
      blogDetailRequests.delete(normalizedSlug);
    });

  blogDetailRequests.set(normalizedSlug, request);
  return request;
}
