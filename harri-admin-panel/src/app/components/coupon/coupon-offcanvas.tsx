import React from "react";
import { CloseTwo } from "@/svg";
import GlobalImgUpload from "../category/global-img-upload";
import {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import CouponFormField from "../brand/form-field-two";
import ProductType from "../products/add-product/product-type";
import { useGetAllCategoriesQuery } from "@/redux/category/categoryApi";
import ErrorMsg from "../common/error-msg";
import LoadingSpinner from "@/app/components/common/loading-spinner";

// prop type
type IPropType = {
  propsItems: {
    openSidebar: boolean;
    setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectProductType: React.Dispatch<React.SetStateAction<string>>;
    setProductScope: React.Dispatch<React.SetStateAction<"ALL_PRODUCTS" | "CATEGORY">>;
    setCouponScope: React.Dispatch<React.SetStateAction<string>>;
    setLogo: React.Dispatch<React.SetStateAction<string>>;
    handleCouponSubmit: (data: any) => void;
    isSubmitted: boolean;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    logo: string;
    handleSubmit: UseFormHandleSubmit<any, undefined>;
    control: Control;
    couponScope: string;
    productScope: "ALL_PRODUCTS" | "CATEGORY";
  };
};

const CouponOffcanvas = ({ propsItems }: IPropType) => {
  const {
    openSidebar,
    setOpenSidebar,
    isSubmitted,
    setIsSubmitted,
    setLogo,
    setCouponScope,
    setProductScope,
    errors,
    handleCouponSubmit,
    handleSubmit,
    logo,
    register,
    control,
    setSelectProductType,
    couponScope,
    productScope,
  } = propsItems;

  const { data: categories, isLoading, isError } = useGetAllCategoriesQuery();
  let content = null;
  if (isLoading) {
    content = <LoadingSpinner />;
  }
  if (isError) {
    content = <ErrorMsg msg="Failed to load product type" />;
  }
  if (!isError && !isLoading && categories) {
    const categoryItems = categories.data || categories.result || [];
    content = (
      <ProductType
        setSelectProductType={setSelectProductType}
        control={control}
        errors={errors}
        options={categoryItems.map((item) => {
          return { value: item.parent, label: item.parent };
        })}
      />
    );
  }
  return (
    <>
      <div
        className={`offcanvas-area fixed top-0 right-0 h-full bg-white w-[92vw] max-w-[420px] z-[999] overflow-y-auto overscroll-y-contain scrollbar-hide shadow-md translate-x-[calc(100%+80px)] transition duration-300 ${
          openSidebar ? "offcanvas-opened pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="flex flex-col justify-between h-full">
          {/* main wrap */}
          <form onSubmit={handleSubmit((data) => handleCouponSubmit(data))}>
            <div className="flex items-center space-x-3 py-3 px-4 sm:px-8 shadow-md sticky top-0 left-0 right-0 w-full z-[99] bg-white">
              <button
                type="button"
                onClick={() => setOpenSidebar(false)}
                className="text-black offcanvas-close-btn"
              >
                <CloseTwo />
              </button>
              <p className="mb-0 text-[15px] font-medium text-[#82808a]">
                Enter Coupon Details
              </p>
            </div>
            {/* <!-- main content --> */}
            <div className="px-4 sm:px-8 pt-6">
              <div className="">
                {/* coupon image upload */}
                <div className="bg-white">
                  <GlobalImgUpload
                    isSubmitted={isSubmitted}
                    setImage={setLogo}
                    image={logo}
                    setIsSubmitted={setIsSubmitted}
                  />
                </div>
                {/* coupon image upload */}
                <CouponFormField
                  register={register}
                  errors={errors}
                  name="Name"
                  isReq={true}
                />
                <div className="mb-5">
                  <p className="mb-0 text-base text-black">Product Scope</p>
                  <select
                    className="input w-full h-[44px] rounded-md border border-gray6 px-4"
                    value={productScope}
                    onChange={(e) => setProductScope(e.target.value as "ALL_PRODUCTS" | "CATEGORY")}
                  >
                    <option value="CATEGORY">Category Only</option>
                    <option value="ALL_PRODUCTS">All Products</option>
                  </select>
                </div>
                {/* Product Type */}
                <div className="mb-6">
                  <p className="mb-0 text-base text-black">Product Type</p>
                  <div className="category-add-select select-bordered">
                    {productScope === "CATEGORY" ? content : (
                      <p className="text-sm text-gray-500 mt-2">All products selected, category is optional.</p>
                    )}
                  </div>
                </div>
                {/* Product Type */}
                <CouponFormField
                  register={register}
                  errors={errors}
                  name="Code"
                  isReq={true}
                />
                <div className="mb-5">
                  <p className="mb-0 text-base text-black">Coupon Audience</p>
                  <select
                    className="input w-full h-[44px] rounded-md border border-gray6 px-4"
                    defaultValue="USER"
                    onChange={(e) => setCouponScope(e.target.value)}
                  >
                    <option value="USER">Assigned customer</option>
                    <option value="PUBLIC">Public campaign</option>
                  </select>
                </div>
                {couponScope === "USER" && (
                  <CouponFormField
                    register={register}
                    errors={errors}
                    name="assignedUserEmail"
                    isReq={true}
                  />
                )}
                <CouponFormField
                  register={register}
                  errors={errors}
                  name="endTime"
                  isReq={true}
                  type="date"
                />
                <CouponFormField
                  register={register}
                  errors={errors}
                  name="discountPercentage"
                  isReq={true}
                />
                <CouponFormField
                  register={register}
                  errors={errors}
                  name="minimumAmount"
                  isReq={true}
                />
              </div>
            </div>
            <div className="sm:flex items-center sm:space-x-3 py-4 sm:py-6 px-4 sm:px-8 sticky bottom-0 left-0 right-0 w-full z-[99] bg-white shadow-_md mt-8 flex-wrap sm:flex-nowrap">
              <button
                type="submit"
                className="tp-btn w-full sm:w-1/2 items-center justify-around mb-2 sm:mb-0"
              >
                Add Coupon
              </button>
              <button
                type="button"
                onClick={() => setOpenSidebar(false)}
                className="tp-btn w-full sm:w-1/2 items-center justify-around border border-gray6 bg-white text-black hover:text-white hover:border-danger hover:bg-danger"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <div
        onClick={() => setOpenSidebar(false)}
        className={`body-overlay fixed bg-black top-0 left-0 w-full h-full z-[60] invisible opacity-0 transition-all duration-300 ${openSidebar ? "opened pointer-events-auto" : "pointer-events-none"}`}
      ></div>
    </>
  );
};

export default CouponOffcanvas;
