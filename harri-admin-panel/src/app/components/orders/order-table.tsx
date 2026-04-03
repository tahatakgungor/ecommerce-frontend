import React, { useState } from "react";
import dayjs from "dayjs";
// internal
import OrderActions from "./order-actions";
import { Search } from "@/svg";
import ErrorMsg from "../common/error-msg";
import Pagination from "../ui/Pagination";
import OrderStatusChange from "./status-change";
import {useGetAllOrdersQuery} from "@/redux/order/orderApi";
import usePagination from "@/hooks/use-pagination";
import LoadingSpinner from "@/app/components/common/loading-spinner";


const OrderTable = () => {
  const { data: orders, isError, isLoading } = useGetAllOrdersQuery();
  const [searchVal,setSearchVal] = useState<string>("");
  const [selectVal,setSelectVal] = useState<string>("");

  // Sort by newest first, then filter — sort is stable regardless of status change
  const sortedOrders = [...(orders?.data?.orders || [])].sort(
    (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
  );
  let filteredOrders = sortedOrders;
  if (searchVal) filteredOrders = filteredOrders.filter(v => v.invoice.toString().includes(searchVal));
  if (selectVal) filteredOrders = filteredOrders.filter(v => v.status.toLowerCase() === selectVal.toLowerCase());

  const paginationData = usePagination(filteredOrders, 5);
  const { currentItems, handlePageClick, pageCount } = paginationData;

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: "Beklemede",
      processing: "İşlemde",
      delivered: "Teslim Edildi",
      cancel: "İptal",
    };
    return map[status] ?? status;
  };

  // decide what to render
  let content = null;

  if (isLoading) {
    content = <LoadingSpinner />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="Bir hata oluştu" />;
  }
  if (!isLoading && !isError && orders?.data?.orders?.length === 0) {
    content = <ErrorMsg msg="Sipariş bulunamadı" />;
  }

  if (!isLoading && !isError && orders?.success) {
    content = (
      <>
        <table className="w-[1500px] 2xl:w-full text-base text-left text-gray-500">
          <thead className="bg-white">
            <tr className="border-b border-gray6 text-tiny">
              <th
                scope="col"
                className="pr-8 py-3 text-tiny text-text2 uppercase font-semibold w-[170px]"
              >
                FATURA NO
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-tiny text-text2 uppercase font-semibold"
              >
                Müşteri
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-tiny text-text2 uppercase font-semibold w-[170px] text-end"
              >
                ADET
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-tiny text-text2 uppercase font-semibold w-[170px] text-end"
              >
                Toplam
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-tiny text-text2 uppercase font-semibold w-[170px] text-end"
              >
                Durum
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-tiny text-text2 uppercase font-semibold w-[170px] text-end"
              >
                Tarih
              </th>
              <th
                scope="col"
                className="px-9 py-3 text-tiny text-text2 uppercase font-semibold text-end"
                style={{ width: 240, minWidth: 240 }}
              >
                İşlem
              </th>
              <th
                scope="col"
                className="px-9 py-3 text-tiny text-text2 uppercase  font-semibold w-[4%] text-end"
              >
                Fatura
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
                <tr
                  key={item._id}
                  className="bg-white border-b border-gray6 last:border-0 text-start mx-9"
                >
                  <td className="px-3 py-3 font-normal text-[#55585B]">
                    #{item.invoice}
                  </td>
                  <td className="pr-8 py-5 whitespace-nowrap">
                    <a
                      href="#"
                      className="flex items-center space-x-5 text-hover-primary text-heading"
                    >
                      <span className="font-medium">{item?.name}</span>
                    </a>
                  </td>

                  <td className="px-3 py-3 font-normal text-[#55585B] text-end">
                    {Array.isArray(item.cart)
                      ? item.cart.reduce((acc: number, curr: any) => acc + (curr.orderQuantity || 0), 0)
                      : 0}
                  </td>
                  <td className="px-3 py-3 font-normal text-[#55585B] text-end">
                    ₺
                    {Array.isArray(item.cart)
                      ? item.cart.reduce((acc: number, curr: any) => acc + (curr.price || 0), 0).toFixed(2)
                      : '0.00'}
                  </td>
                  <td className="px-3 py-3 text-end">
                    <span
                      className={`text-[11px] ${
                        item.status === "pending"
                          ? "text-warning bg-warning/10"
                          : item.status === "delivered"
                          ? "text-success bg-success/10"
                          : item.status === "processing"
                          ? "text-indigo-500 bg-indigo-100"
                          : item.status === "cancel"
                          ? "text-danger bg-danger/10"
                          : ""
                      } px-3 py-1 rounded-md leading-none font-medium text-end`}
                    >
                      {statusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-normal text-[#55585B] text-end">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('tr-TR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    }) : '-'}
                  </td>

                  <td className="px-3 py-3 text-end" style={{ width: 240, minWidth: 240 }}>
                    <div className="flex items-center justify-end">
                      <OrderStatusChange id={item._id}/>
                    </div>
                  </td>
                  {/* order actions */}
                  <OrderActions id={item._id} />
                  {/* order actions */}
                </tr>
              ))}
          </tbody>
        </table>

        {/* pagination start */}
        <div className="flex justify-between items-center flex-wrap">
          <p className="mb-0 text-tiny">
             {currentItems.length === 0 ? 0 : 1}–{currentItems.length} / {filteredOrders.length} sipariş gösteriliyor
          </p>
          <div className="pagination py-3 flex justify-end items-center sm:mx-8">
            <Pagination
              handlePageClick={handlePageClick}
              pageCount={pageCount}
            />
          </div>
        </div>
        {/* pagination end */}
      </>
    );
  }

  // handle change input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
  };
  // handle change input
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectVal(e.target.value);
  };
  return (
    <>
      <div className="tp-search-box flex items-center justify-between px-8 py-8 flex-wrap">
        <div className="search-input relative">
          <input
            className="input h-[44px] w-full pl-14"
            type="text"
            placeholder="Fatura no ile ara"
            onChange={handleSearchChange}
          />
          <button className="absolute top-1/2 left-5 translate-y-[-50%] hover:text-theme">
            <Search />
          </button>
        </div>
        <div className="flex justify-end space-x-6">
          <div className="search-select mr-3 flex items-center space-x-3 ">
            <span className="text-tiny inline-block leading-none -translate-y-[2px]">
              Durum:{" "}
            </span>
            <select onChange={handleSelectChange}>
              <option value="">Tümü</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="pending">Beklemede</option>
              <option value="processing">İşlemde</option>
              <option value="cancel">İptal</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto mx-8">{content}</div>
    </>
  );
};

export default OrderTable;
