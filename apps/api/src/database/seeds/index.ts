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
  const insertedBranches = await db
    .insert(branches)
    .values(branchData)
    .onConflictDoNothing({ target: branches.code })
    .returning();

  // If onConflictDoNothing prevented returning IDs because they already exist, we need to query them
  const allBranches = await db.select().from(branches);
  const branch1 = allBranches.find(b => b.code === "123456");

  console.log("Seeding Development Users");

  const rawPassword = "password123";
  const passwordHash = await argon2.hash(rawPassword);

  // Development Owner
  await db
    .insert(users)
    .values({
      name: "Development Owner",
      email: "owner@dev.local",
      passwordHash,
      role: "OWNER",
      isActive: true,
    })
    .onConflictDoNothing({ target: users.email });

  // Development Employee
  if (branch1) {
    await db
      .insert(users)
      .values({
        name: "Development Employee",
        email: "employee@dev.local",
        passwordHash,
        role: "EMPLOYEE",
        branchId: branch1.id,
        isActive: true,
      })
      .onConflictDoNothing({ target: users.email });
  }

  // Development Deactivated User (for testing deactivated behavior)
  if (branch1) {
    await db
      .insert(users)
      .values({
        name: "Development Deactivated",
        email: "deactivated@dev.local",
        passwordHash,
        role: "EMPLOYEE",
        branchId: branch1.id,
        isActive: false,
      })
      .onConflictDoNothing({ target: users.email });
  }

  console.log("Seeding complete. Use password 'password123' for all development users.");
  process.exit(0);
}

seed().catch((err) => {
  console.log("Seeding failed", err);
  process.exit(1);
});
