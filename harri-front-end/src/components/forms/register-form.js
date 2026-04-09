'use client';
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from "yup";
// internal
import { Email, EyeCut, Lock, MobileTwo, UserTwo } from "@svg/index";
import ErrorMessage from "@components/error-message/error";
import { useRegisterUserMutation } from "src/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@utils/toast";
import { useLanguage } from "src/context/LanguageContext";
import { normalizeFirstAndLastName } from "src/utils/user-name";

const schema = Yup.object().shape({
  firstName: Yup.string().required("Ad zorunludur."),
  lastName: Yup.string().required("Soyad zorunludur."),
  phone: Yup.string().nullable(),
  email: Yup.string().required("E-posta zorunludur.").email("Geçerli bir e-posta girin."),
  password: Yup.string().required("Şifre zorunludur.").min(6, "En az 6 karakter olmalıdır."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor.')
    .required("Şifre tekrarı zorunludur."),
});

const RegisterForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [showConPass, setShowConPass] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const emailFromQuery = searchParams.get("email")?.trim();
    if (emailFromQuery) {
      setValue("email", emailFromQuery);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data) => {
    const normalized = normalizeFirstAndLastName(data.firstName, data.lastName);
    const result = await registerUser({
      name: normalized.fullName,
      firstName: normalized.firstName,
      lastName: normalized.lastName,
      phone: data.phone?.trim() || undefined,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
    if (result?.error) {
      notifyError(result?.error?.data?.message || 'Kayıt başarısız.');
    } else {
      setRegistered(true);
      reset();
    }
  };

  if (registered) {
    return (
      <div className="text-center py-4">
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
        <h4 style={{ color: '#74aa4c', marginBottom: '12px' }}>Doğrulama E-postası Gönderildi!</h4>
        <p style={{ color: '#555', lineHeight: 1.6 }}>
          Hesabınızı aktif hale getirmek için e-posta adresinize gönderilen bağlantıya tıklayın.
          Gelen kutunuzu kontrol edin (spam klasörünü de kontrol edin).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="login__input-wrapper">
        <div className="login__input-item">
          <div className="login__input">
            <input
              {...register("firstName")}
              name="firstName"
              type="text"
              placeholder={t('firstName')}
              id="firstName"
            />
            <span><UserTwo /></span>
          </div>
          <ErrorMessage message={errors.firstName?.message} />
        </div>

        <div className="login__input-item">
          <div className="login__input">
            <input
              {...register("lastName")}
              name="lastName"
              type="text"
              placeholder={t('lastName')}
              id="lastName"
            />
            <span><UserTwo /></span>
          </div>
          <ErrorMessage message={errors.lastName?.message} />
        </div>

        <div className="login__input-item">
          <div className="login__input">
            <input
              {...register("phone")}
              name="phone"
              type="tel"
              placeholder={t('phoneNumber')}
              id="phone"
            />
            <span><MobileTwo /></span>
          </div>
          <ErrorMessage message={errors.phone?.message} />
        </div>

        <div className="login__input-item">
          <div className="login__input">
            <input
              {...register("email")}
              name="email"
              type="email"
              placeholder={t('enterEmail')}
              id="email"
            />
            <span><Email /></span>
          </div>
          <ErrorMessage message={errors.email?.message} />
        </div>

        <div className="login__input-item">
          <div className="login__input-item-inner p-relative">
            <div className="login__input">
              <input
                {...register("password")}
                name="password"
                type={showPass ? "text" : "password"}
                placeholder={t('enterPassword')}
                id="password"
              />
              <span><Lock /></span>
            </div>
            <button type="button" className="login-input-eye" onClick={() => setShowPass(!showPass)} aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}>
              {showPass ? <i className="fa-regular fa-eye"></i> : <EyeCut />}
            </button>
          </div>
          <ErrorMessage message={errors.password?.message} />
        </div>

        <div className="login__input-item">
          <div className="login__input-item-inner p-relative">
            <div className="login__input">
              <input
                {...register("confirmPassword")}
                name="confirmPassword"
                type={showConPass ? "text" : "password"}
                placeholder={t('confirmPasswordPlaceholder')}
                id="confirmPassword"
              />
              <span><Lock /></span>
            </div>
            <button type="button" className="login-input-eye" onClick={() => setShowConPass(!showConPass)} aria-label={showConPass ? "Şifreyi gizle" : "Şifreyi göster"}>
              {showConPass ? <i className="fa-regular fa-eye"></i> : <EyeCut />}
            </button>
          </div>
          <ErrorMessage message={errors.confirmPassword?.message} />
        </div>
      </div>

      <div className="login__btn mt-25">
        <button type="submit" className="tp-btn w-100" disabled={isLoading}>
          {isLoading ? "..." : t('signUp')}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
