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
