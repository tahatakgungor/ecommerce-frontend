import { useState } from "react";
import { StyleSheet, View } from "react-native";
import * as ExpoLinking from "expo-linking";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { isPreviewLikeVariant } from "@/config/app-variant";
import { buildPaymentResultUrl } from "@/modules/checkout/payment-callback";
import { writePendingPaymentSession } from "@/modules/checkout/pending-payment-store";
import { PENDING_PAYMENT_TTL_MS } from "@/modules/checkout/session-guard";
import { useCheckout } from "@/modules/checkout/checkout-provider";
import type { PendingPaymentSession } from "@/modules/checkout/types";

function createFixturePendingPayment(now = Date.now()): PendingPaymentSession {
  return {
    checkoutSessionId: `qa-session-${now}`,
    conversationId: `qa-conversation-${now}`,
    confirmationToken: "fixture-confirmation-token",
    customerEmail: "qa+preview@test.invalid",
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + PENDING_PAYMENT_TTL_MS).toISOString(),
    subtotal: 1299.9,
    totalAmount: 1299.9,
    itemCount: 2,
  };
}

export default function CheckoutSmokeQaScreen() {
  const { pendingPayment, clearPendingPayment, hydratePendingPayment } = useCheckout();
  const [message, setMessage] = useState("");
  const isPreviewVariant = isPreviewLikeVariant();

  const openCallback = async (mode: "success" | "mismatch" | "error") => {
    let session = pendingPayment;
    if (!session) {
      const nextPendingPayment = createFixturePendingPayment();
      await writePendingPaymentSession(nextPendingPayment);
      session = await hydratePendingPayment();
    }

    if (!session?.checkoutSessionId) {
      setMessage("Pending payment session hazirlanamadi.");
      return;
    }

    const callbackUrl = buildPaymentResultUrl(ExpoLinking.createURL("/payment-result"), {
      checkoutSessionId: mode === "mismatch" ? `${session.checkoutSessionId}-mismatch` : session.checkoutSessionId,
      token: "fixture-token",
      status: mode === "error" ? undefined : "success",
      error: mode === "error" ? "callback_failed" : undefined,
    });

    await ExpoLinking.openURL(callbackUrl);
  };

  const seedFixtureSession = async () => {
    const nextPendingPayment = createFixturePendingPayment();
    await writePendingPaymentSession(nextPendingPayment);
    await hydratePendingPayment();
    setMessage(`Fixture session hazir: ${nextPendingPayment.checkoutSessionId}`);
  };

  if (!isPreviewVariant) {
    return (
      <ScreenShell>
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">QA route kapali</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Bu ekran sadece preview veya development varyantinda kullanilmalidir.
          </ThemedText>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          QA Checkout Smoke
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Preview build icinde payment-result deep link donuslerini gercek gateway beklemeden tetikler.
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">Aktif session</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {pendingPayment?.checkoutSessionId || "Yok"}
        </ThemedText>
        <PrimaryButton label="Fixture Session Hazirla" onPress={() => void seedFixtureSession()} />
        <PrimaryButton label="Success Callback Tetikle" onPress={() => void openCallback("success")} variant="outline" />
        <PrimaryButton label="Mismatch Callback Tetikle" onPress={() => void openCallback("mismatch")} variant="outline" />
        <PrimaryButton label="Error Callback Tetikle" onPress={() => void openCallback("error")} variant="outline" />
        <PrimaryButton
          label="Pending Session Temizle"
          onPress={() => {
            void clearPendingPayment();
            setMessage("Pending session temizlendi.");
          }}
          variant="outline"
        />
        {message ? (
          <ThemedText type="small" themeColor="textSecondary">
            {message}
          </ThemedText>
        ) : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  title: {
    lineHeight: 38,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
});
