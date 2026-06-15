import { setAuthTokenGetter } from "@workspace/api-client-react";

const TOKEN_STORAGE_KEY = "pingx_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Wires the generated API client's bearer-token getter to localStorage.
 * Call this once at app startup (see main.tsx).
 */
export function initAuthTokenGetter(): void {
  setAuthTokenGetter(() => getToken());
}
