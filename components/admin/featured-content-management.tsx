"use client"

import { useState, useEffect } from "react"
import {
  Trophy,
  Calendar,
  Star,
  Search,
  CheckCircle,
  Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Match {
  id: string
  home_team: { id: string; name: string }
  away_team: { id: string; name: string }
  competition: { id: string; name: string }
  match_date: string
  status: string
  home_score?: number
  away_score?: number
}

interface Competition {
  id: string
  name: string
  type: string
  status: string
  teams_count: number
  matches_count: number
}

interface FeaturedContent {
  featured_match_id: string | null
  featured_competition_id: string | null
}

export function FeaturedContentManagement() {
  const [matches, setMatches] = useState<Match[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent>({
    featured_match_id: null,
    featured_competition_id: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClientComponentClient()
    try {
      // Fetch matches with related data
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          status,
          home_score,
          away_score,
          home_team:teams!matches_home_team_id_fkey(id, name),
          away_team:teams!matches_away_team_id_fkey(id, name),
          competition:competitions!matches_competition_id_fkey(id, name)
        `)
        .order('match_date', { ascending: false })
        .limit(50)

      if (matchesError) throw matchesError

      // Transform matches data to match the interface
      const transformedMatches = (matchesData || []).map(match => ({
        id: match.id,
        match_date: match.match_date,
        status: match.status,
        home_score: match.home_score,
        away_score: match.away_score,
        home_team: match.home_team?.[0] || { id: '', name: 'Unknown Team' },
        away_team: match.away_team?.[0] || { id: '', name: 'Unknown Team' },
        competition: match.competition?.[0] || { id: '', name: 'Unknown Competition' }
      }))

      // Fetch competitions
      const { data: competitionsData, error: competitionsError } = await supabase
        .from('competitions')
        .select(`
          id,
          name,
          type,
          status,
          teams:competition_teams(count),
          matches(count)
        `)
        .eq('status', 'active')

      if (competitionsError) throw competitionsError

      // Transform competitions data to match the interface
      const transformedCompetitions = (competitionsData || []).map(comp => ({
        id: comp.id,
        name: comp.name,
        type: comp.type,
        status: comp.status,
        teams_count: comp.teams?.[0]?.count || 0,
        matches_count: comp.matches?.[0]?.count || 0
      }))

      // Fetch current featured content
      const { data: featuredData, error: featuredError } = await supabase
        .from('featured_content')
        .select('*')
        .single()

      if (featuredError && featuredError.code !== 'PGRST116') { // Ignore not found error
        throw featuredError
      }

      setMatches(transformedMatches)
      setCompetitions(transformedCompetitions)
      setFeaturedContent({
        featured_match_id: featuredData?.featured_match_id || null,
        featured_competition_id: featuredData?.featured_competition_id || null
      })
    } catch (error: any) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load content",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetFeaturedMatch = async (matchId: string) => {
    const supabase = createClientComponentClient()
    try {
      const { error } = await supabase
        .from('featured_content')
        .upsert({
          id: 1, // Single row
          featured_match_id: matchId,
          featured_competition_id: featuredContent.featured_competition_id
        })

      if (error) throw error

      setFeaturedContent(prev => ({
        ...prev,
        featured_match_id: matchId
      }))

      toast({
        title: "Success",
        description: "Featured match updated successfully",
      })
    } catch (error: any) {
      console.error('Error setting featured match:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update featured match",
        variant: "destructive",
      })
    }
  }

  const handleSetFeaturedCompetition = async (competitionId: string) => {
    const supabase = createClientComponentClient()
    try {
      const { error } = await supabase
        .from('featured_content')
        .upsert({
          id: 1, // Single row
          featured_match_id: featuredContent.featured_match_id,
          featured_competition_id: competitionId
        })

      if (error) throw error

      setFeaturedContent(prev => ({
        ...prev,
        featured_competition_id: competitionId
      }))

      toast({
        title: "Success",
        description: "Featured competition updated successfully",
      })
    } catch (error: any) {
      console.error('Error setting featured competition:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update featured competition",
        variant: "destructive",
      })
    }
  }

  const filteredMatches = matches.filter(match => 
    match.home_team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.away_team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.competition.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCompetitions = competitions.filter(comp =>
    comp.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Featured Match Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Featured Match
          </CardTitle>
          <CardDescription>
            Select the match to be featured on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competition</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{match.competition.name}</TableCell>
                    <TableCell>
                      {match.home_team.name} vs {match.away_team.name}
                    </TableCell>
                    <TableCell>
                      {new Date(match.match_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {match.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {match.home_score !== undefined && match.away_score !== undefined
                        ? `${match.home_score} - ${match.away_score}`
                        : 'TBD'}
                    </TableCell>
                    <TableCell>
                      {featuredContent.featured_match_id === match.id && (
                        <Star className="h-4 w-4 text-yellow-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetFeaturedMatch(match.id)}
                        disabled={featuredContent.featured_match_id === match.id}
                      >
                        Set as Featured
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Featured Competition Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Featured Competition
          </CardTitle>
          <CardDescription>
            Select the competition to be featured on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Matches</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompetitions.map((competition) => (
                  <TableRow key={competition.id}>
                    <TableCell>{competition.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {competition.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{competition.teams_count}</TableCell>
                    <TableCell>{competition.matches_count}</TableCell>
                    <TableCell>
                      {featuredContent.featured_competition_id === competition.id && (
                        <Star className="h-4 w-4 text-yellow-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetFeaturedCompetition(competition.id)}
                        disabled={featuredContent.featured_competition_id === competition.id}
                      >
                        Set as Featured
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
