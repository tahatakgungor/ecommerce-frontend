'use client';
import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
// internal
import { EyeCut, Lock, UserTwo } from "@svg/index";
import ErrorMessage from "@components/error-message/error";
import { useLoginUserMutation } from "src/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@utils/toast";
import { useRouter } from "next/navigation";
import { useLanguage } from "src/context/LanguageContext";

const schema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
});

const LoginForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [loginUser, {}] = useLoginUserMutation();
  const router = useRouter();
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    loginUser({
      email: data.email,
      password: data.password,
    })
      .then((data) => {
        if (data?.error) {
          notifyError(data?.error?.data?.message || "Login failed!");
        } else {
          notifySuccess("Login successfully");
          setTimeout(() => {
            router.push("/");
          }, 500);
        }
      });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="login__input-wrapper">
        <div className="login__input-item">
          <div className="login__input">
            <input
              {...register("email")}
              name="email"
              type="email"
              placeholder={t('enterEmail')}
              id="email"
            />
            <span><UserTwo /></span>
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
            <button
              type="button"
              className="login-input-eye"
              onClick={() => setShowPass(!showPass)}
              aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPass ? <i className="fa-regular fa-eye"></i> : <EyeCut />}
            </button>
            <ErrorMessage message={errors.password?.message} />
          </div>
        </div>
      </div>

      <div className="login__option mb-25 d-sm-flex justify-content-between">
        <div className="login__remember">
          <input type="checkbox" id="tp-remember" />
          <label htmlFor="tp-remember">{t('rememberMe')}</label>
        </div>
        <div className="login__forgot">
          <Link href="/forgot">{t('forgotPasswordLink')}</Link>
        </div>
      </div>
      <div className="login__btn">
        <button type="submit" className="tp-btn w-100">
          {t('signIn')}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
