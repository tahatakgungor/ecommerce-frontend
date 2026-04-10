"use client";

import React, { useMemo, useState } from "react";
import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useGetContactMessagesQuery, useUpdateContactMessageStatusMutation } from "@/redux/contact/contactApi";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tümü" },
  { value: "NEW", label: "Yeni" },
  { value: "IN_PROGRESS", label: "İşlemde" },
  { value: "RESOLVED", label: "Tamamlandı" },
];

const STATUS_META: Record<string, { label: string; className: string }> = {
  NEW: { label: "Yeni", className: "bg-amber-100 text-amber-700" },
  IN_PROGRESS: { label: "İşlemde", className: "bg-blue-100 text-blue-700" },
  RESOLVED: { label: "Tamamlandı", className: "bg-emerald-100 text-emerald-700" },
};

const ContactMessagesPage = () => {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading, isError } = useGetContactMessagesQuery(
    statusFilter === "ALL" ? undefined : { status: statusFilter }
  );
  const [updateStatus, { isLoading: isUpdating }] = useUpdateContactMessageStatusMutation();

  const messages = useMemo(() => data?.data?.messages || data?.messages || [], [data]);

  const formatDate = (raw?: string) => {
    if (!raw) return "-";
    return new Date(raw).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status, adminNote: adminNotes[id] || undefined }).unwrap();
      notifySuccess("Talep durumu güncellendi.");
    } catch (err: any) {
      notifyError(err?.data?.message || "Talep durumu güncellenemedi.");
    }
  };

  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        <Breadcrumb title="İletişim Talepleri" subtitle="Müşteri mesajlarını görüntüleyin ve yönetin" />
        <div className="rounded-md bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  statusFilter === option.value ? "bg-theme text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-500">Mesajlar yükleniyor...</p>
          ) : isError ? (
            <p className="text-sm text-rose-600">Mesajlar alınamadı. API uç noktası erişilebilir olduğunda listelenecek.</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-slate-500">Bu filtrede mesaj bulunmuyor.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((item: any) => {
                const id = item._id || item.id;
                const isExpanded = expandedId === id;
                const status = String(item.status || "NEW").toUpperCase();
                const statusMeta = STATUS_META[status] || STATUS_META.NEW;

                return (
                  <article key={id} className="rounded-lg border border-gray6 bg-white">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <div>
                        <p className="mb-0 text-sm font-semibold text-heading">{item.name || "Müşteri"}</p>
                        <p className="mb-0 text-xs text-slate-500">{item.email || "-"}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                        <p className="mb-0 mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray6 px-4 py-4">
                        <div className="mb-3 grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Telefon</p>
                            <p className="mb-0 text-sm text-heading">{item.phone || "-"}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Şirket</p>
                            <p className="mb-0 text-sm text-heading">{item.company || "-"}</p>
                          </div>
                        </div>

                        <div className="mb-3 rounded-md bg-slate-50 p-3">
                          <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Mesaj</p>
                          <p className="mb-0 whitespace-pre-wrap text-sm text-slate-700">{item.message || "-"}</p>
                        </div>

                        <textarea
                          rows={2}
                          className="mb-3 w-full rounded-md border border-gray6 p-2 text-sm"
                          placeholder="Admin notu (opsiyonel)"
                          value={adminNotes[id] || ""}
                          onChange={(e) => setAdminNotes((prev) => ({ ...prev, [id]: e.target.value }))}
                        />

                        <div className="flex flex-wrap gap-2">
                          {status !== "IN_PROGRESS" && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatus(id, "IN_PROGRESS")}
                              className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                            >
                              İşleme Al
                            </button>
                          )}
                          {status !== "RESOLVED" && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatus(id, "RESOLVED")}
                              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                            >
                              Çözüldü
                            </button>
                          )}
                          {status !== "NEW" && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatus(id, "NEW")}
                              className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
                            >
                              Yeniye Çek
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default ContactMessagesPage;
