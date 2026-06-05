# Mobile Test Environment

Bu ortamın amacı mobil order hub, cart ve checkout giriş akışlarını her değişiklikte tekrar oynatılabilir hale getirmektir.

## Ne kuruldu

- `harri-mobile-app/tests/test-env/start-test-env.mjs`
  - Storefront fixture'larını kontrol eder, aynı mock API'yi mobil origin için ayağa kaldırır ve Expo web'i test modu ile başlatır.
- `harri-mobile-app/tests/test-env/mobile-smoke.mjs`
  - Guest order lookup, login, order detail, cart ve checkout girişini browser seviyesinde smoke test eder.
- `harri-front-end/tests/test-env/mock-api-server.mjs`
  - Mobilin kullandığı auth ve user-order endpoint'lerini de fixture tabanlı cevaplayacak şekilde genişletildi.

## Komutlar

`harri-mobile-app` içinde çalıştır:

```bash
npm run test:env:start
```

Mock API + mobile web test ortamını başlatır.

Varsayılan portlar:

- Mobile web: `http://localhost:3003`
- Mock API: `http://localhost:8081`

```bash
npm run test:env:smoke
```

Çalışan mobil test ortamı üzerinde smoke testi koşturur.

```bash
npm run test:env:verify
```

Fixture check + mock API + Expo web + smoke test akışını tek komutta çalıştırır.

## Kapsam

Bu smoke akışı şu yüzeyleri doğrular:

- `/account` guest lookup kartı
- invoice + email ile guest order detail
- login sonrası authenticated order hub
- order detail route
- catalog -> product detail -> add to cart
- cart -> checkout giriş ekranı

## Notlar

- Mock API storefront fixture'larını yeniden kullanır; fixture eksikse önce storefront sync çalıştırılır.
- Browser smoke scripti sistemde yüklü Chrome'u kullanır. Gerekirse `PLAYWRIGHT_CHROME_PATH` ile manuel yol verilebilir.
