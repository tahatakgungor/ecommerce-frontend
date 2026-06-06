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
                Kaydettiginiz urunleri karsilastirip sonra sepete atin
              </ThemedText>
              <ThemedText type="small" style={styles.heroDescription}>
                Kampanya, fiyat ve tekrar satin alma akisi icin favori liste artik ara durak degil; aktif alisveris yuzeyi.
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
                    <ThemedText type="smallBold">Karar vermeyi kolaylastir</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Favorilerindeki urunleri tek tek acip sepetle karsilastirmadan once hizli yon bul.
                    </ThemedText>
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
                Katalog veya urun detay ekranindaki kaydet aksiyonuyla listenizi doldurabilirsiniz.
              </ThemedText>
              <PrimaryButton label="Kataloga Git" onPress={() => router.push("/catalog")} testID="wishlist-go-to-catalog" />
            </View>
          )
        }
        ListFooterComponent={
          itemCount > 0 ? (
            <View style={[styles.footerCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <View style={styles.footerHeader}>
                <View style={[styles.footerIcon, { backgroundColor: activeTenant.palette.primarySoft }]}>
                  <Feather name="repeat" size={16} color={activeTenant.palette.primary} />
                </View>
                <View style={styles.footerCopy}>
                  <ThemedText type="smallBold">Hizli devam</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Favorilerden urun detayina girip adet belirleyerek sepete gecmek daha hizli.
                  </ThemedText>
                </View>
              </View>
              <View style={styles.footerActions}>
                <PrimaryButton label="Tumunu Sepete Ekle" onPress={addAllToCart} variant="outline" />
                <PrimaryButton label="Sepete Git" onPress={() => router.push("/cart")} />
              </View>
              <Pressable onPress={clearWishlist} testID="wishlist-clear-all">
                <ThemedText type="linkPrimary">Tum favorileri temizle</ThemedText>
              </Pressable>
            </View>
          ) : null
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
    padding: 22,
    gap: 16,
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
  heroDescription: {
    color: "#e6f7ea",
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
    borderRadius: 24,
    padding: 18,
    gap: 14,
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
    borderRadius: 24,
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
  footerCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
    marginTop: 4,
  },
  footerHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  footerIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  footerCopy: {
    flex: 1,
    gap: 4,
  },
  footerActions: {
    flexDirection: "row",
    gap: 12,
  },
});
