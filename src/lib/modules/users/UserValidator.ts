import { z } from "zod";
import { ValidationError } from "@/lib/core/ApiError";

const profileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  company: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export class UserValidator {
  validateProfile(body: unknown): ProfileInput {
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid profile data", {
        issues: parsed.error.issues,
      });
    }
    return parsed.data;
  }
}
