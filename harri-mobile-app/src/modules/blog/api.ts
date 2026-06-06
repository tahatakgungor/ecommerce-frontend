import { fetchJson } from "@/lib/http-client";
import type { BlogPost, RawBlogPost } from "@/modules/blog/types";
import { normalizeBlogPost } from "@/modules/blog/utils";

type BlogListResponse = {
  posts?: RawBlogPost[];
};

type BlogDetailResponse = {
  post?: RawBlogPost;
};

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const response = await fetchJson<BlogListResponse>("/api/blog");
  const posts = Array.isArray(response?.posts) ? response.posts : [];
  return posts.map(normalizeBlogPost).filter(Boolean) as BlogPost[];
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost> {
  const response = await fetchJson<BlogDetailResponse>(`/api/blog/${encodeURIComponent(slug)}`);
  const post = normalizeBlogPost(response?.post || {});
  if (!post) {
    throw new Error("Blog yazisi bulunamadi.");
  }
  return post;
}
