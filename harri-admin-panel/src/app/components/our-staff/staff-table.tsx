"use client";
import React from "react";
import Image from "next/image";
import Pagination from "../ui/Pagination";
import ErrorMsg from "../common/error-msg";
import { useGetAllStaffQuery } from "@/redux/auth/authApi";
import StaffAction from "./staff-action";
import usePagination from "@/hooks/use-pagination";

const StaffTables = () => {
  // 1. Veriyi çekiyoruz
  const { data: staffData, isError, isLoading } = useGetAllStaffQuery();

  // 2. Pagination için staffData?.data (List<User>) kısmını kullanıyoruz
  const paginationData = usePagination(staffData?.data || [], 5);
  const { currentItems, handlePageClick, pageCount } = paginationData;

  let content = null;

  if (isLoading) {
    content = (
      <div className="py-10 text-center">
        <h2>Yükleniyor...</h2>
      </div>
    );
  }

  if (!isLoading && isError) {
    content = <ErrorMsg msg="Personel verileri alınırken bir hata oluştu." />;
  }

  // Java tarafındaki ApiResponse yapısını kontrol ediyoruz (success: true ve data listesi)
  if (!isLoading && !isError && staffData?.data) {
    if (staffData.data.length === 0) {
      content = <ErrorMsg msg="Henüz kayıtlı personel bulunamadı." />;
    } else {
      content = (
        <>
          <div className="overflow-x-auto">
            <div className="w-full">
              <table className="w-full text-base text-left text-gray-500">
                <thead>
                  <tr className="border-b border-gray6 text-tiny">
                    <th
                      scope="col"
                      className="pr-8 py-3 text-tiny text-text2 uppercase font-semibold"
                    >
                      Personel Adı
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-tiny text-text2 uppercase font-semibold"
                    >
                      E-posta
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-tiny text-text2 uppercase font-semibold text-center"
                    >
                      Rol
                    </th>
                    <th
                      scope="col"
                      className="px-9 py-3 text-tiny text-text2 uppercase font-semibold text-end"
                    >
                      İşlemler
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
                          {/* Varsayılan bir profil ikonu veya varsa item.image */}
                          <div className="w-10 h-10 rounded-full bg-theme/10 flex items-center justify-center text-theme font-bold">
                            {item.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-heading">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-normal text-text2">
                        {item.email}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.role === "ADMIN"
                              ? "bg-danger/10 text-danger"
                              : "bg-success/10 text-success"
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>
                      <td className="px-9 py-3 text-end">
                        <div className="flex items-center justify-end">
                          {/* Java UUID id'sini gönderiyoruz */}
                          <StaffAction id={item.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center flex-wrap mt-6">
            <p className="mb-0 text-tiny">
              Toplam {staffData.data.length} personelden {currentItems.length}{" "}
              tanesi gösteriliyor.
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
      <h4 className="text-xl font-bold mb-4 text-black">Mevcut Personeller</h4>
      {content}
    </div>
  );
};

export default StaffTables;
