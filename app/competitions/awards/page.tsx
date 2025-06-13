"use client"

import { useEffect, useState, useCallback } from "react"
import { Trophy, Award, Star, Medal, Crown, Target, Shield, ArrowLeft, Search, Filter, User, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/providers/supabase-provider"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { createClient } from '@/lib/supabase/client'

interface Competition {
  id: string
  name: string
  type: string
  status: string
}

interface Player {
  id: string
  user_id: string
  position: string
  number: number
  user_profile: {
    id: string
    username: string | null
  }
  team: {
    id: string
    name: string
    logo_url: string | null
  }
}

interface Award {
  id: string
  competition_id: string
  player_id: string
  type: string
  season: string
  month?: number
  created_at: string
  competition: {
    id: string
    name: string
  }
  player: Player
}

interface Trophy {
  id: string
  name: string
  description: string | null
  type: string
  competition_id: string | null
  image_url: string
  created_at: string
  competition?: {
    id: string
    name: string
  }
}

export default function CompetitionAwardsPage() {
  const { supabase } = useSupabase()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [awards, setAwards] = useState<Award[]>([])
  const [trophies, setTrophies] = useState<Trophy[]>([])
  const [loading, setLoading] = useState(true)

  const loadCompetitions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('id, name, type, status')
        .order('name')

      if (error) throw error
      setCompetitions(data || [])
    } catch (error: any) {
      console.error('Error loading competitions:', error)
      toast({
        title: "Error loading competitions",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [supabase])

  const loadAwards = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('awards')
        .select(`
          *,
          competition:competitions(id, name),
          player:players(
            id,
            user_id,
            position,
            number,
            user_profile:user_profiles(id, username),
            team:teams(id, name, logo_url)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setAwards(data || [])
    } catch (error: any) {
      console.error('Error loading awards:', error)
      toast({
        title: "Error loading awards",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const loadTrophies = useCallback(async () => {
    try {
      const { data: trophiesData, error: trophiesError } = await supabase
        .from('trophies')
        .select(`
          *,
          competition:competitions(id, name)
        `)
        .order('created_at', { ascending: false })

      if (trophiesError) throw trophiesError

      setTrophies(trophiesData || [])
    } catch (error: any) {
      console.error('Error loading trophies:', error)
      toast({
        title: "Error loading trophies",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [supabase])

  const loadAwardsForCompetition = useCallback(async (competitionId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('awards')
        .select(`
          *,
          competition:competitions(id, name),
          player:players(
            id,
            user_id,
            position,
            number,
            user_profile:user_profiles(id, username),
            team:teams(id, name, logo_url)
          )
        `)
        .eq('competition_id', competitionId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAwards(data || [])
    } catch (error: any) {
      console.error('Error loading competition awards:', error)
      toast({
        title: "Error loading awards",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const loadTrophiesForCompetition = useCallback(async (competitionId: string) => {
    try {
      const { data: trophiesData, error: trophiesError } = await supabase
        .from('trophies')
        .select(`
          *,
          competition:competitions(id, name)
        `)
        .eq('competition_id', competitionId)
        .order('created_at', { ascending: false })

      if (trophiesError) throw trophiesError

      setTrophies(trophiesData || [])
    } catch (error: any) {
      console.error('Error loading competition trophies:', error)
      toast({
        title: "Error loading trophies",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [supabase])

  useEffect(() => {
    loadCompetitions()
    loadAwards()
    loadTrophies()
  }, [loadCompetitions, loadAwards, loadTrophies])

  useEffect(() => {
    if (selectedCompetition && selectedCompetition !== "all") {
      loadAwardsForCompetition(selectedCompetition)
      loadTrophiesForCompetition(selectedCompetition)
    } else {
      loadAwards()
      loadTrophies()
    }
  }, [selectedCompetition, loadAwardsForCompetition, loadTrophiesForCompetition, loadAwards, loadTrophies])

  const getAwardIcon = (type: string) => {
    switch (type) {
      case 'player_of_the_month':
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 'top_scorer':
        return <Target className="h-5 w-5 text-red-500" />
      case 'best_goalkeeper':
        return <Shield className="h-5 w-5 text-blue-500" />
      case 'best_defender':
        return <Shield className="h-5 w-5 text-green-500" />
      case 'best_midfielder':
        return <Star className="h-5 w-5 text-purple-500" />
      case 'best_forward':
        return <Target className="h-5 w-5 text-orange-500" />
      default:
        return <Award className="h-5 w-5 text-gray-500" />
    }
  }

  const formatAwardType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const filteredAwards = awards.filter(award => {
    const matchesSearch = 
      award.player.user_profile.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      award.player.team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatAwardType(award.type).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || award.type === selectedCategory

    return matchesSearch && matchesCategory
  })

  const filteredTrophies = trophies.filter(trophy => {
    const matchesSearch = 
      trophy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trophy.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || 
      (selectedCategory === "team" && trophy.type === "team") ||
      (selectedCategory === "individual" && trophy.type === "individual")

    return matchesSearch && matchesCategory
  })

  const categories = [
    { id: "all", name: "All Awards" },
    { id: "player_of_the_month", name: "Player of the Month" },
    { id: "top_scorer", name: "Top Scorer" },
    { id: "best_goalkeeper", name: "Best Goalkeeper" },
    { id: "best_defender", name: "Best Defender" },
    { id: "best_midfielder", name: "Best Midfielder" },
    { id: "best_forward", name: "Best Forward" },
    { id: "team", name: "Team Trophies" },
    { id: "individual", name: "Individual Trophies" },
  ]

  const selectedCompetitionName = competitions.find(c => c.id === selectedCompetition)?.name || 'All Competitions'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-orange-900/20"></div>
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
                  <h1 className="text-page-title bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    Awards & Trophies
                  </h1>
                  <p className="text-body">Recognition and achievements across competitions</p>
                </div>
              </div>
            </div>

            {/* Enhanced Filters */}
            <div className="animate-in fade-in slide-in-from-top" style={{animationDelay: '100ms'}}>
              <div className="grid md:grid-cols-3 spacing-md mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search awards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-body-emphasis placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-amber-600/50 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>

                <div className="relative">
                  <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={selectedCompetition || ''}
                    onChange={(e) => setSelectedCompetition(e.target.value || null)}
                    aria-label="Select competition"
                    className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-body-emphasis focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-amber-600/50 transition-all duration-300 backdrop-blur-sm appearance-none"
                  >
                    <option value="">All Competitions</option>
                    {competitions.map((competition) => (
                      <option key={competition.id} value={competition.id}>
                        {competition.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="Select award category"
                    className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-body-emphasis focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-amber-600/50 transition-all duration-300 backdrop-blur-sm appearance-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="player">Player Awards</option>
                    <option value="team">Team Awards</option>
                    <option value="trophy">Trophies</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="px-4 pb-8 max-w-7xl mx-auto">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 pb-8 max-w-7xl mx-auto">
          {/* Awards Section */}
          {(selectedCategory === 'all' || selectedCategory === 'player' || selectedCategory === 'team') && filteredAwards.length > 0 && (
            <div className="animate-in fade-in scale-in mb-8" style={{animationDelay: '200ms'}}>
              <h2 className="text-heading mb-6 flex items-center spacing-sm">
                <Award className="w-6 h-6 text-amber-400" />
                Recent Awards
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 spacing-md">
                {filteredAwards.map((award, index) => (
                  <div key={award.id} className={cn(
                    "bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 card-interactive group",
                    "hover:border-amber-600/40 transition-all duration-300"
                  )}>
                    {/* Award Header */}
                    <div className="flex items-center spacing-md mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {getAwardIcon(award.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-body-emphasis">
                          {formatAwardType(award.type)}
                        </h3>
                        <p className="text-caption">{award.season}</p>
                      </div>
                    </div>

                    {/* Player Info */}
                    <div className="mb-4 p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center spacing-sm mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-body-emphasis font-semibold">
                            {award.player.user_profile.username || 'Unknown Player'}
                          </h4>
                          <p className="text-caption">
                            {award.player.team.name} • #{award.player.number} • {award.player.position}
                          </p>
                        </div>
                        {award.player.team.logo_url && (
                          <img
                            src={award.player.team.logo_url}
                            alt={award.player.team.name}
                            className="w-6 h-6 rounded-full object-cover shadow-md"
                          />
                        )}
                      </div>
                    </div>

                    {/* Award Details */}
                    <div className="grid grid-cols-2 spacing-sm">
                      <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-3">
                        <div className="flex items-center spacing-xs mb-1">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span className="text-caption">Competition</span>
                        </div>
                        <div className="text-body-emphasis text-sm">
                          {award.competition.name}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-3">
                        <div className="flex items-center spacing-xs mb-1">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-caption">Awarded</span>
                        </div>
                        <div className="text-body-emphasis text-sm">
                          {formatDate(award.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trophies Section */}
          {(selectedCategory === 'all' || selectedCategory === 'trophy') && filteredTrophies.length > 0 && (
            <div className="animate-in fade-in scale-in" style={{animationDelay: '300ms'}}>
              <h2 className="text-heading mb-6 flex items-center spacing-sm">
                <Crown className="w-6 h-6 text-amber-400" />
                Competition Trophies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 spacing-md">
                {filteredTrophies.map((trophy, index) => (
                  <div key={trophy.id} className={cn(
                    "bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 card-interactive group text-center",
                    "hover:border-amber-600/40 transition-all duration-300"
                  )}>
                    {/* Trophy Image/Icon */}
                    <div className="mb-4">
                      {trophy.image_url ? (
                        <img
                          src={trophy.image_url}
                          alt={trophy.name}
                          className="w-16 h-16 mx-auto object-cover rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Crown className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Trophy Info */}
                    <div className="mb-4">
                      <h3 className="text-body-emphasis font-semibold mb-2">
                        {trophy.name}
                      </h3>
                      {trophy.description && (
                        <p className="text-caption text-gray-400">
                          {trophy.description}
                        </p>
                      )}
                    </div>

                    {/* Trophy Details */}
                    <div className="space-y-2">
                      <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-2">
                        <div className="text-caption">Type</div>
                        <div className="text-body-emphasis capitalize">{trophy.type}</div>
                      </div>
                      
                      {trophy.competition && (
                        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-2">
                          <div className="text-caption">Competition</div>
                          <div className="text-body-emphasis text-sm">{trophy.competition.name}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredAwards.length === 0 && filteredTrophies.length === 0 && (
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8 text-center animate-in fade-in scale-in">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-subheading text-gray-300 mb-2">No Awards Found</h3>
              <p className="text-body text-gray-500">
                {searchQuery || selectedCompetition || selectedCategory !== 'all'
                  ? 'No awards match your current filters.'
                  : 'No awards have been given out yet.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 