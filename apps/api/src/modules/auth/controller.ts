import { Request, Response } from "express";
import { loginSchema } from "./schema.js";
import { authenticateUser } from "./service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { signToken } from "./jwt.js";
import { AppError } from "../../utils/errors.js";

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = (process.env.COOKIE_SAME_SITE as "strict" | "lax" | "none") || (isProduction ? "none" : "lax");
  const secure = process.env.COOKIE_SECURE !== undefined
    ? process.env.COOKIE_SECURE === "true"
    : (isProduction || sameSite === "none");

  return {
    httpOnly: true,
    secure,
    sameSite,
  };
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.format());
  }

  const user = await authenticateUser(parsed.data);

  const token = signToken({
    userId: user.id,
    role: user.role,
    branchId: user.branch,
  });

  const cookieOptions = getCookieOptions();

  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ message: "Login successful", user });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const cookieOptions = getCookieOptions();

  res.clearCookie("token", cookieOptions);

  res.json({ message: "Logged out successfully" });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.json({ user: req.user });
});
