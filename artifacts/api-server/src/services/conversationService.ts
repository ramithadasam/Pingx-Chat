import { and, eq, desc, gt, count } from "drizzle-orm";
import {
  db,
  usersTable,
  conversationsTable,
  conversationMembersTable,
  messagesTable,
} from "@workspace/db";
import type { User, Conversation, Message } from "@workspace/db";
import { AppError } from "../middleware/errorHandler";
import { orderedPair } from "../utils/pairs";
import { areFriends, areBlocked } from "./friendService";

export interface ConversationSummary {
  id: string;
  otherUser: User;
  lastMessage: Message | undefined;
  unreadCount: number;
  updatedAt: Date;
}

async function getMember(conversationId: string, userId: string) {
  const [member] = await db
    .select()
    .from(conversationMembersTable)
    .where(
      and(
        eq(conversationMembersTable.conversationId, conversationId),
        eq(conversationMembersTable.userId, userId),
      ),
    )
    .limit(1);

  return member;
}

async function ensureMember(conversationId: string, userId: string): Promise<void> {
  const member = await getMember(conversationId, userId);
  if (!member) {
    throw new AppError(404, "conversation_not_found", "Conversation not found");
  }
}

export async function getOrCreateConversation(
  userId: string,
  otherUserId: string,
): Promise<ConversationSummary> {
  if (userId === otherUserId) {
    throw new AppError(400, "invalid_request", "Cannot start a conversation with yourself");
  }

  const [otherUser] = await db.select().from(usersTable).where(eq(usersTable.id, otherUserId)).limit(1);
  if (!otherUser) {
    throw new AppError(404, "user_not_found", "User not found");
  }

  if (await areBlocked(userId, otherUserId)) {
    throw new AppError(400, "blocked", "Cannot start a conversation with this user");
  }

  if (!(await areFriends(userId, otherUserId))) {
    throw new AppError(400, "not_friends", "You can only message friends");
  }

  const [a, b] = orderedPair(userId, otherUserId);

  let [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(and(eq(conversationsTable.userIdA, a), eq(conversationsTable.userIdB, b)))
    .limit(1);

  if (!conversation) {
    conversation = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(conversationsTable)
        .values({ userIdA: a, userIdB: b })
        .returning();

      if (!created) {
        throw new AppError(500, "internal_error", "Failed to create conversation");
      }

      await tx
        .insert(conversationMembersTable)
        .values([
          { conversationId: created.id, userId: a },
          { conversationId: created.id, userId: b },
        ])
        .onConflictDoNothing();

      return created;
    });
  } else {
    // Reset deletedAt for the current user if they had previously deleted it
    // and a fresh getOrCreate is happening (e.g. composing a new message).
    await db
      .update(conversationMembersTable)
      .set({ deletedAt: null })
      .where(
        and(
          eq(conversationMembersTable.conversationId, conversation.id),
          eq(conversationMembersTable.userId, userId),
        ),
      );
  }

  return buildSummary(conversation, otherUser, userId);
}

async function buildSummary(
  conversation: Conversation,
  otherUser: User,
  userId: string,
): Promise<ConversationSummary> {
  const member = await getMember(conversation.id, userId);

  const messageConditions = [eq(messagesTable.conversationId, conversation.id)];
  if (member?.clearedAt) {
    messageConditions.push(gt(messagesTable.createdAt, member.clearedAt));
  }

  const [lastMessage] = await db
    .select()
    .from(messagesTable)
    .where(and(...messageConditions))
    .orderBy(desc(messagesTable.createdAt))
    .limit(1);

  const unreadConditions = [
    eq(messagesTable.conversationId, conversation.id),
    eq(messagesTable.status, "delivered"),
    eq(messagesTable.senderId, otherUser.id),
  ];
  if (member?.clearedAt) {
    unreadConditions.push(gt(messagesTable.createdAt, member.clearedAt));
  }

  const [unread] = await db
    .select({ value: count() })
    .from(messagesTable)
    .where(and(...unreadConditions));

  return {
    id: conversation.id,
    otherUser,
    lastMessage,
    unreadCount: unread?.value ?? 0,
    updatedAt: lastMessage?.createdAt ?? conversation.createdAt,
  };
}

export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const rows = await db
    .select({
      conversation: conversationsTable,
      member: conversationMembersTable,
    })
    .from(conversationMembersTable)
    .innerJoin(conversationsTable, eq(conversationsTable.id, conversationMembersTable.conversationId))
    .where(eq(conversationMembersTable.userId, userId));

  const summaries: ConversationSummary[] = [];

  for (const row of rows) {
    if (row.member.deletedAt) continue;

    const otherUserId =
      row.conversation.userIdA === userId ? row.conversation.userIdB : row.conversation.userIdA;

    const [otherUser] = await db.select().from(usersTable).where(eq(usersTable.id, otherUserId)).limit(1);
    if (!otherUser) continue;

    summaries.push(await buildSummary(row.conversation, otherUser, userId));
  }

  summaries.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return summaries;
}

export async function deleteConversation(userId: string, conversationId: string): Promise<void> {
  await ensureMember(conversationId, userId);

  await db
    .update(conversationMembersTable)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(conversationMembersTable.conversationId, conversationId),
        eq(conversationMembersTable.userId, userId),
      ),
    );
}

export async function clearConversation(userId: string, conversationId: string): Promise<void> {
  await ensureMember(conversationId, userId);

  await db
    .update(conversationMembersTable)
    .set({ clearedAt: new Date() })
    .where(
      and(
        eq(conversationMembersTable.conversationId, conversationId),
        eq(conversationMembersTable.userId, userId),
      ),
    );
}

/**
 * Revives a soft-deleted conversation for a member when a new message
 * arrives, so it reappears in their conversation list.
 */
export async function reviveForMember(conversationId: string, userId: string): Promise<void> {
  await db
    .update(conversationMembersTable)
    .set({ deletedAt: null })
    .where(
      and(
        eq(conversationMembersTable.conversationId, conversationId),
        eq(conversationMembersTable.userId, userId),
      ),
    );
}

export async function getConversationOrThrow(conversationId: string, userId: string): Promise<Conversation> {
  await ensureMember(conversationId, userId);

  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, conversationId))
    .limit(1);

  if (!conversation) {
    throw new AppError(404, "conversation_not_found", "Conversation not found");
  }

  return conversation;
}

export function getOtherParticipant(conversation: Conversation, userId: string): string {
  return conversation.userIdA === userId ? conversation.userIdB : conversation.userIdA;
}

export async function getMemberState(conversationId: string, userId: string) {
  return getMember(conversationId, userId);
}
