import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

import * as schema from "../database/schema/index.js";

const databaseUrl = process.env.DATABASE_URL;
const isNeon = databaseUrl.includes("neon.tech");
const isSslExplicit = process.env.DATABASE_SSL === "true" || databaseUrl.includes("sslmode=require");
const useSsl = isNeon || isSslExplicit;

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: useSsl ? { rejectUnauthorized: true } : undefined,
});

export const db = drizzle(pool, { schema });
