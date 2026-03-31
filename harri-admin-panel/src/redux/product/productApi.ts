import { apiSlice } from "../api/apiSlice";
import { IAddProduct, ProductResponse } from "@/types/product-type";

interface IProductResponse {
  success: boolean;
  status: string;
  message: string;
  data: any;
}

interface IProductEditResponse {
  data: IAddProduct;
  message: string;
}

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // getUserOrders
    getAllProducts: builder.query<ProductResponse, void>({
      query: () => `/api/products/all`,
      providesTags: ["AllProducts"],
      keepUnusedDataFor: 600,
    }),
    // add product
    addProduct: builder.mutation<IProductResponse, IAddProduct>({
      query(data: IAddProduct) {
        return {
          url: `/api/products/add`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["AllProducts","SingleProduct"],
    }),
    // edit product
    editProduct: builder.mutation<
      IProductEditResponse,
      { id: string; data: Partial<IAddProduct> }
    >({
      query({ id, data }) {
        return {
          url: `/api/products/update/${id}`,
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: ["AllProducts","SingleProduct"],
    }),
    // get single product
    getProduct: builder.query<IAddProduct, string>({
      query: (id) => `/api/products/${id}`,
      transformResponse: (response: { data: IAddProduct }) => response.data,
      providesTags:["SingleProduct"]
    }),
    // get single product
    // getReviewProducts: builder.query<IReviewProductRes, void>({
    //   query: () => `/api/products/review-product`,
    //   providesTags: ["ReviewProducts"]
    // }),
    // get single product
    // getStockOutProducts: builder.query<IReviewProductRes, void>({
    //   query: () => `/api/products/stock-out`,
    //   providesTags: ["StockOutProducts"]
    // }),
     // delete category
     deleteProduct: builder.mutation<{message:string}, string>({
      query(id: string) {
        return {
          url: `/api/products/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AllProducts"],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useAddProductMutation,
  useEditProductMutation,
  useGetProductQuery,
  useDeleteProductMutation,
} = authApi;
