import { RateLimitError } from "./ApiError";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private readonly store = new Map<string, RateLimitEntry>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number
  ) {}

  check(key: string) {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt <= now) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return { remaining: this.limit - 1, resetAt: now + this.windowMs };
    }

    if (entry.count >= this.limit) {
      throw new RateLimitError();
    }

    entry.count += 1;
    this.store.set(key, entry);

    return { remaining: this.limit - entry.count, resetAt: entry.resetAt };
  }
}
