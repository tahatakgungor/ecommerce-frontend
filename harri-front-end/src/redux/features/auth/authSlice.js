import { safeGetItem, safeRemoveItem } from "src/utils/localstorage";
import { createSlice } from "@reduxjs/toolkit";

// Token artık localStorage'a kaydedilmiyor — httpOnly cookie'de tutuluyor.
// Sadece kullanıcı profili (hassas olmayan) localStorage'da kalıyor.
const loadUserFromStorage = () => {
  try {
    const stored = safeGetItem("user_profile");
    if (stored) return { accessToken: undefined, user: JSON.parse(stored) };
  } catch (_) {}
  return { accessToken: undefined, user: undefined };
};

const initialState = loadUserFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, { payload }) => {
      // Token sadece Redux memory'de tutuluyor (sayfa yenilemede sıfırlanır, cookie devreye girer)
      state.accessToken = payload.accessToken;
      state.user = payload.user;
    },
    userLoggedOut: (state) => {
      state.accessToken = undefined;
      state.user = undefined;
      safeRemoveItem("user_profile");
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
