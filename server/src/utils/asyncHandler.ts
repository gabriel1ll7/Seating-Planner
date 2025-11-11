import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an asynchronous Express request handler to ensure that any rejected promises
 * are caught and passed to the next error-handling middleware.
 *
 * @param fn The async request handler function to wrap.
 * @returns A standard Express request handler.
 */
const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
