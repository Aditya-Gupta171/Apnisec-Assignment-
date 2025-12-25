"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error?.message || "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h1 className="text-xl font-semibold tracking-tight">
          Sign in to ApniSec
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Use the credentials you registered with to access your security
          dashboard.
        </p>

        {error && (
          <p className="mt-3 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
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
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-emerald-500"
              />
              <span>Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-emerald-300 hover:text-emerald-200"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-emerald-300 hover:text-emerald-200"
          >
            Create one
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
