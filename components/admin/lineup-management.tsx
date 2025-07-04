"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Clipboard, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Trophy,
  Search,
  Save,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Unlock,
  Eye
} from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { formations, Formation } from "@/lib/formations"
import { AdminDebugger } from "@/lib/debug-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface Team {
  id: string
  name: string
  short_name: string
}

interface Player {
  id: string
  user_id: string
  display_name: string
  position: string
  number: number | null
  team_id: string
}

interface Lineup {
  id: string
  team_id: string
  team_name: string
  formation: string
  name: string
  is_default: boolean
  match_id?: string
  created_at: string
  updated_at: string
  lineup_players: LineupPlayer[]
  // New fields for deadline management
  submitted_at?: string
  submission_deadline?: string
  verification_status: 'pending' | 'verified' | 'rejected' | 'draft'
  verified_by?: string
  verified_at?: string
  admin_override_allowed: boolean
  kickoff_time?: string
  match_name?: string
}

interface LineupPlayer {
  id: string
  lineup_id: string
  player_id: string | null
  position: string
  player_order: number
  is_ai_player: boolean
  ai_player_name?: string
  player?: Player
}

export function LineupManagement() {
  const { supabase, session } = useSupabase()
  const [teams, setTeams] = useState<Team[]>([])
  const [lineups, setLineups] = useState<Lineup[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterByTeam, setFilterByTeam] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingLineup, setEditingLineup] = useState<Lineup | null>(null)
  const [selectedFormation, setSelectedFormation] = useState<Formation>(formations[0])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      console.log('🚀 [LineupManagement] Initializing...')
      
      const debug = new AdminDebugger('LineupManagement', supabase, session)
      debug.logComponentStart()
      
      await debug.debugAuthentication()
      
      await Promise.all([
        loadTeams(),
        loadLineups(), 
        loadPlayers()
      ])
      
      console.log('🎯 [LineupManagement] Loading complete')
    } catch (error) {
      console.error('💥 [LineupManagement] Loading failed:', error)
      toast({
        title: "Error loading data",
        description: "Failed to load lineup management data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadTeams() {
    console.log('📊 [LineupManagement] Loading teams...')
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, short_name')
      .order('name')

    if (error) {
      console.error('❌ [LineupManagement] Teams error:', error)
      throw error
    }
    
    console.log('✅ [LineupManagement] Teams: ' + (data?.length || 0) + ' items')
    setTeams(data || [])
  }

  async function loadLineups() {
    const { data, error } = await supabase
      .from('lineups')
      .select(`
        *,
        teams(name),
        lineup_players(
          *,
          players(
            *,
            user_profiles(display_name)
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading lineups:', error)
      setLineups([])
      return
    }
    
    console.log('Raw lineup data:', data)
    
    const formattedLineups = data?.map(lineup => ({
      ...lineup,
      team_name: lineup.teams?.name || 'Unknown Team',
      lineup_players: lineup.lineup_players?.map((lp: any) => ({
        ...lp,
        player: lp.is_ai_player ? null : {
          ...lp.players,
          display_name: lp.players?.user_profiles?.display_name || 'Unknown Player'
        }
      })) || []
    })) || []

    console.log('Formatted lineups:', formattedLineups)
    setLineups(formattedLineups)
  }

  async function loadPlayers() {
    console.log('📊 [LineupManagement] Loading players...')
    
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        user_profiles(display_name),
        teams(name)
      `)
      .order('number')

    if (error) {
      console.error('❌ [LineupManagement] Players error:', error)
      throw error
    }
    
    console.log('✅ [LineupManagement] Players: ' + (data?.length || 0) + ' items')
    
    const formattedPlayers = data?.map(player => ({
      ...player,
      display_name: player.user_profiles?.display_name || 'Unknown Player'
    })) || []

    setPlayers(formattedPlayers)
  }

  async function duplicateLineup(lineup: Lineup) {
    try {
      // Create new lineup
      const { data: newLineup, error: lineupError } = await supabase
        .from('lineups')
        .insert({
          team_id: lineup.team_id,
          formation: lineup.formation,
          name: `${lineup.name} (Copy)`,
          is_default: false
        })
        .select()
        .single()

      if (lineupError) throw lineupError

      // Copy lineup players
      if (lineup.lineup_players.length > 0) {
        const lineupPlayers = lineup.lineup_players.map(lp => ({
          lineup_id: newLineup.id,
          player_id: lp.player_id,
          position: lp.position,
          player_order: lp.player_order
        }))

        const { error: playersError } = await supabase
          .from('lineup_players')
          .insert(lineupPlayers)

        if (playersError) throw playersError
      }

      toast({
        title: "Success",
        description: "Lineup duplicated successfully",
      })

      loadLineups()
    } catch (error: any) {
      console.error('Error duplicating lineup:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate lineup",
        variant: "destructive",
      })
    }
  }

  async function deleteLineup(id: string) {
    try {
      const { error } = await supabase
        .from('lineups')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Lineup deleted successfully",
      })

      loadLineups()
    } catch (error: any) {
      console.error('Error deleting lineup:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete lineup",
        variant: "destructive",
      })
    }
  }

  async function verifyLineup(lineupId: string, status: 'verified' | 'rejected') {
    try {
      const { error } = await supabase
        .from('lineups')
        .update({
          verification_status: status,
          verified_at: new Date().toISOString(),
          // verified_by would be set to current admin user
        })
        .eq('id', lineupId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Lineup ${status} successfully`,
      })

      loadLineups()
    } catch (error: any) {
      console.error('Error verifying lineup:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to verify lineup",
        variant: "destructive",
      })
    }
  }

  async function toggleAdminOverride(lineupId: string, currentOverride: boolean) {
    try {
      const { error } = await supabase
        .from('lineups')
        .update({
          admin_override_allowed: !currentOverride
        })
        .eq('id', lineupId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Admin override ${!currentOverride ? 'enabled' : 'disabled'} for lineup`,
      })

      loadLineups()
    } catch (error: any) {
      console.error('Error toggling admin override:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to toggle admin override",
        variant: "destructive",
      })
    }
  }

  function getDeadlineStatus(lineup: Lineup) {
    if (!lineup.kickoff_time) return 'no-deadline'
    
    const kickoffTime = new Date(lineup.kickoff_time)
    const deadlineTime = new Date(kickoffTime.getTime() - 3 * 60 * 60 * 1000) // 3 hours before
    const now = new Date()
    
    if (now > deadlineTime && !lineup.admin_override_allowed) {
      return 'deadline-passed'
    } else if (now > deadlineTime && lineup.admin_override_allowed) {
      return 'override-allowed'
    } else {
      return 'within-deadline'
    }
  }

  function getTimeUntilDeadline(lineup: Lineup) {
    if (!lineup.kickoff_time) return null
    
    const kickoffTime = new Date(lineup.kickoff_time)
    const deadlineTime = new Date(kickoffTime.getTime() - 3 * 60 * 60 * 1000)
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

  function getVerificationBadge(status: string) {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">Draft</Badge>
    }
  }



  const filteredLineups = lineups.filter(lineup => {
    const matchesSearch = 
      lineup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lineup.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lineup.formation.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTeam = filterByTeam === "all" || lineup.team_id === filterByTeam

    return matchesSearch && matchesTeam
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="h-5 w-5" />
                Lineup Management
              </CardTitle>
              <CardDescription>
                Create and manage team lineups and formations
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Lineup
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Debug info */}
          <div className="text-sm text-muted-foreground">
            Total lineups: {lineups.length} | Filtered: {filteredLineups.length} | Available players: {players.length}
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lineups by name, team, or formation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterByTeam} onValueChange={setFilterByTeam}>
              <SelectTrigger className="w-[200px]">
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

          {/* Lineups Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lineup Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Formation</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLineups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {lineups.length === 0 ? (
                        <div className="space-y-4">
                          <p>No lineups found.</p>
                          <p className="text-sm">Teams available: {teams.length}</p>
                          <Button
                            onClick={async () => {
                              if (teams.length > 0) {
                                try {
                                  // Create a test lineup for the first team
                                  const { error } = await supabase
                                    .from('lineups')
                                    .insert({
                                      team_id: teams[0].id,
                                      formation: '4-3-3',
                                      name: `${teams[0].name} - Default Formation`,
                                      is_default: true,
                                      verification_status: 'draft'
                                    })
                                  
                                  if (error) throw error
                                  
                                  toast({
                                    title: "Success",
                                    description: "Test lineup created",
                                  })
                                  
                                  loadLineups()
                                } catch (error: any) {
                                  console.error('Error creating test lineup:', error)
                                  toast({
                                    title: "Error",
                                    description: error.message || "Failed to create test lineup",
                                    variant: "destructive",
                                  })
                                }
                              } else {
                                toast({
                                  title: "No Teams",
                                  description: "Please create teams first before creating lineups",
                                  variant: "destructive",
                                })
                              }
                            }}
                            className="mt-2"
                          >
                            Create Test Lineup
                          </Button>
                        </div>
                      ) : (
                        "No lineups found matching your criteria"
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLineups.map((lineup) => (
                    <TableRow key={lineup.id}>
                      <TableCell>
                        <div className="font-medium">{lineup.name}</div>
                        {lineup.match_id && (
                          <div className="text-sm text-muted-foreground">
                            Match-specific lineup
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          {lineup.team_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{lineup.formation}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {lineup.lineup_players.length}/11
                        </div>
                      </TableCell>
                      <TableCell>
                        {getVerificationBadge(lineup.verification_status || 'draft')}
                      </TableCell>
                      <TableCell>
                        {lineup.kickoff_time ? (
                          <div className="space-y-1">
                            <div className="text-sm">
                              {getTimeUntilDeadline(lineup) ? (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {getTimeUntilDeadline(lineup)} left
                                </span>
                              ) : (
                                <span className="text-red-500 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Deadline passed
                                </span>
                              )}
                            </div>
                            {lineup.admin_override_allowed && (
                              <Badge variant="outline" className="text-xs">
                                <Unlock className="h-2 w-2 mr-1" />
                                Override enabled
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No deadline</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lineup.is_default ? (
                          <Badge variant="default">Default</Badge>
                        ) : (
                          <Badge variant="secondary">Custom</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {/* Verification Actions */}
                          {lineup.verification_status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => verifyLineup(lineup.id, 'verified')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => verifyLineup(lineup.id, 'rejected')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {/* Override Toggle */}
                          {lineup.kickoff_time && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleAdminOverride(lineup.id, lineup.admin_override_allowed)}
                              className={lineup.admin_override_allowed ? "text-orange-600" : "text-gray-600"}
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Standard Actions */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingLineup(lineup)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateLineup(lineup)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteLineup(lineup.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Formation Preview */}
          {lineups.length === 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Formation Preview</CardTitle>
                <CardDescription>
                  Here&apos;s what a {selectedFormation.name} formation looks like
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  {formations.map((formation) => (
                    <Button
                      key={formation.name}
                      variant={selectedFormation.name === formation.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFormation(formation)}
                    >
                      {formation.name}
                    </Button>
                  ))}
                </div>
                
                <div className="relative bg-green-100 rounded-lg aspect-[3/4] border-2 border-green-300 overflow-hidden max-w-md mx-auto">
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
                        className="absolute w-8 h-8 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                        style={{
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        title={pos.position}
                      >
                        {pos.label}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Lineup Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          setEditingLineup(null)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLineup ? 'Edit Lineup' : 'Create New Lineup'}
            </DialogTitle>
            <DialogDescription>
              Set up team formation and assign players to positions
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lineup Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="lineup-name">Lineup Name</Label>
                <Input
                  id="lineup-name"
                  placeholder="e.g., Home Formation, Away Setup"
                />
              </div>
              
              <div>
                <Label htmlFor="team-select">Team</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="formation-select">Formation</Label>
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
                      No players available. Players need to be assigned to teams first.
                    </p>
                  ) : (
                    players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer"
                        draggable
                      >
                        <div>
                          <div className="font-medium">{player.display_name}</div>
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
                {/* Football pitch styling */}
                <div className="absolute inset-0 bg-gradient-to-b from-green-200 to-green-300">
                  {/* Center circle */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white rounded-full"></div>
                  {/* Penalty areas */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 border-2 border-white border-t-0"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-8 border-2 border-white border-b-0"></div>
                  
                  {/* Position dots */}
                  {selectedFormation.positions.map((pos, index) => (
                    <div
                      key={index}
                      className="absolute w-10 h-10 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg cursor-pointer hover:bg-blue-600 transition-colors"
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
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false)
              setIsEditDialogOpen(false)
              setEditingLineup(null)
            }}>
              Cancel
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              {editingLineup ? 'Update Lineup' : 'Create Lineup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
