import type { Server } from "socket.io";
import type { MessageContentType } from "@workspace/db";
import * as messageService from "../services/messageService";
import * as conversationService from "../services/conversationService";
import * as userService from "../services/userService";
import { serializeMessage } from "../lib/serializers";
import type { AuthenticatedSocket } from "./authMiddleware";

interface SendMessagePayload {
  conversationId: string;
  contentType: MessageContentType;
  text?: string | null;
  mediaUrl?: string | null;
  mediaPublicId?: string | null;
  mediaMimeType?: string | null;
  mediaSize?: number | null;
}

interface ReadPayload {
  conversationId: string;
  messageId: string;
}

interface AckResponse {
  error?: string;
}

export function registerMessageHandlers(io: Server, socket: AuthenticatedSocket): void {
  socket.on("message:send", (payload: SendMessagePayload, ack?: (response: AckResponse) => void) => {
    void (async () => {
      try {
        const result = await messageService.sendMessage(socket.userId, payload.conversationId, {
          contentType: payload.contentType,
          text: payload.text,
          mediaUrl: payload.mediaUrl,
          mediaPublicId: payload.mediaPublicId,
          mediaMimeType: payload.mediaMimeType,
          mediaSize: payload.mediaSize,
        });

        const serialized = serializeMessage(result.message);

        io.to(`user:${result.senderId}`).emit("message:new", serialized);
        io.to(`user:${result.recipientId}`).emit("message:new", serialized);

        // If the recipient has an active connection, mark delivered.
        const recipientSockets = await io.in(`user:${result.recipientId}`).fetchSockets();
        if (recipientSockets.length > 0) {
          const delivered = await messageService.markMessageDelivered(result.message.id);
          if (delivered) {
            const update = { messageId: delivered.id, status: delivered.status };
            io.to(`user:${result.senderId}`).emit("message:status", update);
            io.to(`user:${result.recipientId}`).emit("message:status", update);
          }
        }

        ack?.({});
      } catch (err) {
        ack?.({ error: err instanceof Error ? err.message : "Failed to send message" });
      }
    })();
  });

  socket.on("message:read", (payload: ReadPayload, ack?: (response: AckResponse) => void) => {
    void (async () => {
      try {
        const conversation = await conversationService.getConversationOrThrow(
          payload.conversationId,
          socket.userId,
        );
        const otherUserId = conversationService.getOtherParticipant(conversation, socket.userId);

        // Respect the *sender's* read-receipts preference: if the original
        // sender (the other participant here) has read receipts disabled,
        // we still update our own view but don't broadcast "read" back to
        // them — they'll just see "delivered".
        const senderSettings = await userService.getSettingsOrThrow(otherUserId);

        const updatedIds = await messageService.markMessagesRead(
          socket.userId,
          payload.conversationId,
          payload.messageId,
        );

        if (senderSettings.readReceipts) {
          for (const messageId of updatedIds) {
            const update = { messageId, status: "read" as const };
            io.to(`user:${socket.userId}`).emit("message:status", update);
            io.to(`user:${otherUserId}`).emit("message:status", update);
          }
        }

        ack?.({});
      } catch (err) {
        ack?.({ error: err instanceof Error ? err.message : "Failed to mark messages read" });
      }
    })();
  });
}
