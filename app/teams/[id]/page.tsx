"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { useSupabase } from '@/components/providers/supabase-provider'
import { PlayerCard } from '@/components/ui/player-card'
import { ManagerCard } from '@/components/ui/manager-card'
import { toast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, ExternalLink, Calendar, MapPin, Trophy, Users, TrendingUp, Shield, Star, Target } from 'lucide-react'
import Image from 'next/image'

interface Team {
  id: string
  name: string
  short_name: string
  logo_url?: string | null
  primary_color?: string
  secondary_color?: string
  founded_date?: string
  home_venue?: string
  description?: string
  website_url?: string
  social_media?: {
    twitter?: string
    instagram?: string
    facebook?: string
  }
  manager?: {
    id: string
    name: string
    nationality?: string
    profile_image_url?: string | null
    stats?: {
      matches_managed: number
      wins: number
      losses: number
      win_percentage: number
    }
  }
  players?: Player[]
  stats?: TeamStats
  achievements?: Achievement[]
}

interface Player {
  id: string
  user_id: string
  name: string
  position: string
  jersey_number: number
  nationality?: string
  profile_image_url?: string | null
  stats?: {
    goals?: number
    assists?: number
    appearances?: number
    rating?: number
    clean_sheets?: number
  }
}

interface TeamStats {
  season: number
  league_position: number
  matches_played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  clean_sheets: number
  form: Array<'W' | 'D' | 'L'>
  home_record: {
    played: number
    wins: number
    draws: number
    losses: number
  }
  away_record: {
    played: number
    wins: number
    draws: number
    losses: number
  }
}

interface Achievement {
  id: string
  title: string
  description: string
  date_achieved: string
  type: 'league' | 'cup' | 'milestone'
  icon_url?: string
}

type TabType = 'overview' | 'squad' | 'stats' | 'matches'

export default function TeamDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showFixtures, setShowFixtures] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [statsSelectedSeason, setStatsSelectedSeason] = useState(1)
  const [showPlayerStats, setShowPlayerStats] = useState(false)
  const [fixtures, setFixtures] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [matchesView, setMatchesView] = useState<'fixtures' | 'results'>('fixtures')
  const [statsView, setStatsView] = useState<'team' | 'players'>('team')
  const [matches, setMatches] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [competitionStats, setCompetitionStats] = useState<any[]>([])
  const [playerStatsFilter, setPlayerStatsFilter] = useState<string>('most_goals')

  // Generate seasons array (1 to 5)
  const seasons = Array.from({ length: 5 }, (_, i) => (i + 1).toString())

  const teamId = params.id as string

  // Smart back navigation function
  const handleBackNavigation = () => {
    try {
      // Check if we have a stored previous page
      if (typeof window !== 'undefined') {
        const previousPage = sessionStorage.getItem('previousPage')
        
        if (previousPage) {
          // Clear the stored page to prevent loops
          sessionStorage.removeItem('previousPage')
          
          // Navigate to the stored previous page
          router.push(previousPage)
          return
        }
        
        // Check referrer as backup
        const referrer = document.referrer
        if (referrer && referrer.startsWith(window.location.origin)) {
          // Extract path from referrer
          const url = new URL(referrer)
          const referrerPath = url.pathname + url.search
          
          // Only navigate back to safe, known routes
          if (referrerPath.startsWith('/competitions/') || 
              referrerPath.startsWith('/teams') || 
              referrerPath === '/competitions') {
            router.push(referrerPath)
            return
          }
        }
      }
    } catch (error) {
      console.error('Error with back navigation:', error)
    }
    
    // Safe fallback to teams page
    router.push('/teams')
  }

  // Store current page when navigating TO this page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer
      if (referrer && referrer.startsWith(window.location.origin)) {
        const url = new URL(referrer)
        const referrerPath = url.pathname + url.search
        sessionStorage.setItem('previousPage', referrerPath)
      }
    }
  }, [])

  const loadTeamDetails = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Loading team details for ID:', teamId)

      // Load team data
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (teamError) {
        console.error('Error loading team:', teamError)
        loadMockTeam()
        return
      }

      if (teamData) {
        // Load manager data
        let managerData = undefined
        if (teamData.manager_id) {
          try {
            const { data: managerProfile, error: managerError } = await supabase
            .from('user_profiles')
              .select('id, username, avatar_url, display_name')
            .eq('id', teamData.manager_id)
              .maybeSingle()

            if (managerError) {
              console.error('Error loading manager:', managerError.message)
            } else if (managerProfile) {
            managerData = {
                id: managerProfile.id,
                name: managerProfile.display_name || managerProfile.username || 'Unknown Manager',
                nationality: undefined,
                profile_image_url: managerProfile.avatar_url,
              stats: {
                matches_managed: 0,
                wins: 0,
                losses: 0,
                win_percentage: 0
              }
            }
            } else {
              console.log('No manager profile found for ID:', teamData.manager_id)
            }
          } catch (error) {
            console.error('Unexpected error loading manager profile:', error instanceof Error ? error.message : 'Unknown error')
          }
        }

        // Load players
        let transformedPlayers: Player[] = []
        try {
          const { data: playersData, error: playersError } = await supabase
            .from('players')
            .select(`
              *,
              user_profiles!players_user_id_fkey(
                id,
                username, 
                avatar_url,
                display_name
              )
            `)
            .eq('team_id', teamId)

          if (playersError) {
            console.error('Error loading players:', playersError.message)
          } else if (playersData) {
            transformedPlayers = playersData.map((player: any) => ({
              id: player.id,
              user_id: player.user_id,
              name: player.user_profiles?.display_name || player.user_profiles?.username || 'Unknown Player',
              position: player.position || 'Unknown',
              jersey_number: player.jersey_number || 0,
              nationality: player.nationality,
              profile_image_url: player.user_profiles?.avatar_url,
              stats: {
                goals: 0,
                assists: 0,
                appearances: 0,
                rating: 0,
                clean_sheets: 0
              }
            }))
          }
        } catch (error) {
          console.error('Unexpected error loading players:', error instanceof Error ? error.message : 'Unknown error')
        }

        const transformedTeam: Team = {
          id: teamData.id,
          name: teamData.name,
          short_name: teamData.name.substring(0, 3).toUpperCase(),
          logo_url: teamData.logo_url,
          manager: managerData,
          players: transformedPlayers,
          stats: getMockStats(), // Use mock stats with form data
          achievements: getMockAchievements() // Add achievements to real teams
        }

        console.log('Team data transformed successfully:', {
          id: transformedTeam.id,
          name: transformedTeam.name,
          has_manager: !!transformedTeam.manager,
          has_logo: !!transformedTeam.logo_url,
          players_count: transformedTeam.players?.length || 0
        })

        setTeam(transformedTeam)
      } else {
        console.log('No team data found, loading mock data')
        loadMockTeam()
      }
    } catch (error) {
      console.error('Unexpected error loading team details:', error)
      loadMockTeam()
    } finally {
      setLoading(false)
    }
  }, [teamId, supabase])

  const loadMockTeam = () => {
    const mockTeam: Team = {
      id: teamId,
      name: "FC Pro Stars",
      short_name: "FPS",
      logo_url: null,
      primary_color: "#004225",
      secondary_color: "#ffffff",
      founded_date: "2020-01-15",
      home_venue: "Pro Stadium",
      description: "A professional esports football club competing in the EA FC Pro Clubs league system.",
      website_url: "https://fcprostars.com",
      social_media: {
        twitter: "@fcprostars",
        instagram: "@fcprostars",
        facebook: "fcprostars"
      },
      manager: {
        id: "manager-1",
        name: "Roberto Martinez",
        nationality: "Spain",
        profile_image_url: null,
        stats: {
          matches_managed: 42,
          wins: 26,
          losses: 6,
          win_percentage: 61.9
        }
      },
      players: getMockPlayers(),
      stats: getMockStats(),
      achievements: getMockAchievements()
    }
    setTeam(mockTeam)
  }

  const getMockPlayers = (): Player[] => [
    {
      id: "player-1",
      user_id: "player-1",
      name: "Alex Thompson",
      position: "FWD",
      jersey_number: 11,
      nationality: "England",
      profile_image_url: null,
      stats: { goals: 16, assists: 8, appearances: 38, rating: 8.2 }
    },
    {
      id: "player-2", 
      user_id: "player-2",
      name: "Marco Silva",
      position: "MID",
      jersey_number: 10,
      nationality: "Portugal",
      profile_image_url: null,
      stats: { goals: 8, assists: 12, appearances: 40, rating: 7.9 }
    },
    {
      id: "player-3",
      user_id: "player-3", 
      name: "James Wilson",
      position: "DEF",
      jersey_number: 4,
      nationality: "Scotland",
      profile_image_url: null,
      stats: { goals: 2, assists: 4, appearances: 38, rating: 7.5 }
    },
    {
      id: "player-4",
      user_id: "player-4",
      name: "David Rodriguez",
      position: "GK",
      jersey_number: 1,
      nationality: "Spain",
      profile_image_url: null,
      stats: { goals: 0, assists: 0, appearances: 35, rating: 8.0 }
    }
  ]

  const getMockStats = (): TeamStats => ({
    season: 1,
    league_position: 3,
    matches_played: 42,
    wins: 26,
    draws: 10,
    losses: 6,
    goals_for: 78,
    goals_against: 35,
    goal_difference: 43,
    points: 88,
    clean_sheets: 18,
    form: ['W', 'W', 'D', 'W', 'L'],
    home_record: {
      played: 21,
      wins: 16,
      draws: 4,
      losses: 1
    },
    away_record: {
      played: 21,
      wins: 10,
      draws: 6,
      losses: 5
    }
  })

  const getMockAchievements = (): Achievement[] => [
    {
      id: "1",
      title: "League Champions",
      description: "Won the Pro Clubs Premier Division",
      date_achieved: "2023-05-20",
      type: "league"
    },
    {
      id: "2", 
      title: "Cup Winners",
      description: "Pro Clubs Cup Champions",
      date_achieved: "2023-03-15",
      type: "cup"
    },
    {
      id: "3",
      title: "100 Goals Milestone",
      description: "Scored 100+ goals in a single season",
      date_achieved: "2024-01-10",
      type: "milestone"
    }
  ]

  const getFormBadge = (result: 'W' | 'D' | 'L') => {
    const colors = {
      W: 'bg-green-600 text-white',
      D: 'bg-yellow-600 text-white', 
      L: 'bg-red-600 text-white'
    }
    return colors[result]
  }

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'league': return <Trophy className="w-5 h-5" />
      case 'cup': return <Star className="w-5 h-5" />
      case 'milestone': return <Target className="w-5 h-5" />
      default: return <Trophy className="w-5 h-5" />
    }
  }

  const loadMatches = useCallback(async () => {
    if (!teamId) return
    
    try {
      const seasonInt = selectedSeason
      console.log('Loading matches for team:', teamId, 'season:', seasonInt)
      
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, logo_url)
        `)
        .eq('season', seasonInt)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('match_date', { ascending: true })

      if (error) {
        console.error('Error loading matches:', error.message)
        return
      }

      console.log('Raw matches data:', matchesData?.length || 0, 'matches found')

      if (matchesData && matchesData.length > 0) {
        const transformedMatches = matchesData.map((match: any) => ({
          id: match.id,
          date: match.match_date,
          home_team: match.home_team?.name || 'Unknown Team',
          away_team: match.away_team?.name || 'Unknown Team',
          home_score: match.home_score,
          away_score: match.away_score,
          status: match.status || 'scheduled'
        }))

        setMatches(transformedMatches)
        console.log('Transformed matches:', transformedMatches.length, 'matches')
      } else {
        console.log('No matches found, setting empty array')
        setMatches([])
      }
    } catch (error) {
      console.error('Unexpected error loading matches:', error instanceof Error ? error.message : 'Unknown error')
      setMatches([])
    }
  }, [teamId, selectedSeason, supabase])

  const loadCompetitions = useCallback(async () => {
    try {
      console.log('Loading competitions...')
      
      const { data: competitionsData, error } = await supabase
        .from('competitions')
        .select('id, name, type, status')
        .order('name')

      if (error) {
        console.error('Error loading competitions:', error.message)
        return
      }

      if (competitionsData) {
        setCompetitions(competitionsData)
        console.log('Loaded competitions:', competitionsData.length)
      }
    } catch (error) {
      console.error('Unexpected error loading competitions:', error instanceof Error ? error.message : 'Unknown error')
    }
  }, [supabase])

  const loadStatsBySeasonAndCompetition = useCallback(async () => {
    try {
      console.log('Loading stats for team:', teamId, 'season:', statsSelectedSeason)
      
      // Load matches for the season
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('id, competition_id, home_team_id, away_team_id, match_date, status, home_score, away_score')
        .eq('season', statsSelectedSeason)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .eq('status', 'finished')

      if (matchesError) {
        console.error('Error loading stats matches:', matchesError.message)
        return []
      }

      // Group matches by competition
      const matchesByCompetition = new Map()
      
      matchesData?.forEach(match => {
        if (!matchesByCompetition.has(match.competition_id)) {
          matchesByCompetition.set(match.competition_id, [])
        }
        matchesByCompetition.get(match.competition_id).push(match)
      })

      // Calculate stats for each competition
      const competitionStatsResult = []
      for (const [competitionId, competitionMatches] of matchesByCompetition) {
        const competition = competitions.find(c => c.id === competitionId)
        
        let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0

        competitionMatches.forEach((match: any) => {
          const isHome = match.home_team_id === teamId
          const teamScore = isHome ? match.home_score : match.away_score
          const opponentScore = isHome ? match.away_score : match.home_score

          goalsFor += teamScore || 0
          goalsAgainst += opponentScore || 0

          if (teamScore > opponentScore) wins++
          else if (teamScore < opponentScore) losses++
          else draws++
        })

        competitionStatsResult.push({
          competition: competition?.name || 'Unknown Competition',
          matches_played: competitionMatches.length,
          wins,
          draws,
          losses,
          goals_for: goalsFor,
          goals_against: goalsAgainst,
          goal_difference: goalsFor - goalsAgainst,
          points: wins * 3 + draws
        })
      }

      return competitionStatsResult
    } catch (error) {
      console.error('Error loading stats by season and competition:', error instanceof Error ? error.message : 'Unknown error')
      return []
    }
  }, [teamId, statsSelectedSeason, competitions, supabase])

  // Add a function to sort players based on the selected filter
  const getSortedPlayers = () => {
    if (!team || !team.players) return []
    const players = [...team.players]
    switch (playerStatsFilter) {
      case 'most_goals':
        return players.sort((a, b) => (b.stats?.goals ?? 0) - (a.stats?.goals ?? 0))
      case 'most_assists':
        return players.sort((a, b) => (b.stats?.assists ?? 0) - (a.stats?.assists ?? 0))
      case 'most_clean_sheets':
        return players.sort((a, b) => (b.stats?.clean_sheets ?? 0) - (a.stats?.clean_sheets ?? 0))
      case 'most_matches':
        return players.sort((a, b) => (b.stats?.appearances ?? 0) - (a.stats?.appearances ?? 0))
      case 'highest_rating':
        return players.sort((a, b) => (b.stats?.rating ?? 0) - (a.stats?.rating ?? 0))
      default:
        return players
    }
  }

  useEffect(() => {
    if (teamId) {
      loadTeamDetails()
      loadMatches()
      loadCompetitions()
    }
  }, [teamId, selectedSeason, loadTeamDetails, loadMatches, loadCompetitions])

  useEffect(() => {
    if (teamId && competitions.length > 0) {
      const loadStats = async () => {
        const stats = await loadStatsBySeasonAndCompetition()
        setCompetitionStats(stats || [])
      }
      loadStats()
    }
  }, [teamId, statsSelectedSeason, competitions, loadStatsBySeasonAndCompetition])

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
          <div className="bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                TEAM DETAILS
              </h1>
              <p className="text-green-200/80">Loading team information...</p>
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Shield className="w-8 h-8 text-green-500/50" />
            </div>
            <p className="text-gray-400">Loading team details...</p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  if (!team) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-gray-500/50" />
            </div>
            <p className="text-gray-400">Team not found</p>
            <Button 
              onClick={handleBackNavigation}
              className="mt-4 bg-gradient-to-r from-green-600 to-green-700"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
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
                  onClick={handleBackNavigation}
                  className="border-green-600/50 text-green-400 hover:bg-green-600/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
                <div className="flex items-center gap-4">
                  {team.logo_url && (
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                      <Image
                        src={team.logo_url}
                        alt={team.name}
                        width={56}
                        height={56}
                        className="rounded-xl object-cover"
                      />
                  </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                      {team.name}
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                      {team.short_name && (
                        <Badge variant="outline" className="border-green-400/50 text-green-400 bg-green-400/20">
                          {team.short_name}
                      </Badge>
                      )}
                      {team.founded_date && (
                        <span className="text-green-200/80">Founded {team.founded_date}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                  {team.website_url && (
                  <Button variant="outline" className="border-green-600/50 text-green-400 hover:bg-green-600/20">
                    <ExternalLink className="h-4 w-4 mr-2" />
                      Website
                    </Button>
                  )}
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
                variant={activeTab === 'squad' ? 'default' : 'ghost'}
                className={activeTab === 'squad' 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-green-300 hover:bg-green-600/10'
                }
                onClick={() => setActiveTab('squad')}
              >
                Squad
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
                variant={activeTab === 'stats' ? 'default' : 'ghost'}
                className={activeTab === 'stats' 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-green-300 hover:bg-green-600/10'
                }
                onClick={() => setActiveTab('stats')}
              >
                Statistics
              </Button>
            </div>
          </div>

          {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
              {/* Team Stats Overview */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-100">Squad Size</CardTitle>
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                      <Users className="h-4 w-4 text-white" />
                      </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">{team.players?.length || 0}</div>
                    <p className="text-xs text-gray-400">Active players</p>
                  </CardContent>
                </Card>
                {team.stats && (
                  <>
                    <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-100">League Position</CardTitle>
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                          <Trophy className="h-4 w-4 text-white" />
                      </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-400">{team.stats.league_position}</div>
                        <p className="text-xs text-gray-400">Current position</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-100">Points</CardTitle>
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                          <Target className="h-4 w-4 text-white" />
                      </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-400">{team.stats.points}</div>
                        <p className="text-xs text-gray-400">Total points</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-100">Win Rate</CardTitle>
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                          <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-400">
                          {team.stats.matches_played > 0 ? Math.round((team.stats.wins / team.stats.matches_played) * 100) : 0}%
                        </div>
                        <p className="text-xs text-gray-400">Win percentage</p>
                      </CardContent>
                    </Card>
                  </>
                )}
                </div>

                {/* Manager Card */}
                {team.manager && (
                <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-green-100 flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-400" />
                      Manager
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {team.manager && <ManagerCard manager={team.manager} />}
                  </CardContent>
                </Card>
              )}

              {/* Recent Form */}
              {team.stats && team.stats.form && team.stats.form.length > 0 && (
                <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-green-100 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Recent Form
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Last 5 matches:</span>
                        <div className="flex gap-1">
                          {team.stats.form.map((result, index) => (
                            <div
                              key={index}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getFormBadge(result)}`}
                            >
                              {result}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Home vs Away Record */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 p-3 rounded-lg border border-gray-700/30">
                          <h5 className="font-semibold text-green-100 mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Home Record
                          </h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Played:</span>
                              <span className="text-white">{team.stats.home_record.played}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Won:</span>
                              <span className="text-green-400">{team.stats.home_record.wins}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Drawn:</span>
                              <span className="text-yellow-400">{team.stats.home_record.draws}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Lost:</span>
                              <span className="text-red-400">{team.stats.home_record.losses}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 p-3 rounded-lg border border-gray-700/30">
                          <h5 className="font-semibold text-green-100 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Away Record
                          </h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Played:</span>
                              <span className="text-white">{team.stats.away_record.played}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Won:</span>
                              <span className="text-green-400">{team.stats.away_record.wins}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Drawn:</span>
                              <span className="text-yellow-400">{team.stats.away_record.draws}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Lost:</span>
                              <span className="text-red-400">{team.stats.away_record.losses}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Trophies and Achievements */}
              {team.achievements && team.achievements.length > 0 && (
                <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-green-100 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-green-400" />
                      Trophies & Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {team.achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 p-4 rounded-lg border border-gray-700/30 hover:border-green-600/40 transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              {getAchievementIcon(achievement.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white mb-1">{achievement.title}</h4>
                              <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={
                                    achievement.type === 'league' ? 'border-blue-400/50 text-blue-400 bg-blue-400/20' :
                                    achievement.type === 'cup' ? 'border-yellow-400/50 text-yellow-400 bg-yellow-400/20' :
                                    'border-purple-400/50 text-purple-400 bg-purple-400/20'
                                  }
                                >
                                  {achievement.type.charAt(0).toUpperCase() + achievement.type.slice(1)}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(achievement.date_achieved).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Team Description */}
              {team.description && (
                <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-green-100">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{team.description}</p>
                  </CardContent>
                </Card>
                )}
              </div>
            )}

          {/* Squad Tab */}
            {activeTab === 'squad' && (
              <div className="space-y-6">
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    Squad ({team.players?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(team.players && team.players.length > 0) ? (
                    <div className="flex flex-col gap-4">
                      {team.players.map((player) => (
                        <PlayerCard key={player.id} player={player} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-500/50" />
                      </div>
                      <p className="text-gray-400">No players found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
              <div className="space-y-6">
              {/* Stats Controls */}
              <div className="flex gap-4 items-center">
                <Select value={statsSelectedSeason.toString()} onValueChange={(value) => setStatsSelectedSeason(parseInt(value))}>
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
                
                <div className="flex bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 p-1 rounded-lg">
                  <Button
                    variant={statsView === 'team' ? 'default' : 'ghost'}
                    className={statsView === 'team' 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' 
                      : 'text-gray-300 hover:text-green-300'
                    }
                    onClick={() => setStatsView('team')}
                  >
                    Team Stats
                  </Button>
                  <Button
                    variant={statsView === 'players' ? 'default' : 'ghost'}
                    className={statsView === 'players' 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' 
                      : 'text-gray-300 hover:text-green-300'
                    }
                    onClick={() => setStatsView('players')}
                  >
                    Player Stats
                  </Button>
                </div>
              </div>

              {/* Team Statistics Display */}
              {statsView === 'team' && team.stats && (
                <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-green-100 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-green-400" />
                      Season Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Matches Played</p>
                        <p className="text-2xl font-bold text-green-400">{team.stats.matches_played}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Wins</p>
                        <p className="text-2xl font-bold text-green-400">{team.stats.wins}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Draws</p>
                        <p className="text-2xl font-bold text-gray-300">{team.stats.draws}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Losses</p>
                        <p className="text-2xl font-bold text-red-400">{team.stats.losses}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Goals For</p>
                        <p className="text-2xl font-bold text-green-400">{team.stats.goals_for}</p>
                    </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Goals Against</p>
                        <p className="text-2xl font-bold text-red-400">{team.stats.goals_against}</p>
                  </div>
                </div>
                  </CardContent>
                </Card>
              )}
              {statsView === 'players' && team && team.players && team.players.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Select value={playerStatsFilter} onValueChange={setPlayerStatsFilter}>
                      <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700/30 text-green-100">
                        <SelectValue placeholder="Filter by stats" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="most_goals" className="text-green-100 hover:bg-green-600/20">Most Goals</SelectItem>
                        <SelectItem value="most_assists" className="text-green-100 hover:bg-green-600/20">Most Assists</SelectItem>
                        <SelectItem value="most_clean_sheets" className="text-green-100 hover:bg-green-600/20">Most Clean Sheets</SelectItem>
                        <SelectItem value="most_matches" className="text-green-100 hover:bg-green-600/20">Most Matches Played</SelectItem>
                        <SelectItem value="highest_rating" className="text-green-100 hover:bg-green-600/20">Highest Match Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-4">
                    {getSortedPlayers().map((player) => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        showPlayerStats={true}
                      />
                    ))}
                  </div>
                </div>
              )}
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
                  {matches.length > 0 ? (
                  <div className="space-y-4">
                      {matches.map((match) => (
                        <div
                          key={match.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700/30 hover:border-green-600/40 transition-all"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-green-100">
                              {match.home_team} vs {match.away_team}
                            </div>
                            <Badge className="border-blue-400/50 text-blue-400 bg-blue-400/20">
                              {match.status}
                            </Badge>
                          </div>
                          <div className="text-gray-400 text-sm">
                            {new Date(match.date).toLocaleDateString()}
                          </div>
                        </div>
                    ))}
                  </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-500/50" />
                </div>
                      <p className="text-gray-400">
                        No {matchesView === 'fixtures' ? 'fixtures' : 'results'} found
                      </p>
              </div>
            )}
                </CardContent>
              </Card>
          </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  )
} 