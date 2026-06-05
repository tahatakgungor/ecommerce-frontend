import type { OrderStatus } from "@/modules/orders/types";

type OrderStatusMeta = {
  status: OrderStatus;
  label: string;
  description: string;
  tone: "warning" | "info" | "primary" | "success" | "danger" | "secondary";
};

export function normalizeOrderStatus(rawStatus: string): OrderStatus {
  const safeStatus = rawStatus.trim().toLowerCase();
  if (safeStatus === "pending") return "pending";
  if (safeStatus === "processing") return "processing";
  if (safeStatus === "shipped") return "shipped";
  if (safeStatus === "delivered") return "delivered";
  if (safeStatus === "cancelled" || safeStatus === "cancel") return "cancelled";
  return "unknown";
}

export function getOrderStatusMeta(rawStatus: string): OrderStatusMeta {
  const status = normalizeOrderStatus(rawStatus);

  if (status === "pending") {
    return {
      status,
      label: "Siparis Alindi",
      description: "Siparisiniz hazirlik kuyruguna alindi.",
      tone: "warning",
    };
  }

  if (status === "processing") {
    return {
      status,
      label: "Hazirlaniyor",
      description: "Siparisiniz paketleniyor ve kargoya hazirlaniyor.",
      tone: "info",
    };
  }

  if (status === "shipped") {
    return {
      status,
      label: "Kargoda",
      description: "Siparisiniz kargoya verildi.",
      tone: "primary",
    };
  }

  if (status === "delivered") {
    return {
      status,
      label: "Teslim Edildi",
      description: "Siparisiniz teslim edildi.",
      tone: "success",
    };
  }

  if (status === "cancelled") {
    return {
      status,
      label: "Iptal Edildi",
      description: "Siparisiniz iptal edildi.",
      tone: "danger",
    };
  }

  return {
    status,
    label: "Durum Guncelleniyor",
    description: "Siparis durumu guncelleniyor.",
    tone: "secondary",
  };
}
