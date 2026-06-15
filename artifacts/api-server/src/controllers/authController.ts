import type { Request, Response } from "express";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import * as authService from "../services/authService";
import * as userService from "../services/userService";
import { serializeUser, serializeNotificationSettings } from "../lib/serializers";
import { AppError } from "../middleware/errorHandler";

export async function register(req: Request, res: Response): Promise<void> {
  const input = RegisterBody.parse(req.body);
  const { user, token } = await authService.register(input);
  res.status(201).json({ user: serializeUser(user), token });
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = LoginBody.parse(req.body);
  const { user, token } = await authService.login(input);
  res.status(200).json({ user: serializeUser(user), token });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    throw new AppError(401, "unauthorized", "Not authenticated");
  }

  const user = await userService.getUserOrThrow(req.userId);
  const settings = await userService.getSettingsOrThrow(req.userId);

  res.status(200).json({
    user: serializeUser(user),
    settings: serializeNotificationSettings(settings),
  });
}
