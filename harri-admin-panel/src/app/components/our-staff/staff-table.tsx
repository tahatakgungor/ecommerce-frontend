"use client";
import React from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import Pagination from "../ui/Pagination";
import ErrorMsg from "../common/error-msg";
import { useGetAllCustomersQuery, useDeleteCustomerMutation } from "@/redux/auth/authApi";
import LoadingSpinner from "@/app/components/common/loading-spinner";
import { notifyError } from "@/utils/toast";
import { getDisplayName, getNameInitial } from "@/utils/user-name";
import { Search } from "@/svg";
import { getAdminRangeLabel } from "@/utils/admin-list-query";

const CustomerTable = () => {
  const [searchValue, setSearchValue] = React.useState("");
  const [verificationFilter, setVerificationFilter] = React.useState("ALL");
  const [currentPage, setCurrentPage] = React.useState(1);
  const deferredSearchValue = React.useDeferredValue(searchValue.trim());
  const pageSize = 8;
  const { data: customerData, isError, isLoading } = useGetAllCustomersQuery({
    page: currentPage,
    size: pageSize,
    q: deferredSearchValue || undefined,
    verification: verificationFilter !== "ALL" ? verificationFilter : undefined,
  });
  const [deleteCustomer] = useDeleteCustomerMutation();
  const { user } = useSelector((state: any) => state.auth);
  const isAdmin = user?.role?.toLowerCase() === "admin";

  React.useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchValue, verificationFilter]);

  const currentItems = React.useMemo(
    () => customerData?.data?.customers || [],
    [customerData?.data?.customers]
  );
  const totalCustomers = customerData?.data?.total || 0;
  const pageCount = customerData?.data?.totalPages || 0;
  const range = React.useMemo(
    () => getAdminRangeLabel(totalCustomers, customerData?.data?.page || currentPage, customerData?.data?.size || pageSize, currentItems.length),
    [currentItems.length, currentPage, customerData?.data?.page, customerData?.data?.size, pageSize, totalCustomers]
  );

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected + 1);
  };

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
    if (totalCustomers === 0) {
      content = <ErrorMsg msg="Henüz kayıtlı müşteri bulunamadı." />;
    } else {
      content = (
        <>
          <div className="hidden md:block admin-table-shell">
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

          <div className="grid gap-3 md:hidden">
            {currentItems.map((item: any) => (
              <article key={`mobile-${item.id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-theme/10 text-sm font-bold text-theme">
                      {getNameInitial(item, "?")}
                    </div>
                    <div className="min-w-0">
                      <p className="mb-1 truncate text-sm font-semibold text-slate-900">{getDisplayName(item)}</p>
                      <p className="mb-0 truncate text-xs text-slate-500">{item.email}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      item.emailVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.emailVerified ? "Doğrulandı" : "Bekliyor"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="mb-1 text-slate-500">Telefon</p>
                    <p className="mb-0 font-medium text-slate-900">{item.phone || "-"}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="mb-1 text-slate-500">Şehir</p>
                    <p className="mb-0 font-medium text-slate-900">{item.city || "-"}</p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                    >
                      Müşteriyi Sil
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="flex justify-between items-center flex-wrap mt-6">
            <p className="mb-0 text-tiny">
              {range.start}-{range.end} / {totalCustomers} müşteri gösteriliyor.
            </p>
            <div className="pagination py-3 flex justify-end items-center">
              <Pagination
                handlePageClick={handlePageClick}
                pageCount={pageCount}
                focusPage={Math.max(0, currentPage - 1)}
              />
            </div>
          </div>
        </>
      );
    }
  }

  return (
    <div className="relative overflow-hidden bg-white px-8 py-6 rounded-md shadow-sm border border-gray6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="mb-0 text-xl font-bold text-black">Kayıtlı Müşteriler</h4>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <div className="relative">
            <input
              className="input h-[44px] w-full sm:w-[260px] pl-14"
              type="text"
              placeholder="Müşteri ara"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button className="absolute top-1/2 left-5 -translate-y-1/2 hover:text-theme">
              <Search />
            </button>
          </div>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="input h-[44px] w-full sm:w-[180px]"
            aria-label="E-posta doğrulamasına göre filtrele"
          >
            <option value="ALL">Tüm durumlar</option>
            <option value="verified">Doğrulandı</option>
            <option value="pending">Bekliyor</option>
          </select>
        </div>
      </div>
      {content}
    </div>
  );
};

export default CustomerTable;
