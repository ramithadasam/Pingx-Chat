import type { NextFunction, Request, Response } from "express";

/**
 * Wraps an async Express route handler so that rejected promises are
 * forwarded to `next()` and handled by the centralized error handler,
 * instead of becoming unhandled rejections.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
