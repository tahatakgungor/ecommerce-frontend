import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "serravit.mobile.access-token";

let memoryToken: string | null = null;

function canUseSecureStore() {
  return Platform.OS !== "web";
}

export async function readAccessToken() {
  if (canUseSecureStore()) {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }
  return memoryToken;
}

export async function writeAccessToken(token: string) {
  if (canUseSecureStore()) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return;
  }
  memoryToken = token;
}

export async function clearAccessToken() {
  if (canUseSecureStore()) {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    return;
  }
  memoryToken = null;
}
