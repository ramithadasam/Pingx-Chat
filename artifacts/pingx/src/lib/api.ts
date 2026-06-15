import { setBaseUrl } from "@workspace/api-client-react";

/**
 * Returns the API server's origin, or `null` when REST/socket calls should
 * use relative URLs against the current origin.
 *
 * In production the frontend is served as static files behind the same
 * reverse proxy that routes `/api/*` (and `/api/socket.io`) to the API
 * server, so relative URLs work and this returns `null`.
 *
 * In local development the Vite dev server and the API server run on
 * different ports, so `VITE_API_BASE_URL` (set in `.env` /
 * `artifacts/pingx/.env`, e.g. `http://localhost:8080`) points requests at
 * the API server directly.
 */
export function getApiBaseUrl(): string | null {
  return import.meta.env.VITE_API_BASE_URL || null;
}

/**
 * Wires the generated REST client to use `getApiBaseUrl()` for relative
 * paths. Call once at app startup alongside `initAuthTokenGetter()`.
 */
export function initApiBaseUrl(): void {
  setBaseUrl(getApiBaseUrl());
}
