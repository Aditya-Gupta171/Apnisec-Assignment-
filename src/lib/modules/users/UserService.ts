import { BaseService } from "@/lib/core/BaseService";
import { UserRepository } from "./UserRepository";

export class UserService extends BaseService<UserRepository> {
  async getProfile(userId: string) {
    const user = await this.repo.getUserWithProfile(userId);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return {
      user: safeUser,
      profile: user.profile,
    };
  }

  async updateProfile(userId: string, input: any) {
    const profile = await this.repo.upsertProfile(userId, input);
    return profile;
  }
}
