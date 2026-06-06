import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { PrimaryButton } from "@/components/primary-button";
import { ProductCard } from "@/components/product-card";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useWishlist } from "@/modules/wishlist/wishlist-provider";

export default function WishlistScreen() {
  const router = useRouter();
  const { items, itemCount, clearWishlist, isHydrating } = useWishlist();

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
            <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroTextBlock}>
                  <ThemedText type="smallBold" style={styles.eyebrow}>
                    FAVORILER
                  </ThemedText>
                  <ThemedText type="subtitle" style={styles.title}>
                    Kaydettiginiz urunleri tek yerde yonetin
                  </ThemedText>
                </View>
                {itemCount > 0 ? (
                  <View style={[styles.counterPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
                    <ThemedText type="smallBold">{itemCount}</ThemedText>
                  </View>
                ) : null}
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                Fiyat karsilastirmasi yapmadan once favori listenizde toparlayin, sonra tek tek sepete atin.
              </ThemedText>
              {itemCount > 0 ? (
                <Pressable onPress={clearWishlist} testID="wishlist-clear-all">
                  <ThemedText type="linkPrimary">Listeyi Temizle</ThemedText>
                </Pressable>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          isHydrating ? (
            <ThemedText type="small">Favoriler yukleniyor...</ThemedText>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <ThemedText type="smallBold">Henuz favori eklenmedi</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Katalog veya urun detay ekranindaki kaydet aksiyonuyla listenizi doldurabilirsiniz.
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
    borderWidth: 1,
    borderRadius: 26,
    padding: 22,
    gap: 10,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  heroTextBlock: {
    flex: 1,
    gap: 8,
  },
  eyebrow: {
    color: activeTenant.palette.primary,
    letterSpacing: 1,
  },
  title: {
    lineHeight: 40,
  },
  counterPill: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  gridRow: {
    gap: 12,
  },
  gridItem: {
    flex: 1,
    marginBottom: 12,
  },
});
