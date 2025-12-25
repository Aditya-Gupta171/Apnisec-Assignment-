import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

class PrismaService {
  private static instance: PrismaClient;

  static get client(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({ adapter });
    }
    return PrismaService.instance;
  }
}

export const prisma = PrismaService.client;
