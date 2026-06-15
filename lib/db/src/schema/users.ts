import { pgTable, text, uuid, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userStatusEnum = pgEnum("user_status", ["online", "offline"]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  bio: text("bio").notNull().default(""),
  avatarUrl: text("avatar_url"),
  avatarPublicId: text("avatar_public_id"),
  status: userStatusEnum("status").notNull().default("offline"),
  showOfflineStatus: boolean("show_offline_status").notNull().default(true),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  passwordHash: true,
  avatarUrl: true,
  avatarPublicId: true,
  status: true,
  lastSeenAt: true,
  createdAt: true,
});

export const selectUserSchema = createSelectSchema(usersTable);

export const publicUserSchema = selectUserSchema.omit({
  passwordHash: true,
  avatarPublicId: true,
  phone: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type UserStatus = User["status"];
