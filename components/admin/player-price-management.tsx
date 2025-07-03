'use client'

import { useState, useEffect } from 'react'
import { createClient } from "@/lib/supabase/client"
import { Database } from '@/lib/database.types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from '@/components/ui/use-toast'
import { Search, Save, Trophy, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PlayerQueryResult {
  id: string
  user_profiles: {
    display_name: string | null
    username: string | null
  }
  teams: {
    id: string
    name: string
  }
  position: string
}

interface Player {
  id: string
  user_profiles: {
    display_name: string | null
    username: string | null
  }
  teams: {
    id: string
    name: string
  }
  position: string
  fantasy_points: number
  fantasy_price: number | null
  total_matches: number
  avg_rating: number
  total_goals: number
  total_assists: number
  clean_sheets: number
}

interface Competition {
  id: string
  name: string
  fantasy_enabled: boolean
}

export default function PlayerPriceManagement() {
  const [players, setPlayers] = useState<Player[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({})
  const supabase = createClient()

  useEffect(() => {
    loadCompetitions()
  }, [])

  useEffect(() => {
    if (selectedCompetition) {
      loadPlayers(selectedCompetition)
    }
  }, [selectedCompetition])

  const loadCompetitions = async () => {
    try {
      console.log('Loading competitions...')
      const { data, error, status, statusText } = await supabase
        .from('competitions')
        .select('id, name, fantasy_enabled')
        .eq('fantasy_enabled', true)

      if (error) {
        console.error('Error loading competitions:', {
          error,
          status,
          statusText,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log('Loaded competitions:', data)
      setCompetitions(data || [])
      
      // Select the first competition by default if available
      if (data && data.length > 0) {
        setSelectedCompetition(data[0].id)
      } else {
        console.log('No fantasy-enabled competitions found')
      }
    } catch (error: any) {
      console.error('Error in loadCompetitions:', {
        error,
        message: error.message,
        stack: error.stack
      })
      toast({
        title: "Error loading competitions",
        description: `${error.message || 'Unknown error'}. This might be due to missing permissions or database configuration.`,
        variant: "destructive",
      })
    }
  }

  const loadPlayers = async (competitionId: string) => {
    try {
      console.log('Loading players for competition:', competitionId)
      setLoading(true)

      // First, get all teams participating in the competition
      const teamsResult = await supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', competitionId)
      
      console.log('Teams query result:', teamsResult)

      if (teamsResult.error) {
        console.error('Error loading teams:', teamsResult.error)
        throw teamsResult.error
      }

      const teamData = teamsResult.data
      console.log('Found teams:', teamData)
      
      if (!teamData || teamData.length === 0) {
        console.log('No teams found in competition')
        setPlayers([])
        setLoading(false)
        return
      }

      const teamIds = teamData.map(t => t.team_id)
      console.log('Team IDs:', teamIds)

      // Get all players from the participating teams (without user_profiles join)
      const playersResult = await supabase
        .from('players')
        .select(`
          id,
          user_id,
          position,
          teams (
            id,
            name
          )
        `)
        .in('team_id', teamIds)

      console.log('Players query result:', playersResult)

      if (playersResult.error) {
        console.error('Error loading players:', playersResult.error)
        throw playersResult.error
      }

      const playerData = playersResult.data
      console.log('Found players:', playerData)

      if (!playerData || playerData.length === 0) {
        console.log('No players found in teams')
        setPlayers([])
        setLoading(false)
        return
      }

      // Get user profiles separately
      const userIds = playerData.map(p => p.user_id).filter(Boolean)
      console.log('Loading user profiles for user IDs:', userIds)

      const userProfilesResult = await supabase
        .from('user_profiles')
        .select('user_id, display_name, username')
        .in('user_id', userIds)

      console.log('User profiles result:', userProfilesResult)

      const userProfilesMap = new Map(
        (userProfilesResult.data || []).map(profile => [profile.user_id, profile])
      )

      // Get fantasy stats for these players
      const playerIds = playerData.map(p => p.id)
      console.log('Loading fantasy stats for player IDs:', playerIds)

      const fantasyStatsResult = await supabase
        .from('fantasy_player_stats')
        .select('player_id, fantasy_points, fantasy_price')
        .eq('competition_id', competitionId)
        .in('player_id', playerIds)

      console.log('Fantasy stats result:', fantasyStatsResult)

      const fantasyStatsMap = new Map(
        (fantasyStatsResult.data || []).map(stat => [stat.player_id, stat])
      )

      // Get player match statistics for total counts
      const playerStatsResult = await supabase
        .from('player_match_stats')
        .select(`
          player_id,
          goals,
          assists,
          rating,
          clean_sheet,
          minutes_played
        `)
        .eq('competition_id', competitionId)
        .in('player_id', playerIds)
        .eq('status', 'approved')

      console.log('Player match stats result:', playerStatsResult)

      // Aggregate statistics by player
      const playerStatsMap = new Map()
      
      if (playerStatsResult.data) {
        playerStatsResult.data.forEach(stat => {
          const existing = playerStatsMap.get(stat.player_id) || {
            total_matches: 0,
            total_goals: 0,
            total_assists: 0,
            total_rating: 0,
            clean_sheets: 0
          }
          
          playerStatsMap.set(stat.player_id, {
            total_matches: existing.total_matches + 1,
            total_goals: existing.total_goals + (stat.goals || 0),
            total_assists: existing.total_assists + (stat.assists || 0),
            total_rating: existing.total_rating + (stat.rating || 0),
            clean_sheets: existing.clean_sheets + (stat.clean_sheet ? 1 : 0)
          })
        })
      }

      // Map the data to our Player interface
      const mappedPlayers = playerData.map(player => {
        const fantasyStats = fantasyStatsMap.get(player.id)
        const matchStats = playerStatsMap.get(player.id) || {
          total_matches: 0,
          total_goals: 0,
          total_assists: 0,
          total_rating: 0,
          clean_sheets: 0
        }
        const userProfile = userProfilesMap.get(player.user_id)

        return {
          id: player.id,
          user_profiles: {
            display_name: userProfile?.display_name || null,
            username: userProfile?.username || null
          },
          teams: {
            id: (player.teams as any)?.id || '',
            name: (player.teams as any)?.name || 'No Team'
          },
          position: player.position,
          fantasy_points: fantasyStats?.fantasy_points || 0,
          fantasy_price: fantasyStats?.fantasy_price || null,
          total_matches: matchStats.total_matches,
          avg_rating: matchStats.total_matches > 0 ? matchStats.total_rating / matchStats.total_matches : 0,
          total_goals: matchStats.total_goals,
          total_assists: matchStats.total_assists,
          clean_sheets: matchStats.clean_sheets
        }
      })

      console.log('Mapped players with fantasy stats:', mappedPlayers)
      setPlayers(mappedPlayers)
      setLoading(false)
    } catch (error: any) {
      console.error('Error in loadPlayers:', error)
      toast({
        title: "Error loading players",
        description: error.message || "Failed to load players",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const toggleFantasyEnabled = async (competitionId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('competitions')
        .update({ fantasy_enabled: enabled })
        .eq('id', competitionId)

      if (error) throw error

      // Update local state
      setCompetitions(prev => 
        prev.map(comp => 
          comp.id === competitionId 
            ? { ...comp, fantasy_enabled: enabled }
            : comp
        )
      )

      if (enabled) {
        // Initialize fantasy stats for all players in participating teams
        await initializeFantasyStats(competitionId)
      }

      toast({
        title: "Success",
        description: `Fantasy ${enabled ? 'enabled' : 'disabled'} for competition`,
      })
    } catch (error: any) {
      toast({
        title: "Error updating fantasy settings",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const initializeFantasyStats = async (competitionId: string) => {
    try {
      console.log('=== INITIALIZING FANTASY STATS ===')
      console.log('Competition ID:', competitionId)

      // Get all teams participating in the competition first
      console.log('Step 1: Fetching teams in competition...')
      const { data: competitionTeams, error: teamsError } = await supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', competitionId)

      if (teamsError) {
        console.error('Teams query error:', teamsError)
        console.error('Teams error details:', {
          message: teamsError?.message,
          code: teamsError?.code,
          details: teamsError?.details,
          hint: teamsError?.hint
        })
        throw teamsError
      }

      console.log('Competition teams result:', competitionTeams)

      const teamIds = competitionTeams?.map(ct => ct.team_id) || []

      if (teamIds.length === 0) {
        console.log('No teams found in competition')
        toast({
          title: "No teams found",
          description: "No teams are participating in this competition",
          variant: "destructive",
        })
        return
      }

      console.log(`Found ${teamIds.length} teams:`, teamIds)

      // Get all players from those teams
      console.log('Step 2: Fetching players from teams...')
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id')
        .in('team_id', teamIds)

      if (playersError) {
        console.error('Players query error:', playersError)
        console.error('Players error details:', {
          message: playersError?.message,
          code: playersError?.code,
          details: playersError?.details,
          hint: playersError?.hint
        })
        throw playersError
      }

      console.log('Players result:', players)

      if (!players || players.length === 0) {
        console.log('No players found in teams')
        toast({
          title: "No players found",
          description: "No players found in the teams for this competition",
          variant: "destructive",
        })
        return
      }

      console.log(`Found ${players.length} players`)

      // Initialize fantasy stats for each player
      console.log('Step 3: Creating fantasy stats records...')
      const statsToInsert = players.map(player => ({
        player_id: player.id,
        competition_id: competitionId,
        fantasy_points: 0,
        fantasy_price: 5.0 // Default starting price
      }))

      console.log('Records to insert:', statsToInsert.slice(0, 3), '...')

      const { data: insertResult, error: insertError } = await supabase
        .from('fantasy_player_stats')
        .upsert(statsToInsert, {
          onConflict: 'player_id,competition_id'
        })
        .select()

      if (insertError) {
        console.error('Insert operation failed:', insertError)
        console.error('Insert error details:', {
          message: insertError?.message,
          code: insertError?.code,
          details: insertError?.details,
          hint: insertError?.hint
        })
        throw insertError
      }

      console.log('Insert successful:', insertResult?.slice(0, 3), '...')

      toast({
        title: "Success",
        description: `Initialized fantasy stats for ${players?.length || 0} players`,
      })

      // Refresh the player list to show the new stats
      console.log('Step 4: Refreshing player list...')
      await loadPlayers(competitionId)

      console.log('=== FANTASY STATS INITIALIZATION COMPLETE ===')
    } catch (error: any) {
      console.error('=== FANTASY STATS INITIALIZATION FAILED ===')
      console.error('Caught error:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      
      // Detailed error information
      const errorDetails = {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      }
      console.error('Error details:', errorDetails)
      
      // Try to stringify the error to see if there's hidden info
      try {
        console.error('Error stringified:', JSON.stringify(error, null, 2))
      } catch (e) {
        console.error('Could not stringify error:', e)
      }

      // Check if it's an empty object
      if (error && typeof error === 'object' && Object.keys(error).length === 0) {
        console.error('ERROR IS EMPTY OBJECT - This suggests a promise rejection or async issue')
      }

      toast({
        title: "Error initializing fantasy stats",
        description: error?.message || error?.details || error?.hint || "Failed to initialize fantasy stats",
        variant: "destructive",
      })
    }
  }

  const handlePriceChange = (playerId: string, price: string) => {
    const numericPrice = parseFloat(price)
    if (!isNaN(numericPrice) && numericPrice >= 0) {
      setEditedPrices(prev => ({
        ...prev,
        [playerId]: numericPrice
      }))
    }
  }

  const saveChanges = async () => {
    if (!selectedCompetition) return

    try {
      console.log('Saving price changes:', editedPrices)
      
      const updates = Object.entries(editedPrices).map(([playerId, price]) => ({
        player_id: playerId,
        competition_id: selectedCompetition,
        fantasy_price: price,
        fantasy_points: 0 // Default for new records
      }))

      console.log('Upserting fantasy stats:', updates)

      const { error } = await supabase
        .from('fantasy_player_stats')
        .upsert(updates, {
          onConflict: 'player_id,competition_id'
        })

      if (error) {
        console.error('Error saving fantasy stats:', error)
        throw error
      }

      toast({
        title: "Success",
        description: `Updated prices for ${Object.keys(editedPrices).length} players`,
      })

      // Refresh the player list to show updated prices
      await loadPlayers(selectedCompetition)
      
      // Clear edited prices
      setEditedPrices({})
    } catch (error: any) {
      console.error('Error saving changes:', error)
      toast({
        title: "Error saving changes",
        description: error.message || "Failed to save player prices",
        variant: "destructive",
      })
    }
  }

  const filteredPlayers = players.filter(player =>
    player.user_profiles.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.user_profiles.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.teams.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const hasChanges = Object.keys(editedPrices).length > 0
  const selectedComp = competitions.find(c => c.id === selectedCompetition)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={selectedCompetition}
            onValueChange={setSelectedCompetition}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a competition" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((competition) => (
                <SelectItem key={competition.id} value={competition.id}>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    {competition.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedComp && (
            <div className="flex items-center gap-2">
              <Switch
                id="fantasy-enabled"
                checked={selectedComp.fantasy_enabled}
                onCheckedChange={(checked) => toggleFantasyEnabled(selectedComp.id, checked)}
              />
              <Label htmlFor="fantasy-enabled">Fantasy Enabled</Label>
            </div>
          )}

          {selectedComp?.fantasy_enabled && (
            <Button
              onClick={() => initializeFantasyStats(selectedCompetition)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              Initialize Fantasy Stats
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {selectedComp?.fantasy_enabled && (
            <>
              <div className="flex items-center gap-2">
                <Label htmlFor="bulk-price">Bulk Set Price:</Label>
                <Input
                  id="bulk-price"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="5.0"
                  className="w-20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value
                      const price = parseFloat(value)
                      if (!isNaN(price) && price >= 0) {
                        const newPrices: Record<string, number> = {}
                        filteredPlayers.forEach(player => {
                          newPrices[player.id] = price
                        })
                        setEditedPrices(prev => ({ ...prev, ...newPrices }))
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }
                  }}
                />
              </div>
              <Button
                onClick={() => {
                  const newPrices: Record<string, number> = {}
                  filteredPlayers.forEach(player => {
                    if (!player.fantasy_price) {
                      newPrices[player.id] = 5.0 // Default price
                    }
                  })
                  setEditedPrices(prev => ({ ...prev, ...newPrices }))
                }}
                variant="outline"
                size="sm"
              >
                Set Default Prices
              </Button>
            </>
          )}
          
          <Button
            onClick={saveChanges}
            disabled={!hasChanges || !selectedComp?.fantasy_enabled}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
            {hasChanges && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {Object.keys(editedPrices).length}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player Name</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="text-right">Matches</TableHead>
              <TableHead className="text-right">Avg Rating</TableHead>
              <TableHead className="text-right">Goals</TableHead>
              <TableHead className="text-right">Assists</TableHead>
              <TableHead className="text-right">Clean Sheets</TableHead>
              <TableHead className="text-right">Fantasy Points</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-1">
                  Fantasy Price
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Price in millions (£M)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  No players found
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    {player.user_profiles.display_name || player.user_profiles.username || 'No Name'}
                  </TableCell>
                  <TableCell>{player.teams.name}</TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{player.total_matches}</TableCell>
                  <TableCell>{player.avg_rating.toFixed(1)}</TableCell>
                  <TableCell>{player.total_goals}</TableCell>
                  <TableCell>{player.total_assists}</TableCell>
                  <TableCell>{player.clean_sheets}</TableCell>
                  <TableCell>{player.fantasy_points.toFixed(1)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">£</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={editedPrices[player.id] ?? player.fantasy_price ?? ''}
                        onChange={(e) => handlePriceChange(player.id, e.target.value)}
                        className="w-20 text-right"
                        placeholder="5.0"
                      />
                      <span className="text-sm text-gray-500">M</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 
