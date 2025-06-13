import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// Simple in-memory rate limiting (for production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 20 }, // 20 auth attempts per 15 minutes
  api: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 API calls per minute
  signup: { windowMs: 60 * 60 * 1000, maxRequests: 20 }, // 20 signups per hour
}

function getRateLimitKey(ip: string, path: string): string {
  if (path.startsWith('/api/auth/')) return `auth:${ip}`
  if (path.startsWith('/api/')) return `api:${ip}`
  return `general:${ip}`
}

function checkRateLimit(key: string, config: { windowMs: number; maxRequests: number }): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // Reset if window expired
  if (!entry || entry.resetTime <= now) {
    const newEntry = {
      count: 1,
      resetTime: now + config.windowMs
    }
    rateLimitStore.set(key, newEntry)
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime
    }
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }

  // Increment counter
  entry.count++
  rateLimitStore.set(key, entry)

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(key)
    }
  }
}

// Clean up rate limit store every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000)

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const ip = getClientIP(req)
  const path = req.nextUrl.pathname

  // Apply rate limiting only to API routes
  let rateLimitConfig = RATE_LIMITS.api
  if (path.startsWith('/api/auth/')) {
    rateLimitConfig = path.includes('signup') ? RATE_LIMITS.signup : RATE_LIMITS.auth
  }

  // Only apply rate limiting to API routes
  if (path.startsWith('/api/')) {
    const rateLimitKey = getRateLimitKey(ip, path)
    const rateLimit = checkRateLimit(rateLimitKey, rateLimitConfig)

    // Add rate limit headers
    res.headers.set('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString())
    res.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    res.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests, please try again later',
          retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString()
          }
        }
      )
    }
  }

  // Security headers
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Skip middleware for API routes, static files, and most routes until Supabase is configured
  if (
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('.') ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url_here'
  ) {
    return res
  }

  const supabase = createMiddlewareClient<Database>({ req, res })

  // Public routes that don't need authentication
  const publicRoutes = [
    '/', 
    '/login', 
    '/auth/signup', 
    '/auth/reset-password',
    '/competitions',
    '/fantasy',
    '/profile',
    '/api',
    '/teams'
  ]
  
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname === route || 
    req.nextUrl.pathname.startsWith(route + '/')
  )

  // Skip middleware for public routes
  if (isPublicRoute) {
    return res
  }

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth protection for protected routes
  const protectedRoutes = ['/profile', '/dashboard', '/team', '/manager']
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/login', '/auth/signup']
  const isAuthRoute = authRoutes.some(route => path.startsWith(route))

  if (isAuthRoute && session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/profile'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.png, *.jpg, etc (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
} 
