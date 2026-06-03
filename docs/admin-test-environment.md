# Admin Test Environment

Admin panel icin tekrar kuruluma gerek duymadan calisan local test ortami.

## Kapsam

Ilk paket su yuzeyleri kapsar:

- `product-list`
- `reviews`

Bu ortam, storefront fixture senkronundan gelen urun verisini baz alir. Boylece admin urun listesi katalogla senkron kalir.

## Komutlar

`harri-admin-panel` icinde calistir:

```bash
npm run test:env:sync
```

Admin fixture'larini uretir.

```bash
npm run test:env:start
```

Mock admin API + local admin panel test ortamını ayaga kaldirir.

Varsayilan portlar:

- Admin frontend: `http://localhost:3101`
- Admin mock API: `http://localhost:8082`

```bash
npm run test:env:smoke
```

Calisan test ortami uzerinde browser smoke testi kosar.

```bash
npm run test:env:verify
```

Fixture + mock API + admin app + smoke testi tek komutta calistirir.

## Notlar

- `api/admin/me` fixture tabanli cevap doner; bu sayede login'e takilmadan korumali sayfalar smoke test edilebilir.
- Review fixture'i ilk asamada sentetik moderasyon kayitlariyla gelir.
- Bir sonraki adimda `orders`, `coupon`, `contact-messages` ve `returns` yuzeyleri ayni katmana eklenebilir.
