import type { Request } from "express";
import { AppError } from "../middleware/errorHandler";

/**
 * Extracts a route parameter as a string. Express types `req.params[key]`
 * as `string | string[]` to account for wildcard routes; every route in
 * this API uses named `:param` segments, which are always strings, so this
 * narrows the type and guards against the (practically impossible) array
 * case with a clear 400 instead of a runtime type error downstream.
 */
export function requireParam(req: Request, name: string): string {
  const value = req.params[name];

  if (typeof value !== "string" || value.length === 0) {
    throw new AppError(400, "validation_error", `Missing or invalid path parameter: ${name}`);
  }

  return value;
}
