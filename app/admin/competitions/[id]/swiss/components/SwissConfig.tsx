'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

interface Team {
  id: string
  name: string
}

interface SwissConfig {
  id?: string
  competition_id: string
  number_of_teams: number
  matches_per_team: number
  home_away_balance: boolean
  playoff_qualifiers: number
  direct_qualifiers: number
  tiebreakers: string[]
  exclusions: Array<{
    teamA: string
    teamB: string
    reason?: string
  }>
}

export default function SwissConfig({
  competitionId,
  onConfigured
}: {
  competitionId: string
  onConfigured: () => void
}) {
  const [teams, setTeams] = useState<Team[]>([])
  const [config, setConfig] = useState<SwissConfig>({
    competition_id: competitionId,
    number_of_teams: 8,
    matches_per_team: 5,
    home_away_balance: true,
    playoff_qualifiers: 4,
    direct_qualifiers: 0,
    tiebreakers: ['points', 'goal_difference', 'goals_scored'],
    exclusions: []
  })
  const [selectedTeamA, setSelectedTeamA] = useState<string>('')
  const [selectedTeamB, setSelectedTeamB] = useState<string>('')
  const [exclusionReason, setExclusionReason] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadTeamsAndConfig = useCallback(async () => {
    try {
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

      setTeams(teams)
      if (teams.length > 0) {
        setSelectedTeamA(teams[0].id)
        setSelectedTeamB(teams[1]?.id || teams[0].id)
      }

      // Load existing config
      const { data: configData, error: configError } = await supabase
        .from('swiss_model_configs')
        .select('*')
        .eq('competition_id', competitionId)
        .single()

      if (configData) {
        setConfig(configData)
      }

      setLoading(false)
    } catch (error: any) {
      toast.error(`Error loading configuration data: ${error.message}`)
      setLoading(false)
    }
  }, [competitionId, supabase])

  useEffect(() => {
    loadTeamsAndConfig()
  }, [loadTeamsAndConfig])

  const addExclusion = () => {
    if (selectedTeamA === selectedTeamB) {
      toast.error('Cannot exclude a team from playing itself')
      return
    }

    const existingExclusion = config.exclusions.find(
      e => (e.teamA === selectedTeamA && e.teamB === selectedTeamB) ||
           (e.teamA === selectedTeamB && e.teamB === selectedTeamA)
    )

    if (existingExclusion) {
      toast.error('This exclusion already exists')
      return
    }

    setConfig({
      ...config,
      exclusions: [
        ...config.exclusions,
        {
          teamA: selectedTeamA,
          teamB: selectedTeamB,
          reason: exclusionReason
        }
      ]
    })

    setExclusionReason('')
  }

  const removeExclusion = (index: number) => {
    const newExclusions = [...config.exclusions]
    newExclusions.splice(index, 1)
    setConfig({ ...config, exclusions: newExclusions })
  }

  const saveConfig = async () => {
    try {
      setLoading(true)

      // Validate configuration
      if (config.number_of_teams < 4 || config.number_of_teams > 64) {
        throw new Error('Number of teams must be between 4 and 64')
      }

      if (config.matches_per_team < 3 || config.matches_per_team > 10) {
        throw new Error('Matches per team must be between 3 and 10')
      }

      if (config.direct_qualifiers < 0) {
        throw new Error('Direct qualifiers cannot be negative')
      }

      if (config.playoff_qualifiers < 2) {
        throw new Error('Must have at least 2 playoff qualifiers')
      }

      if (config.direct_qualifiers + config.playoff_qualifiers > config.number_of_teams) {
        throw new Error('Total qualifiers cannot exceed number of teams')
      }

      const { error } = await supabase
        .from('swiss_model_configs')
        .upsert({
          ...config,
          competition_id: competitionId
        })

      if (error) throw error

      toast.success('Configuration saved successfully')
      onConfigured()
    } catch (error: any) {
      toast.error(`Error saving configuration: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Basic Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="number-of-teams" className="block text-sm font-medium mb-2">Number of Teams</label>
            <input
              id="number-of-teams"
              type="number"
              value={config.number_of_teams}
              onChange={(e) => setConfig({ ...config, number_of_teams: parseInt(e.target.value) })}
              className="w-full bg-gray-700 rounded-md px-4 py-2 text-white"
              min={4}
              max={64}
              aria-describedby="number-of-teams-help"
            />
            <p id="number-of-teams-help" className="text-sm text-gray-400 mt-1">Must be between 4 and 64</p>
          </div>

          <div>
            <label htmlFor="matches-per-team" className="block text-sm font-medium mb-2">Matches Per Team</label>
            <input
              id="matches-per-team"
              type="number"
              value={config.matches_per_team}
              onChange={(e) => setConfig({ ...config, matches_per_team: parseInt(e.target.value) })}
              className="w-full bg-gray-700 rounded-md px-4 py-2 text-white"
              min={3}
              max={10}
              aria-describedby="matches-per-team-help"
            />
            <p id="matches-per-team-help" className="text-sm text-gray-400 mt-1">Must be between 3 and 10</p>
          </div>

          <div>
            <label htmlFor="direct-qualifiers" className="block text-sm font-medium mb-2">Direct Qualifiers</label>
            <input
              id="direct-qualifiers"
              type="number"
              value={config.direct_qualifiers}
              onChange={(e) => setConfig({ ...config, direct_qualifiers: parseInt(e.target.value) })}
              className="w-full bg-gray-700 rounded-md px-4 py-2 text-white"
              min={0}
              aria-describedby="direct-qualifiers-help"
            />
            <p id="direct-qualifiers-help" className="text-sm text-gray-400 mt-1">Teams that qualify directly to next stage</p>
          </div>

          <div>
            <label htmlFor="playoff-qualifiers" className="block text-sm font-medium mb-2">Playoff Qualifiers</label>
            <input
              id="playoff-qualifiers"
              type="number"
              value={config.playoff_qualifiers}
              onChange={(e) => setConfig({ ...config, playoff_qualifiers: parseInt(e.target.value) })}
              className="w-full bg-gray-700 rounded-md px-4 py-2 text-white"
              min={2}
              aria-describedby="playoff-qualifiers-help"
            />
            <p id="playoff-qualifiers-help" className="text-sm text-gray-400 mt-1">Teams that qualify for playoffs</p>
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              id="home-away-balance"
              type="checkbox"
              checked={config.home_away_balance}
              onChange={(e) => setConfig({ ...config, home_away_balance: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              aria-describedby="home-away-balance-help"
            />
            <span className="text-sm font-medium">Balance Home/Away Games</span>
          </label>
          <p id="home-away-balance-help" className="text-sm text-gray-400 mt-1">Try to give each team equal home and away games</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Tiebreakers</h3>
        <div className="space-y-4">
          {config.tiebreakers.map((tiebreaker, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium">{index + 1}. {tiebreaker.replace('_', ' ').toUpperCase()}</span>
              {index > 0 && (
                <button
                  onClick={() => {
                    const newTiebreakers = [...config.tiebreakers]
                    newTiebreakers.splice(index, 1)
                    setConfig({ ...config, tiebreakers: newTiebreakers })
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Team Exclusions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="team-a-select" className="block text-sm font-medium mb-2">Team A</label>
            <select
              id="team-a-select"
              value={selectedTeamA}
              onChange={(e) => setSelectedTeamA(e.target.value)}
              className="w-full bg-gray-700 rounded-md px-4 py-2 text-white"
              aria-label="Select Team A for exclusion"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="team-b-select" className="block text-sm font-medium mb-2">Team B</label>
            <select
              id="team-b-select"
              value={selectedTeamB}
              onChange={(e) => setSelectedTeamB(e.target.value)}
              className="w-full bg-gray-700 rounded-md px-4 py-2 text-white"
              aria-label="Select Team B for exclusion"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="exclusion-reason" className="block text-sm font-medium mb-2">Reason (Optional)</label>
            <input
              id="exclusion-reason"
              type="text"
              value={exclusionReason}
              onChange={(e) => setExclusionReason(e.target.value)}
              className="w-full bg-gray-700 rounded-md px-4 py-2 text-white"
              placeholder="e.g., Same club"
            />
          </div>
        </div>

        <button
          onClick={addExclusion}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add Exclusion
        </button>

        <div className="mt-4 space-y-2">
          {config.exclusions.map((exclusion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-gray-700 rounded-md p-3"
            >
              <div className="flex items-center space-x-2">
                <span>{teams.find(t => t.id === exclusion.teamA)?.name}</span>
                <span className="text-gray-400">cannot play</span>
                <span>{teams.find(t => t.id === exclusion.teamB)?.name}</span>
                {exclusion.reason && (
                  <span className="text-gray-400">({exclusion.reason})</span>
                )}
              </div>
              <button
                onClick={() => removeExclusion(index)}
                className="text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveConfig}
          disabled={loading}
          className={`
            px-6 py-3 rounded-lg font-medium text-white
            ${loading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  )
} 