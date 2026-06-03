export function normalizeAdminPage(value?: number | string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

export function normalizeAdminSize(value?: number | string | null, fallback = 8) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}

export function buildAdminListQueryParams<T extends object>(params: T) {
  return Object.entries(params).reduce<Record<string, string | number>>((acc, [key, value]) => {
    if (value === null || value === undefined || value === "") {
      return acc;
    }
    acc[key] = typeof value === "string" ? value.trim() : (value as number);
    return acc;
  }, {});
}

export function getAdminRangeLabel(total: number, page: number, size: number, itemCount: number) {
  if (total <= 0 || itemCount <= 0) {
    return { start: 0, end: 0 };
  }
  const start = ((normalizeAdminPage(page) - 1) * normalizeAdminSize(size)) + 1;
  const end = Math.min(total, start + itemCount - 1);
  return { start, end };
}
