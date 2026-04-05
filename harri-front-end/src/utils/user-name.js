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
  const firstNameFromProfile = normalizePart(source?.firstName);
  if (firstNameFromProfile) {
    return firstNameFromProfile;
  }
  const nameFromProfile = normalizePart(source?.name);
  if (nameFromProfile) {
    return splitFullName(nameFromProfile).firstName;
  }
  return "";
};

export const getLastName = (source) => {
  if (typeof source === "string") {
    return splitFullName(source).lastName;
  }
  const lastNameFromProfile = normalizePart(source?.lastName);
  if (lastNameFromProfile) {
    return lastNameFromProfile;
  }
  const nameFromProfile = normalizePart(source?.name);
  if (nameFromProfile) {
    return splitFullName(nameFromProfile).lastName;
  }
  return "";
};

export const getFullName = (source) => {
  if (typeof source === "string") {
    return normalizePart(source);
  }
  const nameFromProfile = normalizePart(source?.name);
  if (nameFromProfile) {
    return nameFromProfile;
  }
  const firstName = getFirstName(source);
  const lastName = getLastName(source);
  const full = `${firstName} ${lastName}`.trim();
  return full;
};

export const getNameInitial = (source, fallback = "U") => {
  const fullName = getFullName(source);
  return fullName?.charAt(0)?.toUpperCase() || fallback;
};

export const normalizeFirstAndLastName = (firstNameInput, lastNameInput) => {
  const firstRaw = normalizePart(firstNameInput);
  const lastRaw = normalizePart(lastNameInput);
  const fullName = `${firstRaw} ${lastRaw}`.trim().replace(/\s+/g, " ");
  return {
    firstName: firstRaw,
    lastName: lastRaw,
    fullName,
  };
};
