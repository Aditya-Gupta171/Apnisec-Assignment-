import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { AuthRepository } from "@/lib/modules/auth/AuthRepository";
import { AuthService } from "@/lib/modules/auth/AuthService";
import { AuthValidator } from "@/lib/modules/auth/AuthValidator";
import {
  ResetPasswordHandler,
  createRateLimiter,
} from "@/lib/modules/auth/AuthHandlers";
import { JwtService } from "@/lib/core/JwtService";
import { EmailService } from "@/lib/modules/email/EmailService";

const repo = new AuthRepository(prisma);
const jwtService = new JwtService(process.env.JWT_SECRET!);
const emailService = new EmailService(process.env.RESEND_API_KEY);
const service = new AuthService(repo, jwtService, emailService);
const validator = new AuthValidator();
const rateLimiter = createRateLimiter();

export async function POST(req: NextRequest) {
  const handler = new ResetPasswordHandler(
    service,
    validator,
    rateLimiter,
    jwtService
  );
  return handler.run(req);
}
