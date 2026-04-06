"use client";
import React from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import Pagination from "../ui/Pagination";
import ErrorMsg from "../common/error-msg";
import { useGetAllCustomersQuery, useDeleteCustomerMutation } from "@/redux/auth/authApi";
import usePagination from "@/hooks/use-pagination";
import LoadingSpinner from "@/app/components/common/loading-spinner";
import { notifyError, notifySuccess } from "@/utils/toast";
import { getDisplayName, getNameInitial } from "@/utils/user-name";

const CustomerTable = () => {
  const { data: customerData, isError, isLoading } = useGetAllCustomersQuery();
  const [deleteCustomer] = useDeleteCustomerMutation();
  const { user } = useSelector((state: any) => state.auth);
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const paginationData = usePagination(customerData?.data || [], 10);
  const { currentItems, handlePageClick, pageCount } = paginationData;

  const handleDelete = (customerId: string) => {
    Swal.fire({
      title: "Emin misiniz?",
      text: "Bu müşteriyi kalıcı olarak silmek istediğinize emin misiniz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil!",
      cancelButtonText: "Vazgeç",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res: any = await deleteCustomer(customerId).unwrap();
          Swal.fire("Silindi!", res.message || "Müşteri başarıyla silindi.", "success");
        } catch (error: any) {
          notifyError(error?.data?.message || "Silme işlemi başarısız oldu.");
        }
      }
    });
  };

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
          <div className="admin-table-shell">
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
                  {isAdmin && (
                    <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold text-right">
                      Sil
                    </th>
                  )}
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
                          {getNameInitial(item, "?")}
                        </div>
                        <span className="font-medium text-heading">
                          {getDisplayName(item)}
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
                    {isAdmin && (
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-9 h-9 leading-[33px] text-tiny rounded-md bg-white border border-gray text-slate-600 hover:bg-danger hover:border-danger hover:text-white transition-colors"
                          title="Sil"
                        >
                          <i className="fa fa-trash text-xs" />
                        </button>
                      </td>
                    )}
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
