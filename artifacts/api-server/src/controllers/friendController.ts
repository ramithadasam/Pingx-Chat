import type { Request, Response } from "express";
import { requireParam } from "../utils/params";
import { SendFriendRequestBody, RespondToFriendRequestBody } from "@workspace/api-zod";
import * as friendService from "../services/friendService";
import {
  serializeFriendRequest,
  serializeFriend,
  serializePublicUser,
} from "../lib/serializers";
import { getIo } from "../sockets";

export async function sendFriendRequest(req: Request, res: Response): Promise<void> {
  const { receiverId } = SendFriendRequestBody.parse(req.body);
  const request = await friendService.sendFriendRequest(req.userId!, receiverId);

  getIo()?.to(`user:${receiverId}`).emit("friend:request", serializeFriendRequest(request));

  res.status(201).json(serializeFriendRequest(request));
}

export async function listFriendRequests(req: Request, res: Response): Promise<void> {
  const { incoming, outgoing } = await friendService.listFriendRequests(req.userId!);
  res.status(200).json({
    incoming: incoming.map(serializeFriendRequest),
    outgoing: outgoing.map(serializeFriendRequest),
  });
}

export async function respondToFriendRequest(req: Request, res: Response): Promise<void> {
  const { action } = RespondToFriendRequestBody.parse(req.body);
  const request = await friendService.respondToFriendRequest(req.userId!, requireParam(req, "id"), action);

  if (action === "accept") {
    getIo()?.to(`user:${request.sender.id}`).emit("friend:accepted", serializeFriendRequest(request));
  }

  res.status(200).json(serializeFriendRequest(request));
}

export async function listFriends(req: Request, res: Response): Promise<void> {
  const friends = await friendService.listFriends(req.userId!);
  res.status(200).json(friends.map(serializeFriend));
}

export async function removeFriend(req: Request, res: Response): Promise<void> {
  await friendService.removeFriend(req.userId!, requireParam(req, "userId"));
  res.status(200).json({ success: true });
}

export async function listBlockedUsers(req: Request, res: Response): Promise<void> {
  const blocked = await friendService.listBlockedUsers(req.userId!);
  res.status(200).json(blocked.map(serializePublicUser));
}

export async function blockUser(req: Request, res: Response): Promise<void> {
  await friendService.blockUser(req.userId!, requireParam(req, "userId"));
  res.status(200).json({ success: true });
}

export async function unblockUser(req: Request, res: Response): Promise<void> {
  await friendService.unblockUser(req.userId!, requireParam(req, "userId"));
  res.status(200).json({ success: true });
}
