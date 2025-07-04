'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import DrawStage from './animations/DrawStage'
import CompletionAnimation from './animations/CompletionAnimation'
import { createClient } from "@/lib/supabase/client"

type Tables = Database['public']['Tables']
type SwissConfigRow = Tables['swiss_model_configs']['Row']

interface Exclusion {
  teamA: string
  teamB: string
  reason?: string
}

interface Team {
  id: string
  name: string
}

interface Match {
  homeTeam: Team
  awayTeam: Team
}

interface VisualDrawProps {
  competitionId: string
  onComplete: () => void
  onBack: () => void
}

export default function VisualDraw({ competitionId, onComplete, onBack: _onBack }: VisualDrawProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [config, setConfig] = useState<SwissConfigRow | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const startNextDraw = useCallback(() => {
    if (!config) return
    console.log('Starting next draw...')

    const teamsWithFewerMatches = teams
      .filter(team => {
        const teamMatches = matches.filter(m => 
          m.homeTeam.id === team.id || m.awayTeam.id === team.id
        ).length
        return teamMatches < config.matches_per_team
      })
      .sort((a, b) => {
        const aMatches = matches.filter(m => 
          m.homeTeam.id === a.id || m.awayTeam.id === a.id
        ).length
        const bMatches = matches.filter(m => 
          m.homeTeam.id === b.id || m.awayTeam.id === b.id
        ).length
        return aMatches - bMatches
      })

    console.log('Teams with fewer matches:', teamsWithFewerMatches)
    if (teamsWithFewerMatches.length > 0) {
      const nextTeam = teamsWithFewerMatches[0]
      console.log('Selected next team:', nextTeam)
      setCurrentTeam(nextTeam)
      setIsSelecting(true)
    }
  }, [config, teams, matches])

  const loadTeamsAndConfig = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading teams and config...')

      // Load teams
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
      setTeams(teams)

      // Load config
      const { data: configData, error: configError } = await supabase
        .from('swiss_model_configs')
        .select('*')
        .eq('competition_id', competitionId)
        .single()

      if (configError) throw configError
      console.log('Loaded config:', configData)
      setConfig(configData)

      // Start the draw process immediately
      if (teams.length > 0) {
        console.log('Starting draw process...')
        startNextDraw()
      } else {
        throw new Error('No teams available for the draw')
      }

    } catch (error: any) {
      console.error('Error in loadTeamsAndConfig:', error)
      setError(error.message)
      toast.error(`Error loading data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [competitionId, supabase, startNextDraw])

  useEffect(() => {
    loadTeamsAndConfig()
  }, [loadTeamsAndConfig])

  const getEligibleOpponents = (team: Team) => {
    if (!config) return []
    
    const playedAgainst = matches.flatMap(m => [
      m.homeTeam.id,
      m.awayTeam.id
    ])

    const exclusions = (config.exclusions as unknown as Exclusion[]) || []

    return teams.filter(t => 
      t.id !== team.id && 
      !playedAgainst.includes(t.id) &&
      !exclusions.some(e => 
        (e.teamA === team.id && e.teamB === t.id) ||
        (e.teamA === t.id && e.teamB === team.id)
      )
    )
  }

  const handleOpponentSelected = (opponent: Team) => {
    if (!currentTeam || !config) return

    // Determine home/away based on balance
    let isHome = Math.random() > 0.5
    if (config.home_away_balance) {
      const homeGames = matches.filter(m => m.homeTeam.id === currentTeam.id).length
      const awayGames = matches.filter(m => m.awayTeam.id === currentTeam.id).length
      isHome = homeGames < awayGames
    }

    const newMatch = isHome
      ? { homeTeam: currentTeam, awayTeam: opponent }
      : { homeTeam: opponent, awayTeam: currentTeam }

    console.log('Created new match:', newMatch)
    setMatches(prev => [...prev, newMatch])
    setCurrentTeam(null)
    setIsSelecting(false)

    // Check if draw is complete
    if (matches.length + 1 >= (config?.matches_per_team || 0) * teams.length / 2) {
      console.log('Draw complete, saving matches...')
      saveMatches()
    } else {
      console.log('Starting next draw...')
      startNextDraw()
    }
  }

  const saveMatches = async () => {
    try {
      const { error } = await supabase
        .from('swiss_model_matches')
        .insert(
          matches.map((match, index) => ({
            competition_id: competitionId,
            home_team_id: match.homeTeam.id,
            away_team_id: match.awayTeam.id,
            round: Math.floor(index / (teams.length / 2)) + 1,
            status: 'scheduled'
          }))
        )

      if (error) throw error

      toast.success('Draw completed and matches saved successfully')
      onComplete()
    } catch (error: any) {
      console.error('Error saving matches:', error)
      toast.error(`Error saving matches: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button 
          onClick={() => loadTeamsAndConfig()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 rounded-lg shadow-xl">
      <AnimatePresence mode="wait">
        {currentTeam && (
          <div className="absolute inset-0 flex items-center justify-center">
            <DrawStage
              currentTeam={currentTeam}
              eligibleOpponents={getEligibleOpponents(currentTeam)}
              onOpponentSelected={handleOpponentSelected}
              matches={matches}
              isSelecting={isSelecting}
            />
          </div>
        )}

        {!currentTeam && matches.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CompletionAnimation
              matches={matches}
              onExport={saveMatches}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
} 