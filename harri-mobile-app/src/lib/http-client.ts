import { Platform } from "react-native";

import { getValidatedApiBaseUrl } from "@/config/runtime";
import { readAccessToken } from "@/lib/token-store";

const DEFAULT_TIMEOUT_MS = 10000;

function readStatusFromMessage(message: string) {
  const match = message.match(/(?:with|status)\s+(\d{3})/i);
  return match ? Number(match[1]) : null;
}

export function toUserFriendlyErrorMessage(error: unknown, fallback = "İstek tamamlanamadı.") {
  const message = error instanceof Error ? error.message.trim() : "";
  if (!message) {
    return fallback;
  }

  if (/timeout|timed out|abort|aborted|canceled|cancelled/i.test(message)) {
    return "Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.";
  }

  if (
    /Unable to resolve host|Network request failed|Failed to fetch|Load failed|fetch failed|No address associated with hostname/i.test(
      message
    )
  ) {
    return "Sunucuya bağlanılamadı. İnternet bağlantını kontrol edip tekrar dene.";
  }

  if (/Expected JSON response/i.test(message)) {
    return "Sunucudan beklenen veri alınamadı. Lütfen tekrar deneyin.";
  }

  const status = readStatusFromMessage(message);
  if (status === 401) {
    return "Oturum süren doldu. Lütfen yeniden giriş yap.";
  }
  if (status === 403) {
    return "Bu işlem için yetkin bulunmuyor.";
  }
  if (status === 404) {
    return "İstenen içerik bulunamadı.";
  }
  if (status === 429) {
    return "Çok fazla deneme yapıldı. Lütfen kısa süre sonra tekrar deneyin.";
  }
  if (status !== null && status >= 500) {
    return "Sunucuda geçici bir sorun oluştu. Lütfen kısa süre sonra tekrar deneyin.";
  }

  return message;
}

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
          throw new Error(toUserFriendlyErrorMessage(new Error(message), `İstek başarısız oldu (${response.status}).`));
        } catch (error) {
          if (error instanceof Error && error.message) {
            throw error;
          }
        }
      }

      throw new Error(toUserFriendlyErrorMessage(new Error(`Request failed with ${response.status}`), `İstek başarısız oldu (${response.status}).`));
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      throw new Error(toUserFriendlyErrorMessage(new Error("Expected JSON response")));
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && (error.name === "AbortError" || /canceled|cancelled/i.test(error.message))) {
      throw new Error(toUserFriendlyErrorMessage(new Error("Request timeout")));
    }
    throw new Error(toUserFriendlyErrorMessage(error));
  } finally {
    clearTimeout(timeoutId);
  }
}
