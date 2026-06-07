import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";

import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";
import type { CatalogProduct } from "@/modules/catalog/types";
import { ThemedText } from "@/components/themed-text";

type SearchSuggestionListProps = {
  products: CatalogProduct[];
  query: string;
  onSelect: (product: CatalogProduct) => void;
};

export function SearchSuggestionList({ products, query, onSelect }: SearchSuggestionListProps) {
  if (query.trim().length < 2 || products.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
      <View style={styles.list}>
        {products.map((product) => (
          <Pressable
            key={`search-suggestion-${product.id}`}
            onPress={() => onSelect(product)}
            testID={`search-suggestion-${product.id}`}
            style={({ pressed }) => [
              styles.row,
              { borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            {product.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="cover" transition={120} />
            ) : (
              <View style={[styles.image, styles.imageFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  {product.brand?.slice(0, 1) || "S"}
                </ThemedText>
              </View>
            )}
            <View style={styles.copy}>
              <ThemedText type="smallBold" numberOfLines={2}>
                {product.title}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {product.brand}
              </ThemedText>
            </View>
            <View style={styles.trailing}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                {product.priceText}
              </ThemedText>
              <Feather name="arrow-up-right" size={15} color={activeTenant.palette.primary} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    ...commerceShadow("#17324a", 12, 24, 0.06, 2),
  },
  list: {
    gap: 10,
  },
  row: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  trailing: {
    alignItems: "flex-end",
    gap: 6,
  },
});
