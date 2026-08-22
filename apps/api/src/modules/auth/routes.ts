import { Router } from "express";
import { getMe, login, logout } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import rateLimit from "express-rate-limit";

export const authRouter = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post("/login", loginLimiter, login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, getMe);
