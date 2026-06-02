"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import ProductTableHead from "./prd-table-head";
import ProductTableItem from "./prd-table-item";
import EditDeleteBtn from "../../button/edit-delete-btn";
import Pagination from "../../ui/Pagination";
import { Search } from "@/svg";
import ErrorMsg from "../../common/error-msg";
import { useGetAllProductsQuery } from "@/redux/product/productApi";
import { useUpdateProductStatusMutation } from "@/redux/product/productApi";
import usePagination from "@/hooks/use-pagination";
import LoadingSpinner from "@/app/components/common/loading-spinner";
import { getApiErrorMessage } from "@/utils/api-error";

const ProductListArea = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectValue, setSelectValue] = useState<string>("");
  const [updateStatus] = useUpdateProductStatusMutation();

  const { data: products, isError, isLoading, error } = useGetAllProductsQuery();

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
    content = <ErrorMsg msg={getApiErrorMessage(error)} />;
  }

  if (
    !isLoading &&
    !isError &&
    (!products?.data || products.data.length === 0)
  ) {
    content = <ErrorMsg msg="Ürün bulunamadı" />;
  }

  if (!isLoading && !isError && products?.success) {
    content = (
      <>
        <div className="grid gap-3 mx-4 sm:mx-6 lg:hidden">
          {currentItems.map((prd: any) => {
            const isActive = prd.status?.toLowerCase() === "active";
            const image = prd.image || prd.img || prd.relatedImages?.[0]?.img || "/assets/img/icons/upload.png";
            return (
              <article key={`mobile-${prd.id || prd._id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <Image
                    src={image}
                    alt={prd.title || "Ürün"}
                    className="h-16 w-16 rounded-md object-cover bg-slate-100"
                    width={64}
                    height={64}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="mb-1 line-clamp-2 text-sm font-semibold text-slate-900">{prd.title}</p>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {isActive ? "Aktif" : "Pasif"}
                      </span>
                    </div>
                    <p className="mb-0 text-xs text-slate-500">SKU: #{prd.sku}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="mb-1 text-slate-500">Stok</p>
                    <p className="mb-0 font-semibold text-slate-900">{prd.quantity}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="mb-1 text-slate-500">Fiyat</p>
                    <p className="mb-0 font-semibold text-slate-900">₺{prd.price}</p>
                    {prd.originalPrice > prd.price && (
                      <p className="mb-0 text-[11px] text-slate-500 line-through">₺{prd.originalPrice}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => updateStatus({ id: prd._id, status: isActive ? "InActive" : "Active" })}
                    className={`rounded-md px-3 py-2 text-xs font-semibold ${
                      isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {isActive ? "Pasife Al" : "Aktif Et"}
                  </button>
                  <div className="flex items-center justify-end">
                    <EditDeleteBtn id={prd._id} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="admin-table-shell relative mx-4 sm:mx-6 lg:mx-8 hidden lg:block">
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
        <div className="flex justify-between items-center flex-wrap gap-3 mx-4 sm:mx-6 lg:mx-8">
          <p className="mb-0 text-tiny">
            {filtered.length === 0 ? 0 : 1}-{currentItems.length} / {filtered.length} ürün gösteriliyor
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

  return (
    <>
      <div className="bg-white rounded-t-md rounded-b-md shadow-xs py-4">
        <div className="tp-search-box flex items-center justify-between px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-wrap gap-3">
          <div className="search-input relative w-full md:w-auto md:min-w-[280px]">
            <input
              onChange={handleSearchProduct}
              className="input h-[44px] w-full md:w-[280px] pl-14"
              type="text"
              placeholder="Ürün adı ile ara"
            />
            <button className="absolute top-1/2 left-5 translate-y-[-50%] hover:text-theme">
              <Search />
            </button>
          </div>
          <div className="flex w-full md:w-auto md:justify-end md:space-x-6 flex-wrap gap-3">
            <div className="search-select mr-0 flex items-center space-x-3 ">
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
