import type { Server } from "socket.io";
import * as conversationService from "../services/conversationService";
import type { AuthenticatedSocket } from "./authMiddleware";

interface TypingPayload {
  conversationId: string;
}

/**
 * Relays typing:start / typing:stop to the other participant in the
 * conversation. Validates that the socket's user is actually a member of
 * the conversation before relaying, but fails silently (no error emitted)
 * since typing indicators are best-effort and non-critical.
 */
export function registerTypingHandlers(_io: Server, socket: AuthenticatedSocket): void {
  const handle = (isTyping: boolean) => async (payload: TypingPayload) => {
    if (!payload?.conversationId) return;

    try {
      const conversation = await conversationService.getConversationOrThrow(
        payload.conversationId,
        socket.userId,
      );
      const otherUserId = conversationService.getOtherParticipant(conversation, socket.userId);

      socket.to(`user:${otherUserId}`).emit("typing:update", {
        conversationId: payload.conversationId,
        userId: socket.userId,
        isTyping,
      });
    } catch {
      // Conversation not found or socket user not a member — ignore silently.
    }
  };

  socket.on("typing:start", handle(true));
  socket.on("typing:stop", handle(false));
}
