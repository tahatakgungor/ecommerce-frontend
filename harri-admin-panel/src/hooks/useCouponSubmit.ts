import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useAddCouponMutation, useEditCouponMutation } from "@/redux/coupon/couponApi";
import dayjs from "dayjs";

const useCouponSubmit = () => {
  const [logo, setLogo] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  const [selectProductType, setSelectProductType] = useState<string>("");
  const [productScope, setProductScope] = useState<"ALL_PRODUCTS" | "CATEGORY">("CATEGORY");
  const [couponScope, setCouponScope] = useState<string>("USER");
  const [editId, setEditId] = useState<string>("");
  const router = useRouter();

  // add coupon
  const [addCoupon, { }] = useAddCouponMutation();
  // edit coupon
  const [editCoupon, { }] = useEditCouponMutation();
  // react hook form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    control,
  } = useForm();


  useEffect(() => {
    if (!openSidebar) {
      setLogo("")
      setSelectProductType("");
      setProductScope("CATEGORY");
      setCouponScope("USER");
      reset();
    }
  }, [openSidebar, reset])
  // submit handle
  const handleCouponSubmit = async (data: any) => {
    try {
      const coupon_data = {
        logo: logo,
        title: data?.name,
        couponCode: data?.code,
        endTime: dayjs(data.endtime).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        discountPercentage: data?.discountpercentage,
        minimumAmount: data?.minimumamount,
        productScope: productScope,
        productType: productScope === "CATEGORY" ? selectProductType : null,
        scope: couponScope,
        assignedUserEmail: couponScope === "USER" ? data?.assigneduseremail : undefined,
      };

      const res = await addCoupon({ ...coupon_data });
      if ("error" in res) {
        if ("data" in res.error) {
          const errorData = res.error.data as { message?: string };
          if (typeof errorData.message === "string") {
            return notifyError(errorData.message);
          }
        }
      } else {
        notifySuccess("Kupon başarıyla eklendi.");
        setIsSubmitted(true);
        setLogo("")
        setOpenSidebar(false);
        setSelectProductType("");
        reset();
      }
    } catch (error) {
      console.log(error);
      notifyError("Bir şeyler ters gitti.");
    }
  };

   //handle Submit edit Category
   const handleSubmitEditCoupon = async (data: any, id: string, currentCoupon?: any) => {
    try {
      const coupon_data = {
        logo: logo || currentCoupon?.logo,
        title: data?.name,
        couponCode: data?.code,
        endTime: dayjs(data.endtime).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        discountPercentage: data?.discountpercentage,
        minimumAmount: data?.minimumamount,
        productScope: productScope,
        productType: productScope === "CATEGORY"
          ? (selectProductType || currentCoupon?.productType)
          : null,
        scope: couponScope,
        assignedUserEmail: couponScope === "USER"
          ? (data?.assigneduseremail || currentCoupon?.assignedUserEmail)
          : undefined,
      };
      const res = await editCoupon({ id, data: coupon_data });
      if ("error" in res) {
        if ("data" in res.error) {
          const errorData = res.error.data as { message?: string };
          if (typeof errorData.message === "string") {
            return notifyError(errorData.message);
          }
        }
      } else {
        notifySuccess("Kupon başarıyla güncellendi.");
        router.push('/coupon')
        setIsSubmitted(true);
        reset();
      }
    } catch (error) {
      console.log(error);
      notifyError("Bir şeyler ters gitti.");
    }
  };

  return {
    handleCouponSubmit,
    isSubmitted,
    setIsSubmitted,
    logo,
    setLogo,
    register,
    handleSubmit,
    errors,
    openSidebar,
    setOpenSidebar,
    control,
    selectProductType,
    setSelectProductType,
    productScope,
    setProductScope,
    couponScope,
    setCouponScope,
    setValue,
    handleSubmitEditCoupon,
    setEditId,
  };
};

export default useCouponSubmit;
