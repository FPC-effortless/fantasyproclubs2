"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, Trophy, Users, Search, Filter } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/lib/database.types"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface Competition {
  id: string
  name: string
  type: string
  status: string
  fantasy_enabled: boolean
}

interface FantasyPlayer {
  id: string
  user_id: string
  position: string
  number: number
  status: string
  team_id: string
  fantasy_price: number
  fantasy_points: number
  user_profile: {
    display_name: string
    username: string
    avatar_url?: string
  }
  team: {
    id: string
    name: string
    short_name: string
  }
  player_match_stats?: {
    goals: number
    assists: number
    matches_played: number
    average_rating: number
  }
}

export default function FantasyStatisticsPage() {
  const [fantasyCompetitions, setFantasyCompetitions] = useState<Competition[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<string>("")
  const [allPlayers, setAllPlayers] = useState<FantasyPlayer[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<FantasyPlayer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
  const [teamFilter, setTeamFilter] = useState("all")
  const [sortBy, setSortBy] = useState("points")
  const [loading, setLoading] = useState(true)
  const [competitionTeams, setCompetitionTeams] = useState<any[]>([])

  const supabase = createClientComponentClient<Database>()
  const positions = ['GK', 'RB', 'CB', 'LB', 'CDM', 'CM', 'CAM', 'RM', 'LM', 'RW', 'LW', 'CF', 'ST']

  const loadFantasyCompetitions = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🏆 Loading fantasy competitions...')

      const { data: competitions, error } = await supabase
        .from('competitions')
        .select('id, name, type, status, fantasy_enabled')
        .eq('fantasy_enabled', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error loading fantasy competitions:', error)
        setFantasyCompetitions([])
        return
      }

      if (!competitions || competitions.length === 0) {
        console.log('ℹ️ No fantasy-enabled competitions found')
        setFantasyCompetitions([])
        return
      }

      console.log('✅ Loaded fantasy competitions:', competitions.length)
      setFantasyCompetitions(competitions)
      
      // Auto-select first competition if none selected
      if (!selectedCompetition && competitions.length > 0) {
        setSelectedCompetition(competitions[0].id)
      }

    } catch (error) {
      console.error('💥 Error in loadFantasyCompetitions:', error)
      setFantasyCompetitions([])
    } finally {
      setLoading(false)
    }
  }, [supabase, selectedCompetition])

  const loadPlayersForCompetition = useCallback(async (competitionId: string) => {
    if (!competitionId) return
    
    try {
      setLoading(true)
      console.log('👥 Loading players for competition:', competitionId)

      // Get teams in the competition
      const { data: competitionTeams, error: competitionTeamsError } = await supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', competitionId)

      console.log('🏟️ Competition teams query result:', { 
        competitionTeams: competitionTeams?.length, 
        competitionTeamsError 
      })

      if (competitionTeamsError) {
        console.error('❌ Error loading competition teams:', competitionTeamsError)
        setAllPlayers([])
        return
      }

      if (!competitionTeams || competitionTeams.length === 0) {
        console.log('ℹ️ No teams found in competition')
        setAllPlayers([])
        return
      }

      const teamIds = competitionTeams.map(ct => ct.team_id)

      // Get players from those teams
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, user_id, position, number, status, team_id')
        .in('team_id', teamIds)
        .eq('status', 'active')
        .order('number')

      if (playersError) {
        console.error('❌ Error loading players - Details:', {
          error: playersError,
          message: playersError?.message,
          details: playersError?.details,
          hint: playersError?.hint,
          code: playersError?.code,
          teamIds: teamIds,
          competitionId: competitionId
        })
        setAllPlayers([])
        return
      }

      if (!playersData || playersData.length === 0) {
        console.log('ℹ️ No players found')
        setAllPlayers([])
        return
      }

      console.log('✅ Found players:', playersData.length)

      // Get user profiles for these players - try with avatar_url first, fallback without
      let userProfiles: any[] = []
      let profilesError: any = null
      
      try {
        // First try with avatar_url
        const result = await supabase
          .from('user_profiles')
          .select('id, display_name, username, avatar_url')
          .in('id', playersData.map(p => p.user_id))
        
        if (result.error) {
          // If avatar_url column doesn't exist, try without it
          if (result.error.code === '42703') {
            console.log('🔄 Avatar column not found, retrying without avatar_url...')
            const fallbackResult = await supabase
              .from('user_profiles')
              .select('id, display_name, username')
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
      
      console.log('👤 User profiles query result:', { 
        userProfiles: userProfiles?.length || 0, 
        profilesError: profilesError ? {
          code: profilesError.code,
          message: profilesError.message,
          details: profilesError.details,
          hint: profilesError.hint
        } : null
      })

      if (profilesError) {
        console.error('⚠️ Error loading user profiles:', {
          code: profilesError.code,
          message: profilesError.message,
          details: profilesError.details,
          hint: profilesError.hint
        })
      }

      // Get teams for these players
      const { data: teamsData, error: teamsDataError } = await supabase
        .from('teams')
        .select('id, name, short_name')
        .in('id', playersData.map(p => p.team_id))

      console.log('🏟️ Teams query result:', { teams: teamsData?.length, teamsDataError })

      // Store competition teams for filtering
      setCompetitionTeams(teamsData || [])

      // Get fantasy stats for these players
      const { data: fantasyStats, error: statsError } = await supabase
        .from('fantasy_player_stats')
        .select('player_id, fantasy_points, fantasy_price')
        .in('player_id', playersData.map(p => p.id))
        .eq('competition_id', competitionId)

      console.log('⚡ Fantasy stats query result:', { fantasyStats: fantasyStats?.length, statsError })

      // Get aggregated match stats
      const { data: matchStats, error: matchStatsError } = await supabase
        .from('player_match_stats')
        .select('player_id, goals, assists, rating, minutes_played')
        .in('player_id', playersData.map(p => p.id))
        .eq('competition_id', competitionId)
        .eq('status', 'approved')

      console.log('📊 Match stats query result:', { matchStats: matchStats?.length, matchStatsError })

      // Aggregate match stats by player
      const aggregatedStats = matchStats?.reduce((acc, stat) => {
        if (!acc[stat.player_id]) {
          acc[stat.player_id] = {
            goals: 0,
            assists: 0,
            matches_played: 0,
            total_rating: 0,
            average_rating: 0
          }
        }
        
        acc[stat.player_id].goals += stat.goals || 0
        acc[stat.player_id].assists += stat.assists || 0
        
        if (stat.minutes_played && stat.minutes_played > 0) {
          acc[stat.player_id].matches_played += 1
          if (stat.rating) {
            acc[stat.player_id].total_rating += stat.rating
          }
        }
        
        return acc
      }, {} as Record<string, any>) || {}

      // Calculate average ratings
      Object.keys(aggregatedStats).forEach(playerId => {
        const stats = aggregatedStats[playerId]
        if (stats.matches_played > 0) {
          stats.average_rating = stats.total_rating / stats.matches_played
        }
      })

      // Map players with fantasy data and match stats
      const playersWithFantasy = playersData.map(player => {
        const userProfile = userProfiles?.find(up => up.id === player.user_id)
        const team = teamsData?.find(t => t.id === player.team_id)
        
        return {
          ...player,
          fantasy_price: fantasyStats?.find(s => s.player_id === player.id)?.fantasy_price || 5.0,
          fantasy_points: fantasyStats?.find(s => s.player_id === player.id)?.fantasy_points || 0,
          user_profile: userProfile || {
            display_name: 'Unknown Player',
            username: 'unknown',
            avatar_url: undefined
          },
          team: team || {
            id: player.team_id,
            name: 'Unknown Team',
            short_name: 'UNK'
          },
          player_match_stats: aggregatedStats[player.id] || {
            goals: 0,
            assists: 0,
            matches_played: 0,
            average_rating: 0
          }
        }
      })

      console.log('✅ Final players with fantasy data:', playersWithFantasy.length)
      setAllPlayers(playersWithFantasy)

    } catch (error) {
      console.error('💥 Error in loadPlayersForCompetition:', error)
      setAllPlayers([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const filterAndSortPlayers = useCallback(() => {
    let filtered = [...allPlayers]

    // Filter by search query
    if (searchTerm) {
      filtered = filtered.filter(player => 
        player.user_profile?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.user_profile?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.position?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by position
    if (positionFilter !== 'all') {
      filtered = filtered.filter(player => player.position === positionFilter)
    }

    // Filter by team
    if (teamFilter !== 'all') {
      filtered = filtered.filter(player => player.team_id === teamFilter)
    }

    // Sort players
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return (b.fantasy_points || 0) - (a.fantasy_points || 0)
        case 'price':
          return (b.fantasy_price || 0) - (a.fantasy_price || 0)
        case 'goals':
          return (b.player_match_stats?.goals || 0) - (a.player_match_stats?.goals || 0)
        case 'assists':
          return (b.player_match_stats?.assists || 0) - (a.player_match_stats?.assists || 0)
        case 'rating':
          return (b.player_match_stats?.average_rating || 0) - (a.player_match_stats?.average_rating || 0)
        case 'name':
          return (a.user_profile?.display_name || '').localeCompare(b.user_profile?.display_name || '')
        default:
          return 0
      }
    })

    setFilteredPlayers(filtered)
  }, [allPlayers, searchTerm, positionFilter, teamFilter, sortBy])

  useEffect(() => {
    loadFantasyCompetitions()
  }, [loadFantasyCompetitions])

  useEffect(() => {
    if (selectedCompetition) {
      loadPlayersForCompetition(selectedCompetition)
    }
  }, [selectedCompetition, loadPlayersForCompetition])

  useEffect(() => {
    filterAndSortPlayers()
  }, [filterAndSortPlayers])

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'GK': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'DEF': case 'CB': case 'LB': case 'RB': case 'LWB': case 'RWB': 
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'MID': case 'CDM': case 'CM': case 'CAM': case 'LM': case 'RM': 
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'FWD': case 'LW': case 'RW': case 'ST': case 'CF': 
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPlayersByPosition = (position: string) => {
    return filteredPlayers.filter(player => {
      switch (position) {
        case 'GK': return player.position === 'GK'
        case 'DEF': return ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF'].includes(player.position)
        case 'MID': return ['CDM', 'CM', 'CAM', 'LM', 'RM', 'MID'].includes(player.position)
        case 'FWD': return ['LW', 'RW', 'ST', 'CF', 'FWD'].includes(player.position)
        default: return false
      }
    })
  }

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <div className="bg-[#004225] p-4">
        <div className="flex items-center gap-2">
          <Link href="/fantasy" className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">FANTASY PLAYER STATISTICS</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Filters and Search */}
        <Card className="bg-[#1E1E1E] border-gray-800">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black border-gray-700"
                />
              </div>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="bg-black border-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="GK">Goalkeeper</SelectItem>
                  <SelectItem value="DEF">Defender</SelectItem>
                  <SelectItem value="MID">Midfielder</SelectItem>
                  <SelectItem value="FWD">Forward</SelectItem>
                </SelectContent>
              </Select>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="bg-black border-gray-700">
                  <Users className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  <SelectItem value="all">All Clubs</SelectItem>
                  {competitionTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-black border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  <SelectItem value="points">Fantasy Points</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="goals">Goals</SelectItem>
                  <SelectItem value="assists">Assists</SelectItem>
                  <SelectItem value="rating">Average Rating</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {filteredPlayers.length} players found
              </div>
            </div>
          </CardContent>
        </Card>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff87]"></div>
          </div>
        ) : (
          <div className="grid gap-4 mt-6">
            {filteredPlayers.map((player, index) => (
              <Card key={player.id} className="bg-[#1E1E1E] border-gray-800 hover:border-[#00ff87]/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-500">
                        #{index + 1}
                      </div>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={player.user_profile?.avatar_url} />
                        <AvatarFallback className="bg-[#00ff87] text-black">
                          {(player.user_profile?.display_name || player.user_profile?.username || 'P')
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">
                            {player.user_profile?.display_name || player.user_profile?.username}
                          </h3>
                          <Badge className={getPositionColor(player.position)}>
                            {player.position}
                          </Badge>
                          <span className="text-sm text-gray-400">#{player.number}</span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {player.team?.name}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-[#00ff87]">
                          {player.fantasy_points?.toFixed(1) || '0.0'}
                        </div>
                        <div className="text-xs text-gray-400">Points</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-blue-400">
                          ${player.fantasy_price?.toFixed(1) || '5.0'}M
                        </div>
                        <div className="text-xs text-gray-400">Price</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-yellow-400">
                          {player.player_match_stats?.goals || 0}
                        </div>
                        <div className="text-xs text-gray-400">Goals</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-purple-400">
                          {player.player_match_stats?.assists || 0}
                        </div>
                        <div className="text-xs text-gray-400">Assists</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-orange-400">
                          {player.player_match_stats?.average_rating?.toFixed(1) || '0.0'}
                        </div>
                        <div className="text-xs text-gray-400">Rating</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {fantasyCompetitions.length === 0 && !loading && (
          <Card className="bg-[#1E1E1E] border-gray-800">
            <CardContent className="pt-6 text-center">
              <div className="text-gray-400 mb-4">
                <Trophy className="w-12 h-12 mx-auto mb-2" />
                <p>No fantasy-enabled competitions found.</p>
                <p className="text-sm mt-2">
                  Contact an admin to enable fantasy mode for competitions.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 