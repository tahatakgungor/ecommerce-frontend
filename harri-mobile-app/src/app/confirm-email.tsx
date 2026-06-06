import { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useSession } from "@/modules/auth/session-provider";

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = Array.isArray(params.token) ? params.token[0] || "" : params.token || "";
  const { completeEmailConfirmation } = useSession();
  const [message, setMessage] = useState("Baglanti kontrol ediliyor...");
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!token.trim()) {
      setError("Dogrulama baglantisi eksik veya gecersiz.");
      setMessage("");
      return;
    }

    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    (async () => {
      try {
        const result = await completeEmailConfirmation(token);
        setCompleted(true);
        setMessage(result.message);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "E-posta dogrulanamadi.");
        setMessage("");
      }
    })();
  }, [completeEmailConfirmation, token]);

  return (
    <ScreenShell>
      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold" style={styles.eyebrow}>
          EMAIL DOGRULAMA
        </ThemedText>
        <ThemedText type="subtitle" style={styles.title}>
          E-posta onayla
        </ThemedText>
        {message ? (
          <ThemedText type="small" themeColor="textSecondary" testID={completed ? "confirm-email-success" : "confirm-email-pending"}>
            {message}
          </ThemedText>
        ) : null}
        {error ? (
          <ThemedText type="small" style={styles.errorText} testID="confirm-email-error">
            {error}
          </ThemedText>
        ) : null}
        <PrimaryButton
          label={completed ? "Hesaba Gec" : "Giris Ekrani"}
          onPress={() => router.replace("/account")}
          variant={completed ? "solid" : "outline"}
          testID="confirm-email-go-account"
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
    gap: 12,
  },
  eyebrow: {
    color: activeTenant.palette.primary,
    letterSpacing: 1,
  },
  title: {
    lineHeight: 40,
  },
  errorText: {
    color: "#b42318",
  },
});
