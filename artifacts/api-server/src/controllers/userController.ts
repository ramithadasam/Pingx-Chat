import type { Request, Response } from "express";
import { requireParam } from "../utils/params";
import { SearchUsersQueryParams, UpdateMeBody, UpdateSettingsBody, UpdateStatusBody } from "@workspace/api-zod";
import * as userService from "../services/userService";
import * as mediaService from "../services/mediaService";
import { serializeUser, serializePublicUser, serializeNotificationSettings } from "../lib/serializers";
import { AppError } from "../middleware/errorHandler";

export async function searchUsers(req: Request, res: Response): Promise<void> {
  const { q } = SearchUsersQueryParams.parse(req.query);
  const users = await userService.searchUsers(req.userId!, q);
  res.status(200).json(users.map(serializePublicUser));
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  const user = await userService.getUserOrThrow(requireParam(req, "id"));
  res.status(200).json(serializePublicUser(user));
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  const updates = UpdateMeBody.parse(req.body);

  if (Object.keys(updates).length === 0) {
    throw new AppError(400, "validation_error", "At least one field must be provided");
  }

  const user = await userService.updateProfile(req.userId!, updates);
  res.status(200).json(serializeUser(user));
}

export async function updateAvatar(req: Request, res: Response): Promise<void> {
  const file = req.file;

  if (!file) {
    throw new AppError(400, "missing_file", "No file uploaded");
  }

  const uploaded = await mediaService.uploadAvatar(
    { buffer: file.buffer, mimetype: file.mimetype, size: file.size },
    "pingx/avatars",
  );

  const user = await userService.updateAvatar(req.userId!, uploaded.url, uploaded.publicId);
  res.status(200).json(serializeUser(user));
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const updates = UpdateSettingsBody.parse(req.body);

  if (Object.keys(updates).length === 0) {
    throw new AppError(400, "validation_error", "At least one field must be provided");
  }

  const settings = await userService.updateSettings(req.userId!, updates);
  res.status(200).json(serializeNotificationSettings(settings));
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const input = UpdateStatusBody.parse(req.body);
  const user = await userService.updateStatus(req.userId!, input);
  res.status(200).json(serializeUser(user));
}
