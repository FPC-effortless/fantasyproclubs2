"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/providers/supabase-provider"
import { ManagerProfileScreen } from "@/components/manager-profile-screen"

export default function ManagerProfilePage() {
  const router = useRouter()
  const { session, supabase } = useSupabase()

  useEffect(() => {
    const checkAccess = async () => {
      if (!session?.user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Error checking user type:', error)
        router.push('/')
        return
      }

      if (!data || data.user_type !== 'manager') {
        console.log('Access denied: User is not a manager')
        router.push('/')
        return
      }
    }

    checkAccess()
  }, [session, supabase, router])

  if (!session) {
    return null // Or a loading spinner
  }

  return <ManagerProfileScreen />
}
