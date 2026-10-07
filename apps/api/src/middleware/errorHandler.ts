import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
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
