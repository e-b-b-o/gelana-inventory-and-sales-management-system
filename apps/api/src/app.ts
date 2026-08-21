import express from "express";
import { authRouter } from "./modules/auth/routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Gelana API is running",
  });
});

app.use("/api/v1/auth", authRouter);

app.use(errorHandler);
