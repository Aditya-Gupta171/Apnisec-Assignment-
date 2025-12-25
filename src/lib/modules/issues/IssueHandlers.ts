import { NextRequest, NextResponse } from "next/server";
import { BaseHandler } from "@/lib/core/BaseHandler";
import { IssueService } from "./IssueService";
import { IssueValidator } from "./IssueValidator";
import { RateLimiter } from "@/lib/core/RateLimiter";
import { AuthMiddleware } from "@/lib/core/AuthMiddleware";

const RATE_LIMIT = 200;
const WINDOW_MS = 15 * 60 * 1000;

abstract class IssueBaseHandler extends BaseHandler {
  constructor(
    protected readonly issueService: IssueService,
    protected readonly validator: IssueValidator,
    protected readonly rateLimiter: RateLimiter,
    protected readonly auth: AuthMiddleware
  ) {
    super();
  }

  protected getClientKey(req: NextRequest): string {
    return req.headers.get("x-forwarded-for") ?? (req as any).ip ?? "anonymous";
  }

  protected applyRateLimitHeaders(
    res: NextResponse,
    remaining: number,
    resetAt: number
  ) {
    res.headers.set("X-RateLimit-Limit", RATE_LIMIT.toString());
    res.headers.set("X-RateLimit-Remaining", remaining.toString());
    res.headers.set("X-RateLimit-Reset", Math.floor(resetAt / 1000).toString());
  }
}

export class ListIssuesHandler extends IssueBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const user = this.auth.getUser(req);
    const { search, status, priority, type } = Object.fromEntries(
      req.nextUrl.searchParams
    ) as any;

    const issues = await this.issueService.list(user.userId, {
      search,
      status,
      priority,
      type,
    });

    const res = this.ok({ issues });
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export class CreateIssueHandler extends IssueBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const user = this.auth.getUser(req);
    const body = await req.json();
    const input = this.validator.validateCreate(body);

    const issue = await this.issueService.create(user.userId, input);

    const res = this.ok({ issue }, 201);
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export class GetIssueHandler extends IssueBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const user = this.auth.getUser(req);
    const id = req.nextUrl.pathname.split("/").pop()!;

    const issue = await this.issueService.getById(user.userId, id);

    const res = this.ok({ issue });
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export class UpdateIssueHandler extends IssueBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const user = this.auth.getUser(req);
    const id = req.nextUrl.pathname.split("/").pop()!;
    const body = await req.json();
    const input = this.validator.validateUpdate(body);

    const issue = await this.issueService.update(user.userId, id, input);

    const res = this.ok({ issue });
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export class DeleteIssueHandler extends IssueBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const user = this.auth.getUser(req);
    const id = req.nextUrl.pathname.split("/").pop()!;

    await this.issueService.remove(user.userId, id);

    const res = this.ok({ message: "Issue deleted" });
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export function createRateLimiter() {
  return new RateLimiter(RATE_LIMIT, WINDOW_MS);
}
