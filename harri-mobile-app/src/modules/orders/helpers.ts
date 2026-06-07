import { formatTryPrice } from "@harri/commerce-contracts";

import { getOrderStatusMeta } from "@/modules/orders/status";
import type { OrderDetail, OrderFilter, OrderOverview, OrderSummary, RawOrderResponse } from "@/modules/orders/types";

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function formatOrderDate(rawDate: string) {
  if (!rawDate) {
    return "Tarih yok";
  }

  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(rawDate));
  } catch {
    return rawDate;
  }
}

export function normalizeOrder(rawOrder: RawOrderResponse): OrderDetail {
  const statusMeta = getOrderStatusMeta(readString(rawOrder.status));
  const items = Array.isArray(rawOrder.cart)
    ? rawOrder.cart.map((item) => {
        const price = readNumber(item?.price);
        return {
          id: readString(item?._id) || readString(item?.id),
          title: readString(item?.title) || readString(item?.name) || "Ürün",
          quantity: Math.max(1, readNumber(item?.orderQuantity) || 1),
          price,
          priceText: formatTryPrice(price),
          imageUrl: readString(item?.image) || readString(item?.img) || null,
          category: readString(item?.category?.name),
          parentCategory: readString(item?.parent),
        };
      })
    : [];

  const subtotal = readNumber(rawOrder.subTotal);
  const shippingCost = readNumber(rawOrder.shippingCost);
  const discount = readNumber(rawOrder.discount);
  const totalAmount = readNumber(rawOrder.totalAmount);

  return {
    id: readString(rawOrder._id),
    invoice: readString(rawOrder.invoice),
    status: statusMeta.status,
    statusText: statusMeta.label,
    statusDescription: statusMeta.description,
    statusTone: statusMeta.tone,
    totalAmount,
    totalAmountText: formatTryPrice(totalAmount),
    subtotalText: formatTryPrice(subtotal),
    shippingCostText: shippingCost <= 0 ? "Ücretsiz" : formatTryPrice(shippingCost),
    discountText: discount > 0 ? formatTryPrice(discount) : "Yok",
    paymentMethod: readString(rawOrder.paymentMethod) || "Kart",
    createdAt: readString(rawOrder.createdAt),
    createdAtText: formatOrderDate(readString(rawOrder.createdAt)),
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    isGuest: Boolean(rawOrder.isGuest),
    hasOpenReturn: Boolean(rawOrder.hasOpenReturn),
    shippingCarrier: readString(rawOrder.shippingCarrier),
    trackingNumber: readString(rawOrder.trackingNumber),
    name: readString(rawOrder.name),
    email: readString(rawOrder.email),
    contact: readString(rawOrder.contact),
    address: readString(rawOrder.address),
    city: readString(rawOrder.city),
    country: readString(rawOrder.country),
    zipCode: readString(rawOrder.zipCode),
    orderNote: readString(rawOrder.orderNote),
    agreementAccepted: Boolean(rawOrder.agreementAccepted),
    agreementAcceptedAt: readString(rawOrder.agreementAcceptedAt),
    shippedAt: readString(rawOrder.shippedAt),
    deliveredAt: readString(rawOrder.deliveredAt),
    guestEmail: readString(rawOrder.guestEmail),
    returnStatus: readString(rawOrder.returnStatus),
    items,
  };
}

export function buildOrderOverview(orders: OrderSummary[]): OrderOverview {
  return {
    total: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    processing: orders.filter((order) => order.status === "processing").length,
    shipped: orders.filter((order) => order.status === "shipped").length,
    delivered: orders.filter((order) => order.status === "delivered").length,
  };
}

export function filterOrdersByStatus(orders: OrderSummary[], filter: OrderFilter) {
  if (filter === "all") {
    return orders;
  }
  return orders.filter((order) => order.status === filter);
}
