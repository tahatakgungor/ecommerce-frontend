import { apiSlice } from "src/redux/api/apiSlice";
import { normalizeMediaUrl } from "src/utils/media-url";

const normalizeBlogPost = (post) => {
  if (!post || typeof post !== "object") return post;
  return {
    ...post,
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
        return {
          ...response,
          posts: posts.map(normalizeBlogPost),
        };
      },
      providesTags: ["Blog"],
      keepUnusedDataFor: 180,
    }),
    getBlogPostBySlug: builder.query({
      query: (slug) => "api/blog/" + slug,
      transformResponse: (response) => {
        const post = response?.post || null;
        return {
          ...response,
          post: normalizeBlogPost(post),
        };
      },
      providesTags: (result, error, slug) => [{ type: "Blog", id: slug }],
      keepUnusedDataFor: 180,
    }),
  }),
});

export const { useGetBlogPostsQuery, useGetBlogPostBySlugQuery } = blogApi;
