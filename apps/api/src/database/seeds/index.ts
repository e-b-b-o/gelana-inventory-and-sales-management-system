import * as argon2 from "argon2";
import { db } from "../../config/database.js";
import { branches, users } from "../schema/index.js";

async function seed() {
  console.log("Seeding Database");

  console.log("Seeding Branches");
  const branchData = [
    { name: "BRANCH-1", code: "123456" },
    { name: "BRANCH-2", code: "123457" },
    { name: "BRANCH-3", code: "123458" },
  ];
  await db
    .insert(branches)
    .values(branchData)
    .onConflictDoNothing({ target: branches.code });

  //OWNER

  console.log("Seeding Owner");

  const rawPassword = "123456";
  const passwordHash = await argon2.hash(rawPassword);

  await db
    .insert(users)
    .values({
      name: "Gelana Techan",
      email: "gelanatechan@gmail.com",
      passwordHash,
      role: "OWNER",
      isActive: true,
    })
    .onConflictDoNothing({ target: users.email });

  console.log("Seeding complete");
  process.exit(0);
}

seed().catch((err) => {
  console.log("Seeding failed", err);
  process.exit(1);
});
