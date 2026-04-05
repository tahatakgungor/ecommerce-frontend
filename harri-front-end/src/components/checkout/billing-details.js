'use client';
import ErrorMessage from "@components/error-message/error";
import React from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "src/context/LanguageContext";
import { getDistrictsByCity, getTurkishCities } from "src/utils/tr-address";

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

  return (
    <>
      <div className="row">
        {hasSavedAddresses && (
          <div className="col-12">
            <div className="checkout-form-list" style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 12 }}>Kayıtlı Adresler</label>
              <div style={{ display: "grid", gap: 12 }}>
                {savedAddresses.map((address) => {
                  const isActive = !useManualAddress && selectedAddressId === address.id;
                  return (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => applySavedAddress?.(address.id)}
                      style={{
                        textAlign: "left",
                        width: "100%",
                        padding: "14px 16px",
                        border: `1px solid ${isActive ? "#2f8f46" : "#d9d9d9"}`,
                        background: isActive ? "#f2fbf4" : "#fff",
                        borderRadius: 8,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <strong style={{ color: "#111" }}>{address.label || "Kayıtlı Adres"}</strong>
                        {address.isDefault && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: "#821f40",
                              color: "#fff",
                              fontWeight: 600,
                            }}
                          >
                            Varsayılan
                          </span>
                        )}
                      </div>
                      <div style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>
                        {[address.address, address.city, address.country, address.zipCode]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={enableManualAddress}
                style={{
                  marginTop: 12,
                  border: "none",
                  background: "transparent",
                  color: "#821f40",
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                + Farklı bir adres gir
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
                    <input
                      type="text"
                      className="form-control"
                      placeholder={lang === "tr" ? "Adres etiketi (Evim, İş...)" : "Address label (Home, Work...)"}
                      value={addressDraft?.label || ""}
                      onChange={(e) => setAddressDraft?.((prev) => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                  <div className="col-12 mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={lang === "tr" ? "Sokak/Cadde ve kapı no" : "Street and address line"}
                      value={addressDraft?.address || ""}
                      onChange={(e) => setAddressDraft?.((prev) => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-4 mb-2">
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
                    <input
                      type="text"
                      className="form-control"
                      placeholder={lang === "tr" ? "Posta Kodu" : "Zip Code"}
                      value={addressDraft?.zipCode || ""}
                      onChange={(e) => setAddressDraft?.((prev) => ({ ...prev, zipCode: e.target.value }))}
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
        {!useManualAddress && selectedSavedAddress && (
          <div className="col-12">
            <div
              style={{
                border: "1px solid #e7e7e7",
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
                background: "#fafafa",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 8 }}>
                Seçili Teslimat Adresi
              </div>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>
                {[selectedSavedAddress.address, selectedSavedAddress.city, selectedSavedAddress.country, selectedSavedAddress.zipCode]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              <input type="hidden" {...register("address")} value={selectedSavedAddress.address || ""} />
              <input type="hidden" {...register("city")} value={selectedSavedAddress.city || ""} />
              <input type="hidden" {...register("country")} value={selectedSavedAddress.country || ""} />
              <input type="hidden" {...register("zipCode")} value={selectedSavedAddress.zipCode || ""} />
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
        {useManualAddress && (
          <>
            <CheckoutFormList
              name="address"
              col="12"
              label={t('address')}
              placeholder={t('streetAddress')}
              register={register}
              error={errors?.address?.message}
            />
            <div className="col-md-12">
              <div className="checkout-form-list">
                <label>
                  {t("city")} <span className="required">*</span>
                </label>
                <select
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
