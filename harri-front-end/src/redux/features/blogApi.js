import { apiSlice } from "src/redux/api/apiSlice";
import { normalizeMediaUrl } from "src/utils/media-url";
import { sanitizeBlogHtml } from "src/utils/blog-utils";

const normalizeBlogPost = (post) => {
  if (!post || typeof post !== "object") return null;
  const title = String(post.title || "").trim();
  const slug = String(post.slug || "").trim();
  if (!title || !slug) return null;
  return {
    ...post,
    title,
    slug,
    summary: String(post.summary || "").trim(),
    contentHtml: sanitizeBlogHtml(post.contentHtml || ""),
    coverImage: normalizeMediaUrl(post.coverImage),
    relatedProductIds: Array.isArray(post.relatedProductIds) ? post.relatedProductIds : [],
  };
};

export const blogApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBlogPosts: builder.query({
      query: () => "api/blog",
      transformResponse: (response) => {
        const posts = Array.isArray(response?.posts) ? response.posts : [];
        const normalizedPosts = posts.map(normalizeBlogPost).filter(Boolean);
        return {
          ...response,
          posts: normalizedPosts,
        };
      },
      providesTags: ["Blog"],
      keepUnusedDataFor: 180,
    }),
    getBlogPostBySlug: builder.query({
      query: (slug) => "api/blog/" + slug,
      transformResponse: (response) => {
        const post = response?.post || null;
        const normalized = normalizeBlogPost(post);
        return {
          ...response,
          post: normalized,
        };
      },
      providesTags: (result, error, slug) => [{ type: "Blog", id: slug }],
      keepUnusedDataFor: 180,
    }),
  }),
});

export const { useGetBlogPostsQuery, useGetBlogPostBySlugQuery } = blogApi;
