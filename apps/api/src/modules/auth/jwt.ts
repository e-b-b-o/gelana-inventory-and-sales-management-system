import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  role: string;
  branchId: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET)
  throw new Error("JWT SECRET is not defined in enviromental variables");

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "1d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
}
