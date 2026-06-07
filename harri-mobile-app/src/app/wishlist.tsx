import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { CommercePageHeader } from "@/components/commerce-page-header";
import { PrimaryButton } from "@/components/primary-button";
import { ProductCard } from "@/components/product-card";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useProductReviewSummaries } from "@/modules/reviews/product-feedback";
import { useWishlist } from "@/modules/wishlist/wishlist-provider";

export default function WishlistScreen() {
  const router = useRouter();
  const { items, itemCount, clearWishlist, isHydrating } = useWishlist();
  const { data: reviewSummaries } = useProductReviewSummaries(items.map((item) => item.id));

  return (
    <ScreenShell scroll={false}>
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={itemCount > 1 ? styles.gridRow : undefined}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <ProductCard product={item} reviewSummary={reviewSummaries[item.id]} />
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <CommercePageHeader title="Favoriler" meta={itemCount ? `${itemCount} ürün` : "Boş"} />
            {itemCount > 0 ? (
              <View style={[styles.metaCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
                <View style={styles.metaRow}>
                  <View style={styles.metaCopy}>
                    <ThemedText type="smallBold">Kaydettiğin ürünler</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      İstediğin ürünü açabilir ya da favoriler listesini tek seferde temizleyebilirsin.
                    </ThemedText>
                  </View>
                  <PrimaryButton label="Temizle" onPress={clearWishlist} variant="outline" />
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
    gap: 12,
    marginBottom: 16,
  },
  metaCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  metaCopy: {
    flex: 1,
    gap: 4,
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
