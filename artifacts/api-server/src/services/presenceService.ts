import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

/**
 * Tracks how many active socket connections each user currently has, since
 * a single user may have multiple tabs/devices connected at once. A user is
 * considered "online" while this count is > 0.
 */
const connectionCounts = new Map<string, number>();

export function isOnline(userId: string): boolean {
  return (connectionCounts.get(userId) ?? 0) > 0;
}

/**
 * Records a new socket connection for the user. Returns true if this is
 * the user's first connection (i.e. they just went online).
 */
export async function addConnection(userId: string): Promise<boolean> {
  const previous = connectionCounts.get(userId) ?? 0;
  connectionCounts.set(userId, previous + 1);

  if (previous === 0) {
    await db.update(usersTable).set({ status: "online" }).where(eq(usersTable.id, userId));
    return true;
  }

  return false;
}

/**
 * Removes a socket connection for the user. Returns true if this was the
 * user's last connection (i.e. they just went offline).
 */
export async function removeConnection(userId: string): Promise<boolean> {
  const previous = connectionCounts.get(userId) ?? 0;
  const next = Math.max(previous - 1, 0);

  if (next === 0) {
    connectionCounts.delete(userId);
    await db
      .update(usersTable)
      .set({ status: "offline", lastSeenAt: new Date() })
      .where(eq(usersTable.id, userId));
    return true;
  }

  connectionCounts.set(userId, next);
  return false;
}
