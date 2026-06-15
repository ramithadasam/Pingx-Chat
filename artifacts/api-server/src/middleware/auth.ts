import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid Authorization header" });
    return;
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "unauthorized", message: "Invalid or expired token" });
  }
}
