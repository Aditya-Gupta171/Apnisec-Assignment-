"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error?.message || "Failed to send reset email");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h1 className="text-xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter the email associated with your ApniSec account and we will send
          you a link to reset your password.
        </p>

        {error && (
          <p className="mt-3 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
        {submitted && !error && (
          <p className="mt-3 rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            If an account exists for that email, a reset link has been sent.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Sending link..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="text-emerald-300 hover:text-emerald-200"
          >
            Back to login
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
