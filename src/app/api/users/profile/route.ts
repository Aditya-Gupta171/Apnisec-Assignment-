import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { UserRepository } from "@/lib/modules/users/UserRepository";
import { UserService } from "@/lib/modules/users/UserService";
import { UserValidator } from "@/lib/modules/users/UserValidator";
import {
  GetProfileHandler,
  UpdateProfileHandler,
  createRateLimiter,
} from "@/lib/modules/users/UserHandlers";
import { JwtService } from "@/lib/core/JwtService";
import { AuthMiddleware } from "@/lib/core/AuthMiddleware";

const repo = new UserRepository(prisma);
const service = new UserService(repo);
const validator = new UserValidator();
const rateLimiter = createRateLimiter();
const jwtService = new JwtService(process.env.JWT_SECRET!);
const authMiddleware = new AuthMiddleware(jwtService);

export async function GET(req: NextRequest) {
  const handler = new GetProfileHandler(
    service,
    validator,
    rateLimiter,
    authMiddleware
  );
  return handler.run(req);
}

export async function PUT(req: NextRequest) {
  const handler = new UpdateProfileHandler(
    service,
    validator,
    rateLimiter,
    authMiddleware
  );
  return handler.run(req);
}
