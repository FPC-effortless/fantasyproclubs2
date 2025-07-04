"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, ExternalLink, Trophy, Users, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Manager {
  id: string
  name: string
  profile_image_url?: string | null
  team: {
    id: string
    name: string
    logo_url?: string | null
  }
  stats?: ManagerStats
}

interface ManagerStats {
  season: number
  matches_managed: number
  wins: number
  draws: number
  losses: number
  win_percentage: number
  goals_scored: number
  goals_conceded: number
  goal_difference: number
  clean_sheets: number
  trophies_won: number
  // Career stats
  career_matches: number
  career_wins: number
  career_draws: number
  career_losses: number
  career_win_percentage: number
  career_trophies: number
}

type TabType = 'overview' | 'stats'

export default function ManagerDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const [manager, setManager] = useState<Manager | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedSeason, setSelectedSeason] = useState(1)

  const seasons = Array.from({ length: 5 }, (_, i) => i + 1)

  const managerId = params.id as string

  useEffect(() => {
    if (managerId) {
      loadManagerDetails()
    }
  }, [managerId, selectedSeason])

  const loadManagerDetails = async () => {
    try {
      setLoading(true)

      // Load manager data from user_profiles
      const { data: managerData, error: managerError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          username,
          avatar_url,
          team:teams!manager_id(
            id,
            name,
            logo_url
          )
        `)
        .eq('id', managerId)
        .eq('user_type', 'manager')
        .single()

      if (managerError && managerError.code !== 'PGRST116') {
        console.error('Error loading manager:', managerError)
        // Load mock data as fallback
        loadMockManager()
        return
      }

      if (managerData) {
        // Load manager statistics
        const { data: statsData } = await supabase
          .from('manager_statistics')
          .select('*')
          .eq('manager_id', managerId)
          .eq('season', selectedSeason)
          .single()

        setManager({
          id: managerData.id,
          name: managerData.username || 'Unknown Manager',
          profile_image_url: managerData.avatar_url,
          team: Array.isArray(managerData.team) ? managerData.team[0] : managerData.team,
          stats: statsData || getMockStats()
        })
      } else {
        loadMockManager()
      }

    } catch (error) {
      console.error('Error loading manager details:', error)
      loadMockManager()
    } finally {
      setLoading(false)
    }
  }

  const loadMockManager = () => {
    const mockManager: Manager = {
      id: managerId,
      name: "Unknown Manager",
      profile_image_url: null,
      team: {
        id: "1",
        name: "FC Pro Stars",
        logo_url: null
      },
      stats: getMockStats()
    }
    setManager(mockManager)
  }

  const getMockStats = (): ManagerStats => ({
    season: 1,
    matches_managed: 42,
    wins: 26,
    draws: 10,
    losses: 6,
    win_percentage: 61.9,
    goals_scored: 78,
    goals_conceded: 35,
    goal_difference: 43,
    clean_sheets: 18,
    trophies_won: 2,
    // Career stats
    career_matches: 450,
    career_wins: 245,
    career_draws: 125,
    career_losses: 80,
    career_win_percentage: 54.4,
    career_trophies: 8
  })

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-4xl mx-auto p-4">
            <Skeleton className="h-12 w-64 mb-6 bg-gray-800" />
            <Skeleton className="h-64 w-full mb-6 bg-gray-800" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 bg-gray-800" />
              ))}
            </div>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  if (!manager) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex flex-col items-center justify-center py-20">
              <h1 className="text-2xl font-bold mb-4">Manager Not Found</h1>
              <p className="text-gray-400 mb-6">The manager you&apos;re looking for doesn&apos;t exist.</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-white">{manager.name}</h1>
          </div>

          {/* Manager Hero Section */}
          <div className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{manager.name}</h1>
                <p className="text-xl text-green-100 mb-4">Manager</p>
                <div className="flex items-center gap-4 mb-6">
                  <Badge className="bg-green-600 text-white">
                    <Trophy className="w-4 h-4 mr-1" />
                    {manager.stats?.career_trophies || 0} Trophies
                  </Badge>
                  <Badge className="bg-green-600 text-white">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {manager.stats?.career_win_percentage.toFixed(1)}% Win Rate
                  </Badge>
                </div>
                <Button 
                  className="bg-white text-green-800 hover:bg-gray-100"
                  onClick={() => router.push(`/teams/${manager.team.id}`)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Team
                </Button>
              </div>
              
              <div className="relative">
                <div className="w-48 h-64 bg-gradient-to-b from-green-600/20 to-transparent rounded-lg flex items-center justify-center">
                  {manager.profile_image_url ? (
                    <Image
                      src={manager.profile_image_url}
                      alt={manager.name}
                      width={192}
                      height={256}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-green-500/30 rounded-full flex items-center justify-center">
                      <Users className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-800/50 p-1 mx-4 rounded-xl mt-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'stats'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Stats
              </button>
            </div>
          </div>

          {/* Season Selector */}
          <div className="flex gap-4 p-4">
            <Select value={selectedSeason.toString()} onValueChange={(value) => setSelectedSeason(parseInt(value))}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season} value={season.toString()}>Season {season}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* Team Info */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-green-400 mb-4">Team Information</h2>
                  <div className="flex items-center gap-4">
                    {manager.team.logo_url ? (
                      <Image
                        src={manager.team.logo_url}
                        alt={manager.team.name}
                        width={64}
                        height={64}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-green-500/30 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{manager.team.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white">{manager.team.name}</h3>
                      <p className="text-gray-400">Current Team</p>
                    </div>
                  </div>
                </div>

                {/* Season Overview */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-green-400 mb-6">Season Overview</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.matches_managed || 0}</div>
                      <div className="text-gray-400 text-sm">Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.wins || 0}</div>
                      <div className="text-gray-400 text-sm">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.draws || 0}</div>
                      <div className="text-gray-400 text-sm">Draws</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.losses || 0}</div>
                      <div className="text-gray-400 text-sm">Losses</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Detailed Stats */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-green-400 mb-6">Season Statistics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.goals_scored || 0}</div>
                      <div className="text-gray-400 text-sm">Goals Scored</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.goals_conceded || 0}</div>
                      <div className="text-gray-400 text-sm">Goals Conceded</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.goal_difference || 0}</div>
                      <div className="text-gray-400 text-sm">Goal Difference</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.clean_sheets || 0}</div>
                      <div className="text-gray-400 text-sm">Clean Sheets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.trophies_won || 0}</div>
                      <div className="text-gray-400 text-sm">Trophies Won</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.win_percentage.toFixed(1)}%</div>
                      <div className="text-gray-400 text-sm">Win Rate</div>
                    </div>
                  </div>
                </div>

                {/* Career Stats */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-green-400 mb-6">Career Statistics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.career_matches || 0}</div>
                      <div className="text-gray-400 text-sm">Total Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.career_wins || 0}</div>
                      <div className="text-gray-400 text-sm">Total Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.career_draws || 0}</div>
                      <div className="text-gray-400 text-sm">Total Draws</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.career_losses || 0}</div>
                      <div className="text-gray-400 text-sm">Total Losses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.career_trophies || 0}</div>
                      <div className="text-gray-400 text-sm">Total Trophies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{manager.stats?.career_win_percentage.toFixed(1)}%</div>
                      <div className="text-gray-400 text-sm">Career Win Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 