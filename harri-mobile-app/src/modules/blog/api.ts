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

function getFallbackPosts(): BlogPost[] {
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

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetchJson<BlogListResponse>("/api/blog", { timeoutMs: 3500 });
    const posts = Array.isArray(response?.posts) ? response.posts : [];
    const normalizedPosts = posts.map(normalizeBlogPost).filter(Boolean) as BlogPost[];
    return normalizedPosts.length ? normalizedPosts : getFallbackPosts();
  } catch {
    return getFallbackPosts();
  }
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost> {
  const response = await fetchJson<BlogDetailResponse>(`/api/blog/${encodeURIComponent(slug)}`);
  const post = normalizeBlogPost(response?.post || {});
  if (!post) {
    throw new Error("Blog yazisi bulunamadi.");
  }
  return post;
}
