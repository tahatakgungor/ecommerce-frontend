import type { SavedAddress } from "@/modules/auth/types";

export function normalizeSavedAddresses(rawSavedAddresses: unknown): SavedAddress[] {
  if (!rawSavedAddresses) return [];

  if (Array.isArray(rawSavedAddresses)) {
    return rawSavedAddresses.filter(Boolean).map(normalizeSavedAddressItem);
  }

  if (typeof rawSavedAddresses === "string") {
    const trimmed = rawSavedAddresses.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.filter(Boolean).map(normalizeSavedAddressItem) : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function createEmptySavedAddress(): SavedAddress {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
    isDefault: false,
  };
}

export function setDefaultAddress(addresses: SavedAddress[], addressId: string) {
  return addresses.map((item) => ({
    ...item,
    isDefault: item.id === addressId,
  }));
}

export function removeSavedAddress(addresses: SavedAddress[], addressId: string) {
  const remaining = addresses.filter((item) => item.id !== addressId);
  if (!remaining.length) return [];

  if (!remaining.some((item) => item.isDefault)) {
    remaining[0] = {
      ...remaining[0],
      isDefault: true,
    };
  }

  return remaining;
}

export function upsertSavedAddress(addresses: SavedAddress[], nextAddress: SavedAddress) {
  const exists = addresses.some((item) => item.id === nextAddress.id);
  const nextAddresses = exists
    ? addresses.map((item) => (item.id === nextAddress.id ? nextAddress : item))
    : [...addresses, nextAddress];

  if (!nextAddresses.some((item) => item.isDefault)) {
    nextAddresses[0] = {
      ...nextAddresses[0],
      isDefault: true,
    };
  }

  if (nextAddress.isDefault) {
    return setDefaultAddress(nextAddresses, nextAddress.id);
  }

  return nextAddresses;
}

function normalizeSavedAddressItem(item: unknown): SavedAddress {
  const rawItem = typeof item === "object" && item ? (item as Partial<SavedAddress>) : {};
  return {
    id: String(rawItem.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    label: String(rawItem.label || ""),
    address: String(rawItem.address || ""),
    city: String(rawItem.city || ""),
    country: String(rawItem.country || ""),
    zipCode: String(rawItem.zipCode || ""),
    isDefault: Boolean(rawItem.isDefault),
  };
}
