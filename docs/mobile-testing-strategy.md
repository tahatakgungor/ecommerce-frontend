# Mobile Testing Strategy

Mobil uygulama buyudukce "sadece build geciyor mu" seviyesi yeterli olmaz. Yeni auth, cart, checkout veya tema degisiklikleri eski akislarin bozulmasina yol acabilecegi icin test ortami da uygulamayla birlikte buyumelidir.

## Test piramidi

### 1. Shared contract tests

Hedef:
- backend response degistiginde mobil ve web tarafi sessizce kirilmasin

Zorunlu alanlar:
- product normalization
- catalog normalization
- auth response envelope handling
- fiyat/medya helper'lari

Konum:
- `harri-mobile-app/__tests__/contracts.test.ts`
- ileride web tarafi da ayni `packages/commerce-contracts` paketini tukettikce bu koruma daha degerli olacak

### 2. State and guard tests

Hedef:
- session, cart, runtime config ve guvenlik kurallari sessiz regress olmasin

Zorunlu alanlar:
- runtime `https` guard
- cart quantity/stock logic
- token storage davranisi
- logout temizligi

Konum:
- `harri-mobile-app/__tests__/runtime.test.ts`
- `harri-mobile-app/__tests__/cart-logic.test.ts`

### 3. Route and integration tests

Hedef:
- route, tab ve screen composition kirmalari erken yakalansin

Not:
- Expo'nun resmi dokumani `jest-expo` ve gerekirse `expo-router/testing-library` ile route testleri oneriyor.
- React patch ve peer dependency hizasi netlestiginde component/integration katmani genisletilecek.

### 4. End-to-end and device tests

Hedef:
- checkout, deep link, payment callback, secure storage ve session yenileme gibi cihaz davranislarini gercek ortama yakin test etmek

Bir sonraki faz:
- EAS Workflows veya benzeri cihaz tabanli smoke
- login -> product detail -> add to cart -> logout
- deep link ile order/payment sonucu donusu
- WebView -> callback bridge -> app deep link -> confirm-payment zinciri
- account -> order list -> order detail route ayrimi

## Zorunlu teslim akisi

Mobil degisikliklerde minimum akış:

1. `npx tsc --noEmit`
2. `npm run test:ci`
3. `npx expo export --platform web`

Checkout veya auth degisikliginde buna ek:

1. device/emulator smoke
2. secure storage cleanup senaryosu
3. login/logout/session restore senaryosu
4. payment callback allowlist ve deep link replay senaryosu
5. tab route ve stack route ayrimi (`/account` vs `/orders/[id]`) 

## Neden bu kadar kati?

Cunku proje buyudukce tipik kirilma alanlari sunlar olacak:

- backend response sekli degisir
- yeni tenant config eski ekrani bozar
- cart hesap mantigi degisir
- mobile route/layout degisikligi eski tabi kirar
- auth/session persistence beklenmedik sekilde bozulur
- payment callback redirect zinciri acik redirect veya session kaybi nedeniyle bozulur
- Expo Router topolojisi yanlis kuruldugunda tab disi ekranlar URL degisip fark edilmeden index icerigine dusebilir

Test ortamı bu alanlari otomatik korumazsa hizla "degisiklik yaptik ama neresi bozuldu bilmiyoruz" noktasina gidilir.
