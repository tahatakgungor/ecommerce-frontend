import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Linking, Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { formatTryPrice } from "@harri/commerce-contracts";

import { BackLink } from "@/components/back-link";
import { CommercePageHeader } from "@/components/commerce-page-header";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { buildPaymentHtmlDocument, shouldDelegatePaymentUrl } from "@/modules/checkout/payment-callback";
import { readVolatilePaymentMarkup, useCheckout } from "@/modules/checkout/checkout-provider";

type PaymentViewState = "loading" | "ready" | "error";

export default function PaymentWebViewScreen() {
  const router = useRouter();
  const { paymentMarkup, pendingPayment, clearPaymentMarkup, clearPendingPayment } = useCheckout();
  const [viewState, setViewState] = useState<PaymentViewState>("loading");
  const [frameHeight, setFrameHeight] = useState(620);
  const [loadMessage, setLoadMessage] = useState("");
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolvedPaymentMarkup = paymentMarkup || readVolatilePaymentMarkup();

  useEffect(() => () => clearPaymentMarkup(), [clearPaymentMarkup]);

  useEffect(() => {
    if (!resolvedPaymentMarkup) {
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
  }, [resolvedPaymentMarkup]);

  const paymentDocument = useMemo(() => (resolvedPaymentMarkup ? buildPaymentHtmlDocument(resolvedPaymentMarkup) : ""), [resolvedPaymentMarkup]);

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

  if (!resolvedPaymentMarkup) {
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
      <BackLink label="Checkout'a dön" onPress={() => router.replace("/checkout")} />
      <CommercePageHeader
        title="Ödeme adımı"
        meta={pendingPayment ? `${pendingPayment.itemCount} ürün • ${formatTryPrice(pendingPayment.totalAmount)}` : "Ödeme"}
      />

      <View style={[styles.flowCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.flowRow}>
          <View style={styles.flowStep}>
            <View style={[styles.flowDot, { backgroundColor: activeTenant.palette.primary }]}><ThemedText type="smallBold" style={styles.flowDotText}>1</ThemedText></View>
            <ThemedText type="smallBold">Sipariş</ThemedText>
          </View>
          <View style={styles.flowDivider} />
          <View style={styles.flowStep}>
            <View style={[styles.flowDot, { backgroundColor: activeTenant.palette.accent }]}><ThemedText type="smallBold" style={styles.flowDotText}>2</ThemedText></View>
            <ThemedText type="smallBold">Kart onayı</ThemedText>
          </View>
          <View style={styles.flowDivider} />
          <View style={styles.flowStep}>
            <View style={[styles.flowDot, { backgroundColor: "#dfe9df" }]}><ThemedText type="smallBold" style={styles.flowDotTextMuted}>3</ThemedText></View>
            <ThemedText type="smallBold">Sonuç</ThemedText>
          </View>
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

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.helperHeader}>
          <ThemedText type="smallBold">Ödeme burada tamamlanır</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            İşlem bitince sonuç ekranı otomatik açılır.
          </ThemedText>
        </View>
        {loadMessage ? (
          <ThemedText type="small" themeColor={viewState === "error" ? undefined : "textSecondary"} style={viewState === "error" ? { color: "#b42318" } : undefined}>
            {loadMessage}
          </ThemedText>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            Kart ve 3D Secure birkaç saniye sürebilir.
          </ThemedText>
        )}
        <View style={styles.footerActions}>
          <PrimaryButton
            label="Checkout'a dön"
            onPress={() => {
              void clearPendingPayment().finally(() => {
                router.replace("/checkout");
              });
            }}
            variant="outline"
            style={styles.footerButton}
          />
          <PrimaryButton label="Sepete dön" onPress={() => router.replace("/cart")} variant="outline" style={styles.footerButton} />
        </View>
        {viewState === "error" ? (
          <PrimaryButton label="Tekrar dene" onPress={() => router.replace("/payment-webview")} />
        ) : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flowCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  flowRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  flowStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  flowDot: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  flowDotText: {
    color: "#ffffff",
    fontSize: 11,
    lineHeight: 12,
  },
  flowDotTextMuted: {
    color: "#102117",
    fontSize: 11,
    lineHeight: 12,
  },
  flowDivider: {
    width: 14,
    height: 1,
    backgroundColor: "#d8e5d8",
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
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
  helperHeader: {
    gap: 4,
  },
});
