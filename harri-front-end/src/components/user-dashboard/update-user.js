'use client';
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
// internal
import { EmailTwo, MobileTwo, UserTwo } from "@svg/index";
import { useUpdateProfileMutation } from "src/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@utils/toast";
import ErrorMessage from "@components/error-message/error";
import { useLanguage } from "src/context/LanguageContext";
import { normalizeSavedAddresses } from "src/utils/saved-addresses";
import { getDistrictsByCity, getTurkishCities } from "src/utils/tr-address";
import { getFirstName, getFullName, getLastName } from "src/utils/user-name";

const emptyAddress = () => ({
  id: Date.now().toString(),
  label: "",
  address: "",
  city: "",
  country: "",
  zipCode: "",
  isDefault: false,
});

const UpdateUser = () => {
  const { user } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const { t } = useLanguage();

  // Kayıtlı adresler — backend'den JSON string olarak gelir
  const parseSavedAddresses = () => {
    return normalizeSavedAddresses(user?.savedAddresses);
  };

  const [addresses, setAddresses] = useState(parseSavedAddresses);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      firstName: getFirstName(user) || "",
      lastName: getLastName(user) || "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  useEffect(() => {
    reset({
      firstName: getFirstName(user) || "",
      lastName: getLastName(user) || "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    });
  }, [user, reset]);

  const cityOptions = React.useMemo(() => getTurkishCities(), []);

  const onSubmit = async (data) => {
    const fullName = getFullName({ firstName: data.firstName, lastName: data.lastName });
    const result = await updateProfile({
      name: fullName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      // Ana adres: varsayılan adres veya ilk adres
      address: addresses.find((a) => a.isDefault)?.address ?? addresses[0]?.address ?? "",
      city: addresses.find((a) => a.isDefault)?.city ?? addresses[0]?.city ?? "",
      country: addresses.find((a) => a.isDefault)?.country ?? addresses[0]?.country ?? "",
      zipCode: addresses.find((a) => a.isDefault)?.zipCode ?? addresses[0]?.zipCode ?? "",
      savedAddresses: JSON.stringify(addresses),
    });
    if (result?.error) {
      notifyError(result?.error?.data?.message || "Güncelleme başarısız.");
    } else {
      const nextUser = result?.data?.data?.user || result?.data?.user || result?.data?.data || result?.data;
      reset({
        firstName: getFirstName(nextUser || data) || data.firstName || "",
        lastName: getLastName(nextUser || data) || data.lastName || "",
        email: (nextUser?.email ?? data.email) || "",
        phone: (nextUser?.phone ?? data.phone) || "",
      });
      notifySuccess("Bilgileriniz güncellendi.");
    }
  };

  // Adres işlemleri
  const startAdd = () => {
    const newAddr = emptyAddress();
    setAddresses((prev) => [...prev, newAddr]);
    setEditingId(newAddr.id);
    setEditForm({ ...newAddr });
  };

  const startEdit = (addr) => {
    setEditingId(addr.id);
    setEditForm({ ...addr });
  };

  const cancelEdit = () => {
    // Eğer hiç kaydedilmemiş (boş) bir adresse iptal et → sil
    setAddresses((prev) =>
      prev.filter((a) => a.id !== editingId || (a.address || a.city))
    );
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    setAddresses((prev) =>
      prev.map((a) => (a.id === editingId ? { ...editForm } : a))
    );
    setEditingId(null);
    setEditForm(null);
  };

  const deleteAddress = (id) => {
    const confirmed = window.confirm("Bu adresi silmek istediğinize emin misiniz?");
    if (!confirmed) {
      return;
    }
    setAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      // Silinen varsayılansa, ilkini varsayılan yap
      if (prev.find((a) => a.id === id)?.isDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });
  };

  const setDefault = (id) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  return (
    <div className="profile__info">
      <h3 className="profile__info-title">{t('personalDetails')}</h3>
      <div className="profile__info-content">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            {/* Kişisel bilgiler */}
            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <label
                  htmlFor="profile-first-name"
                  style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}
                >
                  {t("firstName")}
                </label>
                <div className="profile__input">
                  <input
                    {...register("firstName", { required: `${t('firstName')} zorunlu!` })}
                    id="profile-first-name"
                    type="text"
                    placeholder="Örn. Taha"
                  />
                  <span><UserTwo /></span>
                  <ErrorMessage message={errors.firstName?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <label
                  htmlFor="profile-last-name"
                  style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}
                >
                  {t("lastName")}
                </label>
                <div className="profile__input">
                  <input
                    {...register("lastName", { required: `${t('lastName')} zorunlu!` })}
                    id="profile-last-name"
                    type="text"
                    placeholder="Örn. Akgüngör"
                  />
                  <span><UserTwo /></span>
                  <ErrorMessage message={errors.lastName?.message} />
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

            {/* Adres Yönetimi */}
            <div className="col-xxl-12 mt-20">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
                <h5 style={{ fontSize: 14, fontWeight: 600, color: "#555", margin: 0 }}>
                  Kayıtlı Adresler
                </h5>
                <button
                  type="button"
                  onClick={startAdd}
                  disabled={editingId !== null}
                  style={{
                    fontSize: 12,
                    padding: "4px 12px",
                    background: "#821f40",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: editingId !== null ? "not-allowed" : "pointer",
                    opacity: editingId !== null ? 0.5 : 1,
                  }}
                >
                  + Adres Ekle
                </button>
              </div>

              {addresses.length === 0 && (
                <p style={{ fontSize: 13, color: "#999", marginBottom: 8 }}>
                  Henüz kayıtlı adres yok.
                </p>
              )}

              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    border: `1px solid ${addr.isDefault ? "#821f40" : "#e0e0e0"}`,
                    borderRadius: 6,
                    padding: 14,
                    marginBottom: 10,
                    background: addr.isDefault ? "#fff5f7" : "#fafafa",
                  }}
                >
                  {editingId === addr.id ? (
                    /* Düzenleme formu */
                    <div className="row">
                      <div className="col-12 mb-2">
                        <label style={labelStyle}>Adres Etiketi</label>
                        <input
                          type="text"
                          placeholder="Adres etiketi (Ev, İş...)"
                          value={editForm.label}
                          onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
                          style={inputStyle}
                          autoComplete="address-line1"
                        />
                      </div>
                      <div className="col-12 mb-2">
                        <label style={labelStyle}>Açık Adres</label>
                        <input
                          type="text"
                          placeholder="Sokak / Cadde adresi"
                          value={editForm.address}
                          onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                          style={inputStyle}
                          autoComplete="street-address"
                        />
                      </div>
                      <div className="col-md-4 mb-2">
                        <label style={labelStyle}>Şehir</label>
                        <select
                          value={editForm.city || ""}
                          onChange={(e) => {
                            const nextCity = e.target.value;
                            const districts = getDistrictsByCity(nextCity);
                            const hasCurrentDistrict = districts.some((d) => d.name === editForm.country);
                            setEditForm((f) => ({
                              ...f,
                              city: nextCity,
                              country: hasCurrentDistrict ? f.country : "",
                            }));
                          }}
                          style={inputStyle}
                          autoComplete="address-level1"
                        >
                          <option value="">Şehir seçin</option>
                          {cityOptions.map((city) => (
                            <option key={city.key} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4 mb-2">
                        <label style={labelStyle}>İlçe</label>
                        <select
                          value={editForm.country || ""}
                          onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))}
                          style={inputStyle}
                          disabled={!editForm.city}
                          autoComplete="address-level2"
                        >
                          <option value="">İlçe seçin</option>
                          {getDistrictsByCity(editForm.city).map((district) => (
                            <option key={district.key} value={district.name}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4 mb-2">
                        <label style={labelStyle}>Posta Kodu</label>
                        <input
                          type="text"
                          placeholder="Posta Kodu"
                          value={editForm.zipCode}
                          onChange={(e) => setEditForm((f) => ({ ...f, zipCode: e.target.value }))}
                          style={inputStyle}
                          autoComplete="postal-code"
                        />
                      </div>
                      <div className="col-12" style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                        <button type="button" onClick={saveEdit} style={btnPrimary}>
                          Kaydet
                        </button>
                        <button type="button" onClick={cancelEdit} style={btnSecondary}>
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Görüntüleme modu */
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 0, flex: "1 1 280px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          {addr.label && (
                            <span style={{ fontWeight: 600, fontSize: 13, color: "#333" }}>
                              {addr.label}
                            </span>
                          )}
                          {addr.isDefault && (
                            <span style={{
                              fontSize: 10, background: "#821f40", color: "#fff",
                              borderRadius: 3, padding: "1px 6px", fontWeight: 500,
                            }}>
                              Varsayılan
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.6 }}>
                          {addr.address}{addr.address && (addr.city || addr.country) ? ", " : ""}
                          {addr.city}{addr.city && addr.country ? " / " : ""}{addr.country}
                          {addr.zipCode ? ` ${addr.zipCode}` : ""}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => setDefault(addr.id)}
                            style={btnOutline}
                            title="Varsayılan yap"
                          >
                            Varsayılan Yap
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => startEdit(addr)}
                          style={btnOutline}
                          disabled={editingId !== null}
                        >
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAddress(addr.id)}
                          style={btnDanger}
                          disabled={editingId !== null}
                          title="Adresi sil"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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

const inputStyle = {
  width: "100%",
  height: 38,
  border: "1px solid #ddd",
  borderRadius: 4,
  padding: "0 10px",
  fontSize: 13,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#4b5563",
  marginBottom: 6,
};

const btnPrimary = {
  padding: "5px 14px",
  background: "#821f40",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  fontSize: 12,
  cursor: "pointer",
};

const btnSecondary = {
  padding: "5px 14px",
  background: "#eee",
  color: "#555",
  border: "none",
  borderRadius: 4,
  fontSize: 12,
  cursor: "pointer",
};

const btnOutline = {
  padding: "4px 10px",
  background: "transparent",
  color: "#555",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: 11,
  cursor: "pointer",
};

const btnDanger = {
  padding: "4px 10px",
  background: "transparent",
  color: "#d00",
  border: "1px solid #d00",
  borderRadius: 4,
  fontSize: 11,
  cursor: "pointer",
};

export default UpdateUser;
