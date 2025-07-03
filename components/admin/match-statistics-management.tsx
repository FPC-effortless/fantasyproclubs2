"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import { Check, X, Edit2, Search, Trophy, Filter, ChevronLeft, ChevronRight } from "lucide-react"

interface Team {
  id: string
  name: string
}

interface Competition {
  id: string
  name: string
}

interface Match {
  id: string
  match_date: string
  home_team: Team
  away_team: Team
  competition: {
    name: string
  }
}

interface PlayerStats {
  id: string
  match_id: string
  player_id: string
  player_name: string
  team_name: string
  match_date: string
  goals: number
  assists: number
  minutes_played: number
  rating: number
  fantasy_points: number
  status: 'pending' | 'approved' | 'rejected'
}

interface Database {
  public: {
    Tables: {
      matches: {
        Row: {
          id: string
          match_date: string
          home_team_id: string
          away_team_id: string
          competition_id: string
        }
      }
      player_match_stats: {
        Row: {
          id: string
          match_id: string
          player_id: string
          team_id: string
          goals: number
          assists: number
          minutes_played: number
          rating: number
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
        }
      }
      players: {
        Row: {
          id: string
          user_id: string
          team_id: string
        }
      }
      competitions: {
        Row: {
          id: string
          name: string
        }
      }
    }
  }
  auth: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          raw_user_meta_data: {
            display_name: string
          }
        }
      }
    }
  }
}

export function MatchStatisticsManagement() {
  const [stats, setStats] = useState<PlayerStats[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string>("all")
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all")
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
  const supabase = createClient()

  useEffect(() => {
    fetchCompetitions()
    fetchTeams()
  }, [])

  useEffect(() => {
    fetchMatches()
  }, [selectedCompetition])

  useEffect(() => {
    fetchStats()
  }, [selectedMatch, selectedTeam, page])

  async function fetchCompetitions() {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('id, name')
        .order('name')

      if (error) throw error
      setCompetitions(data || [])
    } catch (error: any) {
      console.error('Error fetching competitions:', error)
      toast({
        title: "Error",
        description: "Failed to load competitions",
        variant: "destructive",
      })
    }
  }

  async function fetchTeams() {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name')

      if (error) throw error
      setTeams(data || [])
    } catch (error: any) {
      console.error('Error fetching teams:', error)
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      })
    }
  }

  async function fetchMatches() {
    try {
      let query = supabase
        .from('matches')
        .select(`
          id,
          match_date,
          home_team:teams!matches_home_team_id_fkey(id, name),
          away_team:teams!matches_away_team_id_fkey(id, name),
          competition:competitions!inner(id, name)
        `)
        .order('match_date', { ascending: false })

      if (selectedCompetition !== 'all') {
        query = query.eq('competition_id', selectedCompetition)
      }

      const { data, error } = await query

      if (error) throw error

      type DatabaseMatchResponse = {
        id: string
        match_date: string
        home_team: [{ id: string; name: string }]
        away_team: [{ id: string; name: string }]
        competition: [{ id: string; name: string }]
      }

      const transformedData = (data as DatabaseMatchResponse[] || []).map(match => ({
        id: match.id,
        match_date: match.match_date,
        home_team: {
          id: match.home_team[0]?.id || '',
          name: match.home_team[0]?.name || 'Unknown Team'
        },
        away_team: {
          id: match.away_team[0]?.id || '',
          name: match.away_team[0]?.name || 'Unknown Team'
        },
        competition: {
          name: match.competition[0]?.name || 'Unknown Competition'
        }
      }))

      setMatches(transformedData)
    } catch (error: any) {
      console.error('Error fetching matches:', error)
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      })
    }
  }

  async function fetchStats() {
    try {
      console.log('[MatchStatistics] Starting fetchStats')
      
      // Simple test query first
      const testQuery = await supabase
        .from('player_match_stats')
        .select('id, match_id, player_id')
        .limit(1)
      
      console.log('[MatchStatistics] Test query result:', testQuery)
      
      if (testQuery.error) {
        console.error('[MatchStatistics] Test query error:', testQuery.error)
        throw testQuery.error
      }

      let query = supabase
        .from('player_match_stats')
        .select(`
          id,
          match_id,
          player_id,
          goals,
          assists,
          minutes_played,
          rating,
          matches (
            match_date
          ),
          players (
            id,
            teams (
              name
            ),
            user_id
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)

      console.log('[MatchStatistics] About to execute main query')

      if (selectedMatch !== 'all') {
        query = query.eq('match_id', selectedMatch)
      }

      if (selectedTeam !== 'all') {
        query = query.eq('players.team_id', selectedTeam)
      }

      const { data, error, count } = await query

      console.log('[MatchStatistics] Query result:', { data, error, count })

      if (error) throw error
      
      const transformedStats = (data || []).map((stat: any) => {
        const playerStat: PlayerStats = {
          id: stat.id,
          match_id: stat.match_id,
          player_id: stat.player_id,
          player_name: stat.players?.user_profiles?.display_name || stat.players?.user_profiles?.gaming?.psn_id || stat.players?.user_profiles?.gaming?.xbox_gamertag || 'Unknown Player',
          team_name: stat.players?.teams?.name || 'Unknown Team',
          match_date: stat.matches?.match_date || new Date().toISOString(),
          goals: stat.goals || 0,
          assists: stat.assists || 0,
          minutes_played: stat.minutes_played || 0,
          rating: stat.rating || 0,
          fantasy_points: 0,
          status: 'pending' // Default status since we removed it from query
        }
        playerStat.fantasy_points = calculateFantasyPoints(playerStat)
        return playerStat
      })

      setStats(transformedStats)
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error: any) {
      console.error('Error fetching stats:', error.message || error)
      toast({
        title: "Error",
        description: error.message || "Failed to load statistics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleBatchApprove() {
    try {
      const pendingStats = stats.filter(stat => stat.status === 'pending')
      if (pendingStats.length === 0) {
        toast({
          title: "Info",
          description: "No pending statistics to approve",
        })
        return
      }

      const { error } = await supabase
        .from('player_match_stats')
        .update({ status: 'approved' })
        .in('id', pendingStats.map(stat => stat.id))

      if (error) throw error

      toast({
        title: "Success",
        description: `Approved ${pendingStats.length} statistics`,
      })

      fetchStats()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve statistics",
        variant: "destructive",
      })
    }
  }

  async function handleStatusChange(statId: string, newStatus: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('player_match_stats')
        .update({ status: newStatus })
        .eq('id', statId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Statistics ${newStatus}`,
      })

      fetchStats()
    } catch (error: any) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  function calculateFantasyPoints(stat: PlayerStats): number {
    let points = 0
    
    // Basic stats
    points += stat.goals * 4
    points += stat.assists * 3
    
    // Minutes played bonus
    if (stat.minutes_played >= 60) points += 2
    else if (stat.minutes_played > 0) points += 1

    // Rating bonus
    if (stat.rating >= 8.0) points += 3
    else if (stat.rating >= 7.0) points += 1

    return points
  }

  const filteredStats = stats.filter(stat => 
    stat.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stat.team_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Match Statistics & Fantasy Points
          </CardTitle>
          <CardDescription>
            Review and approve player statistics from matches and calculate fantasy points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Select
                value={selectedCompetition}
                onValueChange={setSelectedCompetition}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by competition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Competitions</SelectItem>
                  {competitions.map((competition) => (
                    <SelectItem key={competition.id} value={competition.id}>
                      {competition.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select
                value={selectedMatch}
                onValueChange={setSelectedMatch}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by match" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Matches</SelectItem>
                  {matches.map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      {match.home_team.name} vs {match.away_team.name} ({new Date(match.match_date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select
                value={selectedTeam}
                onValueChange={setSelectedTeam}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by player or team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <Button onClick={handleBatchApprove}>
              <Check className="mr-2 h-4 w-4" />
              Approve All Pending
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Fantasy Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading statistics...
                    </TableCell>
                  </TableRow>
                ) : filteredStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No statistics found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStats.map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell>{stat.player_name}</TableCell>
                      <TableCell>{stat.team_name}</TableCell>
                      <TableCell>
                        {new Date(stat.match_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-4 w-4 mr-1" />
                              View Stats
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Player Statistics</DialogTitle>
                              <DialogDescription>
                                Detailed match statistics for {stat.player_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Goals</p>
                                <p className="text-2xl">{stat.goals}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Assists</p>
                                <p className="text-2xl">{stat.assists}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Minutes Played</p>
                                <p className="text-2xl">{stat.minutes_played}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Rating</p>
                                <p className="text-2xl">{stat.rating.toFixed(1)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Fantasy Points</p>
                                <p className="text-2xl">{stat.fantasy_points}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Status</p>
                                <Badge
                                  variant={
                                    stat.status === 'approved' ? 'default' :
                                    stat.status === 'rejected' ? 'destructive' :
                                    'secondary'
                                  }
                                >
                                  {stat.status}
                                </Badge>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stat.status === 'approved' ? 'default' : 'secondary'}>
                          {stat.fantasy_points} pts
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            stat.status === 'approved' ? 'default' :
                            stat.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {stat.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {stat.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => handleStatusChange(stat.id, 'approved')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => handleStatusChange(stat.id, 'rejected')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
