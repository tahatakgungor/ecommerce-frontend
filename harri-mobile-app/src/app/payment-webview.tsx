import { useEffect } from "react";
import { ActivityIndicator, Linking, Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { buildPaymentHtmlDocument, shouldDelegatePaymentUrl } from "@/modules/checkout/payment-callback";
import { useCheckout } from "@/modules/checkout/checkout-provider";

export default function PaymentWebViewScreen() {
  const router = useRouter();
  const { paymentMarkup, pendingPayment, clearPaymentMarkup } = useCheckout();

  useEffect(() => () => clearPaymentMarkup(), [clearPaymentMarkup]);

  if (!pendingPayment) {
    return (
      <ScreenShell>
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Aktif checkout oturumu bulunamadi</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Deep link donusu icin once checkout oturumu baslatilmis olmali.
          </ThemedText>
          <PrimaryButton label="Checkout Ekranina Don" onPress={() => router.replace("/checkout")} />
        </View>
      </ScreenShell>
    );
  }

  if (!paymentMarkup) {
    return (
      <ScreenShell>
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Odeme formu bellegi temizlendi</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Uygulama yeniden yuklendiysa bu beklenen durum. Guvenlik geregi iyzico HTML'i cihaz storage'ina yazilmiyor.
          </ThemedText>
          <PrimaryButton label="Checkout'u Yeniden Baslat" onPress={() => router.replace("/checkout")} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scroll={false}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Odeme Sayfasi
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          WebView sadece odeme izolasyonu icin kullaniliyor. Diger checkout state uygulama tarafinda kalir.
        </ThemedText>
      </View>

      <View style={[styles.webViewShell, { borderColor: activeTenant.palette.border }]}>
        <WebView
          source={{ html: buildPaymentHtmlDocument(paymentMarkup), baseUrl: "https://serravit.com" }}
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
            </View>
          )}
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
          allowsBackForwardNavigationGestures={Platform.OS === "ios"}
          style={styles.webView}
        />
      </View>

      <PrimaryButton label="Checkout Ekranina Don" onPress={() => router.replace("/checkout")} variant="outline" />
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
  webViewShell: {
    flex: 1,
    minHeight: 520,
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
    backgroundColor: "#ffffff",
  },
});
