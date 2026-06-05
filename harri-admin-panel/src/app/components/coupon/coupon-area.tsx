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
            <div className="admin-control-bar mx-4 sm:mx-8">
              <div className="admin-control-bar__group flex-1">
              <div className="admin-control-bar__search">
                <input
                  className="input"
                  type="text"
                  placeholder="Kupon adına göre ara"
                  onChange={handleSearchValue}
                />
                <button className="hover:text-theme">
                  <Search />
                </button>
              </div>
              <div className="admin-control-bar__group">
                <span className="admin-control-bar__label">Kapsam</span>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                className="admin-control-bar__select"
                aria-label="Kupon kapsamına göre filtrele"
              >
                <option value="ALL">Tum kapsamlar</option>
                <option value="PUBLIC">Genel</option>
                <option value="USER">Kullaniciya ozel</option>
              </select>
              </div>
              </div>
              <div className="admin-control-bar__group">
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
