import { fetchJson } from "@/lib/http-client";
import { normalizeTurkishText } from "@/lib/normalize-turkish-text";
import { normalizeReturnRequest } from "@/modules/returns/helpers";
import type { CreateReturnPayload, RawReturnRequest } from "@/modules/returns/types";

type ReturnListEnvelope = {
  returns?: RawReturnRequest[];
  data?: {
    returns?: RawReturnRequest[];
  };
};

type ReturnMutationEnvelope = {
  success?: boolean;
  message?: string;
};

export async function fetchMyReturnRequests() {
  const response = await fetchJson<ReturnListEnvelope>("/api/user-order/returns", {
    auth: true,
  });

  const rows = Array.isArray(response?.returns)
    ? response.returns
    : Array.isArray(response?.data?.returns)
    ? response.data.returns
    : [];

  return rows.map(normalizeReturnRequest).filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export async function createReturnRequest(payload: CreateReturnPayload) {
  const response = await fetchJson<ReturnMutationEnvelope>(`/api/user-order/${encodeURIComponent(payload.orderId)}/returns`, {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: payload.reason.trim(),
      customerNote: payload.customerNote.trim() || undefined,
    }),
  });

  return normalizeTurkishText(response?.message || "İade talebi oluşturuldu.");
}
