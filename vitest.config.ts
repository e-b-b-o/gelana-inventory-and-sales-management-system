import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config({ path: "apps/api/.env" });

export default defineConfig({
  test: {
    fileParallelism: false,
    environmentMatchGlobs: [
      ["apps/web/**", "jsdom"],
      ["apps/api/**", "node"],
    ],
    exclude: ["**/dist/**", "**/node_modules/**"],
  },
});
