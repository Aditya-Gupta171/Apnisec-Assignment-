import { NextRequest, NextResponse } from "next/server";
import { BaseHandler } from "@/lib/core/BaseHandler";
import { UserService } from "./UserService";
import { UserValidator } from "./UserValidator";
import { RateLimiter } from "@/lib/core/RateLimiter";
import { AuthMiddleware } from "@/lib/core/AuthMiddleware";

const RATE_LIMIT = 200;
const WINDOW_MS = 15 * 60 * 1000;

abstract class UserBaseHandler extends BaseHandler {
  constructor(
    protected readonly userService: UserService,
    protected readonly validator: UserValidator,
    protected readonly rateLimiter: RateLimiter,
    protected readonly auth: AuthMiddleware
  ) {
    super();
  }

  protected getClientKey(req: NextRequest): string {
    return (
      req.headers.get("x-forwarded-for") ??
      (req as any).ip ??
      "anonymous"
    );
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

export class GetProfileHandler extends UserBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const userPayload = this.auth.getUser(req);
    const data = await this.userService.getProfile(userPayload.userId);

    const res = this.ok(data);
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export class UpdateProfileHandler extends UserBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const userPayload = this.auth.getUser(req);
    const body = await req.json();
    const input = this.validator.validateProfile(body);

    const profile = await this.userService.updateProfile(
      userPayload.userId,
      input
    );

    const res = this.ok({ profile });
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export function createRateLimiter() {
  return new RateLimiter(RATE_LIMIT, WINDOW_MS);
}
