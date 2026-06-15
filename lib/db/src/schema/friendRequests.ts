import { pgTable, uuid, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const friendRequestStatusEnum = pgEnum("friend_request_status", [
  "pending",
  "accepted",
  "rejected",
]);

export const friendRequestsTable = pgTable(
  "friend_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    receiverId: uuid("receiver_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    status: friendRequestStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("friend_requests_sender_receiver_pending_idx")
      .on(table.senderId, table.receiverId)
      .where(sql`${table.status} = 'pending'`),
  ],
);

export const insertFriendRequestSchema = createInsertSchema(friendRequestsTable).omit({
  id: true,
  status: true,
  createdAt: true,
  respondedAt: true,
});

export const selectFriendRequestSchema = createSelectSchema(friendRequestsTable);

export type InsertFriendRequest = z.infer<typeof insertFriendRequestSchema>;
export type FriendRequest = typeof friendRequestsTable.$inferSelect;
