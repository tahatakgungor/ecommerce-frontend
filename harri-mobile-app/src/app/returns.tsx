import { useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { CommercePageHeader } from "@/components/commerce-page-header";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useSession } from "@/modules/auth/session-provider";
import { fetchUserOrderDetail } from "@/modules/orders/api";
import { getReturnStatusMeta } from "@/modules/orders/status";
import type { OrderDetail } from "@/modules/orders/types";
import { createReturnRequest } from "@/modules/returns/api";
import { useReturnRequests } from "@/modules/returns/use-return-requests";

const RETURN_REASONS = [
  "Hasarlı teslimat",
  "Yanlış ürün",
  "Beklentiyi karşılamadı",
  "Diğer",
];

export default function ReturnsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string | string[] }>();
  const { isAuthenticated } = useSession();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] || "" : params.orderId || "";
  const { data, isLoading, isRefreshing, error, refresh } = useReturnRequests(isAuthenticated);
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [focusedOrder, setFocusedOrder] = useState<OrderDetail | null>(null);
  const [isOrderLoading, setIsOrderLoading] = useState(false);

  const activeReturn = useMemo(() => data.find((item) => item.orderId === orderId) || null, [data, orderId]);

  useEffect(() => {
    let active = true;

    if (!isAuthenticated || !orderId) {
      setFocusedOrder(null);
      setIsOrderLoading(false);
      return () => {
        active = false;
      };
    }

    setIsOrderLoading(true);
    fetchUserOrderDetail(orderId)
      .then((nextOrder) => {
        if (!active) return;
        setFocusedOrder(nextOrder);
      })
      .catch(() => {
        if (!active) return;
        setFocusedOrder(null);
      })
      .finally(() => {
        if (!active) return;
        setIsOrderLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, orderId]);

  const canCreateReturn = Boolean(focusedOrder && focusedOrder.status === "delivered" && !activeReturn);

  const handleSubmit = async () => {
    if (!orderId) {
      setSubmitError("İade açmak için sipariş seçilmeli.");
      return;
    }

    if (!reason.trim()) {
      setSubmitError("İade nedeni seçin.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const message = await createReturnRequest({
        orderId,
        reason,
        customerNote: note,
      });
      setBannerMessage(message);
      setNote("");
      await refresh();
    } catch (nextError) {
      setSubmitError(nextError instanceof Error ? nextError.message : "İade talebi gönderilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <ScreenShell>
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="subtitle" style={styles.title}>
            İadeler
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            İade talebi oluşturmak ve süreci takip etmek için hesabınıza giriş yapın.
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
        <CommercePageHeader
          title="İadeler"
          description="Teslim edilen siparişler için iade talebi açabilir, mevcut taleplerinin durumunu izleyebilirsin."
          backLabel="Hesaba dön"
          onPressBack={() => router.push("/account")}
        >
          <View style={[styles.metricCard, { backgroundColor: "#f8faf8" }]}>
            <ThemedText type="small">Toplam iade kaydı</ThemedText>
            <ThemedText type="subtitle" style={styles.metricValue}>
              {data.length}
            </ThemedText>
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
        </CommercePageHeader>

        {orderId ? (
          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Sipariş bazlı iade talebi</ThemedText>
            {isOrderLoading ? (
              <ThemedText type="small">Sipariş bilgisi yükleniyor...</ThemedText>
            ) : focusedOrder ? (
              <>
                <ThemedText type="small">Sipariş {focusedOrder.invoice}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {focusedOrder.totalAmountText} • {focusedOrder.statusText}
                </ThemedText>
              </>
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                Sipariş bilgisi bulunamadı.
              </ThemedText>
            )}

            {activeReturn ? (
              <View
                style={[
                  styles.statusCard,
                  {
                    backgroundColor: getReturnStatusMeta(activeReturn.status).backgroundColor,
                    borderColor: getReturnStatusMeta(activeReturn.status).borderColor,
                  },
                ]}
              >
                <ThemedText type="smallBold" style={{ color: getReturnStatusMeta(activeReturn.status).textColor }}>
                  {activeReturn.statusLabel}
                </ThemedText>
                <ThemedText type="small" style={{ color: getReturnStatusMeta(activeReturn.status).textColor }}>
                  {activeReturn.statusDescription}
                </ThemedText>
              </View>
            ) : canCreateReturn ? (
              <>
                <ThemedText type="small" themeColor="textSecondary">
                  İade talebi göndermeden önce nedeninizi seçin. Ek not alanına operasyon ekibine iletmek istediğiniz detayı yazabilirsiniz.
                </ThemedText>
                <View style={styles.reasonWrap}>
                  {RETURN_REASONS.map((item) => {
                    const selected = item === reason;
                    return (
                      <Pressable
                        key={item}
                        onPress={() => setReason(item)}
                        testID={`return-reason-${item}`}
                        style={[
                          styles.reasonChip,
                          {
                            backgroundColor: selected ? activeTenant.palette.primarySoft : "#f8faf8",
                            borderColor: selected ? activeTenant.palette.primary : activeTenant.palette.border,
                          },
                        ]}
                      >
                        <ThemedText type="smallBold" style={{ color: selected ? activeTenant.palette.primary : activeTenant.palette.text }}>
                          {item}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
                <TextField
                  label="Ek not"
                  value={note}
                  onChangeText={setNote}
                  placeholder="Paket, içerik veya teslimatla ilgili notunuz"
                  multiline
                  numberOfLines={5}
                  testID="return-note"
                />
                {submitError ? (
                  <ThemedText type="small" style={{ color: "#b42318" }}>
                    {submitError}
                  </ThemedText>
                ) : null}
                <PrimaryButton
                  label={isSubmitting ? "Gönderiliyor..." : "İade Talebi Oluştur"}
                  onPress={() => {
                    void handleSubmit();
                  }}
                  disabled={isSubmitting}
                  testID="return-submit"
                />
              </>
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                Yalnızca teslim edilen ve mevcut iade kaydı olmayan siparişler için yeni talep açılabilir.
              </ThemedText>
            )}
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="smallBold">Tüm iade kayıtları</ThemedText>
          {isLoading ? (
            <ThemedText type="small">İadeler yükleniyor...</ThemedText>
          ) : data.length === 0 ? (
            <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <ThemedText type="small" themeColor="textSecondary">
                Henüz bir iade talebi bulunmuyor.
              </ThemedText>
            </View>
          ) : (
            data.map((item) => {
              const statusMeta = getReturnStatusMeta(item.status);
              return (
                <View key={item.id} style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]} testID={`return-card-${item.orderId}`}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1, gap: 6 }}>
                      <ThemedText type="smallBold">Sipariş {item.invoice || item.orderId}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        Neden: {item.reason || "Belirtilmedi"}
                      </ThemedText>
                    </View>
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
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    {statusMeta.description}
                  </ThemedText>
                  {item.customerNote ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      Not: {item.customerNote}
                    </ThemedText>
                  ) : null}
                  <ThemedText type="small" themeColor="textSecondary">
                    Açılış: {item.createdAtText}
                  </ThemedText>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
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
  metricCard: {
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
    gap: 12,
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    gap: 6,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  reasonWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  reasonChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inlinePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
