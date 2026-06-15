import type { Request, Response } from "express";
import { requireParam } from "../utils/params";
import { CreateConversationBody, SendMessageBody } from "@workspace/api-zod";
import * as conversationService from "../services/conversationService";
import * as messageService from "../services/messageService";
import { serializeConversationSummary, serializeMessage } from "../lib/serializers";
import { AppError } from "../middleware/errorHandler";
import { getIo } from "../sockets";

export async function listConversations(req: Request, res: Response): Promise<void> {
  const conversations = await conversationService.listConversations(req.userId!);
  res.status(200).json(conversations.map(serializeConversationSummary));
}

export async function createConversation(req: Request, res: Response): Promise<void> {
  const { userId } = CreateConversationBody.parse(req.body);
  const conversation = await conversationService.getOrCreateConversation(req.userId!, userId);
  res.status(200).json(serializeConversationSummary(conversation));
}

export async function deleteConversation(req: Request, res: Response): Promise<void> {
  await conversationService.deleteConversation(req.userId!, requireParam(req, "id"));
  res.status(200).json({ success: true });
}

export async function clearConversation(req: Request, res: Response): Promise<void> {
  await conversationService.clearConversation(req.userId!, requireParam(req, "id"));
  res.status(200).json({ success: true });
}

export async function listMessages(req: Request, res: Response): Promise<void> {
  const conversationId = requireParam(req, "id");

  let before: Date | undefined;
  if (typeof req.query.before === "string") {
    const parsed = new Date(req.query.before);
    if (Number.isNaN(parsed.getTime())) {
      throw new AppError(400, "validation_error", "Invalid 'before' query parameter");
    }
    before = parsed;
  }

  let limit: number | undefined;
  if (typeof req.query.limit === "string") {
    const parsed = Number(req.query.limit);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 100) {
      throw new AppError(400, "validation_error", "Invalid 'limit' query parameter");
    }
    limit = parsed;
  }

  const page = await messageService.listMessages(req.userId!, conversationId, { before, limit });

  res.status(200).json({
    messages: page.messages.map(serializeMessage),
    nextCursor: page.nextCursor ? page.nextCursor.toISOString() : null,
  });
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const conversationId = requireParam(req, "id");
  const input = SendMessageBody.parse(req.body);

  const result = await messageService.sendMessage(req.userId!, conversationId, input);

  // Broadcast over the socket so both participants (across devices) receive
  // the message in real time, mirroring the socket-driven message:send path.
  const io = getIo();
  if (io) {
    const payload = serializeMessage(result.message);
    io.to(`user:${result.senderId}`).emit("message:new", payload);
    io.to(`user:${result.recipientId}`).emit("message:new", payload);
  }

  res.status(201).json(serializeMessage(result.message));
}
