import type { OrderStatus } from "@/modules/orders/types";
import type { ReturnRequestStatus } from "@/modules/returns/types";

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
      label: "Sipariş Alındı",
      description: "Siparişiniz hazırlık kuyruğuna alındı.",
      tone: "warning",
    };
  }

  if (status === "processing") {
    return {
      status,
      label: "Hazırlanıyor",
      description: "Siparişiniz paketleniyor ve kargoya hazırlanıyor.",
      tone: "info",
    };
  }

  if (status === "shipped") {
    return {
      status,
      label: "Kargoda",
      description: "Siparişiniz kargoya verildi.",
      tone: "primary",
    };
  }

  if (status === "delivered") {
    return {
      status,
      label: "Teslim Edildi",
      description: "Siparişiniz teslim edildi.",
      tone: "success",
    };
  }

  if (status === "cancelled") {
    return {
      status,
      label: "İptal Edildi",
      description: "Siparişiniz iptal edildi.",
      tone: "danger",
    };
  }

  return {
    status,
    label: "Durum Güncelleniyor",
    description: "Sipariş durumu güncelleniyor.",
    tone: "secondary",
  };
}

type ReturnStatusMeta = {
  status: ReturnRequestStatus;
  label: string;
  description: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
};

function normalizeReturnStatus(rawStatus: string): ReturnRequestStatus {
  const safeStatus = rawStatus.trim().toUpperCase();
  if (safeStatus === "REQUESTED") return "REQUESTED";
  if (safeStatus === "APPROVED") return "APPROVED";
  if (safeStatus === "REJECTED") return "REJECTED";
  if (safeStatus === "RECEIVED") return "RECEIVED";
  if (safeStatus === "REFUNDED") return "REFUNDED";
  return "UNKNOWN";
}

export function getReturnStatusMeta(rawStatus: string): ReturnStatusMeta {
  const status = normalizeReturnStatus(rawStatus);

  if (status === "REQUESTED") {
    return {
      status,
      label: "İade Talebi",
      description: "Talebiniz inceleniyor.",
      backgroundColor: "#fff6e8",
      borderColor: "#efc17c",
      textColor: "#9a5b13",
    };
  }

  if (status === "APPROVED") {
    return {
      status,
      label: "İade Onaylandı",
      description: "Ürünü göndermeye hazırsınız.",
      backgroundColor: "#e8f0ff",
      borderColor: "#9dbcf2",
      textColor: "#2457a7",
    };
  }

  if (status === "REJECTED") {
    return {
      status,
      label: "İade Reddedildi",
      description: "Talep şu an için uygun bulunmadı.",
      backgroundColor: "#fff1f1",
      borderColor: "#f2a6a6",
      textColor: "#a52a2a",
    };
  }

  if (status === "RECEIVED") {
    return {
      status,
      label: "Ürün Teslim Alındı",
      description: "Geri ödeme süreci başlatıldı.",
      backgroundColor: "#f1ebff",
      borderColor: "#c7b2ef",
      textColor: "#6a3fb0",
    };
  }

  if (status === "REFUNDED") {
    return {
      status,
      label: "Ücret İade Edildi",
      description: "İade ödemeniz tamamlandı.",
      backgroundColor: "#eaf8ef",
      borderColor: "#96d5a9",
      textColor: "#1f6a38",
    };
  }

  return {
    status,
    label: "İade Durumu",
    description: "İade durumu güncelleniyor.",
    backgroundColor: "#f3f5f2",
    borderColor: "#d5ddd2",
    textColor: "#516052",
  };
}
