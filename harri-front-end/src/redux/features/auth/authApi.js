import { safeGetItem, safeSetItem } from "src/utils/localstorage";
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
          // Cookie + bearer fallback: bazı tarayıcı/ortam kombinasyonlarında cross-site cookie engellenebilir.
          if (token) {
            safeSetItem("auth_access_token", token);
          }
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
          const storedToken = safeGetItem("auth_access_token") || undefined;
          dispatch(userLoggedIn({ accessToken: storedToken, user: result.data }));
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
          if (accessToken) {
            safeSetItem("auth_access_token", accessToken);
          }
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
          if (token) {
            safeSetItem("auth_access_token", token);
          }
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
