import { NextRequest } from "next/server";
import { JwtService, JwtPayload } from "./JwtService";
import { AuthError } from "./ApiError";

export class AuthMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  getUser(req: NextRequest): JwtPayload {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      throw new AuthError("Not authenticated");
    }
    return this.jwtService.verify(token);
  }
}
