"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CurrentUser {
  id: string;
  email: string;
  name?: string | null;
}

interface UseRequireAuthResult {
  user: CurrentUser | null;
  loading: boolean;
}

export function useRequireAuth(): UseRequireAuthResult {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.status === 401) {
          if (!cancelled) {
            router.replace("/login");
          }
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch current user");
        }

        const data = await res.json();
        if (!cancelled) {
          setUser(data.data?.user ?? null);
        }
      } catch {
        if (!cancelled) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return { user, loading };
}
