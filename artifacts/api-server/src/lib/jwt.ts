import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (typeof decoded === "string" || !("userId" in decoded) || typeof decoded.userId !== "string") {
    throw new Error("Invalid token payload");
  }

  return { userId: decoded.userId };
}
