import { fetchJson } from "@/lib/http-client";
import { normalizeTurkishText } from "@/lib/normalize-turkish-text";
import { buildCustomerName } from "@/modules/auth/validators";
import type {
  ChangePasswordConfirmPayload,
  ConfirmEmailResult,
  ChangePasswordRequestPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  SessionUser,
  UpdateProfilePayload,
} from "@/modules/auth/types";

type CustomerUserDto = {
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  savedAddresses?: string;
};

type CustomerLoginEnvelope = {
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: CustomerUserDto;
  };
};

type ApiMessageEnvelope = {
  success?: boolean;
  message?: string;
};

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeUser(rawUser: CustomerUserDto | undefined): SessionUser {
  return {
    id: toStringValue(rawUser?._id),
    name: toStringValue(rawUser?.name),
    firstName: toStringValue(rawUser?.firstName),
    lastName: toStringValue(rawUser?.lastName),
    email: toStringValue(rawUser?.email),
    role: toStringValue(rawUser?.role),
    phone: toStringValue(rawUser?.phone),
    address: toStringValue(rawUser?.address),
    city: toStringValue(rawUser?.city),
    country: toStringValue(rawUser?.country),
    zipCode: toStringValue(rawUser?.zipCode),
    savedAddresses: toStringValue(rawUser?.savedAddresses),
  };
}

export async function loginCustomer(payload: LoginPayload) {
  const response = await fetchJson<CustomerLoginEnvelope>("/api/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const token = toStringValue(response?.data?.token);
  if (!token) {
    throw new Error("Login token missing");
  }

  return {
    token,
    user: normalizeUser(response?.data?.user),
  };
}

export async function fetchCurrentUser() {
  const response = await fetchJson<CustomerUserDto>("/api/user/me", {
    auth: true,
  });

  return normalizeUser(response);
}

export async function logoutCustomer() {
  await fetchJson<{ success?: boolean; message?: string }>("/api/user/logout", {
    method: "POST",
    auth: true,
  });
}

export async function registerCustomer(payload: RegisterPayload) {
  const response = await fetchJson<CustomerLoginEnvelope>("/api/user/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: buildCustomerName(payload.firstName, payload.lastName),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone.trim() || undefined,
      email: payload.email.trim(),
      password: payload.password,
      confirmPassword: payload.confirmPassword,
    }),
  });

  return normalizeTurkishText(response?.message || "Doğrulama e-postası gönderildi.");
}

export async function requestPasswordReset(payload: ForgotPasswordPayload) {
  const response = await fetchJson<ApiMessageEnvelope>("/api/user/forget-password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email.trim(),
    }),
  });

  return normalizeTurkishText(response?.message || "Şifre sıfırlama bağlantısı gönderildi.");
}

export async function confirmPasswordReset(payload: ResetPasswordPayload) {
  const response = await fetchJson<ApiMessageEnvelope>("/api/user/confirm-forget-password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: payload.token.trim(),
      password: payload.password,
      confirmPassword: payload.confirmPassword,
    }),
  });

  return normalizeTurkishText(response?.message || "Şifre başarıyla güncellendi.");
}

export async function updateCustomerProfile(payload: UpdateProfilePayload) {
  const defaultAddress = payload.savedAddresses.find((item) => item.isDefault) || payload.savedAddresses[0];
  const response = await fetchJson<CustomerLoginEnvelope>("/api/user/update-user", {
    method: "PUT",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: buildCustomerName(payload.firstName, payload.lastName),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      address: defaultAddress?.address || "",
      city: defaultAddress?.city || "",
      country: defaultAddress?.country || "",
      zipCode: defaultAddress?.zipCode || "",
      savedAddresses: JSON.stringify(payload.savedAddresses),
    }),
  });

  return {
    message: normalizeTurkishText(response?.message || "Profil güncellendi."),
    user: normalizeUser(response?.data?.user),
  };
}

export async function requestPasswordChange(payload: ChangePasswordRequestPayload) {
  const response = await fetchJson<ApiMessageEnvelope>("/api/user/change-password/request", {
    method: "PATCH",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    }),
  });

  return normalizeTurkishText(response?.message || "Doğrulama kodu gönderildi.");
}

export async function confirmPasswordChange(payload: ChangePasswordConfirmPayload) {
  const response = await fetchJson<ApiMessageEnvelope>("/api/user/change-password/confirm", {
    method: "PATCH",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: payload.code.trim(),
    }),
  });

  return normalizeTurkishText(response?.message || "Şifre güncellendi.");
}

export async function confirmCustomerEmail(token: string): Promise<ConfirmEmailResult> {
  const response = await fetchJson<CustomerLoginEnvelope>(`/api/user/confirmEmail/${encodeURIComponent(token.trim())}`);
  const nextToken = toStringValue(response?.data?.token);

  if (!nextToken) {
    throw new Error("Email confirmation token missing");
  }

  return {
    token: nextToken,
    user: normalizeUser(response?.data?.user),
    message: normalizeTurkishText(response?.message || "E-posta doğrulandı."),
  };
}
