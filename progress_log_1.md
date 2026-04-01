# Serravit E-Commerce – Progress Log

## 2026-04-01 – Commit: SSR Fixes, Search Autocomplete, Contact API

### Frontend (`harri-front-end`)
- **SSR localStorage fix**: `localStorage` çağrıları güvenli wrapper ile client-side'a taşındı
- **Next.js 15 `searchParams` fix**: `search/page.js` async hale getirildi, `Suspense` hatası giderildi
- **Arama Autocomplete**: Header search box'a anlık ürün öneri dropdown'u eklendi (debounce + sonuç vurgulama)
- **Mobil Search Bar**: Hamburger menüden ayrı, toggle ile açılan mobil arama alanı eklendi
- **Çoklu dil desteği** (TR/EN): `LanguageContext` içinde yeni translation key'leri eklendi (`noResults`, `viewAllResults`)

### Backend (`ecommerce-platform`)
- **ContactController**: `POST /api/contact` endpoint'i eklendi (iletişim formu)
- **ContactRequest DTO**: E-posta, isim, mesaj, konu alanlarını doğrulayan DTO
- **SecurityConfig**: `/api/contact` endpoint'i public erişime açıldı
- **EmailService**: İletişim formu için e-posta gönderimi entegre edildi

---

## 2026-04-01 – Commit: About/Contact Cleanup, Mobile Nav & Product Card Fixes

### Frontend (`harri-front-end`)

#### 🧹 Hakkımızda Sayfası Temizliği
- `Teams`, `Awards`, `Brands`, `AboutFaqs` bileşenleri kaldırıldı (template / İngilizce sahte içerik)
- Breadcrumb başlığı `"Welcome to our Harri Shop"` → `"SERRAVİT'e Hoşgeldiniz"` olarak güncellendi
- Kalan bölümler: TextArea (Serravit tanıtımı), Services (istatistikler), AboutGallery

#### 🧹 İletişim Sayfası Temizliği
- `TopBar` bileşeni kaldırıldı (çift başlık oluşturuyordu)
- Sayfa artık doğrudan iletişim kartları (BoxItems) ile başlıyor

#### 📱 Mobil – Sepet / Favoriler / Profil Erişimi
- Off-canvas menüye (hamburger açılır panel) hızlı erişim çubuğu eklendi:
  - **Profil** (giriş yapılmışsa avatar/baş harf, yapılmamışsa Login linki)
  - **Favoriler** (wishlist badge ile ürün sayısı)
  - **Sepet** (cart badge ile miktar)
- Dil değiştirici (TR/EN) offcanvas paneline de eklendi
- Off-canvas `'use client'` direktifi eklendi (`useSelector`, `useCartInfo` hook'ları için)

#### 🛒 Ürün Kartları – Mobil İyileştirme
- `SingleProduct`: Mobilde (xs/sm) ürün içeriğinin altına her zaman görünür
  "Sepete Ekle" + favoriler butonları eklendi (`product__mobile-actions`)
- Desktop hover aksiyonları `d-none d-md-flex` ile korundu
- `SingleListProduct`: `add_cart_product` ve `add_to_wishlist` dispatch bağlantıları
  düzeltildi (önceden hiçbiri çalışmıyordu), `isAddedToCart` / `isWishlistAdded`
  state'leri eklendi, indirimli fiyat desteği (`OldNewPrice`) eklendi

#### 🎨 SCSS
- `_product.scss`: `.product__mobile-actions` ve `.product-add-cart-btn--mobile` stilleri eklendi
- `_offcanvas.scss`: `.offcanvas__action-bar` ve `.offcanvas__action-icon` stilleri eklendi

---

## Planlanan / Bekleyen
- [ ] Hakkımızda galerisinde gerçek Serravit görselleri ile güncelleme
- [ ] Ürün detay sayfasında stok kontrolü
- [ ] Mobil checkout akışı test
