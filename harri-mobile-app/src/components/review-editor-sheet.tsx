import { useEffect, useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { getReviewStatusMeta } from "@/modules/reviews/helpers";
import type { ReviewEntry, ReviewMutationPayload } from "@/modules/reviews/types";

type ReviewEditorSheetProps = {
  open: boolean;
  item: ReviewEntry | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (payload: ReviewMutationPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function ReviewEditorSheet({
  open,
  item,
  isSubmitting,
  error,
  onClose,
  onSave,
  onDelete,
}: ReviewEditorSheetProps) {
  const [rating, setRating] = useState(5);
  const [commentTitle, setCommentTitle] = useState("");
  const [commentBody, setCommentBody] = useState("");

  useEffect(() => {
    if (!open || !item) {
      return;
    }

    setRating(item.rating || 5);
    setCommentTitle(item.commentTitle || "");
    setCommentBody(item.commentBody || "");
  }, [item, open]);

  const statusMeta = useMemo(() => getReviewStatusMeta(item?.status || ""), [item?.status]);
  const isExistingReview = Boolean(item?.hasReview && item?.reviewId);

  if (!item) {
    return null;
  }

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
                  });
                }}
                disabled={isSubmitting}
                testID="review-save"
              />
              {isExistingReview && onDelete ? (
                <PrimaryButton
                  label={isSubmitting ? "Siliniyor..." : "Degerlendirmeyi Sil"}
                  onPress={() => {
                    void onDelete();
                  }}
                  disabled={isSubmitting}
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
});
