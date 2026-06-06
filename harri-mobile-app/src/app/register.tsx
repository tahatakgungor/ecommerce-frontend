import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { registerCustomer } from "@/modules/auth/api";
import type { RegisterPayload } from "@/modules/auth/types";
import { validateRegisterPayload } from "@/modules/auth/validators";

const INITIAL_FORM: RegisterPayload = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterPayload>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updateField = (key: keyof RegisterPayload, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    const validationError = validateRegisterPayload(form);
    if (validationError) {
      setSuccessMessage(null);
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const message = await registerCustomer(form);
      setSuccessMessage(message);
      setForm(INITIAL_FORM);
    } catch (nextError) {
      setSuccessMessage(null);
      setError(nextError instanceof Error ? nextError.message : "Kayit islemi basarisiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenShell>
      <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.primary, borderColor: activeTenant.palette.primary }]}>
        <ThemedText type="smallBold" style={styles.heroEyebrow}>
          YENI HESAP
        </ThemedText>
        <ThemedText type="subtitle" style={styles.heroTitle}>
          Mobil alisverise hizli giris yapin
        </ThemedText>
        <ThemedText type="small" style={styles.heroBody}>
          Siparis takibi, favoriler ve checkout akisi tek hesap altinda toplanir.
        </ThemedText>
      </View>

      <View style={[styles.formCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField label="Ad" value={form.firstName} onChangeText={(value) => updateField("firstName", value)} placeholder="Tahat" testID="register-first-name" />
          </View>
          <View style={styles.rowItem}>
            <TextField label="Soyad" value={form.lastName} onChangeText={(value) => updateField("lastName", value)} placeholder="Takgungor" testID="register-last-name" />
          </View>
        </View>

        <TextField
          label="Telefon"
          value={form.phone}
          onChangeText={(value) => updateField("phone", value)}
          placeholder="0555 000 00 00"
          keyboardType="default"
          testID="register-phone"
        />
        <TextField
          label="E-posta"
          value={form.email}
          onChangeText={(value) => updateField("email", value)}
          placeholder="ornek@serravit.com"
          autoCapitalize="none"
          keyboardType="email-address"
          testID="register-email"
        />
        <TextField
          label="Sifre"
          value={form.password}
          onChangeText={(value) => updateField("password", value)}
          placeholder="En az 6 karakter"
          secureTextEntry
          autoCapitalize="none"
          testID="register-password"
        />
        <TextField
          label="Sifre Tekrar"
          value={form.confirmPassword}
          onChangeText={(value) => updateField("confirmPassword", value)}
          placeholder="Sifreyi tekrar girin"
          secureTextEntry
          autoCapitalize="none"
          testID="register-confirm-password"
        />

        {error ? (
          <ThemedText type="small" style={styles.errorText}>
            {error}
          </ThemedText>
        ) : null}
        {successMessage ? (
          <View style={[styles.successCard, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Dogrulama baglantisi gonderildi</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {successMessage}
            </ThemedText>
          </View>
        ) : null}

        <PrimaryButton
          label={isSubmitting ? "Kayit olusturuluyor..." : "Hesap Olustur"}
          onPress={() => {
            void handleSubmit();
          }}
          disabled={isSubmitting}
          testID="register-submit"
        />

        <View style={styles.footerRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Hesabiniz var mi?
          </ThemedText>
          <Pressable onPress={() => router.replace("/account")} testID="register-go-to-login">
            <ThemedText type="linkPrimary">Giris Yap</ThemedText>
          </Pressable>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 24,
    gap: 12,
  },
  heroEyebrow: {
    color: "#d5f2df",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#ffffff",
    lineHeight: 40,
  },
  heroBody: {
    color: "#e8f7ee",
    lineHeight: 22,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 26,
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
  successCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  errorText: {
    color: "#b42318",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
