type ErrorPayload = {
  message?: string;
  error?: string;
};

export const getApiErrorMessage = (error: unknown, fallback = "Bir hata oluştu. Lütfen tekrar deneyin.") => {
  if (!error || typeof error !== "object") return fallback;

  const maybeError = error as { status?: number; data?: ErrorPayload | string };
  const status = Number(maybeError?.status);
  if (status === 401 || status === 403) {
    return "Oturum süreniz doldu. Lütfen tekrar giriş yapın.";
  }

  if (typeof maybeError?.data === "string" && maybeError.data.trim()) {
    return maybeError.data;
  }

  const payload = maybeError?.data as ErrorPayload | undefined;
  if (payload?.message) return payload.message;
  if (payload?.error) return payload.error;
  return fallback;
};

