import { and, eq, ne, or, ilike, notInArray, sql } from "drizzle-orm";
import { db, usersTable, notificationSettingsTable, blockedUsersTable } from "@workspace/db";
import type { User, NotificationSettings, UpdateNotificationSettings, UserStatus } from "@workspace/db";
import { AppError } from "../middleware/errorHandler";

export async function findUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  return user;
}

export async function findUserByPhone(phone: string): Promise<User | undefined> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  return user;
}

export async function getUserOrThrow(id: string): Promise<User> {
  const user = await findUserById(id);
  if (!user) {
    throw new AppError(404, "user_not_found", "User not found");
  }
  return user;
}

export async function getSettingsOrThrow(userId: string): Promise<NotificationSettings> {
  const [settings] = await db
    .select()
    .from(notificationSettingsTable)
    .where(eq(notificationSettingsTable.userId, userId))
    .limit(1);

  if (!settings) {
    throw new AppError(404, "settings_not_found", "Notification settings not found");
  }

  return settings;
}

export async function updateSettings(
  userId: string,
  updates: UpdateNotificationSettings,
): Promise<NotificationSettings> {
  const [settings] = await db
    .update(notificationSettingsTable)
    .set(updates)
    .where(eq(notificationSettingsTable.userId, userId))
    .returning();

  if (!settings) {
    throw new AppError(404, "settings_not_found", "Notification settings not found");
  }

  return settings;
}

export interface UpdateProfileInput {
  name?: string;
  username?: string;
  bio?: string;
}

export async function updateProfile(userId: string, updates: UpdateProfileInput): Promise<User> {
  if (updates.username) {
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(and(eq(usersTable.username, updates.username), ne(usersTable.id, userId)))
      .limit(1);

    if (existing) {
      throw new AppError(409, "username_taken", "Username is already in use");
    }
  }

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();

  if (!user) {
    throw new AppError(404, "user_not_found", "User not found");
  }

  return user;
}

export async function updateAvatar(
  userId: string,
  avatarUrl: string,
  avatarPublicId: string,
): Promise<User> {
  const [user] = await db
    .update(usersTable)
    .set({ avatarUrl, avatarPublicId })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!user) {
    throw new AppError(404, "user_not_found", "User not found");
  }

  return user;
}

export interface UpdateStatusInput {
  status: UserStatus;
  showOfflineStatus?: boolean;
}

export async function updateStatus(userId: string, input: UpdateStatusInput): Promise<User> {
  const updates: Partial<typeof usersTable.$inferInsert> = {
    status: input.status,
    lastSeenAt: new Date(),
  };

  if (input.showOfflineStatus !== undefined) {
    updates.showOfflineStatus = input.showOfflineStatus;
  }

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();

  if (!user) {
    throw new AppError(404, "user_not_found", "User not found");
  }

  return user;
}

/**
 * Searches users by username or phone, excluding the current user and
 * any user involved in a block relationship (either direction) with them.
 */
export async function searchUsers(currentUserId: string, query: string): Promise<User[]> {
  const blockedIds = db
    .select({ id: blockedUsersTable.blockedId })
    .from(blockedUsersTable)
    .where(eq(blockedUsersTable.blockerId, currentUserId))
    .union(
      db
        .select({ id: blockedUsersTable.blockerId })
        .from(blockedUsersTable)
        .where(eq(blockedUsersTable.blockedId, currentUserId)),
    );

  return db
    .select()
    .from(usersTable)
    .where(
      and(
        ne(usersTable.id, currentUserId),
        or(ilike(usersTable.username, `%${query}%`), eq(usersTable.phone, query)),
        notInArray(usersTable.id, sql`(${blockedIds})`),
      ),
    )
    .limit(20);
}
