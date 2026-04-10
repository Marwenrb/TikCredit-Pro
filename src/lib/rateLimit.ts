import { NextRequest } from 'next/server'

// ── Sliding Window Rate Limiter ──────────────────────────────────────────────
// Uses per-key timestamp arrays to count requests within the last N ms.
// More accurate than fixed-window: no burst allowed at window boundary.

const STORE_MAX_KEYS = 500
const store = new Map<string, number[]>()

/**
 * Sliding window check — returns true if request is allowed.
 * @param identifier - Per-client key (e.g. hashed IP)
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const cutoff = now - windowMs

  // Evict oldest key when store is full (simple LRU-like pruning)
  if (store.size >= STORE_MAX_KEYS && !store.has(identifier)) {
    const firstKey = store.keys().next().value
    if (firstKey !== undefined) store.delete(firstKey)
  }

  const timestamps = store.get(identifier) ?? []

  // Slide the window: drop timestamps older than cutoff
  const recent = timestamps.filter(t => t > cutoff)

  if (recent.length >= limit) {
    store.set(identifier, recent)
    return false // rate-limited
  }

  recent.push(now)
  store.set(identifier, recent)
  return true // allowed
}

// ── Request Identifier ────────────────────────────────────────────────────────
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

export function getRequestIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0].trim() || realIp || 'anonymous'
  return simpleHash(ip)
}

// ── Legacy Class API (kept for backwards compatibility) ───────────────────────

interface RateLimitConfig {
  interval: number
  uniqueTokenPerInterval: number
}

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig = {
    interval: 60 * 1000,
    uniqueTokenPerInterval: 10,
  }) {
    this.config = config
  }

  check(request: NextRequest): { success: boolean; limit: number; remaining: number; reset: number } {
    const identifier = getRequestIdentifier(request)
    const allowed = rateLimit(identifier, this.config.uniqueTokenPerInterval, this.config.interval)
    const timestamps = store.get(identifier) ?? []
    const remaining = Math.max(0, this.config.uniqueTokenPerInterval - timestamps.length)

    return {
      success: allowed,
      limit: this.config.uniqueTokenPerInterval,
      remaining,
      reset: Date.now() + this.config.interval,
    }
  }
}

// Singleton instances for different tiers
export const strictRateLimiter = new RateLimiter({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 5,
})

export const normalRateLimiter = new RateLimiter({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 30,
})

export const relaxedRateLimiter = new RateLimiter({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 100,
})
