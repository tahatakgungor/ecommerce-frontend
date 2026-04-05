'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import Pagination from "@ui/Pagination";
import { useLanguage } from "src/context/LanguageContext";

const MyOrderItems = ({ items, itemsPerPage }) => {
  const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const { t } = useLanguage();
  // side effect
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(items?.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(items.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, items]);

  // handlePageClick
  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    setItemOffset(newOffset);
  };

  const getOrderStatusMeta = (status) => {
    if (status === "pending") {
      return { label: t("statusPending"), bg: "#fff7ed", color: "#9a3412", border: "#fdba74" };
    }
    if (status === "processing") {
      return { label: t("statusProcessing"), bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd" };
    }
    if (status === "delivered") {
      return { label: t("statusDelivered"), bg: "#ecfdf3", color: "#166534", border: "#86efac" };
    }
    if (status === "cancel") {
      return { label: t("statusCancel"), bg: "#fef2f2", color: "#b91c1c", border: "#fca5a5" };
    }
    return { label: status || "-", bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
  };

  const formatOrderId = (id) => `#${id?.substring(20, 25) || "-"}`;

  return (
    <React.Fragment>
      <div className="row g-3">
        {currentItems &&
          currentItems.map((item, i) => {
            const statusMeta = getOrderStatusMeta(item?.status);
            return (
              <div key={i} className="col-12 col-md-6">
                <article
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    background: "#fff",
                    padding: 14,
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      alignItems: "start",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{t("orderId")}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{formatOrderId(item?._id)}</div>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 28,
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: `1px solid ${statusMeta.border}`,
                        background: statusMeta.bg,
                        color: statusMeta.color,
                        fontSize: 11,
                        fontWeight: 700,
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{t("orderTime")}</div>
                  <div style={{ fontSize: 13, color: "#1f2937", marginBottom: 12 }}>
                    {dayjs(item?.createdAt).format("MMMM D, YYYY")}
                  </div>

                  <Link
                    href={`/order/${item._id}`}
                    className="tp-btn"
                    style={{
                      width: "100%",
                      minHeight: 42,
                      lineHeight: "42px",
                      textAlign: "center",
                      padding: "0 12px",
                    }}
                  >
                    {t("invoiceLink")}
                  </Link>
                </article>
              </div>
            );
          })}
      </div>
      {/* pagination start */}
      {items.length > itemsPerPage && (
        <div className="mt-20 ml-20 tp-pagination tp-pagination-style-2">
          <Pagination handlePageClick={handlePageClick} pageCount={pageCount} />
        </div>
      )}
      {/* pagination end */}
    </React.Fragment>
  );
};

export default MyOrderItems;
