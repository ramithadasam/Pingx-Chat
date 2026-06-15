import { pgTable, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const blockedUsersTable = pgTable(
  "blocked_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blockerId: uuid("blocker_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    blockedId: uuid("blocked_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("blocked_users_pair_idx").on(table.blockerId, table.blockedId)],
);

export const insertBlockedUserSchema = createInsertSchema(blockedUsersTable).omit({
  id: true,
  createdAt: true,
});

export const selectBlockedUserSchema = createSelectSchema(blockedUsersTable);

export type InsertBlockedUser = z.infer<typeof insertBlockedUserSchema>;
export type BlockedUser = typeof blockedUsersTable.$inferSelect;
