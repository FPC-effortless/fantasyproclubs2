"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, Trophy, TrendingUp, Users, Crown, Activity, Clock, Star, Target, ArrowUpDown, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { Skeleton } from "@/components/ui/skeleton"
import { openSignInModal } from '@/components/auth/SignInModal'
import { useRouter } from 'next/navigation'

interface FantasyTeam {
  id: string
  name: string
  budget: number
  points: number
  competition_id: string
}

interface PlayerPerformance {
  id: string
  user_profile: {
    display_name: string
    avatar_url?: string
  }
  position: string
  team: {
    short_name: string
  }
  fantasy_points: number
  player_match_stats: {
    goals: number
    assists: number
    average_rating: number
  }
}

interface LeaderboardEntry {
  position: number
  user_id: string
  user_profile: {
    display_name: string
    avatar_url?: string
  }
  fantasy_team: {
    name: string
    points: number
  }
}

export default function FantasyDashboardPage() {
  const [fantasyTeam, setFantasyTeam] = useState<FantasyTeam | null>(null)
  const [teamStats, setTeamStats] = useState({
    totalPoints: 0,
    gameweekPoints: 0,
    overallRank: 0,
    gameweekRank: 0,
    budget: 0,
    transfers: 0
  })
  const [playerPerformance, setPlayerPerformance] = useState<PlayerPerformance[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentGameweek, setCurrentGameweek] = useState(1)
  const [selectedGameweek, setSelectedGameweek] = useState(1)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    loadUserAndFantasyData()
  }, [])

  useEffect(() => {
    if (fantasyTeam) {
      loadPlayerPerformance(selectedGameweek)
    }
  }, [selectedGameweek, fantasyTeam])

  const loadUserAndFantasyData = async () => {
    try {
      setLoading(true)
      console.log('👤 Loading user and fantasy data...')

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('❌ Error loading user:', userError)
        setLoading(false)
        return
      }

      if (!user) {
        console.log('ℹ️ No authenticated user found')
        setLoading(false)
        return
      }

      setUser(user)
      console.log('✅ User loaded:', user.id)

      // Load user's fantasy team
      const { data: fantasyTeamData, error: teamError } = await supabase
        .from('fantasy_teams')
        .select('id, name, budget, points, competition_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (teamError) {
        if (teamError.code === 'PGRST116') {
          console.log('ℹ️ User has no fantasy team')
        } else {
          console.error('❌ Error loading fantasy team:', teamError)
        }
        setLoading(false)
        return
      }

      setFantasyTeam(fantasyTeamData)
      console.log('✅ Fantasy team loaded:', fantasyTeamData.name)
      
      // Set team stats
      setTeamStats({
        totalPoints: fantasyTeamData.points || 0,
        gameweekPoints: Math.floor(Math.random() * 50) + 10, // Mock for now
        overallRank: Math.floor(Math.random() * 1000) + 1,
        gameweekRank: Math.floor(Math.random() * 500) + 1,
        budget: fantasyTeamData.budget || 0,
        transfers: 2 // Mock for now
      })

      setCurrentGameweek(24) // Mock current gameweek
      setSelectedGameweek(24)

      // Load leaderboard
      await loadLeaderboard()

    } catch (error) {
      console.error('💥 Error loading user and fantasy data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPlayerPerformance = useCallback(async (gameweek: number) => {
    if (!fantasyTeam) return

    try {
      console.log('📊 Loading player performance for gameweek:', gameweek)

      // Get teams in the competition
      const { data: competitionTeams, error: competitionTeamsError } = await supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', fantasyTeam.competition_id)

      if (competitionTeamsError) {
        console.error('❌ Error loading competition teams:', competitionTeamsError)
        return
      }

      if (!competitionTeams || competitionTeams.length === 0) {
        console.log('ℹ️ No teams found in competition')
        return
      }

      const teamIds = competitionTeams.map(ct => ct.team_id)

      // Get top performing players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, user_id, position, team_id')
        .in('team_id', teamIds)
        .eq('status', 'active')
        .limit(10)

      if (playersError) {
        console.error('❌ Error loading players:', playersError)
        return
      }

      if (!playersData || playersData.length === 0) {
        console.log('ℹ️ No players found')
        return
      }

      // Get user profiles - with robust error handling
      let userProfiles: any[] = []
      let profilesError: any = null
      
      try {
        const result = await supabase
          .from('user_profiles')
          .select('id, display_name, avatar_url')
          .in('id', playersData.map(p => p.user_id))
        
        if (result.error) {
          if (result.error.code === '42703') {
            console.log('🔄 Avatar column not found, retrying without avatar_url...')
            const fallbackResult = await supabase
              .from('user_profiles')
              .select('id, display_name')
              .in('id', playersData.map(p => p.user_id))
            
            userProfiles = fallbackResult.data || []
            profilesError = fallbackResult.error
          } else {
            userProfiles = result.data || []
            profilesError = result.error
          }
        } else {
          userProfiles = result.data || []
        }
      } catch (error) {
        console.error('💥 Error loading user profiles:', error)
        profilesError = error
        userProfiles = []
      }

      // Get teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, short_name')
        .in('id', playersData.map(p => p.team_id))

      // Get fantasy stats
      const { data: fantasyStats, error: statsError } = await supabase
        .from('fantasy_player_stats')
        .select('player_id, fantasy_points')
        .in('player_id', playersData.map(p => p.id))
        .eq('competition_id', fantasyTeam.competition_id)

      // Get match stats
      const { data: matchStats, error: matchStatsError } = await supabase
        .from('player_match_stats')
        .select('player_id, goals, assists, rating')
        .in('player_id', playersData.map(p => p.id))
        .eq('status', 'approved')

      // Aggregate match stats
      const aggregatedStats = matchStats?.reduce((acc, stat) => {
        if (!acc[stat.player_id]) {
          acc[stat.player_id] = {
            goals: 0,
            assists: 0,
            total_rating: 0,
            matches: 0,
            average_rating: 0
          }
        }
        
        acc[stat.player_id].goals += stat.goals || 0
        acc[stat.player_id].assists += stat.assists || 0
        
        if (stat.rating) {
          acc[stat.player_id].total_rating += stat.rating
          acc[stat.player_id].matches += 1
        }
        
        return acc
      }, {} as Record<string, any>) || {}

      // Calculate average ratings
      Object.keys(aggregatedStats).forEach(playerId => {
        const stats = aggregatedStats[playerId]
        if (stats.matches > 0) {
          stats.average_rating = stats.total_rating / stats.matches
        }
      })

      // Map players with performance data
      const performanceData = playersData.map(player => {
        const userProfile = userProfiles?.find(up => up.id === player.user_id)
        const team = teamsData?.find(t => t.id === player.team_id)
        const stats = aggregatedStats[player.id] || { goals: 0, assists: 0, average_rating: 0 }
        
        return {
          id: player.id,
          user_profile: userProfile || {
            display_name: 'Unknown Player',
            avatar_url: undefined
          },
          position: player.position,
          team: team || {
            short_name: 'UNK'
          },
          fantasy_points: fantasyStats?.find(s => s.player_id === player.id)?.fantasy_points || 0,
          player_match_stats: {
            goals: stats.goals,
            assists: stats.assists,
            average_rating: stats.average_rating
          }
        }
      })

      // Sort by fantasy points
      performanceData.sort((a, b) => b.fantasy_points - a.fantasy_points)

      setPlayerPerformance(performanceData.slice(0, 5))
      console.log('✅ Player performance loaded:', performanceData.length)

    } catch (error) {
      console.error('💥 Error loading player performance:', error)
    }
  }, [fantasyTeam, supabase])

  const loadLeaderboard = async () => {
    try {
      console.log('🏆 Loading fantasy leaderboard...')
      
      // Query all fantasy teams with user profiles
      const { data: fantasyTeamsData, error: teamsError } = await supabase
        .from('fantasy_teams')
        .select('id, name, points, user_id')
        .order('points', { ascending: false })
        .limit(10)

      if (teamsError) {
        console.error('❌ Error loading fantasy teams:', teamsError)
        return
      }

      if (!fantasyTeamsData || fantasyTeamsData.length === 0) {
        console.log('ℹ️ No fantasy teams found')
        return
      }

      // Get user profiles for all fantasy team owners - with robust error handling
      let profilesData: any[] = []
      let profilesError: any = null
      
      try {
        const result = await supabase
          .from('user_profiles')
          .select('id, display_name, avatar_url')
          .in('id', fantasyTeamsData.map(team => team.user_id))
        
        if (result.error) {
          if (result.error.code === '42703') {
            console.log('🔄 Avatar column not found, retrying without avatar_url...')
            const fallbackResult = await supabase
              .from('user_profiles')
              .select('id, display_name')
              .in('id', fantasyTeamsData.map(team => team.user_id))
            
            profilesData = fallbackResult.data || []
            profilesError = fallbackResult.error
          } else {
            profilesData = result.data || []
            profilesError = result.error
          }
        } else {
          profilesData = result.data || []
        }
      } catch (error) {
        console.error('💥 Error loading user profiles:', error)
        profilesError = error
        profilesData = []
      }

      if (profilesError) {
        console.error('⚠️ Error loading user profiles for leaderboard:', profilesError)
      }

      // Map fantasy teams with user profiles
      const leaderboardData = fantasyTeamsData.map((team, index) => {
        const userProfile = profilesData?.find(profile => profile.id === team.user_id)
        
        return {
          position: index + 1,
          user_id: team.user_id,
          user_profile: userProfile || {
            display_name: 'Unknown Manager',
            avatar_url: undefined
          },
          fantasy_team: {
            name: team.name,
            points: team.points || 0
          }
        }
      })

      setLeaderboard(leaderboardData)
      console.log('✅ Leaderboard loaded:', leaderboardData.length)

    } catch (error) {
      console.error('💥 Error loading leaderboard:', error)
    }
  }

  // Generate gameweeks array
  const gameweeks = Array.from({ length: 38 }, (_, i) => i + 1)

  // Mock transfer suggestions and other data
  const transferSuggestions = [
    {
      id: 1,
      player: { name: "Rising Star", team: "TOP", position: "MID" },
      reason: "In excellent form",
      price: 6.5,
      trend: "up"
    },
    {
      id: 2,
      player: { name: "Goal Machine", team: "ATT", position: "FWD" },
      reason: "High scoring potential",
      price: 9.0,
      trend: "up"
    }
  ]

  const miniLeagues = [
    { name: "Friends League", position: 3, total: 12 },
    { name: "Work Colleagues", position: 1, total: 8 },
    { name: "University Mates", position: 5, total: 15 }
  ]

  const transferHistory = [
    { week: 23, transfers: 1, points: 65 },
    { week: 22, transfers: 2, points: 58 },
    { week: 21, transfers: 0, points: 72 }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pb-16">
        <div className="p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      </div>
    )
  }

  if (!fantasyTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <Trophy className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Fantasy Team Found</h2>
          <p className="text-gray-300 mb-6">You need a fantasy team to view the dashboard. Create one to get started!</p>
          <Button 
            asChild={false}
            onClick={() => {
              if (!user) {
                openSignInModal();
                return;
              }
              router.push('/fantasy');
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Create Fantasy Team
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 text-white pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-900 p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
              <Link href="/fantasy">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-6 h-6" />
                Fantasy Dashboard
              </h1>
              <p className="text-green-200 text-sm">{fantasyTeam.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedGameweek.toString()} onValueChange={(value) => setSelectedGameweek(parseInt(value))}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select Gameweek" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {gameweeks.map((gw) => (
                  <SelectItem key={gw} value={gw.toString()} className="text-white hover:bg-gray-700">
                    GW {gw}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white mb-2">{teamStats.totalPoints}</div>
              <div className="text-blue-300 text-sm mb-1">Total Points</div>
              <div className="text-green-400 text-xs">+{teamStats.gameweekPoints} this gameweek</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white mb-2">#{teamStats.overallRank}</div>
              <div className="text-yellow-300 text-sm">Overall Rank</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white mb-2">#{teamStats.gameweekRank}</div>
              <div className="text-purple-300 text-sm">Gameweek Rank</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white mb-2">£{teamStats.budget}M</div>
              <div className="text-green-300 text-sm mb-1">Budget</div>
              <div className="text-gray-400 text-xs">{teamStats.transfers} transfers left</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Performance */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Top Performers (GW{selectedGameweek})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {playerPerformance.length > 0 ? (
                  playerPerformance.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400 text-sm w-6">#{index + 1}</div>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={player.user_profile.avatar_url || "/placeholder-avatar.svg"} />
                          <AvatarFallback className="bg-green-600 text-white text-xs">
                            {player.user_profile.display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white text-sm font-medium">{player.user_profile.display_name}</div>
                          <div className="text-gray-400 text-xs">{player.position} • {player.team.short_name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">{Math.floor(player.fantasy_points)} pts</div>
                        <div className="text-gray-400 text-xs">
                          {player.player_match_stats.goals}G {player.player_match_stats.assists}A
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No player performance data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transfer Suggestions */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-400" />
                Transfer Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transferSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${suggestion.trend === 'up' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <div>
                        <div className="text-white text-sm font-medium">{suggestion.player.name}</div>
                        <div className="text-gray-400 text-xs">{suggestion.player.position} • {suggestion.player.team}</div>
                        <div className="text-gray-300 text-xs">{suggestion.reason}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">£{suggestion.price}M</div>
                      <Button size="sm" className="mt-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          if (!user) {
                            openSignInModal();
                            return;
                          }
                          // actual add transfer logic
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overall Leaderboard */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Overall Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry) => (
                    <div key={entry.user_id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          entry.position <= 3 ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'
                        }`}>
                          {entry.position}
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={entry.user_profile.avatar_url || "/placeholder-avatar.svg"} />
                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                            {entry.user_profile.display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white text-sm font-medium">{entry.user_profile.display_name}</div>
                          <div className="text-gray-400 text-xs">{entry.fantasy_team.name}</div>
                        </div>
                      </div>
                      <div className="text-white font-bold">{entry.fantasy_team.points} pts</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No leaderboard data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mini Leagues */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Mini Leagues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {miniLeagues.map((league, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <div className="text-white text-sm font-medium">{league.name}</div>
                      <div className="text-gray-400 text-xs">{league.total} teams</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">#{league.position}</div>
                      <div className="text-gray-400 text-xs">Position</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transfer History */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-purple-400" />
              Recent Transfer History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {transferHistory.map((week, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg text-center">
                  <div className="text-white font-bold text-lg">GW {week.week}</div>
                  <div className="text-gray-300 text-sm mb-2">{week.transfers} transfers</div>
                  <div className="text-green-400 font-bold">{week.points} points</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
