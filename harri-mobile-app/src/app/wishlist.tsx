import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

import { FilterChip } from "@/components/filter-chip";
import { PrimaryButton } from "@/components/primary-button";
import { ProductCard } from "@/components/product-card";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useCart } from "@/modules/cart/cart-provider";
import { useWishlist } from "@/modules/wishlist/wishlist-provider";

export default function WishlistScreen() {
  const router = useRouter();
  const { items, itemCount, clearWishlist, isHydrating } = useWishlist();
  const { itemCount: cartItemCount, addItem } = useCart();
  const [bulkMessage, setBulkMessage] = useState("");

  const addAllToCart = () => {
    items.forEach((item) => {
      addItem(item, 1);
    });
    setBulkMessage(`${items.length} favori urun sepete eklendi.`);
  };

  return (
    <ScreenShell scroll={false}>
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={itemCount > 1 ? styles.gridRow : undefined}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <ProductCard product={item} />
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.primary }]}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroBadge}>
                  <Feather name="heart" size={14} color="#ffffff" />
                  <ThemedText type="smallBold" style={styles.heroBadgeText}>
                    Favoriler
                  </ThemedText>
                </View>
                {itemCount > 0 ? (
                  <View style={styles.counterPill}>
                    <ThemedText type="smallBold" style={styles.counterText}>
                      {itemCount}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
              <ThemedText type="subtitle" style={styles.title}>
                Kaydettigin urunleri burada tut
              </ThemedText>
              <View style={styles.heroActionRow}>
                <FilterChip compact label="Katalog" onPress={() => router.push("/catalog")} />
                <FilterChip compact label="Sepet" onPress={() => router.push("/cart")} />
                {itemCount > 0 ? <FilterChip compact label="Tumunu sepete at" onPress={addAllToCart} /> : null}
                {itemCount > 0 ? <FilterChip compact label="Temizle" onPress={clearWishlist} /> : null}
              </View>
            </View>
            {itemCount > 0 ? (
              <View style={[styles.decisionCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
                <View style={styles.decisionRow}>
                  <View style={styles.decisionCopy}>
                    <ThemedText type="smallBold">Favorilerinden devam et</ThemedText>
                  </View>
                  <View style={[styles.decisionPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
                    <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                      Sepette {cartItemCount}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.decisionActions}>
                  <FilterChip compact label="Sepete git" onPress={() => router.push("/cart")} />
                  <FilterChip compact label="Yeni urun bak" onPress={() => router.push("/catalog")} />
                  <FilterChip compact label="Tumunu sepete at" onPress={addAllToCart} />
                  <FilterChip compact label="Temizle" onPress={clearWishlist} />
                </View>
                {bulkMessage ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {bulkMessage}
                  </ThemedText>
                ) : null}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isHydrating ? (
            <ThemedText type="small">Favoriler yukleniyor...</ThemedText>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <View style={styles.emptyIcon}>
                <Feather name="bookmark" size={22} color={activeTenant.palette.primary} />
              </View>
              <ThemedText type="smallBold">Henuz favori eklenmedi</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Urun kartlarindaki kaydet dugmesiyle favori ekleyebilirsin.
              </ThemedText>
              <PrimaryButton label="Kataloga Git" onPress={() => router.push("/catalog")} testID="wishlist-go-to-catalog" />
            </View>
          )
        }
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 28,
    gap: 16,
  },
  headerStack: {
    gap: 16,
    marginBottom: 16,
  },
  heroCard: {
    borderRadius: 30,
    padding: 20,
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
  title: {
    color: "#ffffff",
  },
  counterPill: {
    minWidth: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  counterText: {
    color: "#ffffff",
  },
  heroActionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  decisionCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  decisionRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  decisionCopy: {
    flex: 1,
    gap: 4,
  },
  decisionPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  decisionActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    gap: 12,
    alignItems: "flex-start",
  },
  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef7f0",
  },
  gridRow: {
    gap: 12,
  },
  gridItem: {
    flex: 1,
    marginBottom: 12,
  },
});
