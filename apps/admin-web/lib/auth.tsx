"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, ApiClientError, clearAuthToken, getAuthToken, setAuthToken } from "./api-client";
import { safeIntendedPath } from "./routes";
import { Button } from "../components/ui";

type Admin = { id: number; email: string };
type AuthStatus = "loading" | "authenticating" | "authenticated" | "unauthenticated" | "error";

type AuthContextValue = {
  admin: Admin | null;
  status: AuthStatus;
  error: string;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!getAuthToken()) {
      setAdmin(null);
      setStatus("unauthenticated");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const result = await apiFetch<{ admin: Admin }>("/api/v1/auth/me");
      setAdmin(result.admin);
      setStatus("authenticated");
    } catch (requestError) {
      clearAuthToken();
      setAdmin(null);
      if (requestError instanceof ApiClientError && requestError.status === 401) {
        setStatus("unauthenticated");
        return;
      }
      setStatus("error");
      setError(requestError instanceof Error ? requestError.message : "Unable to verify admin session.");
    }
  }, []);

  useEffect(() => {
    const initialCheck = window.setTimeout(() => void refresh(), 0);
    const onExpired = () => {
      setAdmin(null);
      setStatus("unauthenticated");
    };
    window.addEventListener("cis-auth-expired", onExpired);
    return () => {
      window.clearTimeout(initialCheck);
      window.removeEventListener("cis-auth-expired", onExpired);
    };
  }, [refresh]);

  const value = useMemo<AuthContextValue>(() => ({
    admin,
    status,
    error,
    refresh,
    async login(email, password) {
      setStatus("authenticating");
      setError("");
      try {
        const result = await apiFetch<{ token: string; admin: Admin }>("/api/v1/auth/login", {
          method: "POST",
          timeoutMs: 60000,
          body: { email, password },
        });
        setAuthToken(result.token);
        setAdmin(result.admin);
        setStatus("authenticated");
      } catch (requestError) {
        setStatus("unauthenticated");
        const message = requestError instanceof Error ? requestError.message : "Login failed.";
        setError(message);
        throw requestError;
      }
    },
    logout() {
      clearAuthToken();
      setAdmin(null);
      setStatus("unauthenticated");
    },
  }), [admin, error, refresh, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}

export function AuthGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const { admin, status, error, refresh } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const next = safeIntendedPath(pathname);
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [pathname, router, status]);

  if (status === "error") {
    return (
      <main className="app-shell min-h-screen px-6 py-16">
        <section className="surface mx-auto max-w-md rounded-xl border p-8">
          <h1 className="text-primary text-xl font-semibold">Session check failed</h1>
          <p className="text-secondary mt-3 text-sm">{error}</p>
          <Button className="mt-6" onClick={() => void refresh()} type="button" variant="primary">Retry</Button>
        </section>
      </main>
    );
  }
  if (status !== "authenticated" || !admin) {
    return <main aria-busy="true" className="app-shell text-secondary min-h-screen p-8">Checking session…</main>;
  }
  return <>{children}</>;
}
