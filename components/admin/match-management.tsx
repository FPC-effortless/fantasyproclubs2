"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { generateFixtures } from "@/utils/fixture-generator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import {
  CompetitionSettings,
  CompetitionType,
  CompetitionFrequency,
  Match,
  MatchStatus,
  Group
} from "@/types/competition"
import {
  CalendarDays,
  Check,
  Clock,
  Edit,
  Plus,
  RefreshCw,
  Trophy,
  X
} from "lucide-react"

interface Team {
  id: string
  name: string
}

interface Competition {
  id: string
  name: string
  type: CompetitionType
  settings: CompetitionSettings
}

export function MatchManagement() {
  const [matches, setMatches] = useState<Match[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all")
  const [selectedMatches, setSelectedMatches] = useState<string[]>([])
  const [isGeneratingFixtures, setIsGeneratingFixtures] = useState(false)
  const [showFixtureDialog, setShowFixtureDialog] = useState(false)
  const [newCompetitionSettings, setNewCompetitionSettings] = useState<Partial<CompetitionSettings>>({
    type: 'league',
    frequency: 'weekly',
    homeAndAway: true
  })
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    fetchCompetitions()
  }, [])

  useEffect(() => {
    fetchMatches()
    fetchTeams()
  }, [selectedCompetition])

  async function fetchCompetitions() {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('name')

      if (error) throw error
      setCompetitions(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load competitions",
        variant: "destructive",
      })
    }
  }

  async function fetchTeams() {
    try {
      let query = supabase
        .from('teams')
        .select('*')
        .order('name')

      // If a specific competition is selected, only fetch teams in that competition
      if (selectedCompetition !== 'all') {
        query = supabase
          .from('teams')
          .select(`
            *,
            competition_teams!inner(competition_id)
          `)
          .eq('competition_teams.competition_id', selectedCompetition)
          .order('name')
      }

      const { data, error } = await query

      if (error) throw error
      setTeams(data || [])
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to load teams",
        variant: "destructive",
      })
    }
  }

  async function fetchMatches() {
    try {
      // First, fetch the matches
      let matchQuery = supabase
        .from('matches')
        .select('*')
        .order('match_date')

      if (selectedCompetition !== 'all') {
        matchQuery = matchQuery.eq('competition_id', selectedCompetition)
      }

      const { data: matchData, error: matchError } = await matchQuery

      if (matchError) throw matchError

      // Then fetch the related data - filter out null values
      const teamIds = new Set([
        ...(matchData || []).map(m => m.home_team_id),
        ...(matchData || []).map(m => m.away_team_id)
      ].filter(Boolean))
      
      const competitionIds = new Set((matchData || [])
        .map(m => m.competition_id)
        .filter(Boolean))

      const [
        { data: teamData, error: teamError },
        { data: competitionData, error: competitionError }
      ] = await Promise.all([
        teamIds.size > 0 ? supabase
          .from('teams')
          .select('name')
          .in('id', Array.from(teamIds)) : Promise.resolve({ data: [], error: null }),
        competitionIds.size > 0 ? supabase
          .from('competitions')
          .select('name')
          .in('id', Array.from(competitionIds)) : Promise.resolve({ data: [], error: null })
      ])

      if (teamError) throw teamError
      if (competitionError) throw competitionError

      // Create lookup maps using the query parameter as the key
      const teams = new Map(teamData?.map((team, index) => [Array.from(teamIds)[index], team]) || [])
      const competitions = new Map(competitionData?.map((comp, index) => [Array.from(competitionIds)[index], comp]) || [])

      // Transform the matches with joined data
      const transformedMatches: Match[] = (matchData || []).map(match => ({
        id: match.id,
        competition_id: match.competition_id,
        home_team_id: match.home_team_id,
        away_team_id: match.away_team_id,
        home_score: match.home_score || undefined,
        away_score: match.away_score || undefined,
        match_date: match.match_date,
        status: match.status as MatchStatus,
        // Note: verified column doesn't exist in matches table
        postponed_from: match.postponed_from || undefined,
        round: match.round || undefined,
        group: match.group || undefined,
        homeTeam: {
          id: match.home_team_id,
          name: teams.get(match.home_team_id)?.name || 'Unknown Team'
        },
        awayTeam: {
          id: match.away_team_id,
          name: teams.get(match.away_team_id)?.name || 'Unknown Team'
        },
        competition: {
          id: match.competition_id,
          name: competitions.get(match.competition_id)?.name || 'Unknown Competition'
        }
      }))

      setMatches(transformedMatches)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      })
    }
  }

  async function handlePostponeMatches() {
    try {
      const newDate = new Date()
      newDate.setDate(newDate.getDate() + 7) // Default postpone by 1 week

      const { error } = await supabase
        .from('matches')
        .update({
          status: 'postponed',
          postponed_from: new Date().toISOString(),
          match_date: newDate.toISOString()
        })
        .in('id', selectedMatches)

      if (error) throw error

      toast({
        title: "Success",
        description: `Postponed ${selectedMatches.length} matches`,
      })

      fetchMatches()
      setSelectedMatches([])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to postpone matches",
        variant: "destructive",
      })
    }
  }

  async function handleVerifyMatch(matchId: string, homeScore: number, awayScore: number) {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: 'completed'
        })
        .eq('id', matchId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Match result verified",
      })

      fetchMatches()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to verify match",
        variant: "destructive",
      })
    }
  }

  async function handleGenerateFixtures() {
    try {
      if (selectedCompetition === 'all') {
        throw new Error("Please select a specific competition")
      }

      // Get competition settings
      const competition = competitions.find(c => c.id === selectedCompetition)
      if (!competition) {
        throw new Error("Competition not found")
      }

      // Get teams in the competition
      const { data: competitionTeams, error: teamsError } = await supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', selectedCompetition)
        .eq('status', 'active')

      if (teamsError) throw teamsError

      const teamIds = competitionTeams.map(ct => ct.team_id)
      if (teamIds.length < 2) {
        throw new Error("Need at least 2 teams to generate fixtures")
      }

      // Generate fixtures
      const { fixtures, groups } = generateFixtures(teamIds, {
        id: selectedCompetition,
        type: competition.type as CompetitionType,
        frequency: newCompetitionSettings.frequency || 'weekly',
        startDate: newCompetitionSettings.startDate || new Date().toISOString(),
        endDate: newCompetitionSettings.endDate || '',
        numberOfTeams: teamIds.length,
        homeAndAway: newCompetitionSettings.homeAndAway || false,
        groupStage: newCompetitionSettings.groupStage || false,
        numberOfGroups: newCompetitionSettings.numberOfGroups || 0,
        teamsPerGroup: newCompetitionSettings.teamsPerGroup || 0,
        thirdPlacePlayoff: newCompetitionSettings.thirdPlacePlayoff || false
      })

      if (!fixtures || fixtures.length === 0) {
        throw new Error("Failed to generate fixtures")
      }

      // Insert fixtures
      const { error: insertError } = await supabase
        .from('matches')
        .insert(fixtures.map(fixture => ({
          competition_id: selectedCompetition,
          home_team_id: fixture.home_team_id,
          away_team_id: fixture.away_team_id,
          match_date: fixture.match_date,
          status: 'scheduled',
          matchday: fixture.matchday,
          home_team_stats: fixture.home_team_stats || {},
          away_team_stats: fixture.away_team_stats || {}
        })))

      if (insertError) {
        console.error('Error inserting fixtures:', insertError)
        throw new Error(insertError.message)
      }

      // If groups were generated, insert them
      if (groups && groups.length > 0) {
        const { error: groupsError } = await supabase
          .from('competition_groups')
          .insert(groups.map(group => ({
            competition_id: selectedCompetition,
            name: group.name,
            teams: group.teams
          })))

        if (groupsError) {
          console.error('Error inserting groups:', groupsError)
          // Don't throw here, as the fixtures were already inserted
        }
      }

      toast({
        title: "Success",
        description: "Fixtures generated successfully",
      })

      setShowFixtureDialog(false)
      fetchMatches()
    } catch (error: any) {
      console.error('Error generating fixtures:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to generate fixtures",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteFixtures() {
    try {
      if (selectedCompetition === 'all') {
        throw new Error("Please select a specific competition")
      }

      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('competition_id', selectedCompetition)

      if (error) throw error

      toast({
        title: "Success",
        description: "Fixtures deleted successfully",
      })

      fetchMatches()
    } catch (error: any) {
      console.error('Error deleting fixtures:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to delete fixtures",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteAndRegenerate() {
    try {
      await handleDeleteFixtures()
      setShowFixtureDialog(true)
    } catch (error: any) {
      console.error('Error in delete and regenerate:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to delete and regenerate fixtures",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Match Management
          </CardTitle>
          <CardDescription>
            Manage matches, generate fixtures, and verify results
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

            {matches.length > 0 ? (
              <Button
                variant="destructive"
                onClick={handleDeleteAndRegenerate}
                disabled={selectedCompetition === 'all'}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Delete & Regenerate
              </Button>
            ) : (
            <Button
              onClick={() => setShowFixtureDialog(true)}
              disabled={selectedCompetition === 'all'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Fixtures
            </Button>
            )}

            <Button
              variant="outline"
              onClick={handlePostponeMatches}
              disabled={selectedMatches.length === 0}
            >
              <Clock className="h-4 w-4 mr-2" />
              Postpone Selected
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedMatches.length === matches.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMatches(matches.map(m => m.id))
                        } else {
                          setSelectedMatches([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Competition</TableHead>
                  <TableHead>Home Team</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Away Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMatches.includes(match.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMatches([...selectedMatches, match.id])
                          } else {
                            setSelectedMatches(selectedMatches.filter(id => id !== match.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(match.match_date).toLocaleDateString()}
                      {match.postponed_from && (
                        <Badge variant="outline" className="ml-2">
                          Postponed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{match.competition?.name}</TableCell>
                    <TableCell>{match.homeTeam?.name}</TableCell>
                    <TableCell>
                      {match.status === 'completed' && match.home_score !== undefined && match.away_score !== undefined ? (
                        <span className="font-bold">
                          {match.home_score} - {match.away_score}
                        </span>
                      ) : match.status === 'completed' ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Verify Score
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Verify Match Result</DialogTitle>
                              <DialogDescription>
                                Enter and verify the final score for this match
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-3 gap-4 py-4">
                              <div className="text-center">
                                <p className="text-sm font-medium mb-2">{match.homeTeam?.name}</p>
                                <Input
                                  type="number"
                                  min="0"
                                  className="w-20 mx-auto"
                                  placeholder="0"
                                  id={`home-score-${match.id}`}
                                />
                              </div>
                              <div className="text-center self-end">
                                <span className="text-2xl">-</span>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium mb-2">{match.awayTeam?.name}</p>
                                <Input
                                  type="number"
                                  min="0"
                                  className="w-20 mx-auto"
                                  placeholder="0"
                                  id={`away-score-${match.id}`}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => {
                                  const homeScore = parseInt((document.getElementById(`home-score-${match.id}`) as HTMLInputElement).value)
                                  const awayScore = parseInt((document.getElementById(`away-score-${match.id}`) as HTMLInputElement).value)
                                  handleVerifyMatch(match.id, homeScore, awayScore)
                                }}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Verify Result
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{match.awayTeam?.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          match.status === 'completed' ? 'default' :
                          match.status === 'postponed' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {match.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {match.status === 'scheduled' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <CalendarDays className="h-4 w-4 mr-2" />
                              Reschedule
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reschedule Match</DialogTitle>
                              <DialogDescription>
                                Select a new date for this match
                              </DialogDescription>
                            </DialogHeader>
                            <Calendar
                              mode="single"
                              selected={new Date(match.match_date)}
                              onSelect={async (date) => {
                                if (!date) return
                                try {
                                  const { error } = await supabase
                                    .from('matches')
                                    .update({ match_date: date.toISOString() })
                                    .eq('id', match.id)

                                  if (error) throw error

                                  toast({
                                    title: "Success",
                                    description: "Match rescheduled",
                                  })

                                  fetchMatches()
                                } catch (error: any) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to reschedule match",
                                    variant: "destructive",
                                  })
                                }
                              }}
                              disabled={(date) => date < new Date()}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showFixtureDialog} onOpenChange={setShowFixtureDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Fixtures</DialogTitle>
            <DialogDescription>
              Configure the fixture generation settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Type</label>
              <Select
                value={newCompetitionSettings.type}
                onValueChange={(value: CompetitionType) => 
                  setNewCompetitionSettings({ ...newCompetitionSettings, type: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select competition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="league">League</SelectItem>
                  <SelectItem value="cup">Cup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Frequency</label>
              <Select
                value={newCompetitionSettings.frequency}
                onValueChange={(value: CompetitionFrequency) =>
                  setNewCompetitionSettings({ ...newCompetitionSettings, frequency: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select match frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newCompetitionSettings.type === 'league' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Format</label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox
                    id="homeAndAway"
                    checked={newCompetitionSettings.homeAndAway}
                    onCheckedChange={(checked) =>
                      setNewCompetitionSettings({ ...newCompetitionSettings, homeAndAway: !!checked })
                    }
                  />
                  <label htmlFor="homeAndAway" className="text-sm">
                    Home and Away fixtures
                  </label>
                </div>
              </div>
            )}

            {newCompetitionSettings.type === 'cup' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Group Stage</label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Checkbox
                      id="groupStage"
                      checked={newCompetitionSettings.groupStage}
                      onCheckedChange={(checked) =>
                        setNewCompetitionSettings({
                          ...newCompetitionSettings,
                          groupStage: !!checked
                        })
                      }
                    />
                    <label htmlFor="groupStage" className="text-sm">
                      Include group stage
                    </label>
                  </div>
                </div>

                {newCompetitionSettings.groupStage && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Groups</label>
                  <Input
                    type="number"
                    min="2"
                    value={newCompetitionSettings.numberOfGroups || 2}
                    onChange={(e) =>
                      setNewCompetitionSettings({
                        ...newCompetitionSettings,
                        numberOfGroups: parseInt(e.target.value)
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Teams per Group</label>
                  <Input
                    type="number"
                    min="2"
                    value={newCompetitionSettings.teamsPerGroup || 4}
                    onChange={(e) =>
                      setNewCompetitionSettings({
                        ...newCompetitionSettings,
                        teamsPerGroup: parseInt(e.target.value)
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </>
            )}

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">3rd Place</label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox
                    id="thirdPlace"
                    checked={newCompetitionSettings.thirdPlacePlayoff}
                    onCheckedChange={(checked) =>
                      setNewCompetitionSettings({
                        ...newCompetitionSettings,
                        thirdPlacePlayoff: !!checked
                      })
                    }
                  />
                  <label htmlFor="thirdPlace" className="text-sm">
                    Include third place playoff
                  </label>
                </div>
              </div>
              </>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Start Date</label>
              <div className="col-span-3">
                <Calendar
                  mode="single"
                  selected={newCompetitionSettings.startDate ? new Date(newCompetitionSettings.startDate) : undefined}
                  onSelect={(date) =>
                    setNewCompetitionSettings({
                      ...newCompetitionSettings,
                      startDate: date?.toISOString()
                    })
                  }
                  disabled={(date) => date < new Date()}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleGenerateFixtures}
              disabled={isGeneratingFixtures || !newCompetitionSettings.startDate}
            >
              {isGeneratingFixtures && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Generate Fixtures
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
