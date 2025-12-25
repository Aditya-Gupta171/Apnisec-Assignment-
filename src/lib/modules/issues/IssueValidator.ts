import { z } from "zod";
import { ValidationError } from "@/lib/core/ApiError";

const createIssueSchema = z.object({
  type: z.enum(["CLOUD_SECURITY", "RETEAM_ASSESSMENT", "VAPT"]),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

const updateIssueSchema = createIssueSchema
  .partial()
  .extend({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;

export class IssueValidator {
  validateCreate(body: unknown): CreateIssueInput {
    const parsed = createIssueSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid issue data", {
        issues: parsed.error.issues,
      });
    }
    return parsed.data;
  }

  validateUpdate(body: unknown): UpdateIssueInput {
    const parsed = updateIssueSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid issue update data", {
        issues: parsed.error.issues,
      });
    }
    return parsed.data;
  }
}
