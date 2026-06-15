import { and, eq, or, desc } from "drizzle-orm";
import {
  db,
  usersTable,
  friendRequestsTable,
  friendshipsTable,
  blockedUsersTable,
  conversationsTable,
  conversationMembersTable,
  messagesTable,
} from "@workspace/db";
import type { User, FriendRequest } from "@workspace/db";
import { AppError } from "../middleware/errorHandler";
import { orderedPair } from "../utils/pairs";

async function areBlocked(userIdA: string, userIdB: string): Promise<boolean> {
  const [block] = await db
    .select({ id: blockedUsersTable.id })
    .from(blockedUsersTable)
    .where(
      or(
        and(eq(blockedUsersTable.blockerId, userIdA), eq(blockedUsersTable.blockedId, userIdB)),
        and(eq(blockedUsersTable.blockerId, userIdB), eq(blockedUsersTable.blockedId, userIdA)),
      ),
    )
    .limit(1);

  return !!block;
}

async function areFriends(userIdA: string, userIdB: string): Promise<boolean> {
  const [a, b] = orderedPair(userIdA, userIdB);
  const [friendship] = await db
    .select({ id: friendshipsTable.id })
    .from(friendshipsTable)
    .where(and(eq(friendshipsTable.userIdA, a), eq(friendshipsTable.userIdB, b)))
    .limit(1);

  return !!friendship;
}

export interface FriendRequestWithUsers extends FriendRequest {
  sender: User;
  receiver: User;
}

export async function sendFriendRequest(
  senderId: string,
  receiverId: string,
): Promise<FriendRequestWithUsers> {
  if (senderId === receiverId) {
    throw new AppError(400, "invalid_request", "You cannot send a friend request to yourself");
  }

  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, receiverId)).limit(1);
  if (!receiver) {
    throw new AppError(404, "user_not_found", "User not found");
  }

  if (await areBlocked(senderId, receiverId)) {
    throw new AppError(400, "blocked", "Cannot send a friend request to this user");
  }

  if (await areFriends(senderId, receiverId)) {
    throw new AppError(400, "already_friends", "You are already friends with this user");
  }

  // Check for an existing pending request in either direction.
  const [existing] = await db
    .select()
    .from(friendRequestsTable)
    .where(
      and(
        eq(friendRequestsTable.status, "pending"),
        or(
          and(eq(friendRequestsTable.senderId, senderId), eq(friendRequestsTable.receiverId, receiverId)),
          and(eq(friendRequestsTable.senderId, receiverId), eq(friendRequestsTable.receiverId, senderId)),
        ),
      ),
    )
    .limit(1);

  if (existing) {
    throw new AppError(409, "request_exists", "A pending friend request already exists between these users");
  }

  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, senderId)).limit(1);
  if (!sender) {
    throw new AppError(404, "user_not_found", "User not found");
  }

  const [request] = await db
    .insert(friendRequestsTable)
    .values({ senderId, receiverId })
    .returning();

  if (!request) {
    throw new AppError(500, "internal_error", "Failed to create friend request");
  }

  return { ...request, sender, receiver };
}

export async function listFriendRequests(
  userId: string,
): Promise<{ incoming: FriendRequestWithUsers[]; outgoing: FriendRequestWithUsers[] }> {
  const rows = await db
    .select({
      request: friendRequestsTable,
      sender: usersTable,
    })
    .from(friendRequestsTable)
    .innerJoin(usersTable, eq(usersTable.id, friendRequestsTable.senderId))
    .where(
      and(
        eq(friendRequestsTable.status, "pending"),
        or(eq(friendRequestsTable.senderId, userId), eq(friendRequestsTable.receiverId, userId)),
      ),
    )
    .orderBy(desc(friendRequestsTable.createdAt));

  // Need receiver info too; fetch receivers in a second pass keyed by id.
  const receiverIds = [...new Set(rows.map((r) => r.request.receiverId))];
  const receivers = receiverIds.length
    ? await db.select().from(usersTable).where(or(...receiverIds.map((id) => eq(usersTable.id, id))))
    : [];
  const receiverMap = new Map(receivers.map((u) => [u.id, u]));

  const incoming: FriendRequestWithUsers[] = [];
  const outgoing: FriendRequestWithUsers[] = [];

  for (const row of rows) {
    const receiver = receiverMap.get(row.request.receiverId);
    if (!receiver) continue;

    const full: FriendRequestWithUsers = { ...row.request, sender: row.sender, receiver };

    if (row.request.receiverId === userId) {
      incoming.push(full);
    } else {
      outgoing.push(full);
    }
  }

  return { incoming, outgoing };
}

export async function respondToFriendRequest(
  userId: string,
  requestId: string,
  action: "accept" | "reject",
): Promise<FriendRequestWithUsers> {
  const [request] = await db
    .select()
    .from(friendRequestsTable)
    .where(eq(friendRequestsTable.id, requestId))
    .limit(1);

  if (!request) {
    throw new AppError(404, "request_not_found", "Friend request not found");
  }

  if (request.receiverId !== userId) {
    throw new AppError(403, "forbidden", "You are not the recipient of this friend request");
  }

  if (request.status !== "pending") {
    throw new AppError(400, "already_responded", "This friend request has already been responded to");
  }

  const newStatus = action === "accept" ? "accepted" : "rejected";

  const updated = await db.transaction(async (tx) => {
    const [updatedRequest] = await tx
      .update(friendRequestsTable)
      .set({ status: newStatus, respondedAt: new Date() })
      .where(eq(friendRequestsTable.id, requestId))
      .returning();

    if (!updatedRequest) {
      throw new AppError(500, "internal_error", "Failed to update friend request");
    }

    if (action === "accept") {
      const [a, b] = orderedPair(request.senderId, request.receiverId);
      await tx.insert(friendshipsTable).values({ userIdA: a, userIdB: b }).onConflictDoNothing();
    }

    return updatedRequest;
  });

  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, request.senderId)).limit(1);
  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, request.receiverId)).limit(1);

  if (!sender || !receiver) {
    throw new AppError(500, "internal_error", "Failed to load friend request participants");
  }

  return { ...updated, sender, receiver };
}

export interface FriendWithConversation {
  user: User;
  conversationId: string;
  friendsSince: Date;
  lastMessage: typeof messagesTable.$inferSelect | undefined;
}

export async function listFriends(userId: string): Promise<FriendWithConversation[]> {
  const friendships = await db
    .select()
    .from(friendshipsTable)
    .where(or(eq(friendshipsTable.userIdA, userId), eq(friendshipsTable.userIdB, userId)))
    .orderBy(desc(friendshipsTable.createdAt));

  const results: FriendWithConversation[] = [];

  for (const friendship of friendships) {
    const friendId = friendship.userIdA === userId ? friendship.userIdB : friendship.userIdA;

    const [friend] = await db.select().from(usersTable).where(eq(usersTable.id, friendId)).limit(1);
    if (!friend) continue;

    const [a, b] = orderedPair(userId, friendId);
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
    }

    const [lastMessage] = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversation.id))
      .orderBy(desc(messagesTable.createdAt))
      .limit(1);

    results.push({
      user: friend,
      conversationId: conversation.id,
      friendsSince: friendship.createdAt,
      lastMessage,
    });
  }

  return results;
}

export async function removeFriend(userId: string, otherUserId: string): Promise<void> {
  const [a, b] = orderedPair(userId, otherUserId);

  const deleted = await db
    .delete(friendshipsTable)
    .where(and(eq(friendshipsTable.userIdA, a), eq(friendshipsTable.userIdB, b)))
    .returning();

  if (deleted.length === 0) {
    throw new AppError(404, "friendship_not_found", "Friendship not found");
  }
}

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  if (blockerId === blockedId) {
    throw new AppError(400, "invalid_request", "You cannot block yourself");
  }

  const [blocked] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, blockedId)).limit(1);
  if (!blocked) {
    throw new AppError(404, "user_not_found", "User not found");
  }

  await db.transaction(async (tx) => {
    await tx.insert(blockedUsersTable).values({ blockerId, blockedId }).onConflictDoNothing();

    const [a, b] = orderedPair(blockerId, blockedId);
    await tx
      .delete(friendshipsTable)
      .where(and(eq(friendshipsTable.userIdA, a), eq(friendshipsTable.userIdB, b)));

    await tx
      .delete(friendRequestsTable)
      .where(
        or(
          and(eq(friendRequestsTable.senderId, blockerId), eq(friendRequestsTable.receiverId, blockedId)),
          and(eq(friendRequestsTable.senderId, blockedId), eq(friendRequestsTable.receiverId, blockerId)),
        ),
      );
  });
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  await db
    .delete(blockedUsersTable)
    .where(and(eq(blockedUsersTable.blockerId, blockerId), eq(blockedUsersTable.blockedId, blockedId)));
}

export async function listBlockedUsers(userId: string): Promise<User[]> {
  const rows = await db
    .select({ user: usersTable })
    .from(blockedUsersTable)
    .innerJoin(usersTable, eq(usersTable.id, blockedUsersTable.blockedId))
    .where(eq(blockedUsersTable.blockerId, userId))
    .orderBy(desc(blockedUsersTable.createdAt));

  return rows.map((r) => r.user);
}

export async function sendFriendRequestByPhone(senderId: string, phone: string): Promise<FriendRequestWithUsers> {
  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (!receiver) {
    throw new AppError(404, "user_not_found", "No user with that phone number");
  }
  return sendFriendRequest(senderId, receiver.id);
}

export { areBlocked, areFriends };
