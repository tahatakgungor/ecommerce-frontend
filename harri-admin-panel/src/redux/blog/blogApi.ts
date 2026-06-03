import { apiSlice } from "../api/apiSlice";
import { buildAdminListQueryParams } from "@/utils/admin-list-query";

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

export interface BlogPostListData {
  posts: BlogPostItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface BlogPostListQuery {
  page?: number;
  size?: number;
  q?: string;
  status?: BlogStatus | "all";
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
    getAdminBlogPostsPage: builder.query<BlogPostListData, BlogPostListQuery | void>({
      query: (params) => ({
        url: "/api/admin/blog",
        params: buildAdminListQueryParams(params || {}),
      }),
      transformResponse: (response: ApiWrapped<BlogPostListData>) => unwrap(response),
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
  useGetAdminBlogPostsPageQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useUpdateBlogPostStatusMutation,
  useDeleteBlogPostMutation,
} = blogApi;
