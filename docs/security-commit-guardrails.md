# Security Commit Guardrails

Bu repo icinde secret, credential veya prod'e ait hassas veri commit/push edilmeden once yerelde hizli bir tarama yapilmalidir.

## Hedef

- gercek secret sizmalarini erken yakalamak
- test fixture kaynakli generic password yanlis-pozitiflerini azaltmak
- `.env`, private key ve benzeri dosyalarin staging'e girmesini daha erken fark etmek

## Komut

Repo root'ta calistir:

```bash
node ./ops/security/check-staged-secrets.mjs
```

## Ne kontrol eder

- staged `.env`, `.pem`, `.key`, `id_rsa` benzeri hassas dosyalar
- private key bloklari
- AWS/GitHub/Slack/Stripe/SendGrid benzeri acik token pattern'leri
- `password`, `secret`, `apiKey`, `clientSecret` gibi alanlara yazilmis supheli literal degerler

## Notlar

- `fixture-`, `dummy-`, `test-`, `smoke-`, `mock-` gibi acikca non-secret test literal'leri allowlist edilir
- bu script gizli veriyi garantiyle tespit etmez; son karar yine manuel review'dur
- test env fixture'larinda gercek credential gorunumlu degerler yerine acikca non-secret isimlendirme kullanilmalidir
