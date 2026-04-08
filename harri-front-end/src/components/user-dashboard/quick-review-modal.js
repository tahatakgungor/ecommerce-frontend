'use client';
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  useCreateProductReviewMutation,
  useUpdateProductReviewMutation,
  useUploadReviewMediaMutation,
} from "src/redux/features/productApi";
import { notifyError, notifySuccess } from "@utils/toast";
import { useLanguage } from "src/context/LanguageContext";
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  normalizeMediaUrl,
} from "src/utils/media-url";

const MAX_MEDIA = 5;

const reviewStatusMeta = (status, lang) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "approved") {
    return {
      label: lang === "tr" ? "Onaylandı" : "Approved",
      bg: "#ecfdf3",
      color: "#166534",
      border: "#86efac",
    };
  }
  if (normalized === "rejected") {
    return {
      label: lang === "tr" ? "Reddedildi" : "Rejected",
      bg: "#fef2f2",
      color: "#b91c1c",
      border: "#fca5a5",
    };
  }
  if (normalized === "pending") {
    return {
      label: lang === "tr" ? "Onay Bekliyor" : "Pending Approval",
      bg: "#fff7ed",
      color: "#9a3412",
      border: "#fdba74",
    };
  }
  return null;
};

const normalizeReviewItem = (item) => {
  if (!item || typeof item !== "object") return null;

  const review = item.review || {};
  const productId = item.productId || review.productId || item._id || item.id;
  if (!productId) return null;

  return {
    productId,
    orderId: item.orderId || null,
    title: item.title || item.productTitle || "Ürün",
    image: item.image || item.productImage || PRODUCT_IMAGE_FALLBACK,
    reviewId: review.reviewId || item.reviewId || null,
    rating: review.rating || item.rating || 5,
    commentTitle: review.commentTitle || item.commentTitle || "",
    commentBody: review.commentBody || item.commentBody || "",
    mediaUrls: Array.isArray(review.mediaUrls)
      ? review.mediaUrls
      : Array.isArray(item.mediaUrls)
      ? item.mediaUrls
      : [],
    status: review.status || item.status || "",
  };
};

const QuickReviewModal = ({ open, onClose, items = [], title, onCompleted }) => {
  const { lang } = useLanguage();
  const [forms, setForms] = useState({});
  const [hoverRatings, setHoverRatings] = useState({});
  const [uploadingProductId, setUploadingProductId] = useState(null);
  const [submittingProductId, setSubmittingProductId] = useState(null);

  const [createReview] = useCreateProductReviewMutation();
  const [updateReview] = useUpdateProductReviewMutation();
  const [uploadMedia] = useUploadReviewMediaMutation();

  const normalizedItems = useMemo(
    () => items.map(normalizeReviewItem).filter(Boolean),
    [items]
  );

  useEffect(() => {
    if (!open) return;
    const next = {};
    normalizedItems.forEach((item) => {
      next[item.productId] = {
        ...item,
        mediaUrls: Array.isArray(item.mediaUrls) ? item.mediaUrls : [],
      };
    });
    setForms(next);
  }, [open, normalizedItems]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const updateForm = (productId, patch) => {
    setForms((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        ...patch,
      },
    }));
  };

  const handleUpload = async (productId, fileList) => {
    const files = Array.from(fileList || []);
    const current = forms[productId];
    if (!current || !files.length) return;

    const room = Math.max(0, MAX_MEDIA - (current.mediaUrls?.length || 0));
    const selected = files.slice(0, room);
    if (selected.length < files.length) {
      notifyError(
        lang === "tr"
          ? `En fazla ${MAX_MEDIA} fotoğraf yükleyebilirsiniz.`
          : `You can upload up to ${MAX_MEDIA} photos.`
      );
    }

    if (!selected.length) return;
    setUploadingProductId(productId);
    try {
      const uploaded = [];
      for (const file of selected) {
        const result = await uploadMedia({ productId, file }).unwrap();
        const url = result?.data?.url || result?.url;
        if (url) uploaded.push(url);
      }
      if (uploaded.length) {
        updateForm(productId, {
          mediaUrls: [...(current.mediaUrls || []), ...uploaded].slice(0, MAX_MEDIA),
        });
        notifySuccess(lang === "tr" ? "Fotoğraflar yüklendi." : "Photos uploaded.");
      }
    } catch (error) {
      notifyError(error?.data?.message || (lang === "tr" ? "Fotoğraf yüklenemedi." : "Photo upload failed."));
    } finally {
      setUploadingProductId(null);
    }
  };

  const handleSubmit = async (productId) => {
    const form = forms[productId];
    if (!form) return;
    if (!form.rating || Number(form.rating) < 1 || Number(form.rating) > 5) {
      notifyError(lang === "tr" ? "Puan seçmelisiniz." : "Please select a rating.");
      return;
    }

    const payload = {
      rating: Number(form.rating),
      commentTitle: form.commentTitle?.trim() || null,
      commentBody: form.commentBody?.trim() || null,
      mediaUrls: Array.isArray(form.mediaUrls) ? form.mediaUrls : [],
      orderId: form.orderId || null,
    };

    setSubmittingProductId(productId);
    try {
      if (form.reviewId) {
        await updateReview({
          productId,
          reviewId: form.reviewId,
          data: payload,
        }).unwrap();
        notifySuccess(lang === "tr" ? "Değerlendirme güncellendi." : "Review updated.");
      } else {
        const created = await createReview({
          productId,
          data: payload,
        }).unwrap();
        const reviewId = created?.data?.reviewId || created?.reviewId || null;
        updateForm(productId, { reviewId });
        notifySuccess(lang === "tr" ? "Değerlendirme gönderildi." : "Review submitted.");
      }
      onCompleted?.();
    } catch (error) {
      notifyError(error?.data?.message || (lang === "tr" ? "İşlem başarısız." : "Operation failed."));
    } finally {
      setSubmittingProductId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="quick-review-modal__overlay"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="quick-review-modal__dialog"
      >
        <div className="quick-review-modal__header d-flex align-items-center justify-content-between mb-12">
          <h4 className="quick-review-modal__title">
            {title || (lang === "tr" ? "Ürünleri Değerlendir" : "Review Products")}
          </h4>
          <button type="button" className="tp-btn-border quick-review-modal__close-btn" onClick={onClose}>
            {lang === "tr" ? "Kapat" : "Close"}
          </button>
        </div>

        {normalizedItems.length === 0 && (
          <p className="quick-review-modal__empty-text">
            {lang === "tr" ? "Değerlendirilecek ürün bulunamadı." : "No products to review."}
          </p>
        )}

        <div className="quick-review-modal__list d-flex flex-column">
          {normalizedItems.map((item, itemIndex) => {
            const form = forms[item.productId] || item;
            const isUploading = uploadingProductId === item.productId;
            const isSubmitting = submittingProductId === item.productId;
            const statusMeta = reviewStatusMeta(form.status, lang);
            return (
              <article
                key={`${item.productId}-${item.orderId || "order"}-${itemIndex}`}
                className="quick-review-modal__item"
              >
                <div className="quick-review-modal__item-top d-flex">
                  <Image
                    src={normalizeMediaUrl(item.image) || PRODUCT_IMAGE_FALLBACK}
                    alt={item.title || "product"}
                    width={58}
                    height={58}
                    onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
                    className="quick-review-modal__item-image"
                    unoptimized
                  />
                  <div className="quick-review-modal__item-info">
                    <div className="quick-review-modal__item-title">{item.title}</div>
                    <div className="quick-review-modal__item-status">
                      {form.reviewId ? (
                        <>
                          <span>
                            {lang === "tr" ? "Değerlendirildi (güncelleyebilirsiniz)" : "Reviewed (you can update)"}
                          </span>
                          {statusMeta && (
                            <span
                              style={{
                                marginLeft: 8,
                                display: "inline-flex",
                                alignItems: "center",
                                borderRadius: 999,
                                border: `1px solid ${statusMeta.border}`,
                                background: statusMeta.bg,
                                color: statusMeta.color,
                                padding: "1px 8px",
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              {statusMeta.label}
                            </span>
                          )}
                        </>
                      ) : (
                        <span>{lang === "tr" ? "Henüz değerlendirilmedi" : "Not reviewed yet"}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row quick-review-modal__form-grid">
                  <div className="col-md-3 mb-10">
                    <label className="quick-review-modal__label">
                      {lang === "tr" ? "Puan" : "Rating"}
                    </label>
                    <div
                      role="radiogroup"
                      aria-label={lang === "tr" ? "Yıldız puanı" : "Star rating"}
                      className="quick-review-modal__star-group d-flex align-items-center"
                      onMouseLeave={() =>
                        setHoverRatings((prev) => ({ ...prev, [item.productId]: 0 }))
                      }
                    >
                      {[1, 2, 3, 4, 5].map((score) => {
                        const activeRating = hoverRatings[item.productId] || Number(form.rating || 0);
                        const isFilled = score <= activeRating;
                        return (
                          <button
                            key={score}
                            type="button"
                            role="radio"
                            aria-checked={Number(form.rating || 0) === score}
                            aria-label={`${score} ${lang === "tr" ? "yıldız" : "stars"}`}
                            className={`tp-review-star-btn quick-review-modal__star-btn ${isFilled ? "is-filled" : ""}`}
                            onMouseEnter={() =>
                              setHoverRatings((prev) => ({ ...prev, [item.productId]: score }))
                            }
                            onFocus={() =>
                              setHoverRatings((prev) => ({ ...prev, [item.productId]: score }))
                            }
                            onClick={() => updateForm(item.productId, { rating: score })}
                            disabled={isSubmitting || isUploading}
                          >
                            <i className={isFilled ? "icon_star" : "icon_star_alt"}></i>
                          </button>
                        );
                      })}
                      <span className="quick-review-modal__star-value">
                        {Number(form.rating || 0)}/5
                      </span>
                    </div>
                  </div>
                  <div className="col-md-9 mb-10">
                    <label className="quick-review-modal__label">
                      {lang === "tr" ? "Başlık (opsiyonel)" : "Title (optional)"}
                    </label>
                    <input
                      className="form-control quick-review-modal__control"
                      value={form.commentTitle || ""}
                      maxLength={120}
                      onChange={(e) => updateForm(item.productId, { commentTitle: e.target.value })}
                      disabled={isSubmitting || isUploading}
                    />
                  </div>
                  <div className="col-12 mb-10">
                    <label className="quick-review-modal__label">
                      {lang === "tr" ? "Yorum (opsiyonel)" : "Comment (optional)"}
                    </label>
                    <textarea
                      className="form-control quick-review-modal__control quick-review-modal__textarea"
                      rows={3}
                      maxLength={2000}
                      value={form.commentBody || ""}
                      onChange={(e) => updateForm(item.productId, { commentBody: e.target.value })}
                      disabled={isSubmitting || isUploading}
                    />
                  </div>
                  <div className="col-12">
                    <label className="quick-review-modal__label">
                      {lang === "tr" ? "Fotoğraf (opsiyonel)" : "Photo (optional)"}
                    </label>
                    <input
                      type="file"
                      className="form-control quick-review-modal__control"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleUpload(item.productId, e.target.files)}
                      disabled={isSubmitting || isUploading || (form.mediaUrls?.length || 0) >= MAX_MEDIA}
                    />
                    <small className="quick-review-modal__helper text-muted d-block mt-1">
                      {lang === "tr"
                        ? `En fazla ${MAX_MEDIA} fotoğraf yükleyebilirsiniz.`
                        : `You can upload up to ${MAX_MEDIA} photos.`}
                    </small>
                    {!!form.mediaUrls?.length && (
                      <div className="quick-review-modal__media-list d-flex flex-wrap mt-2">
                        {form.mediaUrls.map((url, index) => (
                          <div key={`${url}-${index}`} className="quick-review-modal__media-item d-inline-flex align-items-center">
                            <a
                              href={normalizeMediaUrl(url)}
                              target="_blank"
                              rel="noreferrer"
                              className="tp-btn-border"
                            >
                              {lang === "tr" ? `Foto ${index + 1}` : `Photo ${index + 1}`}
                            </a>
                            <button
                              type="button"
                              className="tp-btn-border"
                              disabled={isSubmitting || isUploading}
                              onClick={() =>
                                updateForm(item.productId, {
                                  mediaUrls: (form.mediaUrls || []).filter((_, idx) => idx !== index),
                                })
                              }
                            >
                              {lang === "tr" ? "Sil" : "Remove"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="quick-review-modal__footer mt-12 d-flex justify-content-end">
                  <button
                    type="button"
                    className="tp-btn quick-review-modal__submit-btn"
                    onClick={() => handleSubmit(item.productId)}
                    disabled={isSubmitting || isUploading}
                  >
                    {isSubmitting
                      ? (lang === "tr" ? "Kaydediliyor..." : "Saving...")
                      : form.reviewId
                      ? (lang === "tr" ? "Değerlendirmeyi Güncelle" : "Update Review")
                      : (lang === "tr" ? "Değerlendirmeyi Kaydet" : "Save Review")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickReviewModal;
