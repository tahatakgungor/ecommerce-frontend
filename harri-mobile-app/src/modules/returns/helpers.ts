import { formatOrderDate } from "@/modules/orders/helpers";
import { getReturnStatusMeta } from "@/modules/orders/status";
import type { RawReturnRequest, ReturnRequest } from "@/modules/returns/types";

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function normalizeReturnRequest(rawRequest: RawReturnRequest): ReturnRequest | null {
  const orderId = readString(rawRequest.orderId);
  if (!orderId) {
    return null;
  }

  const statusMeta = getReturnStatusMeta(readString(rawRequest.status));
  const createdAt = readString(rawRequest.createdAt);
  const updatedAt = readString(rawRequest.updatedAt);

  return {
    id: readString(rawRequest._id) || readString(rawRequest.id) || orderId,
    orderId,
    invoice: readString(rawRequest.invoice),
    status: statusMeta.status,
    statusLabel: statusMeta.label,
    statusDescription: statusMeta.description,
    reason: readString(rawRequest.reason),
    customerNote: readString(rawRequest.customerNote),
    createdAt,
    createdAtText: createdAt ? formatOrderDate(createdAt) : "Tarih yok",
    updatedAt,
    updatedAtText: updatedAt ? formatOrderDate(updatedAt) : "Tarih yok",
  };
}
