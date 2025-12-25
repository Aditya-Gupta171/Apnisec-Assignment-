import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { AuthRepository } from "@/lib/modules/auth/AuthRepository";
import { AuthService } from "@/lib/modules/auth/AuthService";
import { AuthValidator } from "@/lib/modules/auth/AuthValidator";
import { MeHandler, createRateLimiter } from "@/lib/modules/auth/AuthHandlers";
import { JwtService } from "@/lib/core/JwtService";

const repo = new AuthRepository(prisma);
const jwtService = new JwtService(process.env.JWT_SECRET!);
const service = new AuthService(repo, jwtService);
const validator = new AuthValidator();
const rateLimiter = createRateLimiter();

export async function GET(req: NextRequest) {
  const handler = new MeHandler(service, validator, rateLimiter, jwtService);
  return handler.run(req);
}
