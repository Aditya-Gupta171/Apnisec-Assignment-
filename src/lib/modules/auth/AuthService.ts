import { BaseService } from "@/lib/core/BaseService";
import { AuthRepository } from "./AuthRepository";
import { AuthError } from "@/lib/core/ApiError";
import { JwtService } from "@/lib/core/JwtService";
import { EmailService } from "@/lib/modules/email/EmailService";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import type { User } from "@prisma/client";

export class AuthService extends BaseService<AuthRepository> {
  constructor(
    repo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly emailService?: EmailService
  ) {
    super(repo);
  }

  private async issueTokens(user: User, rememberMe: boolean) {
    const accessToken = this.jwtService.sign({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = randomUUID();
    const refreshLifetimeDays = rememberMe ? 7 : 1;
    const expiresAt = new Date(
      Date.now() + refreshLifetimeDays * 24 * 60 * 60 * 1000
    );

    await this.repo.createRefreshToken(user.id, refreshToken, expiresAt);

    const { passwordHash: _ph, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken,
      refreshToken,
      refreshExpiresAt: expiresAt,
    };
  }

  async register(input: {
    email: string;
    password: string;
    name?: string;
    rememberMe?: boolean;
  }) {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) {
      throw new AuthError("User already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.repo.createUser({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    const rememberMe = !!input.rememberMe;
    const {
      user: safeUser,
      accessToken,
      refreshToken,
      refreshExpiresAt,
    } = await this.issueTokens(user, rememberMe);

    if (this.emailService) {
      void this.emailService.sendWelcomeEmail(user);
    }

    return { user: safeUser, accessToken, refreshToken, refreshExpiresAt };
  }

  async login(input: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) {
    const user = await this.repo.findByEmail(input.email);
    if (!user) {
      throw new AuthError("Invalid credentials");
    }

    const match = await bcrypt.compare(input.password, user.passwordHash);
    if (!match) {
      throw new AuthError("Invalid credentials");
    }

    const rememberMe = !!input.rememberMe;
    const {
      user: safeUser,
      accessToken,
      refreshToken,
      refreshExpiresAt,
    } = await this.issueTokens(user, rememberMe);

    return { user: safeUser, accessToken, refreshToken, refreshExpiresAt };
  }

  async getUserById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new AuthError("User not found");
    }
    const { passwordHash: _ph, ...safeUser } = user;
    return safeUser;
  }

  async startPasswordReset(email: string, baseUrl: string) {
    const user = await this.repo.findByEmail(email);
    if (!user) {
      return;
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
    });

    const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(
      token
    )}`;

    if (this.emailService) {
      void this.emailService.sendPasswordResetEmail(user, resetLink);
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = this.jwtService.verify(token);

    const user = await this.repo.findById(payload.userId);
    if (!user) {
      throw new AuthError("User not found");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.repo.updatePassword(user.id, passwordHash);

    await this.repo.revokeAllRefreshTokensForUser(user.id);
  }

  async refreshTokens(refreshToken: string) {
    const record = await this.repo.findRefreshTokenWithUser(refreshToken);
    if (!record || record.revoked || record.expiresAt < new Date()) {
      throw new AuthError("Invalid or expired refresh token");
    }

    await this.repo.revokeRefreshToken(refreshToken);

    return this.issueTokens(record.user, true);
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.repo.revokeRefreshToken(refreshToken);
    } else {
      await this.repo.revokeAllRefreshTokensForUser(userId);
    }
  }
}
