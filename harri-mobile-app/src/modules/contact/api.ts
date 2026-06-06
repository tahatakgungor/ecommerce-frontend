import { fetchJson } from "@/lib/http-client";

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

  return response?.message || "Mesajiniz basariyla iletildi.";
}
