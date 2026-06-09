# Mobile Play Store Readiness

Bu dokuman Serravit mobil uygulamasini Play Store yukleme noktasina kadar hazirlamak icin repo icinde tamamlanan teknik adimlari ve kalan manuel adimlari toplar.

## Hazirlanan teknik bloklar

- Android package id: `com.serravit.mobile`
- iOS bundle id: `com.serravit.mobile`
- Deep link scheme: `serravitmobile`
- Production build profili: `harri-mobile-app/eas.json`
- Public privacy policy rotasi: `https://serravit.com/policy`
- Public account deletion request rotasi: `https://serravit.com/delete-account`
- In-app hesap silme akisi: `Hesabim > Ayarlar > Hesabi Sil`
- Production storefront deploy commit: `ecd2ffb`
- Production API deploy commit: `001ccf6`

## Release signing

Android release signing artik debug keystore ile degil upload keystore ile calisir.

- Gradle config: `harri-mobile-app/android/app/build.gradle`
- Local keystore config dosyasi: `harri-mobile-app/android/keystore.properties`
- Local upload keystore: `harri-mobile-app/android/serravit-upload-keystore.jks`

`keystore.properties` git'e girmez. Beklenen anahtarlar:

```properties
storeFile=serravit-upload-keystore.jks
storePassword=...
keyAlias=...
keyPassword=...
```

Alternatif olarak ayni bilgiler su environment variable'larla da verilebilir:

- `SERRAVIT_UPLOAD_STORE_FILE`
- `SERRAVIT_UPLOAD_STORE_PASSWORD`
- `SERRAVIT_UPLOAD_KEY_ALIAS`
- `SERRAVIT_UPLOAD_KEY_PASSWORD`

## Build komutlari

EAS production AAB:

```bash
cd harri-mobile-app
EXPO_PUBLIC_API_BASE_URL=https://api.serravit.com npm run build:production:android
```

Local Android bundle:

```bash
cd harri-mobile-app/android
./gradlew bundleRelease
```

Hazir bundle:

- Yol: `harri-mobile-app/android/app/build/outputs/bundle/release/app-release.aab`
- SHA-256: `6113f87f1d59d5e5c1cd24198a5299593f9b8b35c5a2e035975740c6caf86009`

## Play Console acildiginda kalan manuel adimlar

1. Play Console developer hesabini ac.
2. Yeni uygulamayi `Serravit` adi ile olustur.
3. Privacy policy URL olarak `https://serravit.com/policy` gir.
4. Account deletion web URL olarak `https://serravit.com/delete-account` gir.
5. Store listing gorsellerini ve aciklamalari ekle.
6. Data Safety, Content Rating ve App Access formlarini doldur.
7. Ilk `AAB` dosyasini upload et.
8. Hesap turune gore zorunlu testing track varsa kapali test adimini tamamla.

## Notlar

- Uygulama fiziksel urun sattigi icin checkout akisi iyzico tarafinda devam eder; bu Play Billing kapsaminda dijital urun akisi degildir.
- Hesap silme akisi backend tarafinda siparis, degerlendirme, kayitli adres, bulten ve kupon atama verilerini de temizler.
- Support e-postasi olarak `destek@serravit.com` kullanilabilir.
- `android/` klasoru repo tarafinda ignore oldugu icin upload keystore ve native signing ayarlari bu Mac uzerinde lokal olarak hazirdir; git'e bilerek alinmamistir.
- 2026-06-09 kontrolunde `https://serravit.com/delete-account` ve `https://serravit.com/policy` production'da `200` donmustur.
