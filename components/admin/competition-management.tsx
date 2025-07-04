"use client"

import { useState, useEffect } from "react"
import {
  Trophy,
  Calendar,
  Users,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Medal,
  Flag,
  UserPlus,
  UserMinus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePicker } from "@/components/ui/date-picker"
import toast from 'react-hot-toast'
import { TeamLogoManager } from './team-logo-manager'
import { useRouter } from 'next/navigation'
import { Checkbox } from "@/components/ui/checkbox"
import { SwissModelConfigForm } from './swiss-model-config'
import type { SwissModelConfig } from './swiss-model-config'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

type Tables = Database['public']['Tables']
type CompetitionRow = Tables['competitions']['Row']
type CompetitionTeamRow = Tables['competition_teams']['Row']

type CompetitionTeamWithTeam = {
  team_id: string;
  teams: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
}

interface CompetitionWithTeams {
  id: string;
  name: string;
  type: Tables['competitions']['Row']['type'];
  status: Tables['competitions']['Row']['status'];
  start_date: string;
  end_date: string | null;
  max_teams: number;
  created_at: string;
  updated_at: string;
  competition_teams?: CompetitionTeamWithTeam[];
  teams_count?: number;
  matches_played?: number;
  total_matches?: number;
}

interface TeamWithManager {
  id: string
  name: string
  short_name: string
  logo_url: string | null
  description: string | null
  manager_id: string | null
  created_at: string
  updated_at: string
  gaming: any | null
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

interface CompetitionWithRelations {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  start_date: string | null
  end_date: string | null
  max_teams: number | null
  competition_teams: Array<{ team_id: string }>
  matches: Array<{ id: string, status: string }>
}

interface Competition extends Omit<CompetitionRow, 'created_at' | 'updated_at' | 'entry_fee' | 'prize_pool' | 'rules' | 'stream_link' | 'logo_url' | 'country_id'> {
  teams_count: number
  matches_played: number
  total_matches: number
}

// Add validation function
const validateSwissConfig = (config: SwissModelConfig): string | null => {
  if (config.numberOfTeams < 4 || config.numberOfTeams > 64) {
    return 'Number of teams must be between 4 and 64';
  }
  if (config.matchesPerTeam < 3 || config.matchesPerTeam > 10) {
    return 'Matches per team must be between 3 and 10';
  }
  if (config.directQualifiers < 0 || config.directQualifiers > config.numberOfTeams) {
    return 'Direct qualifiers cannot exceed total teams';
  }
  if (config.playoffQualifiers < 0 || config.playoffQualifiers > config.numberOfTeams) {
    return 'Playoff qualifiers cannot exceed total teams';
  }
  if (config.directQualifiers + config.playoffQualifiers > config.numberOfTeams) {
    return 'Total qualifiers cannot exceed number of teams';
  }
  return null;
};

export default function CompetitionManagement() {
  const [competitions, setCompetitions] = useState<CompetitionWithTeams[]>([])
  const [teams, setTeams] = useState<TeamWithManager[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionWithTeams | null>(null)
  const [isManageTeamsDialogOpen, setIsManageTeamsDialogOpen] = useState(false)
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isAddCompetitionDialogOpen, setIsAddCompetitionDialogOpen] = useState(false)
  const [isEditCompetitionDialogOpen, setIsEditCompetitionDialogOpen] = useState(false)
  const [editingCompetition, setEditingCompetition] = useState<CompetitionWithTeams | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAssignManagerDialogOpen, setIsAssignManagerDialogOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamWithManager | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const router = useRouter()
  const [showSwissConfig, setShowSwissConfig] = useState(false)
  const [currentCompetitionId, setCurrentCompetitionId] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    console.log('🚀 [CompetitionManagement] Initializing...')
    fetchCompetitions()
    fetchTeams()
    fetchManagers()
    console.log('🎯 [CompetitionManagement] Loading complete')
  }, [])

  const fetchCompetitions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // First, let's check if the description column exists
      const { data: columnsData, error: columnsError } = await supabase
        .from('competitions')
        .select('id')
        .limit(1)

      if (columnsError) {
        console.error('Error checking competitions table:', columnsError)
        setError(columnsError.message || 'Failed to check competitions table')
        toast.error(`Error: ${columnsError.message || 'Failed to check competitions table'}`)
        return
      }

      const { data: competitionsData, error: competitionsError } = await supabase
        .from('competitions')
        .select(`
          id,
          name,
          type,
          status,
          start_date,
          end_date,
          max_teams,
          created_at,
          updated_at,
          competition_teams (
            team_id,
            teams (
              id,
              name,
              created_at,
              updated_at
            )
          ),
          matches (
            id,
            status
          )
        `)
        .order('created_at', { ascending: false })

      if (competitionsError) {
        console.error('Error fetching competitions:', competitionsError)
        setError(competitionsError.message || 'Failed to fetch competitions')
        toast.error(`Error loading competitions: ${competitionsError.message || 'Unknown error occurred'}`)
        return
      }

      if (!competitionsData) {
        const noDataError = 'No competitions data returned'
        console.error(noDataError)
        setError(noDataError)
        toast.error('Error loading competitions: No data returned')
        return
      }

      // Process the competitions data to include counts
      const processedCompetitions: CompetitionWithTeams[] = competitionsData.map(competition => ({
        id: competition.id,
        name: competition.name,
        type: competition.type as Tables['competitions']['Row']['type'],
        status: competition.status as Tables['competitions']['Row']['status'],
        start_date: competition.start_date,
        end_date: competition.end_date,
        max_teams: competition.max_teams,
        created_at: competition.created_at,
        updated_at: competition.updated_at,
        competition_teams: competition.competition_teams?.map((ct: any) => ({
          team_id: ct.team_id,
          teams: {
            id: ct.teams?.id || '',
            name: ct.teams?.name || '',
            created_at: ct.teams?.created_at || '',
            updated_at: ct.teams?.updated_at || ''
          }
        })) || [],
        teams_count: competition.competition_teams?.length || 0,
        matches_played: competition.matches?.filter(match => match.status === 'completed').length || 0,
        total_matches: competition.matches?.length || 0
      }))

      setCompetitions(processedCompetitions)
    } catch (error) {
      console.error('Unexpected error in fetchCompetitions:', error)
      setError('An unexpected error occurred while fetching competitions')
      toast.error('An unexpected error occurred while fetching competitions')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchTeams() {
    setError(null)
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
        toast.error("Error loading teams: " + (teamsError.message || "Failed to load teams"))
        return
      }

      console.log('Teams data:', teamsData)
      if (teamsData) {
        setTeams(teamsData as TeamWithManager[])
      }
    } catch (error: any) {
      console.error('Error in fetchTeams:', error)
      setError(error.message)
      toast.error("Error loading teams: " + (error.message || "Failed to load teams. Please try again later."))
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchManagers() {
    try {
      const { data: managersData, error: managersError } = await supabase
        .from('user_profiles')
        .select('id, display_name, email, user_type')
        .eq('user_type', 'admin')

      if (managersError) {
        console.error('Error fetching managers:', managersError)
        toast.error("Error loading managers: " + (managersError.message || "Failed to load managers"))
        return
      }

      console.log('Managers data:', managersData)
      if (managersData) {
        setManagers(managersData as Manager[])
      }
    } catch (error: any) {
      console.error('Error in fetchManagers:', error)
      toast.error("Error loading managers: " + (error.message || "Failed to load managers. Please try again later."))
    }
  }

  const handleManageTeams = async (competition: CompetitionWithTeams) => {
    console.log('🎯 [ManageTeams] Opening dialog for competition:', competition.name)
    setSelectedCompetition(competition)
    setIsLoading(true)
    
    // Clear search query for better UX
    setSearchQuery("")
    
    // Fetch teams first to populate the list
    await fetchTeams()
    
    try {
      // Get current teams in the competition
      const { data: existingTeams } = await supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', competition.id)

      console.log('📋 [ManageTeams] Currently registered teams:', existingTeams?.length || 0, existingTeams?.map(t => t.team_id))

      // Set the selected teams
      setSelectedTeams(new Set(existingTeams?.map(t => t.team_id) || []))
      setIsManageTeamsDialogOpen(true)
    } catch (error: any) {
      console.error('Error fetching competition teams:', error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        full: JSON.stringify(error, null, 2),
        stack: error.stack
      } : 'No error object')
      toast.error("Error loading competition teams: " + (error?.message || "Failed to fetch competition teams"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTeams = async () => {
    if (!selectedCompetition) return
    setIsLoading(true)

    try {
      // Check user role first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw new Error('Failed to verify user authentication')
      if (!user) throw new Error('No authenticated user found')

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError ? {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
          full: JSON.stringify(profileError, null, 2)
        } : 'No error object')
        throw new Error('Failed to verify admin access')
      }

      if (!profile || profile.user_type !== 'admin') {
        throw new Error('Only admins can manage competition teams')
      }

      // Check if selected teams have managers
      const { data: teamsWithoutManagers, error: teamsError } = await supabase
        .from('teams')
        .select('name')
        .in('id', Array.from(selectedTeams))
        .is('manager_id', null)

      if (teamsError) {
        console.error('Error checking team managers:', teamsError ? {
          message: teamsError.message,
          code: teamsError.code,
          details: teamsError.details,
          hint: teamsError.hint,
          full: JSON.stringify(teamsError, null, 2)
        } : 'No error object')
        throw new Error('Failed to verify team managers')
      }

      if (teamsWithoutManagers && teamsWithoutManagers.length > 0) {
        const teamNames = teamsWithoutManagers.map(t => t.name).join(', ')
        throw new Error(`The following teams need managers assigned before they can be added to the competition: ${teamNames}`)
      }

      console.log('🔄 [SaveTeams] Calling RPC with:', {
        competition_id: selectedCompetition.id,
        team_ids: Array.from(selectedTeams),
        team_count: selectedTeams.size
      })

      // Call the RPC function to manage teams
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('manage_competition_teams', {
          p_competition_id: selectedCompetition.id,
          p_team_ids: Array.from(selectedTeams)
        })

      console.log('📤 [SaveTeams] RPC Response:', { data: rpcData, error: rpcError })

      if (rpcError) {
        console.error('❌ [SaveTeams] RPC Error:', rpcError ? {
          message: rpcError.message,
          code: rpcError.code,
          details: rpcError.details,
          hint: rpcError.hint,
          full: JSON.stringify(rpcError, null, 2)
        } : 'No error object')
        
        // Provide more specific error messages
        if (rpcError.code === '42883') {
          throw new Error('Database function not found. Please apply the competition teams database fix.')
        } else if (rpcError.code === '42501') {
          throw new Error('Permission denied. Please apply the competition teams database fix.')
        } else {
          throw new Error(rpcError.message || 'Failed to update competition teams. Please apply the database fix.')
        }
      }

      console.log('✅ [SaveTeams] Successfully updated competition teams')

      // Refresh competitions to update the UI
      await fetchCompetitions()
      setIsManageTeamsDialogOpen(false)
      
      toast.success("Teams updated successfully")
    } catch (error: any) {
      console.error('Error saving teams:', error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        full: JSON.stringify(error, null, 2),
        stack: error.stack
      } : 'No error object')
      toast.error("Error saving teams: " + (error?.message || "Failed to save teams. Please try again."))
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTeamSelection = (teamId: string) => {
    const newSelection = new Set(selectedTeams)
    if (newSelection.has(teamId)) {
      newSelection.delete(teamId)
    } else {
      newSelection.add(teamId)
    }
    setSelectedTeams(newSelection)
  }

  const filteredCompetitions = competitions.filter((competition) => {
    const matchesSearch = competition.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || competition.type === selectedType
    const matchesStatus = selectedStatus === "all" || competition.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleAddCompetition = async (formData: FormData) => {
    setIsLoading(true)

    try {
      // Log raw form data for debugging
      console.log('Raw form data:')
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`)
      }
      console.log('Start date:', startDate)
      console.log('End date:', endDate)

      // Validate required fields
      const name = formData.get('name') as string
      const type = formData.get('type') as 'league' | 'cup' | 'friendly' | 'swiss'
      const maxTeams = formData.get('max_teams') ? Number(formData.get('max_teams')) : 16

      if (!name) {
        throw new Error('Competition name is required')
      }
      if (!type) {
        throw new Error('Competition type is required')
      }
      if (!startDate) {
        throw new Error('Start date is required')
      }
      if (isNaN(maxTeams)) {
        throw new Error('Max teams must be a valid number')
      }

      // Only include fields we know exist in the original schema
      const competitionData = {
        name,
        type,
        status: 'upcoming',
        start_date: startDate.toISOString(),
        end_date: endDate?.toISOString() || null,
        max_teams: maxTeams
      }
      
      console.log('Attempting to insert competition with data:', JSON.stringify(competitionData, null, 2))

      try {
        const { data, error } = await supabase
          .from('competitions')
          .insert(competitionData)
          .select()
          .single()

        if (error) {
          console.error('Supabase error:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            fullError: JSON.stringify(error, null, 2)
          })
          throw error
        }

        console.log('Successfully created competition:', data)

        // If it's a Swiss model competition, show the configuration form
        if (type === 'swiss') {
          setShowSwissConfig(true)
          setCurrentCompetitionId(data.id)
        } else {
          // Otherwise just close the dialog
          setIsAddCompetitionDialogOpen(false)
        }

        // Refresh competitions list
        await fetchCompetitions()
        
        toast.success("Competition created successfully")
      } catch (supabaseError: any) {
        console.error('Supabase operation error:', {
          message: supabaseError?.message,
          code: supabaseError?.code,
          details: supabaseError?.details,
          hint: supabaseError?.hint,
          fullError: JSON.stringify(supabaseError, null, 2)
        })
        throw supabaseError
      }
    } catch (error: any) {
      console.error("Top level error:", {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        fullError: JSON.stringify(error, null, 2)
      })
      toast.error("Error creating competition: " + (error?.message || "Failed to create competition"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwissConfigSubmit = async (config: SwissModelConfig) => {
    try {
      // Convert camelCase to snake_case for database
      const dbConfig = {
        swiss_config: {
          number_of_teams: config.numberOfTeams,
          matches_per_team: config.matchesPerTeam,
          same_country_restriction: config.sameCountryRestriction,
          home_away_balance: config.homeAwayBalance,
          direct_qualifiers: config.directQualifiers,
          playoff_qualifiers: config.playoffQualifiers,
          tiebreakers: config.tiebreakers,
          exclusions: config.exclusions
        }
      }

      const { error } = await supabase
        .from('competitions')
        .update({
          metadata: dbConfig
        })
        .eq('id', currentCompetitionId)

      if (error) throw error

      toast.success("Swiss model configuration saved successfully")

      setShowSwissConfig(false)
      setIsAddCompetitionDialogOpen(false)
    } catch (error: any) {
      console.error("Error saving Swiss configuration:", error)
      toast.error("Error saving Swiss configuration: " + (error.message || "Failed to save Swiss configuration"))
    }
  }

  const handleDeleteCompetition = async (competitionId: string) => {
    try {
      // Implementation for deleting competition
      console.log("Deleting competition:", competitionId)
    } catch (error) {
      console.error("Error deleting competition:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "upcoming":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Upcoming
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline">
            <Flag className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "league":
        return (
          <Badge variant="secondary">
            <Trophy className="h-3 w-3 mr-1" />
            League
          </Badge>
        )
      case "cup":
        return (
          <Badge variant="secondary">
            <Medal className="h-3 w-3 mr-1" />
            Cup
          </Badge>
        )
      case "friendly":
        return (
          <Badge variant="secondary">
            <Flag className="h-3 w-3 mr-1" />
            Friendly
          </Badge>
        )
      case "swiss":
        return (
          <Badge variant="secondary">
            <Calendar className="h-3 w-3 mr-1" />
            Swiss Model
          </Badge>
        )
      default:
        return null
    }
  }

  const handleViewDetails = (competition: CompetitionWithTeams) => {
    if (competition.type === 'swiss') {
      router.push(`/admin/competitions/${competition.id}/swiss`)
    } else {
      // Handle other competition types
      console.log("View details for", competition.type, "competition")
    }
  }

  const handleEditCompetition = async (formData: FormData) => {
    if (!editingCompetition) return
    setIsLoading(true)

    try {
      // Validate required fields
      const name = formData.get('name') as string
      const type = formData.get('type') as 'league' | 'cup' | 'friendly' | 'swiss'
      const maxTeams = formData.get('max_teams') ? Number(formData.get('max_teams')) : 16

      if (!name) {
        throw new Error('Competition name is required')
      }
      if (!type) {
        throw new Error('Competition type is required')
      }
      if (!startDate) {
        throw new Error('Start date is required')
      }
      if (isNaN(maxTeams)) {
        throw new Error('Max teams must be a valid number')
      }

      const competitionData = {
        name,
        type,
        start_date: startDate.toISOString(),
        end_date: endDate?.toISOString() || null,
        max_teams: maxTeams
      }

      const { error } = await supabase
        .from('competitions')
        .update(competitionData)
        .eq('id', editingCompetition.id)

      if (error) throw error

      // If it's a Swiss model competition and type changed to swiss, show the configuration form
      if (type === 'swiss' && editingCompetition.type !== 'swiss') {
        setShowSwissConfig(true)
        setCurrentCompetitionId(editingCompetition.id)
      } else {
        setIsEditCompetitionDialogOpen(false)
      }

      // Refresh competitions list
      await fetchCompetitions()
      
      toast.success("Competition updated successfully")
    } catch (error: any) {
      console.error("Error updating competition:", error)
      toast.error("Error updating competition: " + (error.message || "Failed to update competition"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (competition: CompetitionWithTeams) => {
    setEditingCompetition(competition)
    setStartDate(competition.start_date ? new Date(competition.start_date) : undefined)
    setEndDate(competition.end_date ? new Date(competition.end_date) : undefined)
    setIsEditCompetitionDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Competitions</h2>
          <p className="text-muted-foreground">
            Manage your competitions here
          </p>
        </div>
        <Dialog open={isAddCompetitionDialogOpen} onOpenChange={setIsAddCompetitionDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Competition
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Competition</DialogTitle>
            </DialogHeader>
            <form action={handleAddCompetition}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter competition name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select competition type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="league">League</SelectItem>
                      <SelectItem value="cup">Cup</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="swiss">Swiss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_teams">Maximum Teams</Label>
                  <Input
                    id="max_teams"
                    name="max_teams"
                    type="number"
                    min="2"
                    placeholder="Enter maximum number of teams"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <DatePicker
                    date={startDate}
                    onChange={setStartDate}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <DatePicker
                    date={endDate}
                    onChange={setEndDate}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Competition</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4 mb-4">
        <Input
          placeholder="Search competitions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="league">League</SelectItem>
            <SelectItem value="cup">Cup</SelectItem>
            <SelectItem value="friendly">Friendly</SelectItem>
            <SelectItem value="swiss">Swiss</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4">{error}</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompetitions.map((competition) => (
            <Card key={competition.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle>{competition.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewDetails(competition)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClick(competition)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageTeams(competition)}>
                        <Users className="mr-2 h-4 w-4" />
                        Manage Teams
                      </DropdownMenuItem>
                      {competition.type === 'swiss' && (
                        <DropdownMenuItem onClick={() => {
                          setCurrentCompetitionId(competition.id)
                          setShowSwissConfig(true)
                        }}>
                          <Trophy className="mr-2 h-4 w-4" />
                          Swiss Config
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteCompetition(competition.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-4">
                  {getTypeBadge(competition.type)}
                  {getStatusBadge(competition.status)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Users className="mr-2 h-4 w-4" />
                    <span>
                      {competition.teams_count} / {competition.max_teams} Teams
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {new Date(competition.start_date).toLocaleDateString()}
                      {competition.end_date &&
                        ` - ${new Date(competition.end_date).toLocaleDateString()}`}
                    </span>
                  </div>
                  {competition.matches_played !== undefined && (
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        {competition.matches_played} / {competition.total_matches} Matches
                        Played
                      </span>
                    </div>
                  )}
                  {competition.competition_teams && competition.competition_teams.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Teams:</div>
                      <div className="space-y-1">
                        {competition.competition_teams.slice(0, 4).map((ct) => (
                          <div key={ct.team_id} className="text-xs bg-secondary/30 px-2 py-1 rounded-sm">
                            {ct.teams.name}
                          </div>
                        ))}
                        {competition.competition_teams.length > 4 && (
                          <div className="text-xs text-muted-foreground px-2 py-1">
                            +{competition.competition_teams.length - 4} more teams
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {(!competition.competition_teams || competition.competition_teams.length === 0) && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground italic flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        No teams assigned yet
                      </div>
                    </div>
                  )}
                  {competition.competition_teams && competition.competition_teams.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Teams:</div>
                      <div className="grid grid-cols-1 gap-1 max-h-20 overflow-y-auto">
                        {competition.competition_teams.slice(0, 6).map((ct) => (
                          <div key={ct.team_id} className="text-xs bg-secondary/20 px-2 py-1 rounded">
                            {ct.teams.name}
                          </div>
                        ))}
                        {competition.competition_teams.length > 6 && (
                          <div className="text-xs text-muted-foreground px-2 py-1">
                            +{competition.competition_teams.length - 6} more...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {(!competition.competition_teams || competition.competition_teams.length === 0) && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground italic">No teams assigned yet</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditCompetitionDialogOpen} onOpenChange={setIsEditCompetitionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Competition</DialogTitle>
          </DialogHeader>
          {editingCompetition && (
            <form action={handleEditCompetition}>
              <input type="hidden" name="id" value={editingCompetition.id} />
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCompetition.name}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue={editingCompetition.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="league">League</SelectItem>
                      <SelectItem value="cup">Cup</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="swiss">Swiss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingCompetition.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_teams">Maximum Teams</Label>
                  <Input
                    id="max_teams"
                    name="max_teams"
                    type="number"
                    min="2"
                    defaultValue={editingCompetition.max_teams}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <DatePicker
                    date={startDate || new Date(editingCompetition.start_date)}
                    onChange={setStartDate}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <DatePicker
                    date={endDate || (editingCompetition.end_date ? new Date(editingCompetition.end_date) : undefined)}
                    onChange={setEndDate}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isManageTeamsDialogOpen} onOpenChange={setIsManageTeamsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Teams for Competition</DialogTitle>
            <DialogDescription>
              Select teams to add or remove from this competition
            </DialogDescription>
          </DialogHeader>
          {selectedCompetition && (
            <div className="space-y-4 flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedCompetition.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCompetition.teams_count} / {selectedCompetition.max_teams} Teams Currently Registered
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {selectedTeams.size} teams selected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {teams.length} teams available
                  </p>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="space-y-2">
                <Input
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* Team Selection Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const filteredTeamIds = teams
                      .filter(team => 
                        team.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(team => team.id)
                    setSelectedTeams(new Set(filteredTeamIds))
                  }}
                >
                  Select All {searchQuery ? 'Filtered' : ''}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTeams(new Set())}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const registeredTeamIds = selectedCompetition.competition_teams?.map(ct => ct.team_id) || []
                    setSelectedTeams(new Set(registeredTeamIds))
                  }}
                >
                  Select Currently Registered
                </Button>
              </div>

              {/* Scrollable Teams Table */}
              <div className="border rounded-lg flex-1 overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              teams.length > 0 &&
                              teams
                                .filter(team => 
                                  team.name.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .every((team) => selectedTeams.has(team.id))
                            }
                            onCheckedChange={(checked) => {
                              const filteredTeamIds = teams
                                .filter(team => 
                                  team.name.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map(team => team.id)
                              
                              if (checked) {
                                setSelectedTeams(new Set([...selectedTeams, ...filteredTeamIds]))
                              } else {
                                const newSelected = new Set(selectedTeams)
                                filteredTeamIds.forEach(id => newSelected.delete(id))
                                setSelectedTeams(newSelected)
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Short Name</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teams
                        .filter(team => 
                          team.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((team) => {
                          const isSelected = selectedTeams.has(team.id)
                          const isInCompetition = selectedCompetition.competition_teams?.some(
                            (ct) => ct.team_id === team.id
                          )

                          return (
                            <TableRow 
                              key={team.id} 
                              className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted/20' : ''}`}
                              onClick={() => {
                                if (isSelected) {
                                  const newSelected = new Set(selectedTeams)
                                  newSelected.delete(team.id)
                                  setSelectedTeams(newSelected)
                                } else {
                                  setSelectedTeams(new Set([...selectedTeams, team.id]))
                                }
                              }}
                            >
                              <TableCell>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedTeams(
                                        new Set([...selectedTeams, team.id])
                                      )
                                    } else {
                                      const newSelected = new Set(selectedTeams)
                                      newSelected.delete(team.id)
                                      setSelectedTeams(newSelected)
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-xs font-semibold">
                                      {team.short_name || team.name.substring(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium">{team.name}</span>
                                    {team.description && (
                                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {team.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {team.short_name || team.name.substring(0, 3).toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {team.manager ? (
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium">
                                        {team.manager.display_name || team.manager.email}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                                      <XCircle className="h-3 w-3 text-orange-600" />
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      No manager assigned
                                    </span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {isInCompetition ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Registered
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-orange-200 text-orange-700">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Not Registered
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                  
                  {teams.filter(team => 
                    team.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      {searchQuery ? 'No teams found matching your search.' : 'No teams available.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Teams to be registered: <strong>{selectedTeams.size}</strong></span>
                  <span>Competition limit: <strong>{selectedCompetition.max_teams}</strong></span>
                </div>
                                 {selectedTeams.size > selectedCompetition.max_teams && (
                   <p className="text-sm text-red-600 mt-1">
                     ⚠️ Warning: You&apos;ve selected more teams than the competition allows.
                   </p>
                 )}
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsManageTeamsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTeams}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showSwissConfig && currentCompetitionId && (
        <Dialog open={showSwissConfig} onOpenChange={setShowSwissConfig}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Swiss Tournament Configuration</DialogTitle>
            </DialogHeader>
            <SwissModelConfigForm
              onSubmit={handleSwissConfigSubmit}
              competitionId={currentCompetitionId}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
