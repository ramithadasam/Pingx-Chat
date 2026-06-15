import { pgTable, uuid, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { conversationsTable } from "./conversations";

/**
 * Per-user state for a conversation. Allows each participant to
 * independently soft-delete (hide) or clear (hide messages before a
 * timestamp) a conversation without affecting the other participant.
 */
export const conversationMembersTable = pgTable(
  "conversation_members",
  {
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversationsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    clearedAt: timestamp("cleared_at", { withTimezone: true }),
  },
  (table) => [primaryKey({ columns: [table.conversationId, table.userId] })],
);

export const insertConversationMemberSchema = createInsertSchema(conversationMembersTable);

export const selectConversationMemberSchema = createSelectSchema(conversationMembersTable);

export type InsertConversationMember = z.infer<typeof insertConversationMemberSchema>;
export type ConversationMember = typeof conversationMembersTable.$inferSelect;
