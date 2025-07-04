"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Send,
  Edit,
  Unlock,
  Users
} from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  home_team_name: string
  away_team_name: string
  kickoff_time: string
  competition_name: string
  status: string
}

interface Player {
  id: string
  user_id: string
  full_name: string
  position: string
  number: number | null
  team_id: string
}

interface Lineup {
  id: string
  team_id: string
  match_id: string
  formation: string
  name: string
  submitted_at?: string
  verification_status: 'pending' | 'verified' | 'rejected' | 'draft'
  admin_override_allowed: boolean
  lineup_players: LineupPlayer[]
}

interface LineupPlayer {
  id: string
  lineup_id: string
  player_id: string
  position: string
  player_order: number
  player: Player
}

interface Formation {
  name: string
  positions: {
    position: string
    x: number
    y: number
    label: string
  }[]
}

const formations: Formation[] = [
  {
    name: "4-3-3",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "CM", x: 65, y: 45, label: "CM" },
      { position: "CM", x: 50, y: 40, label: "CM" },
      { position: "CM", x: 35, y: 45, label: "CM" },
      { position: "RW", x: 75, y: 20, label: "RW" },
      { position: "ST", x: 50, y: 15, label: "ST" },
      { position: "LW", x: 25, y: 20, label: "LW" },
    ]
  },
  {
    name: "4-4-2",
    positions: [
      { position: "GK", x: 50, y: 90, label: "GK" },
      { position: "RB", x: 80, y: 70, label: "RB" },
      { position: "CB", x: 60, y: 70, label: "CB" },
      { position: "CB", x: 40, y: 70, label: "CB" },
      { position: "LB", x: 20, y: 70, label: "LB" },
      { position: "RM", x: 80, y: 45, label: "RM" },
      { position: "CM", x: 60, y: 45, label: "CM" },
      { position: "CM", x: 40, y: 45, label: "CM" },
      { position: "LM", x: 20, y: 45, label: "LM" },
      { position: "ST", x: 60, y: 20, label: "ST" },
      { position: "ST", x: 40, y: 20, label: "ST" },
    ]
  }
]

interface LineupSubmissionProps {
  userTeamId: string
  userRole: 'manager' | 'player'
}

export function LineupSubmission({ userTeamId, userRole }: LineupSubmissionProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [lineups, setLineups] = useState<Lineup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [selectedFormation, setSelectedFormation] = useState<Formation>(formations[0])
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [currentLineup, setCurrentLineup] = useState<Lineup | null>(null)

  const loadUpcomingMatches = useCallback(async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name),
        competitions(name)
      `)
      .or(`home_team_id.eq.${userTeamId},away_team_id.eq.${userTeamId}`)
      .gte('kickoff_time', new Date().toISOString())
      .order('kickoff_time')

    if (error) throw error

    const formattedMatches = data?.map(match => ({
      ...match,
      home_team_name: match.home_team?.name || 'Unknown Team',
      away_team_name: match.away_team?.name || 'Unknown Team',
      competition_name: match.competitions?.name || 'Unknown Competition'
    })) || []

    setMatches(formattedMatches)
  }, [userTeamId])

  const loadTeamPlayers = useCallback(async () => {
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        user_profiles(full_name)
      `)
      .eq('team_id', userTeamId)
      .eq('status', 'active')
      .order('number')

    if (error) throw error
    
    const formattedPlayers = data?.map(player => ({
      ...player,
      full_name: player.user_profiles?.full_name || 'Unknown Player'
    })) || []

    setPlayers(formattedPlayers)
  }, [userTeamId])

  const loadTeamLineups = useCallback(async () => {
    const { data, error } = await supabase
      .from('lineups')
      .select(`
        *,
        lineup_players(
          *,
          players(
            *,
            user_profiles(full_name)
          )
        )
      `)
      .eq('team_id', userTeamId)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Lineups table might not exist yet')
      setLineups([])
      return
    }
    
    const formattedLineups = data?.map(lineup => ({
      ...lineup,
      lineup_players: lineup.lineup_players?.map((lp: any) => ({
        ...lp,
        player: {
          ...lp.players,
          full_name: lp.players?.user_profiles?.full_name || 'Unknown Player'
        }
      })) || []
    })) || []

    setLineups(formattedLineups)
  }, [userTeamId])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([loadUpcomingMatches(), loadTeamPlayers(), loadTeamLineups()])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error loading data",
        description: "Failed to load lineup submission data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [loadUpcomingMatches, loadTeamPlayers, loadTeamLineups])

  useEffect(() => {
    if (userTeamId) {
      loadData()
    }
  }, [userTeamId, loadData])

  function getTimeUntilDeadline(match: Match) {
    const kickoffTime = new Date(match.kickoff_time)
    const deadlineTime = new Date(kickoffTime.getTime() - 3 * 60 * 60 * 1000) // 3 hours before
    const now = new Date()
    const diffMs = deadlineTime.getTime() - now.getTime()
    
    if (diffMs <= 0) return null
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  function isSubmissionAllowed(match: Match, lineup?: Lineup | null) {
    const kickoffTime = new Date(match.kickoff_time)
    const deadlineTime = new Date(kickoffTime.getTime() - 3 * 60 * 60 * 1000)
    const now = new Date()
    
    // Allow if within deadline OR admin override is enabled
    return now <= deadlineTime || (lineup?.admin_override_allowed && userRole === 'manager')
  }

  function getMatchLineup(matchId: string) {
    return lineups.find(lineup => lineup.match_id === matchId)
  }

  function getVerificationBadge(status: string) {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>
      default:
        return <Badge variant="outline">Not Submitted</Badge>
    }
  }

  async function submitLineup(matchId: string, formation: string, selectedPlayers: any[]) {
    try {
      // Create or update lineup
      const lineupData = {
        team_id: userTeamId,
        match_id: matchId,
        formation: formation,
        name: `Match Lineup - ${selectedMatch?.home_team_name} vs ${selectedMatch?.away_team_name}`,
        submitted_at: new Date().toISOString(),
        verification_status: 'pending',
        admin_override_allowed: false
      }

      const { data: lineup, error: lineupError } = await supabase
        .from('lineups')
        .upsert(lineupData)
        .select()
        .single()

      if (lineupError) throw lineupError

      // Clear existing lineup players and add new ones
      await supabase
        .from('lineup_players')
        .delete()
        .eq('lineup_id', lineup.id)

      if (selectedPlayers.length > 0) {
        const lineupPlayers = selectedPlayers.map((player, index) => ({
          lineup_id: lineup.id,
          player_id: player.id,
          position: player.assigned_position,
          player_order: index + 1
        }))

        const { error: playersError } = await supabase
          .from('lineup_players')
          .insert(lineupPlayers)

        if (playersError) throw playersError
      }

      toast({
        title: "Success",
        description: "Lineup submitted successfully and is pending admin verification",
      })

      loadTeamLineups()
      setIsSubmitDialogOpen(false)
    } catch (error: any) {
      console.error('Error submitting lineup:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit lineup",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    )
  }

  if (userRole !== 'manager') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Manager Access Only</h3>
          <p className="text-muted-foreground">
            Only team managers can submit lineups for matches.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lineup Submission</CardTitle>
          <CardDescription>
            Submit your team lineups for upcoming matches. Lineups must be submitted 3 hours before kickoff.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Upcoming matches: {matches.length} | Team players: {players.length}
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Upcoming Matches</h3>
              <p>There are no upcoming matches that require lineup submission.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => {
                const lineup = getMatchLineup(match.id)
                const timeUntilDeadline = getTimeUntilDeadline(match)
                const canSubmit = isSubmissionAllowed(match, lineup)
                const isUserTeamHome = match.home_team_id === userTeamId

                return (
                  <Card key={match.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">
                            {match.home_team_name} vs {match.away_team_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {match.competition_name} • {new Date(match.kickoff_time).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={isUserTeamHome ? "default" : "secondary"}>
                          {isUserTeamHome ? "Home" : "Away"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        {/* Deadline Status */}
                        <div className="flex items-center gap-2">
                          {timeUntilDeadline ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{timeUntilDeadline} left</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm">Deadline passed</span>
                            </div>
                          )}
                          {lineup?.admin_override_allowed && (
                            <Badge variant="outline" className="text-xs">
                              <Unlock className="h-2 w-2 mr-1" />
                              Override enabled
                            </Badge>
                          )}
                        </div>

                        {/* Verification Status */}
                        <div>
                          {getVerificationBadge(lineup?.verification_status || 'draft')}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end">
                          {lineup && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentLineup(lineup)
                                setSelectedMatch(match)
                                setIsSubmitDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                          
                          {canSubmit && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedMatch(match)
                                setCurrentLineup(lineup ?? null)
                                setIsSubmitDialogOpen(true)
                              }}
                              disabled={!canSubmit}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              {lineup ? 'Update' : 'Submit'} Lineup
                            </Button>
                          )}
                          
                          {!canSubmit && !lineup?.admin_override_allowed && (
                            <Button size="sm" disabled>
                              Deadline Passed
                            </Button>
                          )}
                        </div>
                      </div>

                      {lineup && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Formation: {lineup.formation}</span>
                            <span>Players: {lineup.lineup_players.length}/11</span>
                            {lineup.submitted_at && (
                              <span>Submitted: {new Date(lineup.submitted_at).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lineup Submission Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentLineup ? 'View/Edit Lineup' : 'Submit Lineup'}
            </DialogTitle>
            <DialogDescription>
              {selectedMatch && (
                <>Set up your lineup for {selectedMatch.home_team_name} vs {selectedMatch.away_team_name}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formation Selection */}
            <div className="space-y-4">
              <div>
                <Label>Formation</Label>
                <Select 
                  value={selectedFormation.name}
                  onValueChange={(value) => {
                    const formation = formations.find(f => f.name === value)
                    if (formation) setSelectedFormation(formation)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formations.map((formation) => (
                      <SelectItem key={formation.name} value={formation.name}>
                        {formation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Available Players ({players.length})</Label>
                <div className="max-h-[300px] overflow-y-auto border rounded-md p-2">
                  {players.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4 text-center">
                      No players available for your team.
                    </p>
                  ) : (
                    players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer"
                        draggable
                      >
                        <div>
                          <div className="font-medium">{player.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.position} {player.number && `#${player.number}`}
                          </div>
                        </div>
                        <Badge variant="outline">{player.position}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Formation Pitch */}
            <div className="space-y-4">
              <Label>Formation Layout</Label>
              <div className="relative bg-green-100 rounded-lg aspect-[3/4] border-2 border-green-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-green-200 to-green-300">
                  {/* Center circle */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white rounded-full"></div>
                  {/* Penalty areas */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-6 border-2 border-white border-t-0"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-6 border-2 border-white border-b-0"></div>
                  
                  {/* Position dots */}
                  {selectedFormation.positions.map((pos, index) => (
                    <div
                      key={index}
                      className="absolute w-8 h-8 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg cursor-pointer hover:bg-blue-600 transition-colors"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      title={`${pos.position} - Click to assign player`}
                    >
                      {pos.label}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Drag players from the left panel to assign them to positions on the field
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Cancel
            </Button>
            {selectedMatch && isSubmissionAllowed(selectedMatch, currentLineup) && (
              <Button onClick={() => {
                // This would be implemented with proper player selection logic
                submitLineup(selectedMatch.id, selectedFormation.name, [])
              }}>
                <Send className="h-4 w-4 mr-2" />
                {currentLineup ? 'Update' : 'Submit'} Lineup
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 