"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface ProfileData {
  fullName?: string | null;
  company?: string | null;
  role?: string | null;
  phone?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();

  const [profile, setProfile] = useState<ProfileData>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      setError(null);
      try {
        const res = await fetch("/api/users/profile", {
          credentials: "include",
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
          setError(data?.error?.message || "Failed to load profile");
          return;
        }

        const apiProfile = data.data.profile ?? {};
        const apiUser = data.data.user;

        setProfile({
          fullName: apiProfile.fullName ?? apiUser?.name ?? "",
          company: apiProfile.company ?? "",
          role: apiProfile.role ?? "",
          phone: apiProfile.phone ?? "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      }
    }

    if (!loading && user) {
      loadProfile();
    }
  }, [loading, user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profile),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error?.message || "Failed to update profile");
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.push("/login");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <p className="text-sm text-slate-400">Checking your session...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40">
              AS
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">
                ApniSec Profile
              </p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <Link href="/dashboard" className="hover:text-emerald-300">
              Back to dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium hover:border-emerald-500 hover:text-emerald-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-12 pt-8 sm:px-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h1 className="text-sm font-semibold tracking-tight">
            Profile &amp; organisation details
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            This information helps ApniSec contextualise Cloud Security, Red
            Team and VAPT issues for your team.
          </p>

          {error && (
            <p className="mt-3 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </p>
          )}
          {success && !error && (
            <p className="mt-3 rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
              Profile updated successfully.
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-5 grid gap-4 text-xs sm:grid-cols-2"
          >
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-medium text-slate-300">
                Full name
              </label>
              <input
                type="text"
                value={profile.fullName ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, fullName: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-medium text-slate-300">
                Company
              </label>
              <input
                type="text"
                value={profile.company ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, company: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-medium text-slate-300">
                Role
              </label>
              <input
                type="text"
                value={profile.role ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, role: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
                placeholder="e.g. Security Engineer, DevOps"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-medium text-slate-300">
                Phone
              </label>
              <input
                type="tel"
                value={profile.phone ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, phone: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
              />
            </div>

            <div className="sm:col-span-2 mt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
