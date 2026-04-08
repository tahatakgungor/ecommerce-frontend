'use client';
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
// internal
import { UserTwo, Lists } from "@svg/index";
import ErrorMessage from "@components/error-message/error";
import { useLazyLookupOrderQuery } from "src/redux/features/order/orderApi";
import { notifyError } from "@utils/toast";
import { useRouter } from "next/navigation";
import { useLanguage } from "src/context/LanguageContext";

const OrderLookupForm = () => {
  const [lookupOrder, { isLoading }] = useLazyLookupOrderQuery();
  const router = useRouter();
  const { lang } = useLanguage();

  const schema = React.useMemo(
    () =>
      Yup.object().shape({
        email: Yup.string()
          .required(lang === "tr" ? "E-posta zorunludur." : "Email is required.")
          .email(lang === "tr" ? "Geçerli bir e-posta girin." : "Please enter a valid email."),
        invoice: Yup.string()
          .required(lang === "tr" ? "Fatura numarası zorunludur." : "Invoice number is required."),
      }),
    [lang]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    lookupOrder({
      invoice: data.invoice,
      email: data.email,
    })
      .then((res) => {
        if (res?.error) {
          notifyError(res?.error?.data?.message || (lang === "tr" ? "Sipariş bulunamadı." : "Order not found."));
        } else if (res?.data?.order) {
          router.push(`/order/${res.data.order._id}`);
        }
      })
      .catch(() => {
        notifyError(lang === "tr" ? "Bir hata oluştu." : "Something went wrong.");
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="login__input-wrapper">
        <div className="login__input-item">
          <div className="login__input p-relative">
            <input
              {...register("invoice")}
              name="invoice"
              type="text"
              placeholder={lang === "tr" ? "Fatura No" : "Invoice No"}
              id="invoice"
            />
            <span style={{ top: '50%', transform: 'translateY(-50%)', position: 'absolute', left: '20px' }}>
              <Lists />
            </span>
          </div>
          <ErrorMessage message={errors.invoice?.message} />
        </div>

        <div className="login__input-item">
          <div className="login__input p-relative">
            <input
              {...register("email")}
              name="email"
              type="email"
              placeholder={lang === "tr" ? "E-posta Adresi" : "Email Address"}
              id="email"
            />
            <span style={{ top: '50%', transform: 'translateY(-50%)', position: 'absolute', left: '25px' }}>
              <UserTwo />
            </span>
          </div>
          <ErrorMessage message={errors.email?.message} />
        </div>
      </div>

      <div className="login__btn mt-20">
        <button type="submit" className="tp-btn w-100" disabled={isLoading}>
          {isLoading ? (lang === "tr" ? "Sorgulanıyor..." : "Searching...") : (lang === "tr" ? "Siparişi Sorgula" : "Lookup Order")}
        </button>
      </div>
    </form>
  );
};

export default OrderLookupForm;
