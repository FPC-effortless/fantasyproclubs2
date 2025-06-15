'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FeaturedMatch } from '@/types/match'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'

interface FeaturedMatchSectionProps {
  isAuthenticated: boolean | null
}

export function FeaturedMatchSection({ isAuthenticated }: FeaturedMatchSectionProps) {
  const [featuredMatch, setFeaturedMatch] = useState<FeaturedMatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadFeaturedMatch()
  }, [])

  const loadFeaturedMatch = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('featured_matches')
        .select(`
          *,
          match:match_id(
            *,
            home_team:home_team_id(*),
            away_team:away_team_id(*),
            competition:competition_id(*)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      setFeaturedMatch(data)
    } catch (err) {
      console.error('Error loading featured match:', err)
      setError('Failed to load featured match. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <Loading size="lg" />
      </div>
    )
  }

  if (error || !featuredMatch) {
    return null
  }

  const { match } = featuredMatch

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-green-800/20" />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="text-green-400">
              Featured Match
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
              {featuredMatch.title}
            </h1>
            
            <p className="text-gray-300 text-lg">
              {featuredMatch.description}
            </p>

            <div className="flex items-center gap-4">
              <Link href={`/matches/${match.id}`}>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  View Match Details
                </Button>
              </Link>
              
              {isAuthenticated && (
                <Link href={`/matches/${match.id}/predict`}>
                  <Button variant="outline" className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50">
                    Make Prediction
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {match.competition.logo_url && (
                  <Image
                    src={match.competition.logo_url}
                    alt={match.competition.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span className="text-gray-300">{match.competition.name}</span>
              </div>
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                {match.status}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center text-center">
              <div className="space-y-2">
                {match.home_team.logo_url && (
                  <Image
                    src={match.home_team.logo_url}
                    alt={match.home_team.name}
                    width={64}
                    height={64}
                    className="mx-auto"
                  />
                )}
                <div className="font-medium text-green-100">{match.home_team.name}</div>
              </div>

              <div className="text-2xl font-bold text-green-400">
                {match.status === 'live' ? (
                  `${match.home_team_stats.goals || 0} - ${match.away_team_stats.goals || 0}`
                ) : (
                  'VS'
                )}
              </div>

              <div className="space-y-2">
                {match.away_team.logo_url && (
                  <Image
                    src={match.away_team.logo_url}
                    alt={match.away_team.name}
                    width={64}
                    height={64}
                    className="mx-auto"
                  />
                )}
                <div className="font-medium text-green-100">{match.away_team.name}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
} 