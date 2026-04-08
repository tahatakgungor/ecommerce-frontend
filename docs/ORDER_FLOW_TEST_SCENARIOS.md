# Order Flow Test Scenarios

## Scope
- Admin mobile UX (`Recent Orders`)
- Iyzico 3D flow (mobile + desktop)
- Guest/authenticated order visibility and security
- Blog UI/UX and related product data integrity

## A) Admin Mobile Dashboard
1. Open `/dashboard` at `360x800` and `390x844`.
Expected: `Recent Orders` appears as cards, no horizontal overflow.

2. Change status from card.
Expected: API update succeeds, status badge refreshes (`pending/processing/shipped/delivered/cancelled`).

3. Use `View` and `Print` actions from card.
Expected: detail page opens and print dialog is triggered.

## B) Iyzico 3D Payment
1. Start payment from `/checkout`.
Expected: on mobile, full-screen payment shell opens; on desktop inline view remains usable.

2. Complete 3D password step.
Expected: iframe auto-resizes and stays in viewport; input can be reached without stuck scroll.

3. Callback navigation.
Expected: top window is redirected to `/order/payment-result` and confirmation finishes.

## C) Guest vs Authenticated Order Access
1. Authenticated user opens own `/order/{id}`.
Expected: order detail loads.

2. Authenticated user opens another user's order id.
Expected: blocked by ownership check.

3. Guest opens `/order/{id}` without query.
Expected: blocked with verification requirement.

4. Guest opens via lookup (`invoice+email`).
Expected: success when matching, generic error when not matching.

## D) Blog
1. `/blog` list render.
Expected: safe fallback image, readable excerpt, read-time label.

2. `/blog/{slug}` details render.
Expected: sanitized HTML is rendered, no script/iframe execution.

3. Related products.
Expected: resilient mapping for title/name, image fallback, and price fallback.

## Validation Commands Executed
```bash
cd /Users/tahatakgungor/ecommerce_project/ecommerce-platform/product-service
./mvnw -q -DskipTests compile

cd /Users/tahatakgungor/ecommerce_project/harri-ecommerce/harri-admin-panel
npm run build

cd /Users/tahatakgungor/ecommerce_project/harri-ecommerce/harri-front-end
npm run build
```

## Validation Summary
- Backend compile: passed
- Admin panel build: passed
- Storefront build: passed
- `OrderServiceTest` static-mock environment issue persists in local runner (Mockito mock maker config), unrelated to this patch set
