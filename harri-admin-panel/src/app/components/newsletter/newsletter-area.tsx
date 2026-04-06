"use client";

import React, { useState } from "react";
import { notifyError, notifySuccess } from "@/utils/toast";
import {
  useDeleteNewsletterSubscriberMutation,
  useGetNewsletterSubscribersQuery,
} from "@/redux/newsletter/newsletterApi";

const NewsletterArea = () => {
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching } = useGetNewsletterSubscribersQuery({
    page,
    size: 20,
  });
  const [deleteSubscriber, { isLoading: isDeleting }] = useDeleteNewsletterSubscriberMutation();

  const subscribers = data?.subscribers || [];
  const totalPages = data?.totalPages || 0;

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Bu aboneyi silmek istiyor musunuz?");
    if (!confirmed) return;

    try {
      await deleteSubscriber({ id }).unwrap();
      notifySuccess("Abone silindi.");
    } catch (error: any) {
      notifyError(error?.data?.message || "Abone silinemedi.");
    }
  };

  return (
    <div className="bg-white rounded-md shadow-xs p-5">
      <div className="mb-5">
        <h4 className="text-[20px] font-semibold text-heading">Newsletter Aboneleri</h4>
        <p className="text-gray6 text-sm mt-1">
          Footer abonelik formundan gelen e-posta listesi.
        </p>
      </div>

      <div className="admin-table-shell">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2">ID</th>
              <th className="text-left py-3 px-2">E-posta</th>
              <th className="text-left py-3 px-2">Abonelik Tarihi</th>
              <th className="text-left py-3 px-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {(isLoading || isFetching) && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray6">
                  Aboneler yükleniyor...
                </td>
              </tr>
            )}

            {!isLoading && !isFetching && subscribers.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray6">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isFetching &&
              subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b align-top">
                  <td className="py-3 px-2 whitespace-nowrap">{subscriber.id}</td>
                  <td className="py-3 px-2">{subscriber.email}</td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    {subscriber.subscribedAt
                      ? new Date(subscriber.subscribedAt).toLocaleString("tr-TR")
                      : "-"}
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDelete(subscriber.id)}
                      className="px-3 py-1.5 rounded-md border border-red-600 text-red-700 disabled:opacity-60"
                    >
                      Sil
                    </button>
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

export default NewsletterArea;
