"use client";
import React, { useState } from "react";
import { Search } from "@/svg";
import CouponTable from "./coupon-table";
import CouponOffcanvas from "./coupon-offcanvas";
import useCouponSubmit from "@/hooks/useCouponSubmit";

const CouponArea = () => {
  const {
    handleCouponSubmit,
    errors,
    handleSubmit,
    isSubmitted,
    logo,
    openSidebar,
    register,
    setIsSubmitted,
    setLogo,
    setOpenSidebar,
    control,
    setSelectProductType,
    productScope,
    setProductScope,
    couponScope,
    setCouponScope,
  } = useCouponSubmit();
  const [searchValue,setSearchValue] = useState<string>("");
  const [scopeFilter, setScopeFilter] = useState<string>("ALL");
  // handle search value
  const handleSearchValue = (e:React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }
  return (
    <>
      <div className="bg-white rounded-t-md rounded-b-md shadow-xs py-4">
        <div className="admin-table-shell">
          <div className="w-full">
            <div className="tp-search-box flex items-center justify-between px-4 sm:px-8 py-6 sm:py-8 gap-3 flex-wrap">
              <div className="search-input relative w-full sm:w-auto">
                <input
                  className="input h-[44px] w-full sm:w-[280px] pl-14"
                  type="text"
                  placeholder="Kupon adına göre ara"
                  onChange={handleSearchValue}
                />
                <button className="absolute top-1/2 left-5 translate-y-[-50%] hover:text-theme">
                  <Search />
                </button>
              </div>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                className="input h-[44px] w-full sm:w-[180px]"
                aria-label="Kupon kapsamına göre filtrele"
              >
                <option value="ALL">Tum kapsamlar</option>
                <option value="PUBLIC">Genel</option>
                <option value="USER">Kullaniciya ozel</option>
              </select>
              <div className="flex justify-end space-x-0 sm:space-x-6 w-full sm:w-auto">
                <div className="product-add-btn flex ">
                  <button
                    onClick={() => setOpenSidebar(true)}
                    type="button"
                    className="tp-btn offcanvas-open-btn"
                  >
                    Kupon ekle
                  </button>
                </div>
              </div>
            </div>
            <CouponTable
              setOpenSidebar={setOpenSidebar}
              searchValue={searchValue}
              scopeFilter={scopeFilter}
            />
          </div>
        </div>
      </div>

      {/* coupon offcanvas start */}
      <CouponOffcanvas
        propsItems={{
          openSidebar,
          setOpenSidebar,
          setLogo,
          logo,
          handleCouponSubmit,
          handleSubmit,
          register,
          errors,
          isSubmitted,
          setIsSubmitted,
          control,
          setSelectProductType,
          productScope,
          setProductScope,
          couponScope,
          setCouponScope,
        }}
      />
      {/* coupon offcanvas end */}
    </>
  );
};

export default CouponArea;
