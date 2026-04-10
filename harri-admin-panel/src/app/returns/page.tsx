"use client";

import React, { useState } from "react";
import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useGetAdminReturnsQuery, useUpdateReturnStatusMutation } from "@/redux/returns/returnsApi";

const allowedTransitions: Record<string, string[]> = {
  REQUESTED: ["APPROVED", "REJECTED"],
  APPROVED:  ["RECEIVED"],
  RECEIVED:  ["REFUNDED"],
  REJECTED:  [],
  REFUNDED:  [],
};

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  REQUESTED: { label: "Talep Edildi",   bg: "#fffbeb", color: "#92400e", border: "#fcd34d" },
  APPROVED:  { label: "Onaylandı",      bg: "#eff6ff", color: "#1e3a5f", border: "#93c5fd" },
  REJECTED:  { label: "Reddedildi",     bg: "#fef2f2", color: "#7f1d1d", border: "#fca5a5" },
  RECEIVED:  { label: "Ürün Alındı",    bg: "#f5f3ff", color: "#4c1d95", border: "#c4b5fd" },
  REFUNDED:  { label: "İade Edildi",    bg: "#ecfdf5", color: "#065f46", border: "#6ee7b7" },
};

const NEXT_STATUS_LABELS: Record<string, string> = {
  APPROVED: "Onayla",
  REJECTED: "Reddet",
  RECEIVED: "Ürün Alındı Olarak İşaretle",
  REFUNDED: "İade Tamamlandı Olarak İşaretle",
};

const StatusBadge = ({ status }: { status: string }) => {
  const meta = STATUS_LABELS[status] || { label: status, bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 999,
      border: `1px solid ${meta.border}`, background: meta.bg,
      color: meta.color, fontSize: 12, fontWeight: 700,
    }}>
      {meta.label}
    </span>
  );
};

const ReturnsPage = () => {
  const { data, isLoading } = useGetAdminReturnsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateReturnStatusMutation();
  const returns = data?.returns || [];

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const filtered = filterStatus === "ALL"
    ? returns
    : returns.filter((r: any) => r.status === filterStatus);

  const onChangeStatus = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status, adminNote: adminNotes[id] || undefined }).unwrap();
      notifySuccess("İade durumu güncellendi.");
      setAdminNotes((prev) => { const next = { ...prev }; delete next[id]; return next; });
    } catch (err: any) {
      notifyError(err?.data?.message || "Durum güncellenemedi.");
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        <Breadcrumb title="İadeler" subtitle="Sipariş bazlı iade talepleri" />

        <div className="bg-white rounded-md p-6">
          {/* Özet sayaçlar */}
          <div className="flex flex-wrap gap-3 mb-6">
            {["ALL", "REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED"].map((s) => {
              const count = s === "ALL" ? returns.length : returns.filter((r: any) => r.status === s).length;
              const meta = s === "ALL"
                ? { label: "Tümü", bg: "#f3f4f6", color: "#374151", border: "#d1d5db" }
                : (STATUS_LABELS[s] || { label: s, bg: "#f3f4f6", color: "#374151", border: "#d1d5db" });
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    border: `1.5px solid ${filterStatus === s ? meta.color : meta.border}`,
                    background: filterStatus === s ? meta.bg : "#fff",
                    color: meta.color,
                  }}
                >
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-500">İade talepleri yükleniyor...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-500">Bu filtreye uygun iade talebi yok.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((item: any) => {
                const nextStatuses = allowedTransitions[item.status] || [];
                const isExpanded = expandedId === item._id;
                const history: any[] = item.statusHistory || [];

                return (
                  <div key={item._id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                    {/* Kart başlığı */}
                    <div
                      style={{ padding: "14px 16px", background: "#fafafa", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, cursor: "pointer" }}
                      onClick={() => setExpandedId(isExpanded ? null : item._id)}
                    >
                      <div style={{ flex: "1 1 160px" }}>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>Sipariş</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>
                          #{item.order?.invoice || item.orderId?.substring(0, 8)}
                        </div>
                      </div>
                      <div style={{ flex: "1 1 180px" }}>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>Müşteri</div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{item.userEmail}</div>
                      </div>
                      <div style={{ flex: "1 1 140px" }}>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>Tarih</div>
                        <div style={{ fontSize: 12 }}>{formatDate(item.createdAt)}</div>
                      </div>
                      <div style={{ flex: "0 0 auto" }}>
                        <StatusBadge status={item.status} />
                      </div>
                      <div style={{ flex: "0 0 auto", color: "#6b7280", fontSize: 16 }}>
                        {isExpanded ? "▲" : "▼"}
                      </div>
                    </div>

                    {/* Genişletilmiş detay */}
                    {isExpanded && (
                      <div style={{ padding: "16px", borderTop: "1px solid #e5e7eb" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>İade Nedeni</div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{item.reason}</div>
                          </div>
                          {item.customerNote && (
                            <div>
                              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Müşteri Notu</div>
                              <div style={{ fontSize: 13 }}>{item.customerNote}</div>
                            </div>
                          )}
                          {item.adminNote && (
                            <div>
                              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Admin Notu</div>
                              <div style={{ fontSize: 13, color: "#78350f", background: "#fffbeb", padding: "6px 10px", borderRadius: 6 }}>{item.adminNote}</div>
                            </div>
                          )}
                          {item.processedBy && (
                            <div>
                              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>İşlemi Yapan</div>
                              <div style={{ fontSize: 12 }}>{item.processedBy}</div>
                            </div>
                          )}
                        </div>

                        {/* Durum geçmişi */}
                        {history.length > 0 && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Durum Geçmişi</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {history.map((h: any, idx: number) => (
                                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12 }}>
                                  <div style={{ marginTop: 2 }}>
                                    <StatusBadge status={h.status} />
                                  </div>
                                  <div style={{ color: "#6b7280" }}>
                                    <span>{formatDate(h.changedAt)}</span>
                                    {h.actor && <span> · {h.actor}</span>}
                                    {h.note && <span> · <em>{h.note}</em></span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Aksiyon alanı */}
                        {nextStatuses.length > 0 && (
                          <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Durum Güncelle</div>
                            <div style={{ marginBottom: 10 }}>
                              <textarea
                                rows={2}
                                placeholder="Admin notu (opsiyonel) — müşteriye e-posta ile iletilir"
                                value={adminNotes[item._id] || ""}
                                onChange={(e) => setAdminNotes((prev) => ({ ...prev, [item._id]: e.target.value }))}
                                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, resize: "vertical" }}
                              />
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              {nextStatuses.map((nextStatus) => {
                                const isReject = nextStatus === "REJECTED";
                                return (
                                  <button
                                    key={nextStatus}
                                    disabled={isUpdating}
                                    onClick={() => onChangeStatus(item._id, nextStatus)}
                                    style={{
                                      padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                                      cursor: isUpdating ? "not-allowed" : "pointer",
                                      border: isReject ? "1px solid #fca5a5" : "1px solid #6ee7b7",
                                      background: isReject ? "#fef2f2" : "#ecfdf5",
                                      color: isReject ? "#7f1d1d" : "#065f46",
                                      opacity: isUpdating ? 0.6 : 1,
                                    }}
                                  >
                                    {isUpdating ? "İşleniyor..." : (NEXT_STATUS_LABELS[nextStatus] || nextStatus)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default ReturnsPage;
