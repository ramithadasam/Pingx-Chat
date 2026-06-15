import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger";

export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.code, message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const message = err.issues
      .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
      .join("; ");
    res.status(400).json({ error: "validation_error", message });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "internal_error", message: "Something went wrong" });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "not_found", message: "Resource not found" });
}
