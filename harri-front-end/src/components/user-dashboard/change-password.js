'use client';
import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Yup from "yup";
// internal
import { useChangePasswordMutation } from "src/redux/features/auth/authApi";
import ErrorMessage from "@components/error-message/error";
import { notifyError, notifySuccess } from "@utils/toast";
import { useLanguage } from "src/context/LanguageContext";

const schema = Yup.object().shape({
  password: Yup.string().required("Mevcut şifre zorunludur.").min(6, "En az 6 karakter olmalıdır."),
  newPassword: Yup.string().required("Yeni şifre zorunludur.").min(6, "En az 6 karakter olmalıdır."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Şifreler eşleşmiyor.')
    .required("Şifre tekrarı zorunludur."),
});

const ChangePassword = () => {
  const { user } = useSelector((state) => state.auth);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { t } = useLanguage();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const result = await changePassword({
      currentPassword: data.password,
      newPassword: data.newPassword,
    });
    if (result?.error) {
      notifyError(result?.error?.data?.message || "Şifre güncellenirken hata oluştu.");
    } else {
      notifySuccess("Şifreniz başarıyla güncellendi.");
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
                />
                <ErrorMessage message={errors.confirmPassword?.message} />
              </div>
            </div>
          </div>

          <div className="col-xxl-6 col-md-6">
            <div className="profile__btn">
              <button type="submit" className="tp-btn-3" disabled={isLoading}>
                {isLoading ? "..." : t('update')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
