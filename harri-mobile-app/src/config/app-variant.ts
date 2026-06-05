import Constants from "expo-constants";

export type AppVariant = "development" | "preview" | "production";

function normalizeVariant(value: unknown): AppVariant {
  if (value === "development" || value === "preview" || value === "production") {
    return value;
  }
  return "production";
}

export function getAppVariant() {
  return normalizeVariant(Constants.expoConfig?.extra?.appVariant);
}

export function isPreviewLikeVariant() {
  const variant = getAppVariant();
  return variant === "development" || variant === "preview";
}
