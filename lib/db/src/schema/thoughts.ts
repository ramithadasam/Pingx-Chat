import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const thoughtsTable = pgTable(
  "thoughts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("thoughts_user_idx").on(table.userId)],
);

export const insertThoughtSchema = createInsertSchema(thoughtsTable).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const selectThoughtSchema = createSelectSchema(thoughtsTable);

export type InsertThought = z.infer<typeof insertThoughtSchema>;
export type Thought = typeof thoughtsTable.$inferSelect;
