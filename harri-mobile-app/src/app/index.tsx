import { StyleSheet, View } from 'react-native';

import { ProductCard } from '@/components/product-card';
import { ScreenShell } from '@/components/screen-shell';
import { ThemedText } from '@/components/themed-text';
import { activeTenant } from '@/domain/active-tenant';
import { hasApiBaseUrl } from '@/config/runtime';
import { useCatalogSnapshot } from '@/modules/catalog/use-catalog-snapshot';

export default function HomeScreen() {
  const { data, isLoading, error } = useCatalogSnapshot(1, 6);

  return (
    <ScreenShell>
      <View style={[styles.hero, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold" style={[styles.eyebrow, { color: activeTenant.palette.accent }]}>
          {activeTenant.industry}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.heroTitle}>
          {activeTenant.heroTitle}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.heroDescription}>
          {activeTenant.heroDescription}
        </ThemedText>
        <View style={styles.promiseList}>
          {activeTenant.promises.map((item) => (
            <View
              key={item}
              style={[styles.promiseChip, { backgroundColor: activeTenant.palette.primarySoft }]}
            >
              <ThemedText type="smallBold">{item}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="default" style={styles.sectionTitle}>
          Mobil temel
        </ThemedText>
        {activeTenant.mobileSections.map((section) => (
          <View
            key={section.title}
            style={[styles.sectionCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
          >
            <ThemedText type="smallBold">{section.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {section.description}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <ThemedText type="default" style={styles.sectionTitle}>
            Canli katalog snapshot
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {hasApiBaseUrl() ? "Backend baglantisi acik" : "Env bekleniyor"}
          </ThemedText>
        </View>
        {!hasApiBaseUrl() && (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">EXPO_PUBLIC_API_BASE_URL gerekli</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              `.env` olusturup API taban URL'sini tanimladiginda mobil uygulama ayni katalog backend'ini kullanacak.
            </ThemedText>
          </View>
        )}
        {isLoading && hasApiBaseUrl() ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="small">Katalog yukleniyor...</ThemedText>
          </View>
        ) : null}
        {error ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Baglanti durumu</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {error}
            </ThemedText>
          </View>
        ) : null}
        {data?.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
    gap: 14,
  },
  eyebrow: {
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    lineHeight: 38,
  },
  heroDescription: {
    lineHeight: 22,
  },
  promiseList: {
    gap: 10,
  },
  promiseChip: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  section: {
    gap: 12,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 700,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
});
