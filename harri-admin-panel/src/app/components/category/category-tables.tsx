"use client"
import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Pagination from '../ui/Pagination';
import ErrorMsg from '../common/error-msg';
import CategoryEditDelete from './edit-delete-category';
import { useGetAdminCategoriesQuery } from '@/redux/category/categoryApi';
import LoadingSpinner from "@/app/components/common/loading-spinner";
import { getApiErrorMessage } from "@/utils/api-error";
import { Search } from '@/svg';
import { getAdminRangeLabel } from '@/utils/admin-list-query';

const CategoryTables = () => {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchValue = useDeferredValue(searchValue.trim());
  const pageSize = 8;
  const { data: categories, isError, isLoading, error } = useGetAdminCategoriesQuery({
    page: currentPage,
    size: pageSize,
    q: deferredSearchValue || undefined,
  });
  const currentItems = useMemo(() => categories?.data?.categories || [], [categories?.data?.categories]);
  const totalCategories = categories?.data?.total || 0;
  const pageCount = categories?.data?.totalPages || 0;
  const range = useMemo(
    () => getAdminRangeLabel(totalCategories, categories?.data?.page || currentPage, categories?.data?.size || pageSize, currentItems.length),
    [categories?.data?.page, categories?.data?.size, currentItems.length, currentPage, pageSize, totalCategories]
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
    content = <ErrorMsg msg={getApiErrorMessage(error, "Kategoriler yüklenirken bir hata oluştu.")} />;
  }
  if (!isLoading && !isError && totalCategories === 0) {
    content = <ErrorMsg msg="Kategori bulunamadı." />;
  }

  if (!isLoading && !isError && categories?.success && totalCategories > 0) {
    content = (
      <>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-[320px]">
            <input
              className="input h-[44px] w-full pl-14"
              type="text"
              placeholder="Kategori ara"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <button className="absolute left-5 top-1/2 -translate-y-1/2 hover:text-theme">
              <Search />
            </button>
          </div>
        </div>
        <div className="hidden md:block admin-table-shell">
          <div className="w-full">
            <table className="w-full text-base text-left text-gray-500 ">

              <thead>
                <tr className="border-b border-gray6 text-tiny">
                  <th scope="col" className="pr-8 py-3 text-tiny text-text2 uppercase font-semibold">
                    ID
                  </th>
                  <th scope="col" className="px-3 py-3 text-tiny text-text2 uppercase font-semibold min-w-[120px]">
                    Ad
                  </th>
                  <th scope="col" className="px-3 py-3 text-tiny text-text2 uppercase font-semibold min-w-[90px] text-end">
                    Ürün
                  </th>
                  <th scope="col" className="px-9 py-3 text-tiny text-text2 uppercase  font-semibold w-[12%] text-end">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item: any) => {
                  const categoryImage = item.img || item.image;
                  return (
                  <tr key={item._id} className="bg-white border-b border-gray6 last:border-0 text-start mx-9">
                    <td className="px-3 py-3 pl-0 font-normal text-[#55585B]">
                      #{item._id.slice(2, 10)}
                    </td>
                    <td className="pr-8 py-5 whitespace-nowrap">
                      <a href="#" className="flex items-center space-x-5">
                        {categoryImage && <Image className="w-10 h-10 rounded-full shrink-0 object-cover" src={categoryImage} alt="image" width={40} height={40} />}
                        <span className="font-medium text-heading text-hover-primary transition">{item.parent}</span>
                      </a>
                    </td>
                    <td className="px-3 py-3 font-normal text-[#55585B] text-end">
                      {item.products?.length}
                    </td>
                    <td className="px-9 py-3 text-end">
                      <div className="flex items-center justify-end space-x-2">
                        <CategoryEditDelete id={item._id} />
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
            const categoryImage = item.img || item.image;
            return (
              <article key={`mobile-${item._id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  {categoryImage ? (
                    <Image className="h-14 w-14 rounded-full object-cover" src={categoryImage} alt={item.parent} width={56} height={56} />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 truncate text-sm font-semibold text-slate-900">{item.parent}</p>
                    <p className="mb-1 text-xs text-slate-500">
                      Alt kategoriler: {Array.isArray(item.children) && item.children.length > 0 ? item.children.join(", ") : "-"}
                    </p>
                    <p className="mb-0 text-xs text-slate-500">Ürün: {item.products?.length || 0}</p>
                  </div>
                  <CategoryEditDelete id={item._id} />
                </div>
              </article>
            );
          })}
        </div>
        <div className="flex justify-between items-center flex-wrap">
          <p className="mb-0 text-tiny">
            {range.start}-{range.end} / {totalCategories} kategori gösteriliyor
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
    )
  }
  return (
    <div className="relative bg-white px-4 sm:px-8 py-4 rounded-md">
      {content}
    </div>
  );
};

export default CategoryTables;
