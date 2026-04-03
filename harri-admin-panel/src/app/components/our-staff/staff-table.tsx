"use client";
import React from "react";
import Pagination from "../ui/Pagination";
import ErrorMsg from "../common/error-msg";
import { useGetAllCustomersQuery } from "@/redux/auth/authApi";
import usePagination from "@/hooks/use-pagination";
import LoadingSpinner from "@/app/components/common/loading-spinner";

const CustomerTable = () => {
  const { data: customerData, isError, isLoading } = useGetAllCustomersQuery();

  const paginationData = usePagination(customerData?.data || [], 10);
  const { currentItems, handlePageClick, pageCount } = paginationData;

  let content = null;

  if (isLoading) {
    content = <LoadingSpinner />;
  }

  if (!isLoading && isError) {
    content = <ErrorMsg msg="Müşteri verileri alınırken bir hata oluştu." />;
  }

  if (!isLoading && !isError && customerData?.data) {
    if (customerData.data.length === 0) {
      content = <ErrorMsg msg="Henüz kayıtlı müşteri bulunamadı." />;
    } else {
      content = (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-base text-left text-gray-500">
              <thead>
                <tr className="border-b border-gray6 text-tiny">
                  <th className="pr-8 py-3 text-tiny text-text2 uppercase font-semibold">
                    Müşteri
                  </th>
                  <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold">
                    E-posta
                  </th>
                  <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold">
                    Telefon
                  </th>
                  <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold text-center">
                    E-posta Doğrulama
                  </th>
                  <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold">
                    Şehir
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item: any) => (
                  <tr
                    key={item.id}
                    className="bg-white border-b border-gray6 last:border-0 hover:bg-gray-50"
                  >
                    <td className="pr-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-theme/10 flex items-center justify-center text-theme font-bold">
                          {item.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium text-heading">
                          {item.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-normal text-text2">
                      {item.email}
                    </td>
                    <td className="px-3 py-3 font-normal text-text2">
                      {item.phone || "-"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.emailVerified
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {item.emailVerified ? "Doğrulandı" : "Bekliyor"}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-normal text-text2">
                      {item.city || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center flex-wrap mt-6">
            <p className="mb-0 text-tiny">
              Toplam {customerData.data.length} müşteriden{" "}
              {currentItems.length} tanesi gösteriliyor.
            </p>
            <div className="pagination py-3 flex justify-end items-center">
              <Pagination
                handlePageClick={handlePageClick}
                pageCount={pageCount}
              />
            </div>
          </div>
        </>
      );
    }
  }

  return (
    <div className="relative overflow-hidden bg-white px-8 py-6 rounded-md shadow-sm border border-gray6">
      <h4 className="text-xl font-bold mb-4 text-black">Kayıtlı Müşteriler</h4>
      {content}
    </div>
  );
};

export default CustomerTable;
