"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import { useAddProductMutation, useEditProductMutation } from "@/redux/product/productApi";
import { notifyError, notifySuccess } from "@/utils/toast";
import { IAddProduct } from "@/types/product-type";
import { resolvePrimaryProductImage } from "@/utils/product-gallery";

type IBCType = {
  name: string;
  id: string;
};

const toValidNumber = (value: unknown, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const useProductSubmit = () => {
  const [relatedImages, setRelatedImages] = useState<string[]>([]);
  const [brand, setBrand] = useState<IBCType>({ name: '', id: '' });
  const [category, setCategory] = useState<IBCType>({ name: '', id: '' });
  const [parent, setParent] = useState<string>('');
  const [children, setChildren] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const router = useRouter();


  // useAddProductMutation
  const [addProduct] = useAddProductMutation();
  // useAddProductMutation
  const [editProduct] = useEditProductMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  // resetForm

  // handle submit product
  const handleSubmitProduct = async (data: any) => {
    const primaryImage = resolvePrimaryProductImage(relatedImages);
    const salePrice = toValidNumber(data.price);
    const originalPriceInput = data.originalPrice ?? data.price;
    const originalPrice = toValidNumber(originalPriceInput, salePrice);
    // product data
    const productData: IAddProduct = {
      sku: data.sku,
      title: data.title,
      parent: parent,
      children: children,
      tags: tags,
      image: primaryImage,
      originalPrice,
      price: salePrice,
      relatedImages: relatedImages,
      description: data.description,
      brand: brand,
      category: category,
      unit: data.unit,
      quantity: Number(data.quantity),
      colors: colors,
    };
    if (!primaryImage) {
      return notifyError("En az bir galeri gorseli eklenmeli.");
    }
    if (!category.name) {
      return notifyError("Category is required");
    }
    if (originalPrice < salePrice) {
      return notifyError("Original price must be greater than or equal to sale price");
    } else {
      const res = await addProduct(productData);

      if ("error" in res) {
        if ("data" in res.error) {
          const errorData = res.error.data as { message?: string, errorMessages?: { path: string, message: string }[] };
          if (errorData.errorMessages && Array.isArray(errorData.errorMessages)) {
            const errorMessage = errorData.errorMessages.map(err => err.message).join(", ");
            return notifyError(errorMessage);
          }
          if (typeof errorData.message === "string") {
            return notifyError(errorData.message);
          }
        }
      }
      else {
        notifySuccess("Product created successFully");
        router.push('/product-grid')
      }
    }
  };
  // handle edit product
  const handleEditProduct = async (data: any, id: string) => {
    const primaryImage = resolvePrimaryProductImage(relatedImages);
    const salePrice = toValidNumber(data.price);
    const originalPriceInput = data.originalPrice ?? data.price;
    const originalPrice = toValidNumber(originalPriceInput, salePrice);
    // product data
    const productData: IAddProduct = {
      sku: data.sku,
      title: data.title,
      parent: parent,
      children: children,
      tags: tags,
      image: primaryImage,
      originalPrice,
      price: salePrice,
      relatedImages: relatedImages,
      description: data.description,
      brand: brand,
      category: category,
      unit: data.unit,
      quantity: Number(data.quantity),
      colors: colors,
    };

    if (originalPrice < salePrice) {
      return notifyError("Original price must be greater than or equal to sale price");
    }

    const res = await editProduct({ id: id, data: productData })
    if ("error" in res) {
      if ("data" in res.error) {
        const errorData = res.error.data as { message?: string, errorMessages?: { path: string, message: string }[] };
        if (errorData.errorMessages && Array.isArray(errorData.errorMessages)) {
          const errorMessage = errorData.errorMessages.map(err => err.message).join(", ");
          return notifyError(errorMessage);
        }
        if (typeof errorData.message === "string") {
          return notifyError(errorData.message);
        }
      }
    }
    else {
      notifySuccess("Product edit successFully");
      router.push('/product-grid')
    }
  };

  return {
    parent,
    brand,
    setBrand,
    category,
    setCategory,
    handleSubmitProduct,
    handleEditProduct,
    register,
    handleSubmit,
    errors,
    control,
    setParent,
    setChildren,
    setTags,
    setColors,
    setRelatedImages,
    tags,
    relatedImages,
    colors,
  };
};

export default useProductSubmit;
