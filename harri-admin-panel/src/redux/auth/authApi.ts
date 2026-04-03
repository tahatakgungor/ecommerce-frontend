import Cookies from "js-cookie";
import { apiSlice } from "@/redux/api/apiSlice";
import { userLoggedIn, IUser } from "./authSlice";
import {
  IAddStuff,
  IAdminGetRes,
  IAdminLoginAdd,
  IAdminLoginRes,
  IAdminRegisterAdd,
  IAdminRegisterRes,
  IAdminUpdate,
  IAdminUpdateRes,
  IStuff
} from "@/types/admin-type";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // 1. Register Admin
    registerAdmin: builder.mutation<any, IAdminRegisterAdd & { token: string }>({
      query: (data) => ({
        url: `api/admin/register?token=${data.token}`,
        method: "POST",
        body: {
          name: data.name,
          email: data.email,
          password: data.password
        },
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data: res } = await queryFulfilled;
          const actualData = res?.data || res;
          const token = actualData?.token;

          if (token) {
            // Backend'den gelen veriyi direkt IUser formatında ( _id ile) dispatch ediyoruz
            const user: IUser = actualData;
            dispatch(userLoggedIn({ accessToken: token, user }));
          }
        } catch (err) {
          console.error("Register hatası:", err);
        }
      },
    }),

    // 2. Login Admin
    loginAdmin: builder.mutation<any, IAdminLoginAdd>({
      query: (data) => ({
        url: "api/admin/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data: res } = await queryFulfilled;
          const actualData = res?.data || res;
          const token = actualData?.token;

          if (token) {
            const user: IUser = actualData;
            dispatch(userLoggedIn({ accessToken: token, user }));
          }
        } catch (err) {
          console.error("Login hatası:", err);
        }
      },
    }),

    // 3. Personel Davet Etme (sendEmail desteğiyle)
    inviteStaff: builder.mutation<any, { email: string, role: string, sendEmail: boolean }>({
      query: (data) => ({
        url: "api/admin/invite",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AllStaff"]
    }),

    // 4. Şifremi Unuttum
    forgetPassword: builder.mutation<{message:string},{email:string}>({
      query: (data) => ({
        url: "api/admin/forget-password",
        method: "PATCH",
        body: data,
      }),
    }),

    // 5. Şifre Sıfırlama Onayı
    adminConfirmForgotPassword: builder.mutation<{message:string},{token:string,password:string}>({
      query: (data) => ({
        url: "api/admin/confirm-forget-password",
        method: "PATCH",
        body: data,
      }),
    }),

    // 6. Şifre Değiştirme
    adminChangePassword: builder.mutation<{ message: string }, { email: string; oldPass: string; newPass: string }>({
      query: (data) => ({
        url: "api/admin/change-password",
        method: "PATCH",
        body: data,
      }),
    }),

    // 7. Profil Güncelleme
    updateProfile: builder.mutation<any, { id: string, data: IAdminUpdate }>({
      query: ({ id, ...data }) => ({
        url: `/api/admin/update-stuff/${id}`,
        method: "PATCH",
        body: data.data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data: res } = await queryFulfilled;
          const actualData = res?.data || res;
          const token = actualData?.token;

          if (token) {
            const user: IUser = actualData;
            dispatch(userLoggedIn({ accessToken: token, user }));
          }
        } catch (err) {}
      },
      invalidatesTags:["AllStaff"]
    }),

    // 8. Personel Ekleme
    addStaff: builder.mutation<{ message: string }, IAddStuff>({
      query: (data) => ({
        url: "api/admin/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AllStaff"]
    }),

    // 9. Tüm Personelleri Getir (sadece Admin+Staff)
    getAllStaff: builder.query<IAdminGetRes, void>({
      query: () => `/api/admin/all`,
      providesTags: ["AllStaff"],
      keepUnusedDataFor: 600,
    }),

    // 9b. Tüm Müşterileri Getir
    getAllCustomers: builder.query<IAdminGetRes, void>({
      query: () => `/api/admin/customers`,
      providesTags: ["AllUsers"],
      keepUnusedDataFor: 600,
    }),

    // 10. Personel Sil
    deleteStaff: builder.mutation<{ message: string }, string>({
      query(id: string) {
        return {
          url: `/api/admin/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AllStaff"],
    }),

    // 11. Tekil Personel Getir
    getStuff: builder.query<any, string>({
      query: (id) => `/api/admin/get/${id}`,
      providesTags: ['Stuff']
    }),

    // 12. Personel Rolünü Güncelle (sadece Admin)
    updateStaffRole: builder.mutation<{ message: string }, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/api/admin/update-role/${id}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["AllStaff"],
    }),

    // 13. Müşteri Sil (sadece Admin) — aynı DELETE /api/admin/:id endpoint'i kullanır
    deleteCustomer: builder.mutation<{ message: string }, string>({
      query(id: string) {
        return {
          url: `/api/admin/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AllUsers"],
    }),
  }),
});

export const {
  useLoginAdminMutation,
  useRegisterAdminMutation,
  useForgetPasswordMutation,
  useAdminConfirmForgotPasswordMutation,
  useAdminChangePasswordMutation,
  useUpdateProfileMutation,
  useGetAllStaffQuery,
  useGetAllCustomersQuery,
  useAddStaffMutation,
  useDeleteStaffMutation,
  useDeleteCustomerMutation,
  useUpdateStaffRoleMutation,
  useGetStuffQuery,
  useInviteStaffMutation,
} = authApi;