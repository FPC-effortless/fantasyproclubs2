"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, Trophy, Users, Calendar, Star, ExternalLink, 
  Download, Clock, MapPin, Tv, Award, Target, Shield
} from "lucide-react"
import { useCompetitions } from "@/hooks/use-competitions"
import { useSupabase } from "@/components/providers/supabase-provider"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

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
  form?: string[]
}

interface Fixture {
  id: string
  home_team: {
    id: string
    name: string
    logo_url?: string
  }
  away_team: {
    id: string
    name: string
    logo_url?: string
  }
  match_date: string
  status: string
  home_score?: number
  away_score?: number
  venue?: string
  stream_link?: string
}

interface TeamInfo {
  id: string
  name: string
  logo_url?: string
  manager?: string
  players_count: number
  wins: number
  losses: number
}

interface PlayerStat {
  position: number
  player: {
    id: string
    name: string
    position: string
  }
  team: {
    id: string
    name: string
  }
  goals: number
  assists: number
  appearances: number
  rating: number
}

export default function CompetitionDetailsPage() {
  const params = useParams()
  const { competitions, loading: competitionsLoading, error } = useCompetitions()
  const { supabase } = useSupabase()
  const [activeTab, setActiveTab] = useState("overview")
  
  // Data states
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [teams, setTeams] = useState<TeamInfo[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [loading, setLoading] = useState(true)

  const competition = competitions.find((c) => c.id === params.id)

  useEffect(() => {
    if (competition && !competitionsLoading) {
      loadCompetitionData()
    }
  }, [competition, competitionsLoading])

  const loadCompetitionData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadStandings(),
        loadFixtures(),
        loadTeams(),
        loadPlayerStats()
      ])
    } catch (error) {
      console.error('Error loading competition data:', error)
      toast({
        title: "Error loading competition data",
        description: "Failed to load some competition information.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStandings = async () => {
    try {
      // Get teams in this competition with their match results
      const { data: competitionTeams, error: teamsError } = await supabase
        .from('competition_teams')
        .select(`
          team_id,
          teams (
            id,
            name,
            logo_url
          )
        `)
        .eq('competition_id', params.id)

      if (teamsError) throw teamsError

      if (!competitionTeams || competitionTeams.length === 0) {
        console.log('No teams found for competition')
        return
      }

      // Get all matches for this competition
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('competition_id', params.id)
        .eq('status', 'finished')

      if (matchesError) throw matchesError

      // Calculate standings
      const standingsMap = new Map()
      
      competitionTeams.forEach((ct: any) => {
        const team = ct.teams
        if (team) {
          standingsMap.set(team.id, {
            team: {
              id: team.id,
              name: team.name,
              logo_url: team.logo_url
            },
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goals_for: 0,
            goals_against: 0,
            points: 0
          })
        }
      })

      // Process matches to calculate stats
      matches?.forEach((match: any) => {
        const homeTeam = standingsMap.get(match.home_team_id)
        const awayTeam = standingsMap.get(match.away_team_id)
        
        if (homeTeam && awayTeam && match.home_score !== null && match.away_score !== null) {
          homeTeam.played++
          awayTeam.played++
          homeTeam.goals_for += match.home_score
          homeTeam.goals_against += match.away_score
          awayTeam.goals_for += match.away_score
          awayTeam.goals_against += match.home_score

          if (match.home_score > match.away_score) {
            homeTeam.won++
            homeTeam.points += 3
            awayTeam.lost++
          } else if (match.away_score > match.home_score) {
            awayTeam.won++
            awayTeam.points += 3
            homeTeam.lost++
          } else {
            homeTeam.drawn++
            awayTeam.drawn++
            homeTeam.points += 1
            awayTeam.points += 1
          }
        }
      })

      // Convert to array and sort by points, goal difference
      const standingsArray = Array.from(standingsMap.values())
        .map((team: any) => ({
          ...team,
          goal_difference: team.goals_for - team.goals_against
        }))
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points
          if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
          return b.goals_for - a.goals_for
        })
        .map((team, index) => ({
          ...team,
          position: index + 1
        }))

      setStandings(standingsArray)
    } catch (error) {
      console.error('Error loading standings:', error)
    }
  }

  const loadFixtures = async () => {
    try {
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          status,
          home_score,
          away_score,
          venue,
          stream_link,
          home_team:home_team_id (
            id,
            name,
            logo_url
          ),
          away_team:away_team_id (
            id,
            name,
            logo_url
          )
        `)
        .eq('competition_id', params.id)
        .order('match_date', { ascending: true })
        .limit(10)

      if (error) throw error

      const transformedFixtures = (matchesData || []).map((match: any) => ({
        id: match.id,
        home_team: {
          id: match.home_team.id,
          name: match.home_team.name,
          logo_url: match.home_team.logo_url
        },
        away_team: {
          id: match.away_team.id,
          name: match.away_team.name,
          logo_url: match.away_team.logo_url
        },
        match_date: match.match_date,
        status: match.status,
        home_score: match.home_score,
        away_score: match.away_score,
        venue: match.venue,
        stream_link: match.stream_link
      }))

      setFixtures(transformedFixtures)
    } catch (error) {
      console.error('Error loading fixtures:', error)
    }
  }

  const loadTeams = async () => {
    try {
      const { data: competitionTeams, error } = await supabase
        .from('competition_teams')
        .select(`
          team_id,
          teams (
            id,
            name,
            logo_url
          )
        `)
        .eq('competition_id', params.id)

      if (error) throw error

      // Get player counts and match stats for each team
      const teamIds = competitionTeams?.map((ct: any) => ct.team_id) || []
      
      const [playersCount, matchStats] = await Promise.all([
        // Get player counts
        supabase
          .from('players')
          .select('team_id')
          .in('team_id', teamIds),
        
        // Get match results
        supabase
          .from('matches')
          .select('home_team_id, away_team_id, home_score, away_score, status')
          .eq('competition_id', params.id)
          .eq('status', 'finished')
      ])

      // Calculate team stats
      const playerCounts = new Map()
      playersCount.data?.forEach((player: any) => {
        playerCounts.set(player.team_id, (playerCounts.get(player.team_id) || 0) + 1)
      })

      const teamMatchStats = new Map()
      matchStats.data?.forEach((match: any) => {
        if (match.home_score !== null && match.away_score !== null) {
          // Home team
          if (!teamMatchStats.has(match.home_team_id)) {
            teamMatchStats.set(match.home_team_id, { wins: 0, losses: 0 })
          }
          // Away team
          if (!teamMatchStats.has(match.away_team_id)) {
            teamMatchStats.set(match.away_team_id, { wins: 0, losses: 0 })
          }

          const homeStats = teamMatchStats.get(match.home_team_id)
          const awayStats = teamMatchStats.get(match.away_team_id)

          if (match.home_score > match.away_score) {
            homeStats.wins++
            awayStats.losses++
          } else if (match.away_score > match.home_score) {
            awayStats.wins++
            homeStats.losses++
          }
        }
      })

      const transformedTeams = (competitionTeams || []).map((ct: any) => {
        const team = ct.teams
        const stats = teamMatchStats.get(team.id) || { wins: 0, losses: 0 }
        return {
          id: team.id,
          name: team.name,
          logo_url: team.logo_url,
          players_count: playerCounts.get(team.id) || 0,
          wins: stats.wins,
          losses: stats.losses
        }
      })

      setTeams(transformedTeams)
    } catch (error) {
      console.error('Error loading teams:', error)
    }
  }

  const loadPlayerStats = async () => {
    try {
      // Get top goal scorers from this competition
      const { data: playerMatchStats, error } = await supabase
        .from('player_match_stats')
        .select(`
          player_id,
          goals,
          assists,
          rating,
          matches!inner (
            competition_id,
            status
          ),
          players!inner (
            id,
            name,
            position,
            teams (
              id,
              name
            )
          )
        `)
        .eq('matches.competition_id', params.id)
        .eq('matches.status', 'finished')
        .eq('status', 'approved')

      if (error) throw error

      // Aggregate stats by player
      const playerStatsMap = new Map()
      
      playerMatchStats?.forEach((stat: any) => {
        const playerId = stat.player_id
        if (!playerStatsMap.has(playerId)) {
          playerStatsMap.set(playerId, {
            player: {
              id: stat.players.id,
              name: stat.players.name,
              position: stat.players.position
            },
            team: {
              id: stat.players.teams?.id,
              name: stat.players.teams?.name
            },
            goals: 0,
            assists: 0,
            appearances: 0,
            total_rating: 0,
            rating_count: 0
          })
        }

        const playerData = playerStatsMap.get(playerId)
        playerData.goals += stat.goals || 0
        playerData.assists += stat.assists || 0
        playerData.appearances += 1
        if (stat.rating) {
          playerData.total_rating += stat.rating
          playerData.rating_count += 1
        }
      })

      // Convert to array and calculate average ratings
      const topScorers = Array.from(playerStatsMap.values())
        .map((player: any) => ({
          ...player,
          rating: player.rating_count > 0 ? player.total_rating / player.rating_count : 0
        }))
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10)
        .map((player, index) => ({
          position: index + 1,
          player: player.player,
          team: player.team,
          goals: player.goals,
          assists: player.assists,
          appearances: player.appearances,
          rating: Number(player.rating.toFixed(1))
        }))

      setPlayerStats(topScorers)
    } catch (error) {
      console.error('Error loading player stats:', error)
    }
  }

  if (competitionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
              COMPETITION DETAILS
            </h1>
            <p className="text-green-200/80">Loading competition information...</p>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Trophy className="w-8 h-8 text-green-500/50" />
          </div>
          <p className="text-gray-400">Loading competition details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-red-500/50" />
          </div>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-500/50" />
          </div>
          <p className="text-gray-400">Competition not found</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "border-green-400/50 text-green-400 bg-green-400/20"
      case "upcoming":
        return "border-blue-400/50 text-blue-400 bg-blue-400/20"
      case "completed":
        return "border-gray-400/50 text-gray-400 bg-gray-400/20"
      default:
        return "border-gray-400/50 text-gray-400 bg-gray-400/20"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMatchStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'live':
        return 'text-red-400 bg-red-400/20'
      case 'finished':
        return 'text-green-400 bg-green-400/20'
      case 'upcoming':
        return 'text-blue-400 bg-blue-400/20'
      default:
        return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      
      {/* Enhanced Header */}
      <div className="relative z-10 bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/competitions"
                className="p-2 rounded-full bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 hover:border-green-600/40 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-green-400" />
              </Link>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                  {competition.name}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline" className={getStatusColor(competition.status)}>
                    {competition.status}
                  </Badge>
                  <span className="text-green-200/80 capitalize">{competition.type}</span>
                  {competition.is_fantasy_enabled && (
                    <div className="flex items-center text-yellow-400">
                      <Star className="h-4 w-4 mr-1" />
                      <span className="text-sm">Fantasy Enabled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {competition.stream_link && (
                <Button variant="outline" className="border-green-600/50 text-green-400 hover:bg-green-600/20 hover:border-green-500">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Watch Stream
                </Button>
              )}
              <Button variant="outline" className="border-green-600/50 text-green-400 hover:bg-green-600/20 hover:border-green-500">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300 hover:text-green-300 transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="standings" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300 hover:text-green-300 transition-all"
            >
              Standings
            </TabsTrigger>
            <TabsTrigger 
              value="fixtures" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300 hover:text-green-300 transition-all"
            >
              Fixtures
            </TabsTrigger>
            <TabsTrigger 
              value="teams" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300 hover:text-green-300 transition-all"
            >
              Teams
            </TabsTrigger>
            <TabsTrigger 
              value="rules" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300 hover:text-green-300 transition-all"
            >
              Rules
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">Total Teams</CardTitle>
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{competition.teams_count}</div>
                  <p className="text-xs text-gray-400">of {competition.max_teams} slots filled</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">Matches Played</CardTitle>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">24</div>
                  <p className="text-xs text-gray-400">+5 this week</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">Live Matches</CardTitle>
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">2</div>
                  <p className="text-xs text-gray-400">Currently streaming</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">Top Scorer</CardTitle>
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">James Wilson</div>
                  <p className="text-xs text-gray-400">12 goals</p>
                </CardContent>
              </Card>
            </div>

            {/* Live Matches */}
            <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-green-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  Live Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fixtures
                    .filter((fixture) => fixture.status === "live")
                    .map((fixture) => (
                      <div
                        key={fixture.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700/30"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-green-100">
                            {fixture.home_team.name} vs {fixture.away_team.name}
                          </div>
                          <Badge className={getMatchStatusColor(fixture.status)}>
                            {fixture.status === "live" ? "LIVE" : "Upcoming"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">
                            {formatDate(fixture.match_date)}
                          </span>
                          {fixture.stream_link && (
                            <Button size="sm" variant="outline" className="border-green-600/50 text-green-400 hover:bg-green-600/20">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Watch
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  {fixtures.filter((fixture) => fixture.status === "live").length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-6 h-6 text-gray-500/50" />
                      </div>
                      <p className="text-gray-400">No live matches at the moment</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-green-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-400" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {playerStats.slice(0, 5).map((player) => (
                    <div
                      key={player.position}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700/30 hover:border-green-600/40 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          player.position === 1 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' : 
                          player.position <= 3 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gray-700/50 text-gray-300'
                        }`}>
                          {player.position}
                        </div>
                        <div>
                          <div className="font-medium text-green-100">{player.player.name}</div>
                          <div className="text-sm text-gray-400">{player.team.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-400">{player.goals} goals</div>
                        <div className="text-xs text-gray-400">{player.assists} assists</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Standings Tab */}
          <TabsContent value="standings" className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
                    <div className="animate-pulse flex items-center gap-4">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="h-4 w-32 flex-1" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : standings.length > 0 ? (
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-100 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-green-400" />
                    League Table
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {standings.map((team) => (
                      <div
                        key={team.team.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700/30 hover:border-green-600/40 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            team.position <= 4 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 
                            team.position >= standings.length - 2 ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'bg-gray-700/50 text-gray-300'
                          }`}>
                            {team.position}
                          </div>
                          <div>
                            <div className="font-medium text-green-100">{team.team.name}</div>
                            <div className="text-sm text-gray-400">{team.played} games played</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-8 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-green-400">{team.points}</div>
                            <div className="text-xs text-gray-400">PTS</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-300">{team.won}</div>
                            <div className="text-xs text-gray-400">W</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-yellow-400">{team.drawn}</div>
                            <div className="text-xs text-gray-400">D</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-red-400">{team.lost}</div>
                            <div className="text-xs text-gray-400">L</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gray-300">{team.goal_difference > 0 ? '+' : ''}{team.goal_difference}</div>
                            <div className="text-xs text-gray-400">GD</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-gray-500/50" />
                </div>
                <p className="text-gray-400">No standings data available</p>
              </div>
            )}
          </TabsContent>

          {/* Fixtures Tab */}
          <TabsContent value="fixtures" className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
                    <div className="animate-pulse">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : fixtures.length > 0 ? (
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-400" />
                    Upcoming Fixtures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fixtures.map((fixture) => (
                      <div
                        key={fixture.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700/30 hover:border-green-600/40 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-green-100">{fixture.home_team.name}</span>
                            <span className="text-gray-400">vs</span>
                            <span className="font-medium text-green-100">{fixture.away_team.name}</span>
                          </div>
                          <Badge className={getMatchStatusColor(fixture.status)}>
                            {fixture.status}
                          </Badge>
                          {fixture.status === 'finished' && fixture.home_score !== null && fixture.away_score !== null && (
                            <div className="text-sm font-bold text-green-400">
                              {fixture.home_score} - {fixture.away_score}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-300">{formatDate(fixture.match_date)}</div>
                            {fixture.venue && (
                              <div className="text-xs text-gray-400 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {fixture.venue}
                              </div>
                            )}
                          </div>
                          {fixture.stream_link && (
                            <Button size="sm" variant="outline" className="border-green-600/50 text-green-400 hover:bg-green-600/20">
                              <Tv className="h-3 w-3 mr-1" />
                              Watch
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-500/50" />
                </div>
                <p className="text-gray-400">No fixtures available</p>
              </div>
            )}
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
                    <div className="animate-pulse">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : teams.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <Card
                    key={team.id}
                    className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">{team.name.charAt(0)}</span>
                        </div>
                        <div>
                          <CardTitle className="text-green-100">{team.name}</CardTitle>
                          <p className="text-sm text-gray-400">{team.manager || 'No manager assigned'}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Players:</span>
                          <span className="text-green-400 font-medium">{team.players_count}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Wins:</span>
                          <span className="text-green-400 font-medium">{team.wins}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Losses:</span>
                          <span className="text-red-400 font-medium">{team.losses}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-500/50" />
                </div>
                <p className="text-gray-400">No teams available</p>
              </div>
            )}
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules">
            <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-green-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-400" />
                  Competition Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-lg font-semibold text-green-100">General Rules</h3>
                  <ul className="list-disc list-inside text-gray-400 space-y-2">
                    <li>Matches are played in Fantasy Pro Clubs 24 mode</li>
                    <li>Each team must have a minimum of 11 players</li>
                    <li>Matches are played on weekends</li>
                    <li>Teams must respect fair play and sportsmanship</li>
                    <li>Match results must be submitted within 24 hours</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
} 