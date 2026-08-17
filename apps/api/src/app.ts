import express from "express";
import { authRouter } from "./modules/auth/routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Gelana API is running",
  });
});

app.use("/api/v1/auth", authRouter);

app.use(errorHandler);
