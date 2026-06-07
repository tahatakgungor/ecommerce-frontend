import {
  buildCustomerName,
  validateForgotPasswordPayload,
  validateRegisterPayload,
  validateResetPasswordPayload,
} from "../src/modules/auth/validators";

describe("auth validators", () => {
  it("builds a normalized full name", () => {
    expect(buildCustomerName("  Tahat ", " Takgungor  ")).toBe("Tahat Takgungor");
  });

  it("rejects invalid registration payloads", () => {
    expect(
      validateRegisterPayload({
        firstName: "",
        lastName: "Takgungor",
        phone: "",
        email: "bad-email",
        password: "123",
        confirmPassword: "1234",
      })
    ).toBe("Ad gerekli.");
  });

  it("accepts a valid registration payload", () => {
    expect(
      validateRegisterPayload({
        firstName: "Tahat",
        lastName: "Takgungor",
        phone: "0555",
        email: "customer@example.com",
        password: "123456",
        confirmPassword: "123456",
      })
    ).toBeNull();
  });

  it("rejects invalid forgot password emails", () => {
    expect(validateForgotPasswordPayload({ email: "invalid" })).toBe("Geçerli bir e-posta girin.");
  });

  it("rejects invalid reset payloads", () => {
    expect(
      validateResetPasswordPayload({
        token: "",
        password: "123456",
        confirmPassword: "123456",
      })
    ).toBe("Sıfırlama bağlantısı eksik veya geçersiz.");
  });
});
