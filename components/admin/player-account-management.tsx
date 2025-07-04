"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserCog, Edit, Search, Crown, Gamepad2 } from "lucide-react"
import { Loading } from "@/components/loading"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

interface PlayerAccount {
  id: string
  display_name: string | null
  username: string | null
  email?: string
  user_type: 'manager' | 'player'
  xbox_gamertag?: string | null
  psn_tag?: string | null
  team_id: string | null
  team_name: string | null
  position: string | null
  player_number: number | null
  created_at: string
  updated_at: string
}

interface Team {
  id: string
  name: string
}

export function PlayerAccountManagement() {
  const [players, setPlayers] = useState<PlayerAccount[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterByType, setFilterByType] = useState<string>("all")
  const [filterByTeam, setFilterByTeam] = useState<string>("all")
  const [editingPlayer, setEditingPlayer] = useState<PlayerAccount | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    loadPlayers()
    loadTeams()
  }, [])

  async function loadPlayers() {
    try {
      setLoading(true)
      console.log('[PlayerAccounts] Loading managers and players...')

      // Get only managers and players
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          display_name,
          username,
          user_type,
          xbox_gamertag,
          psn_tag,
          created_at,
          updated_at
        `)
        .in('user_type', ['manager', 'player'])
        .order('created_at', { ascending: false })

      console.log('[PlayerAccounts] Profiles loaded:', { count: profiles?.length, profiles })

      if (profilesError) {
        console.error('[PlayerAccounts] Error loading profiles:', profilesError)
        throw profilesError
      }

      // Get player details with team and position info
      let playerDetails: any[] = []
      try {
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select(`
            user_id,
            team_id,
            position,
            number,
            teams (
              id,
              name
            )
          `)

        console.log('[PlayerAccounts] Player details loaded:', { playerData, playerError })

        if (playerError) {
          console.warn('[PlayerAccounts] Player details query failed:', playerError)
        } else {
          playerDetails = playerData || []
        }
      } catch (error) {
        console.warn('[PlayerAccounts] Failed to load player details:', error)
      }

      // Create a map of user_id to player info
      const playerMap = new Map(
        playerDetails.map(player => [
          player.user_id,
          {
            team_id: player.team_id,
            team_name: (player.teams as any)?.name || null,
            position: player.position,
            player_number: player.number
          }
        ])
      )

      // Combine the data and ensure no empty strings
      const combinedData = (profiles || []).map(profile => ({
        ...profile,
        team_id: playerMap.get(profile.id)?.team_id || null,
        team_name: playerMap.get(profile.id)?.team_name || null,
        position: playerMap.get(profile.id)?.position || null,
        player_number: playerMap.get(profile.id)?.player_number || null,
      }))

      console.log('[PlayerAccounts] Final data:', { count: combinedData.length, combinedData })
      setPlayers(combinedData)
    } catch (error: any) {
      console.error('[PlayerAccounts] Error loading players:', error)
      toast({
        title: "Error loading players",
        description: error.message || "Failed to load player accounts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadTeams() {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name')

      if (error) throw error
      setTeams(data || [])
    } catch (error: any) {
      console.error('Error loading teams:', error)
    }
  }

  async function updatePlayerAccount(updatedPlayer: PlayerAccount) {
    try {
      console.log('[UpdatePlayer] Starting update for:', updatedPlayer.id, updatedPlayer)

      // Update user profile
      console.log('[UpdatePlayer] Updating user profile...')
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            display_name: updatedPlayer.display_name,
            username: updatedPlayer.username,
            user_type: updatedPlayer.user_type,
            xbox_gamertag: updatedPlayer.xbox_gamertag,
            psn_tag: updatedPlayer.psn_tag,
          })
          .eq('id', updatedPlayer.id)

        if (profileError) {
          console.error('[UpdatePlayer] Profile update error:', profileError)
          throw new Error(`Profile update failed: ${profileError.message}`)
        }
        console.log('[UpdatePlayer] Profile updated successfully')
      } catch (err) {
        console.error('[UpdatePlayer] Profile update caught error:', err)
        throw err
      }

      // Update or create player record if user_type is 'player'
      if (updatedPlayer.user_type === 'player') {
        console.log('[UpdatePlayer] Handling player record...')
        
        try {
                  // Check if player record exists
        const { data: existingPlayer, error: findError } = await supabase
          .from('players')
          .select('id')
          .eq('user_id', updatedPlayer.id)
          .maybeSingle()

        if (findError) {
          console.error('[UpdatePlayer] Error finding existing player:', findError)
          throw new Error(`Find player failed: ${findError.message}`)
        }

          if (existingPlayer) {
            console.log('[UpdatePlayer] Updating existing player record...')
            // Update existing player
            const { error: playerError } = await supabase
              .from('players')
              .update({
                position: updatedPlayer.position,
                number: updatedPlayer.player_number,
                team_id: updatedPlayer.team_id,
              })
              .eq('user_id', updatedPlayer.id)

            if (playerError) {
              console.error('[UpdatePlayer] Player update error:', playerError)
              throw new Error(`Player update failed: ${playerError.message}`)
            }
            console.log('[UpdatePlayer] Player updated successfully')
          } else if (updatedPlayer.position) {
            console.log('[UpdatePlayer] Creating new player record...')
            // Create new player record only if position is set
            const { error: playerError } = await supabase
              .from('players')
              .insert({
                user_id: updatedPlayer.id,
                position: updatedPlayer.position,
                number: updatedPlayer.player_number,
                team_id: updatedPlayer.team_id,
                status: 'active'
              })

            if (playerError) {
              console.error('[UpdatePlayer] Player insert error:', playerError)
              throw new Error(`Player insert failed: ${playerError.message}`)
            }
            console.log('[UpdatePlayer] Player created successfully')
          }
        } catch (err) {
          console.error('[UpdatePlayer] Player operations caught error:', err)
          throw err
        }
      }

      console.log('[UpdatePlayer] All updates completed, reloading data...')
      try {
        await loadPlayers()
      } catch (err) {
        console.error('[UpdatePlayer] Error reloading data:', err)
        // Don't throw here, as the update was successful
      }
      
      toast({
        title: "Success",
        description: "Player account updated successfully",
      })

      setIsEditDialogOpen(false)
      setEditingPlayer(null)
    } catch (error: any) {
      console.error('[UpdatePlayer] Caught error type:', typeof error)
      console.error('[UpdatePlayer] Full error object:', error)
      console.error('[UpdatePlayer] Error stringified:', JSON.stringify(error))
      
      let errorMessage = "Failed to update player account"
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.details) {
        errorMessage = error.details
      } else if (error?.code) {
        errorMessage = `Database error (${error.code})`
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      toast({
        title: "Error updating player",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'manager':
        return <Crown className="h-4 w-4" />
      case 'player':
        return <Gamepad2 className="h-4 w-4" />
      default:
        return <Gamepad2 className="h-4 w-4" />
    }
  }

  const getUserTypeBadgeVariant = (userType: string) => {
    switch (userType) {
      case 'manager':
        return 'default'
      case 'player':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getPositionBadgeVariant = (position: string | null) => {
    switch (position) {
      case 'GK':
        return 'destructive'
      case 'DEF':
        return 'secondary'
      case 'MID':
        return 'default'
      case 'FWD':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      (player.display_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (player.username?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (player.xbox_gamertag?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (player.psn_tag?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (player.team_name?.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = filterByType === "all" || player.user_type === filterByType
    const matchesTeam = filterByTeam === "all" || player.team_id === filterByTeam

    return matchesSearch && matchesType && matchesTeam
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
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Player Management
          </CardTitle>
          <CardDescription>
            Manage players and managers, assign positions and teams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Debug info */}
          <div className="text-sm text-muted-foreground">
            Total players loaded: {players.length} | Filtered: {filteredPlayers.length}
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, username, gamertag, or team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterByType} onValueChange={setFilterByType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="player">Player</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterByTeam} onValueChange={setFilterByTeam}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="none">No Team</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Gaming</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {players.length === 0 ? (
                        "No players or managers found"
                      ) : (
                        "No players found matching your criteria"
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlayers.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {player.display_name || "No name"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{player.username || "no-username"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getUserTypeBadgeVariant(player.user_type)}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getUserTypeIcon(player.user_type)}
                          {player.user_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {player.team_name ? (
                          <span className="text-sm">{player.team_name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">No team</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {player.position ? (
                          <Badge variant={getPositionBadgeVariant(player.position)}>
                            {player.position}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {player.player_number ? (
                          <span className="font-mono">#{player.player_number}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {player.xbox_gamertag && (
                            <div>Xbox: {player.xbox_gamertag}</div>
                          )}
                          {player.psn_tag && (
                            <div>PSN: {player.psn_tag}</div>
                          )}
                          {!player.xbox_gamertag && !player.psn_tag && (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPlayer(player)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredPlayers.length} of {players.length} accounts
          </div>
        </CardContent>
      </Card>

      {/* Edit Player Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Player Account</DialogTitle>
            <DialogDescription>
              Update player information, position, and team assignment
            </DialogDescription>
          </DialogHeader>
          
          {editingPlayer && (
            <EditPlayerForm 
              player={editingPlayer} 
              teams={teams}
              onSave={updatePlayerAccount} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface EditPlayerFormProps {
  player: PlayerAccount
  teams: Team[]
  onSave: (player: PlayerAccount) => void
}

function EditPlayerForm({ player, teams, onSave }: EditPlayerFormProps) {
  // Ensure no empty strings in initial data
  const [formData, setFormData] = useState<PlayerAccount>({ 
    ...player,
    team_id: player.team_id === "" ? null : player.team_id,
    position: player.position === "" ? null : player.position
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  // Safe value getter for selects
  const getSelectValue = (value: string | null, defaultValue: string = "none") => {
    return value && value !== "" ? value : defaultValue
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="display_name">Full Name</Label>
          <Input
            id="display_name"
            value={formData.display_name || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="user_type">User Type</Label>
          <Select
            value={formData.user_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, user_type: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="player">Player</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="team_id">Team</Label>
          <Select
            value={getSelectValue(formData.team_id)}
            onValueChange={(value) => setFormData(prev => ({ ...prev, team_id: value === "none" ? null : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Team</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.user_type === 'player' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="position">Position</Label>
            <Select
              value={getSelectValue(formData.position)}
              onValueChange={(value) => setFormData(prev => ({ ...prev, position: value === "none" ? null : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Position</SelectItem>
                <SelectItem value="GK">Goalkeeper (GK)</SelectItem>
                <SelectItem value="DEF">Defender (DEF)</SelectItem>
                <SelectItem value="MID">Midfielder (MID)</SelectItem>
                <SelectItem value="FWD">Forward (FWD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="player_number">Jersey Number</Label>
            <Input
              id="player_number"
              type="number"
              min="1"
              max="99"
              value={formData.player_number || ""}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                player_number: e.target.value ? parseInt(e.target.value) : null 
              }))}
              placeholder="1-99"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="xbox_gamertag">Xbox Gamertag</Label>
          <Input
            id="xbox_gamertag"
            value={formData.xbox_gamertag || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, xbox_gamertag: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="psn_tag">PSN ID</Label>
          <Input
            id="psn_tag"
            value={formData.psn_tag || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, psn_tag: e.target.value }))}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  )
} 
