export type ReturnRequestStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "RECEIVED" | "REFUNDED" | "UNKNOWN";

export type ReturnRequest = {
  id: string;
  orderId: string;
  invoice: string;
  status: ReturnRequestStatus;
  statusLabel: string;
  statusDescription: string;
  reason: string;
  customerNote: string;
  createdAt: string;
  createdAtText: string;
  updatedAt: string;
  updatedAtText: string;
};

export type CreateReturnPayload = {
  orderId: string;
  reason: string;
  customerNote: string;
};

export type RawReturnRequest = {
  _id?: string;
  id?: string;
  orderId?: string;
  invoice?: string;
  status?: string;
  reason?: string;
  customerNote?: string;
  createdAt?: string;
  updatedAt?: string;
};
