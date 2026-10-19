import { Router } from "express";
import { getMe, login, logout } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import rateLimit from "express-rate-limit";

export const authRouter = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many login attempts, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

authRouter.post("/login", loginLimiter, login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, getMe);
