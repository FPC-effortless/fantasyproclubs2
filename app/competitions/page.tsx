"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Trophy, Users, UserCog, Award, ArrowRightLeft, FileText, Search, ChevronRight, Calendar, BarChart3, Table, TrendingUp, Shield, ArrowLeftRight, User, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/components/providers/supabase-provider"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import styles from "./competitions.module.css"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface Competition {
  id: string
  name: string
  type: string
  status: string
  primary_color?: string
  secondary_color?: string
}

interface Fixture {
  id: string
  home_team: {
    name: string
    logo_url: string | null
  }
  away_team: {
    name: string
    logo_url: string | null
  }
  match_date: string
  status: string
  home_team_stats: any
  away_team_stats: any
}

interface CompetitionStats {
  totalClubs: number
  totalPlayers: number
  totalManagers: number
  topScorer: { name: string; goals: number } | null
  primary_color?: string
  secondary_color?: string
}

interface CompetitionData {
  liveMatches: number
  upcomingMatches: number
  completedMatches: number
  latestResult: { homeTeam: string; awayTeam: string; homeScore: number; awayScore: number } | null
  leaderTeam: string | null
  totalTeams: number
  competitionTopScorer: { name: string; goals: number } | null
  primary_color?: string
  secondary_color?: string
}

export default function CompetitionsPage() {
  const { supabase } = useSupabase()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCompetition')
    }
    return null
  })
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [competitionStats, setCompetitionStats] = useState<CompetitionStats>({
    totalClubs: 0,
    totalPlayers: 0,
    totalManagers: 0,
    topScorer: null
  })
  const [competitionData, setCompetitionData] = useState<CompetitionData>({
    liveMatches: 0,
    upcomingMatches: 0,
    completedMatches: 0,
    latestResult: null,
    leaderTeam: null,
    totalTeams: 0,
    competitionTopScorer: null
  })
  const [loading, setLoading] = useState(true)

  // Custom function to handle competition selection and persist to localStorage
  const handleCompetitionSelection = (competitionId: string) => {
    setSelectedCompetition(competitionId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCompetition', competitionId)
    }
  }

  // Custom ordering function for competitions
  const getOrderedCompetitions = (competitions: Competition[]) => {
    const priorityCompetitions: Competition[] = []
    const otherCompetitions: Competition[] = []
    
    const priorityOrder = ['Nigeria Pro Club League', 'Nigeria Championship League', 'Effortless Community Cup']
    
    competitions.forEach(comp => {
      if (priorityOrder.includes(comp.name)) {
        priorityCompetitions.push(comp)
      } else {
        otherCompetitions.push(comp)
      }
    })
    
    // Sort priority competitions by their priority order
    priorityCompetitions.sort((a, b) => 
      priorityOrder.indexOf(a.name) - priorityOrder.indexOf(b.name)
    )
    
    return [...priorityCompetitions, ...otherCompetitions]
  }

  const loadCompetitions = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Loading competitions...')
      
      // First check what columns are available
      const { data: tableInfo, error: tableError } = await supabase
        .from('competitions')
        .select('*')
        .limit(1)
      
      console.log('Table structure:', tableInfo)
      
      if (tableError) {
        console.error('Table check error:', tableError)
        throw tableError
      }

      // Now try to get only the columns we know exist
      const { data, error } = await supabase
        .from('competitions')
        .select('id, name, type, status')
      
      console.log('Full query result:', { data, error })

      if (error) {
        console.error('Error loading competitions:', error)
        throw error
      }

      if (!data || data.length === 0) {
        console.log('No competitions found in the database')
      } else {
        console.log('Found competitions:', data)
      }

      const orderedData = getOrderedCompetitions(data || [])
      setCompetitions(orderedData)
      if (orderedData && orderedData.length > 0 && !selectedCompetition) {
        handleCompetitionSelection(orderedData[0].id)
      }
    } catch (error: any) {
      console.error('Error in loadCompetitions:', error)
      toast({
        title: "Error loading competitions",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, selectedCompetition])

  const loadFixtures = useCallback(async (competitionId: string) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          status,
          home_team_stats,
          away_team_stats,
          home_team:teams!home_team_id (
            name,
            logo_url
          ),
          away_team:teams!away_team_id (
            name,
            logo_url
          )
        `)
        .eq('competition_id', competitionId)
        .order('match_date', { ascending: true })
        .limit(5)

      if (error) throw error
      
      // Transform the data to match the Fixture type with better error handling
      const transformedData = (data || []).map(match => {
        // Handle both array and object formats for team data
        const homeTeam = Array.isArray(match.home_team) ? match.home_team[0] : match.home_team
        const awayTeam = Array.isArray(match.away_team) ? match.away_team[0] : match.away_team
        
        return {
          id: match.id,
          match_date: match.match_date,
          status: match.status,
          home_team_stats: match.home_team_stats,
          away_team_stats: match.away_team_stats,
          home_team: {
            name: homeTeam?.name || 'TBD',
            logo_url: homeTeam?.logo_url || null
          },
          away_team: {
            name: awayTeam?.name || 'TBD',
            logo_url: awayTeam?.logo_url || null
          }
        }
      })
      
      setFixtures(transformedData)
    } catch (error: any) {
      console.error('Error loading fixtures:', error)
    }
  }, [supabase])

  // Fetch real competition stats and overview data
  const loadCompetitionStats = useCallback(async (competitionId: string) => {
    try {
      // Total clubs
      const { data: clubsData, error: clubsError } = await supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', competitionId)
      const totalClubs = clubsData ? clubsData.length : 0

      // Total players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id')
        .eq('competition_id', competitionId)
      const totalPlayers = playersData ? playersData.length : 0

      // Total managers
      const { data: managersData, error: managersError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_type', 'manager')
        .eq('competition_id', competitionId)
      const totalManagers = managersData ? managersData.length : 0

      // Top scorer
      const { data: topScorerData, error: topScorerError } = await supabase
        .from('player_stats')
        .select('player_id, goals')
        .eq('competition_id', competitionId)
        .order('goals', { ascending: false })
        .limit(1)
      let topScorer = null
      if (topScorerData && topScorerData.length > 0) {
        // Get player name
        const { data: playerProfile } = await supabase
          .from('players')
          .select('user_profile: user_profile_id (display_name)')
          .eq('id', topScorerData[0].player_id)
          .single()
        topScorer = {
          name: Array.isArray(playerProfile?.user_profile)
            ? (playerProfile.user_profile as any[])[0]?.display_name || 'Top Scorer'
            : playerProfile?.user_profile?.display_name || 'Top Scorer',
          goals: topScorerData[0].goals
        }
      }

      setCompetitionStats({
        totalClubs,
        totalPlayers,
        totalManagers,
        topScorer
      })

      // Overview data: live, upcoming, completed matches, leader, total teams, latest result
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('id, status, home_team_id, away_team_id, home_team_score, away_team_score, match_date')
        .eq('competition_id', competitionId)

      let liveMatches = 0, upcomingMatches = 0, completedMatches = 0, latestResult = null
      if (matchesData) {
        liveMatches = matchesData.filter(m => m.status === 'active').length
        upcomingMatches = matchesData.filter(m => m.status === 'upcoming').length
        completedMatches = matchesData.filter(m => m.status === 'completed').length
        // Latest completed match
        const completed = matchesData.filter(m => m.status === 'completed')
        if (completed.length > 0) {
          const latest = completed.sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())[0]
          // Get team names
          const { data: homeTeam } = await supabase.from('teams').select('name').eq('id', latest.home_team_id).single()
          const { data: awayTeam } = await supabase.from('teams').select('name').eq('id', latest.away_team_id).single()
          latestResult = {
            homeTeam: homeTeam?.name || 'Home',
            awayTeam: awayTeam?.name || 'Away',
            homeScore: latest.home_team_score,
            awayScore: latest.away_team_score
          }
        }
      }

      // Leader team (most points in league table)
      const { data: tableData, error: tableError } = await supabase
        .from('league_table')
        .select('team_id, points')
        .eq('competition_id', competitionId)
        .order('points', { ascending: false })
        .limit(1)
      let leaderTeam = null, totalTeams = 0
      if (tableData && tableData.length > 0) {
        const { data: teamData } = await supabase.from('teams').select('name').eq('id', tableData[0].team_id).single()
        leaderTeam = teamData?.name || 'Leader'
        totalTeams = tableData.length
      }

      // Competition top scorer (reuse topScorer)
      setCompetitionData({
        liveMatches,
        upcomingMatches,
        completedMatches,
        latestResult,
        leaderTeam,
        totalTeams,
        competitionTopScorer: topScorer
      })
    } catch (error) {
      console.error('Error loading competition stats:', error)
    }
  }, [supabase])

  useEffect(() => {
    loadCompetitions()
  }, [loadCompetitions])

  useEffect(() => {
    if (selectedCompetition) {
      loadFixtures(selectedCompetition)
      loadCompetitionStats(selectedCompetition)
    }
  }, [selectedCompetition, loadFixtures, loadCompetitionStats])

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  const orderedCompetitions = getOrderedCompetitions(competitions)
  const selectedCompetitionData = orderedCompetitions.find(comp => comp.id === selectedCompetition) || orderedCompetitions[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="px-4 pt-8 pb-4">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-700 rounded animate-pulse w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-700 rounded animate-pulse w-64 mx-auto"></div>
          </div>
          <div className="mb-6">
            <div className="h-24 bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="px-4 pt-6 pb-8">
        {/* Header */}
        <div className="mb-6 animate-in fade-in slide-in-from-top">
          <h1 className="text-page-title mb-2">Competitions</h1>
          <p className="text-body">Select a competition to view fixtures, standings, and statistics</p>
        </div>

        {/* Search */}
        <div className="mb-6 animate-in fade-in slide-in-from-top" style={{animationDelay: '100ms'}}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search competitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-body-emphasis placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-green-600/50 transition-all duration-300 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Competitions Carousel */}
        {loading ? (
          <div className="mb-6">
            <ScrollArea className="w-full whitespace-nowrap rounded-xl">
              <div className="flex spacing-md pb-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={cn(
                    "bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 min-w-[280px] card-subtle-hover",
                    i === 0 && "animate-pulse-1",
                    i === 1 && "animate-pulse-2",
                    i === 2 && "animate-pulse-3"
                  )}>
                    <div className="flex items-center spacing-sm mb-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-700 rounded w-20"></div>
                      <div className="h-3 bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        ) : (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom" style={{animationDelay: '200ms'}}>
            <ScrollArea className="w-full whitespace-nowrap rounded-xl">
              <div className="flex spacing-md pb-4">
                {competitions
                  .filter(comp => 
                    comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    comp.type.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((competition) => (
                  <button
                    key={competition.id}
                    onClick={() => handleCompetitionSelection(competition.id)}
                    className={cn(
                      "bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border rounded-xl p-6 min-w-[240px] text-left transition-all duration-300 ease-out btn-enhanced card-interactive",
                      selectedCompetition === competition.id
                        ? "border-green-600/60 bg-gradient-to-br from-green-900/30 to-gray-900/40 shadow-lg shadow-green-500/20"
                        : "border-gray-700/30 card-subtle-hover"
                    )}
                  >
                    <div className="flex items-center spacing-sm mb-3">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300",
                        selectedCompetition === competition.id
                          ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                          : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                      )}>
                        {competition.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "text-body-emphasis truncate",
                          selectedCompetition === competition.id ? "text-green-100" : "text-white"
                        )}>
                          {competition.name}
                        </h3>
                        <div className="flex items-center spacing-xs">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-caption px-2 py-1",
                              selectedCompetition === competition.id 
                                ? "bg-green-600/20 text-green-300 border-green-500/30" 
                                : "bg-gray-700/50 text-gray-300"
                            )}
                          >
                            {competition.type}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-caption px-2 py-1",
                              competition.status === 'active' ? "border-green-500/30 text-green-400" :
                              competition.status === 'upcoming' ? "border-yellow-500/30 text-yellow-400" :
                              "border-gray-500/30 text-gray-400"
                            )}
                          >
                            {competition.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {/* Competition Overview Cards */}
        {selectedCompetition && (
          <div className="space-y-4 animate-in fade-in scale-in" style={{animationDelay: '300ms'}}>
            {/* Detailed Sections */}
            <div className="space-y-6">
              {/* Fixtures */}
              <Link href={selectedCompetition ? `/competitions/fixtures?competition=${selectedCompetition}` : "/competitions/fixtures"}>
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg">Fixtures</h3>
                        <p className="text-gray-400 text-sm">Upcoming matches and schedules</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400 text-sm">{competitionData.liveMatches} Live matches</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-blue-400 text-sm">{competitionData.upcomingMatches} Upcoming</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>

              {/* Results */}
              <Link href="/competitions/results">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg">Results</h3>
                        <p className="text-gray-400 text-sm">Recent match results and scores</p>
                        {competitionData.latestResult && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-red-400 text-sm">
                              Latest: {competitionData.latestResult.homeTeam} {competitionData.latestResult.homeScore}-{competitionData.latestResult.awayScore} {competitionData.latestResult.awayTeam}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>

              {/* League Table */}
              <Link href={selectedCompetition ? `/competitions/table?competition=${selectedCompetition}` : "/competitions/table"}>
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                        <Table className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg">League Table</h3>
                        <p className="text-gray-400 text-sm">Current standings and rankings</p>
                        <div className="flex items-center gap-4 mt-2">
                          {competitionData.leaderTeam && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <span className="text-yellow-400 text-sm">Leader: {competitionData.leaderTeam}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400 text-sm">{competitionData.totalTeams} Teams</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>

              {/* Statistics */}
              <Link href={selectedCompetition ? `/competitions/statistics?competition=${selectedCompetition}` : "/competitions/statistics"}>
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg">Statistics</h3>
                        <p className="text-gray-400 text-sm">Team and player performance data</p>
                        {competitionData.competitionTopScorer && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="text-purple-400 text-sm">
                              Top Scorer: {competitionData.competitionTopScorer.name} ({competitionData.competitionTopScorer.goals} goals)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>

              {/* Teams & Players Header */}
              <div className="flex items-center gap-2 mt-8 mb-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <h2 className="text-white font-semibold">Teams & Players</h2>
              </div>

              {/* Clubs */}
              <Link href="/competitions/clubs">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg">Clubs</h3>
                        <p className="text-gray-400 text-sm">Browse all competing clubs and teams</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-blue-400 text-sm">{competitionStats.totalClubs} Active clubs</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400 text-sm">View profiles</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>

              {/* Players */}
              <Link href="/competitions/players">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg">Players</h3>
                        <p className="text-gray-400 text-sm">Player profiles and career stats</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="text-orange-400 text-sm">{competitionStats.totalPlayers} Active players</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400 text-sm">Career stats</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>

              {/* Competition Info Header */}
              <div className="flex items-center gap-2 mt-8 mb-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <h2 className="text-white font-semibold">Competition Information</h2>
              </div>

              {/* Rules */}
              <Link href="/competitions/rules">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg">Rules</h3>
                        <p className="text-gray-400 text-sm">Competition rules and regulations</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            <span className="text-emerald-400 text-sm">Official guidelines</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-yellow-400 text-sm">Fair play</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>

              {/* Transfers */}
              <Link href="/competitions/transfers">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <ArrowLeftRight className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg">Transfers</h3>
                        <p className="text-gray-400 text-sm">Player transfers and market activity</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                            <span className="text-indigo-400 text-sm">Transfer window</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-red-400 text-sm">Recent deals</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>

              {/* Managers */}
              <Link href="/competitions/managers">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg">Managers</h3>
                        <p className="text-gray-400 text-sm">Club managers and their profiles</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                            <span className="text-cyan-400 text-sm">{competitionStats.totalManagers} Active managers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400 text-sm">Manager stats</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>

              {/* Awards */}
              <Link href="/competitions/awards">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg">Awards</h3>
                        <p className="text-gray-400 text-sm">Trophies, achievements, and recognition</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            <span className="text-amber-400 text-sm">Hall of fame</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="text-purple-400 text-sm">Season awards</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
