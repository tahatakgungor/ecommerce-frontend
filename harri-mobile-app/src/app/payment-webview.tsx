import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Linking, Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { formatTryPrice } from "@harri/commerce-contracts";

import { FilterChip } from "@/components/filter-chip";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { buildPaymentHtmlDocument, shouldDelegatePaymentUrl } from "@/modules/checkout/payment-callback";
import { useCheckout } from "@/modules/checkout/checkout-provider";

type PaymentViewState = "loading" | "ready" | "error";

export default function PaymentWebViewScreen() {
  const router = useRouter();
  const { paymentMarkup, pendingPayment, clearPaymentMarkup } = useCheckout();
  const [viewState, setViewState] = useState<PaymentViewState>("loading");
  const [frameHeight, setFrameHeight] = useState(620);
  const [loadMessage, setLoadMessage] = useState("");
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearPaymentMarkup(), [clearPaymentMarkup]);

  useEffect(() => {
    if (!paymentMarkup) {
      return;
    }

    setViewState("loading");
    setLoadMessage("");
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    loadTimeoutRef.current = setTimeout(() => {
      setLoadMessage("Ödeme ekranı geç açılırsa tekrar deneyebilir veya checkout'a dönebilirsin.");
    }, 5000);

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [paymentMarkup]);

  const paymentDocument = useMemo(() => (paymentMarkup ? buildPaymentHtmlDocument(paymentMarkup) : ""), [paymentMarkup]);

  if (!pendingPayment) {
    return (
      <ScreenShell>
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Aktif ödeme oturumu bulunamadı</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Ödeme için önce checkout adımını başlat.
          </ThemedText>
          <PrimaryButton label="Checkout'a dön" onPress={() => router.replace("/checkout")} />
        </View>
      </ScreenShell>
    );
  }

  if (!paymentMarkup) {
    return (
      <ScreenShell>
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Ödeme oturumu yenilenmeli</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Güvenlik nedeniyle ödeme formu bellekte tutuluyor. Checkout'a dönüp yeniden başlatabilirsin.
          </ThemedText>
          <PrimaryButton label="Checkout'u yeniden başlat" onPress={() => router.replace("/checkout")} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scroll={false}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Ödeme
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Kart ve 3D Secure adımları bu ekranda tamamlanır.
        </ThemedText>
      </View>

      <View style={[styles.statusCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
              {viewState === "ready" ? "Hazır" : viewState === "error" ? "Sorun var" : "Yükleniyor"}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {pendingPayment.itemCount} ürün • {formatTryPrice(pendingPayment.totalAmount)}
          </ThemedText>
        </View>

        <View style={styles.quickActions}>
          <FilterChip compact label="Checkout" onPress={() => router.replace("/checkout")} />
          <FilterChip compact label="Sepet" onPress={() => router.replace("/cart")} />
        </View>
      </View>

      <View style={[styles.webViewShell, { borderColor: activeTenant.palette.border, minHeight: Math.max(520, frameHeight) }]}>
        <WebView
          source={{ html: paymentDocument, baseUrl: "https://serravit.com" }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          setSupportMultipleWindows={false}
          mixedContentMode="never"
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color={activeTenant.palette.primary} />
              <ThemedText type="small" themeColor="textSecondary">
                Ödeme ekranı hazırlanıyor...
              </ThemedText>
            </View>
          )}
          onMessage={(event) => {
            try {
              const payload = JSON.parse(event.nativeEvent.data || "{}") as { type?: string; height?: number };
              if (payload.type === "ready" || payload.type === "dom-ready") {
                setViewState("ready");
                setLoadMessage("");
              }
              if (payload.type === "height" && typeof payload.height === "number" && payload.height > 0) {
                setFrameHeight(Math.max(520, Math.min(payload.height + 24, 1200)));
              }
            } catch {
              setViewState("ready");
            }
          }}
          onShouldStartLoadWithRequest={(request) => {
            if (shouldDelegatePaymentUrl(request.url)) {
              void Linking.openURL(request.url);
              return false;
            }
            return true;
          }}
          onNavigationStateChange={(state) => {
            if (shouldDelegatePaymentUrl(state.url)) {
              void Linking.openURL(state.url);
            }
          }}
          onLoadEnd={() => {
            setViewState((current) => (current === "error" ? current : "ready"));
          }}
          onError={() => {
            setViewState("error");
            setLoadMessage("Ödeme sayfası açılamadı. Checkout'a dönüp tekrar başlatabilirsin.");
          }}
          onHttpError={() => {
            setViewState("error");
            setLoadMessage("Ödeme sağlayıcısına bağlanırken sorun oluştu.");
          }}
          allowsBackForwardNavigationGestures={Platform.OS === "ios"}
          style={styles.webView}
        />
      </View>

      {loadMessage ? (
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="small" themeColor={viewState === "error" ? undefined : "textSecondary"} style={viewState === "error" ? { color: "#b42318" } : undefined}>
            {loadMessage}
          </ThemedText>
          <View style={styles.footerActions}>
            <PrimaryButton label="Checkout'a dön" onPress={() => router.replace("/checkout")} variant="outline" style={styles.footerButton} />
            <PrimaryButton label="Tekrar dene" onPress={() => router.replace("/payment-webview")} style={styles.footerButton} />
          </View>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
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
  statusCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  webViewShell: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  webView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
  },
  footerActions: {
    flexDirection: "row",
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
