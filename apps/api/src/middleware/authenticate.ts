import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../modules/auth/jwt.js";
import { AppError } from "../utils/errors.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;

    if (!token) throw new AppError("Authentication required", 401);

    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
};
