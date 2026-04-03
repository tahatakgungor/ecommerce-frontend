import { redirect } from "next/navigation";

// Müşteri düzenleme sayfası artık kullanılmıyor - müşteriler sadece görüntülenebilir
export default function CustomerEditPage() {
  redirect("/our-staff");
}
