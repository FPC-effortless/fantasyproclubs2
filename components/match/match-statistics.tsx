"use client"

import { Target, Zap, Shield, Activity, Trophy, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Skeleton } from "@/components/ui/skeleton"

interface Match {
  id: string
  match_date: string
  status: string
  home_score: number | null
  away_score: number | null
  venue?: string
  competition: {
    id: string
    name: string
    type: string
  }
  home_team: {
    id: string
    name: string
    logo_url?: string | null
  }
  away_team: {
    id: string
    name: string
    logo_url?: string | null
  }
  match_events?: any[]
  match_stats?: any
}

interface MatchStatisticsProps {
  match: Match
}

interface HeadToHeadMatch {
  id: string
  match_date: string
  home_score: number
  away_score: number
  home_team: {
    name: string
  }
  away_team: {
    name: string
  }
}

export function MatchStatistics({ match }: MatchStatisticsProps) {
  const { supabase } = useSupabase()
  const [headToHeadMatches, setHeadToHeadMatches] = useState<HeadToHeadMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHeadToHeadMatches()
  }, [match])

  const loadHeadToHeadMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          home_score,
          away_score,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .or(`and(home_team_id.eq.${match.home_team.id},away_team_id.eq.${match.away_team.id}),and(home_team_id.eq.${match.away_team.id},away_team_id.eq.${match.home_team.id})`)
        .order('match_date', { ascending: false })
        .limit(5)

      if (error) throw error
      
      // Transform the data to match our HeadToHeadMatch type
      const transformedData: HeadToHeadMatch[] = (data || []).map(match => ({
        id: match.id,
        match_date: match.match_date,
        home_score: match.home_score,
        away_score: match.away_score,
        home_team: { name: (match.home_team as any).name },
        away_team: { name: (match.away_team as any).name }
      }))
      
      setHeadToHeadMatches(transformedData)
    } catch (error) {
      console.error('Error loading head to head matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHeadToHeadStats = () => {
    const stats = {
      homeWins: 0,
      awayWins: 0,
      draws: 0,
      homeGoals: 0,
      awayGoals: 0
    }

    headToHeadMatches.forEach(match => {
      if (match.home_team.name === match.home_team.name) {
        if (match.home_score > match.away_score) stats.homeWins++
        else if (match.home_score < match.away_score) stats.awayWins++
        else stats.draws++
        stats.homeGoals += match.home_score
        stats.awayGoals += match.away_score
      } else {
        if (match.away_score > match.home_score) stats.homeWins++
        else if (match.away_score < match.home_score) stats.awayWins++
        else stats.draws++
        stats.homeGoals += match.away_score
        stats.awayGoals += match.home_score
      }
    })

    return stats
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Head to Head Statistics */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Head to Head</h2>
        
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <>
            {/* Head to Head Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{getHeadToHeadStats().homeWins}</div>
                <div className="text-sm text-gray-400">{match.home_team.name} Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{getHeadToHeadStats().draws}</div>
                <div className="text-sm text-gray-400">Draws</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{getHeadToHeadStats().awayWins}</div>
                <div className="text-sm text-gray-400">{match.away_team.name} Wins</div>
              </div>
            </div>

            {/* Recent Matches */}
            <div className="space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Recent Matches
              </h3>
              {headToHeadMatches.map((match) => (
                <div key={match.id} className="bg-gray-700/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-400">{formatDate(match.match_date)}</div>
                    <div className="text-sm font-medium text-white">
                      {match.home_score} - {match.away_score}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {match.home_team.name} vs {match.away_team.name}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 