import { fetchJson } from "@/lib/http-client";
import { normalizeTurkishText } from "@/lib/normalize-turkish-text";

export type ContactMessagePayload = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

type ContactResponse = {
  success?: boolean;
  message?: string;
};

export async function sendContactMessage(payload: ContactMessagePayload) {
  const response = await fetchJson<ContactResponse>("/api/contact/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return normalizeTurkishText(response?.message || "Mesajınız başarıyla iletildi.");
}
