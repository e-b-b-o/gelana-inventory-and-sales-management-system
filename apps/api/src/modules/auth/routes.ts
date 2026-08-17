import { Router } from "express";
import { login } from "./controller.js";

export const authRouter = Router();

authRouter.post("/login", login);
