import { pgTable, uuid, text, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const noteColorEnum = pgEnum("note_color", ["green", "purple", "pink"]);

export const notesTable = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    color: noteColorEnum("color").notNull().default("green"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("notes_user_idx").on(table.userId)],
);

export const insertNoteSchema = createInsertSchema(notesTable).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const updateNoteSchema = insertNoteSchema.partial();

export const selectNoteSchema = createSelectSchema(notesTable);

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type UpdateNote = z.infer<typeof updateNoteSchema>;
export type Note = typeof notesTable.$inferSelect;
