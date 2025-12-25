import jwt from "jsonwebtoken";
import { AuthError } from "./ApiError";

export interface JwtPayload {
  userId: string;
  email: string;
}

export class JwtService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn = "15m"
  ) {}

  sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch {
      throw new AuthError("Invalid or expired token");
    }
  }
}
