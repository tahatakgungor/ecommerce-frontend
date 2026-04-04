import { safeGetItem, safeRemoveItem } from "src/utils/localstorage";
import { createSlice } from "@reduxjs/toolkit";

// Oturum için cookie birincil kaynaktır.
// Cross-site cookie engeline karşı bearer token fallback olarak localStorage'da tutulur.
const loadUserFromStorage = () => {
  try {
    const stored = safeGetItem("user_profile");
    const storedToken = safeGetItem("auth_access_token");
    if (stored) {
      return {
        accessToken: storedToken || undefined,
        user: JSON.parse(stored),
      };
    }
    if (storedToken) {
      return {
        accessToken: storedToken,
        user: undefined,
      };
    }
  } catch (_) {}
  return { accessToken: undefined, user: undefined };
};

const initialState = loadUserFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, { payload }) => {
      if (payload?.accessToken !== undefined) {
        state.accessToken = payload.accessToken;
      }
      if (payload?.user !== undefined) {
        state.user = payload.user;
      }
    },
    userLoggedOut: (state) => {
      state.accessToken = undefined;
      state.user = undefined;
      safeRemoveItem("user_profile");
      safeRemoveItem("auth_access_token");
      safeRemoveItem("couponInfo");
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
