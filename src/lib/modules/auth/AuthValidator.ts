import { z } from "zod";
import { ValidationError } from "@/lib/core/ApiError";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
  rememberMe: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export class AuthValidator {
  validateRegister(body: unknown): RegisterInput {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid registration data", {
        issues: parsed.error.issues,
      });
    }
    return parsed.data;
  }

  validateLogin(body: unknown): LoginInput {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid login data", {
        issues: parsed.error.issues,
      });
    }
    return parsed.data;
  }
}
