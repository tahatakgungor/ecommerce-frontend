# Serravit Mobile

Expo tabanli mobil storefront iskeleti.

Bu uygulama mevcut web storefront'un birebir goruntu kopyasi olarak degil, uzun vadeli olceklenebilir ve farkli sektor/markalara uyarlanabilir bir commerce mobile foundation olarak baslatildi.

## Hedefler

- Ayni backend API'lerini mobil tarafta yeniden kullanmak
- Tenant/domain config ile marka ve sektor bagimliligini koddan ayirmak
- Katalog, auth ve checkout akislarini mobil performansina gore ayristirmak
- Android ve iOS dagitimi icin Expo/EAS hattina hazir olmak

## Calistirma

1. Ornek env dosyasini kopyala:

```bash
cp .env.example .env
```

2. `EXPO_PUBLIC_API_BASE_URL` degerini ayarla.

3. Projeyi baslat:

```bash
npm install
npm run start
```

## Test ve dogrulama

Minimum teslim akisi:

```bash
npx tsc --noEmit
npm run test:ci
npx expo export --platform web
npm run test:env:verify
```

Test env komutlari:

```bash
npm run test:env:start
npm run test:env:smoke
```

Bu smoke akisi `account -> orders -> catalog -> cart -> checkout` hattini mock API ile browser seviyesinde dogrular.

## Ilk kapsam

- tenant-aware tema ve icerik config
- canli katalog snapshot entegrasyonu
- roadmap ekranlari

## Sonraki kapsam

- auth ve siparis akislari
- native checkout/deep link sertlestirme
- push notification
- image/cache optimizasyonu
- mobile-specific BFF

## Son eklenen checkout spike

- `checkout` route'u artik teslimat bilgilerini toplayip `/api/order/initialize-payment` cagiriyor
- iyzico callback zinciri `frontend callback -> mobile deep link -> confirm-payment` olarak kuruluyor
- pending payment session guvenli storage'a yaziliyor
- payment HTML'i sadece aktif memory oturumunda tutuluyor
- her checkout icin local `checkoutSessionId` nonce ve 30 dakikalik expiry uretiliyor
- payment-result callback'i token'i bu local session ile eslestirmeden confirm akisini baslatmiyor

## Son eklenen order hub

- `account` artik login formunun yanina order history hub'i da tasiyor
- authenticated kullanici `/api/user-order/order-by-user` ile kendi siparislerini goruyor
- guest flow `invoice + email` ile `/api/order/lookup` uzerinden siparis acabiliyor
- `orders/[id]` route'u root stack altinda; tab shell icine gomulu degil

## Son eklenen test env

- Expo web uzerinden mobil smoke ortami kuruldu
- storefront fixture ve mock API katmani mobil auth/order endpoint'leri ile paylastiriliyor
- kritik UI aksiyonlari icin `testID` tabanli automation kancalari eklendi
