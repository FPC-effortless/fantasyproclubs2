"use client"

import { useEffect, useState, useCallback } from "react"
import { UserCog, ArrowLeft, Search, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/components/providers/supabase-provider"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { ManagerCard } from "@/components/ui/manager-card"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import Image from "next/image"
import styles from './managers.module.css'

interface Competition {
  id: string
  name: string
  type: string
  status: string
}

interface Manager {
  id: string
  user_id: string
  team: {
    id: string
    name: string
    short_name: string
    logo_url: string | null
  }
  user_profile: {
    id: string
    username: string | null
    avatar_url: string | null
  }
  stats: {
    team_founded: string
    players_managed: number
    matches_played: number
    wins: number
    losses: number
    draws: number
  }
}

export default function CompetitionManagersPage() {
  const { supabase } = useSupabase()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)

  const loadCompetitions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('id, name, type, status')
        .eq('status', 'active')

      if (error) throw error

      setCompetitions(data || [])
      if (data && data.length > 0) {
        setSelectedCompetition(data[0].id)
      }
    } catch (error: any) {
      console.error('Error loading competitions:', error)
      toast({
        title: "Error loading competitions",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [supabase])

  const loadManagersInCompetition = useCallback(async (competitionId: string) => {
    try {
      setLoading(true)
      console.log('Loading managers for competition:', competitionId)
      
      // Get teams in this competition
      const { data: competitionTeams, error: teamsError } = await supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', competitionId)
        .eq('status', 'active')

      if (teamsError) throw teamsError

      const teamIds = competitionTeams?.map(ct => ct.team_id) || []
      console.log('Found team IDs:', teamIds)

      if (teamIds.length === 0) {
        setManagers([])
        return
      }

      // Get teams with their managers
      const { data: teamsData, error: teamDataError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          short_name,
          logo_url,
          manager_id,
          created_at
        `)
        .in('id', teamIds)
        .not('manager_id', 'is', null)

      if (teamDataError) throw teamDataError

      if (teamsData && teamsData.length > 0) {
        const managerIds = teamsData.map(t => t.manager_id).filter(Boolean)
        
        // Get user profiles for the managers
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, username')
          .in('id', managerIds)

        if (profilesError) {
          console.error('Error loading user profiles:', profilesError)
        }

        // Get player counts for each team
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('team_id')
          .in('team_id', teamIds)
          .eq('status', 'active')

        if (playersError) {
          console.error('Error loading players data:', playersError)
        }

        // Transform data to match our interface
        const transformedManagers: Manager[] = teamsData.map(team => {
          const profile = profilesData?.find(p => p.id === team.manager_id)
          const playerCount = playersData?.filter(p => p.team_id === team.id).length || 0
          
          return {
            id: team.manager_id,
            user_id: team.manager_id,
            team: {
              id: team.id,
              name: team.name,
              short_name: team.short_name,
              logo_url: team.logo_url
            },
            user_profile: {
              id: profile?.id || team.manager_id,
              username: profile?.username || null,
              avatar_url: null
            },
            stats: {
              team_founded: team.created_at,
              players_managed: playerCount,
              matches_played: 0,
              wins: 0,
              losses: 0,
              draws: 0
            }
          }
        })

        setManagers(transformedManagers)
      } else {
        setManagers([])
      }
    } catch (error: any) {
      console.error('Error loading managers:', error)
      toast({
        title: "Error loading managers",
        description: error.message,
        variant: "destructive",
      })
      setManagers([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const loadAllManagers = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Loading all managers...')
      
      // Get all teams with managers
      const { data: teamsData, error: teamDataError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          short_name,
          logo_url,
          manager_id,
          created_at
        `)
        .not('manager_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50)

      if (teamDataError) throw teamDataError

      if (teamsData && teamsData.length > 0) {
        const managerIds = teamsData.map(t => t.manager_id).filter(Boolean)
        
        // Get user profiles for the managers
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, username')
          .in('id', managerIds)

        if (profilesError) {
          console.error('Error loading user profiles:', profilesError)
        }

        // Get player counts for each team
        const teamIds = teamsData.map(t => t.id)
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('team_id')
          .in('team_id', teamIds)
          .eq('status', 'active')

        if (playersError) {
          console.error('Error loading players data:', playersError)
        }

        // Transform data to match our interface
        const transformedManagers: Manager[] = teamsData.map(team => {
          const profile = profilesData?.find(p => p.id === team.manager_id)
          const playerCount = playersData?.filter(p => p.team_id === team.id).length || 0
          
          return {
            id: team.manager_id,
            user_id: team.manager_id,
            team: {
              id: team.id,
              name: team.name,
              short_name: team.short_name,
              logo_url: team.logo_url
            },
            user_profile: {
              id: profile?.id || team.manager_id,
              username: profile?.username || null,
              avatar_url: null
            },
            stats: {
              team_founded: team.created_at,
              players_managed: playerCount,
              matches_played: 0,
              wins: 0,
              losses: 0,
              draws: 0
            }
          }
        })

        setManagers(transformedManagers)
      } else {
        setManagers([])
      }
    } catch (error: any) {
      console.error('Error loading all managers:', error)
      toast({
        title: "Error loading managers",
        description: error.message,
        variant: "destructive",
      })
      setManagers([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadCompetitions()
  }, [loadCompetitions])

  useEffect(() => {
    if (selectedCompetition) {
      loadManagersInCompetition(selectedCompetition)
    } else {
      loadAllManagers()
    }
  }, [selectedCompetition, loadManagersInCompetition, loadAllManagers])

  const formatFoundedDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const filteredManagers = managers.filter(manager => {
    const matchesSearch = 
      manager.user_profile.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.team.short_name.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const selectedCompetitionName = competitions.find(c => c.id === selectedCompetition)?.name || 'All Managers'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
        <div className="relative px-4 pt-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-in fade-in slide-in-from-top">
              <div className="flex items-center spacing-md mb-4">
                <Link 
                  href="/competitions"
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 btn-enhanced"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-400" />
                </Link>
                <div>
                  <h1 className="text-page-title bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Team Managers
                  </h1>
                  <p className="text-body">Manage and view competition team managers</p>
                </div>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            <div className="animate-in fade-in slide-in-from-top" style={{animationDelay: '100ms'}}>
              <div className="grid md:grid-cols-2 spacing-md mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search managers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-body-emphasis placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600/50 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                
                <div className="relative">
                  <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={selectedCompetition || ''}
                    onChange={(e) => setSelectedCompetition(e.target.value || null)}
                    aria-label="Select competition"
                    className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-body-emphasis focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600/50 transition-all duration-300 backdrop-blur-sm appearance-none"
                  >
                    <option value="">All Competitions</option>
                    {competitions.map((competition) => (
                      <option key={competition.id} value={competition.id}>
                        {competition.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="px-4 pb-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 spacing-md">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={cn(
                "bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/30 rounded-xl p-6 card-subtle-hover",
                i % 3 === 0 && "animate-pulse-1",
                i % 3 === 1 && "animate-pulse-2",
                i % 3 === 2 && "animate-pulse-3"
              )}>
                <div className="flex items-center spacing-md mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="grid grid-cols-3 spacing-sm">
                    <div className="h-8 bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredManagers.length > 0 ? (
          <div className="animate-in fade-in scale-in" style={{animationDelay: '200ms'}}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 spacing-md">
              {filteredManagers.map((manager, index) => (
                <div key={manager.id} className={cn(
                  "bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 card-interactive",
                  "hover:border-blue-600/40 transition-all duration-300"
                )}>
                  {/* Manager Header */}
                  <div className="flex items-center spacing-md mb-4">
                    <Link href={`/managers/${manager.id}`} className="flex items-center gap-3 group">
                      {manager.user_profile.avatar_url ? (
                        <img
                          src={manager.user_profile.avatar_url}
                          alt={manager.user_profile.username || 'Manager'}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30 shadow-lg group-hover:ring-blue-500/60 transition-all"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          <UserCog className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-body-emphasis truncate group-hover:underline">
                          {manager.user_profile.username || 'Unknown Manager'}
                        </h3>
                        <p className="text-caption">Team Manager</p>
                      </div>
                    </Link>
                  </div>

                  {/* Team Info */}
                  <div className="mb-4 p-3 bg-gray-800/30 rounded-lg">
                    <Link href={`/teams/${manager.team.id}`} className="flex items-center spacing-sm mb-2 group">
                      {manager.team.logo_url ? (
                        <img
                          src={manager.team.logo_url}
                          alt={manager.team.name}
                          className="w-8 h-8 rounded-full object-cover shadow-md group-hover:ring-2 group-hover:ring-green-400 transition-all"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {manager.team.short_name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-body-emphasis font-semibold truncate group-hover:underline">{manager.team.name}</h4>
                        <p className="text-caption">Founded {formatFoundedDate(manager.stats.team_founded)}</p>
                      </div>
                    </Link>
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-3 spacing-sm">
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-3 text-center">
                      <div className="text-subheading text-green-400">{manager.stats.players_managed}</div>
                      <div className="text-caption">Players</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-3 text-center">
                      <div className="text-subheading text-blue-400">{manager.stats.matches_played}</div>
                      <div className="text-caption">Matches</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-3 text-center">
                      <div className="text-subheading text-purple-400">{manager.stats.wins}</div>
                      <div className="text-caption">Wins</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8 text-center animate-in fade-in scale-in">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCog className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-subheading text-gray-300 mb-2">No Managers Found</h3>
            <p className="text-body text-gray-500">
              {searchQuery ? 'No managers match your search criteria.' : 'No managers are currently registered in this competition.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 