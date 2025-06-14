'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { useParams } from 'next/navigation'
import { Database } from '@/lib/database.types'

interface SwissConfig {
  id: string
  competition_id: string
  number_of_teams: number
  matches_per_team: number
  home_away_balance: boolean
  exclusions: Array<{
    teamA: string
    teamB: string
    reason?: string
  }>
}

interface Team {
  id: string
  name: string
}

export default function SwissConfigPage() {
  const [config, setConfig] = useState<SwissConfig | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const params = useParams()
  const supabase = createClient()

  const loadConfig = useCallback(async () => {
    const { data, error } = await supabase
      .from('swiss_config')
      .select('*')
      .eq('competition_id', params.id)
      .single()

    if (error) {
      console.error('Error loading config:', error)
      toast.error(`Error loading configuration: ${error.message}`)
      return
    }

    setConfig(data)
  }, [params.id, supabase])

  const loadTeams = useCallback(async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name')

    if (error) {
      console.error('Error loading teams:', error)
      toast.error(`Error loading teams: ${error.message}`)
      return
    }

    setTeams(data || [])
  }, [supabase])

  useEffect(() => {
    loadConfig()
    loadTeams()
  }, [loadConfig, loadTeams])

  const handleExclusionChange = (index: number, field: string, value: string) => {
    if (!config) return

    const newExclusions = [...config.exclusions]
    newExclusions[index] = {
      ...newExclusions[index],
      [field]: value
    }

    setConfig({
      ...config,
      exclusions: newExclusions
    })
  }

  const addExclusion = () => {
    if (!config) return
    if (!teams.length) {
      toast.error('No teams available to add exclusion')
      return
    }

    setConfig({
      ...config,
      exclusions: [
        ...config.exclusions,
        { teamA: teams[0].id, teamB: teams[1]?.id || teams[0].id, reason: '' }
      ]
    })
  }

  const removeExclusion = (index: number) => {
    if (!config) return

    const newExclusions = [...config.exclusions]
    newExclusions.splice(index, 1)

    setConfig({
      ...config,
      exclusions: newExclusions
    })
  }

  const saveConfig = async () => {
    try {
      if (!config) return

      const { error } = await supabase
        .from('swiss_config')
        .upsert({
          id: config.id,
          competition_id: params.id,
          number_of_teams: config.number_of_teams,
          matches_per_team: config.matches_per_team,
          home_away_balance: config.home_away_balance,
          exclusions: config.exclusions || []
        })

      if (error) throw error
      toast.success('Configuration saved successfully')
    } catch (error: any) {
      console.error('Error saving config:', error)
      toast.error(`Error saving configuration: ${error.message}`)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Swiss Model Configuration</h1>
      {config && (
        <div className="space-y-4">
          <div>
            <label htmlFor="number-of-teams" className="block text-sm font-medium text-gray-700">Number of Teams</label>
            <input
              id="number-of-teams"
              type="number"
              value={config.number_of_teams}
              onChange={(e) => setConfig({ ...config, number_of_teams: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              aria-label="Number of teams"
            />
          </div>
          <div>
            <label htmlFor="matches-per-team" className="block text-sm font-medium text-gray-700">Matches Per Team</label>
            <input
              id="matches-per-team"
              type="number"
              value={config.matches_per_team}
              onChange={(e) => setConfig({ ...config, matches_per_team: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              aria-label="Matches per team"
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.home_away_balance}
                onChange={(e) => setConfig({ ...config, home_away_balance: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                aria-label="Balance home and away games"
              />
              <span className="text-sm font-medium text-gray-700">Balance Home/Away Games</span>
            </label>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Team Exclusions</h3>
            {config.exclusions?.map((exclusion, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <select
                  value={exclusion.teamA}
                  onChange={(e) => handleExclusionChange(index, 'teamA', e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  aria-label={`Team A for exclusion ${index + 1}`}
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                <span>cannot play</span>
                <select
                  value={exclusion.teamB}
                  onChange={(e) => handleExclusionChange(index, 'teamB', e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  aria-label={`Team B for exclusion ${index + 1}`}
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={exclusion.reason || ''}
                  onChange={(e) => handleExclusionChange(index, 'reason', e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  aria-label={`Reason for exclusion ${index + 1}`}
                />
                <button
                  onClick={() => removeExclusion(index)}
                  className="text-red-600 hover:text-red-800"
                  aria-label={`Remove exclusion ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addExclusion}
              className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Exclusion
            </button>
          </div>
          <div className="flex justify-end">
            <button
              onClick={saveConfig}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 