"use client";
import React from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAdminConfirmForgotPasswordMutation } from "@/redux/auth/authApi";
import ErrorMsg from "@/app/components/common/error-msg";
import { notifyError, notifySuccess } from "@/utils/toast";

// schema
const schema = Yup.object().shape({
  password: Yup.string().required().min(6).label("Şifre"),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref("password"), undefined],
    "Şifreler eşleşmelidir."
  ),
});

const ForgetPasswordPage = ({ params }: { params: { token: string } }) => {
  const token = params.token;
  const [adminConfirmForgotPassword, {}] =
    useAdminConfirmForgotPasswordMutation();
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });
  // onSubmit
  const onSubmit = async (data: { password: string }) => {
    const res = await adminConfirmForgotPassword({
      password: data.password,
      token,
    });
    if ("error" in res) {
      if ("data" in res.error) {
        const errorData = res.error.data as { message?: string };
        if (typeof errorData.message === "string") {
          return notifyError(errorData.message);
        }
      }
    } else {
      if ("data" in res) {
        if("message" in res.data){
          notifySuccess(res.data.message);
        }
      }
      reset();
    }
  };
  return (
    <div className="tp-main-wrapper h-screen">
      <div className="container mx-auto my-auto h-full flex items-center justify-center">
        <div className="pt-[120px] pb-[120px]">
          <div className="grid grid-cols-12 shadow-lg bg-white overflow-hidden rounded-md ">
            <div className="col-span-12 lg:col-span-12 w-full max-w-[500px] mx-auto my-auto pt-[36px] md:pt-[50px] py-[40px] md:py-[60px] px-5 md:px-[60px]">
              <div className="text-center">
                <h4 className="text-[24px] mb-1">Yeni şifre belirleyin</h4>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-5">
                  <p className="mb-0 text-base text-black">
                    Yeni şifre <span className="text-red">*</span>
                  </p>
                  <input
                    {...register("password", {
                      required: `Şifre alanı zorunludur.`,
                    })}
                    name="password"
                    className="input w-full h-[49px] rounded-md border border-gray6 px-6 text-base"
                    type="password"
                    placeholder="Yeni şifrenizi girin"
                  />
                  <ErrorMsg msg={errors.password?.message as string} />
                </div>
                <div className="mb-5">
                  <p className="mb-0 text-base text-black">
                  Yeni şifre tekrar <span className="text-red">*</span>
                  </p>
                  <input
                    {...register("confirmPassword")}
                    name="confirmPassword"
                    className="input w-full h-[49px] rounded-md border border-gray6 px-6 text-base"
                    type="password"
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                  <ErrorMsg msg={errors.confirmPassword?.message as string} />
                </div>
                <button className="tp-btn h-[49px] w-full justify-center">
                  Şifreyi güncelle
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
