'use client'

import { useState, useEffect } from 'react'
import { Match, Competition } from '@/types/match'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Clock } from 'lucide-react'
import { MatchCard } from '@/components/match/match-card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Loading } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/client'

interface MatchesSectionProps {
  isAuthenticated: boolean | null
}

export function MatchesSection({ isAuthenticated }: MatchesSectionProps) {
  const [activeTab, setActiveTab] = useState('fixtures')
  const [matches, setMatches] = useState<Match[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadMatches()
    loadCompetitions()
  }, [activeTab, selectedCompetition])

  const loadMatches = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('matches')
        .select(`
          *,
          home_team:home_team_id(*),
          away_team:away_team_id(*),
          competition:competition_id(*)
        `)
        .order('match_date', { ascending: activeTab === 'fixtures' })

      if (selectedCompetition) {
        query = query.eq('competition_id', selectedCompetition)
      }

      const { data, error } = await query

      if (error) throw error
      setMatches(data || [])
    } catch (err) {
      console.error('Error loading matches:', err)
      setError('Failed to load matches. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const loadCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('name')

      if (error) throw error
      setCompetitions(data || [])
    } catch (err) {
      console.error('Error loading competitions:', err)
    }
  }

  const filteredMatches = matches.filter(match => {
    const searchLower = searchQuery.toLowerCase()
    return (
      match.home_team.name.toLowerCase().includes(searchLower) ||
      match.away_team.name.toLowerCase().includes(searchLower) ||
      match.competition.name.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="p-4">
        <Loading size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => loadMatches()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="fixtures">Upcoming</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <select
              value={selectedCompetition || ''}
              onChange={(e) => setSelectedCompetition(e.target.value || null)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Competitions</option>
              {competitions.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <TabsContent value="fixtures" className="mt-0">
          <ScrollArea className="w-full">
            <div className="space-y-4">
              {filteredMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="results" className="mt-0">
          <ScrollArea className="w-full">
            <div className="space-y-4">
              {filteredMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
} 