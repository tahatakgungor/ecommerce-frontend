import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useCart } from "@/modules/cart/cart-provider";

export default function CartScreen() {
  const { items, subtotalText, clearCart, removeItem, updateQuantity, isHydrating } = useCart();

  return (
    <ScreenShell>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Sepet
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Cart state cihazda saklanir. Session token ile ayni storage kanalina atilmaz.
        </ThemedText>
      </View>

      {isHydrating ? <ThemedText type="small">Sepet yukleniyor...</ThemedText> : null}

      {!isHydrating && items.length === 0 ? (
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Sepet bos</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Product detail ekranindan urun ekledikce burasi dolacak.
          </ThemedText>
        </View>
      ) : null}

      {items.map((item) => (
        <View
          key={item.productId}
          style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
        >
          <View style={styles.row}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" transition={120} />
            ) : (
              <View style={[styles.image, styles.imageFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <ThemedText type="smallBold">{item.brand}</ThemedText>
              </View>
            )}
            <View style={styles.info}>
              <ThemedText type="smallBold">{item.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.brand}
              </ThemedText>
              <ThemedText type="smallBold">{item.priceText}</ThemedText>
            </View>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label="-"
              onPress={() => updateQuantity(item.productId, item.quantity - 1)}
              variant="outline"
              style={styles.qtyButton}
            />
            <ThemedText type="smallBold">{item.quantity}</ThemedText>
            <PrimaryButton
              label="+"
              onPress={() => updateQuantity(item.productId, item.quantity + 1)}
              variant="outline"
              style={styles.qtyButton}
            />
            <PrimaryButton
              label="Kaldir"
              onPress={() => removeItem(item.productId)}
              variant="outline"
              style={styles.removeButton}
            />
          </View>
        </View>
      ))}

      {items.length > 0 ? (
        <View style={[styles.summaryCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <View style={styles.summaryRow}>
            <ThemedText type="smallBold">Ara toplam</ThemedText>
            <ThemedText type="smallBold">{subtotalText}</ThemedText>
          </View>
          <PrimaryButton label="Sepeti Temizle" onPress={clearCart} variant="outline" />
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
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 14,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 16,
  },
  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyButton: {
    width: 44,
  },
  removeButton: {
    marginLeft: "auto",
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
