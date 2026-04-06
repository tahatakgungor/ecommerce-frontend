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

const schema = Yup.object().shape({
  password: Yup.string().required("Mevcut şifre zorunludur.").min(6, "En az 6 karakter olmalıdır."),
  newPassword: Yup.string().required("Yeni şifre zorunludur.").min(6, "En az 6 karakter olmalıdır."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), undefined], "Şifreler eşleşmiyor.")
    .required("Şifre tekrarı zorunludur."),
  code: Yup.string().nullable(),
});

const ProfileChangePass = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [changePassword, { isLoading: isRequesting }] = useAdminChangePasswordMutation();
  const [confirmChangePassword, { isLoading: isConfirming }] = useAdminConfirmChangePasswordMutation();
  const [isCodeStep, setIsCodeStep] = React.useState(false);
  const [pendingPayload, setPendingPayload] = React.useState<{ oldPass: string; newPass: string } | null>(null);
  const [codeCooldown, setCodeCooldown] = React.useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
  });

  React.useEffect(() => {
    if (!isCodeStep || codeCooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCodeCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isCodeStep, codeCooldown]);

  const requestVerificationCode = async (payload: { oldPass: string; newPass: string }, fromResend = false) => {
    if (!user?.email) {
      notifyError("Kullanıcı bilgisi alınamadı.");
      return false;
    }

    const res = await changePassword({
      email: user.email,
      ...payload,
    });

    if ("error" in res) {
      if ("data" in res.error) {
        const errorData = res.error.data as { message?: string };
        if (typeof errorData.message === "string") {
          notifyError(errorData.message);
          return false;
        }
      }
      notifyError("Doğrulama kodu gönderilemedi.");
      return false;
    }

    setPendingPayload(payload);
    setIsCodeStep(true);
    setCodeCooldown(90);
    notifySuccess(fromResend ? "Doğrulama kodu tekrar gönderildi." : "Doğrulama kodu e-posta adresinize gönderildi.");
    return true;
  };

  const onSubmit = async (data: { password: string; newPassword: string; code?: string | null }) => {
    if (!user) {
      notifyError("Kullanıcı bilgisi alınamadı.");
      return;
    }

    if (!isCodeStep) {
      await requestVerificationCode({
        oldPass: data.password,
        newPass: data.newPassword,
      });
      return;
    }

    const code = (data.code || "").trim();
    if (!code) {
      notifyError("Lütfen doğrulama kodunu girin.");
      return;
    }

    const res = await confirmChangePassword({ code });
    if ("error" in res) {
      if ("data" in res.error) {
        const errorData = res.error.data as { message?: string };
        if (typeof errorData.message === "string") {
          notifyError(errorData.message);
          return;
        }
      }
      notifyError("Kod doğrulanamadı.");
      return;
    }

    notifySuccess("Şifre başarıyla güncellendi.");
    setIsCodeStep(false);
    setPendingPayload(null);
    setCodeCooldown(0);
    reset();
  };

  const handleResendCode = async () => {
    if (codeCooldown > 0 || isRequesting || isConfirming) {
      return;
    }

    const values = getValues();
    const payload = {
      oldPass: values.password || pendingPayload?.oldPass || "",
      newPass: values.newPassword || pendingPayload?.newPass || "",
    };

    if (!payload.oldPass || !payload.newPass) {
      notifyError("Lütfen önce şifre alanlarını doldurun.");
      setIsCodeStep(false);
      return;
    }

    await requestVerificationCode(payload, true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5">
        <p className="mb-0 text-base text-black">Mevcut Şifre</p>
        <input
          {...register("password")}
          className="input w-full h-[49px] rounded-md border border-gray6 px-6 text-base text-black"
          type="password"
          placeholder="Mevcut şifreniz"
          disabled={isCodeStep}
          autoComplete="current-password"
        />
        <ErrorMsg msg={errors.password?.message as string} />
      </div>
      <div className="mb-5">
        <p className="mb-0 text-base text-black">Yeni Şifre</p>
        <input
          {...register("newPassword")}
          className="input w-full h-[49px] rounded-md border border-gray6 px-6 text-base text-black"
          type="password"
          placeholder="Yeni şifreniz"
          disabled={isCodeStep}
          autoComplete="new-password"
        />
        <ErrorMsg msg={errors.newPassword?.message as string} />
      </div>
      <div className="mb-5">
        <p className="mb-0 text-base text-black">Yeni Şifre (Tekrar)</p>
        <input
          {...register("confirmPassword")}
          className="input w-full h-[49px] rounded-md border border-gray6 px-6 text-base text-black"
          type="password"
          placeholder="Yeni şifrenizi tekrar girin"
          disabled={isCodeStep}
          autoComplete="new-password"
        />
        <ErrorMsg msg={errors.confirmPassword?.message as string} />
      </div>

      {isCodeStep && (
        <div className="mb-5">
          <p className="mb-0 text-base text-black">Doğrulama Kodu</p>
          <input
            {...register("code")}
            className="input w-full h-[49px] rounded-md border border-gray6 px-6 text-base text-black"
            type="text"
            placeholder="6 haneli kod"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
          <ErrorMsg msg={errors.code?.message as string} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={codeCooldown > 0 || isRequesting || isConfirming}
              className="tp-btn-border px-4 py-2"
            >
              {codeCooldown > 0 ? `Kodu tekrar gönder (${codeCooldown}s)` : "Kodu Tekrar Gönder"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCodeStep(false);
                setCodeCooldown(0);
              }}
              className="tp-btn-border px-4 py-2"
            >
              Bilgileri Değiştir
            </button>
          </div>
        </div>
      )}

      <div className="text-end mt-5">
        <button className="tp-btn w-full sm:w-auto px-8 sm:px-10 py-2" disabled={isRequesting || isConfirming}>
          {isRequesting || isConfirming ? "..." : isCodeStep ? "Şifreyi Güncelle" : "Kodu Gönder"}
        </button>
      </div>
    </form>
  );
};

export default ProfileChangePass;
