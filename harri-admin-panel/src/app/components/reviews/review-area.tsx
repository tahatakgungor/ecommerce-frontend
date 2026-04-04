"use client";

import React, { useMemo, useState } from "react";
import { notifyError, notifySuccess } from "@/utils/toast";
import {
  useDeleteAdminReviewMutation,
  useGetAdminReviewsQuery,
  useUpdateAdminReviewStatusMutation,
} from "@/redux/review/reviewApi";
import { getReviewPageTitle, type ReviewStatus } from "@/utils/review-status";

const STATUS_OPTIONS: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const REVIEW_MEDIA_FALLBACK = "/assets/img/product/prodcut-1.jpg";

const normalizeMediaUrl = (url?: string): string => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/")) {
    return API_BASE_URL ? `${API_BASE_URL}${trimmed}` : trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname?.toLowerCase();
    if ((host === "localhost" || host === "127.0.0.1") && API_BASE_URL) {
      return `${API_BASE_URL}${parsed.pathname}${parsed.search || ""}${parsed.hash || ""}`;
    }
    return trimmed;
  } catch {
    return API_BASE_URL ? `${API_BASE_URL}/${trimmed.replace(/^\/+/, "")}` : trimmed;
  }
};

const ReviewArea = () => {
  const [status, setStatus] = useState<ReviewStatus>("PENDING");
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useGetAdminReviewsQuery({
    status,
    page,
    size: 20,
  });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateAdminReviewStatusMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteAdminReviewMutation();

  const reviews = data?.reviews || [];
  const totalPages = data?.totalPages || 0;

  const pageTitle = useMemo(() => {
    return getReviewPageTitle(status);
  }, [status]);

  const handleModerate = async (reviewId: string, nextStatus: "APPROVED" | "REJECTED") => {
    try {
      await updateStatus({ reviewId, status: nextStatus }).unwrap();
      notifySuccess(nextStatus === "APPROVED" ? "Yorum onaylandı." : "Yorum reddedildi.");
      setStatus(nextStatus);
      setPage(0);
    } catch (error: any) {
      notifyError(error?.data?.message || "Yorum durumu güncellenemedi.");
    }
  };

  const handleDelete = async (reviewId: string) => {
    const confirmed = window.confirm("Bu yorumu kalıcı olarak silmek istiyor musunuz?");
    if (!confirmed) return;
    try {
      await deleteReview({ reviewId }).unwrap();
      notifySuccess("Yorum silindi.");
    } catch (error: any) {
      notifyError(error?.data?.message || "Yorum silinemedi.");
    }
  };

  return (
    <div className="bg-white rounded-md shadow-xs p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h4 className="text-[20px] font-semibold text-heading">{pageTitle}</h4>
        <div className="flex items-center gap-2">
          {STATUS_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setStatus(item);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-md border text-sm ${
                status === item
                  ? "bg-theme text-white border-theme"
                  : "bg-white text-heading border-gray"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2">Tarih</th>
              <th className="text-left py-3 px-2">Kullanıcı</th>
              <th className="text-left py-3 px-2">Puan</th>
              <th className="text-left py-3 px-2">Yorum</th>
              <th className="text-left py-3 px-2">Durum</th>
              <th className="text-left py-3 px-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {(isLoading || isFetching) && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray6">
                  Yorumlar yükleniyor...
                </td>
              </tr>
            )}

            {!isLoading && !isFetching && reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray6">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isFetching &&
              reviews.map((review) => (
                <tr key={review.reviewId} className="border-b align-top">
                  <td className="py-3 px-2 whitespace-nowrap">
                    {new Date(review.createdAt).toLocaleString("tr-TR")}
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">{review.userName}</td>
                  <td className="py-3 px-2 whitespace-nowrap">{review.rating}/5</td>
                  <td className="py-3 px-2 min-w-[320px]">
                    {review.commentTitle ? (
                      <p className="font-medium text-heading mb-1">{review.commentTitle}</p>
                    ) : null}
                    <p className="text-gray6 mb-1">{review.commentBody}</p>
                    {Array.isArray(review.mediaUrls) && review.mediaUrls.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {review.mediaUrls.map((mediaUrl, index) => {
                          const normalized = normalizeMediaUrl(mediaUrl);
                          return (
                            <a
                              key={`${review.reviewId}-${index}`}
                              href={normalized}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex"
                              title={`Medya ${index + 1}`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={normalized}
                                alt={`review-media-${index + 1}`}
                                onError={(event) => {
                                  const img = event.currentTarget;
                                  if (img.src.endsWith(REVIEW_MEDIA_FALLBACK)) return;
                                  img.src = REVIEW_MEDIA_FALLBACK;
                                }}
                                style={{
                                  width: 56,
                                  height: 56,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  border: "1px solid #e5e7eb",
                                  background: "#fff",
                                }}
                                loading="lazy"
                              />
                            </a>
                          );
                        })}
                      </div>
                    ) : null}
                    {review.verifiedPurchase ? (
                      <span className="inline-block text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                        Doğrulanmış Alıcı
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {review.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        disabled={isUpdating || isDeleting || review.status === "APPROVED"}
                        onClick={() => handleModerate(review.reviewId, "APPROVED")}
                        className="px-3 py-1.5 rounded-md border border-green-600 text-green-700 disabled:opacity-60"
                      >
                        Onayla
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating || isDeleting || review.status === "REJECTED"}
                        onClick={() => handleModerate(review.reviewId, "REJECTED")}
                        className="px-3 py-1.5 rounded-md border border-red-600 text-red-700 disabled:opacity-60"
                      >
                        Reddet
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating || isDeleting}
                        onClick={() => handleDelete(review.reviewId)}
                        className="px-3 py-1.5 rounded-md border border-slate-400 text-slate-700 disabled:opacity-60"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            type="button"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3 py-1.5 rounded-md border border-gray text-heading disabled:opacity-60"
          >
            Önceki
          </button>
          <span className="text-sm text-gray6">
            Sayfa {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-md border border-gray text-heading disabled:opacity-60"
          >
            Sonraki
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ReviewArea;
