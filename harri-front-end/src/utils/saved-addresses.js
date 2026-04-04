export function normalizeSavedAddresses(rawSavedAddresses) {
  if (!rawSavedAddresses) return [];

  if (Array.isArray(rawSavedAddresses)) {
    return rawSavedAddresses.filter(Boolean);
  }

  if (typeof rawSavedAddresses === "string") {
    const trimmed = rawSavedAddresses.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  return [];
}

