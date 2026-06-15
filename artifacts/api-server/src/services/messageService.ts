import { and, eq, lt, gt, desc } from "drizzle-orm";
import { db, messagesTable } from "@workspace/db";
import type { Message, MessageContentType } from "@workspace/db";
import { AppError } from "../middleware/errorHandler";
import {
  getConversationOrThrow,
  getOtherParticipant,
  getMemberState,
  reviveForMember,
} from "./conversationService";
import { areBlocked } from "./friendService";

export interface SendMessageInput {
  contentType: MessageContentType;
  text?: string | null;
  mediaUrl?: string | null;
  mediaPublicId?: string | null;
  mediaMimeType?: string | null;
  mediaSize?: number | null;
}

export interface SendMessageResult {
  message: Message;
  conversationId: string;
  senderId: string;
  recipientId: string;
}

export async function sendMessage(
  senderId: string,
  conversationId: string,
  input: SendMessageInput,
): Promise<SendMessageResult> {
  const conversation = await getConversationOrThrow(conversationId, senderId);
  const recipientId = getOtherParticipant(conversation, senderId);

  if (await areBlocked(senderId, recipientId)) {
    throw new AppError(400, "blocked", "Cannot send a message to this user");
  }

  if (input.contentType === "text" && !input.text?.trim()) {
    throw new AppError(400, "empty_message", "Message text cannot be empty");
  }

  if (input.contentType !== "text" && !input.mediaUrl) {
    throw new AppError(400, "missing_media", "Media messages require a mediaUrl");
  }

  const [message] = await db
    .insert(messagesTable)
    .values({
      conversationId,
      senderId,
      contentType: input.contentType,
      text: input.text ?? null,
      mediaUrl: input.mediaUrl ?? null,
      mediaPublicId: input.mediaPublicId ?? null,
      mediaMimeType: input.mediaMimeType ?? null,
      mediaSize: input.mediaSize ?? null,
      status: "sent",
    })
    .returning();

  if (!message) {
    throw new AppError(500, "internal_error", "Failed to send message");
  }

  // A new message revives the conversation for the recipient if they had
  // previously soft-deleted it, so it reappears in their conversation list.
  await reviveForMember(conversationId, recipientId);

  return { message, conversationId, senderId, recipientId };
}

export interface MessagesPage {
  messages: Message[];
  nextCursor: Date | null;
}

const DEFAULT_PAGE_SIZE = 30;

export async function listMessages(
  userId: string,
  conversationId: string,
  options: { before?: Date; limit?: number },
): Promise<MessagesPage> {
  await getConversationOrThrow(conversationId, userId);

  const limit = Math.min(Math.max(options.limit ?? DEFAULT_PAGE_SIZE, 1), 100);
  const member = await getMemberState(conversationId, userId);

  const conditions = [eq(messagesTable.conversationId, conversationId)];

  if (member?.clearedAt) {
    conditions.push(gt(messagesTable.createdAt, member.clearedAt));
  }

  if (options.before) {
    conditions.push(lt(messagesTable.createdAt, options.before));
  }

  // Fetch limit + 1 to determine whether there's a next page.
  const rows = await db
    .select()
    .from(messagesTable)
    .where(and(...conditions))
    .orderBy(desc(messagesTable.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);

  return {
    messages: page,
    nextCursor: hasMore ? page[page.length - 1]!.createdAt : null,
  };
}

/**
 * Marks all messages sent by the other participant in this conversation,
 * up to and including the given message, as "read".
 * Returns the ids of messages that were updated.
 */
export async function markMessagesRead(
  userId: string,
  conversationId: string,
  upToMessageId: string,
): Promise<string[]> {
  const conversation = await getConversationOrThrow(conversationId, userId);
  const otherUserId = getOtherParticipant(conversation, userId);

  const [target] = await db
    .select({ createdAt: messagesTable.createdAt })
    .from(messagesTable)
    .where(eq(messagesTable.id, upToMessageId))
    .limit(1);

  if (!target) {
    throw new AppError(404, "message_not_found", "Message not found");
  }

  const rows = await db
    .update(messagesTable)
    .set({ status: "read" })
    .where(
      and(
        eq(messagesTable.conversationId, conversationId),
        eq(messagesTable.senderId, otherUserId),
        lt(messagesTable.createdAt, target.createdAt),
      ),
    )
    .returning({ id: messagesTable.id });

  // Also mark the target message itself.
  const [targetUpdated] = await db
    .update(messagesTable)
    .set({ status: "read" })
    .where(eq(messagesTable.id, upToMessageId))
    .returning({ id: messagesTable.id });

  const ids = rows.map((r) => r.id);
  if (targetUpdated) ids.push(targetUpdated.id);

  return ids;
}

export async function markMessageDelivered(messageId: string): Promise<Message | undefined> {
  const [message] = await db
    .update(messagesTable)
    .set({ status: "delivered" })
    .where(and(eq(messagesTable.id, messageId), eq(messagesTable.status, "sent")))
    .returning();

  return message;
}
