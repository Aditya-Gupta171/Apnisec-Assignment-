import { Resend } from "resend";
import type { Issue, User } from "@prisma/client";

export class EmailService {
  private readonly resend: Resend;

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      this.resend = new Resend("");
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  private canSend() {
    return !!process.env.RESEND_API_KEY;
  }

  async sendWelcomeEmail(user: Pick<User, "email" | "name">) {
    if (!this.canSend()) return;

    const name = user.name || "there";

    try {
      await this.resend.emails.send({
        from: "ApniSec <onboarding@resend.dev>",
        to: user.email,
        subject: "Welcome to ApniSec",
        html: `
          <div style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding:24px; background:#020617; color:#e5e7eb;">
            <h1 style="color:#22c55e; font-size:24px; margin-bottom:12px;">Welcome to ApniSec, ${name} 👋</h1>
            <p style="margin-bottom:16px;">Thank you for signing up to the ApniSec security portal.</p>
            <p style="margin-bottom:16px;">You can now log in, create issues for Cloud Security, Red Team Assessments and VAPT, and track them from your dashboard.</p>
            <p style="margin-bottom:4px;">Best regards,</p>
            <p style="margin:0; font-weight:600;">ApniSec Team</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Failed to send welcome email", error);
    }
  }

  async sendIssueCreatedEmail(
    user: Pick<User, "email" | "name">,
    issue: Issue
  ) {
    if (!this.canSend()) return;

    const name = user.name || "there";

    try {
      await this.resend.emails.send({
        from: "ApniSec <onboarding@resend.dev>",
        to: user.email,
        subject: `New ${issue.type} issue created: ${issue.title}`,
        html: `
          <div style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding:24px; background:#020617; color:#e5e7eb;">
            <p style="margin-bottom:12px;">Hi ${name},</p>
            <p style="margin-bottom:12px;">A new issue has been created in your ApniSec workspace:</p>
            <div style="border-radius:8px; border:1px solid #1f2937; padding:16px; margin-bottom:16px; background:#020617;">
              <p style="margin:0 0 8px 0;"><strong>Type:</strong> ${issue.type}</p>
              <p style="margin:0 0 8px 0;"><strong>Title:</strong> ${issue.title}</p>
              <p style="margin:0 0 8px 0;"><strong>Priority:</strong> ${issue.priority}</p>
              <p style="margin:0 0 8px 0;"><strong>Status:</strong> ${issue.status}</p>
              <p style="margin:8px 0 0 0;"><strong>Description:</strong></p>
              <p style="margin:4px 0 0 0; white-space:pre-line;">${issue.description}</p>
            </div>
            <p style="margin-bottom:4px;">You can update this issue from your ApniSec dashboard.</p>
            <p style="margin:0;">Stay secure,</p>
            <p style="margin:0; font-weight:600;">ApniSec Team</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Failed to send issue created email", error);
    }
  }

  async sendPasswordResetEmail(
    user: Pick<User, "email" | "name">,
    resetLink: string
  ) {
    if (!this.canSend()) return;

    const name = user.name || "there";

    try {
      await this.resend.emails.send({
        from: "ApniSec <onboarding@resend.dev>",
        to: user.email,
        subject: "Reset your ApniSec password",
        html: `
          <div style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding:24px; background:#020617; color:#e5e7eb;">
            <p style="margin-bottom:12px;">Hi ${name},</p>
            <p style="margin-bottom:12px;">We received a request to reset your ApniSec password.</p>
            <p style="margin-bottom:16px;">If you made this request, click the button below to choose a new password. This link will expire in 1 hour.</p>
            <p style="margin-bottom:24px;">
              <a href="${resetLink}" style="display:inline-block; padding:10px 18px; border-radius:999px; background:#22c55e; color:#020617; font-weight:600; text-decoration:none;">Reset password</a>
            </p>
            <p style="margin-bottom:12px;">If you didn\'t request this, you can safely ignore this email.</p>
            <p style="margin-bottom:4px;">Stay secure,</p>
            <p style="margin:0; font-weight:600;">ApniSec Team</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Failed to send password reset email", error);
    }
  }
}
