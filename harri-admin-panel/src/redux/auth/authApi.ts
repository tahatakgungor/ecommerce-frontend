import Cookies from "js-cookie";
import { apiSlice } from "@/redux/api/apiSlice";
import { userLoggedIn } from "./authSlice";
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
    // 1. Register Admin (Davetiye Token'ı ile)
    // URL'e token ekledik: api/admin/register?token=...
    registerAdmin: builder.mutation<IAdminRegisterRes, IAdminRegisterAdd & { token: string }>({
      query: (data) => ({
        url: `api/admin/register?token=${data.token}`,
        method: "POST",
        body: {
          name: data.name,
          email: data.email,
          password: data.password
        },
      }),

// authApi.ts içindeki loginAdmin ve registerAdmin bölümlerini bu mantıkla güncelle:

async onQueryStarted(arg, { queryFulfilled, dispatch }) {
  try {
    const { data: res } = await queryFulfilled;

    // Gelen veriyi 'any' olarak işaretleyip içindeki 'data'ya bakıyoruz
    // Eğer Backend ApiResponse sarmalayıcısıyla gönderdiyse res.data'yı al,
    // yoksa (eski usulse) direkt res'i al.
    const responseData = res as any;
    const actualData = responseData.data || responseData;

    // Backend'den 'token' mı yoksa 'accessToken' mı geliyor?
    // Senin LoginResponse sınıfında hangisi varsa onu kullanmalısın.
    const token = actualData.token || actualData.accessToken;

    if (token) {
      // User bilgilerini ayırıyoruz
      const { token: _, accessToken: __, ...user } = actualData;

      Cookies.set(
        "admin",
        JSON.stringify({
          accessToken: token,
          user: user
        }),
        { expires: 0.5 }
      );

      dispatch(
        userLoggedIn({
          accessToken: token,
          user: user
        })
      );
    }
  } catch (err) {
    console.error("Login hatası:", err);
  }
},
    }),

    // 2. Login Admin
    loginAdmin: builder.mutation<IAdminLoginRes, IAdminLoginAdd>({
      query: (data) => ({
        url: "api/admin/login",
        method: "POST",
        body: data,
      }),

// authApi.ts içindeki loginAdmin ve registerAdmin bölümlerini bu mantıkla güncelle:

async onQueryStarted(arg, { queryFulfilled, dispatch }) {
  try {
    const { data: res } = await queryFulfilled;

    // Gelen veriyi 'any' olarak işaretleyip içindeki 'data'ya bakıyoruz
    // Eğer Backend ApiResponse sarmalayıcısıyla gönderdiyse res.data'yı al,
    // yoksa (eski usulse) direkt res'i al.
    const responseData = res as any;
    const actualData = responseData.data || responseData;

    // Backend'den 'token' mı yoksa 'accessToken' mı geliyor?
    // Senin LoginResponse sınıfında hangisi varsa onu kullanmalısın.
    const token = actualData.token || actualData.accessToken;

    if (token) {
      // User bilgilerini ayırıyoruz
      const { token: _, accessToken: __, ...user } = actualData;

      Cookies.set(
        "admin",
        JSON.stringify({
          accessToken: token,
          user: user
        }),
        { expires: 0.5 }
      );

      dispatch(
        userLoggedIn({
          accessToken: token,
          user: user
        })
      );
    }
  } catch (err) {
    console.error("Login hatası:", err);
  }
},
    }),

// authApi.ts dosyasında ilgili kısmı şu şekilde güncelle:

    // 3. Personel Davet Etme
    // Dönüş tipini IAdminRegisterRes veya genel bir yapıya çeviriyoruz
    inviteStaff: builder.mutation<any, { email: string, role: string }>({
      query: (data) => ({
        url: "api/admin/invite",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AllStaff"]
    }),

    // --- Diğer Mevcut Metotlar ---
    forgetPassword: builder.mutation<{message:string},{email:string}>({
      query: (data) => ({
        url: "api/admin/forget-password",
        method: "PATCH",
        body: data,
      }),
    }),

    adminConfirmForgotPassword: builder.mutation<{message:string},{token:string,password:string}>({
      query: (data) => ({
        url: "api/admin/confirm-forget-password",
        method: "PATCH",
        body: data,
      }),
    }),

    adminChangePassword: builder.mutation<{ message: string }, { email: string; oldPass: string; newPass: string }>({
      query: (data) => ({
        url: "api/admin/change-password",
        method: "PATCH",
        body: data,
      }),
    }),

    updateProfile: builder.mutation<IAdminUpdateRes, { id: string, data: IAdminUpdate }>({
      query: ({ id, ...data }) => ({
        url: `/api/admin/update-stuff/${id}`,
        method: "PATCH",
        body: data.data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          const responseData = result.data as any;
          const actualData = responseData.data || responseData;
          const { token, ...others } = actualData;

          Cookies.set("admin", JSON.stringify({ accessToken: token, user: others }), { expires: 0.5 });
          dispatch(userLoggedIn({ accessToken: token, user: others }));
        } catch (err) {}
      },
      invalidatesTags:["AllStaff"]
    }),

    addStaff: builder.mutation<{ message: string }, IAddStuff>({
      query: (data) => ({
        url: "api/admin/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AllStaff"]
    }),

    getAllStaff: builder.query<IAdminGetRes, void>({
      query: () => `/api/admin/all`,
      providesTags: ["AllStaff"],
      keepUnusedDataFor: 600,
    }),

    deleteStaff: builder.mutation<{ message: string }, string>({
      query(id: string) {
        return {
          url: `/api/admin/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AllStaff"],
    }),

    getStuff: builder.query<IStuff, string>({
      query: (id) => `/api/admin/get/${id}`,
      providesTags: ['Stuff']
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
  useAddStaffMutation,
  useDeleteStaffMutation,
  useGetStuffQuery,
  useInviteStaffMutation, // Yeni hook
} = authApi;