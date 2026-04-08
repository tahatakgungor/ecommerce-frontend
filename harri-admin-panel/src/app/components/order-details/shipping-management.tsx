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

const ShippingManagement = ({ order }: Props) => {
  const isAlreadyShipped =
    order.status === "shipped" || order.status === "delivered";

  const [carrier, setCarrier] = useState(order.shippingCarrier || "");
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || ""
  );
  const [updateShipping, { isLoading }] = useUpdateShippingMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrier || !trackingNumber.trim()) {
      notifyError("Kargo firması ve takip numarası zorunludur.");
      return;
    }
    try {
      await updateShipping({
        id: order._id,
        shipping: { carrier, trackingNumber: trackingNumber.trim() },
      }).unwrap();
      notifySuccess(
        "Kargo bilgileri kaydedildi! Müşteriye bildirim e-postası gönderildi."
      );
    } catch {
      notifyError("Kargo bilgileri güncellenirken hata oluştu.");
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        border: "1px solid #86efac",
        borderRadius: "12px",
        padding: "24px",
        marginTop: "24px",
      }}
    >
      {/* Sipariş Kimlik Kartı */}
      <div
        style={{
          background: "white",
          borderRadius: "10px",
          padding: "14px 16px",
          marginBottom: "20px",
          border: "1px solid #bbf7d0",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: "14px",
          alignItems: "center",
        }}
      >
        {/* Invoice badge */}
        <div
          style={{
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "white",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            minWidth: "70px",
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 600, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Sipariş
          </div>
          <div style={{ fontSize: "16px", fontWeight: 800, lineHeight: 1.2 }}>
            #{order.invoice}
          </div>
        </div>

        {/* Customer info */}
        <div>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>
            {order.name || order.guestName || "—"}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
            {order.email || order.guestEmail || ""}
            {(order.contact || order.guestPhone) && (
              <span style={{ marginLeft: "8px" }}>· {order.contact || order.guestPhone}</span>
            )}
          </div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
            {order.city}{order.city && order.country ? ", " : ""}{order.country}
          </div>
        </div>

        {/* Total */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Toplam</div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#15803d" }}>
            ₺{order.totalAmount?.toFixed ? order.totalAmount.toFixed(2) : order.totalAmount}
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: "4px",
              padding: "2px 8px",
              borderRadius: "999px",
              fontSize: "10px",
              fontWeight: 700,
              background:
                order.status === "shipped" ? "#f5f3ff" :
                order.status === "delivered" ? "#ecfdf5" :
                order.status === "processing" ? "#eff6ff" :
                "#fff7ed",
              color:
                order.status === "shipped" ? "#6d28d9" :
                order.status === "delivered" ? "#166534" :
                order.status === "processing" ? "#1d4ed8" :
                "#9a3412",
              border: "1px solid",
              borderColor:
                order.status === "shipped" ? "#c4b5fd" :
                order.status === "delivered" ? "#86efac" :
                order.status === "processing" ? "#93c5fd" :
                "#fdba74",
            }}
          >
            {order.status}
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 5v4h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#15803d" }}>
            Kargo Yönetimi
          </h3>
          <p style={{ margin: 0, fontSize: "12px", color: "#4ade80" }}>
            {isAlreadyShipped ? "Kargo bilgileri kayıtlı" : "Siparişi kargoya ver ve müşteriye bildir"}
          </p>
        </div>
      </div>

      {/* Already Shipped Info */}
      {isAlreadyShipped && order.trackingNumber ? (
        <div>
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
              border: "1px solid #bbf7d0",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Kargo Firması
                </span>
                <p style={{ margin: "4px 0 0", fontWeight: 600, color: "#111827" }}>
                  {order.shippingCarrier}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Takip Numarası
                </span>
                <p style={{ margin: "4px 0 0", fontWeight: 700, color: "#15803d", fontFamily: "monospace", fontSize: "14px" }}>
                  {order.trackingNumber}
                </p>
              </div>
              {order.shippedAt && (
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Gönderim Tarihi
                  </span>
                  <p style={{ margin: "4px 0 0", color: "#374151" }}>
                    {new Date(order.shippedAt).toLocaleDateString("tr-TR", {
                      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Update Form for already-shipped orders */}
          <details style={{ marginTop: "8px" }}>
            <summary style={{ cursor: "pointer", fontSize: "13px", color: "#15803d", fontWeight: 600 }}>
              Kargo bilgilerini güncelle
            </summary>
            <ShippingForm
              carrier={carrier}
              setCarrier={setCarrier}
              trackingNumber={trackingNumber}
              setTrackingNumber={setTrackingNumber}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              buttonLabel="Güncelle"
            />
          </details>
        </div>
      ) : (
        <ShippingForm
          carrier={carrier}
          setCarrier={setCarrier}
          trackingNumber={trackingNumber}
          setTrackingNumber={setTrackingNumber}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          buttonLabel="Kargoya Ver & Müşteriye Bildir"
          note="Kaydedildiğinde sipariş durumu otomatik olarak 'Kargoya Verildi' yapılır ve müşteriye e-posta gönderilir."
        />
      )}
    </div>
  );
};

type FormProps = {
  carrier: string;
  setCarrier: (v: string) => void;
  trackingNumber: string;
  setTrackingNumber: (v: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  buttonLabel: string;
  note?: string;
};

const ShippingForm = ({
  carrier,
  setCarrier,
  trackingNumber,
  setTrackingNumber,
  isLoading,
  onSubmit,
  buttonLabel,
  note,
}: FormProps) => (
  <form onSubmit={onSubmit} style={{ marginTop: "16px" }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
          Kargo Firması <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <select
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "white",
            fontSize: "14px",
            color: "#111827",
            outline: "none",
          }}
        >
          <option value="">Firma seçin...</option>
          {CARRIERS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
          Takip Numarası <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Örn: 7649182736"
          required
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "white",
            fontSize: "14px",
            color: "#111827",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>

    {note && (
      <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "10px", display: "flex", alignItems: "flex-start", gap: "6px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" style={{ flexShrink: 0, marginTop: "1px" }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {note}
      </p>
    )}

    <button
      type="submit"
      disabled={isLoading}
      style={{
        marginTop: "16px",
        padding: "11px 22px",
        background: isLoading ? "#86efac" : "linear-gradient(135deg, #22c55e, #16a34a)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontWeight: 700,
        fontSize: "14px",
        cursor: isLoading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)",
        transition: "all 0.2s ease",
      }}
    >
      {isLoading ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          Gönderiliyor...
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22l-4-9-9-4z" />
          </svg>
          {buttonLabel}
        </>
      )}
    </button>
  </form>
);

export default ShippingManagement;
