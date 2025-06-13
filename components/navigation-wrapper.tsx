'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs'

const AUTH_ROUTES = ['/login', '/auth/signup', '/auth/reset-password']

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const breadcrumbs = useBreadcrumbs()
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  if (isAuthRoute) {
    return children
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1">
        <div className="container py-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        {children}
      </main>
    </div>
  )
} 
