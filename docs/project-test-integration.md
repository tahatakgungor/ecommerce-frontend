# Project Test Integration

Bu dokuman, local test ortaminda proje akisinin hangi bolumlerinin kapsandigini ve hangi komutla dogrulanacagini netlestirir.

## Standart Akis

Her degisiklikte hedef akis:

1. local test environment
2. gerekiyorsa canli/production kontrolu
3. commit + push

## Tek Komut UI Verify

`harri-ecommerce` repo kokunde:

```bash
./ops/test-env/verify-ui.sh
```

Bu script sunlari sirayla kosar:

- storefront unit test
- storefront build
- storefront fixture sync
- storefront smoke verify
- admin unit test
- admin build
- admin fixture sync
- admin smoke verify

## Storefront Kapsami

Storefront local env su akislari kapsar:

- homepage hero render
- shop filtreleri
- coklu marka secimi
- kategori baglamli marka facet hesaplari
- fiyat preset ve custom range davranisi
- arama sonuclari
- product details sayfasi
- guest order lookup formu
- email/view token ile order ekranina erisim
- mobil filter drawer

## Admin Kapsami

Admin local env su akislari kapsar:

- dashboard kartlari
- dashboard son siparisler
- product list
- reviews moderation
- orders listesi
- coupon listesi ve add drawer acilisi
- returns ekrani
- contact messages ekrani
- mobil product/review/returns yuzeyleri

## Backend Kapsami

Backend repo icinde:

```bash
./ops/test-env/verify-backend.sh
```

Bu verify akisi:

- docker compose config kontrolu
- product-service unit test
- product-service compile check

## Local Kapsam Disinda Kalanlar

Bu katmanlar local test env disindadir ve ayrica canli acceptance kontrolu ister:

- gercek odeme saglayicisi akislari
- gercek e-posta teslimi
- Cloudflare/domain/proxy davranisi
- ucuncu parti callback entegrasyonlari
- production veri olcegi altinda performans
