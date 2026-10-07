import express from "express";
import { authRouter } from "./modules/auth/routes.js";
import { usersRouter } from "./modules/users/routes.js";
import { branchesRouter } from "./modules/branches/routes.js";
import { categoriesRouter } from "./modules/categories/routes.js";
import { productsRouter } from "./modules/products/routes.js";
import { suppliersRouter } from "./modules/suppliers/routes.js";
import { paymentMethodsRouter } from "./modules/payment-methods/routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

export const app = express();

const ALLOWED_ORIGINS = ["http://localhost:5173"];
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests , please try again later" },
});

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS origin ${origin} not allowed`));
      }
    },
    credentials: true,
  }),
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(cookieParser());
app.use(generalLimiter);

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Gelana API is running",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/branches", branchesRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/suppliers", suppliersRouter);
app.use("/api/v1/payment-methods", paymentMethodsRouter);

app.use(errorHandler);
