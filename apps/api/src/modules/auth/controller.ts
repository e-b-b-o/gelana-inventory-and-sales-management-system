import { Request, Response } from "express";
import { loginSchema } from "./schema.js";
import { authenticateUser } from "./service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { signToken } from "./jwt.js";
import strict from "node:assert/strict";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.format() });
    return;
  }

  const user = await authenticateUser(parsed.data);

  const token = signToken({
    userId: user.id,
    role: user.role,
    branchId: user.branch,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ message: "Login successfull", user });
});
