'use client'

import { useState, useEffect } from 'react'
import type { Database } from '@/types/database'
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
import { UserPlus, UserMinus, Search, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

type Team = Database['public']['Tables']['teams']['Row']

type DatabasePlayer = {
  id: string
  user_id: string
  team_id: string
  position: string
  number: number
  status: string
  user_profiles: {
    display_name: string | null
    username: string | null
    gaming: {
      psn_id: string | null
      xbox_gamertag: string | null
      preferred_platform: string
    }
  }
}

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface Player {
  id: string
  user_id: string
  team_id: string
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  number: number
  status: 'active' | 'injured' | 'suspended' | 'inactive'
  user_profiles: {
    display_name: string | null
    username: string | null
    gaming: {
      psn_id: string | null
      xbox_gamertag: string | null
      preferred_platform: string
    }
  }
}

interface AvailablePlayer {
  id: string
  display_name: string | null
  username: string | null
  user_type: string
}

interface TeamWithManager {
  id: string
  manager_id: string
  manager: {
    user_id: string
  } | null
}

interface TeamPlayersManagerProps {
  team: Team
  onTeamUpdate?: () => void
}

export function TeamPlayersManager({ team, onTeamUpdate }: TeamPlayersManagerProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [availablePlayers, setAvailablePlayers] = useState<AvailablePlayer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogSearchQuery, setDialogSearchQuery] = useState("")
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (team) {
      fetchTeamPlayers()
    }
  }, [team])

  useEffect(() => {
    if (isAddPlayerDialogOpen) {
      fetchAvailablePlayers()
      setDialogSearchQuery("")
    }
  }, [isAddPlayerDialogOpen])

  const fetchTeamPlayers = async () => {
    try {
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select(`
          *,
          user_profiles (*)
        `)
        .eq('team_id', team.id)
        .throwOnError()

      if (playersError) {
        console.error('Error fetching team players:', playersError)
        throw playersError
      }

      if (!playersData) {
        throw new Error('No players data returned')
      }

      console.log('Raw players data:', playersData)

      const transformedPlayers = (playersData as unknown as Array<{
        id: string
        user_id: string
        team_id: string
        position: string
        number: number
        status: string
        user_profiles: {
          display_name: string | null
          username: string | null
          gaming: {
            psn_id: string | null
            xbox_gamertag: string | null
            preferred_platform: string
          }
        }
      }>).map(player => ({
        id: player.id,
        user_id: player.user_id,
        team_id: player.team_id,
        position: player.position as 'GK' | 'DEF' | 'MID' | 'FWD',
        number: player.number,
        status: player.status as 'active' | 'injured' | 'suspended' | 'inactive',
        user_profiles: {
          display_name: player.user_profiles?.display_name || null,
          username: player.user_profiles?.username || null,
          gaming: player.user_profiles?.gaming || {
            psn_id: null,
            xbox_gamertag: null,
            preferred_platform: 'both'
          }
        }
      }))

      setPlayers(transformedPlayers)
    } catch (error: any) {
      console.error('Error fetching team players:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load team players",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailablePlayers = async () => {
    try {
      console.log('Fetching available players for team:', team.id)
      
      // Get ALL users with user_type = 'player'
      const { data: allPlayers, error: playersError } = await supabase
        .from('user_profiles')
        .select('id, display_name, username, user_type')
        .eq('user_type', 'player')

      if (playersError) {
        console.error('Error fetching all players:', playersError)
        throw playersError
      }

      // Get existing players for this team
      const { data: existingPlayers, error: existingError } = await supabase
        .from('players')
        .select('user_id')
        .eq('team_id', team.id)

      if (existingError) {
        console.error('Error fetching existing players:', existingError)
        throw existingError
      }

      // Filter out existing players on the client side
      const existingUserIds = existingPlayers?.map(p => p.user_id) || []
      const availablePlayersData = allPlayers?.filter(player => 
        !existingUserIds.includes(player.id)
      ) || []

      console.log('All players:', allPlayers?.length)
      console.log('Existing player IDs:', existingUserIds)
      console.log('Available players:', availablePlayersData.length)
      
      setAvailablePlayers(availablePlayersData)
    } catch (error: any) {
      console.error('Error in fetchAvailablePlayers:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to load available players",
        variant: "destructive",
      })
    }
  }

  const handleAddPlayer = async (userId: string) => {
    try {
      // Validate inputs
      if (!userId || !team?.id) {
        throw new Error('Missing required data: userId or teamId')
      }

      // Get the current user's auth ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to add players')
      }

      console.log('Current user ID:', user.id)

      // Get the current user's profile to check if they're an admin
      const { data: userProfile, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('user_type, id')
        .eq('id', user.id)
        .single()

      if (userProfileError) {
        console.error('Error fetching user profile:', userProfileError)
        throw userProfileError
      }

      if (!userProfile) {
        throw new Error('User profile not found')
      }

      console.log('User profile data:', userProfile)

      // Get the team to verify manager
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select(`
          id,
          manager_id
        `)
        .eq('id', team.id)
        .single()

      if (teamError) {
        console.error('Error fetching team:', teamError)
        throw teamError
      }

      if (!teamData) {
        throw new Error('Team not found')
      }

      console.log('Team data:', teamData)

      // Check if the user is either an admin or the team manager
      const isAdmin = userProfile.user_type === 'admin'
      const isTeamManager = teamData.manager_id === userProfile.id

      console.log('Auth checks:', {
        userType: userProfile.user_type,
        isAdmin,
        managerId: teamData.manager_id,
        userProfileId: userProfile.id,
        isTeamManager
      })

      if (!isAdmin && !isTeamManager) {
        throw new Error('Only team managers and admins can add players')
      }

      // Get the next available number
      const { data: maxNumberData, error: maxNumberError } = await supabase
        .from('players')
        .select('number')
        .eq('team_id', team.id)
        .order('number', { ascending: false })
        .limit(1)
        .throwOnError()

      if (maxNumberError) {
        console.error('Error fetching max number:', maxNumberError)
        throw maxNumberError
      }

      const nextNumber = maxNumberData && maxNumberData.length > 0 ? maxNumberData[0].number + 1 : 1

      // Insert the new player
      const { data: newPlayer, error: insertError } = await supabase
        .from('players')
        .insert({
          user_id: userId,
          team_id: team.id,
          position: 'FWD', // Default position
          number: nextNumber,
          status: 'active'
        })
        .select()
        .throwOnError()
        .single()

      if (insertError) {
        if (insertError.message.includes('row-level security')) {
          throw new Error('You do not have permission to add players to this team. Only team managers can add players.')
        }
        console.error('Error inserting player:', insertError)
        throw insertError
      }

      if (!newPlayer) {
        throw new Error('Player was not created')
      }

      toast({
        title: "Success",
        description: "Player added to team successfully",
      })

      // Refresh the players list
      await fetchTeamPlayers()
      setIsAddPlayerDialogOpen(false)

      // Call the update callback if provided
      if (onTeamUpdate) {
        onTeamUpdate()
      }
    } catch (error: any) {
      console.error('Error adding player:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add player",
        variant: "destructive",
      })
    }
  }

  const handleRemovePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Player removed from team successfully",
      })

      // Refresh the players list
      fetchTeamPlayers()

      // Call the update callback if provided
      if (onTeamUpdate) {
        onTeamUpdate()
      }
    } catch (error: any) {
      console.error('Error removing player:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove player",
        variant: "destructive",
      })
    }
  }

  const filteredPlayers = players.filter(player => {
    const displayName = player.user_profiles?.display_name?.toLowerCase() || ''
    const username = player.user_profiles?.username?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return displayName.includes(query) || username.includes(query)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
        <Button onClick={async () => {
          try {
            console.log('Opening add player dialog...')
            await fetchAvailablePlayers()
            console.log('Available players fetched:', availablePlayers)
            setIsAddPlayerDialogOpen(true)
          } catch (error) {
            console.error('Error opening dialog:', error)
            toast({
              title: "Error",
              description: "Failed to open add player dialog",
              variant: "destructive",
            })
          }
        }}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading players...
                </TableCell>
              </TableRow>
            ) : filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No players found
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>{player.user_profiles?.display_name || 'N/A'}</TableCell>
                  <TableCell>{player.user_profiles?.username || 'N/A'}</TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{player.number}</TableCell>
                  <TableCell>{player.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePlayer(player.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddPlayerDialogOpen} onOpenChange={(open) => {
        setIsAddPlayerDialogOpen(open)
        if (!open) {
          setDialogSearchQuery("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Player to Team</DialogTitle>
            <DialogDescription>
              Select a player to add to {team.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search available players..."
              value={dialogSearchQuery}
              onChange={(e) => setDialogSearchQuery(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availablePlayers
                    .filter(player =>
                      (player.display_name?.toLowerCase().includes(dialogSearchQuery.toLowerCase()) ||
                      player.username?.toLowerCase().includes(dialogSearchQuery.toLowerCase()))
                    )
                    .map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>{player.display_name || 'N/A'}</TableCell>
                        <TableCell>{player.username || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isAddingPlayer}
                            onClick={async () => {
                              try {
                                console.log('Adding player:', player)
                                setIsAddingPlayer(true)
                                await handleAddPlayer(player.id)
                              } catch (error) {
                                console.error('Error in add player button click:', error)
                                toast({
                                  title: "Error",
                                  description: "Failed to add player",
                                  variant: "destructive",
                                })
                              } finally {
                                setIsAddingPlayer(false)
                              }
                            }}
                          >
                            {isAddingPlayer ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserPlus className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPlayerDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
