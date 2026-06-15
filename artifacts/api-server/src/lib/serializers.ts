import type { User as UserRow, NotificationSettings as NotificationSettingsRow, Message as MessageRow, Note as NoteRow, Thought as ThoughtRow } from "@workspace/db";
import type { FriendRequestWithUsers, FriendWithConversation } from "../services/friendService";
import type { ConversationSummary } from "../services/conversationService";

/**
 * Maps a full DB user row to the `User` API schema (includes phone — only
 * returned to the user themselves).
 */
export function serializeUser(user: UserRow) {
  return {
    id: user.id,
    phone: user.phone,
    username: user.username,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    status: user.status,
    showOfflineStatus: user.showOfflineStatus,
    publicKey: user.publicKey ?? null,
    lastSeenAt: user.lastSeenAt ? user.lastSeenAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Maps a full DB user row to the `PublicUser` API schema (no phone).
 * If the user has showOfflineStatus = false and is offline, status is
 * reported as "offline" regardless (we never fabricate "online"), but
 * lastSeenAt is hidden from other users in that case.
 */
export function serializePublicUser(user: UserRow) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    status: user.status,
    showOfflineStatus: user.showOfflineStatus,
    publicKey: user.publicKey ?? null,
    lastSeenAt: user.showOfflineStatus && user.lastSeenAt ? user.lastSeenAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeNotificationSettings(settings: NotificationSettingsRow) {
  return {
    notificationsEnabled: settings.notificationsEnabled,
    messageNotifications: settings.messageNotifications,
    groupNotifications: settings.groupNotifications,
    mentions: settings.mentions,
    friendRequests: settings.friendRequests,
    newFriends: settings.newFriends,
    appUpdates: settings.appUpdates,
    promotions: settings.promotions,
    quietHours: settings.quietHours,
    readReceipts: settings.readReceipts,
    endToEndEncryption: settings.endToEndEncryption,
    vanishMode: settings.vanishMode,
  };
}

export function serializeMessage(message: MessageRow) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    contentType: message.contentType,
    text: message.text,
    mediaUrl: message.mediaUrl,
    mediaMimeType: message.mediaMimeType,
    mediaSize: message.mediaSize,
    status: message.status,
    createdAt: message.createdAt.toISOString(),
  };
}

export function serializeNote(note: NoteRow) {
  return {
    id: note.id,
    content: note.content,
    color: note.color,
    createdAt: note.createdAt.toISOString(),
  };
}

export function serializeThought(thought: ThoughtRow) {
  return {
    id: thought.id,
    text: thought.text,
    createdAt: thought.createdAt.toISOString(),
  };
}

export function serializeFriendRequest(request: FriendRequestWithUsers) {
  return {
    id: request.id,
    sender: serializePublicUser(request.sender),
    receiver: serializePublicUser(request.receiver),
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    respondedAt: request.respondedAt ? request.respondedAt.toISOString() : null,
  };
}

export function serializeFriend(friend: FriendWithConversation) {
  return {
    user: serializePublicUser(friend.user),
    conversationId: friend.conversationId,
    lastMessage: friend.lastMessage ? serializeMessage(friend.lastMessage) : null,
    friendsSince: friend.friendsSince.toISOString(),
  };
}

export function serializeConversationSummary(summary: ConversationSummary) {
  return {
    id: summary.id,
    otherUser: serializePublicUser(summary.otherUser),
    lastMessage: summary.lastMessage ? serializeMessage(summary.lastMessage) : null,
    unreadCount: summary.unreadCount,
    updatedAt: summary.updatedAt.toISOString(),
  };
}
