import { db } from "./apps/api/src/config/database.js";
import { InventoryService } from "./apps/api/src/modules/inventory/service.js";

async function run() {
  try {
    const res = await InventoryService.getBalances({ page: 1, limit: 10 }, { role: "OWNER" });
    console.log(res);
  } catch(e) {
    console.error("FAILED:", e);
  }
}
run();
