"use client"
import React from 'react';
import Image from 'next/image';
import Pagination from '../ui/Pagination';
import ErrorMsg from '../common/error-msg';
import CategoryEditDelete from './edit-delete-category';
import { useGetAllCategoriesQuery } from '@/redux/category/categoryApi';
import usePagination from '@/hooks/use-pagination';
import LoadingSpinner from "@/app/components/common/loading-spinner";
import { getApiErrorMessage } from "@/utils/api-error";

const CategoryTables = () => {
  const { data: categories, isError, isLoading, error } = useGetAllCategoriesQuery();
  const paginationData = usePagination(categories?.result || [], 5);
  const { currentItems, handlePageClick, pageCount } = paginationData;
  // decide what to render
  let content = null;

  if (isLoading) {
    content = <LoadingSpinner />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg={getApiErrorMessage(error, "Kategoriler yüklenirken bir hata oluştu.")} />;
  }
  if (!isLoading && !isError && categories?.result.length === 0) {
    content = <ErrorMsg msg="Kategori bulunamadı." />;
  }

  if (!isLoading && !isError && categories?.success) {
    const categoryItems = [...categories.result].reverse();
    content = (
      <>
        <div className="admin-table-shell">
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
                {currentItems.map(item => {
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
        <div className="flex justify-between items-center flex-wrap">
          <p className="mb-0 text-tiny">
            1-{currentItems.length} / {categories?.result.length} kategori gösteriliyor
          </p>
          <div className="pagination py-3 flex justify-end items-center">
            <Pagination
              handlePageClick={handlePageClick}
              pageCount={pageCount}
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
