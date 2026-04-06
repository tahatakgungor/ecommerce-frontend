'use client';
import ErrorMessage from "@components/error-message/error";
import React from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "src/context/LanguageContext";
import { getDistrictsByCity, getTurkishCities } from "src/utils/tr-address";
import { getFirstName, getLastName } from "src/utils/user-name";

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
  autoComplete,
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
          autoComplete={autoComplete}
        />
        {error && <ErrorMessage message={error} />}
      </div>
    </div>
  );
}

const BillingDetails = ({
  register,
  watch,
  errors,
  savedAddresses = [],
  selectedAddressId = "",
  applySavedAddress,
  useManualAddress = false,
  enableManualAddress,
  selectedSavedAddress,
  showAddAddressForm = false,
  openAddAddressForm,
  cancelAddAddressForm,
  addressDraft,
  setAddressDraft,
  saveAddressFromCheckout,
  isSavingAddress = false,
}) => {
  const { user } = useSelector(state => state.auth);
  const { t, lang } = useLanguage();
  const hasSavedAddresses = savedAddresses.length > 0;
  const cityOptions = React.useMemo(() => getTurkishCities(), []);
  const manualCity = watch ? watch("city") : "";
  const districtOptions = React.useMemo(
    () => getDistrictsByCity(addressDraft?.city),
    [addressDraft?.city]
  );
  const manualDistrictOptions = React.useMemo(
    () => getDistrictsByCity(manualCity),
    [manualCity]
  );
  const selectedAddressLabel =
    selectedSavedAddress?.label ||
    (lang === "tr" ? "Kayıtlı Adres" : "Saved Address");
  const selectedAddressLine = [selectedSavedAddress?.address, selectedSavedAddress?.city, selectedSavedAddress?.country, selectedSavedAddress?.zipCode]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="row">
        {hasSavedAddresses && (
          <div className="col-12">
            <div className="checkout-form-list checkout-saved-address">
              <div className="checkout-saved-address__head">
                <label className="checkout-saved-address__label">
                  {lang === "tr" ? "Kayıtlı Adresler" : "Saved Addresses"}
                </label>
                <p className="checkout-saved-address__hint">
                  {lang === "tr" ? "Teslimat için bir adres seçin." : "Choose one address for delivery."}
                </p>
              </div>

              <div className="checkout-saved-address__select-wrap">
                <select
                  className="form-control checkout-saved-address__select"
                  value={useManualAddress ? "" : selectedAddressId}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      enableManualAddress?.();
                      return;
                    }
                    applySavedAddress?.(value);
                  }}
                >
                  <option value="">
                    {lang === "tr" ? "Adres seçin veya yeni adres girin" : "Select an address or enter a new one"}
                  </option>
                  {savedAddresses.map((address) => {
                    const title = address.label || (lang === "tr" ? "Kayıtlı Adres" : "Saved Address");
                    const shortLine = [address.city, address.country].filter(Boolean).join(" / ");
                    return (
                      <option key={address.id} value={address.id}>
                        {title}{address.isDefault ? ` (${lang === "tr" ? "Varsayılan" : "Default"})` : ""}{shortLine ? ` - ${shortLine}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {!useManualAddress && selectedSavedAddress && (
                <div className="checkout-saved-address__card">
                  <div className="checkout-saved-address__card-head">
                    <strong className="checkout-saved-address__card-title">{selectedAddressLabel}</strong>
                    {selectedSavedAddress?.isDefault && (
                      <span className="checkout-saved-address__badge">
                        {lang === "tr" ? "Varsayılan" : "Default"}
                      </span>
                    )}
                  </div>
                  <div className="checkout-saved-address__line">{selectedAddressLine}</div>
                  <div className="checkout-saved-address__subline">
                    {lang === "tr" ? "Bu adres teslimat adresi olarak kullanılacak." : "This address will be used for delivery."}
                  </div>
                  <input type="hidden" {...register("address")} value={selectedSavedAddress.address || ""} />
                  <input type="hidden" {...register("city")} value={selectedSavedAddress.city || ""} />
                  <input type="hidden" {...register("country")} value={selectedSavedAddress.country || ""} />
                  <input type="hidden" {...register("zipCode")} value={selectedSavedAddress.zipCode || ""} />
                </div>
              )}

              <button
                type="button"
                onClick={enableManualAddress}
                className="checkout-saved-address__manual-btn"
              >
                + {lang === "tr" ? "Farklı bir adres gir" : "Enter another address"}
              </button>
            </div>
          </div>
        )}

        {!hasSavedAddresses && (
          <div className="col-12">
            <div
              className="checkout-form-list"
              style={{
                marginBottom: 24,
                border: "1px dashed #d7d7d7",
                borderRadius: 8,
                padding: 14,
                background: "#fcfcfc",
              }}
            >
              <label style={{ display: "block", marginBottom: 6 }}>
                {lang === "tr" ? "Kayıtlı Adres" : "Saved Address"}
              </label>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: "#666" }}>
                {lang === "tr"
                  ? "Profilinizde kayıtlı adres yok. Buradan yeni adres ekleyip kaydedebilirsiniz."
                  : "You have no saved address in your profile. Add and save one here."}
              </p>

              {!showAddAddressForm && (
                <button
                  type="button"
                  onClick={openAddAddressForm}
                  className="tp-btn-border"
                  style={{ fontSize: 13, padding: "7px 14px" }}
                >
                  {lang === "tr" ? "+ Adres Ekle" : "+ Add Address"}
                </button>
              )}

              {showAddAddressForm && (
                <div className="row" style={{ marginTop: 10 }}>
                  <div className="col-12 mb-2">
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      {lang === "tr" ? "Adres Etiketi" : "Address Label"}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={lang === "tr" ? "Adres etiketi (Evim, İş...)" : "Address label (Home, Work...)"}
                      value={addressDraft?.label || ""}
                      onChange={(e) => setAddressDraft?.((prev) => ({ ...prev, label: e.target.value }))}
                      autoComplete="address-line1"
                    />
                  </div>
                  <div className="col-12 mb-2">
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      {lang === "tr" ? "Açık Adres" : "Address"}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={lang === "tr" ? "Sokak/Cadde ve kapı no" : "Street and address line"}
                      value={addressDraft?.address || ""}
                      onChange={(e) => setAddressDraft?.((prev) => ({ ...prev, address: e.target.value }))}
                      autoComplete="street-address"
                    />
                  </div>
                  <div className="col-md-4 mb-2">
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      {lang === "tr" ? "Şehir" : "City"}
                    </label>
                    <select
                      className="form-control"
                      value={addressDraft?.city || ""}
                      onChange={(e) =>
                        setAddressDraft?.((prev) => ({
                          ...prev,
                          city: e.target.value,
                          country: "",
                        }))
                      }
                    >
                      <option value="">{lang === "tr" ? "Şehir seçin" : "Select city"}</option>
                      {cityOptions.map((city) => (
                        <option key={city.key} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-2">
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      {lang === "tr" ? "İlçe" : "District"}
                    </label>
                    <select
                      className="form-control"
                      value={addressDraft?.country || ""}
                      onChange={(e) => setAddressDraft?.((prev) => ({ ...prev, country: e.target.value }))}
                      disabled={!addressDraft?.city}
                    >
                      <option value="">{lang === "tr" ? "İlçe seçin" : "Select district"}</option>
                      {districtOptions.map((district) => (
                        <option key={district.key} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-2">
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      {lang === "tr" ? "Posta Kodu" : "Zip Code"}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={lang === "tr" ? "Posta Kodu" : "Zip Code"}
                      value={addressDraft?.zipCode || ""}
                      onChange={(e) => setAddressDraft?.((prev) => ({ ...prev, zipCode: e.target.value }))}
                      autoComplete="postal-code"
                    />
                  </div>
                  <div className="col-12 d-flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={saveAddressFromCheckout}
                      className="tp-btn"
                      style={{ height: 40, lineHeight: "40px", padding: "0 16px" }}
                      disabled={isSavingAddress}
                    >
                      {isSavingAddress
                        ? (lang === "tr" ? "Kaydediliyor..." : "Saving...")
                        : (lang === "tr" ? "Adresi Kaydet" : "Save Address")}
                    </button>
                    <button
                      type="button"
                      onClick={cancelAddAddressForm}
                      className="tp-btn-border"
                      style={{ height: 40, lineHeight: "40px", padding: "0 16px" }}
                      disabled={isSavingAddress}
                    >
                      {lang === "tr" ? "İptal" : "Cancel"}
                    </button>
                  </div>
                </div>
              )}
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
          defaultValue={getFirstName(user)}
          autoComplete="given-name"
        />
        <CheckoutFormList
          name="lastName"
          col="12"
          label={t('lastName')}
          placeholder={t('lastName')}
          register={register}
          error={errors?.lastName?.message}
          defaultValue={getLastName(user)}
          autoComplete="family-name"
        />
        {useManualAddress && (
          <>
            <CheckoutFormList
              name="address"
              col="12"
              label={t('address')}
              placeholder={t('streetAddress')}
              register={register}
              error={errors?.address?.message}
              autoComplete="street-address"
            />
            <div className="col-md-12">
              <div className="checkout-form-list">
                <label>
                  {t("city")} <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  {...register("city", {
                    required: `${t("city")} alanı zorunludur.`,
                  })}
                  defaultValue=""
                >
                  <option value="">{lang === "tr" ? "Şehir seçin" : "Select city"}</option>
                  {cityOptions.map((city) => (
                    <option key={city.key} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {errors?.city?.message && <ErrorMessage message={errors.city.message} />}
              </div>
            </div>
            <div className="col-md-6">
              <div className="checkout-form-list">
                <label>
                  {t("stateCounty")} <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  {...register("country", {
                    required: `${t("stateCounty")} alanı zorunludur.`,
                  })}
                  defaultValue=""
                  disabled={!manualCity}
                >
                  <option value="">{lang === "tr" ? "İlçe seçin" : "Select district"}</option>
                  {manualDistrictOptions.map((district) => (
                    <option key={district.key} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {errors?.country?.message && <ErrorMessage message={errors.country.message} />}
              </div>
            </div>
            <CheckoutFormList
              col="6"
              label={t('postcodeZip')}
              placeholder={t('postcodeZip')}
              name="zipCode"
              register={register}
              error={errors?.zipCode?.message}
              autoComplete="postal-code"
            />
          </>
        )}
        <CheckoutFormList
          col="6"
          type="email"
          label={t('emailAddress')}
          placeholder={t('yourEmail')}
          name="email"
          register={register}
          error={errors?.email?.message}
          defaultValue={user?.email}
          autoComplete="email"
        />
        <CheckoutFormList
          name="contact"
          col="6"
          label={t('phone')}
          placeholder={t('phoneNumber')}
          register={register}
          error={errors?.contact?.message}
          autoComplete="tel"
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
