"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Trophy, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { MatchCard } from "@/components/match/match-card"

interface Result {
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
  home_score: number
  away_score: number
  venue?: string
}

interface Competition {
  id: string
  name: string
  type: string
  status: string
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const competitionId = searchParams.get('competition')
  
  const [results, setResults] = useState<Result[]>([])
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (competitionId) {
      loadCompetitionResults()
    } else {
      loadMockResults()
    }
  }, [competitionId])

  const loadMockResults = async () => {
    try {
      setLoading(true)
      
      // Mock data for completed matches
      const mockResults: Result[] = [
        {
          id: "1",
          home_team: { id: "nottingham-forest", name: "Nottingham Forest", logo_url: null },
          away_team: { id: "manchester-united", name: "Manchester United", logo_url: null },
          match_date: "2024-04-12T15:00:00Z",
          status: "completed",
          home_score: 0,
          away_score: 2,
          venue: "City Ground"
        },
        {
          id: "2",
          home_team: { id: "liverpool", name: "Liverpool", logo_url: null },
          away_team: { id: "chelsea", name: "Chelsea", logo_url: null },
          match_date: "2024-04-11T17:30:00Z", 
          status: "completed",
          home_score: 2,
          away_score: 1,
          venue: "Anfield"
        },
        {
          id: "3",
          home_team: { id: "arsenal", name: "Arsenal", logo_url: null },
          away_team: { id: "manchester-city", name: "Manchester City", logo_url: null },
          match_date: "2024-04-10T19:45:00Z",
          status: "completed", 
          home_score: 1,
          away_score: 3,
          venue: "Emirates Stadium"
        },
        {
          id: "4",
          home_team: { id: "tottenham", name: "Tottenham", logo_url: null },
          away_team: { id: "newcastle", name: "Newcastle", logo_url: null },
          match_date: "2024-04-09T20:00:00Z",
          status: "completed",
          home_score: 4,
          away_score: 0,
          venue: "Tottenham Hotspur Stadium"
        }
      ]
      
      setResults(mockResults)
    } catch (error: any) {
      toast({
        title: "Error loading results",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCompetitionResults = async () => {
    if (!competitionId) return

    try {
      setLoading(true)

      console.log('Loading results for competition:', competitionId)

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
        loadMockResults()
        return
      }

      setCompetition(competitionData)

      // Load real match results for this competition
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          status,
          home_score,
          away_score,
          home_team:teams!matches_home_team_id_fkey(id, name),
          away_team:teams!matches_away_team_id_fkey(id, name)
        `)
        .eq('competition_id', competitionId)
        .eq('status', 'completed')
        .order('match_date', { ascending: false })
        .limit(20)

      console.log('Competition matches query result:', { matchesData, matchesError })

      if (matchesError) {
        console.error('Error loading matches:', matchesError)
        console.error('Matches error details:', JSON.stringify(matchesError, null, 2))
        
        // Check if it's a missing table/column error
        const errorMessage = matchesError.message || matchesError.toString()
        if (errorMessage.includes('does not exist') || errorMessage.includes('column') || errorMessage.includes('42703')) {
          toast({
            title: "⚠️ Database Schema Issue",
            description: "Match results data is not available. No results to display.",
            variant: "default",
          })
        } else {
          toast({
            title: "Error loading matches",
            description: errorMessage,
            variant: "destructive",
          })
        }
        
        // Set empty results
        setResults([])
        return
      }

      // Process real match data
      const competitionName = competitionData?.name || 'Competition'
      
      if (matchesData && matchesData.length > 0) {
        console.log(`Found ${matchesData.length} completed matches for competition:`, competitionName)
        
        // Transform real data to expected format
        const realResults: Result[] = matchesData.map(match => ({
          id: match.id,
          home_team: {
            id: (match.home_team as any)?.id || 'unknown-team',
            name: (match.home_team as any)?.name || 'Unknown Team',
            logo_url: null
          },
          away_team: {
            id: (match.away_team as any)?.id || 'unknown-team',
            name: (match.away_team as any)?.name || 'Unknown Team', 
            logo_url: null
          },
          match_date: match.match_date,
          status: match.status,
          home_score: match.home_score || 0,
          away_score: match.away_score || 0
        }))

        setResults(realResults)
        
        toast({
          title: "Real Results Loaded",
          description: `Showing ${realResults.length} completed matches from ${competitionName}`,
          variant: "default",
        })
      } else {
        console.log('No completed matches found for competition:', competitionId)
        toast({
          title: "No Completed Matches",
          description: `No finished matches found for ${competitionName}.`,
          variant: "default",
        })
        
        // Set empty results
        setResults([])
      }

    } catch (error) {
      console.error('Error loading competition results:', error)
      toast({
        title: "Error",
        description: "Failed to load competition results",
        variant: "destructive",
      })
      loadMockResults()
    } finally {
      setLoading(false)
    }
  }

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-GB', { 
        weekday: 'short',
        day: '2-digit', 
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const getWinnerStyle = (homeScore: number, awayScore: number, isHome: boolean) => {
    const isWinner = isHome ? homeScore > awayScore : awayScore > homeScore
    const isDraw = homeScore === awayScore
    
    if (isDraw) return "text-yellow-400"
    if (isWinner) return "text-green-400"
    return "text-gray-400"
  }

  const handleMatchClick = (matchId: string) => {
    router.push(`/matches/${matchId}`)
  }

  const handleTeamClick = (e: React.MouseEvent, teamId: string, teamName: string) => {
    e.stopPropagation() // Prevent match click when clicking team
    router.push(`/teams/${teamId}`)
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
              <h1 className="text-2xl font-bold text-green-400">Results</h1>
              {competition && (
                <p className="text-gray-400 text-sm">{competition.name} • {competition.type}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-24 mb-3"></div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-6 bg-gray-700 rounded w-32"></div>
                      <div className="h-8 bg-gray-700 rounded w-16"></div>
                      <div className="h-6 bg-gray-700 rounded w-32"></div>
                    </div>
                    <div className="h-4 bg-gray-700 rounded w-40"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map(result => {
                const matchDate = formatMatchDate(result.match_date)
                const isHomeWin = result.home_score > result.away_score
                const isAwayWin = result.away_score > result.home_score
                const isDraw = result.home_score === result.away_score
                
                return (
                  <div 
                    key={result.id} 
                    className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all cursor-pointer"
                    onClick={() => handleMatchClick(result.id)}
                  >
                    {/* Match Date */}
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">{matchDate.date}</span>
                      <Clock className="w-4 h-4 text-gray-400 ml-2" />
                      <span className="text-gray-400 text-sm">{matchDate.time}</span>
                    </div>
                    
                    {/* Teams and Score */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 text-center">
                        <div 
                          className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-2 cursor-pointer hover:scale-110 transition-transform"
                          onClick={(e) => handleTeamClick(e, result.home_team.id, result.home_team.name)}
                        >
                          {result.home_team.name.charAt(0)}
                        </div>
                        <h3 
                          className={cn(
                            "font-medium text-sm cursor-pointer hover:text-green-400 transition-colors",
                            isHomeWin ? "text-green-400" : "text-white"
                          )}
                          onClick={(e) => handleTeamClick(e, result.home_team.id, result.home_team.name)}
                        >
                          {result.home_team.name}
                        </h3>
                      </div>
                      
                      <div className="px-6">
                        <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-lg px-4 py-2 border border-gray-600/30">
                          <div className="flex items-center gap-3 text-xl font-bold">
                            <span className={cn(
                              isHomeWin ? "text-green-400" : isDraw ? "text-yellow-400" : "text-gray-300"
                            )}>
                              {result.home_score}
                            </span>
                            <span className="text-gray-500">-</span>
                            <span className={cn(
                              isAwayWin ? "text-green-400" : isDraw ? "text-yellow-400" : "text-gray-300"
                            )}>
                              {result.away_score}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 text-center">
                        <div 
                          className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-2 cursor-pointer hover:scale-110 transition-transform"
                          onClick={(e) => handleTeamClick(e, result.away_team.id, result.away_team.name)}
                        >
                          {result.away_team.name.charAt(0)}
                        </div>
                        <h3 
                          className={cn(
                            "font-medium text-sm cursor-pointer hover:text-green-400 transition-colors",
                            isAwayWin ? "text-green-400" : "text-white"
                          )}
                          onClick={(e) => handleTeamClick(e, result.away_team.id, result.away_team.name)}
                        >
                          {result.away_team.name}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Status and Venue */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">
                          Final
                        </div>
                        {isDraw && (
                          <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                            Draw
                          </div>
                        )}
                      </div>
                      {result.venue && (
                        <div className="flex items-center gap-1 text-gray-400">
                          <Trophy className="w-3 h-3" />
                          <span className="text-xs">{result.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Empty state
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No Results Available</h3>
              <p className="text-gray-500 text-sm">
                {competitionId 
                  ? 'This competition has no completed matches yet.' 
                  : 'Please select a competition to view results.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 