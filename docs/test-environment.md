# Storefront Test Environment

Bu ortamın amacı, storefront ürün akışlarını her seferinde canlı backend, CORS veya manuel port ayarıyla uğraşmadan ayağa kaldırmak.

## Ne kuruldu

- `harri-front-end/tests/test-env/sync-public-fixtures.mjs`
  - Public katalog endpointlerini canlı ortamdan çekip fixture olarak kaydeder.
- `harri-front-end/tests/test-env/mock-api-server.mjs`
  - Frontend'in beklediği `8081` API portunda fixture tabanlı local mock API açar.
- `harri-front-end/tests/test-env/start-test-env.mjs`
  - Gerekirse fixture sync yapar, mock API'yi başlatır, ardından frontend'i test ortamı için ayağa kaldırır.
- `harri-front-end/tests/test-env/shop-smoke.mjs`
  - Homepage, shop, search, product details, order lookup, email view token, çoklu marka, özel fiyat aralığı, boş sonuç ekranı ve mobil filtre drawer akışlarını browser seviyesinde smoke test eder.

## Komutlar

`harri-front-end` içinde çalıştır:

```bash
npm run test:env:sync
```

Canlı public veriden fixture yeniler.

```bash
npm run test:env:start
```

Mock API + storefront test ortamını başlatır.

Varsayılan portlar:

- Frontend: `http://localhost:3002`
- Mock API: `http://localhost:8081`

```bash
npm run test:env:smoke
```

Çalışan test ortamı üzerinde shop smoke testini koşturur.

```bash
npm run test:env:verify
```

Fixture check + mock API + frontend + smoke test akışını tek komutta çalıştırır.

## Senkron çalışma prensibi

- Fixture'lar canlı public ürün/kategori/site settings verisinden üretilir.
- Ürün yapısı değiştiğinde önce `npm run test:env:sync` çalıştırılır.
- Bu sayede test ortamı canlı ürün seviyesine yakın kalır ama çalıştırma anında canlı backend'e bağımlı olmaz.

## Notlar

- Bu katman public katalog + guest order lookup yüzeylerini kapsar.
- Daha geniş proje coverage matrisi için [project-test-integration.md](/Users/tahatakgungor/ecommerce_project/harri-ecommerce/docs/project-test-integration.md) dosyasına bakın.
- Browser smoke scripti sistemde yüklü Chrome'u kullanır. Gerekirse `PLAYWRIGHT_CHROME_PATH` ile manuel yol verilebilir.
