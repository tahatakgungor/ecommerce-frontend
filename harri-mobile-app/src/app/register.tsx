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
      <View style={[styles.authShell, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.authSwitchRow}>
          <Pressable
            onPress={() => router.replace("/account")}
            testID="register-go-to-login-top"
            style={({ pressed }) => [
              styles.authSwitchGhost,
              { borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
              Giriş Yap
            </ThemedText>
          </Pressable>
          <View style={[styles.authSwitchPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
              Hesap Oluştur
            </ThemedText>
          </View>
        </View>

        <View style={styles.authIntroBlock}>
          <ThemedText type="smallBold">Yeni Serravit hesabı oluştur</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Sipariş, favori, iade ve yorum işlemlerini tek yerden yönet.
          </ThemedText>
        </View>
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
          placeholder="örnek@serravit.com"
          autoCapitalize="none"
          keyboardType="email-address"
          testID="register-email"
        />
        <TextField
          label="Şifre"
          value={form.password}
          onChangeText={(value) => updateField("password", value)}
          placeholder="En az 6 karakter"
          secureTextEntry
          autoCapitalize="none"
          testID="register-password"
        />
        <TextField
          label="Şifre Tekrar"
          value={form.confirmPassword}
          onChangeText={(value) => updateField("confirmPassword", value)}
          placeholder="Şifreyi tekrar girin"
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
            <ThemedText type="smallBold">E-posta gönderildi</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {successMessage}
            </ThemedText>
          </View>
        ) : null}

        <PrimaryButton
          label={isSubmitting ? "Kaydediliyor..." : "Hesap Oluştur"}
          onPress={() => {
            void handleSubmit();
          }}
          disabled={isSubmitting}
          testID="register-submit"
        />

        <View style={styles.footerRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Hesabınız var mı?
          </ThemedText>
          <Pressable onPress={() => router.replace("/account")} testID="register-go-to-login">
            <ThemedText type="linkPrimary">Giriş Yap</ThemedText>
          </Pressable>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  authShell: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 16,
  },
  authSwitchRow: {
    flexDirection: "row",
    gap: 10,
  },
  authSwitchPill: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  authSwitchGhost: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  authIntroBlock: {
    gap: 6,
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
