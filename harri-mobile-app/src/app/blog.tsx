import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { CommercePageHeader } from "@/components/commerce-page-header";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useBlogPosts } from "@/modules/blog/use-blog-posts";
import { buildBlogExcerpt, getBlogReadTime } from "@/modules/blog/utils";

export default function BlogScreen() {
  const router = useRouter();
  const { data: posts, isLoading, error } = useBlogPosts();

  return (
    <ScreenShell>
      <CommercePageHeader title="Blog" meta={`${posts.length} yazı`} />

      {isLoading ? <ThemedText type="small">Yazılar yükleniyor...</ThemedText> : null}
      {error ? (
        <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Blog servisine erişilemedi</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {error}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.feed}>
        {posts.map((post) => (
          <View key={post.slug} style={[styles.postCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            {post.coverImage ? <Image source={{ uri: post.coverImage }} style={styles.coverImage} contentFit="cover" transition={120} /> : null}
            <View style={styles.postContent}>
              <View style={styles.postMetaRow}>
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  Blog
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {getBlogReadTime(post)} dk okuma
                </ThemedText>
              </View>
              <ThemedText type="default" style={styles.postTitle}>
                {post.title}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {buildBlogExcerpt(post, 180)}
              </ThemedText>
              <PrimaryButton
                label="Yazıyı oku"
                onPress={() => router.push({ pathname: "/blog/[slug]", params: { slug: post.slug } })}
                variant="outline"
                testID={`blog-open-${post.slug}`}
              />
            </View>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  noticeCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  feed: {
    gap: 14,
  },
  postCard: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: 220,
  },
  postContent: {
    padding: 18,
    gap: 10,
  },
  postMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  postTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
  },
});
