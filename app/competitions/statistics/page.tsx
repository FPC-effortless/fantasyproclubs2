"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Target, Trophy, Shield, Users, TrendingUp, Award, BarChart3, PieChart, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'

interface PlayerStat {
  id: string
  name: string
  team: string
  value: number
  games_played: number
}

// Extended interface for MVP stats to include average rating
interface MVPStat extends PlayerStat {
  rating: number
}

interface TeamStat {
  id: string
  name: string
  value: number
  games_played: number
}

interface Competition {
  id: string
  name: string
  type: string
  status: string
}

export default function StatisticsPage() {
  const searchParams = useSearchParams()
  const competitionId = searchParams.get('competition')
  const router = useRouter()
  
  // Create supabase client once, not on every render
  const supabase = useMemo(() => createClient(), [])
  
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("players")
  const [playerStats, setPlayerStats] = useState<{
    goalScorers: PlayerStat[]
    assistProviders: PlayerStat[]
    cleanSheets: PlayerStat[]
    mvpPlayers: MVPStat[]
  }>({
    goalScorers: [],
    assistProviders: [],
    cleanSheets: [],
    mvpPlayers: []
  })
  const [teamStats, setTeamStats] = useState<{
    topScorers: TeamStat[]
    bestDefense: TeamStat[]
    bestForm: TeamStat[]
  }>({
    topScorers: [],
    bestDefense: [],
    bestForm: []
  })
  const [selectedSeason, setSelectedSeason] = useState<string>('1')
  // Generate seasons array (e.g., 1 to 5)
  const totalSeasons = 5
  const seasons = Array.from({ length: totalSeasons }, (_, i) => (i + 1).toString())
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStat, setModalStat] = useState<{ title: string, stats: PlayerStat[] | TeamStat[] | MVPStat[], type: string, icon: any } | null>(null)

  // Load real player statistics from database
  const loadPlayerStatistics = async (competitionId: string, season: string) => {
    try {
      // Get all players from teams in this competition
      const { data: competitionTeams } = await supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', competitionId)

      if (!competitionTeams || competitionTeams.length === 0) {
        return {
          goalScorers: [],
          assistProviders: [],
          cleanSheets: [],
          mvpPlayers: []
        }
      }

      const teamIds = competitionTeams.map(ct => ct.team_id)

      // Get top goal scorers from player match stats
      const { data: goalScorersData } = await supabase
        .from('player_match_stats')
        .select(`
          player_id,
          goals,
          players!inner(id, name, team_id),
          teams!inner(id, name)
        `)
        .in('players.team_id', teamIds)
        .gte('goals', 1)
        .eq('season', season)

      // Get top assist providers
      const { data: assistsData } = await supabase
        .from('player_match_stats')
        .select(`
          player_id,
          assists,
          players!inner(id, name, team_id),
          teams!inner(id, name)
        `)
        .in('players.team_id', teamIds)
        .gte('assists', 1)
        .eq('season', season)

      // Get goalkeepers with clean sheets
      const { data: cleanSheetsData } = await supabase
        .from('player_match_stats')
        .select(`
          player_id,
          clean_sheet,
          players!inner(id, name, team_id),
          teams!inner(id, name)
        `)
        .in('players.team_id', teamIds)
        .eq('clean_sheet', true)
        .eq('season', season)

      // Get all player ratings for MVP calculation
      const { data: ratingsData } = await supabase
        .from('player_match_stats')
        .select(`
          player_id,
          rating,
          minutes_played,
          players!inner(id, name, team_id),
          teams!inner(id, name)
        `)
        .in('players.team_id', teamIds)
        .not('rating', 'is', null)
        .gte('minutes_played', 10) // Only consider players who played meaningful minutes
        .eq('season', season)

      // Process goal scorers
      const goalScorersMap = new Map<string, {
        player: any,
        team: any,
        totalGoals: number,
        gamesPlayed: number
      }>()

      goalScorersData?.forEach(stat => {
        const key = stat.player_id
        if (!goalScorersMap.has(key)) {
          goalScorersMap.set(key, {
            player: stat.players,
            team: stat.teams,
            totalGoals: 0,
            gamesPlayed: 0
          })
        }
        const existing = goalScorersMap.get(key)!
        existing.totalGoals += stat.goals
        existing.gamesPlayed += 1
      })

      const goalScorers = Array.from(goalScorersMap.values())
        .sort((a, b) => b.totalGoals - a.totalGoals)
        .slice(0, 10)
        .map(stat => ({
          id: stat.player.id,
          name: stat.player.name,
          team: stat.team.name,
          value: stat.totalGoals,
          games_played: stat.gamesPlayed
        }))

      // Process assist providers
      const assistsMap = new Map<string, {
        player: any,
        team: any,
        totalAssists: number,
        gamesPlayed: number
      }>()

      assistsData?.forEach(stat => {
        const key = stat.player_id
        if (!assistsMap.has(key)) {
          assistsMap.set(key, {
            player: stat.players,
            team: stat.teams,
            totalAssists: 0,
            gamesPlayed: 0
          })
        }
        const existing = assistsMap.get(key)!
        existing.totalAssists += stat.assists
        existing.gamesPlayed += 1
      })

      const assistProviders = Array.from(assistsMap.values())
        .sort((a, b) => b.totalAssists - a.totalAssists)
        .slice(0, 10)
        .map(stat => ({
          id: stat.player.id,
          name: stat.player.name,
          team: stat.team.name,
          value: stat.totalAssists,
          games_played: stat.gamesPlayed
        }))

      // Process clean sheets
      const cleanSheetsMap = new Map<string, {
        player: any,
        team: any,
        totalCleanSheets: number,
        gamesPlayed: number
      }>()

      cleanSheetsData?.forEach(stat => {
        const key = stat.player_id
        if (!cleanSheetsMap.has(key)) {
          cleanSheetsMap.set(key, {
            player: stat.players,
            team: stat.teams,
            totalCleanSheets: 0,
            gamesPlayed: 0
          })
        }
        const existing = cleanSheetsMap.get(key)!
        existing.totalCleanSheets += 1
        existing.gamesPlayed += 1
      })

      const cleanSheets = Array.from(cleanSheetsMap.values())
        .sort((a, b) => b.totalCleanSheets - a.totalCleanSheets)
        .slice(0, 10)
        .map(stat => ({
          id: stat.player.id,
          name: stat.player.name,
          team: stat.team.name,
          value: stat.totalCleanSheets,
          games_played: stat.gamesPlayed
        }))

      // Process MVP players (highest average rating)
      const mvpMap = new Map<string, {
        player: any,
        team: any,
        totalRating: number,
        ratedMatches: number,
        averageRating: number
      }>()

      ratingsData?.forEach(stat => {
        const key = stat.player_id
        if (!mvpMap.has(key)) {
          mvpMap.set(key, {
            player: stat.players,
            team: stat.teams,
            totalRating: 0,
            ratedMatches: 0,
            averageRating: 0
          })
        }
        const existing = mvpMap.get(key)!
        existing.totalRating += stat.rating
        existing.ratedMatches += 1
        existing.averageRating = existing.totalRating / existing.ratedMatches
      })

      const mvpPlayers = Array.from(mvpMap.values())
        .filter(stat => stat.ratedMatches >= 3) // Minimum 3 rated matches to qualify
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 10)
        .map(stat => ({
          id: stat.player.id,
          name: stat.player.name,
          team: stat.team.name,
          value: parseFloat(stat.averageRating.toFixed(2)), // Show average rating as value
          games_played: stat.ratedMatches,
          rating: stat.averageRating
        }))

      return {
        goalScorers,
        assistProviders,
        cleanSheets,
        mvpPlayers
      }

    } catch (error) {
      console.error('Error loading player statistics:', error)
      return {
        goalScorers: [],
        assistProviders: [],
        cleanSheets: [],
        mvpPlayers: []
      }
    }
  }

  // Load real team statistics from database
  const loadTeamStatistics = async (competitionId: string, season: string) => {
    try {
      // Get all matches for this competition
      const { data: matches } = await supabase
        .from('matches')
        .select(`
          id, home_team_id, away_team_id, home_score, away_score, status,
          home_team:teams!matches_home_team_id_fkey(id, name),
          away_team:teams!matches_away_team_id_fkey(id, name)
        `)
        .eq('competition_id', competitionId)
        .eq('status', 'completed')
        .eq('season', season)

      if (!matches || matches.length === 0) {
        return {
          topScorers: [],
          bestDefense: [],
          bestForm: []
        }
      }

      // Calculate team statistics
      const teamStatsMap = new Map<string, {
        team: any,
        goalsFor: number,
        goalsAgainst: number,
        gamesPlayed: number,
        wins: number,
        draws: number,
        losses: number,
        recentForm: string[]
      }>()

      matches.forEach(match => {
        if (match.home_score !== null && match.away_score !== null) {
          // Initialize home team stats
          if (!teamStatsMap.has(match.home_team_id)) {
            teamStatsMap.set(match.home_team_id, {
              team: match.home_team,
              goalsFor: 0,
              goalsAgainst: 0,
              gamesPlayed: 0,
              wins: 0,
              draws: 0,
              losses: 0,
              recentForm: []
            })
          }

          // Initialize away team stats
          if (!teamStatsMap.has(match.away_team_id)) {
            teamStatsMap.set(match.away_team_id, {
              team: match.away_team,
              goalsFor: 0,
              goalsAgainst: 0,
              gamesPlayed: 0,
              wins: 0,
              draws: 0,
              losses: 0,
              recentForm: []
            })
          }

          const homeStats = teamStatsMap.get(match.home_team_id)!
          const awayStats = teamStatsMap.get(match.away_team_id)!

          // Update goals and games played
          homeStats.goalsFor += match.home_score
          homeStats.goalsAgainst += match.away_score
          homeStats.gamesPlayed += 1

          awayStats.goalsFor += match.away_score
          awayStats.goalsAgainst += match.home_score
          awayStats.gamesPlayed += 1

          // Update wins/draws/losses and form
          if (match.home_score > match.away_score) {
            homeStats.wins += 1
            awayStats.losses += 1
            homeStats.recentForm.unshift('W')
            awayStats.recentForm.unshift('L')
          } else if (match.home_score < match.away_score) {
            awayStats.wins += 1
            homeStats.losses += 1
            awayStats.recentForm.unshift('W')
            homeStats.recentForm.unshift('L')
          } else {
            homeStats.draws += 1
            awayStats.draws += 1
            homeStats.recentForm.unshift('D')
            awayStats.recentForm.unshift('D')
          }

          // Keep only last 5 results
          if (homeStats.recentForm.length > 5) homeStats.recentForm.pop()
          if (awayStats.recentForm.length > 5) awayStats.recentForm.pop()
        }
      })

      const teamStats = Array.from(teamStatsMap.values())

      // Top scoring teams
      const topScorers = teamStats
        .sort((a, b) => b.goalsFor - a.goalsFor)
        .slice(0, 10)
        .map(stat => ({
          id: stat.team.id,
          name: stat.team.name,
          value: stat.goalsFor,
          games_played: stat.gamesPlayed
        }))

      // Best defensive teams (fewest goals conceded)
      const bestDefense = teamStats
        .sort((a, b) => a.goalsAgainst - b.goalsAgainst)
        .slice(0, 10)
        .map(stat => ({
          id: stat.team.id,
          name: stat.team.name,
          value: stat.goalsAgainst,
          games_played: stat.gamesPlayed
        }))

      // Best form teams (most wins in recent games)
      const bestForm = teamStats
        .sort((a, b) => {
          const aWinRate = a.recentForm.filter(r => r === 'W').length
          const bWinRate = b.recentForm.filter(r => r === 'W').length
          return bWinRate - aWinRate
        })
        .slice(0, 10)
        .map(stat => ({
          id: stat.team.id,
          name: stat.team.name,
          value: stat.recentForm.filter(r => r === 'W').length,
          games_played: stat.gamesPlayed,
          form: stat.recentForm
        }))

      return {
        topScorers,
        bestDefense,
        bestForm
      }

    } catch (error) {
      console.error('Error loading team statistics:', error)
      return {
        topScorers: [],
        bestDefense: [],
        bestForm: []
      }
    }
  }

  const loadStatisticsData = useCallback(async () => {
    try {
      setLoading(true)

      if (!competitionId) {
        toast({
          title: "No competition selected",
          description: "Please select a competition to view statistics",
          variant: "destructive",
        })
        return
      }

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

      // Load real statistics
      const [playerStatsData, teamStatsData] = await Promise.all([
        loadPlayerStatistics(competitionId, selectedSeason),
        loadTeamStatistics(competitionId, selectedSeason)
      ])

      setPlayerStats(playerStatsData)
      setTeamStats(teamStatsData)

      console.log('Successfully loaded real statistics for competition:', competitionData.name)

    } catch (error: any) {
      console.error('Error in loadStatisticsData:', error)
      toast({
        title: "Error loading statistics",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, competitionId, selectedSeason])

  useEffect(() => {
    if (competitionId) {
      setLoading(true)
      Promise.all([
        loadPlayerStatistics(competitionId, selectedSeason),
        loadTeamStatistics(competitionId, selectedSeason),
      ]).then(([playerStats, teamStats]) => {
        setPlayerStats(playerStats)
        setTeamStats(teamStats)
        setLoading(false)
      })
    }
  }, [competitionId, selectedSeason])

  // Enhanced Stat Card Component
  const StatCard = ({ icon: Icon, title, stats, type }: { 
    icon: any, 
    title: string, 
    stats: PlayerStat[] | TeamStat[] | MVPStat[], 
    type: 'goals' | 'assists' | 'cleanSheets' | 'mvp' | 'teamGoals' | 'defense' | 'form'
  }) => {
    const getStatColor = () => {
      switch (type) {
        case 'goals': return 'from-red-500 to-red-600'
        case 'assists': return 'from-blue-500 to-blue-600'
        case 'cleanSheets': return 'from-green-500 to-green-600'
        case 'mvp': return 'from-purple-500 to-purple-600'
        case 'teamGoals': return 'from-purple-500 to-purple-600'
        case 'defense': return 'from-yellow-500 to-yellow-600'
        case 'form': return 'from-cyan-500 to-cyan-600'
        default: return 'from-gray-500 to-gray-600'
      }
    }

    return (
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/30 backdrop-blur-sm card-interactive cursor-pointer" onClick={() => {
        if (competitionId) {
          router.push(`/competitions/statistics/${competitionId}/${type}?season=${selectedSeason}`)
        }
      }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center spacing-sm text-white">
            <div className={`w-10 h-10 bg-gradient-to-br ${getStatColor()} rounded-lg flex items-center justify-center shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-subheading">{title}</h3>
              <p className="text-caption font-normal">
                {stats.length > 0 ? `${stats.length} entries` : 'No data available'}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">No statistics available</div>
              <div className="text-caption mt-1">Data will appear once matches are played</div>
            </div>
          ) :
            <div className="space-y-3">
              {stats.slice(0, 3).map((stat, index) => (
                <div key={stat.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/30 transition-all duration-300 card-subtle-hover">
                  <div className="flex items-center spacing-sm">
                    <div className="flex items-center spacing-sm">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                        index === 0 ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30" :
                        index === 1 ? "bg-gray-400 text-black shadow-lg shadow-gray-400/30" :
                        index === 2 ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30" :
                        "bg-gray-600 text-white"
                      )}>
                        {index + 1}
                      </div>
                      <span className="text-lg">{getStatIcon(type)}</span>
                    </div>
                    <div>
                      <div className="text-body-emphasis">{stat.name}</div>
                      <div className="text-caption">{(stat as PlayerStat).team || 'Team'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-heading",
                      type === 'defense' ? 'text-yellow-400' : 
                      type === 'mvp' ? 'text-purple-400' : 'text-green-400'
                    )}>
                      {type === 'mvp' ? `${stat.value}★` : stat.value}
                    </div>
                    <div className="text-caption">
                      {stat.games_played} games
                      {getStatLabel(type) && (
                        <div className="text-caption">{getStatLabel(type)}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
        </CardContent>
      </Card>
    )
  }

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="animate-pulse-1">
        <div className="h-8 bg-gray-700 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-32"></div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 spacing-md">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={cn(
            "bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/30 rounded-xl p-6 card-subtle-hover",
            i % 3 === 0 && "animate-pulse-1",
            i % 3 === 1 && "animate-pulse-2",
            i % 3 === 2 && "animate-pulse-3"
          )}>
            <div className="flex items-center spacing-sm mb-4">
              <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                  <div className="flex items-center spacing-sm">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-700 rounded w-8"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Move these helpers outside StatCard so they can be used in the modal
  function getStatIcon(type?: string) {
    switch (type) {
      case 'goals': return '⚽'
      case 'assists': return '🎯'
      case 'cleanSheets': return '🛡️'
      case 'mvp': return '⭐'
      case 'teamGoals': return '🏆'
      case 'defense': return '🔒'
      case 'form': return '📈'
      default: return '📊'
    }
  }
  function getStatLabel(type?: string) {
    switch (type) {
      case 'defense': return 'Goals Conceded'
      case 'form': return 'Recent Wins'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="relative z-10 px-4 pt-8 pb-4">
        {/* Header and Season Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 mb-2 md:mb-0">
            <Link 
              href="/competitions"
              className="p-2 rounded-full bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 hover:border-green-600/40 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-green-400" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-green-400">Competition Statistics</h1>
              {competition && (
                <p className="text-gray-400 text-sm">{competition.name} • {competition.type}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700/30 text-green-100">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {seasons.map((season) => (
                  <SelectItem key={season} value={season} className="text-green-100 hover:bg-green-600/20">
                    Season {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 pb-8 max-w-7xl mx-auto">
          {/* Enhanced Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-gray-800/50 border border-gray-700/30">
              <TabsTrigger 
                value="players" 
                className="data-[state=active]:bg-green-500 data-[state=active]:text-black flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Player Statistics</span>
                <span className="sm:hidden">Players</span>
              </TabsTrigger>
              <TabsTrigger 
                value="teams" 
                className="data-[state=active]:bg-green-500 data-[state=active]:text-black flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Team Statistics</span>
                <span className="sm:hidden">Teams</span>
              </TabsTrigger>
            </TabsList>

            {/* Player Statistics */}
            <TabsContent value="players">
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                  <StatCard 
                    icon={Target}
                    title="Top Scorers"
                    stats={playerStats.goalScorers}
                    type="goals"
                  />
                  <StatCard 
                    icon={TrendingUp}
                    title="Most Assists"
                    stats={playerStats.assistProviders}
                    type="assists"
                  />
                  <StatCard 
                    icon={Shield}
                    title="Clean Sheets"
                    stats={playerStats.cleanSheets}
                    type="cleanSheets"
                  />
                  <StatCard 
                    icon={Award}
                    title="MVP (Highest Rating)"
                    stats={playerStats.mvpPlayers}
                    type="mvp"
                  />
                </div>
              )}
            </TabsContent>

            {/* Team Statistics */}
            <TabsContent value="teams">
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <StatCard 
                    icon={Trophy}
                    title="Most Goals Scored"
                    stats={teamStats.topScorers}
                    type="teamGoals"
                  />
                  <StatCard 
                    icon={BarChart3}
                    title="Best Defense"
                    stats={teamStats.bestDefense}
                    type="defense"
                  />
                  <StatCard 
                    icon={Activity}
                    title="Best Form"
                    stats={teamStats.bestForm}
                    type="form"
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 