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
