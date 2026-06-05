import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { confirmCheckoutPayment } from "@/modules/checkout/api";
import { resolvePaymentConfirmationPayload } from "@/modules/checkout/payment-callback";
import { useCheckout } from "@/modules/checkout/checkout-provider";
import { useCart } from "@/modules/cart/cart-provider";

const MAX_RETRIES = 3;

type PaymentState = "processing" | "success" | "error";

export default function PaymentResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[]; status?: string | string[]; error?: string | string[] }>();
  const { pendingPayment, clearPendingPayment } = useCheckout();
  const { clearCart } = useCart();

  const [state, setState] = useState<PaymentState>("processing");
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [invoice, setInvoice] = useState("");
  const isMounted = useRef(true);
  const hasStarted = useRef(false);

  const token = Array.isArray(params.token) ? params.token[0] || "" : params.token || "";
  const status = Array.isArray(params.status) ? params.status[0] || "" : params.status || "";
  const callbackError = Array.isArray(params.error) ? params.error[0] || "" : params.error || "";

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    isMounted.current = true;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const confirmPayment = async (attempt = 0) => {
      if (!token.trim()) {
        setErrorMessage("Odeme token'i bulunamadi.");
        setState("error");
        return;
      }

      if (callbackError) {
        setErrorMessage("Odeme callback'i beklenmedik sekilde sonlandi.");
        setState("error");
        return;
      }

      const payload = resolvePaymentConfirmationPayload(token, pendingPayment);

      if (!payload.conversationId || !payload.confirmationToken) {
        setErrorMessage("Bekleyen odeme oturumu bulunamadi. Checkout'u yeniden baslatin.");
        setState("error");
        return;
      }

      try {
        const result = await confirmCheckoutPayment(payload);
        if (!isMounted.current) {
          return;
        }

        await clearPendingPayment();
        clearCart();
        setOrderId(result?.orderId || "");
        setInvoice(result?.order?.invoice || "");
        setState("success");
      } catch (error) {
        if (!isMounted.current) {
          return;
        }

        if (attempt < MAX_RETRIES) {
          const nextRetry = attempt + 1;
          setRetryCount(nextRetry);
          retryTimeout = setTimeout(() => {
            void confirmPayment(nextRetry);
          }, 2 ** nextRetry * 1000);
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "Odeme dogrulanamadi.");
        setState("error");
      }
    };

    void confirmPayment();

    return () => {
      isMounted.current = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [callbackError, clearCart, clearPendingPayment, pendingPayment, token]);

  return (
    <ScreenShell>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Odeme Sonucu
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Callback sonucu local pending session ile eslestirilir. Replay korumasi backend tarafinda conversationId + confirmation token ile calisir.
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        {state === "processing" ? (
          <>
            <ThemedText type="smallBold">Odemeniz dogrulaniyor</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {retryCount > 0
                ? `Iyzico sonucu tekrar deneniyor. Deneme: ${retryCount + 1}/${MAX_RETRIES + 1}`
                : "Iyzico callback token'i backend ile dogrulaniyor."}
            </ThemedText>
            {status ? (
              <ThemedText type="small" themeColor="textSecondary">
                Gateway durum bilgisi: {status}
              </ThemedText>
            ) : null}
          </>
        ) : null}

        {state === "success" ? (
          <>
            <ThemedText type="smallBold">Siparis dogrulandi</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Pending odeme oturumu temizlendi ve sepet sifirlandi.
            </ThemedText>
            {orderId ? <ThemedText type="small">Siparis ID: {orderId}</ThemedText> : null}
            {invoice ? <ThemedText type="small">Fatura No: {invoice}</ThemedText> : null}
            <PrimaryButton label="Anasayfaya Don" onPress={() => router.replace("/")} />
          </>
        ) : null}

        {state === "error" ? (
          <>
            <ThemedText type="smallBold" style={{ color: "#b42318" }}>
              Odeme dogrulanamadi
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {errorMessage || "Checkout oturumunu yeniden baslatmak gerekiyor."}
            </ThemedText>
            <PrimaryButton label="Checkout'a Don" onPress={() => router.replace("/checkout")} />
          </>
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
