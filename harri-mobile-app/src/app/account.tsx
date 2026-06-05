import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useSession } from "@/modules/auth/session-provider";

export default function AccountScreen() {
  const { user, isAuthenticated, isBootstrapping, isSubmitting, error, signIn, signOut } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);
    if (!email.trim() || !password.trim()) {
      setLocalError("E-posta ve sifre gerekli.");
      return;
    }

    try {
      await signIn({
        email: email.trim(),
        password,
      });
      setPassword("");
    } catch (nextError) {
      setLocalError(nextError instanceof Error ? nextError.message : "Login failed");
    }
  };

  if (isBootstrapping) {
    return (
      <ScreenShell>
        <ThemedText type="small">Session kontrol ediliyor...</ThemedText>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="subtitle" style={styles.title}>
          Hesap
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Session token guvenli saklamada tutulur. Mobil bundle icine admin secret veya plain credential gomulmez.
        </ThemedText>
      </View>

      {isAuthenticated && user ? (
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">{user.name || `${user.firstName} ${user.lastName}`.trim() || user.email}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {user.email}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {user.city || "Sehir yok"} / {user.country || "Ulke yok"}
          </ThemedText>
          <PrimaryButton
            label={isSubmitting ? "Cikis yapiliyor..." : "Cikis Yap"}
            onPress={() => {
              void signOut();
            }}
            disabled={isSubmitting}
            variant="outline"
          />
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <TextField
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@serravit.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextField
            label="Sifre"
            value={password}
            onChangeText={setPassword}
            placeholder="Sifreniz"
            secureTextEntry
            autoCapitalize="none"
          />
          {localError || error ? (
            <ThemedText type="small" style={{ color: "#b42318" }}>
              {localError || error}
            </ThemedText>
          ) : null}
          <PrimaryButton
            label={isSubmitting ? "Giris yapiliyor..." : "Giris Yap"}
            onPress={() => {
              void handleLogin();
            }}
            disabled={isSubmitting}
          />
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  title: {
    lineHeight: 38,
  },
});
