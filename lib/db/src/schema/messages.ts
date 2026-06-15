import { pgTable, uuid, text, timestamp, pgEnum, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { conversationsTable } from "./conversations";

export const messageContentTypeEnum = pgEnum("message_content_type", ["text", "image", "file"]);
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read"]);

export const messagesTable = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversationsTable.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    contentType: messageContentTypeEnum("content_type").notNull().default("text"),
    text: text("text"),
    mediaUrl: text("media_url"),
    mediaPublicId: text("media_public_id"),
    mediaMimeType: text("media_mime_type"),
    mediaSize: integer("media_size"),
    status: messageStatusEnum("status").notNull().default("sent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("messages_conversation_created_idx").on(table.conversationId, table.createdAt),
  ],
);

export const insertMessageSchema = createInsertSchema(messagesTable).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const selectMessageSchema = createSelectSchema(messagesTable);

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
export type MessageContentType = Message["contentType"];
export type MessageStatus = Message["status"];
