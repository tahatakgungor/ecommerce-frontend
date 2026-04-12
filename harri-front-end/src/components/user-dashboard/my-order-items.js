'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.locale('tr');
dayjs.extend(relativeTime);
import Pagination from "@ui/Pagination";
import { useLanguage } from "src/context/LanguageContext";
import QuickReviewModal from "./quick-review-modal";
import { getReturnStatusMeta } from "src/utils/order-status";
import { getReviewedList } from "src/utils/review-overview";

const MyOrderItems = ({ items, itemsPerPage, reviewOverview, refetchOverview, returnLookup = {}, refetchReturns }) => {
  const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [modalState, setModalState] = useState({ open: false, items: [], title: "" });
  const { t, lang } = useLanguage();
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
    if (status === "shipped") {
      return { label: t("statusShipped") || "Kargoda", bg: "#f5f3ff", color: "#6d28d9", border: "#c4b5fd" };
    }
    if (status === "delivered") {
      return { label: t("statusDelivered"), bg: "#ecfdf3", color: "#166534", border: "#86efac" };
    }
    if (status === "cancel" || status === "cancelled") {
      return { label: t("statusCancel"), bg: "#fef2f2", color: "#b91c1c", border: "#fca5a5" };
    }
    return { label: status || "-", bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
  };

  const formatOrderId = (id) => `#${id?.substring(20, 25) || "-"}`;

  const reviewedLookup = getReviewedList(reviewOverview).reduce((acc, row) => {
    const review = row?.review || {};
    const productId = row?.productId || review?.productId;
    if (productId) acc[productId] = row;
    return acc;
  }, {});

  const getOrderReviewItems = (order) => {
    const cartItems = Array.isArray(order?.cart) ? order.cart : [];
    return cartItems
      .map((item) => {
        const productId = item?._id || item?.id;
        if (!productId) return null;
        const existing = reviewedLookup[productId];
        return {
          productId,
          orderId: order?._id,
          title: item?.title,
          image: item?.image,
          ...(existing || {}),
        };
      })
      .filter(Boolean);
  };

  const openOrderReviewModal = (order) => {
    const modalItems = getOrderReviewItems(order);

    setModalState({
      open: true,
      items: modalItems,
      title: t("reviewProducts"),
    });
  };

  const closeModal = () => {
    setModalState({ open: false, items: [], title: "" });
  };

  return (
    <React.Fragment>
      <div className="row g-3">
        {currentItems &&
          currentItems.map((item, i) => {
            const statusMeta = getOrderStatusMeta(item?.status);
            const orderReviewItems = getOrderReviewItems(item);
            const hasReviewableItems = orderReviewItems.some((entry) => !entry?.review?.reviewId);
            const reviewButtonLabel = hasReviewableItems
              ? t("reviewProducts")
              : (t("myReviews") || (lang === "tr" ? "Değerlendirmeleri Yönet" : "Manage Reviews"));
            const existingReturn = returnLookup[item?._id];
            const returnMeta = existingReturn ? getReturnStatusMeta(existingReturn.status, lang) : null;
            const displayStatusMeta = returnMeta
              ? { label: returnMeta.label, bg: returnMeta.bg, color: returnMeta.color, border: returnMeta.border }
              : statusMeta;
            const isDelivered = ["delivered", "completed"].includes(String(item?.status || "").toLowerCase());
            const canRequestReturn = isDelivered && !existingReturn;
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
                        border: `1px solid ${displayStatusMeta.border}`,
                        background: displayStatusMeta.bg,
                        color: displayStatusMeta.color,
                        fontSize: 11,
                        fontWeight: 700,
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {displayStatusMeta.label}
                    </span>
                  </div>

                  {/* İade durumu badge */}
                  {returnMeta && (
                    <div style={{ marginBottom: 8 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "3px 10px",
                          borderRadius: 999,
                          border: `1px solid ${returnMeta.border}`,
                          background: returnMeta.bg,
                          color: returnMeta.color,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        ↩ {returnMeta.label}
                      </span>
                    </div>
                  )}

                  <div style={{ fontSize: 13, color: "#1f2937", marginBottom: 12 }}>
                    {dayjs(item?.createdAt).format("D MMMM YYYY HH:mm")}
                    <span style={{ fontSize: "11px", color: "#6b7280", marginLeft: "10px", fontWeight: "normal" }}>
                      ({dayjs(item?.createdAt).fromNow()})
                    </span>
                  </div>

                  {/* Kargo takip bilgisi */}
                  {item?.trackingNumber && (
                    <div
                      style={{
                        background: "#f5f3ff",
                        border: "1px solid #c4b5fd",
                        borderRadius: 8,
                        padding: "8px 12px",
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>📦</span>
                      <div>
                        <span style={{ fontWeight: 700, color: "#6d28d9", display: "block" }}>
                          {item.shippingCarrier} · {item.trackingNumber}
                        </span>
                        <span style={{ color: "#7c3aed", fontSize: 11 }}>
                          {t("trackingNumber") || "Kargo Takip No"}
                        </span>
                      </div>
                    </div>
                  )}

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
                  {isDelivered && orderReviewItems.length > 0 && (
                    <button
                      type="button"
                      className="tp-btn-border mt-10"
                      style={{ width: "100%", minHeight: 42 }}
                      onClick={() => openOrderReviewModal(item)}
                    >
                      {reviewButtonLabel}
                    </button>
                  )}
                  {canRequestReturn && (
                    <Link
                      href={`/order/${item._id}?mode=return#return-request`}
                      className="tp-btn-border mt-10"
                      style={{
                        width: "100%",
                        minHeight: 42,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        borderColor: "#d1d5db",
                        color: "#6b7280",
                        background: "#f9fafb",
                        fontWeight: 600,
                      }}
                    >
                      ↩ {t("requestReturn")}
                    </Link>
                  )}
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
      <QuickReviewModal
        open={modalState.open}
        onClose={closeModal}
        items={modalState.items}
        title={modalState.title}
        onCompleted={refetchOverview}
      />
      {/* pagination end */}
    </React.Fragment>
  );
};

export default MyOrderItems;
