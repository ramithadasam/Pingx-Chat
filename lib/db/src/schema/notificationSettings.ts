import { pgTable, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const notificationSettingsTable = pgTable("notification_settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  // Privacy
  endToEndEncryption: boolean("end_to_end_encryption").notNull().default(true),
  vanishMode: boolean("vanish_mode").notNull().default(false),
  readReceipts: boolean("read_receipts").notNull().default(true),

  // Notifications
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  messageNotifications: boolean("message_notifications").notNull().default(true),
  groupNotifications: boolean("group_notifications").notNull().default(true),
  mentions: boolean("mentions").notNull().default(true),
  friendRequests: boolean("friend_requests").notNull().default(true),
  newFriends: boolean("new_friends").notNull().default(true),
  appUpdates: boolean("app_updates").notNull().default(true),
  promotions: boolean("promotions").notNull().default(false),
  quietHours: boolean("quiet_hours").notNull().default(false),
});

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettingsTable).omit({
  userId: true,
});

export const selectNotificationSettingsSchema = createSelectSchema(notificationSettingsTable);

export const updateNotificationSettingsSchema = insertNotificationSettingsSchema.partial();

export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;
export type NotificationSettings = typeof notificationSettingsTable.$inferSelect;
export type UpdateNotificationSettings = z.infer<typeof updateNotificationSettingsSchema>;
