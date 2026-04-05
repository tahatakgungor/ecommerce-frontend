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

  const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    if (!isCodeStep) {
      const result = await changePassword({
        currentPassword: data.password,
        newPassword: data.newPassword,
      });
      if (result?.error) {
        notifyError(result?.error?.data?.message || "Doğrulama kodu gönderilemedi.");
        return;
      }
      setPendingPayload({
        currentPassword: data.password,
        newPassword: data.newPassword,
      });
      setIsCodeStep(true);
      notifySuccess("Doğrulama kodu e-posta adresinize gönderildi.");
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
    } else {
      notifySuccess("Şifreniz başarıyla güncellendi.");
      setIsCodeStep(false);
      setPendingPayload(null);
      reset();
    }
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
                  />
                </div>
              </div>
            </div>
          )}

          <div className="col-xxl-6 col-md-6">
            <div className="profile__btn">
              <button type="submit" className="tp-btn-3" disabled={isRequesting || isConfirming}>
                {isRequesting || isConfirming ? "..." : isCodeStep ? "Kodu Doğrula" : "Kodu Gönder"}
              </button>
            </div>
          </div>
          {isCodeStep && (
            <div className="col-xxl-6 col-md-6">
              <div className="profile__btn">
                <button
                  type="button"
                  className="tp-btn-3"
                  style={{ background: "#efefef", color: "#111" }}
                  onClick={() => {
                    const currentValues = getValues();
                    setIsCodeStep(false);
                    setPendingPayload({
                      currentPassword: currentValues.password || pendingPayload?.currentPassword,
                      newPassword: currentValues.newPassword || pendingPayload?.newPassword,
                    });
                  }}
                >
                  Düzenle
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
