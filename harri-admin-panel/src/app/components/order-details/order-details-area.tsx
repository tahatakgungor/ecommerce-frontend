"use client";
import dayjs from "dayjs";
import React, { useRef } from "react";
import ErrorMsg from "../common/error-msg";
import { useGetSingleOrderQuery } from "@/redux/order/orderApi";
import { Invoice } from "@/svg";
import { useReactToPrint } from "react-to-print";
import { notifyError } from "@/utils/toast";
import LoadingSpinner from "@/app/components/common/loading-spinner";
import ShippingManagement from "@/app/components/order-details/shipping-management";

const statusLabel = (status: string) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "pending") return "Beklemede";
  if (normalized === "processing") return "İşlemde";
  if (normalized === "shipped") return "Kargoda";
  if (normalized === "delivered") return "Teslim Edildi";
  if (normalized === "cancelled" || normalized === "cancel") return "İptal";
  return status || "Bilinmiyor";
};

const statusClassName = (status: string) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "pending") return "bg-amber-100 text-amber-700";
  if (normalized === "processing") return "bg-indigo-100 text-indigo-700";
  if (normalized === "shipped") return "bg-blue-100 text-blue-700";
  if (normalized === "delivered") return "bg-emerald-100 text-emerald-700";
  if (normalized === "cancelled" || normalized === "cancel") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
};

const OrderDetailsArea = ({ id }: { id: string }) => {
  const { data: orderData, isLoading, isError } = useGetSingleOrderQuery(id);
  const printRef = useRef<HTMLDivElement | null>(null);

  const cartItems = Array.isArray(orderData?.cart) ? (orderData?.cart as any[]) : [];
  const subTotal = orderData?.subTotal ?? cartItems.reduce((acc: number, curr: any) => acc + (curr.price || 0) * (curr.orderQuantity || 1), 0);
  const shipping = Number(orderData?.shippingCost || 0);
  const discount = Number(orderData?.discount || 0);
  const grandTotal = Number(orderData?.totalAmount ?? subTotal + shipping - discount);
  const customerName = orderData?.name || orderData?.guestName || "-";
  const customerEmail = orderData?.email || orderData?.guestEmail || "-";
  const customerPhone = orderData?.contact || orderData?.guestPhone || "-";

  const handlePrint = useReactToPrint({
    content: () => printRef?.current,
    documentTitle: `Invoice-${orderData?.invoice || "order"}`,
  });

  const handlePrintReceipt = async () => {
    try {
      handlePrint();
    } catch (err) {
      console.error("order print error", err);
      notifyError("Yazdırma işlemi başarısız oldu.");
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (isError || !orderData) {
    return <ErrorMsg msg="Sipariş detayı alınamadı" />;
  }

  return (
    <div className="px-3 sm:px-6">
      <div ref={printRef} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">Fatura</p>
            <h1 className="mb-1 text-xl font-bold text-slate-900">#{orderData.invoice}</h1>
            <p className="mb-0 text-sm text-slate-500">{dayjs(orderData.createdAt).format("DD MMMM YYYY HH:mm")}</p>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClassName(orderData.status)}`}>
            {statusLabel(orderData.status)}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Müşteri</p>
            <p className="mb-1 text-sm font-semibold text-slate-900">{customerName}</p>
            <p className="mb-0 break-all text-xs text-slate-600">{customerEmail}</p>
            <p className="mb-0 text-xs text-slate-600">{customerPhone}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Teslimat</p>
            <p className="mb-0 text-sm text-slate-700">{orderData.address || "-"}</p>
            <p className="mb-0 text-xs text-slate-600">{[orderData.city, orderData.country].filter(Boolean).join(", ") || "-"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Ödeme Özeti</p>
            <p className="mb-0 text-sm text-slate-700">Ara Toplam: ₺{Number(subTotal).toFixed(2)}</p>
            <p className="mb-0 text-sm text-slate-700">Kargo: ₺{shipping.toFixed(2)}</p>
            <p className="mb-0 text-sm text-slate-700">İndirim: ₺{discount.toFixed(2)}</p>
            <p className="mb-0 mt-1 text-base font-bold text-slate-900">Toplam: ₺{grandTotal.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-5">
          <h2 className="mb-2 text-base font-bold text-slate-900">Ürünler</h2>
          <div className="admin-table-shell">
            <table className="w-full min-w-[680px] text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2">#</th>
                  <th className="px-2 py-2">Ürün</th>
                  <th className="px-2 py-2 text-center">Adet</th>
                  <th className="px-2 py-2 text-right">Birim Fiyat</th>
                  <th className="px-2 py-2 text-right">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item: any, index: number) => (
                  <tr key={item._id || `${item.title}-${index}`} className="border-b border-slate-100">
                    <td className="px-2 py-2">{index + 1}</td>
                    <td className="px-2 py-2 font-medium text-slate-900">{item.title}</td>
                    <td className="px-2 py-2 text-center">{item.orderQuantity}</td>
                    <td className="px-2 py-2 text-right">₺{Number(item.price || 0).toFixed(2)}</td>
                    <td className="px-2 py-2 text-right font-semibold">₺{Number((item.price || 0) * (item.orderQuantity || 1)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ShippingManagement order={orderData} />

      <div className="my-4 flex justify-end">
        <button onClick={handlePrintReceipt} className="tp-btn px-5 py-2">
          Faturayı Yazdır
          <span className="ml-2">
            <Invoice />
          </span>
        </button>
      </div>
    </div>
  );
};

export default OrderDetailsArea;
