import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "serravit.mobile.access-token";

let memoryToken: string | null = null;
const WEB_ACCESS_TOKEN_KEY = `${ACCESS_TOKEN_KEY}.web`;

function canUseSecureStore() {
  return Platform.OS !== "web";
}

function readWebStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return memoryToken;
  }

  try {
    const token = window.localStorage.getItem(WEB_ACCESS_TOKEN_KEY);
    return token || memoryToken;
  } catch {
    return memoryToken;
  }
}

function writeWebStorage(token: string) {
  memoryToken = token;
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(WEB_ACCESS_TOKEN_KEY, token);
  } catch {
    // Memory fallback remains authoritative when storage is unavailable.
  }
}

function clearWebStorage() {
  memoryToken = null;
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(WEB_ACCESS_TOKEN_KEY);
  } catch {
    // Ignore storage cleanup failures on web.
  }
}

export async function readAccessToken() {
  if (canUseSecureStore()) {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }
  return readWebStorage();
}

export async function writeAccessToken(token: string) {
  if (canUseSecureStore()) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return;
  }
  writeWebStorage(token);
}

export async function clearAccessToken() {
  if (canUseSecureStore()) {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    return;
  }
  clearWebStorage();
}
