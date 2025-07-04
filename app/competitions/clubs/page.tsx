"use client"

import { useEffect, useState, useCallback } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"

interface Competition {
  id: string;
  name: string;
}

interface Team {
  id: string
  name: string
  logo_url?: string | null
  competition_id?: string
}

export default function CompetitionClubsPage() {
  const { supabase } = useSupabase()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all')
  const [selectedSeason, setSelectedSeason] = useState<string>('all')
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  const seasons = ['2024/25', '2023/24', '2022/23']

  const loadCompetitions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('id, name')
        .order('name');
      if (error) throw error
      setCompetitions(data || [])
    } catch (error: any) {
      toast({ title: "Error loading competitions", description: error.message, variant: "destructive" })
    }
  }, [supabase, toast]);

  const loadAllTeams = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`id, name, logo_url, competition_teams(competition_id)`)
      
      if (error) throw error
      
      const transformedTeams = data?.map(team => ({
        id: team.id,
        name: team.name,
        logo_url: team.logo_url,
        // @ts-ignore
        competition_id: team.competition_teams[0]?.competition_id
      })) || [];

      setTeams(transformedTeams)
    } catch (error: any) {
      toast({ title: "Error loading teams", description: error.message, variant: "destructive" })
    }
  }, [supabase, toast]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadCompetitions(), loadAllTeams()])
      setLoading(false)
    }
    loadData()
  }, [loadCompetitions, loadAllTeams])

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCompetition = selectedCompetition === 'all' ? true : team.competition_id === selectedCompetition
    // Season filtering logic would go here if the data supported it
    return matchesSearch && matchesCompetition
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
              <h1 className="text-2xl font-bold text-green-400">Clubs</h1>
              <p className="text-gray-400 text-sm">Browse clubs by competition and season</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-600/40 transition-all"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Competition Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Competition</label>
            <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
              <SelectTrigger className="w-full bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 text-white">
                <SelectValue placeholder="All Competitions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Competitions</SelectItem>
                {competitions.map((competition) => (
                  <SelectItem key={competition.id} value={competition.id}>
                    {competition.name}
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

        {/* Clubs List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
                  <div className="animate-pulse flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                    <div className="h-4 bg-gray-700 rounded w-40"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map((team) => (
                <Link key={team.id} href={`/teams/${team.id}`}>
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-green-600/40 transition-all flex items-center gap-4">
                    {team.logo_url ? (
                      <Image src={team.logo_url} alt={team.name} width={48} height={48} className="rounded-lg" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {team.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="text-white font-semibold text-lg">{team.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8 text-center">
              <p className="text-gray-400">No clubs found for the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 