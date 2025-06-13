"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { useSupabase } from '@/components/providers/supabase-provider'
import { toast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, ExternalLink, Calendar, MapPin, Trophy, Target, Shield, Activity, User, Award } from 'lucide-react'
import Image from 'next/image'

interface Player {
  id: string
  name: string
  position: string
  jersey_number: number
  nationality?: string
  date_of_birth?: string
  age?: number
  height?: string
  weight?: string
  preferred_foot?: string
  debut_date?: string
  profile_image_url?: string | null
  team_id: string
  stats?: PlayerStats
  trophies?: Trophy[]
  achievements?: Achievement[]
}

interface PlayerStats {
  season: number
  appearances: number
  goals: number
  assists: number
  wins: number
  losses: number
  draws: number
  clean_sheets: number
  red_cards: number
  possession_won: number
}

interface Trophy {
  id: string
  name: string
  season: number
  competition: string
  icon_url?: string | null
}

interface Achievement {
  id: string
  title: string
  description: string
  date_achieved: string
  type: 'milestone' | 'award' | 'record'
  icon_url?: string | null
}

type TabType = 'overview' | 'matches' | 'statistics'

export default function PlayerDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'statistics'>('overview')
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [matchesView, setMatchesView] = useState<'fixtures' | 'results'>('fixtures')
  const [fixtures, setFixtures] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const competitionId = '3a4522a5-83fa-4446-9c04-81be1eff094b' // Use the same competition ID as in the team details page
  const [trophies, setTrophies] = useState<Trophy[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])

  const seasons = Array.from({ length: 5 }, (_, i) => i + 1)

  const playerId = params.id as string

  useEffect(() => {
    if (playerId) {
      loadPlayerDetails()
    }
  }, [playerId, selectedSeason])

  useEffect(() => {
    const loadFixturesAndResults = async () => {
      if (!player?.team_id) return
      try {
        const { data: fixturesData, error: fixturesError } = await supabase
          .from('fixtures')
          .select('*')
          .eq('competition_id', competitionId)
          .eq('home_team_id', player.team_id)
          .or(`away_team_id.eq.${player.team_id}`)
          .order('date', { ascending: true })

        if (fixturesError) throw fixturesError
        setFixtures(fixturesData || [])

        const { data: resultsData, error: resultsError } = await supabase
          .from('results')
          .select('*')
          .eq('competition_id', competitionId)
          .eq('home_team_id', player.team_id)
          .or(`away_team_id.eq.${player.team_id}`)
          .order('date', { ascending: false })

        if (resultsError) throw resultsError
        setResults(resultsData || [])
      } catch (error: any) {
        console.error('Error loading fixtures and results:', error.message || error)
      }
    }

    loadFixturesAndResults()
  }, [player?.team_id, competitionId, supabase])

  useEffect(() => {
    const loadTrophiesAndAchievements = async () => {
      if (!player?.id) return
      try {
        const { data: trophiesData, error: trophiesError } = await supabase
          .from('trophies')
          .select('*')
          .eq('player_id', player.id)
          .order('season', { ascending: false })

        if (trophiesError) throw trophiesError
        setTrophies(trophiesData || [])

        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .eq('player_id', player.id)
          .order('date_achieved', { ascending: false })

        if (achievementsError) throw achievementsError
        setAchievements(achievementsData || [])
      } catch (error: any) {
        console.error('Error loading trophies and achievements:', error.message || error)
      }
    }

    loadTrophiesAndAchievements()
  }, [player?.id, supabase])

  const loadPlayerDetails = async () => {
    try {
      setLoading(true)

      // First, get the player data
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select(`
          id,
          position,
          number,
          status,
          user_id,
          team_id
        `)
        .eq('id', playerId)
        .maybeSingle() // Use maybeSingle instead of single to avoid errors when no data

      if (playerError) {
        console.error('Error loading player:', playerError)
        loadMockPlayer()
        return
      }

      if (!playerData) {
        // No player found, use mock data
        console.log('No player found with ID:', playerId, 'Using mock data')
        loadMockPlayer()
        return
      }

      // Get team data separately
      let teamData = null
      if (playerData.team_id) {
        const { data: team } = await supabase
          .from('teams')
          .select('id, name, logo_url')
          .eq('id', playerData.team_id)
          .single()
        
        teamData = team
      }

      // Get user profile data separately since user_id references auth.users, not user_profiles
      let userProfile = null
      if (playerData.user_id) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('display_name, username, avatar_url')
          .eq('id', playerData.user_id)
          .single()
        
        userProfile = profileData
      }

      // Get player match statistics
      const playerStats = await getPlayerStatistics(playerData.id, selectedSeason)

      // Transform the data to match our interface
      const transformedPlayer = {
        id: playerData.id,
        name: userProfile?.display_name || userProfile?.username || 'Unknown Player',
        position: playerData.position,
        jersey_number: playerData.number,
        nationality: undefined, // Not available in current schema
        date_of_birth: undefined, // Not available in current schema
        age: undefined,
        height: undefined, // Not available in current schema
        weight: undefined, // Not available in current schema
        preferred_foot: undefined, // Not available in current schema
        debut_date: undefined, // Not available in current schema
        profile_image_url: userProfile?.avatar_url,
        team_id: playerData.team_id,
        stats: playerStats,
        trophies: [],
        achievements: []
      }

      setPlayer(transformedPlayer)

    } catch (error) {
      console.error('Error loading player details:', error)
      loadMockPlayer()
    } finally {
      setLoading(false)
    }
  }

  const getPlayerStatistics = async (playerId: string, season: number) => {
    try {
      const { data: statsData, error: statsError } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_id', playerId)
        .eq('season', season)
        .single()

      if (statsError) {
        console.error('Error loading player stats:', statsError.message || statsError)
        return getEmptyStats(season)
      }

      return statsData || getEmptyStats(season)
    } catch (error: any) {
      console.error('Error loading player stats:', error.message || error)
      return getEmptyStats(season)
    }
  }

  const getEmptyStats = (season: number): PlayerStats => ({
    season: season,
    appearances: 0,
    goals: 0,
    assists: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    clean_sheets: 0,
    red_cards: 0,
    possession_won: 0
  })

  const loadMockPlayer = () => {
    const mockPlayer: Player = {
      id: playerId,
      name: "Alex Thompson",
      position: "Forward",
      jersey_number: 11,
      nationality: "England",
      date_of_birth: "1995-12-30",
      age: 29,
      height: "185cm",
      weight: "75kg",
      preferred_foot: "Right",
      debut_date: "2020-09-21",
      profile_image_url: null,
      team_id: "1",
      stats: getEmptyStats(selectedSeason),
      trophies: [],
      achievements: []
    }
    setPlayer(mockPlayer)
  }

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getCountryFlag = (nationality: string) => {
    const flags: { [key: string]: string } = {
      'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Scotland': '🏴󠁧󠁳󠁣󠁴󠁿',
      'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      'Ireland': '🇮🇪',
      'France': '🇫🇷',
      'Spain': '🇪🇸',
      'Germany': '🇩🇪',
      'Italy': '🇮🇹',
      'Brazil': '🇧🇷',
      'Argentina': '🇦🇷'
    }
    return flags[nationality] || '🌍'
  }

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
          <div className="bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                PLAYER DETAILS
              </h1>
              <p className="text-green-200/80">Loading player information...</p>
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Target className="w-8 h-8 text-green-500/50" />
            </div>
            <p className="text-gray-400">Loading player details...</p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  if (!player) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-500/50" />
            </div>
            <p className="text-gray-400">Player not found</p>
            <Button 
              onClick={() => router.push('/players')}
              className="mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Players
            </Button>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        
        {/* Enhanced Header */}
        <div className="relative z-10 bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/players')}
                  className="border-green-600/50 text-green-400 hover:bg-green-600/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-4">
                  {player.profile_image_url && (
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                      <Image
                        src={player.profile_image_url}
                        alt={player.name}
                        width={56}
                        height={56}
                        className="rounded-xl object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                      {player.name}
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline" className="border-green-400/50 text-green-400 bg-green-400/20">
                        {player.position}
                      </Badge>
                      {player.jersey_number && (
                        <Badge variant="outline" className="border-blue-400/50 text-blue-400 bg-blue-400/20">
                          #{player.jersey_number}
                        </Badge>
                      )}
                      {player.nationality && (
                        <span className="text-green-200/80 flex items-center gap-1">
                          {getCountryFlag(player.nationality)}
                          {player.nationality}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex gap-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 p-1 rounded-lg">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                className={activeTab === 'overview' 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-green-300 hover:bg-green-600/10'
                }
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </Button>
              <Button
                variant={activeTab === 'matches' ? 'default' : 'ghost'}
                className={activeTab === 'matches' 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-green-300 hover:bg-green-600/10'
                }
                onClick={() => setActiveTab('matches')}
              >
                Matches
              </Button>
              <Button
                variant={activeTab === 'statistics' ? 'default' : 'ghost'}
                className={activeTab === 'statistics' 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-green-300 hover:bg-green-600/10'
                }
                onClick={() => setActiveTab('statistics')}
              >
                Statistics
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Player Stats Overview */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {player.stats && (
                  <>
                    <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-100">Appearances</CardTitle>
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                          <Activity className="h-4 w-4 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-400">{player.stats.appearances}</div>
                        <p className="text-xs text-gray-400">Matches played</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-100">Goals</CardTitle>
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                          <Target className="h-4 w-4 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-400">{player.stats.goals}</div>
                        <p className="text-xs text-gray-400">Total goals</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-100">Assists</CardTitle>
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-400">{player.stats.assists}</div>
                        <p className="text-xs text-gray-400">Total assists</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-100">Clean Sheets</CardTitle>
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-400">{player.stats.clean_sheets}</div>
                        <p className="text-xs text-gray-400">Clean sheets</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Player Information */}
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-100 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-400" />
                    Player Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                        <span className="text-gray-400">Name</span>
                        <span className="text-green-100 font-medium">{player.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                        <span className="text-gray-400">Position</span>
                        <span className="text-green-100 font-medium">{player.position}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                        <span className="text-gray-400">Jersey Number</span>
                        <span className="text-green-100 font-medium">{player.jersey_number}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                        <span className="text-gray-400">Nationality</span>
                        <span className="text-green-100 font-medium">{player.nationality || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                        <span className="text-gray-400">Team</span>
                        <span className="text-green-100 font-medium">{player.team_id}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trophies and Achievements */}
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-100 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-green-400" />
                    Trophies and Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Trophies */}
                    <div>
                      <h3 className="text-lg font-semibold text-green-100 mb-4">Trophies</h3>
                      {trophies.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {trophies.map((trophy) => (
                            <div
                              key={trophy.id}
                              className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700/30 hover:border-green-600/40 transition-all"
                            >
                              {trophy.icon_url ? (
                                <Image
                                  src={trophy.icon_url}
                                  alt={trophy.name}
                                  width={48}
                                  height={48}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                  <Trophy className="w-6 h-6 text-white" />
                                </div>
                              )}
                              <div>
                                <h4 className="text-green-100 font-medium">{trophy.name}</h4>
                                <p className="text-sm text-gray-400">{trophy.competition} - Season {trophy.season}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-8 h-8 text-gray-500/50" />
                          </div>
                          <p className="text-gray-400">No trophies found</p>
                        </div>
                      )}
                    </div>

                    {/* Achievements */}
                    <div>
                      <h3 className="text-lg font-semibold text-green-100 mb-4">Achievements</h3>
                      {achievements.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {achievements.map((achievement) => (
                            <div
                              key={achievement.id}
                              className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700/30 hover:border-green-600/40 transition-all"
                            >
                              {achievement.icon_url ? (
                                <Image
                                  src={achievement.icon_url}
                                  alt={achievement.title}
                                  width={48}
                                  height={48}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                  <Award className="w-6 h-6 text-white" />
                                </div>
                              )}
                              <div>
                                <h4 className="text-green-100 font-medium">{achievement.title}</h4>
                                <p className="text-sm text-gray-400">{achievement.description}</p>
                                <p className="text-xs text-gray-500 mt-1">{new Date(achievement.date_achieved).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-8 h-8 text-gray-500/50" />
                          </div>
                          <p className="text-gray-400">No achievements found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                <div className="flex bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 p-1 rounded-lg">
                  <Button
                    variant={matchesView === 'fixtures' ? 'default' : 'ghost'}
                    className={matchesView === 'fixtures' 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' 
                      : 'text-gray-300 hover:text-green-300'
                    }
                    onClick={() => setMatchesView('fixtures')}
                  >
                    Fixtures
                  </Button>
                  <Button
                    variant={matchesView === 'results' ? 'default' : 'ghost'}
                    className={matchesView === 'results' 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' 
                      : 'text-gray-300 hover:text-green-300'
                    }
                    onClick={() => setMatchesView('results')}
                  >
                    Results
                  </Button>
                </div>
              </div>

              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-400" />
                    {matchesView === 'fixtures' ? 'Upcoming Fixtures' : 'Recent Results'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {matchesView === 'fixtures' ? (
                    fixtures.length > 0 ? (
                      <div className="space-y-4">
                        {fixtures.map((fixture) => (
                          <div
                            key={fixture.id}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700/30 hover:border-green-600/40 transition-all"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="text-sm text-green-100">
                                {fixture.home_team} vs {fixture.away_team}
                              </div>
                              <Badge className="border-blue-400/50 text-blue-400 bg-blue-400/20">
                                {fixture.status}
                              </Badge>
                            </div>
                            <div className="text-gray-400 text-sm">
                              {new Date(fixture.date).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-8 h-8 text-gray-500/50" />
                        </div>
                        <p className="text-gray-400">No fixtures found</p>
                      </div>
                    )
                  ) : (
                    results.length > 0 ? (
                      <div className="space-y-4">
                        {results.map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700/30 hover:border-green-600/40 transition-all"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="text-sm text-green-100">
                                {result.home_team} vs {result.away_team}
                              </div>
                              <Badge className="border-blue-400/50 text-blue-400 bg-blue-400/20">
                                {result.status}
                              </Badge>
                            </div>
                            <div className="text-gray-400 text-sm">
                              {new Date(result.date).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-8 h-8 text-gray-500/50" />
                        </div>
                        <p className="text-gray-400">No results found</p>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              {/* Season Selector */}
              <div className="flex justify-end">
                <Select value={selectedSeason.toString()} onValueChange={(value) => setSelectedSeason(parseInt(value))}>
                  <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700/30 text-green-100">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {seasons.map((season) => (
                      <SelectItem key={season} value={season.toString()} className="text-green-100 hover:bg-green-600/20">
                        Season {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Detailed Statistics */}
              {player.stats && (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Offensive Stats */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold text-gray-200">Offensive Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Goals</span>
                          <span className="text-green-100 font-bold">{player.stats.goals}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Assists</span>
                          <span className="text-green-100 font-bold">{player.stats.assists}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Defensive Stats */}
                  <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-green-100 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        Defensive Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Clean Sheets</p>
                          <p className="text-2xl font-bold text-green-400">{player.stats?.clean_sheets || 0}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Possession Won</p>
                          <p className="text-2xl font-bold text-green-400">{player.stats?.possession_won || 0}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Red Cards</p>
                          <p className="text-2xl font-bold text-red-400">{player.stats?.red_cards || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* General Stats */}
                  <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-green-100 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-green-400" />
                        General Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Appearances</span>
                          <span className="text-green-100 font-bold">{player.stats.appearances}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Wins</span>
                          <span className="text-green-400 font-bold">{player.stats.wins}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Draws</span>
                          <span className="text-gray-300 font-bold">{player.stats.draws}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Losses</span>
                          <span className="text-red-400 font-bold">{player.stats.losses}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  )
} 