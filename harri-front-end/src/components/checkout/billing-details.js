'use client';
import ErrorMessage from "@components/error-message/error";
import React from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "src/context/LanguageContext";

function CheckoutFormList({
  col,
  label,
  type = "text",
  placeholder,
  isRequired = true,
  name,
  register,
  error,
  defaultValue,
}) {
  return (
    <div className={`col-md-${col}`}>
      <div className="checkout-form-list">
        {label && (
          <label>
            {label} {isRequired && <span className="required">*</span>}
          </label>
        )}
        <input
          {...register(`${name}`, {
            required: `${label} alanı zorunludur.`,
          })}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue ? defaultValue : ""}
        />
        {error && <ErrorMessage message={error} />}
      </div>
    </div>
  );
}

const BillingDetails = ({
  register,
  errors,
  savedAddresses = [],
  selectedAddressId = "",
  applySavedAddress,
}) => {
  const { user } = useSelector(state => state.auth);
  const { t } = useLanguage();

  return (
    <>
      <div className="row">
        {savedAddresses.length > 0 && (
          <div className="col-12">
            <div className="checkout-form-list">
              <label>Kayıtlı Adresler</label>
              <select
                value={selectedAddressId}
                onChange={(e) => applySavedAddress?.(e.target.value)}
                style={{
                  width: "100%",
                  height: 50,
                  padding: "0 16px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 0,
                  backgroundColor: "#fff",
                  color: "#55585b",
                }}
              >
                <option value="">Manuel adres girişi</option>
                {savedAddresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {[address.label, address.address, address.city]
                      .filter(Boolean)
                      .join(" - ")}
                    {address.isDefault ? " (Varsayılan)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <CheckoutFormList
          name="firstName"
          col="12"
          label={t('firstName')}
          placeholder={t('firstName')}
          register={register}
          error={errors?.firstName?.message}
          defaultValue={user?.name}
        />
        <CheckoutFormList
          name="lastName"
          col="12"
          label={t('lastName')}
          placeholder={t('lastName')}
          register={register}
          error={errors?.lastName?.message}
        />
        <CheckoutFormList
          name="address"
          col="12"
          label={t('address')}
          placeholder={t('streetAddress')}
          register={register}
          error={errors?.address?.message}
        />
        <CheckoutFormList
          col="12"
          label={t('city')}
          placeholder={t('city')}
          name="city"
          register={register}
          error={errors?.city?.message}
        />
        <CheckoutFormList
          col="6"
          label={t('stateCounty')}
          placeholder={t('stateCounty')}
          name="country"
          register={register}
          error={errors?.country?.message}
        />
        <CheckoutFormList
          col="6"
          label={t('postcodeZip')}
          placeholder={t('postcodeZip')}
          name="zipCode"
          register={register}
          error={errors?.zipCode?.message}
        />
        <CheckoutFormList
          col="6"
          type="email"
          label={t('emailAddress')}
          placeholder={t('yourEmail')}
          name="email"
          register={register}
          error={errors?.email?.message}
          defaultValue={user?.email}
        />
        <CheckoutFormList
          name="contact"
          col="6"
          label={t('phone')}
          placeholder={t('phoneNumber')}
          register={register}
          error={errors?.contact?.message}
        />

        <div className="order-notes">
          <div className="checkout-form-list">
            <label>{t('orderNotes')}</label>
            <textarea
              id="checkout-mess"
              cols="30"
              rows="10"
              placeholder={t('orderNotesPlaceholder')}
            ></textarea>
          </div>
        </div>
      </div>
    </>
  );
};

export default BillingDetails;
