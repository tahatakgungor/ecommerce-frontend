import type { ForgotPasswordPayload, RegisterPayload, ResetPasswordPayload } from "@/modules/auth/types";

function normalizeText(value: string) {
  return value.trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function buildCustomerName(firstName: string, lastName: string) {
  return [normalizeText(firstName), normalizeText(lastName)].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export function validateRegisterPayload(payload: RegisterPayload) {
  if (!normalizeText(payload.firstName)) {
    return "Ad gerekli.";
  }

  if (!normalizeText(payload.lastName)) {
    return "Soyad gerekli.";
  }

  if (!isValidEmail(payload.email)) {
    return "Gecerli bir e-posta girin.";
  }

  if (normalizeText(payload.password).length < 6) {
    return "Sifre en az 6 karakter olmali.";
  }

  if (payload.password !== payload.confirmPassword) {
    return "Sifreler eslesmiyor.";
  }

  return null;
}

export function validateForgotPasswordPayload(payload: ForgotPasswordPayload) {
  if (!isValidEmail(payload.email)) {
    return "Gecerli bir e-posta girin.";
  }

  return null;
}

export function validateResetPasswordPayload(payload: ResetPasswordPayload) {
  if (!normalizeText(payload.token)) {
    return "Sifirlama baglantisi eksik veya gecersiz.";
  }

  if (normalizeText(payload.password).length < 6) {
    return "Sifre en az 6 karakter olmali.";
  }

  if (payload.password !== payload.confirmPassword) {
    return "Sifreler eslesmiyor.";
  }

  return null;
}
