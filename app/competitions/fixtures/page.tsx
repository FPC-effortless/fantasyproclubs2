"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/components/providers/supabase-provider"
import { MatchCard } from "@/components/match/match-card"
import { toast } from "@/components/ui/use-toast"

interface Fixture {
  id: string
  home_team: {
    id: string
    name: string
    logo_url: string | null
  }
  away_team: {
    id: string
    name: string
    logo_url: string | null
  }
  match_date: string
  status: string
  venue?: string
  home_team_stats: any
  away_team_stats: any
  matchday: number
}

interface Competition {
  id: string
  name: string
  type: string
  status: string
}

export default function FixturesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const urlCompetitionId = searchParams.get('competition')
  
  // Get competition ID from URL parameter or localStorage
  const [competitionId, setCompetitionId] = useState<string | null>(() => {
    if (urlCompetitionId) return urlCompetitionId
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCompetition')
    }
    return null
  })
  
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(true)

  // Update competition ID when URL parameter changes
  useEffect(() => {
    if (urlCompetitionId) {
      setCompetitionId(urlCompetitionId)
    }
  }, [urlCompetitionId])

  const handleMatchClick = (matchId: string) => {
    router.push(`/matches/${matchId}`)
  }

  const handleTeamClick = (e: React.MouseEvent, teamId: string, teamName: string) => {
    e.stopPropagation() // Prevent match click when clicking team
    router.push(`/teams/${teamId}`)
  }

  const loadMockFixtures = async () => {
    try {
      setLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockFixtures: Fixture[] = [
        {
          id: '1',
          home_team: {
            id: 'manchester-united',
            name: 'Manchester United',
            logo_url: null
          },
          away_team: {
            id: 'liverpool',
            name: 'Liverpool',
            logo_url: null
          },
          match_date: '2024-03-20T19:45:00Z',
          status: 'scheduled',
          venue: 'Old Trafford',
          home_team_stats: null,
          away_team_stats: null,
          matchday: 1
        },
        {
          id: '2',
          home_team: {
            id: 'arsenal',
            name: 'Arsenal',
            logo_url: null
          },
          away_team: {
            id: 'chelsea',
            name: 'Chelsea',
            logo_url: null
          },
          match_date: '2024-03-21T20:00:00Z',
          status: 'scheduled',
          venue: 'Emirates Stadium',
          home_team_stats: null,
          away_team_stats: null,
          matchday: 1
        },
        {
          id: '3',
          home_team: {
            id: 'manchester-city',
            name: 'Manchester City',
            logo_url: null
          },
          away_team: {
            id: 'tottenham',
            name: 'Tottenham',
            logo_url: null
          },
          match_date: '2024-03-22T15:00:00Z',
          status: 'scheduled',
          venue: 'Etihad Stadium',
          home_team_stats: null,
          away_team_stats: null,
          matchday: 2
        },
        {
          id: '4',
          home_team: {
            id: 'newcastle',
            name: 'Newcastle',
            logo_url: null
          },
          away_team: {
            id: 'aston-villa',
            name: 'Aston Villa',
            logo_url: null
          },
          match_date: '2024-03-23T15:00:00Z',
          status: 'scheduled',
          venue: 'St James\' Park',
          home_team_stats: null,
          away_team_stats: null,
          matchday: 2
        },
        {
          id: '5',
          home_team: {
            id: 'brighton',
            name: 'Brighton',
            logo_url: null
          },
          away_team: {
            id: 'west-ham',
            name: 'West Ham',
            logo_url: null
          },
          match_date: '2024-03-24T14:00:00Z',
          status: 'scheduled',
          venue: 'Amex Stadium',
          home_team_stats: null,
          away_team_stats: null,
          matchday: 3
        }
      ]

      setFixtures(mockFixtures)
    } catch (error) {
      console.error('Error loading mock fixtures:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCompetitionFixtures = useCallback(async () => {
    if (!competitionId) return

    try {
      setLoading(true)

      console.log('Loading fixtures for competition:', competitionId)

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
        await loadMockFixtures()
        return
      }

      setCompetition(competitionData)

      // Load fixtures from matches table with matchday information
      const { data: fixturesData, error: fixturesError } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          status,
          matchday,
          home_team:teams!matches_home_team_id_fkey(id, name),
          away_team:teams!matches_away_team_id_fkey(id, name)
        `)
        .eq('competition_id', competitionId)
        .order('matchday', { ascending: true })
        .order('match_date', { ascending: true })

      if (fixturesError) {
        console.error('Error loading fixtures:', fixturesError)
        console.error('Fixtures error details:', JSON.stringify(fixturesError, null, 2))
        
        // Check if it's a missing table/column error
        const errorMessage = fixturesError.message || fixturesError.toString()
        if (errorMessage.includes('does not exist') || errorMessage.includes('column')) {
          toast({
            title: "⚠️ Database Schema Issue",
            description: "The matches table is missing some columns. Using sample data instead.",
            variant: "default",
          })
        } else {
          toast({
            title: "Error loading fixtures",
            description: errorMessage,
            variant: "destructive",
          })
        }
        await loadMockFixtures()
        return
      }

      if (fixturesData && fixturesData.length > 0) {
        console.log('Processing fixtures data:', fixturesData)
        
        // Transform database data to our interface
        const transformedFixtures: Fixture[] = fixturesData.map((item: any) => ({
          id: item.id,
          home_team: {
            id: item.home_team?.id || 'unknown-team',
            name: item.home_team?.name || 'Unknown Team',
            logo_url: null
          },
          away_team: {
            id: item.away_team?.id || 'unknown-team',
            name: item.away_team?.name || 'Unknown Team', 
            logo_url: null
          },
          match_date: item.match_date,
          status: item.status || 'scheduled',
          venue: item.venue || undefined,
          home_team_stats: item.home_team_stats || null,
          away_team_stats: item.away_team_stats || null,
          matchday: item.matchday || 1
        }))

        console.log('Transformed fixtures:', transformedFixtures)
        setFixtures(transformedFixtures)
      } else {
        console.log('No fixtures data found for competition:', competitionId)
        toast({
          title: "No Fixtures Available",
          description: "This competition doesn't have fixture data yet. Showing sample data.",
          variant: "default",
        })
        await loadMockFixtures()
      }

    } catch (error) {
      console.error('Error loading competition fixtures:', error)
      toast({
        title: "Error",
        description: "Failed to load competition fixtures",
        variant: "destructive",
      })
      await loadMockFixtures()
    } finally {
      setLoading(false)
    }
  }, [competitionId, supabase])

  useEffect(() => {
    console.log('Fixtures useEffect triggered, competitionId:', competitionId)
    
    if (competitionId) {
      console.log('Loading competition fixtures for:', competitionId)
      loadCompetitionFixtures()
    } else {
      console.log('No competition ID, loading mock fixtures')
      loadMockFixtures()
    }
  }, [competitionId, loadCompetitionFixtures])

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-GB', { 
        weekday: 'long',
        day: '2-digit', 
        month: 'long',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    }
  }

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
              <h1 className="text-2xl font-bold text-green-400">Fixtures</h1>
              {competition && (
                <p className="text-gray-400 text-sm">{competition.name} • {competition.type}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-20 mb-3"></div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-6 bg-gray-700 rounded w-32"></div>
                      <div className="h-6 bg-gray-700 rounded w-8"></div>
                      <div className="h-6 bg-gray-700 rounded w-32"></div>
                    </div>
                    <div className="h-4 bg-gray-700 rounded w-40"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : fixtures.length > 0 ? (
            <div className="space-y-6">
              {/* Group fixtures by matchday */}
              {Array.from(new Set(fixtures.map(f => f.matchday))).map(matchday => (
                <div key={matchday} className="space-y-4">
                  {/* Matchday Header */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-green-800/40 to-green-900/40 backdrop-blur-sm border border-green-700/30 px-4 py-3 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {matchday}
                    </div>
                    <h2 className="text-lg font-semibold text-green-100">Matchday {matchday}</h2>
                  </div>

                  {/* Matches for this matchday */}
                  <div className="space-y-3">
                    {fixtures
                      .filter(fixture => fixture.matchday === matchday)
                      .map(fixture => {
                        const matchDateTime = formatMatchDate(fixture.match_date)
                        return (
                          <div 
                            key={fixture.id} 
                            className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all cursor-pointer"
                            onClick={() => handleMatchClick(fixture.id)}
                          >
                            {/* Match Date/Time */}
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-sm font-medium">{matchDateTime.date}</span>
                              <Clock className="w-4 h-4 text-gray-400 ml-2" />
                              <span className="text-gray-400 text-sm">{matchDateTime.time}</span>
                            </div>
                            
                            {/* Teams */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1 text-center">
                                <div 
                                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-2 cursor-pointer hover:scale-110 transition-transform"
                                  onClick={(e) => handleTeamClick(e, fixture.home_team.id, fixture.home_team.name)}
                                >
                                  {fixture.home_team.name.charAt(0)}
                                </div>
                                <h3 
                                  className="text-white font-medium text-sm cursor-pointer hover:text-green-400 transition-colors"
                                  onClick={(e) => handleTeamClick(e, fixture.home_team.id, fixture.home_team.name)}
                                >
                                  {fixture.home_team.name}
                                </h3>
                              </div>
                              
                              <div className="px-4">
                                <div className="text-gray-400 text-lg font-bold">vs</div>
                              </div>
                              
                              <div className="flex-1 text-center">
                                <div 
                                  className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-2 cursor-pointer hover:scale-110 transition-transform"
                                  onClick={(e) => handleTeamClick(e, fixture.away_team.id, fixture.away_team.name)}
                                >
                                  {fixture.away_team.name.charAt(0)}
                                </div>
                                <h3 
                                  className="text-white font-medium text-sm cursor-pointer hover:text-green-400 transition-colors"
                                  onClick={(e) => handleTeamClick(e, fixture.away_team.id, fixture.away_team.name)}
                                >
                                  {fixture.away_team.name}
                                </h3>
                              </div>
                            </div>
                            
                            {/* Status & Venue */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium",
                                  fixture.status === 'scheduled' ? "bg-blue-500/20 text-blue-400" :
                                  fixture.status === 'live' ? "bg-green-500/20 text-green-400" :
                                  fixture.status === 'completed' ? "bg-gray-500/20 text-gray-400" :
                                  "bg-yellow-500/20 text-yellow-400"
                                )}>
                                  {fixture.status.charAt(0).toUpperCase() + fixture.status.slice(1)}
                                </div>
                              </div>
                              {fixture.venue && (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <MapPin className="w-3 h-3" />
                                  <span className="text-xs">{fixture.venue}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty state
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No Fixtures Available</h3>
              <p className="text-gray-500 text-sm">
                {competitionId 
                  ? 'This competition has no fixture data yet.' 
                  : 'Please select a competition to view its fixtures.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 