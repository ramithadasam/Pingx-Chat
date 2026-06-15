import { and, eq, desc } from "drizzle-orm";
import { db, thoughtsTable } from "@workspace/db";
import type { Thought } from "@workspace/db";
import { AppError } from "../middleware/errorHandler";

export async function listThoughts(userId: string): Promise<Thought[]> {
  return db
    .select()
    .from(thoughtsTable)
    .where(eq(thoughtsTable.userId, userId))
    .orderBy(desc(thoughtsTable.createdAt));
}

export async function createThought(userId: string, text: string): Promise<Thought> {
  const [thought] = await db.insert(thoughtsTable).values({ userId, text }).returning();

  if (!thought) {
    throw new AppError(500, "internal_error", "Failed to create thought");
  }

  return thought;
}

export async function deleteThought(userId: string, thoughtId: string): Promise<void> {
  const deleted = await db
    .delete(thoughtsTable)
    .where(and(eq(thoughtsTable.id, thoughtId), eq(thoughtsTable.userId, userId)))
    .returning({ id: thoughtsTable.id });

  if (deleted.length === 0) {
    throw new AppError(404, "thought_not_found", "Thought not found");
  }
}
