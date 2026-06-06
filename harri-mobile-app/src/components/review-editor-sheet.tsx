import { useEffect, useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { PrimaryButton } from "@/components/primary-button";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import {
  getRemainingReviewMediaSlots,
  MAX_REVIEW_MEDIA,
  type UploadableReviewAsset,
  validateReviewMediaSelection,
} from "@/modules/reviews/media";
import { getReviewStatusMeta } from "@/modules/reviews/helpers";
import type { ReviewEntry, ReviewMutationPayload } from "@/modules/reviews/types";

type ReviewEditorSheetProps = {
  open: boolean;
  item: ReviewEntry | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (payload: ReviewMutationPayload) => Promise<void>;
  onUploadMedia: (assets: UploadableReviewAsset[]) => Promise<string[]>;
  onDelete?: () => Promise<void>;
};

export function ReviewEditorSheet({
  open,
  item,
  isSubmitting,
  error,
  onClose,
  onSave,
  onUploadMedia,
  onDelete,
}: ReviewEditorSheetProps) {
  const [rating, setRating] = useState(5);
  const [commentTitle, setCommentTitle] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  useEffect(() => {
    if (!open || !item) {
      return;
    }

    setRating(item.rating || 5);
    setCommentTitle(item.commentTitle || "");
    setCommentBody(item.commentBody || "");
    setMediaUrls(Array.isArray(item.mediaUrls) ? item.mediaUrls : []);
    setMediaError(null);
    setIsUploadingMedia(false);
  }, [item, open]);

  const statusMeta = useMemo(() => getReviewStatusMeta(item?.status || ""), [item?.status]);
  const isExistingReview = Boolean(item?.hasReview && item?.reviewId);
  const remainingSlots = getRemainingReviewMediaSlots(mediaUrls);

  if (!item) {
    return null;
  }

  const handlePickMedia = async () => {
    if (remainingSlots <= 0) {
      setMediaError(`En fazla ${MAX_REVIEW_MEDIA} gorsel ekleyebilirsiniz.`);
      return;
    }

    setMediaError(null);

    if (typeof ImagePicker.requestMediaLibraryPermissionsAsync === "function") {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setMediaError("Fotograf secmek icin medya kutuphanesi izni gerekli.");
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !Array.isArray(result.assets) || result.assets.length === 0) {
      return;
    }

    const validation = validateReviewMediaSelection(mediaUrls.length, result.assets);
    if (!validation.ok) {
      setMediaError(validation.message);
      return;
    }

    setIsUploadingMedia(true);

    try {
      const uploadedUrls = await onUploadMedia(validation.assets);
      setMediaUrls((current) => [...current, ...uploadedUrls].slice(0, MAX_REVIEW_MEDIA));
    } catch (nextError) {
      setMediaError(nextError instanceof Error ? nextError.message : "Fotograf yuklenemedi.");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <ThemedText type="smallBold">{isExistingReview ? "Degerlendirmeyi Guncelle" : "Urunu Degerlendir"}</ThemedText>
              <Pressable onPress={onClose} testID="review-editor-close">
                <ThemedText type="linkPrimary">Kapat</ThemedText>
              </Pressable>
            </View>

            <View style={[styles.productCard, { borderColor: activeTenant.palette.border, backgroundColor: "#f8faf8" }]}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={[styles.imageFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
                  <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                    {item.title.slice(0, 1)}
                  </ThemedText>
                </View>
              )}
              <View style={styles.productCopy}>
                <ThemedText type="smallBold">{item.title}</ThemedText>
                {isExistingReview ? (
                  <View
                    style={[
                      styles.statusPill,
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
                ) : null}
                {item.updatedAtText ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    Son guncelleme: {item.updatedAtText}
                  </ThemedText>
                ) : null}
              </View>
            </View>

            <View style={styles.ratingRow}>
              <ThemedText type="smallBold">Puaniniz</ThemedText>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= rating;
                  return (
                    <Pressable
                      key={star}
                      onPress={() => setRating(star)}
                      testID={`review-star-${star}`}
                      style={[
                        styles.starButton,
                        {
                          backgroundColor: active ? "#ffe7a8" : "#f3f5f2",
                          borderColor: active ? "#e0b655" : activeTenant.palette.border,
                        },
                      ]}
                    >
                    <ThemedText type="smallBold" style={{ color: active ? "#9a5b13" : activeTenant.palette.mutedText }}>
                        {star}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <TextField
              label="Baslik"
              value={commentTitle}
              onChangeText={setCommentTitle}
              placeholder="Orn. Hızlı teslimat, guvenilir paketleme"
              autoCapitalize="sentences"
              testID="review-title"
            />
            <TextField
              label="Yorumunuz"
              value={commentBody}
              onChangeText={setCommentBody}
              placeholder="Urun deneyiminizi ve dikkat edilmesi gerekenleri yazin."
              multiline
              numberOfLines={6}
              testID="review-body"
            />

            <View style={styles.mediaSection}>
              <View style={styles.mediaHeader}>
                <ThemedText type="smallBold">Fotograflar</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {mediaUrls.length}/{MAX_REVIEW_MEDIA}
                </ThemedText>
              </View>
              <PrimaryButton
                label={isUploadingMedia ? "Yukleniyor..." : "Fotograf Ekle"}
                onPress={() => {
                  void handlePickMedia();
                }}
                disabled={isSubmitting || isUploadingMedia || remainingSlots <= 0}
                variant="outline"
                testID="review-pick-media"
              />
              <ThemedText type="small" themeColor="textSecondary">
                En fazla {MAX_REVIEW_MEDIA} gorsel yuklenebilir. Her gorsel icin 8 MB ust limit uygulanir.
              </ThemedText>
              {mediaUrls.length > 0 ? (
                <View style={styles.mediaGrid}>
                  {mediaUrls.map((mediaUrl, index) => (
                    <View key={`${mediaUrl}-${index}`} style={[styles.mediaCard, { borderColor: activeTenant.palette.border }]}>
                      <Image source={{ uri: mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
                      <Pressable
                        onPress={() => {
                          setMediaUrls((current) => current.filter((_, currentIndex) => currentIndex !== index));
                        }}
                        disabled={isSubmitting || isUploadingMedia}
                        testID={`review-remove-media-${index}`}
                      >
                        <ThemedText type="linkPrimary">Kaldir</ThemedText>
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            {mediaError ? (
              <ThemedText type="small" style={{ color: "#b42318" }}>
                {mediaError}
              </ThemedText>
            ) : null}

            {error ? (
              <ThemedText type="small" style={{ color: "#b42318" }}>
                {error}
              </ThemedText>
            ) : null}

            <View style={styles.actionStack}>
              <PrimaryButton
                label={isSubmitting ? "Kaydediliyor..." : isExistingReview ? "Degerlendirmeyi Guncelle" : "Degerlendirmeyi Gonder"}
                onPress={() => {
                  void onSave({
                    rating,
                    commentTitle,
                    commentBody,
                    orderId: item.orderId || undefined,
                    mediaUrls,
                  });
                }}
                disabled={isSubmitting || isUploadingMedia}
                testID="review-save"
              />
              {isExistingReview && onDelete ? (
                <PrimaryButton
                  label={isSubmitting ? "Siliniyor..." : "Degerlendirmeyi Sil"}
                  onPress={() => {
                    void onDelete();
                  }}
                  disabled={isSubmitting || isUploadingMedia}
                  variant="outline"
                  testID="review-delete"
                />
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingTop: 16,
    maxHeight: "88%",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  productCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },
  imageFallback: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  productCopy: {
    flex: 1,
    gap: 6,
  },
  statusPill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ratingRow: {
    gap: 10,
  },
  starRow: {
    flexDirection: "row",
    gap: 8,
  },
  starButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionStack: {
    gap: 10,
  },
  mediaSection: {
    gap: 10,
  },
  mediaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mediaCard: {
    width: 88,
    gap: 6,
    borderWidth: 1,
    borderRadius: 16,
    padding: 8,
  },
  mediaImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
});
