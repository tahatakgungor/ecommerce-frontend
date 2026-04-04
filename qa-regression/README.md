# QA Regression (API E2E)

Bu klasor, canli calisan backend'e karsi admin + musteri akisini uctan uca test eden bir regresyon testi icerir.

## Kapsam
- Admin login
- Brand CRUD
- Category CRUD
- Product create/update/delete
- Coupon create/list/delete
- Customer login
- Order create
- Customer order list
- Admin order list

## Gereken Env Degiskenleri
```bash
export API_BASE_URL=http://localhost:8081
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=your_admin_password
export CUSTOMER_EMAIL=customer@example.com
export CUSTOMER_PASSWORD=your_customer_password
```

## Calistirma
```bash
cd /Users/tahatakgungor/ecommerce_project/harri-ecommerce
node --test qa-regression/api-regression.test.mjs
```

## Notlar
- Test, kendi olusturdugu brand/category/product/coupon kayitlarini `finally` blogunda temizler.
- Siparis kaydi (order) kasitli olarak silinmez; siparis gecmisi regresyonu icin veri birakir.
