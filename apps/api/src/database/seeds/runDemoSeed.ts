import "dotenv/config";
import { seedDatabase } from "./index.js";
import { seedDemoData } from "./demoData.js";

async function main() {
  try {
    console.log("Step 1: Ensuring base catalog, branches, test accounts, and payment methods exist (non-destructive)...");
    await seedDatabase({ reset: false });

    console.log("Step 2: Reconciling rich demo business history (sales, returns, transfers, closings)...");
    const result = await seedDemoData();
    console.log("Seed Demo Data Completed Successfully:", result);
    process.exit(0);
  } catch (error) {
    console.error("Seed Demo Data Failed:", error);
    process.exit(1);
  }
}

main();
