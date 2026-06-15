import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { socketAuthMiddleware, type AuthenticatedSocket } from "./authMiddleware";
import { registerPresenceHandlers } from "./presenceHandlers";
import { registerTypingHandlers } from "./typingHandlers";
import { registerMessageHandlers } from "./messageHandlers";

let io: Server | undefined;

export function initSockets(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    path: "/api/socket.io",
    cors: { origin: env.corsOrigin },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const authedSocket = socket as AuthenticatedSocket;
    logger.info({ userId: authedSocket.userId, socketId: socket.id }, "Socket connected");

    registerPresenceHandlers(io!, authedSocket);
    registerTypingHandlers(io!, authedSocket);
    registerMessageHandlers(io!, authedSocket);

    socket.on("disconnect", () => {
      logger.info({ userId: authedSocket.userId, socketId: socket.id }, "Socket disconnected");
    });
  });

  return io;
}

/**
 * Returns the active Socket.IO server instance, or undefined if sockets
 * have not been initialized yet (e.g. during tests). REST controllers use
 * this to broadcast events (e.g. a new friend request) to connected
 * clients without a hard dependency on the socket layer being present.
 */
export function getIo(): Server | undefined {
  return io;
}
