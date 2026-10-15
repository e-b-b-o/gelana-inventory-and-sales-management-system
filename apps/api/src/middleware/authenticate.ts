import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../modules/auth/jwt.js";
import { AppError } from "../utils/errors.js";
import { getUserForSession } from "../modules/users/service.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;

    if (!token) throw new AppError("Authentication required", 401, "AUTHENTICATION_ERROR");

    const decoded = verifyToken(token);

    const user = await getUserForSession(decoded.userId);

    if (!user) {
      res.clearCookie("token");
      throw new AppError("User not found", 401, "AUTHENTICATION_ERROR");
    }

    if (!user.isActive) {
      res.clearCookie("token");
      throw new AppError("User is inactive", 401, "AUTHENTICATION_ERROR");
    }

    req.user = {
      id: user.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Invalid or expired token", 401, "AUTHENTICATION_ERROR"));
    }
  }
};
