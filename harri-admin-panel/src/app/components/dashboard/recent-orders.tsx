"use client";
import React from "react";
import ErrorMsg from "../common/error-msg";
import TableItem from "./table-item";
import TableHead from "./table-head";
import Pagination from "../ui/Pagination";
import { useGetRecentOrdersQuery } from "@/redux/order/orderApi";
import Link from "next/link";
import usePagination from "@/hooks/use-pagination";
import LoadingSpinner from "@/app/components/common/loading-spinner";
import OrderActions from "../orders/order-actions";
import OrderStatusChange from "../orders/status-change";
import { getOrderStatusBadge } from "./table-item";

const RecentOrders = () => {

  const { data: recentOrders, isError, isLoading } = useGetRecentOrdersQuery();
  const orderList = recentOrders?.orders;
  const orders = Array.isArray(orderList) ? orderList : [];
  const paginationData = usePagination(orders, 5);
  const { currentItems, handlePageClick, pageCount } = paginationData;

  // decide what to render
  let content = null;

  if (isLoading) {
    content = <LoadingSpinner />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }

  if (!isLoading && !isError && orders.length > 0) {
    content = (
      <>
        <div className="hidden md:block">
          <table className="w-full text-base text-left text-gray-500">
            <TableHead />
            <tbody>
              {currentItems.map((order) => (
                <TableItem key={order._id} order={order} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 md:hidden">
          {currentItems.map((order) => {
            const status = getOrderStatusBadge(order.status);
            return (
              <article key={order._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-1 text-xs text-slate-500">Invoice</p>
                    <p className="mb-0 truncate text-sm font-semibold text-slate-900">#{order.invoice || "-"}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="mb-1 text-slate-500">Customer</p>
                    <p className="mb-0 truncate font-medium text-slate-900">{order.name || "-"}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="mb-1 text-slate-500">Amount</p>
                    <p className="mb-0 font-semibold text-slate-900">₺{Number(order.totalAmount || 0).toFixed(2)}</p>
                  </div>
                </div>

                <p className="mb-3 text-xs text-slate-600">
                  {new Date(order.createdAt).toLocaleString("tr-TR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <OrderStatusChange id={order._id} />
                  <OrderActions id={order._id} asCell={false} />
                </div>
              </article>
            );
          })}
        </div>
        {/*  */}
        <div className="px-4 pt-6 border-t border-gray6">
          <div className="pagination flex flex-col justify-between sm:flex-row">
            <span className="flex items-center uppercase">
               Showing 1-{currentItems.length} of {orders.length}
            </span>
            <Pagination
              handlePageClick={handlePageClick}
              pageCount={pageCount}
            />
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="bg-white p-4 sm:p-6 lg:p-8 col-span-12 xl:col-span-12 2xl:col-span-12 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium tracking-wide text-slate-700 text-lg mb-0 leading-none">
              Recent Orders
            </h3>
            <Link
              href="/orders"
              className="leading-none text-base text-info border-b border-info border-dotted capitalize font-medium hover:text-info/60 hover:border-info/60"
            >
              View All
            </Link>
          </div>

          {/* table */}
          <div className="admin-table-shell">{content}</div>
        </div>
      </div>
    </>
  );
};

export default RecentOrders;
