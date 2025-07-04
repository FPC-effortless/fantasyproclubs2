"use client"

import { useState, useEffect } from "react"
import type { Database } from "@/types/database"
import {
  Users,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TeamLogoManager } from './team-logo-manager'
import { TeamPlayersManager } from './team-players-manager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

type TeamRow = {
  id: string
  name: string
  short_name: string
  logo_url: string | null
  description: string | null
  manager_id: string | null
  created_at: string
  updated_at: string
  gaming: any
  manager?: {
    id: string
    display_name: string | null
    email: string
  } | null
}

type Manager = {
  id: string
  display_name: string | null
  email: string
  user_type: string
}

export function TeamManagement() {
  const [teams, setTeams] = useState<TeamRow[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAssignManagerDialogOpen, setIsAssignManagerDialogOpen] = useState(false)
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false)
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false)
  const [isDeleteTeamDialogOpen, setIsDeleteTeamDialogOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newTeam, setNewTeam] = useState({
    name: '',
    short_name: '',
    description: ''
  })
  const [editingTeam, setEditingTeam] = useState({
    name: '',
    short_name: '',
    description: ''
  })
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    const supabase = createClient()
    
    // Check if we're authenticated
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth error:', error)
        setError('Authentication error')
        return
      }
      
      if (!session) {
        setError('Not authenticated')
        return
      }
      
      fetchTeams()
      fetchManagers()
    })
  }, [])

  async function fetchTeams() {
    setError(null)
    const supabase = createClient()
    try {
      console.log('Fetching teams...')
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          manager:user_profiles!manager_id(
            id,
            display_name,
            email
          )
        `)
        .order('name')

      if (teamsError) {
        console.error('Error fetching teams:', teamsError)
        setError(teamsError.message)
        toast({
          title: "Error",
          description: `Failed to load teams: ${teamsError.message}`,
          variant: "destructive",
        })
        return
      }

      console.log('Teams fetched:', teamsData)
      if (teamsData) {
        setTeams(teamsData as unknown as TeamRow[])
      }
    } catch (error: any) {
      console.error('Error in fetchTeams:', error)
      setError(error.message)
      toast({
        title: "Error",
        description: "Failed to load teams. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchManagers() {
    const supabase = createClient()
    try {
      const { data: managersData, error: managersError } = await supabase
        .from('user_profiles')
        .select('id, display_name, email, user_type')
        .eq('user_type', 'manager')
        .order('email')

      if (managersError) throw managersError
      if (managersData) setManagers(managersData)
    } catch (error) {
      console.error('Error fetching managers:', error)
      toast({
        title: "Error",
        description: "Failed to load managers. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleAssignManager = async (teamId: string, managerId: string | null) => {
    const supabase = createClient()
    try {
      let error;
      if (managerId) {
        const { error: assignError } = await supabase
          .rpc('assign_team_manager', {
            p_team_id: teamId,
            p_manager_id: managerId
          })
        error = assignError;
      } else {
        const { error: removeError } = await supabase
          .rpc('remove_team_manager', {
            p_team_id: teamId
          })
        error = removeError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: managerId ? "Manager assigned successfully" : "Manager removed successfully",
      })

      // Refresh teams list
      fetchTeams()
      setIsAssignManagerDialogOpen(false)
    } catch (error: any) {
      console.error('Error managing team manager:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to manage team manager. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddTeam = async () => {
    const supabase = createClient()
    try {
      // Validate input
      if (!newTeam.name) {
        toast({
          title: "Error",
          description: "Team name is required",
          variant: "destructive",
        })
        return
      }

      // Auto-generate short_name if not provided
      const shortName = newTeam.short_name || 
        newTeam.name
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 3)

      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: newTeam.name,
          short_name: shortName,
          description: newTeam.description || null
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      toast({
        title: "Success",
        description: "Team added successfully",
      })

      // Reset form and close dialog
      setNewTeam({ name: '', short_name: '', description: '' })
      setIsAddTeamDialogOpen(false)

      // Refresh teams list
      fetchTeams()
    } catch (error: any) {
      console.error('Error adding team:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add team. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditTeam = async () => {
    const supabase = createClient()
    try {
      if (!selectedTeam) return

      // Validate input
      if (!editingTeam.name || !editingTeam.short_name) {
        toast({
          title: "Error",
          description: "Team name and short name are required",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from('teams')
        .update({
          name: editingTeam.name,
          short_name: editingTeam.short_name,
          description: editingTeam.description || null
        })
        .eq('id', selectedTeam.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Team updated successfully",
      })

      // Reset form and close dialog
      setEditingTeam({ name: '', short_name: '', description: '' })
      setIsEditTeamDialogOpen(false)
      setSelectedTeam(null)

      // Refresh teams list
      fetchTeams()
    } catch (error: any) {
      console.error('Error updating team:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update team. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (team: TeamRow) => {
    setSelectedTeam(team)
    setEditingTeam({
      name: team.name,
      short_name: team.short_name,
      description: team.description || ''
    })
    setIsEditTeamDialogOpen(true)
  }

  const handleDeleteTeam = async () => {
    const supabase = createClient()
    try {
      if (!selectedTeam) return

      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', selectedTeam.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Team deleted successfully",
      })

      setIsDeleteTeamDialogOpen(false)
      setSelectedTeam(null)

      // Refresh teams list
      fetchTeams()
    } catch (error: any) {
      console.error('Error deleting team:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete team. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.short_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <Input
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        <Button onClick={() => setIsAddTeamDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      </div>

      {/* Add Team Dialog */}
      <Dialog open={isAddTeamDialogOpen} onOpenChange={setIsAddTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
            <DialogDescription>
              Create a new team. You can assign a manager later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Team Name</label>
              <Input
                id="name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="short_name" className="text-sm font-medium">Short Name (Optional)</label>
              <Input
                id="short_name"
                value={newTeam.short_name}
                onChange={(e) => setNewTeam({ ...newTeam, short_name: e.target.value.toUpperCase() })}
                placeholder="Auto-generated if empty"
                maxLength={3}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to auto-generate from team name
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input
                id="description"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                placeholder="Enter team description (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTeamDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTeam}>
              Add Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={isEditTeamDialogOpen} onOpenChange={setIsEditTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">Team Name</label>
              <Input
                id="edit-name"
                value={editingTeam.name}
                onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-short-name" className="text-sm font-medium">Short Name</label>
              <Input
                id="edit-short-name"
                value={editingTeam.short_name}
                onChange={(e) => setEditingTeam({ ...editingTeam, short_name: e.target.value })}
                placeholder="Enter short name"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
              <Input
                id="edit-description"
                value={editingTeam.description}
                onChange={(e) => setEditingTeam({ ...editingTeam, description: e.target.value })}
                placeholder="Enter team description (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditTeamDialogOpen(false)
              setSelectedTeam(null)
              setEditingTeam({ name: '', short_name: '', description: '' })
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditTeam}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={isDeleteTeamDialogOpen} onOpenChange={setIsDeleteTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteTeamDialogOpen(false)
              setSelectedTeam(null)
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam}>
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No teams found</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="details">Team Details</TabsTrigger>
            <TabsTrigger value="logos">Team Logos</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Short Name</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeams.map((team) => (
                    <TableRow 
                      key={team.id} 
                      className={selectedTeam?.id === team.id ? "bg-muted" : undefined}
                      onClick={() => {
                        setSelectedTeam(team)
                        if (activeTab === "players") {
                          setActiveTab("players")
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>{team.short_name}</TableCell>
                      <TableCell>
                        {team.manager?.display_name || team.manager?.email || 'No manager'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTeam(team)
                              setIsAssignManagerDialogOpen(true)
                            }}
                          >
                            {team.manager ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditClick(team)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTeam(team)
                              setIsDeleteTeamDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="logos">
            <TeamLogoManager teams={teams} onTeamUpdate={fetchTeams} />
          </TabsContent>

          <TabsContent value="players">
            {selectedTeam ? (
              <TeamPlayersManager team={selectedTeam} onTeamUpdate={fetchTeams} />
            ) : (
              <Card className="p-6">
                <p className="text-center text-gray-500">Select a team from the Team Details tab to manage its players</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Assign Manager Dialog */}
      <Dialog open={isAssignManagerDialogOpen} onOpenChange={setIsAssignManagerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Team Manager</DialogTitle>
            <DialogDescription>
              {selectedTeam?.manager ? 'Change or remove the manager for this team.' : 'Assign a manager to this team.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Team</h3>
              <p className="text-sm">{selectedTeam?.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Current Manager</h3>
              <p className="text-sm">{selectedTeam?.manager?.display_name || selectedTeam?.manager?.email || 'No manager assigned'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Manager</label>
              <Select
                onValueChange={(value) => handleAssignManager(selectedTeam?.id || '', value === 'none' ? null : value)}
                defaultValue={selectedTeam?.manager_id || 'none'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Manager</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.display_name || manager.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignManagerDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
