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
- sipariş listesi ve sipariş detayı
- smoke / regression test omurgası

### Eksik kalan büyük yüzey

- müşteri dostu mobil ana sayfa
- arama ve filtre deneyimi
- kampanya ve fırsat yüzeyi
- istek listesi
- auth yan akışları: kayıt / şifre sıfırla / email verify
- içerik sayfaları
- dashboard fonksiyonlarının tam paritesi

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

- içerik sayfaları: SSS, iletişim, blog, politika
- dashboard içindeki review / profile alt akışları
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
