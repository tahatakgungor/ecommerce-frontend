import { safeSetItem } from "src/utils/localstorage";
import { notifySuccess } from "@utils/toast";
import { apiSlice } from "src/redux/api/apiSlice";
import { userLoggedIn } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (data) => ({
        url: "api/user/signup",
        method: "POST",
        body: data,
      }),
    }),

    // login
    loginUser: builder.mutation({
      query: (data) => ({
        url: "api/user/login",
        method: "POST",
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          const { token, user } = result.data.data;
          // Token artık httpOnly cookie'de — localStorage'a kaydetmiyoruz
          // Sadece hassas olmayan kullanıcı profili kaydediliyor
          safeSetItem("user_profile", JSON.stringify(user));
          dispatch(userLoggedIn({ accessToken: token, user }));
        } catch (err) {
          // do nothing
        }
      },
    }),

    // get me
    getUser: builder.query({
      query: () => "api/user/me",

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              user: result.data,
            })
          );
        } catch (err) {
          // do nothing
        }
      },
    }),
    // confirmEmail
    confirmEmail: builder.query({
      query: (token) => `api/user/confirmEmail/${token}`,

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          const { token: accessToken, user } = result.data.data;
          safeSetItem("user_profile", JSON.stringify(user));
          dispatch(userLoggedIn({ accessToken, user }));
        } catch (err) {
          // do nothing
        }
      },
    }),
    // reset password
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "api/user/forget-password",
        method: "PATCH",
        body: data,
      }),
    }),
    // confirmForgotPassword
    confirmForgotPassword: builder.mutation({
      query: (data) => ({
        url: "api/user/confirm-forget-password",
        method: "PATCH",
        body: data,
      }),
    }),
    // change password
    changePassword: builder.mutation({
      query: (data) => ({
        url: "api/user/change-password",
        method: "PATCH",
        body: data,
      }),
    }),
    // update profile
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "api/user/update-user",
        method: "PUT",
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          const { token, user } = result.data.data;
          safeSetItem("user_profile", JSON.stringify(user));
          dispatch(userLoggedIn({ accessToken: token, user }));
        } catch (err) {
          // do nothing
        }
      },
    }),

    // logout
    logoutUser: builder.mutation({
      query: () => ({
        url: "api/user/logout",
        method: "POST",
      }),
    }),

    // newsletter
    subscribeNewsletter: builder.mutation({
      query: (data) => ({
        url: "api/user/newsletter",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useLazyGetUserQuery,
  useConfirmEmailQuery,
  useResetPasswordMutation,
  useConfirmForgotPasswordMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useLogoutUserMutation,
  useSubscribeNewsletterMutation,
} = authApi;
