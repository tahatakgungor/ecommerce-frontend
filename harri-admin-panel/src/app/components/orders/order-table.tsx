import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import OrderActions from "./order-actions";
import { Search } from "@/svg";
import ErrorMsg from "../common/error-msg";
import Pagination from "../ui/Pagination";
import OrderStatusChange from "./status-change";
import { useGetAllOrdersQuery } from "@/redux/order/orderApi";
import LoadingSpinner from "@/app/components/common/loading-spinner";
import { getApiErrorMessage } from "@/utils/api-error";
import { getAdminRangeLabel } from "@/utils/admin-list-query";

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: "Beklemede", className: "text-amber-700 bg-amber-100" },
  processing: { label: "İşlemde", className: "text-indigo-700 bg-indigo-100" },
  shipped: { label: "Kargoda", className: "text-blue-700 bg-blue-100" },
  delivered: { label: "Teslim Edildi", className: "text-emerald-700 bg-emerald-100" },
  cancelled: { label: "İptal", className: "text-rose-700 bg-rose-100" },
  cancel: { label: "İptal", className: "text-rose-700 bg-rose-100" },
};

const getStatusMeta = (statusRaw: string) => {
  const key = String(statusRaw || "").toLowerCase();
  return STATUS_META[key] || { label: statusRaw || "Bilinmiyor", className: "text-gray-700 bg-gray-100" };
};

const getOrderItemCount = (cart: any) => {
  if (!Array.isArray(cart)) return 0;
  return cart.reduce((acc: number, curr: any) => acc + (curr.orderQuantity || 0), 0);
};

const formatAmount = (value: number) => `₺${Number(value || 0).toFixed(2)}`;

const OrderTable = () => {
  const [searchVal, setSearchVal] = useState<string>("");
  const [selectVal, setSelectVal] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchVal = useDeferredValue(searchVal.trim());
  const pageSize = 8;

  const { data: orders, isError, isLoading, error } = useGetAllOrdersQuery({
    page: currentPage,
    size: pageSize,
    q: deferredSearchVal || undefined,
    status: selectVal || undefined,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchVal, selectVal]);

  const currentItems = useMemo(
    () => [...(orders?.data?.orders || [])].sort(
      (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
    ),
    [orders?.data?.orders]
  );
  const totalOrders = orders?.data?.total || 0;
  const pageCount = orders?.data?.totalPages || 0;
  const range = useMemo(
    () => getAdminRangeLabel(totalOrders, orders?.data?.page || currentPage, orders?.data?.size || pageSize, currentItems.length),
    [currentItems.length, currentPage, orders?.data?.page, orders?.data?.size, pageSize, totalOrders]
  );

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected + 1);
  };

  let content = null;

  if (isLoading) {
    content = <LoadingSpinner />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg={getApiErrorMessage(error)} />;
  }
  if (!isLoading && !isError && totalOrders === 0) {
    content = <ErrorMsg msg="Sipariş bulunamadı" />;
  }

  if (!isLoading && !isError && orders?.success && totalOrders > 0) {
    content = (
      <>
        <div className="md:hidden space-y-3 px-4 pb-4">
          {currentItems.map((item) => {
            const statusMeta = getStatusMeta(item.status);
            return (
              <article key={item._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Sipariş</p>
                    <p className="text-sm font-bold text-slate-900">#{item.invoice}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusMeta.className}`}>
                      {statusMeta.label}
                    </span>
                    {item.hasOpenReturn && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300">
                        ↩ İade
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Müşteri</p>
                    <p className="font-medium text-slate-900">{item.name || "-"}</p>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        item.isGuest
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.isGuest ? "Misafir" : "Kayıtlı"}
                    </span>
                    {item.isGuest && item.guestEmail && (
                      <p className="text-[11px] text-slate-500">{item.guestEmail}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">Toplam</p>
                    <p className="font-semibold text-slate-900">{formatAmount(item.totalAmount)}</p>
                    <p className="text-[11px] text-slate-500">{getOrderItemCount(item.cart)} ürün</p>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </div>

                <div className="mt-3 space-y-2">
                  <OrderStatusChange id={item._id} />
                  {String(item.status || "").toLowerCase() === "processing" && !item.trackingNumber && (
                    <a
                      href={`/order-details/${item._id}`}
                      className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-purple-300 bg-purple-50 px-3 py-2 text-[12px] font-semibold text-purple-700 hover:bg-purple-100"
                    >
                      📦 Kargo Bilgisi Ekle
                    </a>
                  )}
                  <OrderActions id={item._id} asCell={false} />
                </div>
              </article>
            );
          })}
        </div>

        <div className="admin-table-shell relative mx-4 hidden md:block">
          <table className="w-full text-base text-left text-gray-500">
            <thead className="bg-white">
              <tr className="border-b border-gray6 text-tiny">
                <th scope="col" className="pr-8 py-3 text-tiny text-text2 uppercase font-semibold min-w-[120px]">FATURA NO</th>
                <th scope="col" className="px-3 py-3 text-tiny text-text2 uppercase font-semibold">Müşteri</th>
                <th scope="col" className="px-3 py-3 text-tiny text-text2 uppercase font-semibold min-w-[96px] text-end">Adet</th>
                <th scope="col" className="px-3 py-3 text-tiny text-text2 uppercase font-semibold min-w-[110px] text-end">Toplam</th>
                <th scope="col" className="px-3 py-3 text-tiny text-text2 uppercase font-semibold min-w-[110px] text-end">Durum</th>
                <th scope="col" className="px-3 py-3 text-tiny text-text2 uppercase font-semibold min-w-[120px] text-end">Tarih</th>
                <th scope="col" className="px-9 py-3 text-tiny text-text2 uppercase font-semibold text-end" style={{ width: 240, minWidth: 240 }}>İşlem</th>
                <th scope="col" className="px-9 py-3 text-tiny text-text2 uppercase font-semibold w-[4%] text-end">Fatura</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => {
                const statusMeta = getStatusMeta(item.status);
                return (
                  <tr key={item._id} className="bg-white border-b border-gray6 last:border-0 text-start mx-9">
                    <td className="px-3 py-3 font-normal text-[#55585B]">#{item.invoice}</td>
                    <td className="pr-8 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-heading">{item?.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              item.isGuest
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {item.isGuest ? "Misafir" : "Kayıtlı"}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 mt-1">{item.guestEmail || item.email || "-"}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-normal text-[#55585B] text-end">{getOrderItemCount(item.cart)}</td>
                    <td className="px-3 py-3 font-normal text-[#55585B] text-end">{formatAmount(item.totalAmount)}</td>
                    <td className="px-3 py-3 text-end">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[11px] px-3 py-1 rounded-md leading-none font-medium ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                        {item.hasOpenReturn && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700 border border-amber-300">
                            ↩ İade
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-normal text-[#55585B] text-end">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="px-3 py-3 text-end" style={{ width: 240, minWidth: 240 }}>
                      <div className="flex flex-col items-end gap-1.5">
                        <OrderStatusChange id={item._id} />
                        {String(item.status || "").toLowerCase() === "processing" && !item.trackingNumber && (
                          <a
                            href={`/order-details/${item._id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-purple-300 bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-100"
                          >
                            📦 Kargo Ekle
                          </a>
                        )}
                      </div>
                    </td>
                    <OrderActions id={item._id} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-3 px-4 sm:px-8 pb-4">
          <p className="mb-0 text-tiny">
            {range.start}–{range.end} / {totalOrders} sipariş gösteriliyor
          </p>
          <div className="pagination py-1 flex justify-end items-center sm:mx-8">
            <Pagination
              handlePageClick={handlePageClick}
              pageCount={pageCount}
              focusPage={Math.max(0, (orders?.data?.page || currentPage) - 1)}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="admin-control-bar">
        <div className="admin-control-bar__group">
          <span className="admin-control-bar__label">Sipariş Ara</span>
          <div className="admin-control-bar__search">
            <button
              type="button"
              aria-label="Fatura numarası ara"
              className="hover:text-theme"
            >
              <Search />
            </button>
            <input
              className="input"
              type="text"
              placeholder="Fatura no ile ara"
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-control-bar__group">
          <span className="admin-control-bar__label">Durum</span>
          <select
            onChange={(e) => setSelectVal(e.target.value)}
            className="admin-control-bar__select"
            aria-label="Duruma göre filtrele"
          >
            <option value="">Tümü</option>
            <option value="delivered">Teslim Edildi</option>
            <option value="shipped">Kargoda</option>
            <option value="pending">Beklemede</option>
            <option value="processing">İşlemde</option>
            <option value="cancelled">İptal</option>
            <option value="cancel">İptal (Eski)</option>
          </select>
          {selectVal ? (
            <span className="admin-control-bar__chip is-active">{getStatusMeta(selectVal).label}</span>
          ) : (
            <span className="admin-control-bar__chip">Tüm Siparişler</span>
          )}
        </div>
      </div>

      {content}
    </>
  );
};

export default OrderTable;
