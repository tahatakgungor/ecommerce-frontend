"use client";
import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import ErrorMsg from "../common/error-msg";
import Image from "next/image";
import Pagination from "../ui/Pagination";
import { useGetAdminBrandsQuery } from "@/redux/brand/brandApi";
import BrandEditDelete from "./brand-edit-del";
import LoadingSpinner from "@/app/components/common/loading-spinner";
import { getApiErrorMessage } from "@/utils/api-error";
import { Search } from "@/svg";
import { getAdminRangeLabel } from "@/utils/admin-list-query";

const BrandTables = () => {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchValue = useDeferredValue(searchValue.trim());
  const pageSize = 8;
  const { data: brands, isError, isLoading, error } = useGetAdminBrandsQuery({
    page: currentPage,
    size: pageSize,
    q: deferredSearchValue || undefined,
  });
  const currentItems = useMemo(() => brands?.data?.brands || [], [brands?.data?.brands]);
  const totalBrands = brands?.data?.total || 0;
  const pageCount = brands?.data?.totalPages || 0;
  const range = useMemo(
    () => getAdminRangeLabel(totalBrands, brands?.data?.page || currentPage, brands?.data?.size || pageSize, currentItems.length),
    [brands?.data?.page, brands?.data?.size, currentItems.length, currentPage, pageSize, totalBrands]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchValue]);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected + 1);
  };
  // decide what to render
  let content = null;

  if (isLoading) {
    content = <LoadingSpinner />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg={getApiErrorMessage(error, "Markalar yüklenirken bir hata oluştu.")} />;
  }
  if (!isLoading && !isError && totalBrands === 0) {
    content = <ErrorMsg msg="Marka bulunamadı." />;
  }

  if (!isLoading && !isError && brands?.success && totalBrands > 0) {
    content = (
      <>
        <div className="admin-control-bar mb-4">
          <div className="admin-control-bar__group flex-1">
          <div className="admin-control-bar__search">
            <input
              className="input"
              type="text"
              placeholder="Marka ara"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <button className="hover:text-theme">
              <Search />
            </button>
          </div>
          </div>
        </div>
        <div className="hidden md:block admin-table-shell">
          <div className="w-full">
            <table className="w-full text-base text-left text-gray-500 ">
              <thead>
                <tr className="border-b border-gray6 text-tiny">
                  <th
                    scope="col"
                    className="pr-8 py-3 text-tiny text-text2 uppercase font-semibold"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-tiny text-text2 uppercase font-semibold min-w-[120px]"
                  >
                    Ad
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-tiny text-text2 uppercase font-semibold min-w-[120px] text-end"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-tiny text-text2 uppercase font-semibold min-w-[120px] text-end"
                  >
                    Web Sitesi
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-tiny text-text2 uppercase font-semibold min-w-[120px] text-end"
                  >
                    Konum
                  </th>
                  <th
                    scope="col"
                    className="px-9 py-3 text-tiny text-text2 uppercase  font-semibold w-[12%] text-end"
                  >
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item: any) => {
                    const brandLogo = item.logo || item.image;
                    return (
                    <tr
                      key={item._id}
                      className="bg-white border-b border-gray6 last:border-0 text-start mx-9"
                    >
                      <td className="px-3 py-3 pl-0 font-normal text-[#55585B]">
                        #{item._id.slice(2, 10)}
                      </td>
                      <td className="pr-8 py-5 whitespace-nowrap">
                        <a href="#" className="flex items-center space-x-5">
                          {brandLogo && (
                            <Image
                              className="w-10 h-10 rounded-full object-contain"
                              src={brandLogo}
                              alt="image"
                              width={40}
                              height={40}
                            />
                          )}
                          <span className="font-medium text-heading text-hover-primary transition">
                            {item.name}
                          </span>
                        </a>
                      </td>
                      <td className="px-3 py-3 font-normal text-[#55585B] text-end">
                        {item.email}
                      </td>
                      <td className="px-3 py-3 font-normal text-[#55585B] text-end">
                        {item.website}
                      </td>
                      <td className="px-3 py-3 font-normal text-[#55585B] text-end">
                        {item.location}
                      </td>
                    <td className="px-9 py-3 text-end">
                        <div className="flex items-center justify-end space-x-2">
                          <BrandEditDelete id={item._id}/>
                        </div>
                      </td>
                    </tr>
                  )})}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid gap-3 md:hidden">
          {currentItems.map((item: any) => {
            const brandLogo = item.logo || item.image;
            return (
              <article key={`mobile-${item._id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  {brandLogo ? (
                    <Image
                      className="h-14 w-14 rounded-full object-contain"
                      src={brandLogo}
                      alt={item.name}
                      width={56}
                      height={56}
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 truncate text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="mb-1 truncate text-xs text-slate-500">{item.email || "-"}</p>
                    <p className="mb-1 truncate text-xs text-slate-500">{item.website || "-"}</p>
                    <p className="mb-0 truncate text-xs text-slate-500">{item.location || "-"}</p>
                  </div>
                  <BrandEditDelete id={item._id}/>
                </div>
              </article>
            );
          })}
        </div>
        <div className="flex justify-between items-center flex-wrap">
          <p className="mb-0 text-tiny">
            {range.start}-{range.end} / {totalBrands} marka gösteriliyor
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
  return (
    <div className="relative bg-white px-4 sm:px-8 py-4 rounded-md">
      {content}
    </div>
  );
};

export default BrandTables;
