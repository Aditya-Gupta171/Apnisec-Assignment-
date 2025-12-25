import { BaseRepository } from "@/lib/core/BaseRepository";
import type { User, RefreshToken } from "@prisma/client";

export class AuthRepository extends BaseRepository {
  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  createUser(data: {
    email: string;
    passwordHash: string;
    name?: string;
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  updatePassword(id: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  findRefreshTokenWithUser(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  revokeRefreshToken(token: string) {
    return this.prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  }

  revokeAllRefreshTokensForUser(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }
}
