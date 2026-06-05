import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const memoryStore = new Map<string, string>();

function canUseSecureStore() {
  return Platform.OS !== "web";
}

export async function readSecureJsonValue<T>(key: string, fallback: T): Promise<T> {
  try {
    const rawValue = canUseSecureStore() ? await SecureStore.getItemAsync(key) : memoryStore.get(key) ?? null;
    if (!rawValue) {
      return fallback;
    }
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export async function writeSecureJsonValue<T>(key: string, value: T) {
  const rawValue = JSON.stringify(value);

  if (canUseSecureStore()) {
    await SecureStore.setItemAsync(key, rawValue, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return;
  }

  memoryStore.set(key, rawValue);
}

export async function clearSecureJsonValue(key: string) {
  if (canUseSecureStore()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  memoryStore.delete(key);
}
