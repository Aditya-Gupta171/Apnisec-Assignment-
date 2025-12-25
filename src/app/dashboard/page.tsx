"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface Issue {
  id: string;
  type: "CLOUD_SECURITY" | "RETEAM_ASSESSMENT" | "VAPT";
  title: string;
  description: string;
  priority?: "LOW" | "HIGH";
  status?: "OPEN" | "CLOSED";
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<
    "CLOUD_SECURITY" | "RETEAM_ASSESSMENT" | "VAPT"
  >("CLOUD_SECURITY");
  const [priority, setPriority] = useState<"LOW" | "HIGH">("LOW");

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);

  async function loadIssues() {
    setFetching(true);
    setError(null);

    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("type", typeFilter);
    if (priorityFilter) params.set("priority", priorityFilter);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/issues?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error?.message || "Failed to load issues");
        return;
      }

      setIssues(data.data.issues ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to load issues");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (!loading && user) {
      loadIssues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  async function handleCreateIssue(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description, type, priority }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error?.message || "Failed to create issue");
        return;
      }

      setTitle("");
      setDescription("");
      setType("CLOUD_SECURITY");
      setPriority("LOW");
      loadIssues();
    } catch (err) {
      console.error(err);
      setError("Failed to create issue");
    }
  }

  async function handleUpdateIssue(
    id: string,
    updates: { status?: Issue["status"]; priority?: Issue["priority"] }
  ) {
    try {
      const payload: {
        status?: Issue["status"];
        priority?: Issue["priority"];
      } = {};
      if (updates.status) payload.status = updates.status;
      if (updates.priority) payload.priority = updates.priority;
      if (Object.keys(payload).length === 0) return;

      const res = await fetch(`/api/issues/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error?.message || "Failed to update issue");
        return;
      }

      await loadIssues();

      if (selectedIssue && selectedIssue.id === id) {
        setSelectedIssue({ ...selectedIssue, ...payload });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update issue");
    }
  }

  async function handleDeleteIssue(id: string) {
    if (!window.confirm("Are you sure you want to delete this issue?")) {
      return;
    }

    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error?.message || "Failed to delete issue");
        return;
      }

      await loadIssues();

      if (selectedIssue && selectedIssue.id === id) {
        setSelectedIssue(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete issue");
    }
  }

  async function handleViewIssue(id: string) {
    setSelectedLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/issues/${id}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error?.message || "Failed to load issue");
        return;
      }

      setSelectedIssue(data.data.issue);
    } catch (err) {
      console.error(err);
      setError("Failed to load issue");
    } finally {
      setSelectedLoading(false);
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40">
              AS
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">
                ApniSec Dashboard
              </p>
              <p className="text-xs text-slate-400">
                Signed in as {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <Link href="/profile" className="hover:text-emerald-300">
              Profile
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

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-sm font-semibold tracking-tight">
              Create new issue
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Capture Cloud Security, Red Team or VAPT findings for your
              engagement.
            </p>

            {error && (
              <p className="mt-3 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </p>
            )}

            <form
              onSubmit={handleCreateIssue}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] font-medium text-slate-300">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[11px] font-medium text-slate-300">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
                  >
                    <option value="CLOUD_SECURITY">Cloud Security</option>
                    <option value="RETEAM_ASSESSMENT">
                      Red Team Assessment
                    </option>
                    <option value="VAPT">VAPT</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[11px] font-medium text-slate-300">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
                  >
                    <option value="LOW">Low</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="mt-1 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-emerald-400"
              >
                Create issue
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold tracking-tight">
                  Your issues
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Filter by status, type, priority or search across titles.
                </p>
              </div>
              <button
                onClick={loadIssues}
                disabled={fetching}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 hover:border-emerald-500 hover:text-emerald-300 disabled:opacity-60"
              >
                {fetching ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="mt-4 grid gap-3 text-[11px] sm:grid-cols-4">
              <input
                placeholder="Search title / description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:col-span-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
              >
                <option value="">All status</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
              >
                <option value="">All types</option>
                <option value="CLOUD_SECURITY">Cloud Security</option>
                <option value="RETEAM_ASSESSMENT">Red Team Assessment</option>
                <option value="VAPT">VAPT</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
              >
                <option value="">All priorities</option>
                <option value="LOW">Low</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="mt-3 flex justify-end text-[11px]">
              <button
                onClick={loadIssues}
                className="text-emerald-300 hover:text-emerald-200"
              >
                Apply filters
              </button>
            </div>

            {selectedLoading && (
              <p className="mt-3 text-[11px] text-slate-400">
                Loading selected issue…
              </p>
            )}
            {selectedIssue && !selectedLoading && (
              <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-50">Selected issue</p>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="text-xs text-slate-400 hover:text-emerald-300"
                  >
                    Clear
                  </button>
                </div>
                <p className="mt-1 text-slate-300">{selectedIssue.title}</p>
                <p className="mt-1 text-slate-400">
                  {selectedIssue.description}
                </p>
              </div>
            )}

            <div className="mt-4 space-y-3 text-xs">
              {issues.length === 0 && !fetching ? (
                <p className="text-slate-400">
                  No issues found for the selected filters.
                </p>
              ) : (
                issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-50">
                        {issue.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-slate-300">
                          {issue.type.replace("_", " ")}
                        </span>
                        {issue.priority && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                            {issue.priority}
                          </span>
                        )}
                        {issue.status && (
                          <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-sky-300">
                            {issue.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-300 line-clamp-3">
                      {issue.description}
                    </p>
                    <p className="mt-2 text-[10px] text-slate-500">
                      Opened {new Date(issue.createdAt).toLocaleString()}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-slate-300">
                      <div className="flex items-center gap-1">
                        <span>Status:</span>
                        <select
                          defaultValue={issue.status ?? "OPEN"}
                          onChange={(e) =>
                            handleUpdateIssue(issue.id, {
                              status: e.target.value as Issue["status"],
                            })
                          }
                          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
                        >
                          <option value="OPEN">Open</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Priority:</span>
                        <select
                          defaultValue={issue.priority ?? "LOW"}
                          onChange={(e) =>
                            handleUpdateIssue(issue.id, {
                              priority: e.target.value as Issue["priority"],
                            })
                          }
                          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-1"
                        >
                          <option value="LOW">Low</option>
                          <option value="HIGH">High</option>
                        </select>
                      </div>
                      <button
                        onClick={() => handleViewIssue(issue.id)}
                        className="text-emerald-300 hover:text-emerald-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteIssue(issue.id)}
                        className="text-red-300 hover:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
