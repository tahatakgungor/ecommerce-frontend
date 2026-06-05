"use client";
import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useGetActivityLogsQuery } from "@/redux/activity/activityApi";
import LoadingSpinner from "@/app/components/common/loading-spinner";
import ErrorMsg from "@/app/components/common/error-msg";
import Pagination from "../ui/Pagination";
import { Search } from "@/svg";
import { getAdminRangeLabel } from "@/utils/admin-list-query";

const ActivityLogArea = () => {
  const [eventType, setEventType] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchValue = useDeferredValue(searchValue.trim());
  const pageSize = 20;
  const { data, isLoading, isError } = useGetActivityLogsQuery({
    page: currentPage,
    size: pageSize,
    q: deferredSearchValue || undefined,
    eventType: eventType || undefined,
  });

  const logs = useMemo(() => data?.data?.logs || [], [data?.data?.logs]);
  const totalLogs = data?.data?.total || 0;
  const pageCount = data?.data?.totalPages || 0;
  const range = useMemo(
    () => getAdminRangeLabel(totalLogs, data?.data?.page || currentPage, data?.data?.size || pageSize, logs.length),
    [currentPage, data?.data?.page, data?.data?.size, logs.length, pageSize, totalLogs]
  );

  const eventTypeOptions = useMemo(() => {
    const all = Array.from(new Set((data?.data?.eventTypes || []).filter(Boolean)));
    return all.sort();
  }, [data?.data?.eventTypes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchValue, eventType]);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected + 1);
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMsg msg="Aktivite logları alınamadı." />;

  return (
    <div className="rounded-md bg-white p-4 sm:p-6 shadow-xs">
      <div className="admin-control-bar mb-4">
        <div>
          <h4 className="mb-0 text-[20px] font-semibold text-heading">Aktivite Logları</h4>
          <p className="mb-0 text-sm text-slate-500">Sistem akışları, sipariş olayları ve güvenlik kontrolleri.</p>
        </div>
        <div className="admin-control-bar__group">
          <div className="admin-control-bar__search">
            <input
              className="input"
              type="text"
              placeholder="Mesaj, aktör veya hedef ara"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <button className="hover:text-theme">
              <Search />
            </button>
          </div>
          <label htmlFor="eventType" className="admin-control-bar__label">
            Olay
          </label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="admin-control-bar__select"
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <p className="mb-0 text-xs text-slate-500">
              {range.start}-{range.end} / {totalLogs} log gösteriliyor
            </p>
            <div className="pagination flex items-center justify-end py-1">
              <Pagination handlePageClick={handlePageClick} pageCount={pageCount} focusPage={Math.max(0, currentPage - 1)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogArea;
