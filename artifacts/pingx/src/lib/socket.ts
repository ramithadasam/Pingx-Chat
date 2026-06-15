import { io, type Socket } from "socket.io-client";
import { getToken } from "./auth";
import { getApiBaseUrl } from "./api";

let socket: Socket | undefined;

/**
 * Returns the shared Socket.IO connection, creating it on first call.
 * The connection authenticates via the JWT in the handshake `auth` payload
 * (see api-server/src/sockets/authMiddleware.ts).
 *
 * The path `/api/socket.io` matches the API server's `/api` route prefix so
 * the same reverse-proxy rule that forwards REST calls also forwards the
 * WebSocket upgrade in production.
 */
export function getSocket(): Socket {
  if (!socket) {
    const baseUrl = getApiBaseUrl();
    socket = io(baseUrl ?? "/", {
      path: "/api/socket.io",
      auth: (cb) => cb({ token: getToken() }),
      autoConnect: false,
    });
  }

  return socket;
}

/**
 * Connects the socket if not already connected. No-op if there's no auth
 * token (e.g. before login).
 */
export function connectSocket(): void {
  const s = getSocket();

  if (!getToken()) return;

  if (!s.connected) {
    s.connect();
  }
}

/**
 * Disconnects the socket, e.g. on logout. The socket instance is kept so
 * a subsequent connectSocket() can reuse it with a fresh auth token.
 */
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
