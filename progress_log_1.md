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

## 2026-04-01 – Commit: About/Contact Cleanup, Mobile Nav, Product Card & UI Fixes

### Frontend (`harri-front-end`)

#### 🧹 Ekstra Hakkımızda Temizliği
- `Services`, `AboutGallery` ve `ShopCta` bileşenleri gereksiz görülerek Hakkımızda sayfasından tamamen kaldırıldı (böylece sadece `TextArea` kaldı).

#### 📱 Mobil UI Düzeltmeleri
- `Header` bileşeninde arama, profil, favoriler ve sepet butonlarının mobilde gizlenmesine neden olan `d-none d-md-block` sınıfları kaldırılarak mobilde doğrudan ulaşılabilirlik artırıldı.

#### 🔧 Dashboard Hata Giderme
- `user-dashboard-main-area` içindeki `useGetUserOrdersQuery` çağrısında 403 hatasını önlemek için `skip: !isAuthenticate` opsiyonu eklendi.

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

---

## 2026-04-04 – Fix: Product Detail 4.5 Half-Star Rendering

### Frontend (`harri-front-end`)
- `product-rating-summary` yarım yıldız katmanında bazı ürünlerde görülen render tutarsızlığı giderildi.
- Kök neden: icon font glyph kırpması (`overflow + width`) farklı tarayıcı/font kombinasyonlarında yarım yıldızı görünmez bırakabiliyordu.
- `_product.scss` içinde `tp-rating-summary__star` için sabit ölçü (`1em`) ve `absolute` katman düzeni uygulanarak 5. yıldızın yarım dolu görünümü stabilize edildi.
- Sonuç: `4.5` puanlı ürünlerde 5. yıldız artık tutarlı şekilde yarım görünüyor.

---

## 2026-04-04 – Test Suite Expansion + Checkout Redirect Fix

### Frontend (`harri-front-end`)
- **Checkout redirect bug fix**: guest checkout yönlendirmesi `/login?redirect=/checkout` olacak şekilde güncellendi.
- **Login redirect bug fix**: login formu `redirect` query parametresini okuyup başarı sonrası güvenli şekilde ilgili sayfaya yönlendiriyor.
- **Test edilebilirlik refactor'u**:
  - `src/utils/rating-visual.js` eklendi (yarım yıldız/fill logic)
  - `src/utils/saved-addresses.js` eklendi (savedAddresses normalize logic)
  - ilgili bileşen/hook dosyaları bu helper'lara taşındı.
- **Unit test altyapısı**: `vitest` eklendi (`npm run test:unit`).
- **Unit testler eklendi**:
  - `tests/unit/rating-visual.test.js` (4 test)
  - `tests/unit/saved-addresses.test.js` (4 test)

### Admin Panel (`harri-admin-panel`)
- **Test edilebilirlik refactor'u**:
  - `src/utils/review-status.ts` eklendi (review durum -> başlık eşlemesi)
  - `review-area.tsx` bu helper'ı kullanacak şekilde güncellendi.
- **Unit test altyapısı**: `vitest` eklendi (`npm run test:unit`).
- **Unit testler eklendi**:
  - `tests/unit/review-status.test.ts` (3 test)

### QA Regression (`qa-regression`)
- **Playwright senaryoları genişletildi**:
  - customer: guest checkout redirect, rating summary render, login redirect param davranışı (env varsa), mevcut smoke akışları.
  - admin: unauth dashboard->login redirect, reviews filtre davranışı (env varsa), mevcut smoke akışları.
- **API regression genişletildi**:
  - auth guard (token yokken checkout endpointleri engellenmeli)
  - `/api/user/me` doğrulaması
  - env eksikse fail yerine kontrollü skip davranışı.
- **README güncellendi**: yeni env değişkenleri ve kapsam notları eklendi.

### Doğrulama Sonuçları
- `harri-front-end`: `npm run lint` ✅, `npm run test:unit` ✅
- `harri-admin-panel`: `npm run lint` ✅, `npm run test:unit` ✅
- `qa-regression/ui`: canlı URL ile `npm run test` → **7 passed, 3 skipped** ✅
- `qa-regression/api-regression.test.mjs`: env yoksa kontrollü skip ✅

---

## 2026-04-04 – Production Checkout 403 Root Cause + Fix

### Sorun
- Login olunmuş olsa bile checkout sırasında `POST /api/order/create-payment-intent` çağrısı prod ortamda `403 Forbidden` dönüyordu.
- Request içinde `Authorization: Bearer ...` ve `access_token` cookie olmasına rağmen CSRF filtresi isteği reddediyordu.

### Kök Neden
- Cross-origin (Vercel -> Railway) mimaride frontend JS, API domain'inde set edilen `XSRF-TOKEN` cookie'sini okuyamadığı için `X-XSRF-TOKEN` header üretemiyor.
- Spring Security CSRF filtresi unsafe methodlarda header token beklediği için bu istekleri 403 ile kesiyordu.

### Uygulanan Çözüm
- Backend `SecurityConfig` tarafında `Authorization: Bearer ...` taşıyan istekler için CSRF kontrolü bypass edildi.
- Cookie-only akışlarda CSRF koruması korunurken, JWT bearer tabanlı SPA çağrıları prod’da çalışır hale getirildi.
- Login sonrası checkout redirect akışı da frontendde kesinleştirildi (`/login?redirect=/checkout`).

### Doğrulama
- Backend test: `SecurityConfigCsrfBypassTest` eklendi ve çalıştırıldı.
- Frontend lint + unit test + genişletilmiş Playwright smoke seti tekrar başarılı geçti (credential gerektiren adımlar env yoksa skip).

---

## Session Notu (Yeni Oturumlar İçin Zorunlu Odak)
- [ ] Mobil uyumluluk her değişiklikte birincil öncelik: mobile-first yaklaşım, 320px+ ekranlarda manuel kontrol.
- [ ] E-ticaret standardı responsive düzen: özellikle header, arama, ürün kartları, CTA butonları ve checkout alanlarında taşma/erişilebilirlik testi zorunlu.
- [ ] Test disiplini: her kritik bug fix sonrası ilgili test (unit/integration/e2e) eklenecek veya güncellenecek.
- [ ] Yayın öncesi kalite kapısı: frontend/admin lint + build + kritik smoke akışları geçmeden canlıya çıkılmayacak.
- [ ] Güvenlik ve doğruluk: kullanıcıyı yanıltacak yapay puan/yorum davranışları prod’da kullanılmayacak.

---

## 2026-04-04 – Order Item Navigation + Review Eligibility Hardening

### Backend (`ecommerce-platform/product-service`)
- `GET /api/products/{productId}/reviews/eligibility` endpoint’i eklendi.
- Review oluşturma kuralı merkezi bir eligibility değerlendirmesine taşındı:
  - sadece `Customer` rolü,
  - ürünün `delivered` siparişte bulunması,
  - aynı ürün için mevcut yorum olmaması.
- Yeni DTO: `ReviewEligibilityResponse`.
- Unit test genişletildi:
  - uygun müşteride `canReview=true`,
  - teslim edilmiş sipariş olsa da mevcut yorum varsa `canReview=false`.

### Frontend (`harri-front-end`)
- Ürün detay review formu eligibility endpoint’ine bağlandı.
- Uygun olmayan kullanıcıda form alanları disable, sebep metni görünür ve submit engellenir.
- Sipariş detay/fatura ekranında sipariş kalemleri ürün detayına linklendi.
- `delivered` sipariş kalemlerinde “Ürünü Değerlendir” CTA’sı eklendi (`/product-details/:id#reviews`).
- Null-safe iyileştirmeler:
  - `cardInfo` boşsa crash önlendi.
  - `cart` yoksa tablo güvenli çalışır.

### QA / Regression
- API regression’a auth guard kontrolü eklendi:
  - token yokken review eligibility endpoint’i 401/403 dönmeli.
- Playwright customer smoke’a yeni senaryo eklendi:
  - login -> dashboard -> sipariş detayı -> sipariş kaleminden ürün detayına gidiş.

---

## 2026-04-09 – Commit: FAQ/Legal Content Refresh + TR/EN Consistency

### Frontend (`harri-front-end`)
- **SSS sayfası sadeleştirildi**: üst görsel kaldırıldı, içerik alanı odaklı düzen korundu.
- **FAQ içeriği TR tarafında tamamen güncellendi**:
  - doğal Türkçe metinler,
  - daha net sipariş/kargo/kupon/iade açıklamaları,
  - anlaşılır soru-cevap akışı.
- **Gizlilik Politikası + Kullanım Koşulları güncellendi**:
  - içerikler revize edildi,
  - yürürlük/güncelleme tarihleri `9 Nisan 2026` olarak güncellendi.
- **TR/EN tutarlılık kontrolü**:
  - `site-pages-content` anahtar setleri karşılaştırıldı,
  - iki dil arasında eksik anahtar kalmadı (`onlyTr=0`, `onlyEn=0`).
- **UI/UX iyileştirmesi**:
  - FAQ tab hover/focus durumlarında kontrast ve erişilebilirlik güçlendirildi,
  - policy iletişim linkleri okunur ve tutarlı hale getirildi.

### Doğrulama
- `harri-front-end`: `npm run lint` ✅

### Commit
- `257ad01` – `Refresh FAQ/legal pages and fix TR-EN UX consistency`

---

## 2026-04-09 – Commit: Admin Panel Readability + Turkish Localization + Mobile UX

### Admin Panel (`harri-admin-panel`)
- **Genel okunabilirlik iyileştirmesi**:
  - global font-size/line-height yeniden dengelendi,
  - düşük kontrastlı metin tonları güçlendirildi,
  - küçük ekranlarda kart/tablo/pagination metinleri görünür hale getirildi.
- **Dil birliği (TR standardizasyonu)**:
  - sidebar menüleri ve alt menüler Türkçeleştirildi,
  - header arama/profil/çıkış metinleri güncellendi,
  - breadcrumb ve sayfa başlıkları (sipariş, kupon, kategori, marka, yorum, bülten, log vb.) Türkçeleştirildi,
  - dashboard başlıkları, recent orders metinleri ve durum etiketleri Türkçe hale getirildi.
- **Mobil uyumluluk güçlendirmesi**:
  - dashboard kartları ve recent orders mobil davranışı iyileştirildi,
  - tablo hücrelerinde mobil taşma yönetimi ve spacing düzenlendi,
  - activity log metadata bloğunda kırılma/okunabilirlik düzeltildi.
- **Meta/locale güncellemesi**:
  - admin app `lang="tr"` ve panel başlığı `"SERRAVİT Yönetim Paneli"` olarak güncellendi.

### Doğrulama
- `harri-admin-panel`: `npm run lint` ✅

### Commit
- `57c948a` – `Improve admin readability, TR localization, and mobile UX`
