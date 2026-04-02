"use client";
import React, { useEffect } from "react";
import useProductSubmit from "@/hooks/useProductSubmit";
import ErrorMsg from "../../common/error-msg";
import FormField from "../form-field";
import DescriptionTextarea from "../add-product/description-textarea";
import { useGetProductQuery } from "@/redux/product/productApi";
import ProductTypeBrand from "../add-product/product-type-brand";
import ProductVariants from "../add-product/product-variants";
import ProductImgUpload from "../add-product/product-img-upload";
import Tags from "../add-product/tags";
import Colors from "../add-product/colors";
import ProductCategory from "../../category/product-category";
import Loading from "../../common/loading";

const EditProductSubmit = ({ id }: { id: string }) => {
  const { data: product, isError, isLoading } = useGetProductQuery(id);

  const {
    handleSubmit,
    register,
    errors,
    tags,
    setTags,
    control,
    setCategory,
    setParent,
    setChildren,
    setImg,
    img,
    setBrand,
    isSubmitted,
    relatedImages,
    setRelatedImages,
    handleEditProduct,
    colors,
    setColors,
  } = useProductSubmit();

  // --- Veri Geldiğinde State'leri Güncelle ---
  useEffect(() => {
    if (product) {
      if (product.image) setImg(product.image);

      // HATALI OLAN: setBrand(product.brand.name); // Bu sadece string gönderir

      // DOĞRU OLAN: Obje olarak gönder
      if (product.brand) {
        setBrand({
          name: product.brand.name || "",
          id: product.brand.id || "", // Eğer id gerekiyorsa
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (isLoading) {
    return (
      <div className="p-10 text-center">
        <Loading loading={isLoading} />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <ErrorMsg msg="Ürün yüklenirken hata oluştu veya ürün bulunamadı!" />
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => handleEditProduct(data, id))}>
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 xl:col-span-8 2xl:col-span-9">
          <div className="mb-6 bg-white px-8 py-8 rounded-md">
            <h4 className="text-[22px] mb-4">Ürün Düzenle</h4>
            <FormField
              title="title"
              isRequired={true}
              placeHolder="Ürün Başlığı"
              register={register}
              errors={errors}
              defaultValue={product.title}
            />
            <DescriptionTextarea
              register={register}
              errors={errors}
              defaultValue={product.description}
            />
          </div>

          <div className="bg-white px-8 py-8 rounded-md mb-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6">
              <FormField
                title="price"
                isRequired={true}
                type="number"
                placeHolder="Fiyat"
                defaultValue={product.price}
                register={register}
                errors={errors}
              />
              <FormField
                title="sku"
                isRequired={true}
                placeHolder="SKU Kodu"
                defaultValue={product.sku}
                register={register}
                errors={errors}
              />
              <FormField
                title="quantity"
                isRequired={true}
                type="number"
                placeHolder="Stok Adedi"
                defaultValue={product.quantity}
                register={register}
                errors={errors}
              />
            </div>
          </div>

          <ProductTypeBrand
            register={register}
            errors={errors}
            control={control}
            setSelectBrand={setBrand}
            default_value={{
              brand: product?.brand?.name || "",
              unit: product?.unit || "pc",
            }}
          />

          <ProductVariants
            isSubmitted={isSubmitted}
            setImageURLs={setRelatedImages}
            relatedImages={relatedImages}
            default_value={product.relatedImages || []}
          />
        </div>

        <div className="col-span-12 xl:col-span-4 2xl:col-span-3">
          <ProductImgUpload
            imgUrl={img}
            setImgUrl={setImg}
            default_img={product.image}
            isSubmitted={isSubmitted}
          />

          <div className="bg-white px-8 py-8 rounded-md mb-6">
            <p className="mb-5 text-base text-black">Kategori</p>
            <div className="grid grid-cols-1 gap-3 mb-5">
              <ProductCategory
                setCategory={setCategory}
                setParent={setParent}
                setChildren={setChildren}
                default_value={{
                  parent: product?.category?.name || "",
                  id: product?.category?.id || "",
                  children: product?.children || "",
                }}
              />
              <Tags
                tags={tags}
                setTags={setTags}
                default_value={product.tags || []}
              />
              <Colors
                colors={colors}
                setColors={setColors}
                default_value={product.colors}
              />
            </div>
          </div>
        </div>
      </div>
      <button className="tp-btn px-10 py-2 mt-5" type="submit">
        Güncelle
      </button>
    </form>
  );
};

export default EditProductSubmit;
