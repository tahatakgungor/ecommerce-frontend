"use client";
import React, { useState } from "react";
import { useGetAllProductsQuery } from "@/redux/product/productApi";
import ErrorMsg from "../../common/error-msg";
import ProductGridItem from "./product-grid-item";
import Pagination from "../../ui/Pagination";
import { Search } from "@/svg";
import Link from "next/link";
import usePagination from "@/hooks/use-pagination";
import LoadingSpinner from "@/app/components/common/loading-spinner";

const ProductGridArea = () => {
  const { data: products, isError, isLoading } = useGetAllProductsQuery();

  // products?.data bir dizi değilse boş dizi gönderiyoruz ki hook patlamasın
  const paginationData = usePagination(products?.data || [], 10);
  const { currentItems, handlePageClick, pageCount } = paginationData;
  const [searchValue, setSearchValue] = useState<string>("");
  // Not: selectValue kullanmıyorsan silebilirsin, şimdilik dursun
  const [selectValue, setSelectValue] = useState<string>("");

  const handleSearchProduct = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  let content = null;

  if (isLoading) {
    content = <LoadingSpinner />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }

  // Veri boş gelirse gösterilecek hata
  if (
    !isLoading &&
    !isError &&
    (!products?.data || products.data.length === 0)
  ) {
    content = <ErrorMsg msg="No Products Found" />;
  }

  if (!isLoading && !isError && products?.success) {
    // currentItems'ın tipini 'any' veya ürün tipinle zorlayarak 'p' hatasını çözüyoruz
    let productItems: any[] = [...currentItems].reverse();

    // Vercel'in hata verdiği yer tam burası:
    if (searchValue) {
      productItems = productItems.filter((p: any) =>
        p.title?.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    content = (
      <>
        <div className="relative mx-4 sm:mx-6 lg:mx-8 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 ">
            {productItems.map((prd: any) => (
              // prd._id kızarıyorsa muhtemelen backend'den id geliyordur.
              // Eğer backend 'id' yolluyorsa prd.id yapmalısın.
              <ProductGridItem key={prd._id || prd.id} product={prd} />
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-3 mx-4 sm:mx-6 lg:mx-8">
          <p className="mb-0 text-tiny">
            Showing {productItems.length} of {products?.data?.length || 0}
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
    <div className="bg-white rounded-t-md rounded-b-md shadow-xs py-4">
      <div className="tp-search-box flex items-center justify-between px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-wrap gap-3">
        <div className="search-input relative w-full md:w-auto md:min-w-[280px]">
          <input
            onChange={handleSearchProduct}
            className="input h-[44px] w-full md:w-[280px] pl-14"
            type="text"
            placeholder="Search by product name"
          />
          <button className="absolute top-1/2 left-5 translate-y-[-50%] hover:text-theme">
            <Search />
          </button>
        </div>
        <div className="flex w-full md:w-auto md:justify-end md:space-x-6 flex-wrap">
          <div className="product-add-btn flex ">
            <Link href="/add-product" className="tp-btn">
              Add Product
            </Link>
          </div>
        </div>
      </div>
      {content}
    </div>
  );
};

export default ProductGridArea;
