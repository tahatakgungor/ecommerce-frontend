export const ADMIN_PUBLIC_PATH_PREFIXES = ["/login", "/register", "/forgot-password"] as const;

export const isAdminPublicPath = (pathname?: string | null): boolean => {
  const value = String(pathname || "").trim();
  if (!value) return false;
  return ADMIN_PUBLIC_PATH_PREFIXES.some((prefix) => value === prefix || value.startsWith(`${prefix}/`));
};

