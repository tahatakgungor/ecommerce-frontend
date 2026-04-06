import { apiSlice } from "../api/apiSlice";

export type BlogStatus = "draft" | "published";

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  coverImage?: string | null;
  contentHtml: string;
  relatedProductIds: string[];
  status: BlogStatus;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPostPayload {
  title: string;
  slug?: string;
  summary?: string | null;
  coverImage?: string | null;
  contentHtml: string;
  relatedProductIds?: string[];
  status?: BlogStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

interface ApiWrapped<T> {
  success: boolean;
  data?: T;
  result?: T;
  message?: string;
}

const unwrap = <T>(response: ApiWrapped<T>): T => {
  return (response?.data || response?.result) as T;
};

export const blogApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminBlogPosts: builder.query<BlogPostItem[], void>({
      query: () => "/api/admin/blog",
      transformResponse: (response: ApiWrapped<BlogPostItem[]>) => unwrap(response),
      providesTags: ["AllBlogs"],
    }),
    createBlogPost: builder.mutation<BlogPostItem, BlogPostPayload>({
      query: (data) => ({
        url: "/api/admin/blog",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiWrapped<BlogPostItem>) => unwrap(response),
      invalidatesTags: ["AllBlogs"],
    }),
    updateBlogPost: builder.mutation<BlogPostItem, { id: string; data: BlogPostPayload }>({
      query: ({ id, data }) => ({
        url: `/api/admin/blog/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiWrapped<BlogPostItem>) => unwrap(response),
      invalidatesTags: ["AllBlogs"],
    }),
    updateBlogPostStatus: builder.mutation<BlogPostItem, { id: string; status: BlogStatus }>({
      query: ({ id, status }) => ({
        url: `/api/admin/blog/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: ApiWrapped<BlogPostItem>) => unwrap(response),
      invalidatesTags: ["AllBlogs"],
    }),
    deleteBlogPost: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/admin/blog/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AllBlogs"],
    }),
  }),
});

export const {
  useGetAdminBlogPostsQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useUpdateBlogPostStatusMutation,
  useDeleteBlogPostMutation,
} = blogApi;
