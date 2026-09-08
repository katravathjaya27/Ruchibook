import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Express 4 does not automatically catch errors thrown inside async
 * route handlers -- an unhandled rejection would crash the process or
 * hang the request. Wrapping every controller with asyncHandler
 * forwards any thrown/rejected error to errorHandler middleware.
 */
export const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
