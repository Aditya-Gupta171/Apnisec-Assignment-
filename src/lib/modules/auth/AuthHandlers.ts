import { BaseHandler } from "@/lib/core/BaseHandler";
import { AuthService } from "./AuthService";
import { AuthValidator } from "./AuthValidator";
import { RateLimiter } from "@/lib/core/RateLimiter";
import { JwtService } from "@/lib/core/JwtService";
import { AuthError } from "@/lib/core/ApiError";
import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT = 100;
const WINDOW_MS = 15 * 60 * 1000;

export abstract class AuthBaseHandler extends BaseHandler {
  constructor(
    protected readonly authService: AuthService,
    protected readonly validator: AuthValidator,
    protected readonly rateLimiter: RateLimiter,
    protected readonly jwtService: JwtService
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

export class RegisterHandler extends AuthBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const body = await req.json();
    const input = this.validator.validateRegister(body);

    const { user, accessToken, refreshToken, refreshExpiresAt } =
      await this.authService.register(input);

    const res = this.ok({ user });
    res.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
    res.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor((refreshExpiresAt.getTime() - Date.now()) / 1000),
    });
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export class LoginHandler extends AuthBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const body = await req.json();
    const input = this.validator.validateLogin(body);

    const { user, accessToken, refreshToken, refreshExpiresAt } =
      await this.authService.login(input);

    const res = this.ok({ user });
    res.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
    res.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor((refreshExpiresAt.getTime() - Date.now()) / 1000),
    });
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export class MeHandler extends AuthBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      throw new AuthError("Not authenticated");
    }

    const payload = this.jwtService.verify(token);
    const user = await this.authService.getUserById(payload.userId);

    const res = this.ok({ user });
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export class LogoutHandler extends AuthBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      throw new AuthError("Not authenticated");
    }

    // Will throw AuthError if token is invalid / tampered / expired
    const payload = this.jwtService.verify(token);

    const refreshToken = req.cookies.get("refresh_token")?.value;
    await this.authService.logout(payload.userId, refreshToken);

    const res = this.ok({ message: "Logged out" });
    res.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    res.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export class RefreshHandler extends AuthBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (!refreshToken) {
      throw new AuthError("Not authenticated");
    }

    const {
      user,
      accessToken,
      refreshToken: newRefreshToken,
      refreshExpiresAt,
    } = await this.authService.refreshTokens(refreshToken);

    const res = this.ok({ user });
    res.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
    res.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor((refreshExpiresAt.getTime() - Date.now()) / 1000),
    });
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export class ForgotPasswordHandler extends AuthBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const body = await req.json();
    const email = (body?.email as string | undefined) ?? "";

    const origin = req.nextUrl.origin;
    await this.authService.startPasswordReset(email, origin);

    const res = this.ok({
      message: "If that account exists, we emailed a reset link",
    });
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export class ResetPasswordHandler extends AuthBaseHandler {
  protected async handle(req: NextRequest): Promise<NextResponse> {
    const key = this.getClientKey(req);
    const { remaining, resetAt } = this.rateLimiter.check(key);

    const body = await req.json();
    const token = body?.token as string | undefined;
    const password = body?.password as string | undefined;

    if (!token || !password || password.length < 6) {
      throw new AuthError("Invalid reset payload");
    }

    await this.authService.resetPassword(token, password);

    const res = this.ok({ message: "Password updated" });
    this.applyRateLimitHeaders(res, remaining, resetAt);
    return res;
  }
}

export function createRateLimiter() {
  return new RateLimiter(RATE_LIMIT, WINDOW_MS);
}
