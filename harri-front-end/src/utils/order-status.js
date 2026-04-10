export function getOrderStatusMeta(rawStatus, lang = "tr") {
  const status = String(rawStatus || "").toLowerCase();

  const dictionary = {
    pending: {
      tr: { label: "Sipariş Alındı", desc: "Siparişiniz alındı, hazırlık kuyruğunda." },
      en: { label: "Order Received", desc: "Your order is received and queued for preparation." },
      tone: "warning",
    },
    processing: {
      tr: { label: "Hazırlanıyor", desc: "Siparişiniz hazırlanıyor ve kargoya verilecek." },
      en: { label: "Preparing", desc: "Your order is being prepared for shipment." },
      tone: "info",
    },
    shipped: {
      tr: { label: "Kargoya Verildi", desc: "Siparişiniz kargoya verildi, yolda!" },
      en: { label: "Shipped", desc: "Your order has been shipped and is on its way!" },
      tone: "primary",
    },
    delivered: {
      tr: { label: "Teslim Edildi", desc: "Siparişiniz teslim edildi." },
      en: { label: "Delivered", desc: "Your order has been delivered." },
      tone: "success",
    },
    cancelled: {
      tr: { label: "İptal Edildi", desc: "Siparişiniz iptal edildi." },
      en: { label: "Cancelled", desc: "Your order has been cancelled." },
      tone: "danger",
    },
    cancel: {
      tr: { label: "İptal Edildi", desc: "Siparişiniz iptal edildi." },
      en: { label: "Cancelled", desc: "Your order has been cancelled." },
      tone: "danger",
    },
  };

  const fallback = lang === "tr"
    ? { label: "Durum Güncelleniyor", desc: "Sipariş durumunuz güncelleniyor.", tone: "secondary" }
    : { label: "Status Updating", desc: "Your order status is being updated.", tone: "secondary" };

  const entry = dictionary[status];
  if (!entry) return fallback;

  const copy = lang === "tr" ? entry.tr : entry.en;
  return { ...copy, tone: entry.tone };
}

export function getReturnStatusMeta(rawStatus, lang = "tr") {
  const status = String(rawStatus || "").toUpperCase();

  const dictionary = {
    REQUESTED: {
      tr: { label: "İade Talep Edildi", desc: "İade talebiniz inceleniyor." },
      en: { label: "Return Requested", desc: "Your return request is under review." },
      tone: "warning",
      bg: "#fffbeb", border: "#fcd34d", color: "#92400e",
    },
    APPROVED: {
      tr: { label: "İade Onaylandı", desc: "İade talebiniz onaylandı, ürünü gönderebilirsiniz." },
      en: { label: "Return Approved", desc: "Your return is approved. You can ship the item." },
      tone: "info",
      bg: "#eff6ff", border: "#93c5fd", color: "#1e3a5f",
    },
    REJECTED: {
      tr: { label: "İade Reddedildi", desc: "İade talebiniz reddedildi." },
      en: { label: "Return Rejected", desc: "Your return request was rejected." },
      tone: "danger",
      bg: "#fef2f2", border: "#fca5a5", color: "#7f1d1d",
    },
    RECEIVED: {
      tr: { label: "Ürün Alındı", desc: "İade ürününüz tarafımıza ulaştı, para iadesi hazırlanıyor." },
      en: { label: "Item Received", desc: "We received your return. Refund is being processed." },
      tone: "primary",
      bg: "#f5f3ff", border: "#c4b5fd", color: "#4c1d95",
    },
    REFUNDED: {
      tr: { label: "İade Edildi", desc: "Para iadeniz tamamlandı." },
      en: { label: "Refunded", desc: "Your refund has been completed." },
      tone: "success",
      bg: "#ecfdf5", border: "#6ee7b7", color: "#065f46",
    },
  };

  const fallback = lang === "tr"
    ? { label: "İade İşlemi", desc: "İade durumunuz güncelleniyor.", tone: "secondary", bg: "#f3f4f6", border: "#d1d5db", color: "#374151" }
    : { label: "Return", desc: "Return status is updating.", tone: "secondary", bg: "#f3f4f6", border: "#d1d5db", color: "#374151" };

  const entry = dictionary[status];
  if (!entry) return fallback;

  const copy = lang === "tr" ? entry.tr : entry.en;
  return { ...copy, tone: entry.tone, bg: entry.bg, border: entry.border, color: entry.color };
}
