import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { confirmPasswordReset } from "@/modules/auth/api";
import { resolveResetPasswordToken } from "@/modules/auth/reset-token";
import type { ResetPasswordPayload } from "@/modules/auth/types";
import { validateResetPasswordPayload } from "@/modules/auth/validators";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[]; resetToken?: string | string[] }>();
  const token = useMemo(() => resolveResetPasswordToken(params), [params]);
  const [form, setForm] = useState<Omit<ResetPasswordPayload, "token">>({
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const payload: ResetPasswordPayload = {
      token,
      password: form.password,
      confirmPassword: form.confirmPassword,
    };
    const validationError = validateResetPasswordPayload(payload);
    if (validationError) {
      setSuccessMessage(null);
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const message = await confirmPasswordReset(payload);
      setSuccessMessage(message);
      setForm({
        password: "",
        confirmPassword: "",
      });
    } catch (nextError) {
      setSuccessMessage(null);
      setError(nextError instanceof Error ? nextError.message : "Sifre guncellenemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenShell>
      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold" style={styles.eyebrow}>
          SIFRE YENILEME
        </ThemedText>
        <ThemedText type="subtitle" style={styles.title}>
          Yeni sifrenizi belirleyin
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Bu ekran e-posta baglantisindan gelen token ile calisir. Query, path veya hash icindeki token degerleri kabul edilir; token yoksa islem bilincli olarak bloklanir.
        </ThemedText>

        <TextField
          label="Yeni Sifre"
          value={form.password}
          onChangeText={(value) => setForm((current) => ({ ...current, password: value }))}
          placeholder="En az 6 karakter"
          secureTextEntry
          autoCapitalize="none"
        />
        <TextField
          label="Sifre Tekrar"
          value={form.confirmPassword}
          onChangeText={(value) => setForm((current) => ({ ...current, confirmPassword: value }))}
          placeholder="Sifreyi tekrar girin"
          secureTextEntry
          autoCapitalize="none"
        />

        {error ? (
          <ThemedText type="small" style={styles.errorText}>
            {error}
          </ThemedText>
        ) : null}
        {!token ? (
          <View style={[styles.noticeCard, { backgroundColor: "#fff7e8", borderColor: "#efc17c" }]}>
            <ThemedText type="smallBold" style={{ color: "#9a5b13" }}>
              Gecerli link bekleniyor
            </ThemedText>
            <ThemedText type="small" style={{ color: "#9a5b13" }}>
              E-postadaki sifre yenileme baglantisini dogrudan acin. Eksik veya bozulmus token ile sifre degistirme acilmaz.
            </ThemedText>
          </View>
        ) : null}
        {successMessage ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Sifre guncellendi</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {successMessage}
            </ThemedText>
          </View>
        ) : null}

        <PrimaryButton
          label={isSubmitting ? "Kaydediliyor..." : "Yeni Sifreyi Kaydet"}
          onPress={() => {
            void handleSubmit();
          }}
          disabled={isSubmitting || !token}
          testID="reset-password-submit"
        />
        <PrimaryButton
          label="Hesaba Don"
          onPress={() => router.replace("/account")}
          variant="outline"
          testID="reset-password-go-to-account"
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 22,
    gap: 14,
  },
  eyebrow: {
    color: activeTenant.palette.primary,
    letterSpacing: 1,
  },
  title: {
    lineHeight: 40,
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  errorText: {
    color: "#b42318",
  },
});
