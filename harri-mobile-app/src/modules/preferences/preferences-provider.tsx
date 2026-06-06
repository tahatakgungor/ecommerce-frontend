import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { CatalogProduct } from "@/modules/catalog/types";
import { readJsonValue, writeJsonValue } from "@/lib/json-store";
import { buildPersonalizedProductRail, recordRecentSearches, recordViewedProducts } from "@/modules/preferences/logic";
import type {
  CommercePreferencesState,
  NotificationPreferenceKey,
  PersonalizationPreferenceKey,
} from "@/modules/preferences/types";
import { DEFAULT_COMMERCE_PREFERENCES_STATE } from "@/modules/preferences/types";

const PREFERENCES_STORAGE_KEY = "serravit.mobile.preferences.v1";

type PreferencesContextValue = {
  preferences: CommercePreferencesState;
  isHydrating: boolean;
  setNotificationPreference: (key: NotificationPreferenceKey, value: boolean) => void;
  setPersonalizationPreference: (key: PersonalizationPreferenceKey, value: boolean) => void;
  recordSearch: (query: string) => void;
  recordViewedProduct: (product: CatalogProduct) => void;
  clearRecentSearches: () => void;
  clearRecentlyViewed: () => void;
  buildRail: (products: CatalogProduct[], limit?: number) => CatalogProduct[];
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

type PreferencesUpdater = CommercePreferencesState | ((current: CommercePreferencesState) => CommercePreferencesState);

function normalizePreferencesState(value: CommercePreferencesState | null | undefined): CommercePreferencesState {
  const source = value && typeof value === "object" ? value : DEFAULT_COMMERCE_PREFERENCES_STATE;
  return {
    notifications: {
      ...DEFAULT_COMMERCE_PREFERENCES_STATE.notifications,
      ...(source.notifications || {}),
    },
    personalization: {
      ...DEFAULT_COMMERCE_PREFERENCES_STATE.personalization,
      ...(source.personalization || {}),
    },
    recentSearches: Array.isArray(source.recentSearches) ? source.recentSearches.filter((item) => typeof item === "string") : [],
    recentlyViewed: Array.isArray(source.recentlyViewed) ? source.recentlyViewed : [],
  };
}

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<CommercePreferencesState>(DEFAULT_COMMERCE_PREFERENCES_STATE);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let active = true;
    readJsonValue<CommercePreferencesState>(PREFERENCES_STORAGE_KEY, DEFAULT_COMMERCE_PREFERENCES_STATE).then((storedValue) => {
      if (!active) return;
      setPreferences(normalizePreferencesState(storedValue));
      setIsHydrating(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((nextValue: PreferencesUpdater) => {
    setPreferences((current) => {
      const resolved = typeof nextValue === "function" ? nextValue(current) : nextValue;
      void writeJsonValue(PREFERENCES_STORAGE_KEY, resolved);
      return resolved;
    });
  }, []);

  const setNotificationPreference = useCallback(
    (key: NotificationPreferenceKey, value: boolean) => {
      persist((current) => ({
        ...current,
        notifications: {
          ...current.notifications,
          [key]: value,
        },
      }));
    },
    [persist]
  );

  const setPersonalizationPreference = useCallback(
    (key: PersonalizationPreferenceKey, value: boolean) => {
      persist((current) => {
        const nextValue: CommercePreferencesState = {
          ...current,
          personalization: {
            ...current.personalization,
            [key]: value,
          },
        };

        if (!value && key === "recentSearches") {
          nextValue.recentSearches = [];
        }

        if (!value && key === "recentlyViewed") {
          nextValue.recentlyViewed = [];
        }

        return nextValue;
      });
    },
    [persist]
  );

  const recordSearch = useCallback(
    (query: string) => {
      persist((current) => {
        if (!current.personalization.recentSearches) return current;
        return {
          ...current,
          recentSearches: recordRecentSearches(current.recentSearches, query),
        };
      });
    },
    [persist]
  );

  const recordViewedProduct = useCallback(
    (product: CatalogProduct) => {
      persist((current) => {
        if (!current.personalization.recentlyViewed) return current;
        return {
          ...current,
          recentlyViewed: recordViewedProducts(current.recentlyViewed, product),
        };
      });
    },
    [persist]
  );

  const clearRecentSearches = useCallback(() => {
    persist((current) => ({
      ...current,
      recentSearches: [],
    }));
  }, [persist]);

  const clearRecentlyViewed = useCallback(() => {
    persist((current) => ({
      ...current,
      recentlyViewed: [],
    }));
  }, [persist]);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      isHydrating,
      setNotificationPreference,
      setPersonalizationPreference,
      recordSearch,
      recordViewedProduct,
      clearRecentSearches,
      clearRecentlyViewed,
      buildRail: (products, limit) => buildPersonalizedProductRail(products, preferences, limit),
    }),
    [isHydrating, preferences]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}
