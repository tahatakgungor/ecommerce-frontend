'use client';
import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
// internal
import { EmailTwo, MobileTwo, UserTwo } from "@svg/index";
import { useUpdateProfileMutation } from "src/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@utils/toast";
import ErrorMessage from "@components/error-message/error";
import { useLanguage } from "src/context/LanguageContext";

const UpdateUser = () => {
  const { user } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const { t } = useLanguage();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? "",
      city: user?.city ?? "",
      country: user?.country ?? "",
      zipCode: user?.zipCode ?? "",
    },
  });

  const onSubmit = async (data) => {
    const result = await updateProfile({
      id: user?._id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
      zipCode: data.zipCode,
    });
    if (result?.error) {
      notifyError(result?.error?.data?.message || "Güncelleme başarısız.");
    } else {
      notifySuccess("Bilgileriniz güncellendi.");
    }
  };

  return (
    <div className="profile__info">
      <h3 className="profile__info-title">{t('personalDetails')}</h3>
      <div className="profile__info-content">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("name", { required: `${t('firstName')} zorunlu!` })}
                    type="text"
                    placeholder={t('enterName')}
                  />
                  <span><UserTwo /></span>
                  <ErrorMessage message={errors.name?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("email", { required: "Email zorunlu!" })}
                    type="email"
                    placeholder={t('enterEmail')}
                  />
                  <span><EmailTwo /></span>
                  <ErrorMessage message={errors.email?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("phone")}
                    type="text"
                    placeholder={t('phoneNumber')}
                  />
                  <span><MobileTwo /></span>
                  <ErrorMessage message={errors.phone?.message} />
                </div>
              </div>
            </div>

            {/* Adres Bilgileri */}
            <div className="col-xxl-12 mt-10">
              <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: '12px' }}>
                {t('address') || 'Adres Bilgileri'}
              </h5>
            </div>

            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("address")}
                    type="text"
                    placeholder={t('streetAddress') || 'Sokak adresi'}
                  />
                  <ErrorMessage message={errors.address?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-4 col-md-4">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("city")}
                    type="text"
                    placeholder={t('city') || 'Şehir'}
                  />
                  <ErrorMessage message={errors.city?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-4 col-md-4">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("country")}
                    type="text"
                    placeholder={t('country') || 'Ülke / İl'}
                  />
                  <ErrorMessage message={errors.country?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-4 col-md-4">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("zipCode")}
                    type="text"
                    placeholder={t('postcodeZip') || 'Posta Kodu'}
                  />
                  <ErrorMessage message={errors.zipCode?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-12 mt-10">
              <div className="profile__btn">
                <button type="submit" className="tp-btn" disabled={isLoading}>
                  {isLoading ? "..." : t('updateProfile')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUser;
