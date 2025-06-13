interface CacheOptions {
  ttl: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items in cache
}

interface CacheEntry<T> {
  value: T
  expires: number
}

class Cache<T> {
  private store: Map<string, CacheEntry<T>> = new Map()
  private readonly ttl: number
  private readonly maxSize?: number

  constructor(options: CacheOptions) {
    this.ttl = options.ttl
    this.maxSize = options.maxSize
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expires) {
        this.store.delete(key)
      }
    }
  }

  private enforceMaxSize(): void {
    if (this.maxSize && this.store.size > this.maxSize) {
      // Remove oldest entries
      const entries = Array.from(this.store.entries())
      entries.sort((a, b) => a[1].expires - b[1].expires)
      const toRemove = entries.slice(0, entries.length - this.maxSize)
      toRemove.forEach(([key]) => this.store.delete(key))
    }
  }

  set(key: string, value: T): void {
    this.cleanup()
    this.store.set(key, {
      value,
      expires: Date.now() + this.ttl
    })
    this.enforceMaxSize()
  }

  get(key: string): T | null {
    this.cleanup()
    const entry = this.store.get(key)
    if (!entry || Date.now() > entry.expires) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  has(key: string): boolean {
    this.cleanup()
    const entry = this.store.get(key)
    if (!entry || Date.now() > entry.expires) {
      this.store.delete(key)
      return false
    }
    return true
  }
}

// Create caches for different types of data
export const userCache = new Cache<any>({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000
})

export const teamCache = new Cache<any>({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 500
})

export const matchCache = new Cache<any>({
  ttl: 2 * 60 * 1000, // 2 minutes
  maxSize: 200
})

export const competitionCache = new Cache<any>({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 100
})

// Helper function to get or set cache value
export async function getOrSetCache<T>(
  cache: Cache<T>,
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key)
  if (cached !== null) {
    return cached
  }

  const value = await fetchFn()
  cache.set(key, value)
  return value
}

// Helper function to generate cache keys
export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key]
      return acc
    }, {} as Record<string, unknown>)
  
  return `${prefix}:${JSON.stringify(sortedParams)}`
} 
