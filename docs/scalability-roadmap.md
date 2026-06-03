# Scalability Roadmap

## Current assessment

The project is functionally stable for the current stage, but it is not fully ready for large growth without backend and data-access changes.

The biggest current risks are:

1. Storefront catalog flows still fetch the full product set and filter on the client.
2. Some authenticated screens use aggressive refetch behavior or polling.
3. Search, related products, shop filters, and several merchandising blocks reuse the same broad product feed instead of focused API queries.
4. Admin list pages also depend on full-list fetches without server pagination.
5. There is no visible evidence in this repo of API-side rate limiting, queueing, index strategy, or read-model separation.

## Immediate fixes already applied

1. Storefront category filtering was hardened against taxonomy mismatches.
2. Review-login redirect flow was covered with unit tests.
3. Order lookup and return request flows were extracted into pure helpers and covered with unit tests.
4. User dashboard order polling was reduced from 15s to 60s and no longer self-refetches on every successful response.

## Priority roadmap

### Phase 1: Remove client-side full-catalog dependency

Target surfaces:

- `/shop`
- `/search`
- related products
- cart related products
- blog detail related product lookups
- search form autocomplete

Required API capabilities:

1. `GET /api/products`
   - query params: `page`, `size`, `sort`, `category`, `parentCategory`, `brand`, `q`, `minPrice`, `maxPrice`, `withMedia`, `status`
   - returns: `items`, `total`, `page`, `size`, `totalPages`, `facets`
2. `GET /api/products/related`
   - input should be product id or stable taxonomy fields
   - result must already be ranked and size-limited
3. `GET /api/products/search/suggest`
   - lightweight autocomplete payload

Frontend migration goal:

1. Stop using `useGetShowingProductsQuery()` as the base for filtering.
2. Replace client filtering with URL-driven server filtering.
3. Keep current filter helpers only for UI/query construction, not data slicing.

### Phase 2: Reduce authenticated traffic pressure

Target surfaces:

- user dashboard
- order detail
- review overview
- admin dashboard widgets

Required changes:

1. Replace polling with event-driven invalidation where possible.
2. Keep polling only for truly live operational screens.
3. Add `providesTags` and `invalidatesTags` consistently for user orders and profile-adjacent data.
4. Move expensive dashboard cards to separate endpoints with caching headers or read models.

### Phase 3: Admin scale readiness

Current admin risks:

1. product grids/lists fetch all products
2. coupon list fetches all coupons
3. blog manager reads broad product feeds
4. order list growth will eventually hurt render time and memory

Required API capabilities:

1. paginated product list
2. paginated coupon list
3. paginated orders with filter params
4. lightweight product selector endpoint for admin forms

Frontend goal:

1. all tables use server pagination
2. filtering and search move server-side
3. only detail pages fetch full record payloads

### Phase 4: Backend and data layer requirements

These are outside the visible scope of this repo but are required for real growth:

1. database indexes for:
   - product slug/id
   - category parent/child
   - brand
   - order user id
   - order invoice
   - review product id + createdAt
2. cache strategy:
   - CDN caching for public catalog reads
   - short API response caching for category, banner, blog listing, site settings
3. rate limiting:
   - auth
   - order lookup
   - review voting
   - media upload
4. async processing:
   - email sending
   - review media transforms
   - analytics/event fan-out
5. observability:
   - request latency
   - cache hit rate
   - API error rate
   - queue depth
   - slow query logging

### Phase 5: Delivery and infrastructure

Required operational baseline:

1. separate environments for dev, staging, prod
2. repeatable deployment pipeline
3. rollback-safe releases
4. image asset CDN
5. alerting on 5xx rate and latency spikes

## Recommended implementation order

1. Build server-filtered catalog API contract.
2. Migrate storefront `/shop` and `/search`.
3. Migrate admin product and order lists to server pagination.
4. Remove remaining broad product feed dependencies.
5. Add API and database observability.

## Definition of “ready for growth”

We should consider the system meaningfully ready only when:

1. no critical user flow depends on full catalog fetches
2. admin tables are paginated server-side
3. authenticated dashboards do not rely on aggressive polling
4. public catalog endpoints are cacheable
5. backend indexes, rate limiting, and monitoring are in place
