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
- profil güncelleme
- şifre değiştirme doğrulama kodu akışı
- sipariş listesi ve sipariş detayı
- favori / istek listesi
- destek merkezi / iletişim / SSS / politika / kullanım koşulları
- smoke / regression test omurgası

### Eksik kalan büyük yüzey

- auth yan akışları: email verify / reset confirm deep link hardening
- blog yüzeyi
- dashboard fonksiyonlarının tam paritesi: review / returns / detaylı profil araçları

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

- içerik sayfaları: blog
- dashboard içindeki review / profile / return alt akışları
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
