import { resolveResetPasswordToken } from "@/modules/auth/reset-token";

describe("reset token resolver", () => {
  it("reads direct token param first", () => {
    expect(resolveResetPasswordToken({ token: "abc-123" })).toBe("abc-123");
  });

  it("falls back to resetToken param", () => {
    expect(resolveResetPasswordToken({ resetToken: "fallback-456" })).toBe("fallback-456");
  });
});
