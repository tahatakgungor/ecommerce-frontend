"use client";
import React, { useEffect, useMemo } from "react";
import CouponTable from "./coupon-table";
import useCouponSubmit from "@/hooks/useCouponSubmit";
import { useGetCouponQuery } from "@/redux/coupon/couponApi";
import Loading from "../common/loading";
import ErrorMsg from "../common/error-msg";
import GlobalImgUpload from "../category/global-img-upload";
import CouponFormField from "../brand/form-field-two";
import ProductType from "../products/add-product/product-type";
import { useGetAllCategoriesQuery } from "@/redux/category/categoryApi";

const CouponEditArea = ({ id }: { id: string }) => {
  const {
    errors,
    handleSubmit,
    isSubmitted,
    logo,
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
    setValue,
    handleSubmitEditCoupon,
  } = useCouponSubmit();
  const { data: categories } = useGetAllCategoriesQuery();
  const categoryItems = useMemo(
    () => categories?.data || categories?.result || [],
    [categories]
  );
  // get specific product
  const { data: coupon, isError, isLoading } = useGetCouponQuery(id);
  useEffect(() => {
    if (!coupon) {
      return;
    }
    setSelectProductType(coupon.productType || "");
    setProductScope(coupon.productScope || "CATEGORY");
    setCouponScope(coupon.scope || "PUBLIC");
    setValue("assigneduseremail", coupon.assignedUserEmail || "");
  }, [coupon, setCouponScope, setProductScope, setSelectProductType, setValue]);
  // decide to render
  let content = null;
  if (isLoading) {
    content = <Loading loading={isLoading} spinner="fade" />;
  }
  if (!coupon && isError) {
    content = <ErrorMsg msg="Kupon bilgileri yüklenirken bir hata oluştu." />;
  }
  if (coupon && !isError) {
    content = (
      <>
        <div className="col-span-12 lg:col-span-4">
          <form onSubmit={handleSubmit((data) => handleSubmitEditCoupon(data,id,coupon))}>
            <div className="mb-6 bg-white admin-card rounded-md">
              {/* coupon image upload */}
              <div className="bg-white">
                <GlobalImgUpload
                  isSubmitted={isSubmitted}
                  setImage={setLogo}
                  image={logo}
                  setIsSubmitted={setIsSubmitted}
                  default_img={coupon.logo}
                />
              </div>
              {/* coupon image upload */}
              <CouponFormField
                register={register}
                errors={errors}
                name="Name"
                isReq={true}
                default_val={coupon.title}
                labelText="Kupon adı"
                placeholderText="Kupon adını girin"
              />
              <CouponFormField
                register={register}
                errors={errors}
                name="Code"
                isReq={true}
                default_val={coupon.couponCode}
                labelText="Kupon kodu"
                placeholderText="Kupon kodunu girin"
              />
              <div className="mb-5">
                <p className="mb-0 text-base text-black">Ürün kapsamı</p>
                <select
                  className="input w-full h-[44px] rounded-md border border-gray6 px-4"
                  value={productScope}
                  onChange={(e) => setProductScope(e.target.value as "ALL_PRODUCTS" | "CATEGORY")}
                >
                  <option value="CATEGORY">Sadece seçili kategori</option>
                  <option value="ALL_PRODUCTS">Tüm ürünler</option>
                </select>
              </div>
              {productScope !== "CATEGORY" && (
                <p className="mb-5 mt-2 text-sm text-gray-500">Tüm ürünler seçildi. Kategori seçimi opsiyoneldir.</p>
              )}
              <div className="mb-5">
                <p className="mb-0 text-base text-black">Kupon tipi</p>
                <select
                  className="input w-full h-[44px] rounded-md border border-gray6 px-4"
                  value={couponScope}
                  onChange={(e) => setCouponScope(e.target.value)}
                >
                  <option value="USER">Belirli müşteri</option>
                  <option value="PUBLIC">Genel kampanya</option>
                </select>
              </div>
              {couponScope === "USER" && (
                <CouponFormField
                  register={register}
                  errors={errors}
                  name="assignedUserEmail"
                  isReq={true}
                  default_val={coupon.assignedUserEmail || ""}
                  labelText="Müşteri e-postası"
                  placeholderText="Müşteri e-posta adresini girin"
                />
              )}
              <CouponFormField
                register={register}
                errors={errors}
                name="endTime"
                isReq={true}
                type="date"
                default_val={coupon.endTime}
                labelText="Bitiş tarihi"
              />
              <CouponFormField
                register={register}
                errors={errors}
                name="discountPercentage"
                isReq={true}
                default_val={coupon.discountPercentage}
                labelText="İndirim yüzdesi"
                placeholderText="Örn. 10"
              />
              <CouponFormField
                register={register}
                errors={errors}
                name="minimumAmount"
                isReq={true}
                default_val={coupon.minimumAmount}
                labelText="Minimum sepet tutarı"
                placeholderText="Örn. 500"
              />

              {productScope === "CATEGORY" && categoryItems.length > 0 && (
                <div className="mb-5">
                  <p className="mb-2 text-base text-black">Kategori</p>
                  <ProductType
                    setSelectProductType={setSelectProductType}
                    control={control}
                    errors={errors}
                    default_value={coupon.productType || ""}
                    options={categoryItems.map((item) => ({
                      value: item.parent,
                      label: item.parent,
                    }))}
                  />
                </div>
              )}

              <button className="tp-btn px-7 py-2">Kuponu güncelle</button>
            </div>
          </form>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        {content}
        <div className="col-span-12 lg:col-span-8">
          {/* brand table start */}
          <div className="relative bg-white px-4 sm:px-8 py-4 rounded-md">
            <div className="admin-table-shell">
              <CouponTable cls="w-full" setOpenSidebar={setOpenSidebar} />
            </div>
          </div>
          {/* brand table end */}
        </div>
      </div>
    </>
  );
};

export default CouponEditArea;
