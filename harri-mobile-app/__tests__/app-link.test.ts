import { resolveAppLink } from "@/lib/app-link";

describe("resolveAppLink", () => {
  it("maps shop paths to mobile catalog", () => {
    expect(resolveAppLink("/shop")).toEqual({ kind: "internal", href: "/catalog" });
    expect(resolveAppLink("https://serravit.com/shop?sort=price_desc")).toEqual({
      kind: "internal",
      href: "/catalog?sort=price_desc",
    });
  });

  it("maps blog paths to mobile blog detail", () => {
    expect(resolveAppLink("/blog/humik-asit-nedir")).toEqual({
      kind: "internal",
      href: "/blog/humik-asit-nedir",
    });
  });

  it("keeps external links external", () => {
    expect(resolveAppLink("https://example.com/page")).toEqual({
      kind: "external",
      href: "https://example.com/page",
    });
  });

  it("falls back safely for unknown internal routes", () => {
    expect(resolveAppLink("/some-unknown-path")).toEqual({
      kind: "internal",
      href: "/",
    });
  });
});
