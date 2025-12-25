import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { IssueRepository } from "@/lib/modules/issues/IssueRepository";
import { IssueService } from "@/lib/modules/issues/IssueService";
import { IssueValidator } from "@/lib/modules/issues/IssueValidator";
import {
  ListIssuesHandler,
  CreateIssueHandler,
  createRateLimiter,
} from "@/lib/modules/issues/IssueHandlers";
import { JwtService } from "@/lib/core/JwtService";
import { AuthMiddleware } from "@/lib/core/AuthMiddleware";
import { EmailService } from "@/lib/modules/email/EmailService";

const repo = new IssueRepository(prisma);
const emailService = new EmailService(process.env.RESEND_API_KEY);
const service = new IssueService(repo, emailService);
const validator = new IssueValidator();
const rateLimiter = createRateLimiter();
const jwtService = new JwtService(process.env.JWT_SECRET!);
const authMiddleware = new AuthMiddleware(jwtService);

export async function GET(req: NextRequest) {
  const handler = new ListIssuesHandler(
    service,
    validator,
    rateLimiter,
    authMiddleware
  );
  return handler.run(req);
}

export async function POST(req: NextRequest) {
  const handler = new CreateIssueHandler(
    service,
    validator,
    rateLimiter,
    authMiddleware
  );
  return handler.run(req);
}
