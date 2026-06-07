import { ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useCatalogSnapshot } from "@/modules/catalog/use-catalog-snapshot";
import { useBlogPostDetail } from "@/modules/blog/use-blog-post-detail";
import { buildBlogExcerpt, getBlogReadTime, splitBlogTextIntoParagraphs } from "@/modules/blog/utils";

export default function BlogDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { data: post, isLoading, error } = useBlogPostDetail(slug || "");
  const { data: catalog } = useCatalogSnapshot({ page: 1, size: 48, includeFacets: false });
  const relatedProducts = (catalog?.products || []).filter((item) => post?.relatedProductIds.includes(item.id));
  const paragraphs = splitBlogTextIntoParagraphs(post?.contentText || "");

  if (!slug) {
    return (
      <ScreenShell>
        <ThemedText type="small">Blog bağlantısı eksik.</ThemedText>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      {isLoading ? <ThemedText type="small">Yazı yükleniyor...</ThemedText> : null}
      {error ? (
        <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Yazı bulunamadı</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {error}
          </ThemedText>
          <PrimaryButton label="Bloga Dön" onPress={() => router.replace("../blog")} variant="outline" />
        </View>
      ) : null}

      {post ? (
        <>
          <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            {post.coverImage ? <Image source={{ uri: post.coverImage }} style={styles.coverImage} contentFit="cover" transition={120} /> : null}
            <View style={styles.heroContent}>
              <View style={styles.metaRow}>
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  Blog
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {getBlogReadTime(post)} dk okuma
                </ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.title} testID="blog-detail-title">
                {post.title}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {buildBlogExcerpt(post, 240)}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            {paragraphs.map((paragraph, index) => (
              <ThemedText key={`${post.slug}-${index}`} type="small" themeColor="textSecondary" style={styles.paragraph}>
                {paragraph}
              </ThemedText>
            ))}
          </View>

          {relatedProducts.length ? (
            <View style={styles.section}>
              <ThemedText type="default" style={styles.sectionTitle}>
                İlgili Ürünler
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedList}>
                {relatedProducts.map((product) => (
                  <View key={product.id} style={[styles.relatedCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
                    {product.imageUrl ? (
                      <Image source={{ uri: product.imageUrl }} style={styles.relatedImage} contentFit="cover" transition={120} />
                    ) : (
                      <View style={[styles.relatedImage, styles.relatedImageFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
                        <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                          {product.brand || "Serravit"}
                        </ThemedText>
                      </View>
                    )}
                    <View style={styles.relatedContent}>
                      <ThemedText type="smallBold" numberOfLines={2}>
                        {product.title}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {product.priceText}
                      </ThemedText>
                    </View>
                    <View style={styles.relatedAction}>
                      <PrimaryButton label="Ürünü Aç" onPress={() => router.push(`/product/${product.id}`)} variant="outline" />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  noticeCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: 260,
  },
  heroContent: {
    padding: 18,
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    lineHeight: 40,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  paragraph: {
    lineHeight: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
  },
  relatedList: {
    gap: 12,
    paddingRight: 6,
  },
  relatedCard: {
    width: 220,
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  relatedImage: {
    width: "100%",
    height: 132,
  },
  relatedImageFallback: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  relatedContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
    minHeight: 92,
  },
  relatedAction: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
