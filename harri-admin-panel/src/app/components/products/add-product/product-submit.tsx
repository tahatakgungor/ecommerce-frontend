"use client";
import React from "react";
import useProductSubmit from "@/hooks/useProductSubmit";
import DescriptionTextarea from "./description-textarea";
import ProductTypeBrand from "./product-type-brand";
import ProductVariants from "./product-variants";
import ProductCategory from "../../category/product-category";
import Tags from "./tags";
import FormField from "../form-field";
import Colors from "./colors";

const ProductSubmit = () => {
  const {
    handleSubmit,
    handleSubmitProduct,
    register,
    errors,
    tags,
    setTags,
    control,
    setCategory,
    setParent,
    setChildren,
    setBrand,
    relatedImages,
    setRelatedImages,
    setColors,
    colors,
  } = useProductSubmit();

  return (
    <form onSubmit={handleSubmit(handleSubmitProduct)}>
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* left side */}
        <div className="col-span-12 xl:col-span-8 2xl:col-span-9">
          <div className="mb-6 bg-white admin-card rounded-md">
            <h4 className="text-[22px]">General</h4>
            <FormField
              title="title"
              isRequired={true}
              placeHolder="Product Title"
              register={register}
              errors={errors}
            />
            <DescriptionTextarea register={register} errors={errors} />
          </div>

          <div className="bg-white admin-card rounded-md mb-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6">
              <FormField
                title="price"
                isRequired={true}
                placeHolder="Sale price"
                bottomTitle="Customer sees this as the active sale price."
                type="number"
                register={register}
                errors={errors}
              />
              <FormField
                title="originalPrice"
                isRequired={false}
                placeHolder="Original price"
                bottomTitle="Set a higher original price to show discount."
                type="number"
                register={register}
                errors={errors}
              />
              <FormField
                title="sku"
                isRequired={true}
                placeHolder="SKU"
                bottomTitle="Enter the product SKU."
                register={register}
                errors={errors}
              />
              <FormField
                title="quantity"
                isRequired={true}
                placeHolder="Quantity"
                bottomTitle="Enter the product quantity."
                type="number"
                register={register}
                errors={errors}
              />
            </div>
          </div>

          {/* product type and brands start */}
          <ProductTypeBrand
            register={register}
            errors={errors}
            control={control}
            setSelectBrand={setBrand}
          />
          {/* product type and brands end */}

          {/* product variations start */}
          <ProductVariants
            setImageURLs={setRelatedImages}
            relatedImages={relatedImages}
          />
          {/* product variations end */}
        </div>

        {/* right side */}
        <div className="col-span-12 xl:col-span-4 2xl:col-span-3">
          <div className="bg-white admin-card rounded-md mb-6">
            <p className="mb-5 text-base text-black">Product Category</p>
            {/* category start */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 mb-5">
              <ProductCategory
                setCategory={setCategory}
                setParent={setParent}
                setChildren={setChildren}
              />
            </div>
          </div>

          <div className="bg-white admin-card rounded-md mb-6">
            <p className="mb-5 text-base text-black">Product Tags</p>
            {/* tags start */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 mb-5">
              <Tags tags={tags} setTags={setTags} />
            </div>
          </div>

          <div className="bg-white admin-card rounded-md mb-6">
            <p className="mb-5 text-base text-black">Product Colors</p>
            {/* tags start */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 mb-5">
              <Colors colors={colors} setColors={setColors} />
            </div>
          </div>
        </div>
      </div>
      <button className="tp-btn px-5 py-2 mt-5" type="submit">
        Submit Product
      </button>
    </form>
  );
};

export default ProductSubmit;
