import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// IUser tipini orijinal MongoDB standartına ( _id ) geri döndürdük
export type IUser = {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  image?: string;
  phone?: string;
};

export type IAuth = {
  accessToken: string | undefined;
  user: IUser | undefined;
};

const loadAuthState = (): IAuth => {
  if (typeof window === "undefined") {
    return { accessToken: undefined, user: undefined };
  }
  try {
    const token = window.localStorage.getItem("admin_access_token") || undefined;
    const rawUser = window.localStorage.getItem("admin_user_profile");
    const user = rawUser ? (JSON.parse(rawUser) as IUser) : undefined;
    return { accessToken: token, user };
  } catch {
    return { accessToken: undefined, user: undefined };
  }
};

const initialAuthState: IAuth = loadAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    userLoggedIn: (state, { payload }: PayloadAction<IAuth>) => {
      state.accessToken = payload.accessToken;
      state.user = payload.user;
      if (typeof window !== "undefined") {
        if (payload.accessToken) {
          window.localStorage.setItem("admin_access_token", payload.accessToken);
        }
        if (payload.user) {
          window.localStorage.setItem("admin_user_profile", JSON.stringify(payload.user));
        }
      }
    },
    userLoggedOut: (state) => {
      state.accessToken = undefined;
      state.user = undefined;
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("admin_access_token");
        window.localStorage.removeItem("admin_user_profile");
      }
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
