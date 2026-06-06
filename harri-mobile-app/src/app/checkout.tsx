import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import * as ExpoLinking from "expo-linking";
import { Feather } from "@expo/vector-icons";
import { formatTryPrice } from "@harri/commerce-contracts";

import { CommercePageHeader } from "@/components/commerce-page-header";
import { BackLink } from "@/components/back-link";
import { FilterChip } from "@/components/filter-chip";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { SectionHeader } from "@/components/section-header";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useSession } from "@/modules/auth/session-provider";
import type { SavedAddress } from "@/modules/auth/types";
import { useCart } from "@/modules/cart/cart-provider";
import { validateCouponForCheckout } from "@/modules/coupons/logic";
import type { CouponOffer } from "@/modules/coupons/types";
import { useCouponOffers } from "@/modules/coupons/use-coupon-offers";
import { calculateCheckoutTotals } from "@/modules/checkout/checkout-logic";
import { useCheckout } from "@/modules/checkout/checkout-provider";
import { normalizeSavedAddresses } from "@/modules/profile/addresses";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useSession();
  const { items, itemCount } = useCart();
  const { pendingPayment, isInitializing, error, startCheckout, clearPendingPayment } = useCheckout();
  const { data: siteSettings, error: siteSettingsError } = useSiteSettings();
  const { data: couponOffers, isLoading: isCouponsLoading, error: couponsError, refresh: refreshCoupons } = useCouponOffers();

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
  const [couponExpanded, setCouponExpanded] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const savedAddresses = useMemo(() => normalizeSavedAddresses(user?.savedAddresses), [user?.savedAddresses]);
  const defaultSavedAddress = useMemo(
    () => savedAddresses.find((item) => item.isDefault) || savedAddresses[0] || null,
    [savedAddresses]
  );

  const totals = useMemo(
    () =>
      calculateCheckoutTotals(items, {
        ...siteSettings,
        coupon: appliedCoupon,
      }),
    [appliedCoupon, items, siteSettings]
  );
  const highlightedCoupons = couponOffers.slice(0, 3);

  const applySavedAddress = (savedAddress: SavedAddress | null) => {
    if (!savedAddress) {
      setSelectedAddressId("");
      setAddress(user?.address || "");
      setCity(user?.city || "İstanbul");
      setCountry(user?.country || "Türkiye");
      setZipCode(user?.zipCode || "");
      return;
    }

    setSelectedAddressId(savedAddress.id);
    setAddress(savedAddress.address || "");
    setCity(savedAddress.city || "İstanbul");
    setCountry(savedAddress.country || "Türkiye");
    setZipCode(savedAddress.zipCode || "");
  };

  useEffect(() => {
    const fullName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ");

    setName((current) => current || fullName || "");
    setEmail((current) => current || user?.email || "");
    setContact((current) => current || user?.phone || "");
    setAddress((current) => current || defaultSavedAddress?.address || user?.address || "");
    setCity((current) => current || defaultSavedAddress?.city || user?.city || "İstanbul");
    setCountry((current) => current || defaultSavedAddress?.country || user?.country || "Türkiye");
    setZipCode((current) => current || defaultSavedAddress?.zipCode || user?.zipCode || "");
    setSelectedAddressId((current) => current || defaultSavedAddress?.id || "");
  }, [defaultSavedAddress, user]);

  useEffect(() => {
    if (!selectedAddressId && defaultSavedAddress) {
      setSelectedAddressId(defaultSavedAddress.id);
    }
  }, [defaultSavedAddress, selectedAddressId]);

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

  useEffect(() => {
    if (appliedCoupon || couponMessage) {
      setCouponExpanded(true);
    }
  }, [appliedCoupon, couponMessage]);

  const handleApplyCoupon = () => {
    const normalizedCode = couponCode.trim();
    if (!normalizedCode) {
      setCouponMessage("Kupon kodu girin.");
      return;
    }

    const coupon = couponOffers.find((item) => item.couponCode.toLowerCase() === normalizedCode.toLowerCase());
    if (!coupon) {
      setCouponMessage("Geçerli bir kupon kodu bulunamadı.");
      return;
    }

    const validation = validateCouponForCheckout(items, coupon, email.trim() || user?.email || "");
    if (!validation.ok) {
      setCouponMessage(validation.reason);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponCode(coupon.couponCode);
    setCouponMessage(`${coupon.title} uygulandı.`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("Kupon kaldırıldı.");
  };

  const handleStartCheckout = async () => {
    if (items.length === 0) {
      setFormError("Sepet boşken ödeme başlatılamaz.");
      return;
    }

    const requiredValues = [name, email, contact, address, city, country];
    if (requiredValues.some((value) => !value.trim())) {
      setFormError("Teslimat ve iletişim alanlarını doldurun.");
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
      setFormError(nextError instanceof Error ? nextError.message : "Ödeme başlatılamadı.");
    }
  };

  return (
    <ScreenShell>
      <BackLink label="Sepete dön" onPress={() => router.push("/cart")} />
      <CommercePageHeader
        title="Güvenli ödeme"
        meta={items.length ? `${itemCount} ürün` : "Ödeme"}
      />

      {pendingPayment ? (
        <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.border }]}>
          <View style={styles.noticeCopy}>
            <ThemedText type="smallBold">Bekleyen ödeme oturumu var</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {pendingPayment.itemCount} ürünlük oturum korunuyor.
            </ThemedText>
          </View>
          <PrimaryButton
            label="Temizle"
            onPress={() => void clearPendingPayment()}
            testID="checkout-clear-pending-session"
            variant="outline"
          />
        </View>
      ) : null}

      {items.length === 0 ? (
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Sepet boş</ThemedText>
          <PrimaryButton label="Kataloğa dön" onPress={() => router.push("/catalog")} testID="checkout-back-to-catalog" />
        </View>
      ) : (
        <>
          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <SectionHeader title="Teslimat bilgileri" />
            {savedAddresses.length ? (
              <View style={styles.savedAddressSection}>
                <ThemedText type="smallBold">Kayıtlı adreslerim</ThemedText>
                <View style={styles.savedAddressList}>
                  {savedAddresses.map((savedAddress) => {
                    const isActive = savedAddress.id === selectedAddressId;

                    return (
                      <Pressable
                        key={savedAddress.id}
                        accessibilityRole="button"
                        onPress={() => applySavedAddress(savedAddress)}
                        style={({ pressed }) => [
                          styles.savedAddressCard,
                          {
                            borderColor: isActive ? activeTenant.palette.primary : activeTenant.palette.border,
                            backgroundColor: isActive ? activeTenant.palette.primarySoft : activeTenant.palette.background,
                            opacity: pressed ? 0.94 : 1,
                          },
                        ]}
                      >
                        <View style={styles.savedAddressTopRow}>
                          <ThemedText type="smallBold">{savedAddress.label || "Adres"}</ThemedText>
                          {savedAddress.isDefault ? (
                            <View style={[styles.savedAddressPill, { backgroundColor: "#ffffff" }]}>
                              <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                                Varsayılan
                              </ThemedText>
                            </View>
                          ) : null}
                        </View>
                        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                          {savedAddress.address}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {[savedAddress.city, savedAddress.country].filter(Boolean).join(" / ")}
                        </ThemedText>
                      </Pressable>
                    );
                  })}

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => applySavedAddress(null)}
                    style={({ pressed }) => [
                      styles.savedAddressCard,
                      {
                        borderColor: !selectedAddressId ? activeTenant.palette.primary : activeTenant.palette.border,
                        backgroundColor: !selectedAddressId ? activeTenant.palette.primarySoft : activeTenant.palette.background,
                        opacity: pressed ? 0.94 : 1,
                      },
                    ]}
                  >
                    <ThemedText type="smallBold">Yeni adres gir</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Formu manuel doldur.
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : null}
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
                <TextField label="Şehir" value={city} onChangeText={setCity} placeholder="İstanbul" />
              </View>
              <View style={styles.rowField}>
                <TextField label="Ülke" value={country} onChangeText={setCountry} placeholder="Türkiye" />
              </View>
            </View>
            <TextField label="Posta Kodu" value={zipCode} onChangeText={setZipCode} placeholder="34000" autoCapitalize="none" />
            <TextField label="Sipariş Notu" value={orderNote} onChangeText={setOrderNote} placeholder="Teslimat notu" multiline numberOfLines={4} />
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setCouponExpanded((current) => !current)}
              style={[styles.couponToggle, { borderColor: activeTenant.palette.border, backgroundColor: "#f8fbfe" }]}
              testID="checkout-coupon-toggle"
            >
              <View style={styles.couponToggleCopy}>
                <ThemedText type="smallBold">Kupon</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {appliedCoupon ? `${appliedCoupon.couponCode} aktif` : "İndirim kodu ekle"}
                </ThemedText>
              </View>
              <Feather
                name={couponExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={activeTenant.palette.primary}
              />
            </Pressable>

            {couponExpanded ? (
              <>
                {isCouponsLoading && !highlightedCoupons.length ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    Kuponlar yükleniyor...
                  </ThemedText>
                ) : null}

                {highlightedCoupons.length ? (
                  <View style={styles.quickCouponRail}>
                    {highlightedCoupons.map((offer) => (
                      <Pressable
                        key={offer.id}
                        onPress={() => {
                          setCouponCode(offer.couponCode);
                          setCouponMessage(`${offer.couponCode} alana eklendi.`);
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

                <View style={styles.buttonRow}>
                  <PrimaryButton
                    label={isCouponsLoading ? "Yükleniyor..." : "Uygula"}
                    onPress={handleApplyCoupon}
                    disabled={isCouponsLoading}
                    testID="checkout-apply-coupon"
                    style={styles.rowButton}
                  />
                  <PrimaryButton label="Kaldır" onPress={handleRemoveCoupon} testID="checkout-remove-coupon" variant="outline" style={styles.rowButton} />
                </View>

                {appliedCoupon ? (
                  <ThemedText type="small" themeColor="textSecondary" testID="checkout-applied-coupon">
                    Aktif kupon: {appliedCoupon.couponCode}
                  </ThemedText>
                ) : null}
                {couponMessage ? (
                  <ThemedText
                    type="small"
                    testID="checkout-coupon-message"
                    themeColor={couponMessage.includes("uygulandı") ? "textSecondary" : undefined}
                    style={couponMessage.includes("uygulandı") ? undefined : { color: "#b42318" }}
                  >
                    {couponMessage}
                  </ThemedText>
                ) : null}
                {couponsError ? (
                  <View style={styles.couponErrorBox}>
                    <ThemedText type="small" style={{ color: "#b42318" }}>
                      {couponsError}
                    </ThemedText>
                    <PrimaryButton label="Tekrar dene" onPress={() => void refreshCoupons()} variant="outline" />
                  </View>
                ) : null}
              </>
            ) : null}
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.summaryTopRow}>
              <View style={styles.summaryCopy}>
                <SectionHeader title="Sipariş ve ödeme" />
                <ThemedText type="small" themeColor="textSecondary">
                  {itemCount} ürün • {totals.subtotalText} ara toplam
                </ThemedText>
              </View>
              <View style={[styles.totalPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  {totals.totalText}
                </ThemedText>
              </View>
            </View>

            <View style={styles.lineItemList}>
              {items.map((item) => (
                <View key={item.productId} style={styles.lineItemRow}>
                  <View style={styles.lineItemCopy}>
                    <ThemedText type="smallBold" numberOfLines={1}>
                      {item.title}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.quantity} adet • {item.priceText}
                    </ThemedText>
                  </View>
                  <ThemedText type="smallBold">{formatTryPrice(item.price * item.quantity)}</ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.summaryBreakdown}>
              <View style={styles.summaryMetricRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  Ürünler
                </ThemedText>
                <ThemedText type="smallBold">{totals.subtotalText}</ThemedText>
              </View>
              <View style={styles.summaryMetricRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  İndirim
                </ThemedText>
                <ThemedText type="smallBold">{totals.discountText}</ThemedText>
              </View>
              <View style={styles.summaryMetricRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  Kargo
                </ThemedText>
                <ThemedText type="smallBold">{totals.shippingText}</ThemedText>
              </View>
            </View>

            <View style={styles.metaRow}>
              <FilterChip compact label="Sepete dön" onPress={() => router.push("/cart")} />
              <ThemedText type="small" themeColor="textSecondary">
                {!totals.isFreeShipping ? `${Math.ceil(totals.remainingForFreeShipping)} TL sonra kargo ücretsiz.` : "Ücretsiz kargo aktif."}
              </ThemedText>
            </View>

            {siteSettingsError ? (
              <ThemedText type="small" style={{ color: "#b42318" }}>
                {siteSettingsError}
              </ThemedText>
            ) : null}
            {formError || error ? (
              <ThemedText type="smallBold" style={{ color: "#b42318" }}>
                {formError || error}
              </ThemedText>
            ) : null}
            <PrimaryButton
              label={isInitializing ? "Hazırlanıyor..." : "Ödemeyi başlat"}
              onPress={() => void handleStartCheckout()}
              disabled={isInitializing}
              testID="checkout-start-payment"
            />
          </View>
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  noticeCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  noticeCopy: {
    gap: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryCopy: {
    flex: 1,
    gap: 4,
  },
  couponToggle: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  couponToggleCopy: {
    flex: 1,
    gap: 4,
  },
  totalPill: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryBreakdown: {
    borderRadius: 18,
    padding: 14,
    gap: 10,
    backgroundColor: "#fcfdfd",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d8e5d8",
  },
  summaryMetricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
  metaRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  savedAddressSection: {
    gap: 10,
  },
  savedAddressList: {
    gap: 10,
  },
  savedAddressCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    gap: 6,
  },
  savedAddressTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  savedAddressPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowField: {
    flex: 1,
  },
  quickCouponRail: {
    gap: 10,
  },
  couponErrorBox: {
    gap: 10,
  },
  quickCouponCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    gap: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  rowButton: {
    flex: 1,
  },
});
