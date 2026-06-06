import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import * as ExpoLinking from "expo-linking";
import { Feather } from "@expo/vector-icons";

import { FilterChip } from "@/components/filter-chip";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useSession } from "@/modules/auth/session-provider";
import { useCart } from "@/modules/cart/cart-provider";
import { validateCouponForCheckout } from "@/modules/coupons/logic";
import type { CouponOffer } from "@/modules/coupons/types";
import { useCouponOffers } from "@/modules/coupons/use-coupon-offers";
import { calculateCheckoutTotals } from "@/modules/checkout/checkout-logic";
import { useCheckout } from "@/modules/checkout/checkout-provider";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useSession();
  const { items } = useCart();
  const { pendingPayment, isInitializing, error, startCheckout, clearPendingPayment } = useCheckout();
  const { data: siteSettings, error: siteSettingsError } = useSiteSettings();
  const { data: couponOffers, isLoading: isCouponsLoading, error: couponsError } = useCouponOffers();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponOffer | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const totals = useMemo(
    () =>
      calculateCheckoutTotals(items, {
        ...siteSettings,
        coupon: appliedCoupon,
      }),
    [appliedCoupon, items, siteSettings]
  );
  const highlightedCoupons = couponOffers.slice(0, 3);

  useEffect(() => {
    const fullName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ");

    setName((current) => current || fullName || "");
    setEmail((current) => current || user?.email || "");
    setContact((current) => current || user?.phone || "");
    setAddress((current) => current || user?.address || "");
    setCity((current) => current || user?.city || "Istanbul");
    setCountry((current) => current || user?.country || "Turkey");
    setZipCode((current) => current || user?.zipCode || "");
  }, [user]);

  useEffect(() => {
    if (!appliedCoupon) {
      return;
    }

    const validation = validateCouponForCheckout(items, appliedCoupon, email.trim() || user?.email || "");
    if (!validation.ok) {
      setAppliedCoupon(null);
      setCouponMessage(validation.reason);
    }
  }, [appliedCoupon, email, items, user?.email]);

  const handleApplyCoupon = () => {
    const normalizedCode = couponCode.trim();
    if (!normalizedCode) {
      setCouponMessage("Kupon kodu girin.");
      return;
    }

    const coupon = couponOffers.find((item) => item.couponCode.toLowerCase() === normalizedCode.toLowerCase());
    if (!coupon) {
      setCouponMessage("Gecerli bir kupon kodu bulunamadi.");
      return;
    }

    const validation = validateCouponForCheckout(items, coupon, email.trim() || user?.email || "");
    if (!validation.ok) {
      setCouponMessage(validation.reason);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponCode(coupon.couponCode);
    setCouponMessage(`${coupon.title} uygulandi.`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("Kupon kaldirildi.");
  };

  const handleStartCheckout = async () => {
    if (items.length === 0) {
      setFormError("Sepet bosken checkout baslatilamaz.");
      return;
    }

    const requiredValues = [name, email, contact, address, city, country];
    if (requiredValues.some((value) => !value.trim())) {
      setFormError("Teslimat ve iletisim alanlarini doldurun.");
      return;
    }

    setFormError(null);

    try {
      const mobileReturnUrl = ExpoLinking.createURL("/payment-result");
      await startCheckout(
        {
          name,
          email,
          contact,
          address,
          city,
          country,
          zipCode,
          orderNote,
          couponCode: appliedCoupon?.couponCode,
        },
        items,
        totals,
        mobileReturnUrl
      );
      router.push("/payment-webview");
    } catch (nextError) {
      setFormError(nextError instanceof Error ? nextError.message : "Checkout baslatilamadi.");
    }
  };

  return (
    <ScreenShell>
      <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.primary }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Feather name="shield" size={14} color="#ffffff" />
            <ThemedText type="smallBold" style={styles.heroBadgeText}>
              Guvenli checkout
            </ThemedText>
          </View>
          <View style={styles.heroTrustRow}>
            <Feather name="lock" size={14} color="#d8f5df" />
            <ThemedText type="smallBold" style={styles.heroTrustText}>
              Deep link donuslu
            </ThemedText>
          </View>
        </View>
        <ThemedText type="subtitle" style={styles.heroTitle}>
          Odemeden once son kontrol
        </ThemedText>
        <View style={styles.heroMetrics}>
          <View style={styles.heroMetricCard}>
            <ThemedText type="smallBold" style={styles.heroMetricValue}>
              {items.length}
            </ThemedText>
            <ThemedText type="small" style={styles.heroMetricLabel}>
              farkli urun
            </ThemedText>
          </View>
          <View style={styles.heroMetricCard}>
            <ThemedText type="smallBold" style={styles.heroMetricValue}>
              {totals.totalText}
            </ThemedText>
            <ThemedText type="small" style={styles.heroMetricLabel}>
              tahmini toplam
            </ThemedText>
          </View>
        </View>
      </View>

      {pendingPayment ? (
        <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.border }]}>
          <View style={styles.noticeCopy}>
            <ThemedText type="smallBold">Bekleyen odeme oturumu bulundu</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{pendingPayment.itemCount} urunluk oturum bekliyor.</ThemedText>
          </View>
          <PrimaryButton
            label="Bekleyen Oturumu Temizle"
            onPress={() => void clearPendingPayment()}
            testID="checkout-clear-pending-session"
            variant="outline"
          />
        </View>
      ) : null}

      {items.length === 0 ? (
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Sepet bos</ThemedText>
          <PrimaryButton label="Kataloga Don" onPress={() => router.push("/catalog")} testID="checkout-back-to-catalog" />
        </View>
      ) : (
        <>
          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.sectionHeading}>
              <Feather name="shopping-bag" size={16} color={activeTenant.palette.primary} />
              <ThemedText type="smallBold">Sepettekiler</ThemedText>
            </View>
            <View style={styles.lineItemList}>
              {items.slice(0, 3).map((item) => (
                <View key={item.productId} style={styles.lineItemRow}>
                  <View style={styles.lineItemCopy}>
                    <ThemedText type="smallBold" numberOfLines={1}>
                      {item.title}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.quantity} adet • {item.brand || item.category}
                    </ThemedText>
                  </View>
                  <ThemedText type="smallBold">{item.priceText}</ThemedText>
                </View>
              ))}
            </View>
            {items.length > 3 ? (
              <ThemedText type="small" themeColor="textSecondary">
                +{items.length - 3} urun daha checkout toplaminda dahil.
              </ThemedText>
            ) : null}
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.sectionHeading}>
              <Feather name="map-pin" size={16} color={activeTenant.palette.primary} />
              <ThemedText type="smallBold">Teslimat bilgileri</ThemedText>
            </View>
            <TextField label="Ad Soyad" value={name} onChangeText={setName} placeholder="Ad Soyad" autoCapitalize="words" />
            <TextField
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@mail.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextField label="Telefon" value={contact} onChangeText={setContact} placeholder="0555 000 00 00" autoCapitalize="none" />
            <TextField label="Adres" value={address} onChangeText={setAddress} placeholder="Mahalle, sokak, bina no" />
            <View style={styles.row}>
              <View style={styles.rowField}>
                <TextField label="Sehir" value={city} onChangeText={setCity} placeholder="Istanbul" />
              </View>
              <View style={styles.rowField}>
                <TextField label="Ulke" value={country} onChangeText={setCountry} placeholder="Turkey" />
              </View>
            </View>
            <TextField label="Posta Kodu" value={zipCode} onChangeText={setZipCode} placeholder="34000" autoCapitalize="none" />
            <TextField
              label="Siparis Notu"
              value={orderNote}
              onChangeText={setOrderNote}
              placeholder="Teslimat notu"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.sectionHeading}>
              <Feather name="file-text" size={16} color={activeTenant.palette.primary} />
              <ThemedText type="smallBold">Siparis ozeti</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText type="small">Ara toplam</ThemedText>
              <ThemedText type="smallBold">{totals.subtotalText}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText type="small">Kargo</ThemedText>
              <ThemedText type="smallBold">{totals.shippingText}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText type="small">Indirim</ThemedText>
              <ThemedText type="smallBold">{totals.discountText}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText type="smallBold">Toplam</ThemedText>
              <ThemedText type="smallBold">{totals.totalText}</ThemedText>
            </View>
            {!totals.isFreeShipping ? (
              <ThemedText type="small" themeColor="textSecondary">
                Ucretsiz kargo icin {Math.ceil(totals.remainingForFreeShipping)} TL daha eklenmeli.
              </ThemedText>
            ) : null}
            {siteSettingsError ? (
              <ThemedText type="small" style={{ color: "#b42318" }}>
                {siteSettingsError}
              </ThemedText>
            ) : null}
            <View style={styles.checkoutHighlights}>
              <View style={[styles.highlightPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  {totals.isFreeShipping ? "Ucretsiz kargo aktif" : "Kargo limiti yakinda"}
                </ThemedText>
              </View>
              {appliedCoupon ? (
                <View style={[styles.highlightPill, { backgroundColor: "#f5efe7" }]}>
                  <ThemedText type="smallBold" style={{ color: activeTenant.palette.accent }}>
                    {appliedCoupon.couponCode} aktif
                  </ThemedText>
                </View>
              ) : null}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.sectionHeading}>
              <Feather name="tag" size={16} color={activeTenant.palette.primary} />
              <ThemedText type="smallBold">Kupon</ThemedText>
            </View>
            {highlightedCoupons.length ? (
              <View style={styles.quickCouponRail}>
                {highlightedCoupons.map((offer) => (
                  <Pressable
                    key={offer.id}
                    onPress={() => {
                      setCouponCode(offer.couponCode);
                      setCouponMessage(`${offer.couponCode} kodu alana yerlestirildi.`);
                    }}
                    style={({ pressed }) => [
                      styles.quickCouponCard,
                      { backgroundColor: "#f9fbf8", borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
                    ]}
                  >
                    <ThemedText type="smallBold">{offer.couponCode}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      %{offer.discountPercentage} • min {offer.minimumAmount} TL
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <TextField
              label="Kupon Kodu"
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="SERRAVIT10"
              autoCapitalize="characters"
              testID="checkout-coupon-code"
            />
            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <PrimaryButton
                  label={isCouponsLoading ? "Kuponlar Yukleniyor..." : "Kuponu Uygula"}
                  onPress={handleApplyCoupon}
                  disabled={isCouponsLoading}
                  testID="checkout-apply-coupon"
                />
              </View>
              <View style={styles.actionButton}>
                <PrimaryButton label="Kuponu Kaldir" onPress={handleRemoveCoupon} testID="checkout-remove-coupon" variant="outline" />
              </View>
            </View>
            {appliedCoupon ? (
              <ThemedText type="small" themeColor="textSecondary" testID="checkout-applied-coupon">
                Aktif kupon: {appliedCoupon.title} ({appliedCoupon.couponCode})
              </ThemedText>
            ) : null}
            {couponMessage ? (
              <ThemedText
                type="small"
                testID="checkout-coupon-message"
                themeColor={couponMessage.includes("uygulandi") ? "textSecondary" : undefined}
                style={couponMessage.includes("uygulandi") ? undefined : { color: "#b42318" }}
              >
                {couponMessage}
              </ThemedText>
            ) : null}
            {couponsError ? (
              <ThemedText type="small" style={{ color: "#b42318" }}>
                {couponsError}
              </ThemedText>
            ) : null}
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.sectionHeading}>
              <Feather name="gift" size={16} color={activeTenant.palette.primary} />
              <ThemedText type="smallBold">Son kontrol ve odeme</ThemedText>
            </View>
            <View style={styles.reviewGrid}>
              <View style={[styles.reviewCard, { backgroundColor: "#f7faf7" }]}>
                <ThemedText type="smallBold">
                  {totals.isFreeShipping ? "Kargo ucreti sifirlandi" : `${Math.ceil(totals.remainingForFreeShipping)} TL ile kargo bedava`}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {totals.isFreeShipping
                    ? "Sepetin ucretsiz kargo limiti uzerinde."
                    : `${siteSettings.freeShippingThreshold} TL limiti tamamlarsan kargo ucreti duser.`}
                </ThemedText>
              </View>
              <View style={[styles.reviewCard, { backgroundColor: "#f8f3ec" }]}>
                <ThemedText type="smallBold">
                  {appliedCoupon ? `${appliedCoupon.couponCode} ile indirim hazir` : "Kuponla ek indirim ac"}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {appliedCoupon
                    ? "Odeme adimina gectiginde indirim toplama yansir."
                    : "Uygun kupon varsa sepette aninda fiyat dusurur."}
                </ThemedText>
              </View>
              <View style={[styles.reviewCard, { backgroundColor: "#fff8f1" }]}>
                <ThemedText type="smallBold">Teslimat hazirligi</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {name.trim() && address.trim() ? `${city || "Sehir"} teslimat bilgisi hazir.` : "Teslimat bilgilerini tamamla."}
                </ThemedText>
              </View>
            </View>
            <View style={styles.checkoutHighlights}>
              <FilterChip compact label="Firsatlari gor" onPress={() => router.push("/roadmap")} />
              <FilterChip compact label="Sepeti ac" onPress={() => router.push("/cart")} />
              <FilterChip compact label="Destek" onPress={() => router.push("/support")} />
            </View>
            <View style={styles.sectionHeading}>
              <Feather name="credit-card" size={16} color={activeTenant.palette.primary} />
              <ThemedText type="smallBold">Odeme hazirligi</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              Odeme tamamlaninca uygulamaya geri donersin.
            </ThemedText>
            <View style={styles.trustList}>
              <View style={styles.trustRow}>
                <Feather name="check-circle" size={16} color={activeTenant.palette.primary} />
                <ThemedText type="small">Bekleyen oturum korunur.</ThemedText>
              </View>
              <View style={styles.trustRow}>
                <Feather name="check-circle" size={16} color={activeTenant.palette.primary} />
                <ThemedText type="small">Eslesmeyen donusler tamamlanmaz.</ThemedText>
              </View>
            </View>
            {formError || error ? (
              <ThemedText type="smallBold" style={{ color: "#b42318" }}>
                {formError || error}
              </ThemedText>
            ) : null}
            <PrimaryButton
              label={isInitializing ? "Odeme Hazirlaniyor..." : "Guvenli Odemeyi Baslat"}
              onPress={() => void handleStartCheckout()}
              disabled={isInitializing}
              testID="checkout-start-payment"
            />
          </View>
        </>
      )}

      <Pressable onPress={() => router.back()}>
        <ThemedText type="linkPrimary">Sepete geri don</ThemedText>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 30,
    padding: 20,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  heroTrustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroTrustText: {
    color: "#d8f5df",
  },
  heroTitle: {
    color: "#ffffff",
  },
  heroMetrics: {
    flexDirection: "row",
    gap: 10,
  },
  heroMetricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    gap: 4,
  },
  heroMetricValue: {
    color: "#ffffff",
    fontSize: 20,
    lineHeight: 28,
  },
  heroMetricLabel: {
    color: "#e6f7ea",
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  noticeCopy: {
    gap: 6,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowField: {
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  lineItemList: {
    gap: 10,
  },
  lineItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#d8e5d8",
  },
  lineItemCopy: {
    flex: 1,
    gap: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkoutHighlights: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  quickCouponRail: {
    gap: 10,
  },
  quickCouponCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  highlightPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reviewGrid: {
    gap: 10,
  },
  reviewCard: {
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  trustList: {
    gap: 10,
  },
  trustRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
});
