"use client";
import Link from "next/link";
import React, { useState } from "react";
import ProductTableHead from "./prd-table-head";
import ProductTableItem from "./prd-table-item";
import Pagination from "../../ui/Pagination";
import { Search } from "@/svg";
import ErrorMsg from "../../common/error-msg";
import { useGetAllProductsQuery } from "@/redux/product/productApi";
import usePagination from "@/hooks/use-pagination";
import LoadingSpinner from "@/app/components/common/loading-spinner";

const ProductListArea = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectValue, setSelectValue] = useState<string>("");

  const { data: products, isError, isLoading } = useGetAllProductsQuery();

  // Sabit sıralama: ID'ye göre (DB ekleme sırası). reverse() yerine sort.
  const allProducts: any[] = [...(products?.data || [])].sort((a: any, b: any) => {
    const idA = a._id || a.id || "";
    const idB = b._id || b.id || "";
    return idA > idB ? -1 : idA < idB ? 1 : 0; // en yeni en üstte
  });

  // Filtreleme — pagination'dan ÖNCE uygula
  let filtered = allProducts;
  if (searchValue) {
    filtered = filtered.filter((p: any) =>
      p.title?.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }
  if (selectValue) {
    filtered = filtered.filter(
      (p: any) => p.status?.toLowerCase() === selectValue.toLowerCase()
    );
  }

  const paginationData = usePagination(filtered, 8);
  const { currentItems, handlePageClick, pageCount } = paginationData;

  // search field
  const handleSearchProduct = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // handle select input
  const handleSelectField = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(e.target.value);
  };

  // decide what to render
  let content = null;

  if (isLoading) {
    content = <LoadingSpinner />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }

  if (
    !isLoading &&
    !isError &&
    (!products?.data || products.data.length === 0)
  ) {
    content = <ErrorMsg msg="No Products Found" />;
  }

  if (!isLoading && !isError && products?.success) {
    content = (
      <>
        <div className="relative overflow-x-auto mx-8">
          <table className="w-full text-base text-left text-gray-500">
            <ProductTableHead />
            <tbody>
              {currentItems.map((prd: any) => (
                <ProductTableItem key={prd.id || prd._id} product={prd} />
              ))}
            </tbody>
          </table>
        </div>

        {/* bottom  */}
        <div className="flex justify-between items-center flex-wrap mx-8">
          <p className="mb-0 text-tiny">
            {currentItems.length} / {filtered.length} ürün gösteriliyor
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
    <>
      <div className="bg-white rounded-t-md rounded-b-md shadow-xs py-4">
        <div className="tp-search-box flex items-center justify-between px-8 py-8 flex-wrap">
          <div className="search-input relative">
            <input
              onChange={handleSearchProduct}
              className="input h-[44px] w-full pl-14"
              type="text"
              placeholder="Ürün adı ile ara"
            />
            <button className="absolute top-1/2 left-5 translate-y-[-50%] hover:text-theme">
              <Search />
            </button>
          </div>
          <div className="flex justify-end space-x-6 flex-wrap">
            <div className="search-select mr-3 flex items-center space-x-3 ">
              <span className="text-tiny inline-block leading-none -translate-y-[2px]">
                Durum:{" "}
              </span>
              <select onChange={handleSelectField} value={selectValue}>
                <option value="">Tümü</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
            <div className="product-add-btn flex ">
              <Link href="/add-product" className="tp-btn">
                Ürün Ekle
              </Link>
            </div>
          </div>
        </div>
        {content}
      </div>
    </>
  );
};

export default ProductListArea;
