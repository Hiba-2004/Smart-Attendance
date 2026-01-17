import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@/lib/api";
import { mapBackendUser } from "@/lib/api";
import * as auth from "@/api/auth";
import { AxiosError } from "axios";

type LoginResult = { success: true; user: User } | { success: false; error: string };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

function extractErrorMessage(err: unknown): string {
  const ax = err as AxiosError<any>;
  const status = ax?.response?.status;
  if (status === 422) return "Identifiants invalides.";
  if (status === 419) return "Session expirée. Réessayez.";
  if (status === 401) return "Non autorisé.";
  const msg = ax?.response?.data?.message;
  return msg || "Une erreur est survenue. Veuillez réessayer.";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const backendUser = await auth.me();
      setUser(mapBackendUser(backendUser));
    } catch (e) {
      // Not logged in (401) or backend not reachable.
      setUser(null);
    }
  }, []);

  // On mount, check if a session cookie already exists
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refresh();
      setIsLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const backendUser = await auth.login(email, password);
      const mapped = mapBackendUser(backendUser);
      setUser(mapped);
      return { success: true, user: mapped };
    } catch (e) {
      return { success: false, error: extractErrorMessage(e) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await auth.logout();
    } catch {
      // Ignore logout failures (e.g., already logged out)
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refresh,
    }),
    [user, isLoading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
