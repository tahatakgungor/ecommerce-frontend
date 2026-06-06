import type { CatalogProduct } from "@/modules/catalog/types";

export type NotificationPreferenceKey =
  | "orderUpdates"
  | "campaignAlerts"
  | "priceDropAlerts"
  | "backInStockAlerts"
  | "emailDigest"
  | "smsUpdates";

export type PersonalizationPreferenceKey =
  | "personalizedHome"
  | "recentSearches"
  | "recentlyViewed"
  | "categoryRecommendations";

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;
export type PersonalizationPreferences = Record<PersonalizationPreferenceKey, boolean>;

export type ViewedProductSnapshot = CatalogProduct & {
  viewedAt: string;
};

export type CommercePreferencesState = {
  notifications: NotificationPreferences;
  personalization: PersonalizationPreferences;
  recentSearches: string[];
  recentlyViewed: ViewedProductSnapshot[];
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  orderUpdates: true,
  campaignAlerts: true,
  priceDropAlerts: true,
  backInStockAlerts: true,
  emailDigest: true,
  smsUpdates: false,
};

export const DEFAULT_PERSONALIZATION_PREFERENCES: PersonalizationPreferences = {
  personalizedHome: true,
  recentSearches: true,
  recentlyViewed: true,
  categoryRecommendations: true,
};

export const DEFAULT_COMMERCE_PREFERENCES_STATE: CommercePreferencesState = {
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
  personalization: DEFAULT_PERSONALIZATION_PREFERENCES,
  recentSearches: [],
  recentlyViewed: [],
};
