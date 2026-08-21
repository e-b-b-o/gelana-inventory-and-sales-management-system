import * as argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db } from "../../config/database.js";
import { users } from "../../database/schema/index.js";
import { AppError } from "../../utils/errors.js";
import type { LoginInput } from "./schema.js";

export async function authenticateUser(input: LoginInput) {
  const foundUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  const user = foundUsers[0];

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("User is inactive", 401);
  }

  const isPasswordValid = await argon2.verify(user.passwordHash, input.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    branch: user.branchId,
  };
}
