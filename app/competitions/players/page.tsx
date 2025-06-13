'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Users } from 'lucide-react'
import Link from 'next/link'
import { useSupabase } from '@/components/providers/supabase-provider'
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Team {
  id: string
  name: string
  short_name: string
  logo_url: string | null
}

interface Player {
  id: string
  user_id: string
  position: string
  number: number
  status: string
  team: Team
  user_profile: {
    id: string
    display_name: string | null
    username: string | null
    avatar_url: string | null
  }
}

export default function CompetitionPlayersPage() {
  const { supabase } = useSupabase()
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [selectedSeason, setSelectedSeason] = useState<string>('all')

  const positions = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST']
  const seasons = ['2024/25', '2023/24', '2022/23', '2021/22', '2020/21']

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      console.log('Loading all players and teams...')
      
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, short_name, logo_url')
        .order('name')

      if (teamsError) {
        console.error('Error loading teams:', teamsError)
        setTeams([])
      } else {
        console.log('Found teams:', teamsData)
        setTeams(teamsData || [])
      }

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select(`
          id,
          user_id,
          position,
          number,
          status,
          team_id,
          teams (
            id,
            name,
            short_name,
            logo_url
          )
        `)
        .eq('status', 'active')
        .order('number')

      if (playersError) {
        console.error('Error loading players:', playersError)
        setPlayers([])
        return
      }

      if (playersData && playersData.length > 0) {
        const userIds = playersData.map(p => p.user_id)
        let profilesData = null
        
        try {
          const { data, error: profilesError } = await supabase
            .from('user_profiles')
            .select('user_id, display_name, username, avatar_url')
            .in('user_id', userIds)

          if (profilesError) {
            console.log('User profiles table not found - using player data only')
          } else {
            profilesData = data
          }
        } catch (error) {
          console.log('User profiles not available - using player data only')
        }

        const transformedPlayers: Player[] = playersData.map(player => {
          const profile = profilesData?.find(p => p.user_id === player.user_id)
          const team = Array.isArray(player.teams) ? player.teams[0] : player.teams
          
          const displayName = profile?.display_name || profile?.username || `Player ${player.number}` || 'Unknown Player'
          
          return {
            id: player.id,
            user_id: player.user_id,
            position: player.position,
            number: player.number,
            status: player.status,
            team: {
              id: team?.id || '',
              name: team?.name || 'Unknown Team',
              short_name: team?.short_name || 'UNK',
              logo_url: team?.logo_url || null
            },
            user_profile: {
              id: profile?.user_id || player.user_id,
              display_name: displayName,
              username: profile?.username || displayName,
              avatar_url: profile?.avatar_url || null
            }
          }
        })

        setPlayers(transformedPlayers)
      } else {
        setPlayers([])
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      })
      setPlayers([])
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      player.user_profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.user_profile.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.number.toString().includes(searchQuery)

    const matchesPosition = selectedPosition === 'all' ? true : player.position === selectedPosition
    const matchesTeam = selectedTeam === 'all' ? true : player.team.id === selectedTeam
    // Note: Season filtering would require match history data to implement properly
    // For now, we'll just show all players regardless of season selection

    return matchesSearch && matchesPosition && matchesTeam
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 px-4 pt-8 pb-4">
        {/* Mobile-First Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link 
              href="/competitions"
              className="p-2 rounded-full bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 hover:border-green-600/40 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-green-400" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-green-400">Players</h1>
              <p className="text-gray-400 text-sm">Browse all registered players</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-600/40 transition-all"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Position Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-full bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 text-white">
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Club Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Club</label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-full bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 text-white">
                <SelectValue placeholder="All Clubs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clubs</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Season Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Season</label>
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="w-full bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 text-white">
                <SelectValue placeholder="All Seasons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                {seasons.map((season) => (
                  <SelectItem key={season} value={season}>
                    {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-400 text-sm">
            Showing {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Players List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
                  <div className="animate-pulse flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPlayers.length > 0 ? (
            <div className="space-y-3">
              {filteredPlayers.map((player) => (
                <Link key={player.id} href={`/players/${player.id}`} className="block">
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {player.user_profile.display_name?.charAt(0) || 'P'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg">{player.user_profile.display_name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-green-400 text-lg font-bold">#{player.number}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No Players Found</h3>
              <p className="text-gray-500 text-sm">
                {searchQuery 
                  ? `No players found matching "${searchQuery}"` 
                  : 'Try adjusting your filters to see more players.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 