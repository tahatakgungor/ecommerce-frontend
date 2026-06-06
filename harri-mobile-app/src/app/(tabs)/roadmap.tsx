import { View, StyleSheet } from "react-native";
import * as ExpoLinking from "expo-linking";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { isPreviewLikeVariant } from "@/config/app-variant";
import { activeTenant } from "@/domain/active-tenant";
import { useCouponOffers } from "@/modules/coupons/use-coupon-offers";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";

export default function RoadmapScreen() {
  const canShowQaActions = isPreviewLikeVariant();
  const { data: offers, isLoading, error } = useCouponOffers();
  const { data: siteSettings } = useSiteSettings();

  return (
    <ScreenShell>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Firsatlar
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Ucretsiz kargo, kuponlar ve ozel teklifleri tek tab altinda toplayan musteri odakli yuzey.
        </ThemedText>
      </View>

      <View style={[styles.offerCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">Kargo avantaji</ThemedText>
        <ThemedText type="default" style={styles.offerTitle}>
          {siteSettings.freeShippingThreshold} TL ve uzeri siparislerde teslimat ucretsiz
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Standart kargo ucreti {siteSettings.defaultShippingFee} TL olarak hesaplanir.
        </ThemedText>
      </View>

      {isLoading ? <ThemedText type="small">Kuponlar yukleniyor...</ThemedText> : null}
      {error ? <ThemedText type="small">{error}</ThemedText> : null}

      {offers.map((offer) => (
        <View
          key={offer.id}
          style={[styles.offerCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
        >
          <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
            {offer.couponCode}
          </ThemedText>
          <ThemedText type="default" style={styles.offerTitle}>
            %{offer.discountPercentage} indirim
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Min. {offer.minimumAmount} TL sipariste kullan. Durum: {offer.status}
          </ThemedText>
        </View>
      ))}

      {canShowQaActions ? (
        <View style={styles.qaCard}>
          <ThemedText type="smallBold">Preview QA</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Deep link callback smoke ve pending session senaryolari icin gizli QA ekranini acar.
          </ThemedText>
          <PrimaryButton
            label="QA Checkout Smoke"
            onPress={() => {
              void ExpoLinking.openURL(ExpoLinking.createURL("/qa/checkout-smoke"));
            }}
            variant="outline"
          />
        </View>
      ) : null}
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
  offerCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 8,
  },
  offerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 800,
  },
  qaCard: {
    gap: 12,
  },
});
