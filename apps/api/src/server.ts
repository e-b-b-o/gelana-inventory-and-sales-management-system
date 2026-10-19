import "dotenv/config";
import { app } from "./app.js";
import { pool } from "./config/database.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`Gelana API running on http://${HOST}:${PORT}`);
});

let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async (err?: Error | null) => {
    if (err) {
      console.error("Error during HTTP server close:", err);
      process.exit(1);
    }

    try {
      await pool.end();
      console.log("Database pool connections closed successfully.");
      process.exit(0);
    } catch (dbErr) {
      console.error("Error during database pool shutdown:", dbErr);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("Graceful shutdown timed out after 10s. Forcing exit.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
