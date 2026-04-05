"use client";
import {
  useAdminChangePasswordMutation,
  useAdminConfirmChangePasswordMutation,
} from "@/redux/auth/authApi";
import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ErrorMsg from "../common/error-msg";
import { notifyError, notifySuccess } from "@/utils/toast";

// schema
const schema = Yup.object().shape({
  password: Yup.string().required().min(6).label("Password"),
  newPassword: Yup.string().required().min(6).label("New Password"),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref("newPassword"), undefined],
    "Passwords must match"
  ),
  code: Yup.string().nullable(),
});

const ProfileChangePass = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [changePassword, { isLoading: isRequesting }] = useAdminChangePasswordMutation();
  const [confirmChangePassword, { isLoading: isConfirming }] = useAdminConfirmChangePasswordMutation();
  const [isCodeStep, setIsCodeStep] = React.useState(false);
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // on submit
  const onSubmit = async (data: { password: string; newPassword: string; code?: string | null }) => {
    if (user) {
      if (!isCodeStep) {
        const res = await changePassword({
          email: user.email,
          oldPass: data.password,
          newPass: data.newPassword,
        });
        if ("error" in res) {
          if ("data" in res.error) {
            const errorData = res.error.data as { message?: string };
            if (typeof errorData.message === "string") {
              return notifyError(errorData.message);
            }
          }
        } else {
          notifySuccess("Doğrulama kodu e-posta adresinize gönderildi.");
          setIsCodeStep(true);
        }
      } else {
        const code = (data.code || "").trim();
        if (!code) {
          return notifyError("Lütfen doğrulama kodunu girin.");
        }
        const res = await confirmChangePassword({ code });
        if ("error" in res) {
          if ("data" in res.error) {
            const errorData = res.error.data as { message?: string };
            if (typeof errorData.message === "string") {
              return notifyError(errorData.message);
            }
          }
        } else {
          notifySuccess("Şifre başarıyla güncellendi.");
          setIsCodeStep(false);
          reset();
        }
      }
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5">
        <p className="mb-0 text-base text-black">Current Password</p>
        <input
          {...register("password", {
            required: `Password is required!`,
          })}
          name="password"
          className="input w-full h-[49px] rounded-md border border-gray6 px-6 text-base text-black"
          type="password"
          placeholder="Current Password"
          disabled={isCodeStep}
        />
        <ErrorMsg msg={errors.password?.message as string} />
      </div>
      <div className="mb-5">
        <p className="mb-0 text-base text-black">New Password</p>
        <input
          {...register("newPassword", {
            required: `New Password is required!`,
          })}
          name="newPassword"
          className="input w-full h-[49px] rounded-md border border-gray6 px-6 text-base text-black"
          type="password"
          placeholder="New Password"
          disabled={isCodeStep}
        />
        <ErrorMsg msg={errors.newPassword?.message as string} />
      </div>
      <div className="mb-5">
        <p className="mb-0 text-base text-black">Confirm Password</p>
        <input
          {...register("confirmPassword")}
          name="confirmPassword"
          className="input w-full h-[49px] rounded-md border border-gray6 px-6 text-base text-black"
          type="password"
          placeholder="Confirm Password"
          disabled={isCodeStep}
        />
        <ErrorMsg msg={errors.confirmPassword?.message as string} />
      </div>
      {isCodeStep && (
        <div className="mb-5">
          <p className="mb-0 text-base text-black">Doğrulama Kodu</p>
          <input
            {...register("code")}
            name="code"
            className="input w-full h-[49px] rounded-md border border-gray6 px-6 text-base text-black"
            type="text"
            placeholder="6 haneli kod"
            maxLength={6}
          />
          <ErrorMsg msg={errors.code?.message as string} />
        </div>
      )}
      <div className="text-end mt-5">
        <button className="tp-btn px-10 py-2" disabled={isRequesting || isConfirming}>
          {isRequesting || isConfirming ? "..." : isCodeStep ? "Kodu Doğrula" : "Kodu Gönder"}
        </button>
      </div>
      {isCodeStep && (
        <div className="text-end mt-3">
          <button
            type="button"
            className="tp-btn px-10 py-2"
            style={{ background: "#efefef", color: "#111" }}
            onClick={() => setIsCodeStep(false)}
          >
            Düzenle
          </button>
        </div>
      )}
    </form>
  );
};

export default ProfileChangePass;
