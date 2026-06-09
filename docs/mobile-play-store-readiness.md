# Mobile Play Store Readiness

Bu dokuman Serravit mobil uygulamasini Play Store yukleme noktasina kadar hazirlamak icin repo icinde tamamlanan teknik adimlari ve kalan manuel adimlari toplar.

## Hazirlanan teknik bloklar

- Android package id: `com.serravit.mobile`
- iOS bundle id: `com.serravit.mobile`
- Deep link scheme: `serravitmobile`
- Production build profili: `harri-mobile-app/eas.json`
- Public privacy policy rotasi: `https://serravit.com/policy`
- In-app hesap silme akisi: `Hesabim > Ayarlar > Hesabi Sil`

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

## Play Console acildiginda kalan manuel adimlar

1. Play Console developer hesabini ac.
2. Yeni uygulamayi `Serravit` adi ile olustur.
3. Privacy policy URL olarak `https://serravit.com/policy` gir.
4. Store listing gorsellerini ve aciklamalari ekle.
5. Data Safety, Content Rating ve App Access formlarini doldur.
6. Ilk `AAB` dosyasini upload et.
7. Hesap turune gore zorunlu testing track varsa kapali test adimini tamamla.

## Notlar

- Uygulama fiziksel urun sattigi icin checkout akisi iyzico tarafinda devam eder; bu Play Billing kapsaminda dijital urun akisi degildir.
- Hesap silme akisi backend tarafinda siparis, degerlendirme, kayitli adres, bulten ve kupon atama verilerini de temizler.
- Support e-postasi olarak `destek@serravit.com` kullanilabilir.
