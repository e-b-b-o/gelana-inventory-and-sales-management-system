import { Request, Response } from "express";
import { loginSchema } from "./schema.js";
import { authenticateUser } from "./service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.format() });
    return;
  }

  const user = authenticateUser(parsed.data);
  res.json({ message: "Login successfull", user });
});
