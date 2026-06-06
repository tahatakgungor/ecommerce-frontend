import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import { toUserFriendlyErrorMessage } from "@/lib/http-client";
import { clearAccessToken, readAccessToken, writeAccessToken } from "@/lib/token-store";
import { confirmCustomerEmail, fetchCurrentUser, loginCustomer, logoutCustomer } from "@/modules/auth/api";
import type { ConfirmEmailResult, LoginPayload, SessionUser } from "@/modules/auth/types";

type SessionContextValue = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isSubmitting: boolean;
  error: string | null;
  signIn: (payload: LoginPayload) => Promise<void>;
  completeEmailConfirmation: (token: string) => Promise<ConfirmEmailResult>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = async () => {
    const token = await readAccessToken();
    if (!token) {
      setUser(null);
      setError(null);
      return;
    }

    try {
      const nextUser = await fetchCurrentUser();
      setUser(nextUser);
      setError(null);
    } catch (nextError) {
      await clearAccessToken();
      setUser(null);
      setError(toUserFriendlyErrorMessage(nextError, "Oturum yenilenemedi."));
    }
  };

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        await refreshSession();
      } finally {
        if (active) {
          setIsBootstrapping(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const signIn = async (payload: LoginPayload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const session = await loginCustomer(payload);
      await writeAccessToken(session.token);
      setUser(session.user);
    } catch (nextError) {
      setUser(null);
      setError(toUserFriendlyErrorMessage(nextError, "Giriş yapılamadı."));
      throw nextError;
    } finally {
      setIsSubmitting(false);
    }
  };

  const signOut = async () => {
    setIsSubmitting(true);
    try {
      await logoutCustomer();
    } catch {
      // Cookie cleanup on backend is best-effort; local token clear is authoritative for mobile.
    } finally {
      await clearAccessToken();
      setUser(null);
      setError(null);
      setIsSubmitting(false);
    }
  };

  const completeEmailConfirmation = async (token: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const session = await confirmCustomerEmail(token);
      await writeAccessToken(session.token);
      setUser(session.user);
      return session;
    } catch (nextError) {
      setError(toUserFriendlyErrorMessage(nextError, "E-posta doğrulanamadı."));
      throw nextError;
    } finally {
      setIsSubmitting(false);
    }
  };

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user?.email),
      isBootstrapping,
      isSubmitting,
      error,
      signIn,
      completeEmailConfirmation,
      signOut,
      refreshSession,
    }),
    [error, isBootstrapping, isSubmitting, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
