"use client"

import { LineupBuilder } from "@/components/manager/lineup-builder"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Loading } from "@/components/ui/loading"

export default function ManagerLineupsPage() {
  const { user } = useAuth()
  const [userTeamId, setUserTeamId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'manager' | 'player'>('player')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUserTeamInfo() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        console.log('🔍 Getting team info for user:', user.id)
        
        // First get user profile to check role
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('❌ Error fetching user profile:', profileError)
        } else {
          console.log('👤 User role:', profile?.role)
          setUserRole(profile?.role || 'player')
        }

        // Get user's team ID from players table (for both managers and players)
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('team_id, teams(name)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (playerError) {
          console.log('ℹ️ User not found in players table, trying as manager:', playerError.message)
          
          // Try to get team ID from teams table if user is a manager
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('id, name')
            .eq('manager_id', user.id)
            .single()

          if (teamError) {
            console.error('❌ Error fetching managed team:', teamError)
          } else {
            console.log('✅ Found managed team:', teamData)
            setUserTeamId(teamData.id)
          }
        } else {
          console.log('✅ Found user team from players table:', playerData)
          setUserTeamId(playerData.team_id)
        }
      } catch (error) {
        console.error('❌ Error getting user team info:', error)
      } finally {
        setLoading(false)
      }
    }

    getUserTeamInfo()
  }, [user])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Loading />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground">Please log in to access lineup management.</p>
        </div>
      </div>
    )
  }

  if (!userTeamId) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Team Found</h1>
          <p className="text-muted-foreground">
            You need to be associated with a team to manage lineups. Please contact an administrator.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            (Check browser console for debugging info)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Team Lineup Management</h1>
        <p className="text-muted-foreground">
          Submit and manage your team lineups for upcoming matches. Use AI players for positions where no team members are available.
        </p>
      </div>
      
      <LineupBuilder userTeamId={userTeamId} userRole={userRole} />
    </div>
  )
} 