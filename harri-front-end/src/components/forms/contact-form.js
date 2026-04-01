'use client';
import React from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
// internal
import ErrorMessage from "@components/error-message/error";
import { useLanguage } from "src/context/LanguageContext";
import { useSendContactMessageMutation } from "src/redux/features/contactApi";
import { notifyError, notifySuccess } from "@utils/toast";

const schema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
  phone: Yup.string().required().min(10).label("Phone"),
  company: Yup.string().required().label("Company"),
  message: Yup.string().required().min(20).label("Message"),
});

const ContactForm = () => {
  const { t } = useLanguage();
  const [sendContactMessage, { isLoading }] = useSendContactMessageMutation();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    const result = await sendContactMessage(data);
    if (result?.error) {
      notifyError(result.error?.data?.message || "Mesaj gönderilemedi, lütfen tekrar deneyin.");
    } else {
      notifySuccess(result.data?.message || "Mesajınız başarıyla iletildi!");
      reset();
    }
  };

  return (
    <form id="contact-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="row">
        <div className="col-md-6">
          <div className="contact__input-2">
            <input
              name="name"
              {...register("name")}
              type="text"
              placeholder={t('enterName')}
              id="name"
            />
            <ErrorMessage message={errors.name?.message} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="contact__input-2">
            <input
              name="email"
              {...register("email")}
              type="email"
              placeholder={t('enterEmail')}
              id="email"
            />
            <ErrorMessage message={errors.email?.message} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="contact__input-2">
            <input
              name="phone"
              {...register("phone")}
              type="text"
              placeholder={t('mobileNo')}
              id="phone"
            />
            <ErrorMessage message={errors.phone?.message} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="contact__input-2">
            <input
              name="company"
              {...register("company")}
              type="text"
              placeholder={t('company')}
              id="company"
            />
            <ErrorMessage message={errors.company?.message} />
          </div>
        </div>
        <div className="col-md-12">
          <div className="contact__input-2">
            <textarea
              name="message"
              {...register("message")}
              id="message"
              placeholder={t('yourMessage')}
            ></textarea>
            <ErrorMessage message={errors.message?.message} />
          </div>
        </div>
        <div className="col-md-12">
          <div className="contact__agree d-flex align-items-start mb-25">
            <input className="e-check-input" type="checkbox" id="e-agree" />
            <label className="e-check-label" htmlFor="e-agree">
              {t('privacyAgree')}
            </label>
          </div>
        </div>
        <div className="col-md-5">
          <div className="contact__btn-2">
            <button type="submit" className="tp-btn" disabled={isLoading}>
              {isLoading ? "..." : t('sendMessage')}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ContactForm;
