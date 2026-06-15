import { pgTable, uuid, timestamp, uniqueIndex, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

/**
 * One row per unique pair of users. userIdA must always be the
 * lexicographically smaller UUID (userIdA < userIdB), enforced at the
 * application layer (conversationService) so a get-or-create lookup is a
 * single indexed query regardless of which user initiates.
 */
export const conversationsTable = pgTable(
  "conversations",
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
    uniqueIndex("conversations_pair_idx").on(table.userIdA, table.userIdB),
    check("conversations_order_chk", sql`${table.userIdA} < ${table.userIdB}`),
  ],
);

export const insertConversationSchema = createInsertSchema(conversationsTable).omit({
  id: true,
  createdAt: true,
});

export const selectConversationSchema = createSelectSchema(conversationsTable);

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversationsTable.$inferSelect;
