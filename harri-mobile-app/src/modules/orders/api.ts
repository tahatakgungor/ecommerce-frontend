import { fetchJson } from "@/lib/http-client";
import { normalizeOrder } from "@/modules/orders/helpers";
import type { GuestLookupPayload, OrderDetail, RawOrderResponse } from "@/modules/orders/types";

type UserOrdersResponse = {
  orders?: RawOrderResponse[];
};

type UserOrderResponse = {
  order?: RawOrderResponse;
};

type GuestLookupEnvelope = {
  success?: boolean;
  data?: {
    order?: RawOrderResponse;
  };
  order?: RawOrderResponse;
};

function ensureOrder(rawOrder: RawOrderResponse | undefined, fallbackMessage: string): OrderDetail {
  if (!rawOrder?._id) {
    throw new Error(fallbackMessage);
  }

  return normalizeOrder(rawOrder);
}

export async function fetchUserOrders() {
  const response = await fetchJson<UserOrdersResponse>("/api/user-order/order-by-user", {
    auth: true,
  });

  return Array.isArray(response?.orders) ? response.orders.map(normalizeOrder) : [];
}

export async function fetchUserOrderDetail(orderId: string) {
  const response = await fetchJson<UserOrderResponse>(`/api/user-order/single-order/${orderId}`, {
    auth: true,
  });

  return ensureOrder(response?.order, "Siparis bulunamadi.");
}

export async function lookupGuestOrder(payload: GuestLookupPayload) {
  const searchParams = new URLSearchParams({
    invoice: payload.invoice.trim(),
    email: payload.email.trim(),
  });
  const response = await fetchJson<GuestLookupEnvelope>(`/api/order/lookup?${searchParams.toString()}`);

  return ensureOrder(response?.data?.order || response?.order, "Siparis bulunamadi.");
}
