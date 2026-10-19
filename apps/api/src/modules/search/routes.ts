import { Router } from "express";
import { SearchController } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";

export const searchRouter = Router();
const searchController = new SearchController();

searchRouter.get("/", authenticate, searchController.search);
