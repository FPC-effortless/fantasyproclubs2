"use client"

import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/providers/supabase-provider"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()
  const { supabase } = useSupabase()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <Button 
      onClick={handleLogout}
      variant="destructive"
      className="w-full"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
} 
