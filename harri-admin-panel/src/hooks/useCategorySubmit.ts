import { notifySuccess, notifyError } from "@/utils/toast";
import { useAddCategoryMutation, useEditCategoryMutation } from "@/redux/category/categoryApi";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation'

const useCategorySubmit = () => {
  const [categoryImg, setCategoryImg] = useState<string>("");
  const [parent, setParent] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [categoryChildren, setCategoryChildren] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const router = useRouter();
  // add
  const [addCategory,{}] = useAddCategoryMutation();
  // edit
  const [editCategory,{ }] = useEditCategoryMutation();

  // react hook form
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm();

  //handleSubmitCategory
  const handleSubmitCategory = async (data: any) => {
    try {
      const resolvedImage = categoryImg?.trim() || "";
      const category_data = {
        img: resolvedImage,
        image: resolvedImage,
        parent: data?.parent,
        description: data?.description,
        children: categoryChildren,
      };
      if(categoryChildren.length === 0){
        return notifyError('Alt kategori seçimi zorunludur.')
      }
      const res = await addCategory({ ...category_data });
      if ("error" in res) {
        if ("data" in res.error) {
          const errorData = res.error.data as { message?: string };
          if (typeof errorData.message === "string") {
            return notifyError(errorData.message);
          }
        }
      } else {
        notifySuccess("Kategori başarıyla eklendi.");
        setIsSubmitted(true);
        reset();
        setCategoryChildren([]);
        setCategoryImg("");
      }
    } catch (error) {
      console.log(error);
      notifyError("Bir şeyler ters gitti.");
    }
  };
  //handle Submit edit Category
  const handleSubmitEditCategory = async (
    data: any,
    id: string,
    currentImage?: string
  ) => {
    try {
      const resolvedImage = categoryImg?.trim() || currentImage || "";
      const category_data = {
        img: resolvedImage,
        image: resolvedImage,
        parent: data?.parent,
        description: data?.description,
        children: categoryChildren,
      };
      if(categoryChildren.length === 0){
        return notifyError('Alt kategori seçimi zorunludur.')
      }
      const res = await editCategory({ id, data: category_data });
      // console.log(res)
      if ("error" in res) {
        if ("data" in res.error) {
          const errorData = res.error.data as { message?: string };
          if (typeof errorData.message === "string") {
            return notifyError(errorData.message);
          }
        }
      } else {
        notifySuccess("Kategori başarıyla güncellendi.");
        router.push('/category')
        setIsSubmitted(true);
        reset();
      }
    } catch (error) {
      console.log(error);
      notifyError("Bir şeyler ters gitti.");
    }
  };

  return {
    register,
    handleSubmit,
    setValue,
    errors,
    control,
    categoryImg,
    setCategoryImg,
    parent,
    setParent,
    description,
    setDescription,
    categoryChildren,
    setCategoryChildren,
    handleSubmitCategory,
    error,
    isSubmitted,
    handleSubmitEditCategory,
  };
};

export default useCategorySubmit;
