import { NextRequest } from 'next/server'

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore: RateLimitStore = {}

/**
 * Rate limiter for API endpoints
 */
export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 requests per minute
  }) {
    this.config = config
  }

  /**
   * Check if request should be rate limited
   */
  check(request: NextRequest): { success: boolean; limit: number; remaining: number; reset: number } {
    const identifier = this.getIdentifier(request)
    const now = Date.now()
    
    // Clean up expired entries
    this.cleanup(now)
    
    // Get or create rate limit entry
    if (!rateLimitStore[identifier] || rateLimitStore[identifier].resetTime < now) {
      rateLimitStore[identifier] = {
        count: 0,
        resetTime: now + this.config.interval,
      }
    }
    
    const entry = rateLimitStore[identifier]
    entry.count++
    
    const remaining = Math.max(0, this.config.uniqueTokenPerInterval - entry.count)
    const success = entry.count <= this.config.uniqueTokenPerInterval
    
    return {
      success,
      limit: this.config.uniqueTokenPerInterval,
      remaining,
      reset: entry.resetTime,
    }
  }
  
  /**
   * Get unique identifier for request
   */
  private getIdentifier(request: NextRequest): string {
    // Try to get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'anonymous'
    
    // Combine IP with user agent for better uniqueness
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const hash = this.simpleHash(`${ip}-${userAgent}`)
    
    return hash
  }
  
  /**
   * Simple hash function for creating unique identifiers
   */
  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(now: number): void {
    for (const key in rateLimitStore) {
      if (rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key]
      }
    }
  }
}

// Export singleton instances for different rate limit tiers
export const strictRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 5, // 5 requests per minute
})

export const normalRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 30, // 30 requests per minute
})

export const relaxedRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100, // 100 requests per minute
})


