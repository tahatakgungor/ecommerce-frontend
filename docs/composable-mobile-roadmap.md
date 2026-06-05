# Composable Mobile Roadmap

Bu dokumanin amaci mevcut Serravit projesini sadece "bir mobil kabuk" haline getirmek degil, daha sonra farkli marka veya sektorler icin hizla uyarlanabilecek bir commerce platformuna donusturmektir.

## Tasarim ilkesi

Aktif urun bugun Serravit olarak kalir. Fakat mimari:

- tema ve yazi tonu
- kategori taksonomisi
- landing bloklari
- merchandising kurallari
- checkout ve fulfillment farklari

gibi alanlari domain config ile ayirir.

Boylece ileride farkli bir sektor geldiginde mevcut sistemi bastan yazmak yerine yeni tenant/domain paketi eklenir.

## Hedef mimari

## Repo stratejisi

Tercih:

- mobil uygulama ayni repo icinde kalir

Sebep:

- mevcut repo zaten storefront + admin coklu uygulama yapiyor
- mobil taraf web ile ayni backend contractlarini tuketecek
- tenant/domain config ayrismasi ayni repo icinde daha hizli ilerler
- tasarim, katalog ve checkout kararlarini tek yerde senkron tutmak daha kolaydir

Onerilen repo topolojisi:

- `harri-front-end`
- `harri-admin-panel`
- `harri-mobile-app`
- ileride eklenecek `packages/*`

Ileride `packages/*` altina alinacak ortak alanlar:

- tenant config
- commerce DTO/contracts
- price/media helpers
- analytics event names
- feature flag keys

Ayrica yeni repo ancak su durumda dusunulmeli:

- mobil ekip tamamen ayri release cadence ile calisacaksa
- API contractlari artik baska ekip tarafindan yonetiliyorsa
- CI/CD ve gizli degisken yonetimi operasyonel olarak ayrilmak zorundaysa

Bugun icin bu kosullar yok; bu nedenle ayni repo icinde ilerlemek daha dogru.

### 1. Commerce Core

Sektor bagimsiz katman:

- katalog sorgulari
- urun detay modeli
- fiyatlama ve promosyon gostergeleri
- sepet
- auth/session
- siparis olusturma
- favoriler
- yorumlar

Bu katman hem web hem mobil tarafinda ayni API contract ile calisir.

### 2. Tenant Pack

Tenant bazli degisen katman:

- brand name
- renk sistemi
- tipografi
- hero mesajlari
- homepage section composition
- kategori agaci
- operasyonel metinler

Bugun `serravit` aktif tenant olur. Yarin yeni tenant geldiginde ayri paket veya config dosyasi eklenir.

### 3. Mobile Experience Layer

Mobil tarafta web'i oldugu gibi sarmak yerine su katman ayristirilir:

- mobil navigation
- native image handling
- optimistic list rendering
- mobile cache strategy
- deep link handling
- push notifications
- native checkout bridge

### 4. Scale Layer

Yuksek trafik icin gerekenler:

- cacheable catalog endpoints
- mobile BFF/read model
- image CDN
- queue-based async jobs
- metrics + tracing + alerting
- rate limiting

## Fazlar

### Faz 1: Foundation

Hedef:
- Expo tabanli mobil uygulama iskeleti
- tenant-aware tasarim sistemi
- canli katalog snapshot
- env ve dagitim hattinin olusmasi

Teslim:
- `harri-mobile-app`
- active tenant config
- roadmap ve temel katalog ekranlari

### Faz 2: Shared Contracts

Hedef:
- web ve mobil icin ortak API modelleme
- storefront tarafindaki katalog ve urun DTO uyumsuzluklarini azaltmak
- auth ve order contractlarini netlestirmek

Teslim:
- dokumante request/response contractlari
- mobil icin ortak API client
- hata ve bos durum stratejisi

### Faz 3: Mobile Commerce Flows

Hedef:
- login/register
- sepet
- checkout hazirligi
- siparis goruntuleme

Teslim:
- session yonetimi
- cart persistence
- native-friendly checkout hazirligi

### Faz 4: Payment and Identity Hardening

Hedef:
- Iyzico ve Stripe akislarini native ortama gore test etmek
- redirect, callback, cookie ve CSRF davranisini sertlestirmek

Teslim:
- deep link callback plani
- native web/payment handoff
- failure recovery senaryolari
- mobile-aware callback bridge (`/api/payment-callback -> app deep link`)
- secure pending payment session store

### Faz 5: Scale and Operations

Hedef:
- mobile BFF
- cache katmani
- image optimization
- queue + observability

Teslim:
- p95 performans takibi
- mobile release gozlemleme
- yuksek trafik icin release checklist

## Altyapi kararlari

### Mobil framework

- `Expo + React Native`

Sebep:
- hizli Android/iOS cikisi
- native capability ekleme kolayligi
- EAS ile build/update hattinin guclu olmasi
- performansli image/navigation/runtime zinciri

### Backend stratejisi

Kisa vade:
- mevcut Spring Boot API kullanilir

Orta vade:
- mobil icin optimize BFF/read model katmani eklenir

Uzun vade:
- katalog ve siparis trafiklerini ayiran cache ve queue stratejisi uygulanir

## Tema/sector gecisine hazirlik

Sistem su alanlarda sert kod bagimliligindan cikarilmalidir:

- category slugs
- homepage section order
- static metinler
- product badges
- campaign blocks
- navigation labels

Mobil iskelette bu ayrisma active tenant config ile baslatildi.

## Baslanan teknik isler

- yeni Expo tabanli mobil uygulama klasoru eklendi
- active tenant config olusturuldu
- katalog snapshot akisi mobil tarafa tasindi
- roadmap ekranlari eklendi
- repo icinde paylasilabilir `packages/commerce-contracts` cekirdegi olusturuldu
- merkezi timeout/JSON dogrulamali mobile HTTP client eklendi
- production'da `https` zorunlulugu icin runtime guard eklendi
- katalog ekraninda daha buyuk veri setleri icin `FlatList` tabanli render deseni kuruldu
- session bootstrap, login ve logout temeli eklendi
- access token saklama `SecureStore`, cart persistence `AsyncStorage` uzerinden ayrildi
- bearer tabanli authenticated mobile request hattina gecildi
- product detail ekranindan cart aksiyonu ve cart sekmesi kuruldu
- mobile checkout formu, secure pending payment state ve `payment-result` deep link route'u eklendi
- payment HTML'i cihaz storage'ina yazmadan gecici memory katmaninda tutan checkout provider kuruldu
- storefront callback route mobil donus URL'lerini allowlist ile kabul edecek sekilde bridge haline getirildi
- backend `initialize-payment` akisi mobil donus URL'sini validate edip callback URL'ye encode edecek hale getirildi
- `account` sekmesi order hub'a cevrildi; auth order history, guest lookup ve order detail rotasi eklendi
- Expo Router topolojisi root stack + `(tabs)` group modeline alinarak tab disi route'larin index'e dusme riski kaldirildi
- EAS internal distribution icin variant-aware Expo config, `preview/production` profile ayrimi ve build preflight scripti eklendi
- checkout ticari mantigi mobilde hardcode olmaktan cikarildi; site settings tabanli kargo kurali ve coupon read-model eklendi

## Guvenlik ve performans guardrail'leri

Bu mobil foundation asagidaki kurallarla ilerler:

1. production API adresi `https` olmak zorunda
2. secret, API key veya admin credential mobil bundle icine gomulmez
3. auth geldiginde token persistence dogrudan `AsyncStorage`'a yazilmaz; guvenli saklama stratejisi ayri ele alinir
4. network katmani tek yerden timeout ve response validation uygular
5. buyuk urun listeleri `map + ScrollView` ile degil sanallastirilmis liste desenleriyle render edilir
6. mobil checkout akislari production'a cikmadan once deep link / callback / replay / timeout senaryolariyla test edilir
7. cart gibi hassas olmayan local state ile auth token ayni persistence katmanina konulmaz
8. odeme callback redirect'leri acik redirect yaratmayacak sekilde prefix allowlist ile dogrulanir
9. iyzico checkout HTML'i kalici local storage'a yazilmaz; sadece aktif oturum boyunca memory'de tutulur
10. tab disi ekranlar (`product`, `checkout`, `orders`, `payment-result`) root stack altinda tanimlanir; tab shell icine gomulmez

## Sonraki en dogru uygulama adimlari

1. cihaz/emulator seviyesinde login -> order list -> order detail -> checkout smoke
2. Stripe ve Iyzico failure-path parity
3. mobile BFF ile site settings / shipping rule / coupon read-model ayrimi
4. push notification + siparis durum degisim eventleri
5. EAS build artifact alip gercek cihaz kurulumu ile smoke sonucunu kaydetmek
