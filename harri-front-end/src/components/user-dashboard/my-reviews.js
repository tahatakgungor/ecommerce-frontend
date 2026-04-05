'use client';
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useLanguage } from "src/context/LanguageContext";
import { useDeleteOwnProductReviewMutation } from "src/redux/features/productApi";
import { notifyError, notifySuccess } from "@utils/toast";
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  normalizeMediaUrl,
} from "src/utils/media-url";
import QuickReviewModal from "./quick-review-modal";

const tabButtonStyle = (active) => ({
  border: active ? "1px solid #6a9a2a" : "1px solid #d9e2d9",
  background: active ? "#edf8e7" : "#fff",
  color: active ? "#2f5e12" : "#374151",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 700,
  minHeight: 42,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "all .2s ease",
});

const badgeStyle = (active) => ({
  minWidth: 24,
  height: 24,
  borderRadius: 999,
  padding: "0 8px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 700,
  background: active ? "#6a9a2a" : "#eef2ef",
  color: active ? "#fff" : "#334155",
});

const MyReviews = ({ reviewOverview, isLoading, refetchOverview }) => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState("pending");
  const [deleteOwnReview, { isLoading: deleting }] = useDeleteOwnProductReviewMutation();
  const [modalState, setModalState] = useState({ open: false, items: [], title: "" });

  const reviewed = useMemo(() => reviewOverview?.reviewed || [], [reviewOverview]);
  const pending = useMemo(() => reviewOverview?.pending || [], [reviewOverview]);
  const reviewedActive = activeTab === "reviewed";
  const activeCount = reviewedActive ? reviewed.length : pending.length;

  const openModal = (items, title) => {
    setModalState({ open: true, items, title });
  };

  const closeModal = () => {
    setModalState({ open: false, items: [], title: "" });
  };

  const handleDelete = async (row) => {
    const review = row?.review || {};
    const productId = row?.productId || review?.productId;
    const reviewId = review?.reviewId || row?.reviewId;
    if (!productId || !reviewId) return;

    const approved = window.confirm(
      lang === "tr"
        ? "Bu değerlendirmeyi silmek istediğinize emin misiniz?"
        : "Are you sure you want to delete this review?"
    );
    if (!approved) return;

    try {
      await deleteOwnReview({ productId, reviewId }).unwrap();
      notifySuccess(lang === "tr" ? "Değerlendirme silindi." : "Review deleted.");
      refetchOverview?.();
    } catch (error) {
      notifyError(error?.data?.message || (lang === "tr" ? "Silme işlemi başarısız." : "Delete failed."));
    }
  };

  if (isLoading) {
    return <p>{lang === "tr" ? "Değerlendirmeler yükleniyor..." : "Loading reviews..."}</p>;
  }

  return (
    <div className="profile__ticket">
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff" }}>
        <div
          className="d-flex align-items-center justify-content-between flex-wrap"
          style={{ padding: "12px 12px 10px", borderBottom: "1px solid #edf1ef", gap: 10 }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              {lang === "tr" ? "Değerlendirmelerim" : "My Reviews"}
            </h4>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
              {lang === "tr"
                ? "Tüm değerlendirmeleri tek yerden yönetebilirsiniz."
                : "Manage all product reviews from one place."}
            </p>
          </div>
          <div
            style={{
              minHeight: 32,
              padding: "4px 10px",
              borderRadius: 999,
              background: "#f5faf3",
              border: "1px solid #dcead5",
              fontSize: 12,
              color: "#2f5e12",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {lang === "tr" ? "Görünen kayıt" : "Visible items"}: {activeCount}
          </div>
        </div>

        <div
          className="d-flex review-tabs"
          role="tablist"
          aria-label={lang === "tr" ? "Değerlendirme sekmeleri" : "Review tabs"}
          style={{ padding: 12, gap: 8, borderBottom: "1px solid #edf1ef", flexWrap: "wrap" }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={reviewedActive}
            onClick={() => setActiveTab("reviewed")}
            className="review-tab-btn"
            style={tabButtonStyle(reviewedActive)}
          >
            <span>{lang === "tr" ? "Değerlendirdiklerim" : "Reviewed"}</span>
            <span style={badgeStyle(reviewedActive)}>{reviewed.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!reviewedActive}
            onClick={() => setActiveTab("pending")}
            className="review-tab-btn"
            style={tabButtonStyle(!reviewedActive)}
          >
            <span>{lang === "tr" ? "Değerlendirmediklerim" : "Pending Reviews"}</span>
            <span style={badgeStyle(!reviewedActive)}>{pending.length}</span>
          </button>
        </div>

        <div style={{ padding: 12 }}>
          {reviewedActive ? (
            reviewed.length === 0 ? (
              <p style={{ color: "#6b7280", marginBottom: 0 }}>
                {lang === "tr" ? "Henüz değerlendirme yapmadınız." : "You have no reviews yet."}
              </p>
            ) : (
              <div className="d-flex flex-column" style={{ gap: 10 }}>
                {reviewed.map((row) => {
                  const review = row?.review || {};
                  const productId = row?.productId || review?.productId;
                  const title = row?.title || (lang === "tr" ? "Ürün" : "Product");
                  return (
                    <article
                      key={`${review?.reviewId || "review"}-${productId || "product"}`}
                      className="review-item-card"
                      style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, background: "#fff" }}
                    >
                      <div className="d-flex review-item-main" style={{ gap: 10 }}>
                        <Image
                          src={normalizeMediaUrl(row?.image) || PRODUCT_IMAGE_FALLBACK}
                          alt={title}
                          width={52}
                          height={52}
                          unoptimized
                          onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
                          style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="review-item-title" style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
                          <div className="review-item-meta" style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                            {lang === "tr" ? "Puan" : "Rating"}: {review?.rating || "-"} / 5
                          </div>
                          {!!review?.commentBody && (
                            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#374151" }}>{review.commentBody}</p>
                          )}
                        </div>
                      </div>
                      <div className="d-flex justify-content-end mt-10 review-item-actions" style={{ gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="tp-btn-border"
                          onClick={() => openModal([row], lang === "tr" ? "Değerlendirmeyi Güncelle" : "Update Review")}
                        >
                          {lang === "tr" ? "Güncelle" : "Update"}
                        </button>
                        <button
                          type="button"
                          className="tp-btn-border"
                          disabled={deleting}
                          onClick={() => handleDelete(row)}
                        >
                          {lang === "tr" ? "Sil" : "Delete"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )
          ) : pending.length === 0 ? (
            <p style={{ color: "#6b7280", marginBottom: 0 }}>
              {lang === "tr" ? "Değerlendirilmeyi bekleyen ürün yok." : "No pending products to review."}
            </p>
          ) : (
            <div className="d-flex flex-column" style={{ gap: 10 }}>
              {pending.map((row, index) => {
                const productId = row?.productId || row?._id;
                const title = row?.title || (lang === "tr" ? "Ürün" : "Product");
                return (
                  <article
                    key={`${productId || "pending"}-${row?.orderId || index}`}
                    className="review-item-card review-item-card--pending"
                    style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, background: "#fff" }}
                  >
                    <div className="d-flex align-items-start review-item-main" style={{ gap: 10 }}>
                      <Image
                        src={normalizeMediaUrl(row?.image) || PRODUCT_IMAGE_FALLBACK}
                        alt={title}
                        width={52}
                        height={52}
                        unoptimized
                        onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
                        style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="review-item-title" style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
                        <div className="review-item-meta" style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                          {lang === "tr" ? "Sipariş" : "Order"}: #{String(row?.orderId || "").slice(0, 8)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="review-item-action"
                      onClick={() => openModal([row], lang === "tr" ? "Ürünü Değerlendir" : "Review Product")}
                      style={{
                        width: "100%",
                        minHeight: 42,
                        border: "1px solid #6a9a2a",
                        borderRadius: 8,
                        background: "#6a9a2a",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {lang === "tr" ? "Değerlendir" : "Review"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .review-tabs .review-tab-btn {
          flex: 1 1 calc(50% - 4px);
        }
        .review-item-card .review-item-title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .review-item-card .review-item-meta {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .review-item-card--pending .review-item-action {
          margin-top: 10px;
        }
        @media (max-width: 575px) {
          .review-item-card {
            padding: 10px 9px !important;
          }
          .review-item-card--pending {
            display: flex;
            flex-direction: column;
          }
          .review-item-actions {
            justify-content: stretch !important;
          }
          .review-item-actions .tp-btn-border {
            flex: 1 1 calc(50% - 4px);
            min-height: 40px;
            text-align: center;
          }
        }
        @media (min-width: 768px) {
          .review-tabs .review-tab-btn {
            flex: 0 0 auto;
          }
          .review-item-card--pending .review-item-action {
            width: auto;
            min-width: 132px;
            margin-left: auto;
            margin-top: 8px;
          }
        }
      `}</style>

      <QuickReviewModal
        open={modalState.open}
        onClose={closeModal}
        items={modalState.items}
        title={modalState.title}
        onCompleted={refetchOverview}
      />
    </div>
  );
};

export default MyReviews;
