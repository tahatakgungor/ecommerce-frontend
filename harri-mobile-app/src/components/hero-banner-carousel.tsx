import { Linking, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";
import { resolveAppLink } from "@/lib/app-link";
import type { HeroBanner } from "@/modules/banners/types";

type HeroBannerCarouselProps = {
  banners: HeroBanner[];
};

export function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(280, width - 40);

  if (!banners.length) {
    return null;
  }

  const handleBannerPress = async (banner: HeroBanner) => {
    const resolvedLink = resolveAppLink(banner.ctaLink);
    if (resolvedLink.kind === "none") {
      return;
    }

    if (resolvedLink.kind === "external") {
      await Linking.openURL(resolvedLink.href);
      return;
    }

    router.push(resolvedLink.href as never);
  };

  return (
    <ScrollView
      horizontal
      pagingEnabled
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + 12}
      contentContainerStyle={styles.track}
    >
      {banners.map((banner) => (
        <Pressable
          key={banner.id}
          onPress={() => handleBannerPress(banner)}
          style={[
            styles.card,
            {
              width: cardWidth,
              backgroundColor: activeTenant.palette.surface,
              borderColor: activeTenant.palette.border,
            },
          ]}
        >
          {banner.imageUrl ? (
            <Image source={{ uri: banner.imageUrl }} style={styles.image} contentFit="cover" transition={120} />
          ) : (
            <View style={[styles.imageFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
              <Feather name="image" size={22} color={activeTenant.palette.primary} />
            </View>
          )}
          <View style={styles.overlay} />
          <View style={styles.content}>
            {banner.subtitle ? (
              <ThemedText type="smallBold" style={styles.eyebrow} numberOfLines={1}>
                {banner.subtitle}
              </ThemedText>
            ) : null}
            <ThemedText type="subtitle" style={styles.title} numberOfLines={3}>
              {banner.title || activeTenant.tagline}
            </ThemedText>
            <View style={styles.ctaRow}>
              <ThemedText type="smallBold" style={styles.ctaText}>
                {banner.ctaLabel || "İncele"}
              </ThemedText>
              <Feather name="arrow-right" size={16} color="#ffffff" />
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  track: {
    gap: 12,
    paddingRight: 2,
  },
  card: {
    height: 186,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    ...commerceShadow("#102034", 18, 34, 0.14, 6),
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  imageFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(5, 17, 12, 0.36)",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  eyebrow: {
    color: "#f7f6ee",
    letterSpacing: 0.8,
  },
  title: {
    color: "#ffffff",
    lineHeight: 28,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaText: {
    color: "#ffffff",
  },
});
