interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum number of requests per window
}

interface RateLimitInfo {
  count: number
  resetTime: number
}

class RateLimiter {
  private store: Map<string, RateLimitInfo> = new Map()

  constructor(private options: RateLimitOptions) {}

  private getKey(identifier: string): string {
    return `ratelimit:${identifier}`
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, info] of this.store.entries()) {
      if (now > info.resetTime) {
        this.store.delete(key)
      }
    }
  }

  async check(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    this.cleanup()
    
    const key = this.getKey(identifier)
    const now = Date.now()
    const info = this.store.get(key)

    if (!info || now > info.resetTime) {
      // First request or window expired
      this.store.set(key, {
        count: 1,
        resetTime: now + this.options.windowMs
      })
      return {
        allowed: true,
        remaining: this.options.maxRequests - 1,
        resetTime: now + this.options.windowMs
      }
    }

    if (info.count >= this.options.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: info.resetTime
      }
    }

    // Increment counter
    info.count++
    return {
      allowed: true,
      remaining: this.options.maxRequests - info.count,
      resetTime: info.resetTime
    }
  }

  reset(identifier: string): void {
    this.store.delete(this.getKey(identifier))
  }
}

// Create rate limiters for different purposes
export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60 // 60 requests per minute
})

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 attempts per 15 minutes
})

export const teamActionRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10 // 10 actions per minute
})

export const matchUpdateRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 3 // 3 updates per 5 minutes
})

// Helper function to check rate limit and throw error if exceeded
export async function checkRateLimit(
  limiter: RateLimiter,
  identifier: string,
  errorMessage: string = 'Rate limit exceeded'
): Promise<void> {
  const { allowed, remaining, resetTime } = await limiter.check(identifier)
  
  if (!allowed) {
    const waitTime = Math.ceil((resetTime - Date.now()) / 1000)
    throw new Error(`${errorMessage}. Please try again in ${waitTime} seconds.`)
  }
} 
