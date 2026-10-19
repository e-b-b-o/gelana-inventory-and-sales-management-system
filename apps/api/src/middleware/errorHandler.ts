import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: err.issues?.[0]?.message || "Validation failed",
        details: err.issues,
      },
    });
    return;
  }

  const dbCode = (err as any)?.code || (err as any)?.cause?.code;
  const isProduction = process.env.NODE_ENV === "production";

  if (dbCode === "23505") {
    const detail = (err as any)?.detail || (err as any)?.cause?.detail;
    res.status(409).json({
      error: {
        code: "CONFLICT",
        message: !isProduction && detail ? `Unique constraint conflict: ${detail}` : "A record with this unique value already exists.",
        details: isProduction ? undefined : detail,
      },
    });
    return;
  }

  if (dbCode === "23503") {
    res.status(400).json({
      error: {
        code: "FOREIGN_KEY_VIOLATION",
        message: "Referenced record does not exist or is currently in use.",
      },
    });
    return;
  }

  if (!(err instanceof AppError) || !err.isOperational) {
    console.error("Error caught in Middleware:", err);
  }

  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = "Internal server error";
  let details = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      details,
    },
  });
};
