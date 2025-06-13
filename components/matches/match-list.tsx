'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'
import { toast } from '@/hooks/use-toast'

type Match = {
  id: string
  match_date: string
  status: string
  is_featured: boolean
  home_team_stats: any
  away_team_stats: any
  home_team: {
    id: string
    name: string
    short_name: string
  }
  away_team: {
    id: string
    name: string
    short_name: string
  }
}

export function MatchList() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  async function fetchMatches() {
    const supabase = createClientComponentClient<Database>()
    try {
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          status,
          is_featured,
          home_team_stats,
          away_team_stats,
          home_team:teams!home_team_id(
            id,
            name,
            short_name
          ),
          away_team:teams!away_team_id(
            id,
            name,
            short_name
          )
        `)
        .order('match_date')

      if (matchesError) throw matchesError
      if (matchesData) setMatches(matchesData as unknown as Match[])
    } catch (error) {
      console.error('Error fetching matches:', error)
      toast({
        title: "Error",
        description: "Failed to load matches. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading matches...</div>
  }

  return (
    <div className="space-y-6">
      {matches.map((match) => (
        <div key={match.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
              <span className="text-[#00ff87]">{match.home_team.short_name}</span>
            </div>
            <div>
              <p className="font-medium">{match.home_team.name}</p>
              <p className="text-sm text-gray-400">Home</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">{new Date(match.match_date).toLocaleDateString()}</p>
            <p className="font-medium">{new Date(match.match_date).toLocaleTimeString()}</p>
            <p className="text-sm text-gray-400">{match.status}</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="font-medium text-right">{match.away_team.name}</p>
              <p className="text-sm text-gray-400 text-right">Away</p>
            </div>
            <div className="w-12 h-12 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
              <span className="text-[#00ff87]">{match.away_team.short_name}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 
