import type { PrismaClient } from "@prisma/client";

export abstract class BaseRepository {
  protected readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
}
