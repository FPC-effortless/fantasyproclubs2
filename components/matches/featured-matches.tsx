'use client'

import { useEffect, useState } from 'react'
import type { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

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

export function FeaturedMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedMatches()
  }, [])

  async function fetchFeaturedMatches() {
    const supabase = createClient()
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
        .eq('is_featured', true)
        .order('match_date')
        .limit(3)

      if (matchesError) throw matchesError
      if (matchesData) setMatches(matchesData as unknown as Match[])
    } catch (error) {
      console.error('Error fetching featured matches:', error)
      toast({
        title: "Error",
        description: "Failed to load featured matches. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4 bg-[#111111]">
          <div className="h-8 bg-[#1a1a1a] rounded" />
        </Card>
      ))}
    </div>
  }

  if (matches.length === 0) {
    return (
      <Card className="p-4 bg-[#111111] text-center text-gray-400">
        No featured matches found
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map((match) => (
        <Card key={match.id} className="p-4 bg-[#111111] hover:bg-[#1a1a1a] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                <span className="text-[#00ff87] text-sm">{match.home_team.short_name}</span>
              </div>
              <span className="font-medium">{match.home_team.name}</span>
            </div>
            <span className="text-gray-400">vs</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{match.away_team.name}</span>
              <div className="w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                <span className="text-[#00ff87] text-sm">{match.away_team.short_name}</span>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-400">
            <p>{new Date(match.match_date).toLocaleDateString()}</p>
            <p>{new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </Card>
      ))}
    </div>
  )
} 
