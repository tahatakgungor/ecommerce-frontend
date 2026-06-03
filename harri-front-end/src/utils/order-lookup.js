export function resolveLookupOrder(response) {
  const payload = response?.data;
  return payload?.order || payload?.data?.order || payload?.result?.order || null;
}

export function buildOrderLookupRedirect(orderId, formData = {}) {
  const invoice = encodeURIComponent(String(formData.invoice || "").trim());
  const email = encodeURIComponent(String(formData.email || "").trim());
  return `/order/${orderId}?invoice=${invoice}&email=${email}`;
}
