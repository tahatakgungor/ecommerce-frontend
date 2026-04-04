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
