import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  id?: string;
  name?: string;
  email?: string;
  role: string;
  branchId: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environmental variables");
}

if (process.env.NODE_ENV === "production" && (JWT_SECRET === "super_secret_development_key" || JWT_SECRET.length < 16)) {
  throw new Error("JWT_SECRET must be a strong secret in production mode (at least 16 characters, not default development key)");
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "1d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
}
