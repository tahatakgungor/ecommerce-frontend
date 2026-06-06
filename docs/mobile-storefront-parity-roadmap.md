# Mobile Storefront Parity Roadmap

## Hedef

Mobil uygulama, web storefront'un kritik kullanıcı akışlarını eksiksiz taşımalı:

- ana sayfa keşif akışı
- arama
- kategori / filtre / sıralama
- ürün detay
- sepet
- checkout
- ödeme sonucu
- hesap oturumu
- sipariş listesi / sipariş detayı
- misafir sipariş sorgulama
- kampanyalar / kuponlar
- istek listesi
- şifre sıfırlama / kayıt / giriş
- içerik sayfaları: iletişim, SSS, blog, politikalar

## Mevcut Durum

### Hazır olan çekirdek

- katalog snapshot
- ürün detay
- sepet state
- checkout initialize
- ödeme callback bridge
- hesap oturumu
- kayıt akışı
- şifre sıfırlama talebi
- şifre sıfırlama confirm deep-link akışı
- email verify / confirm-email akışı
- profil güncelleme
- şifre değiştirme doğrulama kodu akışı
- sipariş listesi ve sipariş detayı
- direct order view token ve tracking CTA
- iade talebi ve iadelerim ekranı
- yorum bekleyen / yorumlanan ürün hub'ı
- favori / istek listesi
- destek merkezi / iletişim / SSS / politika / kullanım koşulları
- blog listesi ve blog detay
- smoke / regression test omurgası

### Eksik kalan büyük yüzey

- dashboard fonksiyonlarının kalan ince paritesi: review media upload / detaylı sipariş sonrası araçlar / bildirimler

## Fazlar

### Faz 1

- ana sayfayı commerce-first tasarıma taşımak
- kategori, marka, arama ve sıralama filtrelerini mobilde açmak
- kampanya / kupon yüzeyini tab seviyesine almak

### Faz 2

- wishlist
- register / forgot password / email verify
- misafir sipariş sorgulama ekranını mobilde görünür yapmak
- kullanıcı hesabı akışlarını derinleştirmek

### Faz 3

- review media upload ve sipariş sonrası zengin etkileşimler
- bildirim ve kişiselleştirme yüzeyi

### Faz 4

- native release hardening
- signed release pipeline
- cihaz loglama ve crash reporting
- performans profili ve image/cache optimizasyonu

## Bu Turun Teslimi

- roadmap tab yerine müşteri odaklı fırsatlar yüzeyi
- büyük e-ticaret uygulamalarına yakın mobil ana ekran kurgusu
- mobil katalogda arama + parent kategori + marka + sort
- web ile mobil parity açığını dokümante eden net backlog
- zorunlu light theme ve daha koyu kontrast paleti ile okunabilirlik düzeltmesi
- mobile register ve forgot-password ekranları
- persisted wishlist provider, ürün kartı kaydet aksiyonu ve favoriler sayfası
- smoke test içinde register, forgot-password ve wishlist regression adımları
- support hub, contact form, SSS, about, privacy ve terms yüzeyleri
- profil güncelleme, kayıtlı adres yönetimi ve change-password kod akışı
- web smoke ortamında auth persistence için `localStorage` tabanlı token fallback
- mobile blog listesi, blog detay ve related product CTA yüzeyi
- confirm-email route’u ve token tabanlı session bootstrap
- mobile reviews hub, review create/update/delete akışı ve order detail CTA bağlantıları
- mobile returns hub, order detail return request CTA’sı ve stateful smoke doğrulaması
- mobile reset-password token çözümleme sertleştirmesi: query + path + hash uyumu
- mobile order detail’de direct `viewToken` açılışı ve kargo takip CTA’sı
