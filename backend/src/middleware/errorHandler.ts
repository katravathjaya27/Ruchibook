import { Request, Response, NextFunction } from "express";

// Catches any error thrown (or passed to next()) in a route/controller
// and returns a consistent JSON error shape instead of an HTML stack trace.
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);
  const statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Something went wrong. Please try again.",
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};
