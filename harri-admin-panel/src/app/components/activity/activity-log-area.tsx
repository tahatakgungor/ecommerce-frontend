"use client";
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useGetActivityLogsQuery } from "@/redux/activity/activityApi";
import LoadingSpinner from "@/app/components/common/loading-spinner";
import ErrorMsg from "@/app/components/common/error-msg";

const ActivityLogArea = () => {
  const [eventType, setEventType] = useState("");
  const { data, isLoading, isError } = useGetActivityLogsQuery({ limit: 120, eventType: eventType || undefined });

  const logs = useMemo(() => data?.data?.logs || [], [data?.data?.logs]);

  const eventTypeOptions = useMemo(() => {
    const all = Array.from(new Set((data?.data?.logs || []).map((item) => item.eventType).filter(Boolean)));
    return all.sort();
  }, [data?.data?.logs]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMsg msg="Aktivite logları alınamadı." />;

  return (
    <div className="rounded-md bg-white p-4 sm:p-6 shadow-xs">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="mb-0 text-[20px] font-semibold text-heading">Aktivite Logları</h4>
          <p className="mb-0 text-sm text-slate-500">Sistem akışları, sipariş olayları ve güvenlik kontrolleri.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="eventType" className="text-sm text-slate-500">
            Olay:
          </label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="h-9 rounded-md border border-gray6 px-2 text-sm"
          >
            <option value="">Tümü</option>
            {eventTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray6 p-4 text-sm text-slate-500">Henüz log kaydı bulunmuyor.</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const severity = String(log.severity || "INFO").toUpperCase();
            const badgeClass =
              severity === "ERROR"
                ? "bg-red-100 text-red-700"
                : severity === "WARN"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-700";

            return (
              <article key={log.id} className="rounded-md border border-gray6 p-3 sm:p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}>{severity}</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{log.eventType}</span>
                  <span className="text-xs text-slate-500">
                    {log.createdAt ? dayjs(log.createdAt).format("DD.MM.YYYY HH:mm:ss") : "-"}
                  </span>
                </div>
                <p className="mb-1 text-sm text-heading">{log.message}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>Aktör: {log.actor || "system"}</span>
                  <span>Hedef: {log.targetType || "-"} {log.targetId || ""}</span>
                </div>
                {log.metadata && (
                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded bg-slate-50 p-3 text-xs text-slate-700">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityLogArea;
