type UserNameLike = {
  name?: string;
  firstName?: string;
  lastName?: string;
} | null | undefined;

const normalizePart = (value?: string) => (typeof value === "string" ? value.trim() : "");

export const splitFullName = (fullName?: string) => {
  const normalized = normalizePart(fullName);
  if (!normalized) {
    return { firstName: "", lastName: "" };
  }
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

export const getDisplayName = (source: UserNameLike) => {
  const firstName = normalizePart(source?.firstName);
  const lastName = normalizePart(source?.lastName);
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || normalizePart(source?.name) || "-";
};

export const getNameInitial = (source: UserNameLike, fallback = "U") =>
  getDisplayName(source)?.charAt(0)?.toUpperCase() || fallback;
