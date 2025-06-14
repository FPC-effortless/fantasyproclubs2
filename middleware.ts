import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// Rate limiting configuration
const rateLimitConfig = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
}

// Store rate limits in memory (consider using Redis in production)
const rateLimits = new Map<string, { count: number; resetTime: number; remaining: number; allowed: boolean }>()

// Cleanup expired rate limits
function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, value] of rateLimits.entries()) {
    if (value.resetTime < now) {
      rateLimits.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000)

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

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const ip = getClientIP(request)
  const path = request.nextUrl.pathname

  // Apply rate limiting only to API routes
  if (path.startsWith('/api')) {
    const now = Date.now()
    const rateLimit = rateLimits.get(ip) || { 
      count: 0, 
      resetTime: now + rateLimitConfig.windowMs,
      remaining: rateLimitConfig.maxRequests,
      allowed: true
    }

    // Reset if window has passed
    if (now > rateLimit.resetTime) {
      rateLimit.count = 0
      rateLimit.resetTime = now + rateLimitConfig.windowMs
      rateLimit.remaining = rateLimitConfig.maxRequests
      rateLimit.allowed = true
    }

    // Increment count
    rateLimit.count++
    rateLimit.remaining = rateLimitConfig.maxRequests - rateLimit.count
    rateLimit.allowed = rateLimit.count <= rateLimitConfig.maxRequests
    rateLimits.set(ip, rateLimit)

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())

    if (!rateLimit.allowed) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Skip middleware for API routes, static files, and most routes until Supabase is configured
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.') ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url_here'
  ) {
    return response
  }

  // Public routes that don't need authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/reset-password',
    '/verify',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/api',
  ]

  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(route + '/') ||
    (route !== '/' && request.nextUrl.pathname.startsWith(route))
  )

  // Skip middleware for public routes
  if (isPublicRoute) {
    return response
  }

  // Auth routes that should redirect to profile if already logged in
  const authRoutes = ['/login', '/signup', '/reset-password']
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/profile'
    return NextResponse.redirect(redirectUrl)
  }

  return response
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
