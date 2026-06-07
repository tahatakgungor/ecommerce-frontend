import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { CommercePageHeader } from "@/components/commerce-page-header";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { confirmPasswordChange, requestPasswordChange } from "@/modules/auth/api";
import { useSession } from "@/modules/auth/session-provider";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { isAuthenticated } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeStep, setIsCodeStep] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isCodeStep || cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown, isCodeStep]);

  const handleRequestCode = async () => {
    setError(null);
    if (currentPassword.length < 6 || newPassword.length < 6) {
      setSuccessMessage(null);
      setError("Mevcut ve yeni şifre en az 6 karakter olmalı.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSuccessMessage(null);
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setIsSubmitting(true);
    try {
      const nextMessage = await requestPasswordChange({
        currentPassword,
        newPassword,
      });
      setSuccessMessage(nextMessage);
      setIsCodeStep(true);
      setCooldown(90);
    } catch (nextError) {
      setSuccessMessage(null);
      setError(nextError instanceof Error ? nextError.message : "Kod gönderilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setError(null);
    if (!verificationCode.trim()) {
      setSuccessMessage(null);
      setError("Doğrulama kodu gerekli.");
      return;
    }

    setIsSubmitting(true);
    try {
      const nextMessage = await confirmPasswordChange({
        code: verificationCode,
      });
      setSuccessMessage(nextMessage);
      setIsCodeStep(false);
      setCooldown(0);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setVerificationCode("");
    } catch (nextError) {
      setSuccessMessage(null);
      setError(nextError instanceof Error ? nextError.message : "Kod doğrulanamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <ScreenShell>
        <ThemedText type="small">Bu ekran için önce giriş yapın.</ThemedText>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <CommercePageHeader
        title="Şifre"
        description="Şifreni güvenli şekilde güncellemek için doğrulama kodunu kullan."
        backLabel="Hesaba dön"
        onPressBack={() => router.push("/account")}
      />

      <View style={[styles.formCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <TextField label="Mevcut Şifre" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoCapitalize="none" testID="change-password-current" />
        <TextField label="Yeni Şifre" value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" testID="change-password-next" />
        <TextField label="Şifre Tekrar" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" testID="change-password-confirm" />

        {isCodeStep ? (
          <>
            <TextField label="Doğrulama Kodu" value={verificationCode} onChangeText={setVerificationCode} autoCapitalize="none" testID="change-password-code" />
            <View style={styles.linkRow}>
              <Pressable disabled={cooldown > 0 || isSubmitting} onPress={() => void handleRequestCode()}>
                <ThemedText type="linkPrimary">
                  {cooldown > 0 ? `Kodu Tekrar Gönder (${cooldown}s)` : "Kodu Tekrar Gönder"}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsCodeStep(false);
                  setVerificationCode("");
                  setCooldown(0);
                }}
              >
                <ThemedText type="linkPrimary">Geri Dön</ThemedText>
              </Pressable>
            </View>
          </>
        ) : null}

        {error ? (
          <ThemedText type="small" style={styles.errorText}>
            {error}
          </ThemedText>
        ) : null}
        {successMessage ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">{isCodeStep ? "Kod gönderildi" : "Şifre güncellendi"}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {successMessage}
            </ThemedText>
          </View>
        ) : null}
        <PrimaryButton
          label={isSubmitting ? "İşleniyor..." : isCodeStep ? "Kaydet" : "Kod Gönder"}
          onPress={() => void (isCodeStep ? handleConfirm() : handleRequestCode())}
          disabled={isSubmitting}
          testID="change-password-submit"
        />
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
  formCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
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
});
