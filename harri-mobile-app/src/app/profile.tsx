import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { CommercePageHeader } from "@/components/commerce-page-header";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { updateCustomerProfile } from "@/modules/auth/api";
import type { SavedAddress, UpdateProfilePayload } from "@/modules/auth/types";
import { useSession } from "@/modules/auth/session-provider";
import {
  createEmptySavedAddress,
  normalizeSavedAddresses,
  removeSavedAddress,
  setDefaultAddress,
  upsertSavedAddress,
} from "@/modules/profile/addresses";

type AddressEditorState = SavedAddress | null;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, refreshSession } = useSession();
  const [form, setForm] = useState<UpdateProfilePayload>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    savedAddresses: [],
  });
  const [editor, setEditor] = useState<AddressEditorState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      savedAddresses: normalizeSavedAddresses(user.savedAddresses),
    });
  }, [user]);

  const defaultAddress = useMemo(
    () => form.savedAddresses.find((item) => item.isDefault) || form.savedAddresses[0] || null,
    [form.savedAddresses]
  );

  const handleSaveProfile = async () => {
    setError(null);
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setSuccessMessage(null);
      setError("Ad, soyad ve e-posta zorunlu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateCustomerProfile({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      await refreshSession();
      setSuccessMessage(response.message);
    } catch (nextError) {
      setSuccessMessage(null);
      setError(nextError instanceof Error ? nextError.message : "Profil güncellenemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAddress = () => {
    if (!editor) return;
    if (!editor.label.trim() || !editor.address.trim()) {
      setError("Adres etiketi ve açık adres zorunlu.");
      return;
    }

    setError(null);
    setForm((current) => ({
      ...current,
      savedAddresses: upsertSavedAddress(current.savedAddresses, {
        ...editor,
        label: editor.label.trim(),
        address: editor.address.trim(),
        city: editor.city.trim(),
        country: editor.country.trim(),
        zipCode: editor.zipCode.trim(),
      }),
    }));
    setEditor(null);
  };

  if (!isAuthenticated || !user) {
    return (
      <ScreenShell>
        <ThemedText type="small">Bu ekran için önce giriş yapın.</ThemedText>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <CommercePageHeader
        title="Profil"
        description="Kişisel bilgilerini ve kayıtlı adreslerini buradan yönetebilirsin."
        backLabel="Hesaba dön"
        onPressBack={() => router.push("/account")}
      >
        {defaultAddress ? (
          <View style={[styles.defaultAddressCard, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Varsayılan adres</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {defaultAddress.label}: {defaultAddress.address}
            </ThemedText>
          </View>
        ) : null}
      </CommercePageHeader>

      <View style={[styles.formCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField label="Ad" value={form.firstName} onChangeText={(value) => setForm((current) => ({ ...current, firstName: value }))} testID="profile-first-name" />
          </View>
          <View style={styles.rowItem}>
            <TextField label="Soyad" value={form.lastName} onChangeText={(value) => setForm((current) => ({ ...current, lastName: value }))} testID="profile-last-name" />
          </View>
        </View>
        <TextField label="E-posta" value={form.email} onChangeText={(value) => setForm((current) => ({ ...current, email: value }))} autoCapitalize="none" keyboardType="email-address" testID="profile-email" />
        <TextField label="Telefon" value={form.phone} onChangeText={(value) => setForm((current) => ({ ...current, phone: value }))} testID="profile-phone" />

        {error ? (
          <ThemedText type="small" style={styles.errorText}>
            {error}
          </ThemedText>
        ) : null}
        {successMessage ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Profil güncellendi</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {successMessage}
            </ThemedText>
          </View>
        ) : null}
        <PrimaryButton label={isSubmitting ? "Kaydediliyor..." : "Profili Kaydet"} onPress={() => void handleSaveProfile()} disabled={isSubmitting} testID="profile-save" />
      </View>

      <View style={[styles.formCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.sectionTopRow}>
          <ThemedText type="smallBold">Kayıtlı adresler</ThemedText>
          <Pressable
            onPress={() => setEditor({ ...createEmptySavedAddress(), isDefault: form.savedAddresses.length === 0 })}
            testID="profile-add-address"
          >
            <ThemedText type="linkPrimary">Adres Ekle</ThemedText>
          </Pressable>
        </View>

        {form.savedAddresses.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Henüz kayıtlı adres yok.
          </ThemedText>
        ) : (
          form.savedAddresses.map((address) => (
            <View key={address.id} style={[styles.addressCard, { borderColor: address.isDefault ? activeTenant.palette.primary : activeTenant.palette.border }]}>
              <View style={styles.addressTopRow}>
                <View style={styles.addressTextWrap}>
                  <ThemedText type="smallBold">{address.label || "Adres"}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {address.address}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {[address.city, address.country, address.zipCode].filter(Boolean).join(" / ")}
                  </ThemedText>
                </View>
                {address.isDefault ? (
                  <View style={[styles.defaultPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
                    <ThemedText type="smallBold">Varsayılan</ThemedText>
                  </View>
                ) : null}
              </View>
              <View style={styles.inlineActions}>
                {!address.isDefault ? (
                  <PrimaryButton
                    label="Varsayılan Yap"
                    onPress={() => setForm((current) => ({ ...current, savedAddresses: setDefaultAddress(current.savedAddresses, address.id) }))}
                    variant="outline"
                    style={styles.actionButton}
                  />
                ) : null}
                <PrimaryButton label="Düzenle" onPress={() => setEditor(address)} variant="outline" style={styles.actionButton} />
                <PrimaryButton
                  label="Sil"
                  onPress={() => setForm((current) => ({ ...current, savedAddresses: removeSavedAddress(current.savedAddresses, address.id) }))}
                  variant="outline"
                  style={styles.actionButton}
                />
              </View>
            </View>
          ))
        )}

        {editor ? (
          <View style={[styles.editorCard, { backgroundColor: activeTenant.palette.background, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Adres düzenleyici</ThemedText>
            <TextField label="Adres Etiketi" value={editor.label} onChangeText={(value) => setEditor((current) => (current ? { ...current, label: value } : current))} placeholder="Ev, İş..." testID="profile-address-label" />
            <TextField label="Açık Adres" value={editor.address} onChangeText={(value) => setEditor((current) => (current ? { ...current, address: value } : current))} multiline numberOfLines={4} placeholder="Sokak, cadde, bina..." testID="profile-address-line" />
            <View style={styles.row}>
              <View style={styles.rowItem}>
                <TextField label="Şehir" value={editor.city} onChangeText={(value) => setEditor((current) => (current ? { ...current, city: value } : current))} testID="profile-address-city" />
              </View>
              <View style={styles.rowItem}>
                <TextField label="İlçe / Ülke" value={editor.country} onChangeText={(value) => setEditor((current) => (current ? { ...current, country: value } : current))} testID="profile-address-country" />
              </View>
            </View>
            <TextField label="Posta Kodu" value={editor.zipCode} onChangeText={(value) => setEditor((current) => (current ? { ...current, zipCode: value } : current))} testID="profile-address-zip" />
            <Pressable
              onPress={() => setEditor((current) => (current ? { ...current, isDefault: !current.isDefault } : current))}
              style={styles.checkboxRow}
              testID="profile-address-default-toggle"
            >
              <View style={[styles.checkbox, { borderColor: activeTenant.palette.primary, backgroundColor: editor.isDefault ? activeTenant.palette.primary : "transparent" }]} />
              <ThemedText type="small">Varsayılan adres yap</ThemedText>
            </Pressable>
            <View style={styles.inlineActions}>
              <PrimaryButton label="Adresi Kaydet" onPress={handleSaveAddress} style={styles.actionButtonWide} testID="profile-address-save" />
              <PrimaryButton label="İptal" onPress={() => setEditor(null)} variant="outline" style={styles.actionButtonWide} />
            </View>
          </View>
        ) : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 20,
    gap: 10,
  },
  title: {
    lineHeight: 40,
  },
  defaultAddressCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  errorText: {
    color: "#b42318",
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  sectionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  addressCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  addressTopRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  addressTextWrap: {
    flex: 1,
    gap: 4,
  },
  defaultPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionButton: {
    minWidth: 118,
  },
  actionButtonWide: {
    minWidth: 150,
  },
  editorCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 4,
  },
});
