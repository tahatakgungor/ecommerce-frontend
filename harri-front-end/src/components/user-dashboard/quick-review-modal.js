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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(7, 12, 18, 0.55)",
        padding: "20px 14px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          maxWidth: 760,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 14,
          padding: 16,
          boxShadow: "0 18px 42px rgba(3,4,28,0.24)",
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-12" style={{ gap: 8 }}>
          <h4 style={{ margin: 0, fontSize: 18 }}>
            {title || (lang === "tr" ? "Ürünleri Değerlendir" : "Review Products")}
          </h4>
          <button type="button" className="tp-btn-border" onClick={onClose}>
            {lang === "tr" ? "Kapat" : "Close"}
          </button>
        </div>

        {normalizedItems.length === 0 && (
          <p style={{ marginBottom: 0, color: "#6b7280" }}>
            {lang === "tr" ? "Değerlendirilecek ürün bulunamadı." : "No products to review."}
          </p>
        )}

        <div className="d-flex flex-column" style={{ gap: 14 }}>
          {normalizedItems.map((item) => {
            const form = forms[item.productId] || item;
            const isUploading = uploadingProductId === item.productId;
            const isSubmitting = submittingProductId === item.productId;
            return (
              <article
                key={`${item.productId}-${item.orderId || "order"}`}
                style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}
              >
                <div className="d-flex" style={{ gap: 10 }}>
                  <Image
                    src={normalizeMediaUrl(item.image) || PRODUCT_IMAGE_FALLBACK}
                    alt={item.title || "product"}
                    width={58}
                    height={58}
                    onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
                    style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                    unoptimized
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      {form.reviewId
                        ? (lang === "tr" ? "Değerlendirildi (güncelleyebilirsiniz)" : "Reviewed (you can update)")
                        : (lang === "tr" ? "Henüz değerlendirilmedi" : "Not reviewed yet")}
                    </div>
                  </div>
                </div>

                <div className="row mt-10">
                  <div className="col-md-3 mb-10">
                    <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                      {lang === "tr" ? "Puan" : "Rating"}
                    </label>
                    <select
                      className="form-control"
                      value={form.rating || 5}
                      onChange={(e) => updateForm(item.productId, { rating: Number(e.target.value) })}
                      disabled={isSubmitting || isUploading}
                    >
                      {[5, 4, 3, 2, 1].map((score) => (
                        <option key={score} value={score}>
                          {score} / 5
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-9 mb-10">
                    <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                      {lang === "tr" ? "Başlık (opsiyonel)" : "Title (optional)"}
                    </label>
                    <input
                      className="form-control"
                      value={form.commentTitle || ""}
                      maxLength={120}
                      onChange={(e) => updateForm(item.productId, { commentTitle: e.target.value })}
                      disabled={isSubmitting || isUploading}
                    />
                  </div>
                  <div className="col-12 mb-10">
                    <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                      {lang === "tr" ? "Yorum (opsiyonel)" : "Comment (optional)"}
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      maxLength={2000}
                      value={form.commentBody || ""}
                      onChange={(e) => updateForm(item.productId, { commentBody: e.target.value })}
                      disabled={isSubmitting || isUploading}
                    />
                  </div>
                  <div className="col-12">
                    <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                      {lang === "tr" ? "Fotoğraf (opsiyonel)" : "Photo (optional)"}
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleUpload(item.productId, e.target.files)}
                      disabled={isSubmitting || isUploading || (form.mediaUrls?.length || 0) >= MAX_MEDIA}
                    />
                    <small className="text-muted d-block mt-1">
                      {lang === "tr"
                        ? `En fazla ${MAX_MEDIA} fotoğraf yükleyebilirsiniz.`
                        : `You can upload up to ${MAX_MEDIA} photos.`}
                    </small>
                    {!!form.mediaUrls?.length && (
                      <div className="d-flex flex-wrap mt-2" style={{ gap: 6 }}>
                        {form.mediaUrls.map((url, index) => (
                          <div key={`${url}-${index}`} className="d-inline-flex align-items-center" style={{ gap: 4 }}>
                            <a
                              href={normalizeMediaUrl(url)}
                              target="_blank"
                              rel="noreferrer"
                              className="tp-btn-border"
                              style={{ fontSize: 11, padding: "2px 8px" }}
                            >
                              {lang === "tr" ? `Foto ${index + 1}` : `Photo ${index + 1}`}
                            </a>
                            <button
                              type="button"
                              className="tp-btn-border"
                              style={{ fontSize: 11, padding: "2px 8px" }}
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

                <div className="mt-12 d-flex justify-content-end">
                  <button
                    type="button"
                    className="tp-btn"
                    onClick={() => handleSubmit(item.productId)}
                    disabled={isSubmitting || isUploading}
                    style={{ minWidth: 140, textAlign: "center" }}
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
