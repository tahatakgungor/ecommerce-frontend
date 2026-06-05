import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import * as ExpoLinking from "expo-linking";

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
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Guvenli checkout
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Odeme akisi native deep link donusu icin hazirlandi. Token ve pending session guvenli storage katmaninda ayrik tutulur.
        </ThemedText>
      </View>

      {pendingPayment ? (
        <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.border }]}>
          <View style={styles.noticeCopy}>
            <ThemedText type="smallBold">Bekleyen odeme oturumu bulundu</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {pendingPayment.itemCount} urun icin acilan checkout oturumu yarida kalmis. Dilersen temizleyip yeni oturum acabilirsin.
            </ThemedText>
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
          <ThemedText type="small" themeColor="textSecondary">
            Checkout baslatmadan once urun eklemen gerekiyor.
          </ThemedText>
          <PrimaryButton label="Kataloga Don" onPress={() => router.push("/catalog")} testID="checkout-back-to-catalog" />
        </View>
      ) : (
        <>
          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Teslimat bilgileri</ThemedText>
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
            <TextField label="Siparis Notu" value={orderNote} onChangeText={setOrderNote} placeholder="Teslimat notu" />
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Siparis ozeti</ThemedText>
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
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Kupon</ThemedText>
            <TextField
              label="Kupon Kodu"
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="SERRAVIT10"
              autoCapitalize="characters"
            />
            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <PrimaryButton
                  label={isCouponsLoading ? "Kuponlar Yukleniyor..." : "Kuponu Uygula"}
                  onPress={handleApplyCoupon}
                  disabled={isCouponsLoading}
                />
              </View>
              <View style={styles.actionButton}>
                <PrimaryButton label="Kuponu Kaldir" onPress={handleRemoveCoupon} variant="outline" />
              </View>
            </View>
            {appliedCoupon ? (
              <ThemedText type="small" themeColor="textSecondary">
                Aktif kupon: {appliedCoupon.title} ({appliedCoupon.couponCode})
              </ThemedText>
            ) : null}
            {couponMessage ? (
              <ThemedText type="small" themeColor={couponMessage.includes("uygulandi") ? "textSecondary" : undefined} style={couponMessage.includes("uygulandi") ? undefined : { color: "#b42318" }}>
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
            <ThemedText type="small" themeColor="textSecondary">
              Checkout mobile deep link ile uygulamaya doner. Gercek odeme oncesi 3D, callback ve replay senaryolari cihaz seviyesinde test edilmelidir.
            </ThemedText>
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
  header: {
    gap: 8,
  },
  title: {
    lineHeight: 38,
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  noticeCopy: {
    gap: 6,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
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
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
