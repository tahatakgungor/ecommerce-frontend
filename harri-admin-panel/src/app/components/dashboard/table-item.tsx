import React from "react";
import { IOrder } from "@/types/order-amount-type";
import OrderActions from "../orders/order-actions";
import OrderStatusChange from "../orders/status-change";

export const getOrderStatusBadge = (rawStatus?: string) => {
  const status = String(rawStatus || "").toLowerCase().trim();
  if (status === "pending") return { label: "pending", className: "text-warning bg-warning/10" };
  if (status === "delivered" || status === "completed") return { label: "delivered", className: "text-success bg-success/10" };
  if (status === "processing") return { label: "processing", className: "text-indigo-500 bg-indigo-100" };
  if (status === "shipped") return { label: "shipped", className: "text-violet-700 bg-violet-100" };
  if (status === "cancel" || status === "cancelled") return { label: "cancelled", className: "text-danger bg-danger/10" };
  return { label: status || "-", className: "text-slate-700 bg-slate-100" };
};

const TableItem = (props: { order: IOrder }) => {
  const { order } = props;
  const statusMeta = getOrderStatusBadge(order.status);
  return (
    <tr className="bg-white border-b border-gray6 last:border-0 text-start">
      <td className="px-3 py-3">#{order.invoice}</td>
      <td className="px-3 py-3">
        {new Date(order.createdAt).toLocaleString('tr-TR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
      </td>
      <td className="px-3 py-3">{order.name}</td>
      <td className="px-3 py-3">₺{order.totalAmount}</td>
      <td className="px-3 py-3">
        <span
          className={`text-[11px] px-3 py-1 rounded-md leading-none font-medium ${statusMeta.className}`}
        >
          {statusMeta.label}
        </span>
      </td>
      <td className="px-3 py-3">
        <OrderStatusChange id={order._id} />
      </td>
      {/* order actions */}
      <OrderActions id={order._id} cls="px-3 py-3" />
      {/* order actions */}
    </tr>
  );
};

export default TableItem;
