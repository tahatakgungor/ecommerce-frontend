"use client";
import React, { useState } from "react";
import { useUpdateShippingMutation } from "@/redux/order/orderApi";
import { notifyError, notifySuccess } from "@/utils/toast";
import { Order } from "@/types/order-amount-type";

const CARRIERS = [
  "Aras Kargo",
  "Yurtiçi Kargo",
  "MNG Kargo",
  "PTT Kargo",
  "Sürat Kargo",
  "UPS",
  "DHL",
  "Diğer",
];

type Props = {
  order: Order;
};

const normalizeTrackingNumber = (value: string) =>
  value.trim().replace(/\s+/g, "").toUpperCase();

const statusLabel = (status: string) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "shipped") return "Kargoda";
  if (normalized === "delivered") return "Teslim Edildi";
  if (normalized === "processing") return "İşlemde";
  if (normalized === "pending") return "Beklemede";
  if (normalized === "cancelled" || normalized === "cancel") return "İptal";
  return status || "Bilinmiyor";
};

const ShippingManagement = ({ order }: Props) => {
  const isAlreadyShipped = order.status === "shipped" || order.status === "delivered";
  const [carrier, setCarrier] = useState(order.shippingCarrier || "");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [updateShipping, { isLoading }] = useUpdateShippingMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedTracking = normalizeTrackingNumber(trackingNumber);

    if (!carrier) {
      notifyError("Kargo firması seçimi zorunludur.");
      return;
    }
    if (!normalizedTracking || normalizedTracking.length < 5) {
      notifyError("Geçerli bir takip numarası girin.");
      return;
    }

    try {
      await updateShipping({
        id: order._id,
        shipping: { carrier: carrier.trim(), trackingNumber: normalizedTracking },
      }).unwrap();
      setTrackingNumber(normalizedTracking);
      notifySuccess("Kargo bilgileri güncellendi. Müşteriye bilgilendirme e-postası gönderildi.");
    } catch {
      notifyError("Kargo bilgileri güncellenirken hata oluştu.");
    }
  };

  return (
    <section className="mt-6 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 sm:p-6">
      <div className="mb-4 grid gap-3 rounded-lg border border-emerald-100 bg-white p-4 sm:grid-cols-[auto,1fr,auto] sm:items-center">
        <div className="min-w-[92px] rounded-lg bg-emerald-600 px-3 py-2 text-center text-white">
          <div className="text-[10px] uppercase tracking-wide opacity-90">Sipariş</div>
          <div className="text-sm font-bold">#{order.invoice}</div>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{order.name || order.guestName || "-"}</p>
          <p className="truncate text-xs text-slate-500">{order.email || order.guestEmail || "-"}</p>
          <p className="truncate text-xs text-slate-500">
            {[order.city, order.country].filter(Boolean).join(", ") || "-"}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Toplam</p>
          <p className="text-base font-bold text-emerald-700">₺{Number(order.totalAmount || 0).toFixed(2)}</p>
          <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            {statusLabel(order.status)}
          </span>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 5v4h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <div>
          <h3 className="mb-0 text-sm font-bold text-emerald-700">Kargo Yönetimi</h3>
          <p className="mb-0 text-xs text-emerald-600">
            {isAlreadyShipped ? "Mevcut gönderi bilgilerini güncelleyebilirsiniz." : "Kargoya verildiğinde müşteri otomatik bilgilendirilir."}
          </p>
        </div>
      </div>

      {isAlreadyShipped && order.trackingNumber && (
        <div className="mb-4 rounded-lg border border-emerald-100 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Kargo Firması</p>
              <p className="mb-0 text-sm font-semibold text-slate-900">{order.shippingCarrier || "-"}</p>
            </div>
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Takip Numarası</p>
              <p className="mb-0 break-all font-mono text-sm font-semibold text-emerald-700">{order.trackingNumber}</p>
            </div>
            {order.shippedAt && (
              <div className="sm:col-span-2">
                <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Gönderim Tarihi</p>
                <p className="mb-0 text-sm text-slate-700">
                  {new Date(order.shippedAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-lg border border-emerald-100 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Kargo Firması <span className="text-rose-500">*</span>
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              required
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
            >
              <option value="">Firma seçin...</option>
              {CARRIERS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Takip Numarası <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Örn: 7649182736"
              required
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Kaydettiğinizde sipariş durumu otomatik olarak <strong>kargoda</strong> güncellenir ve müşteriye e-posta gider.
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {isLoading ? "Kaydediliyor..." : isAlreadyShipped ? "Kargo Bilgisini Güncelle" : "Kargoya Ver ve Bildir"}
        </button>
      </form>
    </section>
  );
};

export default ShippingManagement;
