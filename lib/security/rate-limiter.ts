import { RateLimitError } from '@/lib/error-handler'

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  identifier: string; // Unique identifier (IP, user ID, etc.)
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
}

class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  private config: Omit<RateLimitConfig, 'identifier'>;

  constructor(config: Omit<RateLimitConfig, 'identifier'>) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.config.windowMs}:${this.config.maxRequests}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    let entry = this.store.get(key);

    // Reset if window has expired
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs
      };
    }

    const allowed = entry.count < this.config.maxRequests;
    
    if (allowed) {
      entry.count++;
      this.store.set(key, entry);
    }

    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      limit: this.config.maxRequests
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }
}

// Predefined rate limiters for different operations
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 auth attempts per 15 minutes
});

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 API calls per minute
});

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10 // 10 uploads per minute
});

export const emailRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3 // 3 emails per hour
});

// Helper function to check rate limit and throw error if exceeded
export async function checkRateLimit(
  limiter: RateLimiter,
  identifier: string,
  errorMessage: string = 'Rate limit exceeded'
): Promise<void> {
  const result = await limiter.check(identifier);
  
  if (!result.allowed) {
    const waitTimeSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);
    throw new RateLimitError(waitTimeSeconds);
  }
}

// Middleware for Next.js API routes
export function withRateLimit(limiter: RateLimiter) {
  return function rateLimitMiddleware(handler: Function) {
    return async function(req: Request, res: Response) {
      try {
        // Get identifier (IP address or user ID)
        const identifier = getIdentifier(req);
        await checkRateLimit(limiter, identifier);
        
        return handler(req, res);
      } catch (error) {
        if (error instanceof RateLimitError) {
          return Response.json(
            { 
              error: 'Rate limit exceeded',
              retryAfter: error.context?.retryAfter 
            },
            { status: 429 }
          );
        }
        throw error;
      }
    };
  };
}

// Get identifier for rate limiting (IP or user ID)
function getIdentifier(req: Request): string {
  // Try to get user ID from auth header first
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    // Extract user ID from JWT if available
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.sub) {
        return `user:${payload.sub}`;
      }
    } catch {
      // Fall back to IP if JWT parsing fails
    }
  }

  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

// Rate limiting decorator for service methods
export function rateLimit(limiter: RateLimiter) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const identifier = this.getUserIdentifier ? this.getUserIdentifier() : 'unknown';
      await checkRateLimit(limiter, identifier);
      return method.apply(this, args);
    };
  };
}

export { RateLimiter }; 