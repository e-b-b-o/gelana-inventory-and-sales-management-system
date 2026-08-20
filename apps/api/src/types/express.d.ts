import { Jwt } from "jsonwebtoken";
import { JwtPayload } from "../modules/auth/jwt.ts";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
