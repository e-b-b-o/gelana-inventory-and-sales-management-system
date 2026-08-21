import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";

export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
};

export const authorizeBranchAccess = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    next(new AppError("Authorization required", 401));
  }

  if (req.user.role === "OWNER") {
    return next();
  }

  const targetBranchId =
    req.params.branchId || req.body.branchId || (req.query.branchId as string);

  if (!targetBranchId) {
    return next(new AppError("Branch ID is required for this action", 401));
  }

  if (req.user.branchId !== targetBranchId) {
    return next(
      new AppError(
        "You do not have permisson to access  this branch's data",
        403,
      ),
    );
  }

  next();
};
