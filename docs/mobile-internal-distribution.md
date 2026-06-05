# Mobile Internal Distribution

Bu dokuman Android/iOS internal build ve cihaz smoke akisini standartlastirir.

## Kurulan yapi

- `harri-mobile-app/app.config.js`
  Variant-aware Expo config. `preview` ve `production` icin app id ayrimi yapar.
- `harri-mobile-app/eas.json`
  `preview`, `ios-simulator` ve `production` EAS profilleri.
- `harri-mobile-app/scripts/check-build-readiness.mjs`
  Build oncesi env, package id ve scheme kontrolu.
- `harri-mobile-app/scripts/run-release-gate.mjs`
  Secret scan + preflight + test + export + smoke zincirini tek komutta calistirir.

## Profil mantigi

- `preview`
  Internal distribution icin cihaz build'i.
- `ios-simulator`
  iOS simulator smoke icin preview varyanti.
- `production`
  Store build'i.

Preview build package/bundle suffix:

- Android: `.preview`
- iOS: `.preview`

Bu sayede ayni cihazda production ve preview ayni anda kurulabilir.

## Preflight

`harri-mobile-app` icinde:

```bash
EXPO_PUBLIC_API_BASE_URL=https://api.example.com npm run preflight:preview
EXPO_PUBLIC_API_BASE_URL=https://api.example.com npm run preflight:production
```

Tek komut release gate:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8081 npm run gate:preview
EXPO_PUBLIC_API_BASE_URL=https://api.example.com npm run gate:production
```

## Build komutlari

```bash
cd harri-mobile-app
EXPO_PUBLIC_API_BASE_URL=https://api.example.com npm run build:preview:android
EXPO_PUBLIC_API_BASE_URL=https://api.example.com npm run build:preview:ios
EXPO_PUBLIC_API_BASE_URL=https://api.example.com npm run build:ios:simulator
EXPO_PUBLIC_API_BASE_URL=https://api.example.com npm run build:production:android
EXPO_PUBLIC_API_BASE_URL=https://api.example.com npm run build:production:ios
```

## Cihaz smoke checklist

1. Login
2. Order list
3. Order detail
4. Catalog -> product detail
5. Add to cart
6. Checkout start
7. Payment WebView acilisi
8. Deep link callback donusu
9. Payment result success
10. Cart clear + pending session clear

## Deep link smoke

iOS simulator:

```bash
xcrun simctl openurl booted 'serravitmobile://payment-result?checkoutSessionId=session-123&token=fixture-token&status=success'
```

Android emulator:

```bash
adb shell am start -W -a android.intent.action.VIEW -d 'serravitmobile://payment-result?checkoutSessionId=session-123&token=fixture-token&status=success'
```

## Preview QA route

Preview ve development varyantlarinda `roadmap` sekmesinden `QA Checkout Smoke` aksiyonu acilir.

Bu ekran:

- fixture pending session yaratir
- success callback tetikler
- mismatch callback tetikler
- error callback tetikler
- session temizligi yapar

## Guardrail'ler

- `EXPO_PUBLIC_API_BASE_URL` preview disinda `https` olmak zorunda
- internal build oncesi local secret scan calistirilir
- preview build ile production build ayni package id'yi paylasmaz
- payment callback testi session mismatch ve expiry senaryolarini da kapsar
