import type { Server } from "socket.io";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import * as presenceService from "../services/presenceService";
import type { AuthenticatedSocket } from "./authMiddleware";

/**
 * Registers presence tracking for a newly connected socket: joins the
 * user's personal room, marks them online on first connection, and
 * broadcasts presence updates to anyone subscribed.
 *
 * Presence broadcasts go to a global "presence" room that any connected
 * client can join — in practice the frontend joins this room once after
 * connecting so it can keep contact statuses fresh without per-friend
 * subscriptions.
 */
export function registerPresenceHandlers(io: Server, socket: AuthenticatedSocket): void {
  const { userId } = socket;

  void socket.join(`user:${userId}`);
  void socket.join("presence");

  void (async () => {
    const justWentOnline = await presenceService.addConnection(userId);

    if (justWentOnline) {
      io.to("presence").emit("presence:update", {
        userId,
        status: "online",
        lastSeenAt: null,
      });
    }
  })();

  socket.on("disconnect", () => {
    void (async () => {
      const justWentOffline = await presenceService.removeConnection(userId);

      if (justWentOffline) {
        const [user] = await db
          .select({ lastSeenAt: usersTable.lastSeenAt, showOfflineStatus: usersTable.showOfflineStatus })
          .from(usersTable)
          .where(eq(usersTable.id, userId))
          .limit(1);

        io.to("presence").emit("presence:update", {
          userId,
          status: "offline",
          lastSeenAt: user?.showOfflineStatus && user.lastSeenAt ? user.lastSeenAt.toISOString() : null,
        });
      }
    })();
  });
}
