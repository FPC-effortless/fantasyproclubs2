"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loading } from "@/components/loading"
import { AdminNav } from "@/components/admin/admin-nav"
import { SupabaseClient } from '@supabase/supabase-js'
import { toast } from "@/components/ui/use-toast"

interface AdminLayoutClientProps {
  children: React.ReactNode
  supabase: SupabaseClient
}

export function AdminLayoutClient({ children, supabase }: AdminLayoutClientProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        if (loading) return

        if (!user) {
          toast({
            title: "Access Denied",
            description: "Please log in to access the admin dashboard.",
            variant: "destructive",
          })
          router.push('/login')
          return
        }

        // Check if user has admin role in user_profiles
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        if (!profile || profile.user_type !== 'admin') {
          console.log('❌ [AdminLayout] Access denied: user_type=' + profile?.user_type)
          toast({
            title: "Access Denied",
            description: "You do not have permission to access the admin dashboard.",
            variant: "destructive",
          })
          router.push('/')
          return
        }

        console.log('✅ [AdminLayout] Admin access granted')
        setIsAdmin(true)
      } catch (error) {
        console.error('Error checking admin access:', error)
        toast({
          title: "Error",
          description: "There was a problem verifying your admin access. Please try logging in again.",
          variant: "destructive",
        })
        router.push('/login')
      }
    }

    checkAdminAccess()
  }, [user, loading, router, supabase])

  if (loading || isAdmin === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background max-w-full overflow-x-hidden admin-layout">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-full">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Admin Dashboard</h1>
            <AdminNav />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-full overflow-x-hidden">
        <div className="max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  )
} 