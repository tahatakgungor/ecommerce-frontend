import { apiSlice } from "../api/apiSlice";
import {
  CategoryRes,
  CategoryResponse,
  IAddCategory,
  IAddCategoryResponse,
  ICategoryDeleteRes,
} from "@/types/category-type";

export const categoryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // 1. Tüm Kategorileri Getir
    getAllCategories: builder.query<CategoryResponse, void>({
      query: () => `/api/category/all`,
      // Backend'den ApiResponse içinde geldiği için transform gerekebilir
      // ama tip tanımların (CategoryResponse) bunu kapsıyorsa sorun olmaz.
      providesTags: ["AllCategory"],
      keepUnusedDataFor: 600,
    }),

    // 2. Kategori Ekle
    addCategory: builder.mutation<IAddCategoryResponse, IAddCategory>({
      query: (data) => ({
        url: `/api/category/add`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AllCategory", "getCategory"],
    }),

    // 3. Kategori Sil
    deleteCategory: builder.mutation<ICategoryDeleteRes, string>({
      query: (id) => ({
        url: `/api/category/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AllCategory", "getCategory"],
    }),

    // 4. Kategori Düzenle
    editCategory: builder.mutation<IAddCategoryResponse, { id: string; data: Partial<CategoryRes> }>({
      query: ({ id, data }) => ({
        url: `/api/category/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AllCategory", "getCategory"],
    }),

    // 5. Tekil Kategori Getir
    getCategory: builder.query<CategoryRes, string>({
      query: (id) => `/api/category/${id}`,
      transformResponse: (response: { data: CategoryRes }) => response.data,
      providesTags: ["getCategory"],
    }),
  }),
});

// Hook isimlerini export ediyoruz
export const {
  useGetAllCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
  useEditCategoryMutation,
  useGetCategoryQuery,
} = categoryApi;