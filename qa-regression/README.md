# QA Regression (API + UI E2E)

Bu klasor, canli calisan ortama karsi admin + musteri akisini uctan uca test eden regresyon setini icerir.

## API Kapsami
- Admin login
- Brand CRUD
- Category CRUD
- Product create/update/delete
- Coupon create/list/delete
- Auth guard (token yokken checkout endpointleri engellenmeli)
- Customer login
- Customer /me
- Customer create payment intent
- Order create
- Customer order list
- Admin order list

## API Testi Icin Env Degiskenleri
```bash
export API_BASE_URL=http://localhost:8081
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=your_admin_password
export CUSTOMER_EMAIL=customer@example.com
export CUSTOMER_PASSWORD=your_customer_password
```

Not: `API_BASE_URL` verilmezse API testleri fail yerine kontrollu olarak skip edilir.

## API Testini Calistirma
```bash
cd /Users/tahatakgungor/ecommerce_project/harri-ecommerce
node --test qa-regression/api-regression.test.mjs
```

## UI Smoke Kapsami (Playwright)
- Customer:
  - login/register form gorunurlugu
  - guest checkout -> login redirect
  - shop -> product -> cart -> checkout akisi
  - product details rating summary render kontrolu
  - login redirect parametresi (`/login?redirect=/checkout`) davranisi (opsiyonel credential)
  - mobil arama dropdown -> product details navigasyonu
- Admin:
  - login sayfasi smoke
  - unauth dashboard -> login redirect
  - login sonrasi dashboard/coupon/reviews erisimi (opsiyonel credential)
  - reviews filter butonlari ve baslik degisimi (opsiyonel credential)

## UI Testi Icin Env Degiskenleri
```bash
export CUSTOMER_APP_URL=http://localhost:3000
export ADMIN_APP_URL=http://localhost:3001
export ADMIN_UI_EMAIL=admin@example.com
export ADMIN_UI_PASSWORD=your_admin_password
export CUSTOMER_UI_EMAIL=customer@example.com
export CUSTOMER_UI_PASSWORD=your_customer_password
```

## UI Testini Calistirma
```bash
cd /Users/tahatakgungor/ecommerce_project/harri-ecommerce/qa-regression/ui
npm install
npx playwright install --with-deps
npm run test
```

## Notlar
- Test, kendi olusturdugu brand/category/product/coupon kayitlarini `finally` blogunda temizler.
- Siparis kaydi (order) kasitli olarak silinmez; siparis gecmisi regresyonu icin veri birakir.
- UI login testi icin `ADMIN_UI_EMAIL`/`ADMIN_UI_PASSWORD` verilmezse sadece login sayfasi smoke testi kosulur.

## Humat/Serravit Urun Importu
`qa-regression/scripts/import-humat-products.mjs` scripti:
- `serravit.com.tr` ve `humat.com.tr` uzerinden urun + kategori + fiyat verisi ceker.
- `/Users/tahatakgungor/ecommerce_project/humat` altindaki yerel gorselleri bu urunlerle eslestirir.
- Once `dry-run` plan dosyasi uretir; istenirse API'ye otomatik urun ekler.

### Dry-run (sadece plan olusturur)
```bash
cd /Users/tahatakgungor/ecommerce_project/harri-ecommerce
node qa-regression/scripts/import-humat-products.mjs
```

Plan ciktilari:
- `qa-regression/data/humat-product-import-plan.json`

### Gercek import (API'ye yazar)
```bash
cd /Users/tahatakgungor/ecommerce_project/harri-ecommerce
export API_BASE_URL=https://ecommerce-platform-production-a905.up.railway.app
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=your_admin_password
IMPORT=true node qa-regression/scripts/import-humat-products.mjs
```

Import raporu:
- `qa-regression/data/humat-product-import-plan.import-result.json`

## Kategori Taksonomisi Normalize Scripti
`qa-regression/scripts/restructure-category-taxonomy.mjs` scripti:
- Kategori yapısını 2 ana kategoriye standardize eder:
  - `Sağlık` -> `Gıda Takviyesi`, `Kozmetik`
  - `Tarım` -> `Gübre`, `Diğer`
- Ürünlerde `parent/category/children` alanlarını bu taksonomiye remap eder.
- Snapshot + rapor üretir; idempotent olarak tekrar çalıştırılabilir.

### Dry-run
```bash
cd /Users/tahatakgungor/ecommerce_project/harri-ecommerce
export API_BASE_URL=https://ecommerce-platform-production-a905.up.railway.app
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=your_admin_password
node qa-regression/scripts/restructure-category-taxonomy.mjs
```

### Apply
```bash
cd /Users/tahatakgungor/ecommerce_project/harri-ecommerce
export API_BASE_URL=https://ecommerce-platform-production-a905.up.railway.app
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=your_admin_password
APPLY=true node qa-regression/scripts/restructure-category-taxonomy.mjs
```

Çıktılar:
- `qa-regression/data/category-taxonomy-snapshot-*.json`
- `qa-regression/data/category-taxonomy-report-*.json`
