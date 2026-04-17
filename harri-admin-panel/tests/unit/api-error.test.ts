import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "../../src/utils/api-error";

describe("getApiErrorMessage", () => {
  it("returns auth-expired message for 401/403", () => {
    expect(getApiErrorMessage({ status: 401 })).toBe("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
    expect(getApiErrorMessage({ status: 403, data: { message: "Forbidden" } })).toBe(
      "Oturum süreniz doldu. Lütfen tekrar giriş yapın."
    );
  });

  it("returns backend message when available", () => {
    expect(getApiErrorMessage({ status: 500, data: { message: "Sunucu hatası" } })).toBe("Sunucu hatası");
    expect(getApiErrorMessage({ status: 500, data: "Plain error text" })).toBe("Plain error text");
  });

  it("falls back to default message when payload is unknown", () => {
    expect(getApiErrorMessage(undefined)).toBe("Bir hata oluştu. Lütfen tekrar deneyin.");
    expect(getApiErrorMessage({ status: 500, data: {} })).toBe("Bir hata oluştu. Lütfen tekrar deneyin.");
  });
});

