"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useSupabase } from "@/components/providers/supabase-provider"
import { AdminLayout } from "./admin-layout"
import { UserLayout } from "./user-layout"

interface RootLayoutProps {
  children: React.ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  const { supabase, session } = useSupabase()
  const [userType, setUserType] = useState<"admin" | "manager" | "player" | "fan" | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const getUserType = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single()

        if (!error && data) {
          setUserType(data.user_type)
        }
      }
    }

    getUserType()
  }, [session, supabase])

  // Public routes don't need a special layout
  const publicRoutes = ['/', '/login', '/register', '/onboarding']
  if (publicRoutes.includes(pathname)) {
    return children
  }

  // Loading state
  if (session && !userType) {
    return <div>Loading...</div>
  }

  // Admin layout
  if (userType === "admin") {
    return <AdminLayout>{children}</AdminLayout>
  }

  // User layouts (manager, player, fan)
  if (userType && ["manager", "player", "fan"].includes(userType)) {
    return (
      <UserLayout userType={userType as "manager" | "player" | "fan"}>
        {children}
      </UserLayout>
    )
  }

  // Default case
  return children
} 
