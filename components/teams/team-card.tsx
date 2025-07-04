"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, Shirt } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface Team {
  id: string
  name: string
  logo_url?: string
  description?: string
  created_at: string
}

interface TeamCardProps {
  team: Team
}

export function TeamCard({ team }: TeamCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isJoining, setIsJoining] = useState(false)
  const supabase = getSupabaseClient()

  const handleJoinTeam = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsJoining(true)
    try {
      const { error } = await supabase.from("players").insert([
        {
          user_id: user.id,
          team_id: team.id,
          position: "GK", // Default position, can be updated later
          number: 1, // Default number, can be updated later
          status: "active",
        },
      ])

      if (error) throw error

      toast({
        title: "Success",
        description: "You have joined the team successfully!",
      })

      router.push(`/dashboard/${team.id}`)
    } catch (error) {
      console.error("Error joining team:", error)
      toast({
        title: "Error",
        description: "Failed to join team. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 hover:border-green-600/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 group">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
            {team.logo_url ? (
              <img 
                src={team.logo_url} 
                alt={`${team.name} logo`}
                className="w-6 h-6 object-cover rounded"
              />
            ) : (
              <Shirt className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <CardTitle className="text-green-100 group-hover:text-green-300 transition-colors">
              {team.name}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Team ID: {team.id.slice(0, 8)}...
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {team.description && (
          <p className="text-sm text-gray-300 mb-3">{team.description}</p>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Users className="w-4 h-4 text-green-400" />
          <span>View Details</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full border-gray-700/50 text-gray-300 hover:bg-green-600/20 hover:border-green-600/50 hover:text-green-300 transition-all"
          onClick={handleJoinTeam}
          disabled={isJoining}
        >
          {isJoining ? "Joining..." : "Join Team"}
        </Button>
      </CardFooter>
    </Card>
  )
} 