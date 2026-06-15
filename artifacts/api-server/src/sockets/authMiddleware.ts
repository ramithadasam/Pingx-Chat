import type { Socket } from "socket.io";
import { verifyToken } from "../lib/jwt";

export interface AuthenticatedSocket extends Socket {
  userId: string;
}

/**
 * Verifies the JWT passed in the Socket.IO handshake auth payload
 * (`io(url, { auth: { token } })`) and attaches `userId` to the socket.
 */
export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
): void {
  const token = socket.handshake.auth?.["token"] as string | undefined;

  if (!token) {
    next(new Error("Authentication required"));
    return;
  }

  try {
    const payload = verifyToken(token);
    (socket as AuthenticatedSocket).userId = payload.userId;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
}
