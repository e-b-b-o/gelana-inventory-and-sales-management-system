import { Router } from "express";
import { getMe, login, logout } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, getMe);
