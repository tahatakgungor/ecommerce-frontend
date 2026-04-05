'use client';
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useLanguage } from "src/context/LanguageContext";
import {
  useDeleteOwnProductReviewMutation,
} from "src/redux/features/productApi";
import { notifyError, notifySuccess } from "@utils/toast";
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  normalizeMediaUrl,
} from "src/utils/media-url";
import QuickReviewModal from "./quick-review-modal";

const MyReviews = ({ reviewOverview, isLoading, refetchOverview }) => {
  const { lang } = useLanguage();
  const [deleteOwnReview, { isLoading: deleting }] = useDeleteOwnProductReviewMutation();
  const [modalState, setModalState] = useState({ open: false, items: [], title: "" });

  const reviewed = useMemo(() => reviewOverview?.reviewed || [], [reviewOverview]);
  const pending = useMemo(() => reviewOverview?.pending || [], [reviewOverview]);

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
      <div className="d-flex flex-column" style={{ gap: 16 }}>
        <section>
          <div className="d-flex align-items-center justify-content-between mb-10">
            <h4 style={{ margin: 0, fontSize: 18 }}>
              {lang === "tr" ? "Değerlendirdiklerim" : "Reviewed"}
            </h4>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{reviewed.length}</span>
          </div>

          {reviewed.length === 0 && (
            <p style={{ color: "#6b7280", marginBottom: 0 }}>
              {lang === "tr" ? "Henüz değerlendirme yapmadınız." : "You have no reviews yet."}
            </p>
          )}

          <div className="d-flex flex-column" style={{ gap: 10 }}>
            {reviewed.map((row) => {
              const review = row?.review || {};
              const productId = row?.productId || review?.productId;
              const title = row?.title || (lang === "tr" ? "Ürün" : "Product");
              return (
                <article
                  key={`${review?.reviewId || "review"}-${productId || "product"}`}
                  style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, background: "#fff" }}
                >
                  <div className="d-flex" style={{ gap: 10 }}>
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
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                        {lang === "tr" ? "Puan" : "Rating"}: {review?.rating || "-"} / 5
                      </div>
                      {!!review?.commentBody && (
                        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#374151" }}>{review.commentBody}</p>
                      )}
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-10" style={{ gap: 8 }}>
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
        </section>

        <section>
          <div className="d-flex align-items-center justify-content-between mb-10">
            <h4 style={{ margin: 0, fontSize: 18 }}>
              {lang === "tr" ? "Değerlendirmediklerim" : "Pending Reviews"}
            </h4>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{pending.length}</span>
          </div>

          {pending.length === 0 && (
            <p style={{ color: "#6b7280", marginBottom: 0 }}>
              {lang === "tr" ? "Değerlendirilmeyi bekleyen ürün yok." : "No pending products to review."}
            </p>
          )}

          <div className="d-flex flex-column" style={{ gap: 10 }}>
            {pending.map((row, index) => {
              const productId = row?.productId || row?._id;
              const title = row?.title || (lang === "tr" ? "Ürün" : "Product");
              return (
                <article
                  key={`${productId || "pending"}-${row?.orderId || index}`}
                  style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, background: "#fff" }}
                >
                  <div className="d-flex" style={{ gap: 10 }}>
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
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                        {lang === "tr" ? "Sipariş" : "Order"}: #{String(row?.orderId || "").slice(0, 8)}
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="tp-btn"
                        onClick={() =>
                          openModal([row], lang === "tr" ? "Ürünü Değerlendir" : "Review Product")
                        }
                      >
                        {lang === "tr" ? "Değerlendir" : "Review"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

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
