import { db } from "./apps/api/src/config/database.js";
import { branches, products, users } from "./apps/api/src/database/schema/index.js";
import { InventoryService } from "./apps/api/src/modules/inventory/service.js";
import { eq } from "drizzle-orm";

async function main() {
  try {
    const branchList = await db.select().from(branches).limit(1);
    const productList = await db.select().from(products).limit(1);
    const userList = await db.select().from(users).limit(1);
    
    console.log("Found:", branchList[0]?.id, productList[0]?.id, userList[0]?.id);

    const res = await InventoryService.createOpeningStock({
      branchId: branchList[0].id,
      productId: productList[0].id,
      quantity: 10,
      unitCost: 100,
    }, { role: "OWNER", id: userList[0].id });
    
    console.log("Success:", res);
  } catch(e) {
    console.error("Error creating opening stock:", e);
  } finally {
    process.exit(0);
  }
}
main();
