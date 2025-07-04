"use client"

import { useState, useEffect, useMemo } from "react"
import { Trophy, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import Image from 'next/image'
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"

interface TeamStanding {
  position: number
  team: {
    id: string
    name: string
    logo_url?: string
  }
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  form: string[]
}

interface Competition {
  id: string
  name: string
  type: string
  status: string
}

type SortField = 'position' | 'points' | 'goal_difference' | 'goals_for' | 'won'
type SortDirection = 'asc' | 'desc'

export function CompetitionTable({ competitionId }: { competitionId: string }) {
  const supabase = useMemo(() => createClient(), [])
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('position')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  useEffect(() => {
    if (competitionId) {
      loadCompetitionData()
    }
  }, [competitionId, loadCompetitionData])

  const loadStandings = async (competitionId: string) => {
    try {
      // Get competition teams
      const { data: teams, error: teamsError } = await supabase
        .from('competition_teams')
        .select(`
          team_id,
          teams!inner(id, name, logo_url)
        `)
        .eq('competition_id', competitionId)

      if (teamsError) throw teamsError
      if (!teams || teams.length === 0) {
        return []
      }

      // Get all matches for this competition
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id, home_team_id, away_team_id, home_score, away_score, status,
          match_date
        `)
        .eq('competition_id', competitionId)
        .eq('status', 'completed')
        .order('match_date', { ascending: false })

      if (matchesError) throw matchesError

      // Calculate standings
      const teamStats: Record<string, {
        team_id: string
        team_name: string
        team_logo?: string | null
        played: number
        won: number
        drawn: number
        lost: number
        goalsFor: number
        goalsAgainst: number
        points: number
        recentMatches: Array<{ result: string, date: string }>
      }> = {}

      // Initialize team stats
      teams.forEach(team => {
        const teamData = Array.isArray(team.teams) ? team.teams[0] : team.teams
        teamStats[team.team_id] = {
          team_id: team.team_id,
          team_name: teamData?.name || 'Unknown Team',
          team_logo: teamData?.logo_url,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
          recentMatches: []
        }
      })

      // Process matches
      matches?.forEach(matchData => {
        if (matchData.home_score !== null && matchData.away_score !== null) {
          const homeTeam = teamStats[matchData.home_team_id]
          const awayTeam = teamStats[matchData.away_team_id]

          if (homeTeam && awayTeam) {
            // Update stats for both teams
            homeTeam.played++
            awayTeam.played++
            homeTeam.goalsFor += matchData.home_score
            homeTeam.goalsAgainst += matchData.away_score
            awayTeam.goalsFor += matchData.away_score
            awayTeam.goalsAgainst += matchData.home_score

            let homeResult, awayResult
            if (matchData.home_score > matchData.away_score) {
              homeTeam.won++
              homeTeam.points += 3
              awayTeam.lost++
              homeResult = 'W'
              awayResult = 'L'
            } else if (matchData.home_score < matchData.away_score) {
              awayTeam.won++
              awayTeam.points += 3
              homeTeam.lost++
              homeResult = 'L'
              awayResult = 'W'
            } else {
              homeTeam.drawn++
              awayTeam.drawn++
              homeTeam.points++
              awayTeam.points++
              homeResult = 'D'
              awayResult = 'D'
            }

            // Add to recent matches (last 5)
            homeTeam.recentMatches.unshift({ result: homeResult, date: matchData.match_date })
            awayTeam.recentMatches.unshift({ result: awayResult, date: matchData.match_date })
            if (homeTeam.recentMatches.length > 5) homeTeam.recentMatches.pop()
            if (awayTeam.recentMatches.length > 5) awayTeam.recentMatches.pop()
          }
        }
      })

      // Convert to standings format and sort
      const standingsData = Object.values(teamStats)
        .map((team, index) => ({
          position: 0, // Will be set after sorting
          team: {
            id: team.team_id,
            name: team.team_name,
            logo_url: team.team_logo || undefined,
          },
          played: team.played,
          won: team.won,
          drawn: team.drawn,
          lost: team.lost,
          goals_for: team.goalsFor,
          goals_against: team.goalsAgainst,
          goal_difference: team.goalsFor - team.goalsAgainst,
          points: team.points,
          form: team.recentMatches.map(m => m.result),
        }))
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points
          if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
          if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for
          return a.team.name.localeCompare(b.team.name)
        })
        .map((team, index) => ({
          ...team,
          position: index + 1
        }))

      return standingsData
    } catch (error) {
      console.error('Error loading standings:', error)
      throw error
    }
  }

  const loadCompetitionData = async () => {
    if (!competitionId) return
    try {
      setLoading(true)
      // Load competition details
      const { data: competitionData, error: competitionError } = await supabase
        .from('competitions')
        .select('id, name, type, status')
        .eq('id', competitionId)
        .single()
      if (competitionError) {
        setCompetition(null)
      } else {
        setCompetition(competitionData)
      }
      // Load real standings
      const standingsData = await loadStandings(competitionId)
      setStandings(standingsData)
    } catch (error) {
      setCompetition(null)
      setStandings([])
    } finally {
      setLoading(false)
    }
  }

  // Sorting functionality
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(field === 'position' ? 'asc' : 'desc')
    }
  }

  const sortedStandings = [...standings].sort((a, b) => {
    let aValue: number
    let bValue: number
    switch (sortField) {
      case 'position':
        aValue = a.position
        bValue = b.position
        break
      case 'points':
        aValue = a.points
        bValue = b.points
        break
      case 'goal_difference':
        aValue = a.goal_difference
        bValue = b.goal_difference
        break
      case 'goals_for':
        aValue = a.goals_for
        bValue = b.goals_for
        break
      case 'won':
        aValue = a.won
        bValue = b.won
        break
      default:
        aValue = a.position
        bValue = b.position
    }
    if (sortDirection === 'asc') {
      return aValue - bValue
    } else {
      return bValue - aValue
    }
  })

  const getFormResult = (result: string) => {
    switch (result) {
      case 'W': return "bg-green-500 text-white"
      case 'D': return "bg-yellow-500 text-black"
      case 'L': return "bg-red-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const SortButton = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => handleSort(field)}
      className="h-auto p-1 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded"
    >
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium">{children}</span>
        {sortField === field ? (
          sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-50" />
        )}
      </div>
    </button>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No Table Available</h3>
        <p className="text-gray-500 text-sm mb-6">
          League table data will appear once matches are completed.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Table Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-green-800/40 to-green-900/40 backdrop-blur-sm border border-green-700/30 rounded-xl p-3 shadow-lg shadow-green-500/10">
        <div className="grid grid-cols-12 spacing-sm text-caption text-green-200">
          <div className="col-span-1 text-center font-bold">#</div>
          <div className="col-span-5 font-bold">Team</div>
          <div className="col-span-1 text-center font-bold">P</div>
          <div className="col-span-1 text-center font-bold">W</div>
          <div className="col-span-1 text-center font-bold">D</div>
          <div className="col-span-1 text-center font-bold">L</div>
          <div className="col-span-1 text-center font-bold">GD</div>
          <div className="col-span-1 text-center font-bold">Pts</div>
        </div>
      </div>
      {/* Table Rows */}
      {sortedStandings.map((team, index) => (
        <Link
          key={team.team.id}
          href={`/teams/${team.team.id}`}
          className={cn(
            "grid grid-cols-12 spacing-sm text-body items-center border-b border-green-700/20 hover:bg-green-900/10 transition-colors cursor-pointer group w-full h-full block focus:outline-none focus:ring-2 focus:ring-green-400",
            team.position === 1 ? "bg-green-900/20" : team.position <= 4 ? "bg-blue-900/10" : ""
          )}
          style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}
          tabIndex={0}
        >
          {/* Position */}
          <div className="col-span-1 flex justify-center">
            {team.position === 1 ? (
              <div className="relative">
                <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-lg group-hover:scale-110 transition-transform" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-yellow-600">
                  1
                </div>
              </div>
            ) : (
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 group-hover:scale-110 group-hover:ring-2 group-hover:ring-green-400",
                team.position <= 4 ? "bg-green-500/30 text-green-300 border-2 border-green-400/60 shadow-md shadow-green-400/20" :
                team.position >= sortedStandings.length - 1 ? "bg-red-500/30 text-red-300 border-2 border-red-400/60 shadow-md shadow-red-400/20" :
                "bg-gray-500/20 text-gray-300 border border-gray-500/30"
              )}>
                {team.position}
              </div>
            )}
          </div>
          {/* Team */}
          <div className="col-span-5 flex items-center gap-3">
            {team.team.logo_url ? (
              <Image
                src={team.team.logo_url}
                alt={team.team.name}
                width={32}
                height={32}
                className={cn(
                  "w-8 h-8 rounded-full object-cover shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-green-400",
                  team.position === 1 ? "ring-2 ring-yellow-400/60 shadow-yellow-500/30" :
                  team.position <= 4 ? "ring-2 ring-green-400/60 shadow-green-500/30" :
                  team.position >= sortedStandings.length - 1 ? "ring-2 ring-red-400/60 shadow-red-500/30" :
                  "ring-1 ring-gray-500/30"
                )}
                priority={index < 5}
              />
            ) : (
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs transition-all duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-green-400",
                team.position === 1 ? "bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/30" :
                team.position <= 4 ? "bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30" :
                team.position >= sortedStandings.length - 1 ? "bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30" :
                "bg-gradient-to-br from-blue-500 to-blue-600"
              )}>
                {team.team.name.charAt(0)}
              </div>
            )}
            <h3 className={cn(
              "text-body-emphasis truncate group-hover:underline",
              team.position === 1 ? "text-yellow-100" :
              team.position <= 4 ? "text-green-100" :
              team.position >= sortedStandings.length - 1 ? "text-red-100" :
              "text-white"
            )}>{team.team.name}</h3>
            {/* Form indicators for mobile */}
            <div className="flex spacing-xs mt-1">
              {team.form.slice(0, 3).map((result, i) => (
                <div key={i} className={cn(
                  "w-3 h-3 rounded-full text-xs shadow-sm transition-all duration-300",
                  result === 'W' ? "bg-green-500 shadow-green-500/30" :
                  result === 'D' ? "bg-yellow-500 shadow-yellow-500/30" :
                  "bg-red-500 shadow-red-500/30"
                )}></div>
              ))}
              {team.form.length === 0 && (
                <div className="text-caption">No matches</div>
              )}
            </div>
          </div>
          {/* Stats */}
          <div className="col-span-1 text-center text-caption">{team.played}</div>
          <div className="col-span-1 text-center text-green-400 text-xs font-bold">{team.won}</div>
          <div className="col-span-1 text-center text-yellow-400 text-xs font-bold">{team.drawn}</div>
          <div className="col-span-1 text-center text-red-400 text-xs font-bold">{team.lost}</div>
          <div className="col-span-1 text-center text-caption">
            {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
          </div>
          <div className="col-span-1 text-center">
            <div className={cn(
              "rounded-full px-2 py-1 text-xs font-bold shadow-md transition-all duration-300",
              team.position === 1 ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-yellow-500/40" :
              team.position <= 4 ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/40" :
              team.position >= sortedStandings.length - 1 ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/40" :
              "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-600/30"
            )}>
              {team.points}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
} 