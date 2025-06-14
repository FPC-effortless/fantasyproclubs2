"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { useSupabase } from '@/components/providers/supabase-provider'
import { toast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Share2, Eye, Calendar, Clock, MapPin, Play } from 'lucide-react'
import Link from 'next/link'
import { MatchOverview } from '@/components/match/match-overview'
import { MatchStatistics } from '@/components/match/match-statistics'
import { MatchTable } from '@/components/match/match-table'
import { MatchLineup } from '@/components/match/match-lineup'
import { StreamModal } from '@/components/match/stream-modal'
import Image from "next/image"

interface Match {
  id: string
  match_date: string
  status: string
  home_score: number | null
  away_score: number | null
  venue: string
  stream_url: string | null
  competition: {
    id: string
    name: string
    type: string
  }
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
  match_events: MatchEvent[]
  match_stats: MatchStats | null
}

interface MatchEvent {
  id: string
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty'
  minute: number
  team_type: 'home' | 'away'
  player_name: string
  description?: string
}

interface MatchStats {
  home_possession: number
  away_possession: number
  home_shots: number
  away_shots: number
  home_shots_on_target: number
  away_shots_on_target: number
  home_corners: number
  away_corners: number
  home_fouls: number
  away_fouls: number
  home_passes: number
  away_passes: number
  home_pass_accuracy: number
  away_pass_accuracy: number
}

type TabType = 'overview' | 'statistics' | 'table' | 'lineup'

export default function MatchDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false)
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [statistics, setStatistics] = useState<MatchStats | null>(null)

  const matchId = params.id as string

  useEffect(() => {
    if (matchId) {
      loadMatchDetails()
    }
  }, [matchId])

  const loadMatchDetails = async () => {
    try {
      setLoading(true)

      // Validate match ID
      if (!matchId || typeof matchId !== 'string') {
        toast({
          title: "Invalid Match",
          description: "The match ID is invalid.",
          variant: "destructive",
        })
        return
      }

      // Try to load real match data first
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          status,
          home_score,
          away_score,
          stream_url,
          competition:competitions!inner (
            id,
            name,
            type
          ),
          home_team:teams!matches_home_team_id_fkey!inner (
            id,
            name,
            logo_url
          ),
          away_team:teams!matches_away_team_id_fkey!inner (
            id,
            name,
            logo_url
          )
        `)
        .eq('id', matchId)
        .single()

      if (matchError) {
        console.error('Error loading match:', {
          code: matchError.code,
          message: matchError.message,
          details: matchError.details,
          hint: matchError.hint
        })
        
        if (matchError.code === 'PGRST116') {
          // No match found
          toast({
            title: "Match Not Found",
            description: "The match you&apos;re looking for doesn&apos;t exist.",
            variant: "destructive",
          })
        } else {
          // Other database error
          toast({
            title: "Error",
            description: "Failed to load match details. Please try again.",
            variant: "destructive",
          })
        }
        return
      }

      if (!matchData) {
        toast({
          title: "Match Not Found",
          description: "The match you&apos;re looking for doesn&apos;t exist.",
          variant: "destructive",
        })
        return
      }

      // Validate required data
      if (!matchData.competition || !matchData.home_team || !matchData.away_team) {
        toast({
          title: "Data Error",
          description: "Some match data is missing. Please try again later.",
          variant: "destructive",
        })
        return
      }

        // Load match events
      await loadMatchEvents()

        // Load match statistics
      await loadMatchStatistics()

      // Transform and validate the match data
      const transformedMatch = {
          ...matchData,
          venue: 'Premier League Stadium', // Default venue since not in DB
          competition: Array.isArray(matchData.competition) ? matchData.competition[0] : matchData.competition,
          home_team: Array.isArray(matchData.home_team) ? matchData.home_team[0] : matchData.home_team,
          away_team: Array.isArray(matchData.away_team) ? matchData.away_team[0] : matchData.away_team,
        match_events: events,
        match_stats: statistics,
        stream_url: matchData.stream_url || null
      }

      // Validate transformed data
      if (!transformedMatch.competition?.id || !transformedMatch.home_team?.id || !transformedMatch.away_team?.id) {
        toast({
          title: "Data Error",
          description: "Some match data is incomplete. Please try again later.",
          variant: "destructive",
        })
        return
      }

      setMatch(transformedMatch)

    } catch (error: any) {
      console.error('Unexpected error loading match details:', {
        message: error.message,
        stack: error.stack
      })
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMatchEvents = async () => {
    try {
      const { data: events, error } = await supabase
        .from('match_events')
        .select(`
          *,
          player:players(*),
          team:teams(*)
        `)
        .eq('match_id', params.id)
        .order('minute', { ascending: true });

      if (error) {
        console.error('Error loading match events:', error);
        setEvents([]);
        return;
      }

      // Transform events to match the interface
      const transformedEvents = (events || []).map(event => ({
        id: event.id,
        type: event.event_type as 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty',
        minute: event.minute,
        team_type: event.team_id === match?.home_team.id ? 'home' : 'away',
        player_name: event.player?.name || 'Unknown Player',
        description: event.description
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error loading match events:', error);
      setEvents([]);
    }
  };

  const loadMatchStatistics = async () => {
    try {
      const { data: stats, error } = await supabase
        .from('match_statistics')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('match_id', params.id);

      if (error) {
        console.error('Error loading match statistics:', error);
        setStatistics(null);
        return;
      }

      // Transform statistics to match the interface
      const homeStats = stats?.find(s => s.team_id === match?.home_team.id);
      const awayStats = stats?.find(s => s.team_id === match?.away_team.id);

      const transformedStats: MatchStats = {
        home_possession: homeStats?.possession || 0,
        away_possession: awayStats?.possession || 0,
        home_shots: homeStats?.shots || 0,
        away_shots: awayStats?.shots || 0,
        home_shots_on_target: homeStats?.shots_on_target || 0,
        away_shots_on_target: awayStats?.shots_on_target || 0,
        home_corners: homeStats?.corners || 0,
        away_corners: awayStats?.corners || 0,
        home_fouls: homeStats?.fouls || 0,
        away_fouls: awayStats?.fouls || 0,
        home_passes: homeStats?.passes || 0,
        away_passes: awayStats?.passes || 0,
        home_pass_accuracy: homeStats?.pass_accuracy || 0,
        away_pass_accuracy: awayStats?.pass_accuracy || 0
      };

      setStatistics(transformedStats);
    } catch (error) {
      console.error('Error loading match statistics:', error);
      setStatistics(null);
    }
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Full Time</Badge>
      case 'live':
        return <Badge variant="destructive" className="animate-pulse">Live</Badge>
      case 'scheduled':
        return <Badge variant="secondary">Upcoming</Badge>
      case 'postponed':
        return <Badge variant="outline">Postponed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'lineup', label: 'Lineup', icon: null },
    { id: 'statistics', label: 'Statistics', icon: null },
    { id: 'table', label: 'Table', icon: null },
  ] as const

  if (loading) {
  return (
    <LayoutWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
      </LayoutWrapper>
    )
  }

  if (!match) {
    return (
      <LayoutWrapper>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Match Not Found</h1>
          <p className="text-gray-600 mb-6">The match you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
                </div>
      </LayoutWrapper>
    )
  }

  // Validate match data before rendering
  if (!match.competition || !match.home_team || !match.away_team) {
    return (
      <LayoutWrapper>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Data Error</h1>
          <p className="text-gray-600 mb-6">Some match data is missing. Please try again later.</p>
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
              </div>
      </LayoutWrapper>
    )
  }

  const { date, time } = formatMatchDate(match.match_date)

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
                <div>
                <h1 className="text-2xl font-bold text-[#00ff87]">Match Details</h1>
                <p className="text-gray-400">{match.competition.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Highlights
              </Button>
            </div>
          </div>

          {/* Match Header Card */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 mb-6 shadow-xl">
            {/* Match Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {getStatusBadge(match.status)}
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{time}</span>
                </div>
                {match.venue && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{match.venue}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Teams and Score */}
            <div className="flex items-center justify-center gap-8">
              {/* Home Team */}
              <div className="flex-1 flex items-center gap-4 justify-end">
                <Link href={`/teams/${match.home_team.id}`} className="flex items-center gap-4 group">
                  <div className="text-right">
                    <div className="font-bold text-white text-xl group-hover:text-green-400 transition-colors">{match.home_team.name}</div>
                    <div className="text-sm text-gray-400">Home</div>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:ring-4 group-hover:ring-green-400/30 transition-all">
                    {match.home_team.logo_url ? (
                      <Image
                        src={match.home_team.logo_url}
                        alt={match.home_team.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-contain"
                      />
                    ) : (
                      match.home_team.name.charAt(0)
                    )}
                  </div>
                </Link>
              </div>
              
              {/* Score */}
              <div className="text-center px-8">
                {match.status === 'completed' || match.status === 'live' ? (
                  <div className="text-5xl font-bold text-green-400">
                    {match.home_score} - {match.away_score}
            </div>
                ) : (
                  <div className="text-4xl font-bold text-gray-500">
                    VS
                </div>
                )}
                {match.status === 'live' && (
                  <div className="text-sm text-red-400 font-medium mt-2">
                    LIVE
                </div>
                )}
            </div>

              {/* Away Team */}
              <div className="flex-1 flex items-center gap-4">
                <Link href={`/teams/${match.away_team.id}`} className="flex items-center gap-4 group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:ring-4 group-hover:ring-blue-400/30 transition-all">
                    {match.away_team.logo_url ? (
                      <Image
                        src={match.away_team.logo_url}
                        alt={match.away_team.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-contain"
                      />
                    ) : (
                      match.away_team.name.charAt(0)
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white text-xl group-hover:text-blue-400 transition-colors">{match.away_team.name}</div>
                    <div className="text-sm text-gray-400">Away</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Streaming Section */}
            {match.stream_url && (
              <div className="mt-6 pt-6 border-t border-gray-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Live Stream</h3>
                    <p className="text-sm text-gray-400">Watch the match live</p>
                  </div>
                  <Button 
                    variant="default" 
                    className="bg-[#00ff87] hover:bg-[#00ff87]/90 text-black"
                    onClick={() => setIsStreamModalOpen(true)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Stream
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-800/50 rounded-xl p-1 mb-6">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[#00ff87] text-black'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && <MatchOverview match={match} />}
            {activeTab === 'statistics' && <MatchStatistics match={match} />}
            {activeTab === 'table' && <MatchTable match={match} />}
            {activeTab === 'lineup' && <MatchLineup match={match} />}
          </div>
        </div>
      </div>
      <StreamModal
        isOpen={isStreamModalOpen}
        onClose={() => setIsStreamModalOpen(false)}
        streamUrl={match.stream_url}
        matchTitle={`${match.home_team.name} vs ${match.away_team.name}`}
      />
    </LayoutWrapper>
  )
} 