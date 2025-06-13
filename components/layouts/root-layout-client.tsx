"use client"

import { usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import { BottomNavigation } from "@/components/bottom-navigation"

interface RootLayoutClientProps {
  children: React.ReactNode
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")
  const isAuthRoute = pathname?.startsWith("/auth")
  const shouldShowNav = !isAdminRoute && !isAuthRoute

  return (
    <>
      <main className={shouldShowNav ? "pb-16" : ""}>
        {children}
      </main>
      {shouldShowNav && <BottomNavigation />}
      <Toaster />
    </>
  )
} 
