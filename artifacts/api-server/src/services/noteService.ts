import { and, eq, desc } from "drizzle-orm";
import { db, notesTable } from "@workspace/db";
import type { Note, InsertNote, UpdateNote } from "@workspace/db";
import { AppError } from "../middleware/errorHandler";

export async function listNotes(userId: string): Promise<Note[]> {
  return db.select().from(notesTable).where(eq(notesTable.userId, userId)).orderBy(desc(notesTable.createdAt));
}

export async function createNote(userId: string, input: InsertNote): Promise<Note> {
  const [note] = await db
    .insert(notesTable)
    .values({ userId, content: input.content, color: input.color })
    .returning();

  if (!note) {
    throw new AppError(500, "internal_error", "Failed to create note");
  }

  return note;
}

export async function updateNote(userId: string, noteId: string, updates: UpdateNote): Promise<Note> {
  const [note] = await db
    .update(notesTable)
    .set(updates)
    .where(and(eq(notesTable.id, noteId), eq(notesTable.userId, userId)))
    .returning();

  if (!note) {
    throw new AppError(404, "note_not_found", "Note not found");
  }

  return note;
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const deleted = await db
    .delete(notesTable)
    .where(and(eq(notesTable.id, noteId), eq(notesTable.userId, userId)))
    .returning({ id: notesTable.id });

  if (deleted.length === 0) {
    throw new AppError(404, "note_not_found", "Note not found");
  }
}
