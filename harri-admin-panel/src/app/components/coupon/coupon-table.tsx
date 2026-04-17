'use client';
import React from "react";
import Image from "next/image";
import dayjs from "dayjs";
// internal
import Loading from "../common/loading";
import ErrorMsg from "../common/error-msg";
import CouponAction from "./coupon-action";
import { useGetAllCouponsQuery } from "@/redux/coupon/couponApi";
import Pagination from "../ui/Pagination";
import usePagination from "@/hooks/use-pagination";
import { getApiErrorMessage } from "@/utils/api-error";

// table head
function TableHead({ title }: { title: string }) {
  return (
    <th
      scope="col"
      className="px-3 py-3 text-tiny text-text2 uppercase font-semibold min-w-[110px] text-end"
    >
      {title}
    </th>
  );
}

// prop type
type IPropType = {
  cls?: string;
  setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  searchValue?: string;
};

const CouponTable = ({cls,setOpenSidebar,searchValue}: IPropType) => {
  const { data: coupons, isError, isLoading, error } = useGetAllCouponsQuery();
  const paginationData = usePagination(coupons || [], 5);
  const { currentItems, handlePageClick, pageCount } = paginationData;
  // decide to render
  let content = null;
  if (isLoading) {
    content = <Loading loading={isLoading} spinner="bar" />;
  }
  if (isError && !coupons) {
    content = <ErrorMsg msg={getApiErrorMessage(error, "Kuponlar yüklenirken bir hata oluştu.")} />;
  }
  if (!isError && coupons) {
    let coupon_items = coupons;
    // search value filtering if search value true
    if (searchValue) {
      coupon_items = coupon_items.filter((c) =>
        c.title.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    content = (
      <>
        <table className="w-full text-base text-left text-gray-500">
          <thead className="bg-white">
            <tr className="border-b border-gray6 text-tiny">
              <th
                scope="col"
                className="pr-8 py-3 text-tiny text-text2 uppercase font-semibold"
              >
                Ad
              </th>
              <TableHead title="Kod" />
              <TableHead title="Oran" />
              <TableHead title="Kapsam" />
              <TableHead title="Durum" />
              <TableHead title="Başlangıç" />
              <TableHead title="Bitiş" />
              <th
                scope="col"
                className="px-9 py-3 text-tiny text-text2 uppercase  font-semibold w-[12%] text-end"
              >
                İşlem
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((coupon) => (
                <tr
                  key={coupon._id}
                  className="bg-white border-b border-gray6 last:border-0 text-start mx-9"
                >
                  <td className="pr-8 py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-5">
                      {coupon?.logo && (
                        <Image
                          className="w-[60px] h-[60px] rounded-md"
                          src={coupon.logo}
                          alt="logo"
                          width={60}
                          height={60}
                        />
                      )}
                      <span className="font-medium text-heading">
                        {coupon.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-black font-normal text-end">
                    <span className="uppercase rounded-md px-3 py-1 bg-gray">
                      {coupon.couponCode}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-normal text-[#55585B] text-end">
                    {coupon.discountPercentage}%
                  </td>
                  <td className="px-3 py-3 font-normal text-[#55585B] text-end">
                    {coupon.scope === "USER"
                      ? (coupon.assignedUserEmail || "Atanmış kullanıcı")
                      : "Genel"}
                  </td>
                  <td className="px-3 py-3 font-normal text-[#55585B] text-end">
                    <span
                      className={`text-[11px] px-3 py-1 rounded-md leading-none font-medium text-end ${
                        dayjs().isAfter(dayjs(coupon.endTime))
                          ? "text-danger bg-danger/10"
                          : "text-success bg-success/10"
                      }`}
                    >
                      {dayjs().isAfter(dayjs(coupon.endTime))
                        ? "Süresi Doldu"
                        : "Aktif"}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-end">
                    {dayjs(coupon.createdAt).format("MMM D, YYYY")}
                  </td>
                  <td className="px-3 py-3 text-end">
                    {dayjs(coupon.endTime).format("MMM D, YYYY")}
                  </td>
                  <td className="px-9 py-3 text-end">
                    <CouponAction
                      id={coupon._id}
                      setOpenSidebar={setOpenSidebar}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

          <div className="flex justify-between items-center flex-wrap mx-8">
            <p className="mb-0 text-tiny">
               1-{currentItems.length} / {coupons?.length} kupon gösteriliyor
            </p>
            <div className="pagination py-3 flex justify-end items-center mx-8">
              <Pagination
                handlePageClick={handlePageClick}
                pageCount={pageCount}
              />
            </div>
        </div>
      </>
    );
  }
  return (
    <div className={`${cls ? cls : "admin-table-shell relative mx-4 sm:mx-8"}`}>
      {content}
    </div>
  );
};

export default CouponTable;
