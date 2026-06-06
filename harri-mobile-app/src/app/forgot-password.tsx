import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { requestPasswordReset } from "@/modules/auth/api";
import { validateForgotPasswordPayload } from "@/modules/auth/validators";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const validationError = validateForgotPasswordPayload({ email });
    if (validationError) {
      setSuccessMessage(null);
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const message = await requestPasswordReset({ email });
      setSuccessMessage(message);
    } catch (nextError) {
      setSuccessMessage(null);
      setError(nextError instanceof Error ? nextError.message : "Sifirlama istegi basarisiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenShell>
      <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold" style={styles.eyebrow}>
          ŞİFRE DESTEĞİ
        </ThemedText>
        <ThemedText type="subtitle" style={styles.title}>
          Şifre yenile
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Bağlantı e-postana gönderilir.
        </ThemedText>
      </View>

      <View style={[styles.formCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <TextField
          label="E-posta"
          value={email}
          onChangeText={setEmail}
          placeholder="ornek@serravit.com"
          autoCapitalize="none"
          keyboardType="email-address"
          testID="forgot-password-email"
        />

        {error ? (
          <ThemedText type="small" style={styles.errorText}>
            {error}
          </ThemedText>
        ) : null}
        {successMessage ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Bağlantı gönderildi</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {successMessage}
            </ThemedText>
          </View>
        ) : null}

        <PrimaryButton
          label={isSubmitting ? "Gönderiliyor..." : "Bağlantı Gönder"}
          onPress={() => {
            void handleSubmit();
          }}
          disabled={isSubmitting}
          testID="forgot-password-submit"
        />

        <View style={styles.footerRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Şifrenizi hatırladınız mı?
          </ThemedText>
          <Pressable onPress={() => router.replace("/account")} testID="forgot-password-go-to-login">
            <ThemedText type="linkPrimary">Giriş Yap</ThemedText>
          </Pressable>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 22,
    gap: 10,
  },
  eyebrow: {
    color: activeTenant.palette.primary,
    letterSpacing: 1,
  },
  title: {
    lineHeight: 40,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "#b42318",
  },
});
