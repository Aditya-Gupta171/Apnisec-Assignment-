"use client";

import { FormEvent, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
    }
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing reset token.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error?.message || "Failed to reset password");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h1 className="text-xl font-semibold tracking-tight">
          Choose a new password
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter a new password for your ApniSec account.
        </p>

        {error && (
          <p className="mt-3 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
        {success && !error && (
          <p className="mt-3 rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            Password updated. Redirecting to login...
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              New password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Confirm password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          Go back to{" "}
          <Link
            href="/login"
            className="text-emerald-300 hover:text-emerald-200"
          >
            login
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
