import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

import { CommercePageHeader } from "@/components/commerce-page-header";
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
    setBulkMessage(`${items.length} favori ürün sepete eklendi.`);
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
            <CommercePageHeader title="Favoriler" meta={itemCount ? `${itemCount} ürün` : "Boş"} />
            <View style={[styles.toolbarCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <View style={styles.toolbarRow}>
                <FilterChip compact label="Katalog" onPress={() => router.push("/catalog")} />
                <FilterChip compact label="Sepet" onPress={() => router.push("/cart")} />
                {itemCount > 0 ? <FilterChip compact label="Tümünü sepete at" onPress={addAllToCart} /> : null}
                {itemCount > 0 ? <FilterChip compact label="Temizle" onPress={clearWishlist} /> : null}
              </View>
              {bulkMessage ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {bulkMessage}
                </ThemedText>
              ) : null}
            </View>
            {itemCount > 0 ? (
              <View style={[styles.decisionCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
                <View style={styles.decisionRow}>
                  <View style={styles.decisionCopy}>
                    <ThemedText type="smallBold">Kaydettiğin ürünler</ThemedText>
                  </View>
                  <View style={[styles.decisionPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
                    <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                      Sepette {cartItemCount}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.decisionActions}>
                  <FilterChip compact label="Sepete git" onPress={() => router.push("/cart")} />
                  <FilterChip compact label="Yeni ürün bak" onPress={() => router.push("/catalog")} />
                  <FilterChip compact label="Tümünü sepete at" onPress={addAllToCart} />
                  <FilterChip compact label="Temizle" onPress={clearWishlist} />
                </View>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isHydrating ? (
            <ThemedText type="small">Favoriler yükleniyor...</ThemedText>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <View style={styles.emptyIcon}>
                <Feather name="bookmark" size={22} color={activeTenant.palette.primary} />
              </View>
              <ThemedText type="smallBold">Henüz favori eklenmedi</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Ürün kartlarındaki kaydet düğmesiyle favori ekleyebilirsin.
              </ThemedText>
              <PrimaryButton label="Kataloğa Git" onPress={() => router.push("/catalog")} testID="wishlist-go-to-catalog" />
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
  toolbarCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  toolbarRow: {
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
