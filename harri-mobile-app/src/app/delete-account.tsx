import { Alert, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

import { CommercePageHeader } from "@/components/commerce-page-header";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useSession } from "@/modules/auth/session-provider";

const deleteImpacts = [
  "Sipariş geçmişin ve kayıtlı teslimat adreslerin kaldırılır.",
  "Yaptığın değerlendirmeler ve favori verilerin temizlenir.",
  "Aynı e-postaya bağlı kupon atamaları ve bülten kaydı kapatılır.",
];

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { isAuthenticated, isSubmitting, deleteAccount } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const performDelete = async () => {
    try {
      const message = await deleteAccount({ currentPassword });
      Alert.alert("Hesap silindi", message, [
        {
          text: "Tamam",
          onPress: () => router.replace("/account"),
        },
      ]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Hesap silinemedi.");
    }
  };

  const handleDelete = () => {
    setError(null);
    if (currentPassword.trim().length < 6) {
      setError("Mevcut şifreni girerek işlemi onaylaman gerekiyor.");
      return;
    }

    Alert.alert(
      "Hesabı kalıcı olarak sil",
      "Bu işlem geri alınamaz. Serravit hesabın ve ilişkili verilerin kalıcı olarak kaldırılacak.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Hesabı Sil",
          style: "destructive",
          onPress: () => {
            void performDelete();
          },
        },
      ]
    );
  };

  if (!isAuthenticated && !isSubmitting) {
    return (
      <ScreenShell>
        <CommercePageHeader title="Hesabı Sil" backLabel="Hesaba dön" onPressBack={() => router.push("/account")} />
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="small">Bu işlem için önce giriş yapman gerekiyor.</ThemedText>
          <PrimaryButton label="Hesabıma Dön" onPress={() => router.push("/account")} variant="outline" />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <CommercePageHeader
        title="Hesabı Sil"
        description="Play Store gereksinimi için hesap silme akışı uygulama içine eklendi."
        backLabel="Ayarlara dön"
        onPressBack={() => router.push("/preferences")}
      />

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={[styles.warningBadge, { backgroundColor: "#fff2f0", borderColor: "#f5c2b8" }]}>
          <Feather name="alert-triangle" size={16} color="#b42318" />
          <ThemedText type="smallBold" style={{ color: "#b42318" }}>
            Geri alınamaz işlem
          </ThemedText>
        </View>

        <View style={styles.impactList}>
          {deleteImpacts.map((item) => (
            <View key={item} style={styles.impactRow}>
              <View style={[styles.impactDot, { backgroundColor: "#b42318" }]} />
              <ThemedText type="small" themeColor="textSecondary" style={styles.impactText}>
                {item}
              </ThemedText>
            </View>
          ))}
        </View>

        <TextField
          label="Mevcut Şifre"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoCapitalize="none"
          testID="delete-account-current-password"
        />

        {error ? (
          <ThemedText type="small" style={styles.errorText}>
            {error}
          </ThemedText>
        ) : null}

        <PrimaryButton
          label={isSubmitting ? "Hesap siliniyor..." : "Hesabı Kalıcı Olarak Sil"}
          onPress={() => void handleDelete()}
          disabled={isSubmitting}
          style={styles.deleteButton}
          testID="delete-account-submit"
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  warningBadge: {
    minHeight: 42,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  impactList: {
    gap: 12,
  },
  impactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  impactDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginTop: 8,
  },
  impactText: {
    flex: 1,
  },
  errorText: {
    color: "#b42318",
  },
  deleteButton: {
    backgroundColor: "#b42318",
    borderColor: "#b42318",
  },
});
