'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const supabase = createClient()

  // Add authentication check
  supabase.auth.onAuthStateChange((event, session) => {
    if (!session) {
      router.push('/login')
    }
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      {children}
    </div>
  )
} 
