# UI Monitoring

Bu klasör storefront ve admin yüzeyleri için hafif sentetik kontrol ve temel yük testi komutlarını içerir.

## Sentetik UI doğrulama

```bash
STOREFRONT_BASE="https://serravit.com" \
ADMIN_BASE="https://admin.serravit.com" \
./ops/monitoring/verify-ui-surfaces.sh
```

Kontrol edilen yüzeyler:

- storefront `/`
- storefront `/shop`
- storefront `/blog`
- storefront `/contact`
- storefront `/faq`
- admin `/login`

## Storefront baseline yük testi

```bash
STOREFRONT_BASE="https://serravit.com" \
node ./ops/load-test/storefront-catalog-baseline.mjs
```

Ayarlanabilir env değişkenleri:

- `LOAD_REQUESTS`
- `LOAD_CONCURRENCY`
- `LOAD_MAX_P95_MS`
- `LOAD_MAX_FAILURE_RATE`

## Not

Bu testler public HTML yüzeylerini ölçer. Katalog API yük testi için backend reposundaki `ops/load-test/catalog-baseline.mjs` kullanılmalıdır.
