const normalizePart = (value) => (typeof value === "string" ? value.trim() : "");

export const splitFullName = (fullName) => {
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

export const getFirstName = (source) => {
  if (typeof source === "string") {
    return splitFullName(source).firstName;
  }
  return normalizePart(source?.firstName) || splitFullName(source?.name).firstName;
};

export const getLastName = (source) => {
  if (typeof source === "string") {
    return splitFullName(source).lastName;
  }
  return normalizePart(source?.lastName) || splitFullName(source?.name).lastName;
};

export const getFullName = (source) => {
  if (typeof source === "string") {
    return normalizePart(source);
  }
  const firstName = getFirstName(source);
  const lastName = getLastName(source);
  const full = `${firstName} ${lastName}`.trim();
  return full || normalizePart(source?.name);
};

export const getNameInitial = (source, fallback = "U") => {
  const fullName = getFullName(source);
  return fullName?.charAt(0)?.toUpperCase() || fallback;
};
