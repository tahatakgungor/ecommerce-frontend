'use client';
import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
// internal
import {
  useChangePasswordMutation,
  useConfirmChangePasswordMutation,
} from "src/redux/features/auth/authApi";
import ErrorMessage from "@components/error-message/error";
import { notifyError, notifySuccess } from "@utils/toast";
import { useLanguage } from "src/context/LanguageContext";

const schema = Yup.object().shape({
  password: Yup.string().required("Mevcut şifre zorunludur.").min(6, "En az 6 karakter olmalıdır."),
  newPassword: Yup.string().required("Yeni şifre zorunludur.").min(6, "En az 6 karakter olmalıdır."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Şifreler eşleşmiyor.')
    .required("Şifre tekrarı zorunludur."),
  code: Yup.string().nullable(),
});

const ChangePassword = () => {
  const [changePassword, { isLoading: isRequesting }] = useChangePasswordMutation();
  const [confirmChangePassword, { isLoading: isConfirming }] = useConfirmChangePasswordMutation();
  const { t } = useLanguage();
  const [isCodeStep, setIsCodeStep] = React.useState(false);
  const [pendingPayload, setPendingPayload] = React.useState(null);
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

  const requestVerificationCode = async (payload, fromResend = false) => {
    const result = await changePassword(payload);
    if (result?.error) {
      notifyError(result?.error?.data?.message || "Doğrulama kodu gönderilemedi.");
      return false;
    }

    setPendingPayload(payload);
    setIsCodeStep(true);
    setCodeCooldown(90);
    notifySuccess(fromResend ? "Doğrulama kodu tekrar gönderildi." : "Doğrulama kodu e-posta adresinize gönderildi.");
    return true;
  };

  const onSubmit = async (data) => {
    if (!isCodeStep) {
      await requestVerificationCode({
        currentPassword: data.password,
        newPassword: data.newPassword,
      });
      return;
    }

    const code = (data.code || "").trim();
    if (!code) {
      notifyError("Lütfen doğrulama kodunu girin.");
      return;
    }

    const result = await confirmChangePassword({ code });
    if (result?.error) {
      notifyError(result?.error?.data?.message || "Kod doğrulanamadı.");
      return;
    }

    notifySuccess("Şifreniz başarıyla güncellendi.");
    setIsCodeStep(false);
    setPendingPayload(null);
    setCodeCooldown(0);
    reset();
  };

  const handleEditCredentials = () => {
    setIsCodeStep(false);
    setCodeCooldown(0);
  };

  const handleResendCode = async () => {
    if (codeCooldown > 0 || isRequesting || isConfirming) {
      return;
    }

    const values = getValues();
    const payload = {
      currentPassword: values.password || pendingPayload?.currentPassword,
      newPassword: values.newPassword || pendingPayload?.newPassword,
    };

    if (!payload.currentPassword || !payload.newPassword) {
      notifyError("Lütfen önce şifre alanlarını doldurun.");
      setIsCodeStep(false);
      return;
    }

    await requestVerificationCode(payload, true);
  };

  return (
    <div className="profile__password">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-xxl-12">
            <div className="profile__input-box">
              <h4>{t('currentPassword')}</h4>
              <div className="profile__input">
                <input
                  {...register("password")}
                  type="password"
                  placeholder={t('enterPassword')}
                  disabled={isCodeStep}
                  autoComplete="current-password"
                />
                <ErrorMessage message={errors.password?.message} />
              </div>
            </div>
          </div>

          <div className="col-xxl-6 col-md-6">
            <div className="profile__input-box">
              <h4>{t('newPassword')}</h4>
              <div className="profile__input">
                <input
                  {...register("newPassword")}
                  type="password"
                  placeholder={t('newPassword')}
                  disabled={isCodeStep}
                  autoComplete="new-password"
                />
                <ErrorMessage message={errors.newPassword?.message} />
              </div>
            </div>
          </div>

          <div className="col-xxl-6 col-md-6">
            <div className="profile__input-box">
              <h4>{t('confirmPassword')}</h4>
              <div className="profile__input">
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder={t('confirmPasswordPlaceholder')}
                  disabled={isCodeStep}
                  autoComplete="new-password"
                />
                <ErrorMessage message={errors.confirmPassword?.message} />
              </div>
            </div>
          </div>

          {isCodeStep && (
            <div className="col-xxl-12">
              <div className="profile__input-box">
                <h4>Doğrulama Kodu</h4>
                <div className="profile__input">
                  <input
                    {...register("code")}
                    type="text"
                    placeholder="E-posta kodunu girin"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>
                <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={codeCooldown > 0 || isRequesting || isConfirming}
                    className="tp-btn-border"
                    style={{ padding: "6px 12px", height: "auto", lineHeight: 1.2 }}
                  >
                    {codeCooldown > 0 ? `Kodu tekrar gönder (${codeCooldown}s)` : "Kodu Tekrar Gönder"}
                  </button>
                  <button
                    type="button"
                    onClick={handleEditCredentials}
                    className="tp-btn-border"
                    style={{ padding: "6px 12px", height: "auto", lineHeight: 1.2 }}
                  >
                    Bilgileri Değiştir
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="col-xxl-12">
            <div className="profile__btn">
              <button type="submit" className="tp-btn-3" disabled={isRequesting || isConfirming}>
                {isRequesting || isConfirming ? "..." : isCodeStep ? "Şifreyi Güncelle" : "Kodu Gönder"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
