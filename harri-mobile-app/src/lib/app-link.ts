const INTERNAL_WEB_HOSTS = new Set(["serravit.com", "www.serravit.com"]);

type AppLinkResolution =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string }
  | { kind: "none" };

function buildInternalPath(pathname: string, search = "") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${normalizedPath}${search}`;
}

function normalizeStorefrontPath(pathname: string, search = ""): string {
  const normalized = pathname.replace(/\/+$/, "") || "/";

  if (normalized === "/" || normalized === "/home") {
    return "/";
  }

  if (normalized === "/shop" || normalized.startsWith("/shop/")) {
    return buildInternalPath("/catalog", search);
  }

  if (normalized === "/catalog" || normalized.startsWith("/catalog/")) {
    return buildInternalPath("/catalog", search);
  }

  if (normalized === "/blog") {
    return buildInternalPath("/blog", search);
  }

  if (normalized.startsWith("/blog/")) {
    const slug = normalized.split("/").filter(Boolean)[1];
    return slug ? buildInternalPath(`/blog/${encodeURIComponent(decodeURIComponent(slug))}`, search) : "/blog";
  }

  if (normalized === "/cart") {
    return "/cart";
  }

  if (normalized === "/checkout") {
    return "/checkout";
  }

  if (normalized.startsWith("/product/")) {
    const id = normalized.split("/").filter(Boolean)[1];
    return id ? buildInternalPath(`/product/${encodeURIComponent(decodeURIComponent(id))}`, search) : "/catalog";
  }

  if (normalized.startsWith("/products/")) {
    const id = normalized.split("/").filter(Boolean)[1];
    return id ? buildInternalPath(`/product/${encodeURIComponent(decodeURIComponent(id))}`, search) : "/catalog";
  }

  if (normalized === "/roadmap" || normalized === "/campaigns" || normalized === "/firsatlar") {
    return "/roadmap";
  }

  return "/";
}

export function resolveAppLink(rawHref: string | null | undefined): AppLinkResolution {
  const trimmedHref = String(rawHref || "").trim();
  if (!trimmedHref) {
    return { kind: "none" };
  }

  if (/^https?:\/\//i.test(trimmedHref)) {
    try {
      const url = new URL(trimmedHref);
      if (!INTERNAL_WEB_HOSTS.has(url.hostname.toLowerCase())) {
        return { kind: "external", href: trimmedHref };
      }

      return {
        kind: "internal",
        href: normalizeStorefrontPath(url.pathname, url.search),
      };
    } catch {
      return { kind: "external", href: trimmedHref };
    }
  }

  if (/^[a-z]+:\/\//i.test(trimmedHref)) {
    return { kind: "external", href: trimmedHref };
  }

  return {
    kind: "internal",
    href: normalizeStorefrontPath(trimmedHref),
  };
}
