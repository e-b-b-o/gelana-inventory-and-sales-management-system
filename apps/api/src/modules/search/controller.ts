import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { SearchService } from "./service.js";
import { searchQuerySchema } from "./schema.js";
import { AppError } from "../../utils/errors.js";

const searchService = new SearchService();

export class SearchController {
  search = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401, "AUTHENTICATION_ERROR");
    }

    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError("Invalid search parameters", 400, "VALIDATION_ERROR", parsed.error.format());
    }

    const { q, limit } = parsed.data;
    const response = await searchService.search(q, req.user, limit);

    res.json(response);
  });
}
