"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { TeamCard } from "@/components/teams/team-card"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface Team {
  id: string
  name: string
  logo_url?: string
  description?: string
  created_at: string
}

export default function TeamsPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setTeams(data || [])
      } catch (error) {
        console.error("Error fetching teams:", error)
        toast({
          title: "Error",
          description: "Failed to load teams",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [session, router, supabase])

  if (!session) {
    return null // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff87]"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Teams</h1>
          <p className="text-gray-400 mt-2">Browse and join teams in your area</p>
        </div>
        <Button
          onClick={() => router.push("/teams/create")}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-4">No teams found</h3>
          <p className="text-gray-400 mb-6">
            Be the first to create a team and start playing!
          </p>
          <Button
            onClick={() => router.push("/teams/create")}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your Team
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  )
} 
