import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { FilterChip } from "@/components/filter-chip";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { confirmCheckoutPayment } from "@/modules/checkout/api";
import { resolvePaymentConfirmationPayload } from "@/modules/checkout/payment-callback";
import { isPendingPaymentSessionExpired, validatePendingPaymentSession } from "@/modules/checkout/session-guard";
import { useCheckout } from "@/modules/checkout/checkout-provider";
import { useCart } from "@/modules/cart/cart-provider";

const MAX_RETRIES = 3;

type PaymentState = "processing" | "success" | "error";

export default function PaymentResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    checkoutSessionId?: string | string[];
    token?: string | string[];
    status?: string | string[];
    error?: string | string[];
  }>();
  const { pendingPayment, clearPendingPayment } = useCheckout();
  const { clearCart } = useCart();

  const [state, setState] = useState<PaymentState>("processing");
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [invoice, setInvoice] = useState("");
  const isMounted = useRef(true);
  const hasStarted = useRef(false);

  const checkoutSessionId =
    Array.isArray(params.checkoutSessionId) ? params.checkoutSessionId[0] || "" : params.checkoutSessionId || "";
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

      const sessionError = validatePendingPaymentSession(pendingPayment, checkoutSessionId);
      if (sessionError) {
        if (isPendingPaymentSessionExpired(pendingPayment)) {
          await clearPendingPayment();
        }
        setErrorMessage(sessionError);
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
  }, [callbackError, checkoutSessionId, clearCart, clearPendingPayment, pendingPayment, token]);

  return (
    <ScreenShell>
      <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.primary }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Feather name={state === "success" ? "check-circle" : state === "error" ? "alert-circle" : "refresh-cw"} size={14} color="#ffffff" />
            <ThemedText type="smallBold" style={styles.heroBadgeText}>
              Odeme Sonucu
            </ThemedText>
          </View>
          <View style={styles.heroTrustPill}>
            <ThemedText type="smallBold" style={styles.heroTrustText}>
              Session korumali
            </ThemedText>
          </View>
        </View>
        <ThemedText type="subtitle" style={styles.title}>
          {state === "success" ? "Siparis dogrulandi" : state === "error" ? "Odeme tamamlanamadi" : "Odeme dogrulaniyor"}
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        {state === "processing" ? (
          <>
            <ThemedText type="smallBold">Odemeniz dogrulaniyor</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {retryCount > 0
                ? `Iyzico sonucu tekrar deneniyor. Deneme: ${retryCount + 1}/${MAX_RETRIES + 1}`
                : "Odeme sonucu kontrol ediliyor."}
            </ThemedText>
            {status ? (
              <ThemedText type="small" themeColor="textSecondary">
                Gateway durum bilgisi: {status}
              </ThemedText>
            ) : null}
            <View style={styles.progressList}>
              <View style={[styles.progressStep, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <Feather name="shield" size={16} color={activeTenant.palette.primary} />
                <View style={styles.progressCopy}>
                  <ThemedText type="smallBold">Oturum eslesmesi kontrolu</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Odeme donusu kontrol ediliyor.
                  </ThemedText>
                </View>
              </View>
              <View style={[styles.progressStep, { backgroundColor: "#f7faf7" }]}>
                <Feather name="refresh-cw" size={16} color={activeTenant.palette.primary} />
                <View style={styles.progressCopy}>
                  <ThemedText type="smallBold">Odeme sonucu teyidi</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Gerekirse islem tekrar denenir.
                  </ThemedText>
                </View>
              </View>
            </View>
          </>
        ) : null}

        {state === "success" ? (
          <>
            <ThemedText type="smallBold">Siparis dogrulandi</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Sepet temizlendi.
            </ThemedText>
            <View style={styles.statusMetrics}>
              {orderId ? (
                <View style={[styles.statusMetricCard, { backgroundColor: "#f7faf7" }]}>
                  <ThemedText type="small">Siparis</ThemedText>
                  <ThemedText type="smallBold">{orderId}</ThemedText>
                </View>
              ) : null}
              {invoice ? (
                <View style={[styles.statusMetricCard, { backgroundColor: "#fff8f1" }]}>
                  <ThemedText type="small">Fatura</ThemedText>
                  <ThemedText type="smallBold">{invoice}</ThemedText>
                </View>
              ) : null}
            </View>
            <View style={[styles.followUpCard, { backgroundColor: activeTenant.palette.primarySoft }]}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                Siradaki adim
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Siparis detayinda kargo ve fatura bilgilerini gorebilirsin.
              </ThemedText>
            </View>
            <View style={[styles.followUpCard, { backgroundColor: "#f7faf7" }]}>
              <ThemedText type="smallBold">Sonrasi</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Yorum, iade ve bildirimler hesabim ekranindan devam eder.
              </ThemedText>
            </View>
            <View style={styles.actionRow}>
              <FilterChip compact label="Anasayfa" onPress={() => router.replace("/")} />
              <FilterChip compact label="Hesabim" onPress={() => router.replace("/account")} />
              <FilterChip compact label="Bildirimler" onPress={() => router.replace("/notifications" as never)} />
              <FilterChip compact label="Firsatlar" onPress={() => router.replace("/roadmap")} />
            </View>
            {orderId ? (
              <PrimaryButton label="Siparisi Gor" onPress={() => router.replace(`/orders/${orderId}`)} />
            ) : (
              <PrimaryButton label="Anasayfaya Don" onPress={() => router.replace("/")} />
            )}
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
            <View style={[styles.followUpCard, { backgroundColor: "#fff6ed" }]}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.accent }}>
                Tekrar dene
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Dilersen checkout'u tekrar dene ya da destek ekibine yaz.
              </ThemedText>
            </View>
            <View style={styles.progressList}>
              <View style={[styles.progressStep, { backgroundColor: "#fff8f1" }]}>
                <Feather name="rotate-ccw" size={16} color={activeTenant.palette.accent} />
                <View style={styles.progressCopy}>
                  <ThemedText type="smallBold">Sepetten devam edebilirsin</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Sepetteki urunler durur.
                  </ThemedText>
                </View>
              </View>
              <View style={[styles.progressStep, { backgroundColor: "#f7faf7" }]}>
                <Feather name="life-buoy" size={16} color={activeTenant.palette.primary} />
                <View style={styles.progressCopy}>
                  <ThemedText type="smallBold">Destek hatti hazir</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Sorun surerse destek ekibine ulas.
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.actionRow}>
              <FilterChip compact label="Sepet" onPress={() => router.replace("/cart")} />
              <FilterChip compact label="Destek" onPress={() => router.replace("/support")} />
              <FilterChip compact label="Hesabim" onPress={() => router.replace("/account")} />
            </View>
            <PrimaryButton label="Checkout'a Don" onPress={() => router.replace("/checkout")} />
          </>
        ) : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 30,
    padding: 22,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroBadgeText: {
    color: "#ffffff",
  },
  heroTrustPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(11,23,14,0.18)",
  },
  heroTrustText: {
    color: "#d8f5df",
  },
  title: {
    color: "#ffffff",
    lineHeight: 38,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  followUpCard: {
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  statusMetrics: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  statusMetricCard: {
    minWidth: 132,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  progressList: {
    gap: 10,
  },
  progressStep: {
    borderRadius: 18,
    padding: 14,
    gap: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  progressCopy: {
    flex: 1,
    gap: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
});
