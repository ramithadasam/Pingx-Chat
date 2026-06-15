import type { Request, Response } from "express";
import { requireParam } from "../utils/params";
import { CreateThoughtBody } from "@workspace/api-zod";
import * as thoughtService from "../services/thoughtService";
import { serializeThought } from "../lib/serializers";

export async function listThoughts(req: Request, res: Response): Promise<void> {
  const thoughts = await thoughtService.listThoughts(req.userId!);
  res.status(200).json(thoughts.map(serializeThought));
}

export async function createThought(req: Request, res: Response): Promise<void> {
  const { text } = CreateThoughtBody.parse(req.body);
  const thought = await thoughtService.createThought(req.userId!, text);
  res.status(201).json(serializeThought(thought));
}

export async function deleteThought(req: Request, res: Response): Promise<void> {
  await thoughtService.deleteThought(req.userId!, requireParam(req, "id"));
  res.status(200).json({ success: true });
}
