import { BaseRepository } from "@/lib/core/BaseRepository";
import type { Profile, User } from "@prisma/client";

export class UserRepository extends BaseRepository {
  getUserWithProfile(
    userId: string
  ): Promise<(User & { profile: Profile | null }) | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }

  upsertProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    return this.prisma.profile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        fullName: data.fullName,
        company: data.company,
        role: data.role,
        phone: data.phone,
      },
    });
  }
}
