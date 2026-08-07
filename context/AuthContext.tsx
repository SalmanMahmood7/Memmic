'use client'
import { createContext, ReactNode, useContext, useSyncExternalStore } from "react";
import { clearStoredTokens, storeTokens } from "@/lib/api";
import { decodeJwtPayload } from "@/lib/jwt";

interface AuthContextValue {
  token: string | null;
  role: string | null;
  setTokens: (accessToken: string, refreshToken: string, rememberMe?: boolean) => void;
  setToken: (token: string | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  role: null,
  setTokens: () => {},
  setToken: () => {},
  isLoading: true,
});

const ACCESS_STORAGE_KEY = 'memmic_access_token';

function decodeRole(token: string | null): string | null {
  if (!token) return null;
  const payload = decodeJwtPayload<{ role?: string }>(token);
  return payload?.role ?? null;
}

function setMemmicUserCookie(token: string | null) {
  if (!token) {
    document.cookie = 'memmic_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    return;
  }
  const payload = decodeJwtPayload<{ sub?: string; user_id?: string; email?: string; name?: string; role?: string }>(token);
  if (!payload) {
    document.cookie = 'memmic_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    return;
  }
  const user = {
    id: payload.sub || payload.user_id || '1',
    email: payload.email || '',
    name: payload.name || payload.email?.split('@')[0] || '',
    role: payload.role || 'investor',
  };
  document.cookie = `memmic_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=604800; SameSite=Lax`;
}

// Get token from either localStorage or sessionStorage
function getTokenSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_STORAGE_KEY) || sessionStorage.getItem(ACCESS_STORAGE_KEY);
}

function getServerTokenSnapshot() {
  return null; // no localStorage on the server
}

// --- "have we hydrated yet" flag ---------------------------------------
// Same idea, without a subscription: server and the first client render
// both report "loading", then the client flips to "done" right after
// hydration. React special-cases this server/client mismatch for
// useSyncExternalStore, so it won't warn or throw.

function noopSubscribe() {
  return () => {};
}
function getNotLoading() {
  return false;
}
function getLoading() {
  return true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(subscribeToTokenChanges, getTokenSnapshot, getServerTokenSnapshot);
  const isLoading = useSyncExternalStore(noopSubscribe, getNotLoading, getLoading);

  function setTokens(accessToken: string, refreshToken: string, rememberMe = true) {
    storeTokens(accessToken, refreshToken, rememberMe);
    setMemmicUserCookie(accessToken);
    window.dispatchEvent(new CustomEvent('auth:tokens-updated', { detail: { accessToken } }));
  }

  function setToken(next: string | null) {
    if (next) {
      localStorage.setItem(ACCESS_STORAGE_KEY, next);
      setMemmicUserCookie(next);
      window.dispatchEvent(new CustomEvent('auth:tokens-updated', { detail: { accessToken: next } }));
    } else {
      clearStoredTokens(true);
      clearStoredTokens(false);
      setMemmicUserCookie(null);
      window.dispatchEvent(new Event('auth:logout'));
    }
  }

  return (
    <AuthContext.Provider value={{ token, role: decodeRole(token), setTokens, setToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

function subscribeToTokenChanges(callback: () => void) {
  window.addEventListener('auth:tokens-updated', callback);
  window.addEventListener('auth:logout', callback);
  window.addEventListener('storage', callback); // bonus: syncs across tabs
  return () => {
    window.removeEventListener('auth:tokens-updated', callback);
    window.removeEventListener('auth:logout', callback);
    window.removeEventListener('storage', callback);
  };
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Maps a backend role name to its panel route. */
export function panelPathForRole(role: string | null): string {
  if (!role) return '/';
  const normalized = role.toString().toLowerCase();
  switch (normalized) {
    case 'manager':
      return '/manager';
    case 'admin':
      return '/admin';
    case 'investor':
    case 'invester':
      return '/investor';
    case 'evaluation_client':
    case 'investment_client':
    case 'marketplace_client':
    case 'management_client':
      return '/portal';
    default:
      return '/';
  }
}