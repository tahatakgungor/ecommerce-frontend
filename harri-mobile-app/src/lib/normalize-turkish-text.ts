const literalReplacements = new Map<string, string>([
  ["Degerlendirmeniz alindi.", "Değerlendirmeniz alındı."],
  ["Iade talebiniz alindi.", "İade talebiniz alındı."],
  ["Dogrulama e-postasi gonderildi.", "Doğrulama e-postası gönderildi."],
  ["Sifre sifirlama baglantisi gonderildi.", "Şifre sıfırlama bağlantısı gönderildi."],
  ["Sifre basariyla guncellendi.", "Şifre başarıyla güncellendi."],
  ["Profil guncellendi.", "Profil güncellendi."],
  ["Dogrulama kodu gonderildi.", "Doğrulama kodu gönderildi."],
  ["Sifre guncellendi.", "Şifre güncellendi."],
  ["E-posta dogrulandi.", "E-posta doğrulandı."],
  ["Mesajiniz basariyla iletildi.", "Mesajınız başarıyla iletildi."],
  ["Iade talebi olusturuldu.", "İade talebi oluşturuldu."],
  ["Iadeler yuklenemedi.", "İadeler yüklenemedi."],
  ["Siparisler yuklenemedi.", "Siparişler yüklenemedi."],
  ["Siparis yuklenemedi.", "Sipariş yüklenemedi."],
  ["Siparis kimligi eksik.", "Sipariş kimliği eksik."],
  ["Siparis bulunamadi.", "Sipariş bulunamadı."],
  ["Siparis goruntuleme linki gecersiz.", "Sipariş görüntüleme linki geçersiz."],
  ["Sifre en az 6 karakter olmali.", "Şifre en az 6 karakter olmalı."],
  ["Sifreler eslesmiyor.", "Şifreler eşleşmiyor."],
  ["Gecerli bir e-posta girin.", "Geçerli bir e-posta girin."],
  ["Sifirlama baglantisi eksik veya gecersiz.", "Sıfırlama bağlantısı eksik veya geçersiz."],
]);

export function normalizeTurkishText(value: string) {
  let normalized = value;

  for (const [source, target] of literalReplacements) {
    if (normalized.includes(source)) {
      normalized = normalized.replaceAll(source, target);
    }
  }

  return normalized;
}
