"use client";
import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useGetAllProductsQuery } from "@/redux/product/productApi";
import ErrorMsg from "../../common/error-msg";
import ProductGridItem from "./product-grid-item";
import Pagination from "../../ui/Pagination";
import { Search } from "@/svg";
import Link from "next/link";
import LoadingSpinner from "@/app/components/common/loading-spinner";
import { getApiErrorMessage } from "@/utils/api-error";
import { getAdminRangeLabel } from "@/utils/admin-list-query";

const ProductGridArea = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [statusValue, setStatusValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchValue = useDeferredValue(searchValue.trim());
  const pageSize = 10;

  const { data: products, isError, isLoading, error } = useGetAllProductsQuery({
    page: currentPage,
    size: pageSize,
    q: deferredSearchValue || undefined,
    status: statusValue || undefined,
    sort: "latest",
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchValue, statusValue]);

  const currentItems = products?.data || [];
  const totalProducts = products?.total || 0;
  const pageCount = products?.totalPages || 0;
  const range = useMemo(
    () =>
      getAdminRangeLabel(
        totalProducts,
        products?.page || currentPage,
        products?.size || pageSize,
        currentItems.length,
      ),
    [currentItems.length, currentPage, pageSize, products?.page, products?.size, totalProducts],
  );

  const handleSearchProduct = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusValue(e.target.value);
  };

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected + 1);
  };

  let content = null;

  if (isLoading) {
    content = <LoadingSpinner />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg={getApiErrorMessage(error)} />;
  }

  // Veri boş gelirse gösterilecek hata
  if (
    !isLoading &&
    !isError &&
    totalProducts === 0
  ) {
    content = <ErrorMsg msg="Ürün bulunamadı." />;
  }

  if (!isLoading && !isError && products?.success && totalProducts > 0) {
    content = (
      <>
        <div className="relative mx-4 sm:mx-6 lg:mx-8 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 ">
            {currentItems.map((prd: any) => (
              <ProductGridItem key={prd._id || prd.id} product={prd} />
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-3 mx-4 sm:mx-6 lg:mx-8">
          <p className="mb-0 text-tiny">
            {range.start}–{range.end} / {totalProducts} ürün gösteriliyor
          </p>
          <div className="pagination py-3 flex justify-end items-center">
            <Pagination
              handlePageClick={handlePageClick}
              pageCount={pageCount}
              focusPage={Math.max(0, (products?.page || currentPage) - 1)}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-white rounded-t-md rounded-b-md shadow-xs py-4">
      <div className="admin-control-bar mx-4 sm:mx-6 lg:mx-8">
        <div className="admin-control-bar__group flex-1">
        <div className="admin-control-bar__search">
          <input
            value={searchValue}
            onChange={handleSearchProduct}
            className="input"
            type="text"
            placeholder="Ürün adına göre ara"
          />
          <button className="hover:text-theme">
            <Search />
          </button>
        </div>
          <div className="admin-control-bar__group">
            <span className="admin-control-bar__label">Durum</span>
            <select className="admin-control-bar__select" onChange={handleStatusChange} value={statusValue}>
              <option value="">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>
        <div className="admin-control-bar__group">
          <div className="product-add-btn flex ">
            <Link href="/add-product" className="tp-btn">
              Ürün Ekle
            </Link>
          </div>
        </div>
      </div>
      {content}
    </div>
  );
};

export default ProductGridArea;
