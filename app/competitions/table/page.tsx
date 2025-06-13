"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Minus, ChevronUp, ChevronDown, ArrowUpDown, Users, Target, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

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

export default function TablePage() {
  const searchParams = useSearchParams()
  const urlCompetitionId = searchParams.get('competition')
  
  // Get competition ID from URL parameter or localStorage
  const [competitionId, setCompetitionId] = useState<string | null>(() => {
    if (urlCompetitionId) return urlCompetitionId
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCompetition')
    }
    return null
  })

  // Create supabase client once, not on every render
  const supabase = useMemo(() => createClient(), [])
  
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [availableCompetitions, setAvailableCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('position')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Update competition ID when URL parameter changes
  useEffect(() => {
    if (urlCompetitionId) {
      setCompetitionId(urlCompetitionId)
    }
  }, [urlCompetitionId])

  // Load available competitions when no competition ID is provided
  const loadAvailableCompetitions = async () => {
    try {
      const { data: competitions, error } = await supabase
        .from('competitions')
        .select('id, name, type, status')
        .order('name')

      if (error) throw error
      return competitions || []
    } catch (error) {
      console.error('Error loading competitions:', error)
      return []
    }
  }

  // Load real standings from database
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
            
            // Keep only last 5 matches
            if (homeTeam.recentMatches.length > 5) homeTeam.recentMatches.pop()
            if (awayTeam.recentMatches.length > 5) awayTeam.recentMatches.pop()
          }
        }
      })

      // Convert to standings format and sort
      const standingsData = Object.values(teamStats)
        .map((team) => ({
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
          // Sort by points desc, then goal difference desc, then goals for desc, then alphabetically by name
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

  useEffect(() => {
    if (competitionId) {
      loadCompetitionData()
    } else {
      // Load available competitions to show to the user
      loadAvailableCompetitions().then(competitions => {
        setAvailableCompetitions(competitions)
        setLoading(false)
        toast({
          title: "No Competition Selected",
          description: "Please select a competition to view the league table.",
          variant: "default",
        })
      })
    }
  }, [competitionId])

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
        console.error('Error loading competition:', competitionError)
        toast({
          title: "Error loading competition",
          description: competitionError.message,
          variant: "destructive",
        })
        return
      }

      setCompetition(competitionData)

      // Load real standings
      const standingsData = await loadStandings(competitionId)
      setStandings(standingsData)

      if (standingsData.length > 0) {
        const matchesPlayed = standingsData.some(team => team.played > 0)
        
        if (matchesPlayed) {
          toast({
            title: "League Table Loaded",
            description: `Showing live standings for ${competitionData.name}`,
            variant: "default",
          })
        } else {
          toast({
            title: "Competition Ready",
            description: `All teams registered for ${competitionData.name}. Matches yet to begin.`,
            variant: "default",
          })
        }
      } else {
        toast({
          title: "No Teams Found",
          description: `No teams have been registered for ${competitionData.name} yet.`,
          variant: "default",
        })
      }

    } catch (error: any) {
      console.error('Error in loadCompetitionData:', error)
      toast({
        title: "Error loading league table",
        description: error.message,
        variant: "destructive",
      })
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

  const getPositionStyle = (position: number) => {
    if (position <= 4) return "border-l-4 border-green-500 bg-green-500/5"
    if (position <= 6) return "border-l-4 border-blue-500 bg-blue-500/5"
    if (position >= standings.length - 2) return "border-l-4 border-red-500 bg-red-500/5"
    return "border-l-4 border-transparent"
  }

  const getFormResult = (result: string) => {
    switch (result) {
      case 'W': return "bg-green-500 text-white"
      case 'D': return "bg-yellow-500 text-black"
      case 'L': return "bg-red-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const SortButton = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-1 text-gray-300 hover:text-white hover:bg-gray-700/50"
    >
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium">{children}</span>
        {sortField === field ? (
          sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-50" />
        )}
      </div>
    </Button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 px-4 pt-8 pb-4">
        {/* Mobile-First Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link 
              href="/competitions"
              className="p-2 rounded-full bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 hover:border-green-600/40 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-green-400" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-green-400">League Table</h1>
              {competition && (
                <p className="text-gray-400 text-sm">{competition.name} • {competition.type}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={cn(
                  "bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 card-subtle-hover",
                  i % 4 === 0 && "animate-pulse-1",
                  i % 4 === 1 && "animate-pulse-2", 
                  i % 4 === 2 && "animate-pulse-3",
                  i % 4 === 3 && "animate-pulse-4"
                )}>
                  <div className="flex items-center spacing-md">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="h-6 bg-gray-700 rounded w-8"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : standings.length > 0 ? (
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
                <div key={team.team.id} className={cn(
                  "backdrop-blur-sm border rounded-xl p-3 transition-all duration-300 ease-out card-interactive",
                  // 1st place - Gold styling
                  team.position === 1 ? "bg-gradient-to-r from-yellow-900/60 via-yellow-800/40 to-gray-900/40 border-yellow-500/50 shadow-lg shadow-yellow-500/20" :
                  // Top 4 teams (2-4) - Champions League qualification spots
                  team.position <= 4 ? "bg-gradient-to-r from-green-900/60 via-green-800/40 to-gray-900/40 border-green-500/50 shadow-lg shadow-green-500/20" :
                  // Bottom 2 teams - Relegation zone
                  team.position >= standings.length - 1 ? "bg-gradient-to-r from-red-900/60 via-red-800/40 to-gray-900/40 border-red-500/50 shadow-lg shadow-red-500/20" :
                  // Middle teams - Standard styling
                  "bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30 card-subtle-hover"
                )}>
                  <div className="grid grid-cols-12 spacing-sm text-body items-center">
                    {/* Position */}
                    <div className="col-span-1 flex justify-center">
                      {team.position === 1 ? (
                        <div className="relative">
                          <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-yellow-600">
                            1
                          </div>
                        </div>
                      ) : (
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                          team.position <= 4 ? "bg-green-500/30 text-green-300 border-2 border-green-400/60 shadow-md shadow-green-400/20" :
                          team.position >= standings.length - 1 ? "bg-red-500/30 text-red-300 border-2 border-red-400/60 shadow-md shadow-red-400/20" :
                          "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                        )}>
                          {team.position}
                        </div>
                      )}
                    </div>

                    {/* Team */}
                    <div className="col-span-5 flex items-center spacing-sm">
                      {team.team.logo_url ? (
                        <Image
                          src={team.team.logo_url}
                          alt={team.team.name}
                          width={32}
                          height={32}
                          className={cn(
                            "w-8 h-8 rounded-full object-cover shadow-lg transition-all duration-300",
                            team.position === 1 ? "ring-2 ring-yellow-400/60 shadow-yellow-500/30" :
                            team.position <= 4 ? "ring-2 ring-green-400/60 shadow-green-500/30" :
                            team.position >= standings.length - 1 ? "ring-2 ring-red-400/60 shadow-red-500/30" :
                            "ring-1 ring-gray-500/30"
                          )}
                        />
                      ) : (
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs transition-all duration-300",
                          team.position === 1 ? "bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/30" :
                          team.position <= 4 ? "bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30" :
                          team.position >= standings.length - 1 ? "bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30" :
                          "bg-gradient-to-br from-blue-500 to-blue-600"
                        )}>
                          {team.team.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "text-body-emphasis truncate",
                          team.position === 1 ? "text-yellow-100" :
                          team.position <= 4 ? "text-green-100" :
                          team.position >= standings.length - 1 ? "text-red-100" :
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
                        team.position >= standings.length - 1 ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/40" :
                        "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-600/30"
                      )}>
                        {team.points}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty state
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No Table Available</h3>
              <p className="text-gray-500 text-sm mb-6">
                {competitionId 
                  ? 'League table data will appear once matches are completed.' 
                  : 'Please select a competition to view the league table.'
                }
              </p>
              
              {/* Show available competitions when no competition is selected */}
              {!competitionId && availableCompetitions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-green-400 font-medium mb-4">Available Competitions</h4>
                  <div className="space-y-2">
                    {availableCompetitions.map((comp) => (
                      <Link
                        key={comp.id}
                        href={`/competitions/table?competition=${comp.id}`}
                        className="block bg-gradient-to-r from-green-800/20 to-green-900/20 hover:from-green-700/30 hover:to-green-800/30 border border-green-700/30 hover:border-green-600/50 rounded-lg p-3 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <div className="text-white font-medium">{comp.name}</div>
                            <div className="text-gray-400 text-xs">{comp.type} • {comp.status}</div>
                          </div>
                          <div className="text-green-400">
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          {standings.length > 0 && (
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
              <h3 className="text-green-400 font-medium mb-3">Qualification Zones</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-yellow-300 font-medium">League Champions</div>
                    <div className="text-gray-400 text-xs">1st Place</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-green-300 font-medium">Champions League Qualification</div>
                    <div className="text-gray-400 text-xs">Positions 2-4</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-gray-300 font-medium">Mid-table</div>
                    <div className="text-gray-400 text-xs">Safe positions</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-red-300 font-medium">Relegation Zone</div>
                    <div className="text-gray-400 text-xs">Bottom position</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 