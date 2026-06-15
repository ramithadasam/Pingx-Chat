import type { Request, Response } from "express";
import * as mediaService from "../services/mediaService";
import { AppError } from "../middleware/errorHandler";

export async function uploadMedia(req: Request, res: Response): Promise<void> {
  const file = req.file;

  if (!file) {
    throw new AppError(400, "missing_file", "No file uploaded");
  }

  const uploaded = await mediaService.uploadChatMedia(
    { buffer: file.buffer, mimetype: file.mimetype, size: file.size },
    "pingx/messages",
  );

  res.status(201).json(uploaded);
}
