'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

interface Team {
  id: string
  name: string
}

interface TeamListProps {
  competitionId: string
  onStartDraw: () => void
  onBack: () => void
}

export default function TeamList({ competitionId, onStartDraw, onBack }: TeamListProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading teams for competition:', competitionId)

      const { data: teamData, error: teamError } = await supabase
        .from('competition_teams')
        .select(`
          team_id,
          teams!inner (
            id,
            name
          )
        `)
        .eq('competition_id', competitionId)

      if (teamError) throw teamError

      type TeamResponse = {
        team_id: string
        teams: {
          id: string
          name: string
        }
      }

      const teams = ((teamData || []) as unknown as TeamResponse[]).map(t => ({
        id: t.teams.id,
        name: t.teams.name
      }))

      console.log('Loaded teams:', teams)
      
      if (teams.length === 0) {
        throw new Error('No teams found in this competition')
      }

      setTeams(teams)
      setLoading(false)
    } catch (error: any) {
      console.error('Error loading teams:', error)
      setError(error.message)
      toast.error(`Error loading teams: ${error.message}`)
      setLoading(false)
    }
  }, [competitionId, supabase])

  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  const handleStartDraw = () => {
    console.log('Starting draw with teams:', teams)
    if (teams.length < 2) {
      toast.error('Need at least 2 teams to start the draw')
      return
    }
    onStartDraw()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <Button onClick={() => loadTeams()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Participating Teams ({teams.length})</h2>
        <div className="space-x-4">
          <Button variant="outline" onClick={onBack}>
            Back to Configuration
          </Button>
          <Button 
            onClick={handleStartDraw}
            disabled={teams.length < 2}
          >
            Start Draw
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <h3 className="font-medium">{team.name}</h3>
          </div>
        ))}
      </div>
    </div>
  )
} 