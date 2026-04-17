import { describe, expect, it } from "vitest";
import { isAdminPublicPath } from "../../src/utils/auth-routes";

describe("isAdminPublicPath", () => {
  it("returns true for admin public routes", () => {
    expect(isAdminPublicPath("/login")).toBe(true);
    expect(isAdminPublicPath("/register")).toBe(true);
    expect(isAdminPublicPath("/forgot-password")).toBe(true);
    expect(isAdminPublicPath("/forgot-password/abc-token")).toBe(true);
  });

  it("returns false for protected routes", () => {
    expect(isAdminPublicPath("/dashboard")).toBe(false);
    expect(isAdminPublicPath("/product-list")).toBe(false);
    expect(isAdminPublicPath("")).toBe(false);
  });
});

