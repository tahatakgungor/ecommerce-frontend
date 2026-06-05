import { fetchJson } from "@/lib/http-client";
import type { LoginPayload, SessionUser } from "@/modules/auth/types";

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
};

type CustomerLoginEnvelope = {
  success?: boolean;
  data?: {
    token?: string;
    user?: CustomerUserDto;
  };
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
