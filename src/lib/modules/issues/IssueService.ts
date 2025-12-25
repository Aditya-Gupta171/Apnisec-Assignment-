import { BaseService } from "@/lib/core/BaseService";
import { IssueRepository, IssueFilters } from "./IssueRepository";
import { NotFoundError } from "@/lib/core/ApiError";
import { EmailService } from "@/lib/modules/email/EmailService";
import { prisma } from "@/lib/db/prisma";

export class IssueService extends BaseService<IssueRepository> {
  constructor(
    repo: IssueRepository,
    private readonly emailService?: EmailService
  ) {
    super(repo);
  }

  list(userId: string, filters: IssueFilters) {
    return this.repo.listIssues(userId, filters);
  }

  async getById(userId: string, id: string) {
    const issue = await this.repo.getByIdForUser(id, userId);
    if (!issue) throw new NotFoundError("Issue not found");
    return issue;
  }

  async create(userId: string, input: any) {
    const issue = await this.repo.createIssue({
      userId,
      type: input.type,
      title: input.title,
      description: input.description,
      priority: input.priority ?? "MEDIUM",
      status: "OPEN",
    } as any);

    if (this.emailService) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (user) {
        void this.emailService.sendIssueCreatedEmail(user, issue as any);
      }
    }

    return issue;
  }

  async update(userId: string, id: string, input: any) {
    await this.getById(userId, id); 
    return this.repo.updateIssue(id, userId, input);
  }

  async remove(userId: string, id: string) {
    await this.getById(userId, id); 
    return this.repo.deleteIssue(id, userId);
  }
}
