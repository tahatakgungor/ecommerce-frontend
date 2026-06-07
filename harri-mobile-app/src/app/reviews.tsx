import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { PrimaryButton } from "@/components/primary-button";
import { ReviewEditorSheet } from "@/components/review-editor-sheet";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useSession } from "@/modules/auth/session-provider";
import { createProductReview, deleteOwnProductReview, updateProductReview, uploadReviewMediaBatch } from "@/modules/reviews/api";
import { getReviewStatusMeta } from "@/modules/reviews/helpers";
import type { UploadableReviewAsset } from "@/modules/reviews/media";
import type { ReviewEntry, ReviewMutationPayload } from "@/modules/reviews/types";
import { useReviewOverview } from "@/modules/reviews/use-review-overview";

function moveOrderEntriesFirst(entries: ReviewEntry[], orderId: string) {
  if (!orderId) {
    return entries;
  }

  return [...entries].sort((left, right) => {
    const leftMatch = left.orderId === orderId ? 1 : 0;
    const rightMatch = right.orderId === orderId ? 1 : 0;
    return rightMatch - leftMatch;
  });
}

export default function ReviewsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string | string[] }>();
  const { isAuthenticated } = useSession();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] || "" : params.orderId || "";
  const { data, isLoading, isRefreshing, error, refresh } = useReviewOverview(isAuthenticated);
  const [editorItem, setEditorItem] = useState<ReviewEntry | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const hasAutoOpenedRef = useRef(false);

  const pending = useMemo(() => moveOrderEntriesFirst(data.pending, orderId), [data.pending, orderId]);
  const reviewed = useMemo(() => moveOrderEntriesFirst(data.reviewed, orderId), [data.reviewed, orderId]);

  useEffect(() => {
    if (!orderId || hasAutoOpenedRef.current || pending.length === 0) {
      return;
    }

    const firstMatch = pending.find((item) => item.orderId === orderId);
    if (!firstMatch) {
      return;
    }

    hasAutoOpenedRef.current = true;
    setEditorItem(firstMatch);
    setIsEditorOpen(true);
  }, [orderId, pending]);

  const openEditor = (item: ReviewEntry) => {
    setBannerMessage(null);
    setSubmitError(null);
    setEditorItem(item);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditorItem(null);
    setSubmitError(null);
  };

  const handleSave = async (payload: ReviewMutationPayload) => {
    if (!editorItem) {
      return;
    }

    if (!payload.commentBody.trim()) {
      setSubmitError("Yorum metni gerekli.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (editorItem.reviewId) {
        const message = await updateProductReview(editorItem.productId, editorItem.reviewId, payload);
        setBannerMessage(message);
      } else {
        const result = await createProductReview(editorItem.productId, payload);
        setBannerMessage(result.message);
      }

      await refresh();
      closeEditor();
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : "Değerlendirme kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editorItem?.reviewId) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const message = await deleteOwnProductReview(editorItem.productId, editorItem.reviewId);
      setBannerMessage(message);
      await refresh();
      closeEditor();
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : "Değerlendirme silinemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadMedia = async (assets: UploadableReviewAsset[]) => {
    if (!editorItem) {
      throw new Error("Değerlendirme hedefi bulunamadı.");
    }

    return uploadReviewMediaBatch(editorItem.productId, assets);
  };

  if (!isAuthenticated) {
    return (
      <ScreenShell>
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="subtitle" style={styles.title}>
            Değerlendirmelerim
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Sipariş sonrası değerlendirmeleri görmek ve yönetmek için hesabınıza giriş yapın.
          </ThemedText>
          <PrimaryButton label="Hesaba Git" onPress={() => router.replace("/account")} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scroll={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />}
      >
        <View style={[styles.hero, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <View style={styles.heroHeader}>
            <View style={{ flex: 1, gap: 6 }}>
              <ThemedText type="subtitle" style={styles.title}>
                Değerlendirmelerim
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Teslim edilen ürünler için yeni değerlendirme bırakabilir, mevcut değerlendirmelerini güncelleyebilirsin.
              </ThemedText>
            </View>
            <Pressable onPress={() => router.back()}>
              <ThemedText type="linkPrimary">Geri</ThemedText>
            </Pressable>
          </View>

          <View style={styles.metricRow}>
            <View style={[styles.metricCard, { backgroundColor: "#f8faf8" }]}>
              <ThemedText type="small">Bekleyen</ThemedText>
              <ThemedText type="subtitle" style={styles.metricValue}>
                {pending.length}
              </ThemedText>
            </View>
            <View style={[styles.metricCard, { backgroundColor: "#f8faf8" }]}>
              <ThemedText type="small">Değerlendirilen</ThemedText>
              <ThemedText type="subtitle" style={styles.metricValue}>
                {reviewed.length}
              </ThemedText>
            </View>
          </View>

          {bannerMessage ? (
            <View style={[styles.banner, { backgroundColor: "#eaf8ef", borderColor: "#96d5a9" }]}>
              <ThemedText type="smallBold" style={{ color: "#1f6a38" }}>
                {bannerMessage}
              </ThemedText>
            </View>
          ) : null}

          {error ? (
            <View style={[styles.banner, { backgroundColor: "#fff1f1", borderColor: "#f2a6a6" }]}>
              <ThemedText type="smallBold" style={{ color: "#a52a2a" }}>
                {error}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Değerlendirme bekleyen ürünler</ThemedText>
          {isLoading ? (
            <ThemedText type="small">Değerlendirmeler yükleniyor...</ThemedText>
          ) : pending.length === 0 ? (
            <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <ThemedText type="small" themeColor="textSecondary">
                Şu anda değerlendirme bekleyen ürün bulunmuyor.
              </ThemedText>
            </View>
          ) : (
            pending.map((item) => (
              <View key={`${item.orderId}-${item.productId}`} style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
                <View style={styles.listRow}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} resizeMode="cover" />
                  ) : (
                    <View style={[styles.thumbnailFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
                      <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                        {item.title.slice(0, 1)}
                      </ThemedText>
                    </View>
                  )}
                  <View style={styles.listCopy}>
                    <ThemedText type="smallBold">{item.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Sipariş: {item.orderId || "-"}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Teslim sonrası deneyimini ekleyin.
                    </ThemedText>
                  </View>
                </View>
                <PrimaryButton label="Değerlendir" onPress={() => openEditor(item)} testID={`review-open-${item.productId}`} />
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Değerlendirmelerim</ThemedText>
          {reviewed.length === 0 ? (
            <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <ThemedText type="small" themeColor="textSecondary">
                Henüz gönderilmiş bir değerlendirme bulunmuyor.
              </ThemedText>
            </View>
          ) : (
            reviewed.map((item) => {
              const statusMeta = getReviewStatusMeta(item.status);
              return (
                <View key={`${item.reviewId}-${item.productId}`} style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
                  <View style={styles.listRow}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} resizeMode="cover" />
                    ) : (
                      <View style={[styles.thumbnailFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
                        <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                          {item.title.slice(0, 1)}
                        </ThemedText>
                      </View>
                    )}
                    <View style={styles.listCopy}>
                      <ThemedText type="smallBold">{item.title}</ThemedText>
                      <View
                        style={[
                          styles.inlinePill,
                          {
                            backgroundColor: statusMeta.backgroundColor,
                            borderColor: statusMeta.borderColor,
                          },
                        ]}
                      >
                        <ThemedText type="smallBold" style={{ color: statusMeta.textColor }}>
                          {statusMeta.label}
                        </ThemedText>
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">
                        {item.rating}/5 puan • {item.updatedAtText}
                      </ThemedText>
                      {item.commentBody ? (
                        <ThemedText type="small" themeColor="textSecondary">
                          {item.commentBody}
                        </ThemedText>
                      ) : null}
                    </View>
                  </View>
                  <PrimaryButton label="Güncelle" onPress={() => openEditor(item)} variant="outline" testID={`review-open-${item.productId}`} />
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <ReviewEditorSheet
        open={isEditorOpen}
        item={editorItem}
        isSubmitting={isSubmitting}
        error={submitError}
        onClose={closeEditor}
        onSave={handleSave}
        onUploadMedia={handleUploadMedia}
        onDelete={editorItem?.reviewId ? handleDelete : undefined}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 18,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    gap: 16,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    lineHeight: 38,
  },
  metricRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    gap: 6,
  },
  metricValue: {
    lineHeight: 36,
  },
  banner: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
  },
  section: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  listRow: {
    flexDirection: "row",
    gap: 14,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },
  thumbnailFallback: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  listCopy: {
    flex: 1,
    gap: 6,
  },
  inlinePill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
