# Mobile Security And Performance Hardening

Son güncelleme: 2026-06-06

## Hedef

Mobil storefront'un:

- yuksek trafik altinda daha stabil kalmasi
- yorum, katalog ve checkout akislarinda gereksiz istek patlamasi uretmemesi
- public endpoint'lerin kaba kotuye kullanimlara karsi korunmasi
- cihaz/DNS/ag salinimlarinda tamamen bos ekrana dusmemesi

## Bu turda uygulananlar

### Mobil performans

- katalog ve urun detay ekranlari `local cache -> bundled fallback -> network refresh` sirasi ile aciliyor
- urun kartlari artik kart basina review summary fetch etmiyor
- `home`, `catalog`, `cart recommendation` ve `wishlist` ekranlari review summary verisini ekran seviyesinde topluyor
- mobile review summary cache'i TTL'li hale getirildi
- batch endpoint varsa mobil onu kullaniyor; yoksa kontrollu concurrency fallback calisiyor

### Mobil guvenlik ve dayaniklilik

- secure token saklama `SecureStore` ile devam ediyor
- payment session stale/failure cleanup akisi kalici hale getirildi
- staged secret scan guard commit oncesi standart akisa baglandi
- mobile HTTP client timeout ve JSON response guard'i tek merkezde

### Backend guvenlik ve performans

- public review summary ve review list endpoint'lerine rate limit eklendi
- yeni public batch review summary endpoint'i eklendi
- mobile taraf artik bu batch endpoint'i kullanabiliyor
- mevcut review summary cache yapisi korunarak tekrarli istek yuku azaltildi

## Kalan orta vade isler

1. Katalog payload'ina `averageRating` ve `totalReviews` alanlarini dogrudan eklemek.
2. Batch review summary endpoint'ini metriklemek.
3. Public review endpoint'leri icin dashboard alarmi kurmak.
4. Checkout / payment-result / wishlist gibi ekranlarda kalan buyuk CTA yogunlugunu ortak compact action diliyle tamamlamak.
5. `AsyncStorage` uzerindeki non-sensitive cache'ler icin boyut ve eviction politikasi eklemek.

## Kalan uzun vade isler

1. Mobile BFF/read-model katmani:
   mobile'a ozel katalog, review summary, shipping ve coupon read modeli.
2. Cache invalidation:
   urun veya review guncellendiginde mobile cache versiyonlamasi.
3. Observability:
   slow endpoint, timeout, batch fallback ve payment retry metrikleri.
4. Abuse protection:
   IP + device fingerprint + tenant aware advanced throttling.
5. Release gates:
   her release oncesi smoke + visual audit + secret scan + clean build zorunlulugu.

## Operasyon checklist

- `harri-mobile-app`: `npx tsc --noEmit`
- `harri-mobile-app`: `npm run test:ci`
- `harri-ecommerce`: `node ./ops/security/check-staged-secrets.mjs`
- `product-service`: compile/test
- release APK once temiz build
- test env process cleanup (`3003`, `8081`)

## Basari olcutleri

- katalog ilk acilis hissedilir sekilde cache/fallback ile hizli kalmali
- urun kartlari ekran basina onlarca review istegi atmamalı
- yorum ozet endpoint'i yuk altinda 429 ile korunabilmeli
- ag sorunu halinde uygulama urunsuz beyaz ekranda kalmamali
