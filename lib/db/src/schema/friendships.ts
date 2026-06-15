import { pgTable, uuid, timestamp, uniqueIndex, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

/**
 * Canonical friendship pair. userIdA must always be the lexicographically
 * smaller UUID (userIdA < userIdB) to prevent duplicate (a,b)/(b,a) rows.
 * Enforced at the application layer (friendService) when creating rows.
 */
export const friendshipsTable = pgTable(
  "friendships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userIdA: uuid("user_id_a")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    userIdB: uuid("user_id_b")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("friendships_pair_idx").on(table.userIdA, table.userIdB),
    check("friendships_order_chk", sql`${table.userIdA} < ${table.userIdB}`),
  ],
);

export const insertFriendshipSchema = createInsertSchema(friendshipsTable).omit({
  id: true,
  createdAt: true,
});

export const selectFriendshipSchema = createSelectSchema(friendshipsTable);

export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type Friendship = typeof friendshipsTable.$inferSelect;
