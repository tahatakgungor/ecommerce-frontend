"use client";
import React, { useEffect, useState } from "react"; // useEffect eklendi
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter, useSearchParams } from "next/navigation"; // useSearchParams eklendi
// internal
import { notifyError, notifySuccess } from "@/utils/toast";
import { useRegisterAdminMutation } from "@/redux/auth/authApi";
import ErrorMsg from "@/app/components/common/error-msg";

// schema
const schema = Yup.object().shape({
  name: Yup.string().required("Ad soyad zorunludur.").label("Ad Soyad"),
  email: Yup.string().required("E-posta zorunludur.").email("Geçerli bir e-posta girin.").label("E-posta"),
  password: Yup.string().required("Şifre zorunludur.").min(6, "En az 6 karakter olmalıdır.").label("Şifre"),
});

const RegisterForm = () => {
  const [registerAdmin, { isLoading }] = useRegisterAdminMutation();
  const router = useRouter();
  const searchParams = useSearchParams(); // URL'deki parametreleri okumak için
  const token = searchParams.get("token"); // URL'den ?token=... kısmını alıyoruz

  // --- GÜVENLİK KONTROLÜ ---
  useEffect(() => {
    if (!token) {
      notifyError(
        "Davetiye kodu bulunamadı! Lütfen geçerli bir link ile giriş yapın.",
      );
      router.push("/login"); // Token yoksa register'ı gösterme, login'e at.
    }
  }, [token, router]);

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
  const onSubmit = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    if (!token) return notifyError("Token eksik!");

    // Backend'de "/register?token=..." şeklinde bekliyoruz.
    // RTK Query'de bu genellikle { data, token } şeklinde gönderilir.
    const res = await registerAdmin({
      name: data.name,
      email: data.email,
      password: data.password,
      token: token, // Backend'e giden token
    });

    if ("error" in res) {
      // Backend'den dönen ApiResponse içindeki 'message' alanını oku
      const errorData = res.error as any;
      const message =
        errorData?.data?.message || "Kayıt sırasında bir hata oluştu";
      return notifyError(message);
    } else {
      notifySuccess("Kayıt başarılı! Giriş yapabilirsiniz.");
      router.push("/login");
      reset();
    }
  };

  // Eğer token yoksa formu hiç render etme (Beyaz ekran/Loading göster)
  if (!token) {
    return <div className="text-center p-10">Yönlendiriliyorsunuz...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5">
        <p className="mb-0 text-base text-black">
          Ad Soyad <span className="text-red">*</span>
        </p>
        <input
          {...register("name")}
          className="input w-full h-[49px] rounded-md border border-gray6 px-6 text-base"
          type="text"
          placeholder="Ad soyad girin"
        />
        <ErrorMsg msg={errors.name?.message as string} />
      </div>

      <div className="mb-5">
        <p className="mb-0 text-base text-black">
          E-posta <span className="text-red">*</span>
        </p>
        <input
          {...register("email")}
          className="input w-full h-[49px] rounded-md border border-gray6 px-6 text-base"
          type="email"
          placeholder="E-posta adresinizi girin"
        />
        <ErrorMsg msg={errors.email?.message as string} />
      </div>

      <div className="mb-5">
        <p className="mb-0 text-base text-black">
          Şifre <span className="text-red">*</span>
        </p>
        <input
          {...register("password")}
          className="input w-full h-[49px] rounded-md border border-gray6 px-6 text-base"
          type="password"
          placeholder="Şifre oluşturun"
        />
        <ErrorMsg msg={errors.password?.message as string} />
      </div>

      <button
        disabled={isLoading}
        className="tp-btn h-[49px] w-full justify-center"
      >
        {isLoading ? "Kaydediliyor..." : "Hesabı Oluştur"}
      </button>
    </form>
  );
};

export default RegisterForm;
