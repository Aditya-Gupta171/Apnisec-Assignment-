import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { IssueRepository } from "@/lib/modules/issues/IssueRepository";
import { IssueService } from "@/lib/modules/issues/IssueService";
import { IssueValidator } from "@/lib/modules/issues/IssueValidator";
import {
  GetIssueHandler,
  UpdateIssueHandler,
  DeleteIssueHandler,
  createRateLimiter,
} from "@/lib/modules/issues/IssueHandlers";
import { JwtService } from "@/lib/core/JwtService";
import { AuthMiddleware } from "@/lib/core/AuthMiddleware";

const repo = new IssueRepository(prisma);
const service = new IssueService(repo);
const validator = new IssueValidator();
const rateLimiter = createRateLimiter();
const jwtService = new JwtService(process.env.JWT_SECRET!);
const authMiddleware = new AuthMiddleware(jwtService);

export async function GET(req: NextRequest) {
  const handler = new GetIssueHandler(
    service,
    validator,
    rateLimiter,
    authMiddleware
  );
  return handler.run(req);
}

export async function PUT(req: NextRequest) {
  const handler = new UpdateIssueHandler(
    service,
    validator,
    rateLimiter,
    authMiddleware
  );
  return handler.run(req);
}

export async function DELETE(req: NextRequest) {
  const handler = new DeleteIssueHandler(
    service,
    validator,
    rateLimiter,
    authMiddleware
  );
  return handler.run(req);
}
