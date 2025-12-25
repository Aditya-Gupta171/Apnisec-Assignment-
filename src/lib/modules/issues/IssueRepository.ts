import { BaseRepository } from "@/lib/core/BaseRepository";
import type { Issue, Prisma } from "@prisma/client";

export interface IssueFilters {
  status?: string;
  priority?: string;
  type?: string;
  search?: string;
}

export class IssueRepository extends BaseRepository {
  listIssues(userId: string, filters: IssueFilters): Promise<Issue[]> {
    const where: Prisma.IssueWhereInput = { userId };

    if (filters.status) where.status = filters.status as any;
    if (filters.priority) where.priority = filters.priority as any;
    if (filters.type) where.type = filters.type as any;

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return this.prisma.issue.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  getByIdForUser(id: string, userId: string): Promise<Issue | null> {
    return this.prisma.issue.findFirst({
      where: { id, userId },
    });
  }

  createIssue(
    data: Omit<Issue, "id" | "createdAt" | "updatedAt">
  ): Promise<Issue> {
    return this.prisma.issue.create({ data });
  }

  updateIssue(
    id: string,
    userId: string,
    data: Partial<Issue>
  ): Promise<Issue> {
    return this.prisma.issue.update({
      where: { id },
      data,
    });
  }

  deleteIssue(id: string, userId: string): Promise<Issue> {
    return this.prisma.issue.delete({
      where: { id },
    });
  }
}
