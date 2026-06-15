import type { Request, Response } from "express";
import { requireParam } from "../utils/params";
import { CreateNoteBody, UpdateNoteBody } from "@workspace/api-zod";
import * as noteService from "../services/noteService";
import { serializeNote } from "../lib/serializers";
import { AppError } from "../middleware/errorHandler";

export async function listNotes(req: Request, res: Response): Promise<void> {
  const notes = await noteService.listNotes(req.userId!);
  res.status(200).json(notes.map(serializeNote));
}

export async function createNote(req: Request, res: Response): Promise<void> {
  const input = CreateNoteBody.parse(req.body);
  const note = await noteService.createNote(req.userId!, input);
  res.status(201).json(serializeNote(note));
}

export async function updateNote(req: Request, res: Response): Promise<void> {
  const updates = UpdateNoteBody.parse(req.body);

  if (Object.keys(updates).length === 0) {
    throw new AppError(400, "validation_error", "At least one field must be provided");
  }

  const note = await noteService.updateNote(req.userId!, requireParam(req, "id"), updates);
  res.status(200).json(serializeNote(note));
}

export async function deleteNote(req: Request, res: Response): Promise<void> {
  await noteService.deleteNote(req.userId!, requireParam(req, "id"));
  res.status(200).json({ success: true });
}
