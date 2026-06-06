type CarrierTrackingMeta = {
  carrierLabel: string;
  trackingNumber: string;
  url: string;
};

function readValue(value: string) {
  return String(value || "").trim();
}

export function buildCarrierTrackingMeta(carrier: string, trackingNumber: string): CarrierTrackingMeta | null {
  const safeCarrier = readValue(carrier);
  const safeTrackingNumber = readValue(trackingNumber);

  if (!safeTrackingNumber) {
    return null;
  }

  const encodedTrackingNumber = encodeURIComponent(safeTrackingNumber);
  const normalizedCarrier = safeCarrier.toLowerCase();

  if (normalizedCarrier.includes("aras")) {
    return {
      carrierLabel: safeCarrier || "Aras Kargo",
      trackingNumber: safeTrackingNumber,
      url: `https://kargotakip.araskargo.com.tr/mainpage.aspx?code=${encodedTrackingNumber}`,
    };
  }

  if (normalizedCarrier.includes("yurtiçi") || normalizedCarrier.includes("yurtici")) {
    return {
      carrierLabel: safeCarrier || "Yurtici Kargo",
      trackingNumber: safeTrackingNumber,
      url: `https://www.yurticikargo.com/tr/online-islemler/gonderi-sorgula?code=${encodedTrackingNumber}`,
    };
  }

  if (normalizedCarrier.includes("mng")) {
    return {
      carrierLabel: safeCarrier || "MNG Kargo",
      trackingNumber: safeTrackingNumber,
      url: `https://www.mngkargo.com.tr/gonderi-sorgula?code=${encodedTrackingNumber}`,
    };
  }

  if (normalizedCarrier.includes("ptt")) {
    return {
      carrierLabel: safeCarrier || "PTT Kargo",
      trackingNumber: safeTrackingNumber,
      url: `https://www.ptt.gov.tr/tr/gonderi-sorgula?barcode=${encodedTrackingNumber}`,
    };
  }

  if (normalizedCarrier.includes("sürat") || normalizedCarrier.includes("surat")) {
    return {
      carrierLabel: safeCarrier || "Surat Kargo",
      trackingNumber: safeTrackingNumber,
      url: `https://www.suratkargo.com.tr/KargoTakip/Index?code=${encodedTrackingNumber}`,
    };
  }

  if (normalizedCarrier.includes("ups")) {
    return {
      carrierLabel: safeCarrier || "UPS",
      trackingNumber: safeTrackingNumber,
      url: `https://www.ups.com/track?tracknum=${encodedTrackingNumber}`,
    };
  }

  if (normalizedCarrier.includes("dhl")) {
    return {
      carrierLabel: safeCarrier || "DHL",
      trackingNumber: safeTrackingNumber,
      url: `https://www.dhl.com/tr-tr/home/tracking.html?tracking-id=${encodedTrackingNumber}`,
    };
  }

  return {
    carrierLabel: safeCarrier || "Kargo",
    trackingNumber: safeTrackingNumber,
    url: `https://www.google.com/search?q=${encodeURIComponent(`${safeCarrier} ${safeTrackingNumber} kargo takip`.trim())}`,
  };
}
