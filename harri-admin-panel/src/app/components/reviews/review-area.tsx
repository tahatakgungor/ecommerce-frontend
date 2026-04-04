"use client";

import React, { useMemo, useState } from "react";
import { notifyError, notifySuccess } from "@/utils/toast";
import {
  useGetAdminReviewsQuery,
  useUpdateAdminReviewStatusMutation,
} from "@/redux/review/reviewApi";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

const STATUS_OPTIONS: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED"];

const ReviewArea = () => {
  const [status, setStatus] = useState<ReviewStatus>("PENDING");
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useGetAdminReviewsQuery({
    status,
    page,
    size: 20,
  });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateAdminReviewStatusMutation();

  const reviews = data?.reviews || [];
  const totalPages = data?.totalPages || 0;

  const pageTitle = useMemo(() => {
    if (status === "APPROVED") return "Onaylanan Yorumlar";
    if (status === "REJECTED") return "Reddedilen Yorumlar";
    return "Bekleyen Yorumlar";
  }, [status]);

  const handleModerate = async (reviewId: string, nextStatus: "APPROVED" | "REJECTED") => {
    try {
      await updateStatus({ reviewId, status: nextStatus }).unwrap();
      notifySuccess(nextStatus === "APPROVED" ? "Yorum onaylandı." : "Yorum reddedildi.");
    } catch (error: any) {
      notifyError(error?.data?.message || "Yorum durumu güncellenemedi.");
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
                        disabled={isUpdating || review.status === "APPROVED"}
                        onClick={() => handleModerate(review.reviewId, "APPROVED")}
                        className="px-3 py-1.5 rounded-md border border-green-600 text-green-700 disabled:opacity-60"
                      >
                        Onayla
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating || review.status === "REJECTED"}
                        onClick={() => handleModerate(review.reviewId, "REJECTED")}
                        className="px-3 py-1.5 rounded-md border border-red-600 text-red-700 disabled:opacity-60"
                      >
                        Reddet
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
