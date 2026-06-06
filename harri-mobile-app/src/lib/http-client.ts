import { Platform } from "react-native";

import { getValidatedApiBaseUrl } from "@/config/runtime";
import { readAccessToken } from "@/lib/token-store";

const DEFAULT_TIMEOUT_MS = 10000;

type JsonRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: BodyInit | null;
  timeoutMs?: number;
  auth?: boolean;
};

export async function fetchJson<T>(path: string, options: JsonRequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const baseUrl = getValidatedApiBaseUrl();
    const accessToken = options.auth ? await readAccessToken() : null;
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        "X-Mobile-Client": `expo-${Platform.OS}`,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {}),
      },
      body: options.body,
      signal: controller.signal,
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.toLowerCase().includes("application/json")) {
        try {
          const errorPayload = (await response.json()) as { message?: string; error?: string; data?: { message?: string } };
          const message =
            errorPayload?.message ||
            errorPayload?.error ||
            errorPayload?.data?.message ||
            `Request failed with ${response.status}`;
          throw new Error(message);
        } catch (error) {
          if (error instanceof Error && error.message) {
            throw error;
          }
        }
      }

      throw new Error(`Request failed with ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      throw new Error("Expected JSON response");
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && (error.name === "AbortError" || /canceled|cancelled/i.test(error.message))) {
      throw new Error("Request timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
