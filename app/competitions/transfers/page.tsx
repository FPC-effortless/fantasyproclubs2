"use client"

import { useEffect, useState } from "react"
import { ArrowRightLeft, User, Calendar, DollarSign, Search, Filter, Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/providers/supabase-provider"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import Image from "next/image"

interface Competition {
  id: string
  name: string
  type: string
  status: string
}

interface Transfer {
  id: string
  player_id: string
  from_team_id: string | null
  to_team_id: string
  status: string
  transfer_fee: number | null
  transfer_date: string
  created_at: string
  player: {
    id: string
    user_id: string
    position: string
    number: number
    user_profile: {
      id: string
      username: string | null
    }
  } | null
  from_team: {
    id: string
    name: string
    short_name: string
    logo_url: string | null
  } | null
  to_team: {
    id: string
    name: string
    short_name: string
    logo_url: string | null
  } | null
}

export default function CompetitionTransfersPage() {
  const { supabase } = useSupabase()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompetitions()
  }, [])

  useEffect(() => {
    if (selectedCompetition === null) {
      loadAllTransfers()
    } else {
      loadTransfersForCompetition(selectedCompetition)
    }
  }, [selectedCompetition, selectedStatus])

  const loadCompetitions = async () => {
    try {
      console.log('Loading competitions...')
      
      const { data, error } = await supabase
        .from('competitions')
        .select('id, name, type, status')
        .order('name')
      
      if (error) throw error

      console.log('Found competitions:', data?.length || 0)
      setCompetitions(data || [])
    } catch (error: any) {
      console.error('Error loading competitions:', error)
      toast({
        title: "Error loading competitions",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const loadAllTransfers = async () => {
    try {
      setLoading(true)
      console.log('Loading all transfers...')
      
      let query = supabase
        .from('transfers')
        .select(`
          id,
          player_id,
          from_team_id,
          to_team_id,
          status,
          transfer_fee,
          transfer_date,
          created_at,
          player:players(
            id,
            user_id,
            position,
            number,
            user_profile:user_profiles(id, username)
          ),
          from_team:teams!transfers_from_team_id_fkey(
            id,
            name,
            short_name,
            logo_url
          ),
          to_team:teams!transfers_to_team_id_fkey(
            id,
            name,
            short_name,
            logo_url
          )
        `)
        .order('created_at', { ascending: false })

      if (selectedStatus && selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus)
      }

      const { data: transfersData, error: transfersError } = await query

      if (transfersError) {
        console.error('Error loading transfers:', transfersError)
        throw transfersError
      }

      console.log('Loaded transfers:', transfersData?.length || 0)
      
      // Transform the data to match our interface
      const transformedTransfers = (transfersData || []).map((transfer: any) => ({
        ...transfer,
        player: Array.isArray(transfer.player) ? transfer.player[0] || null : transfer.player,
        from_team: Array.isArray(transfer.from_team) ? transfer.from_team[0] || null : transfer.from_team,
        to_team: Array.isArray(transfer.to_team) ? transfer.to_team[0] || null : transfer.to_team
      }))
      
      setTransfers(transformedTransfers)
    } catch (error: any) {
      console.error('Error in loadAllTransfers:', error)
      toast({
        title: "Error loading transfers",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTransfersForCompetition = async (competitionId: string) => {
    try {
      setLoading(true)
      console.log('Loading transfers for competition:', competitionId)
      
      // First get teams in this competition
      const { data: competitionTeams, error: competitionTeamsError } = await supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', competitionId)

      if (competitionTeamsError) throw competitionTeamsError

      const teamIds = competitionTeams?.map(ct => ct.team_id) || []
      
      if (teamIds.length === 0) {
        console.log('No teams found in this competition')
        setTransfers([])
        return
      }

      // Now get transfers involving these teams
      let query = supabase
        .from('transfers')
        .select(`
          id,
          player_id,
          from_team_id,
          to_team_id,
          status,
          transfer_fee,
          transfer_date,
          created_at,
          player:players(
            id,
            user_id,
            position,
            number,
            user_profile:user_profiles(id, username)
          ),
          from_team:teams!transfers_from_team_id_fkey(
            id,
            name,
            short_name,
            logo_url
          ),
          to_team:teams!transfers_to_team_id_fkey(
            id,
            name,
            short_name,
            logo_url
          )
        `)
        .or(`from_team_id.in.(${teamIds.join(',')}),to_team_id.in.(${teamIds.join(',')})`)
        .order('created_at', { ascending: false })

      if (selectedStatus && selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus)
      }

      const { data: transfersData, error: transfersError } = await query

      if (transfersError) {
        console.error('Error loading competition transfers:', transfersError)
        throw transfersError
      }

      console.log('Loaded competition transfers:', transfersData?.length || 0)
      
      // Transform the data to match our interface
      const transformedTransfers = (transfersData || []).map((transfer: any) => ({
        ...transfer,
        player: Array.isArray(transfer.player) ? transfer.player[0] || null : transfer.player,
        from_team: Array.isArray(transfer.from_team) ? transfer.from_team[0] || null : transfer.from_team,
        to_team: Array.isArray(transfer.to_team) ? transfer.to_team[0] || null : transfer.to_team
      }))
      
      setTransfers(transformedTransfers)
    } catch (error: any) {
      console.error('Error in loadTransfersForCompetition:', error)
      toast({
        title: "Error loading transfers",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatFee = (fee: number | null) => {
    if (!fee) return 'Free Transfer'
    if (fee >= 1000000) return `€${(fee / 1000000).toFixed(1)}M`
    if (fee >= 1000) return `€${(fee / 1000).toFixed(0)}K`
    return `€${fee}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-400" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'approved':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const filteredTransfers = transfers.filter(transfer => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      transfer.player?.user_profile?.username?.toLowerCase().includes(searchLower) ||
      transfer.from_team?.name?.toLowerCase().includes(searchLower) ||
      transfer.to_team?.name?.toLowerCase().includes(searchLower) ||
      transfer.player?.position?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-cyan-900/20"></div>
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
                  <h1 className="text-page-title bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Transfer Activity
                  </h1>
                  <p className="text-body">Track player movements and transfer activity</p>
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
                    placeholder="Search transfers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-body-emphasis placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={selectedCompetition || ''}
                    onChange={(e) => setSelectedCompetition(e.target.value || null)}
                    aria-label="Select competition"
                    className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-body-emphasis focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50 transition-all duration-300 backdrop-blur-sm appearance-none"
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
                  <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={selectedStatus || ''}
                    onChange={(e) => setSelectedStatus(e.target.value || null)}
                    aria-label="Select transfer status"
                    className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-body-emphasis focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50 transition-all duration-300 backdrop-blur-sm appearance-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
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
          <div className="space-y-4">
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
                    <div className="h-5 bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center spacing-md">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                    <ArrowRightLeft className="w-4 h-4 text-gray-700" />
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTransfers.length > 0 ? (
          <div className="animate-in fade-in scale-in" style={{animationDelay: '200ms'}}>
            <div className="space-y-4">
              {filteredTransfers.map((transfer, index) => (
                <div key={transfer.id} className={cn(
                  "bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 card-interactive",
                  "hover:border-emerald-600/40 transition-all duration-300"
                )}>
                  {/* Transfer Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center spacing-md">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-body-emphasis">
                          {transfer.player?.user_profile?.username || 'Unknown Player'}
                        </h3>
                        <div className="flex items-center spacing-xs">
                          <span className="text-caption">#{transfer.player?.number}</span>
                          <span className="text-caption">{transfer.player?.position}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium flex items-center spacing-xs",
                      getStatusColor(transfer.status)
                    )}>
                      {getStatusIcon(transfer.status)}
                      {formatTransferStatus(transfer.status)}
                    </div>
                  </div>

                  {/* Transfer Flow */}
                  <div className="flex items-center justify-between bg-gray-800/30 rounded-lg p-4 mb-4">
                    {/* From Team */}
                    <div className="flex items-center spacing-sm">
                      {transfer.from_team?.logo_url ? (
                        <Image
                          src={transfer.from_team.logo_url}
                          alt={transfer.from_team.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {transfer.from_team?.short_name?.charAt(0) || 'F'}
                        </div>
                      )}
                      <div>
                        <p className="text-body-emphasis font-medium">
                          {transfer.from_team?.name || 'Free Agent'}
                        </p>
                        <p className="text-caption">From</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center spacing-sm text-emerald-400">
                      <ArrowRightLeft className="w-5 h-5" />
                    </div>

                    {/* To Team */}
                    <div className="flex items-center spacing-sm">
                      <div>
                        <p className="text-body-emphasis font-medium text-right">
                          {transfer.to_team?.name || 'Unknown Team'}
                        </p>
                        <p className="text-caption text-right">To</p>
                      </div>
                      {transfer.to_team?.logo_url ? (
                        <Image
                          src={transfer.to_team.logo_url}
                          alt={transfer.to_team.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {transfer.to_team?.short_name?.charAt(0) || 'T'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transfer Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 spacing-sm">
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-lg p-3">
                      <div className="flex items-center spacing-xs mb-1">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-caption">Fee</span>
                      </div>
                      <div className="text-body-emphasis">
                        {formatFee(transfer.transfer_fee)}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-center spacing-xs mb-1">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-caption">Date</span>
                      </div>
                      <div className="text-body-emphasis">
                        {formatDate(transfer.transfer_date)}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-3">
                      <div className="flex items-center spacing-xs mb-1">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-caption">Created</span>
                      </div>
                      <div className="text-body-emphasis">
                        {formatDate(transfer.created_at)}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-3">
                      <div className="flex items-center spacing-xs mb-1">
                        <CheckCircle className="w-4 h-4 text-amber-400" />
                        <span className="text-caption">Status</span>
                      </div>
                      <div className="text-body-emphasis capitalize">
                        {transfer.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8 text-center animate-in fade-in scale-in">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRightLeft className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-subheading text-gray-300 mb-2">No Transfers Found</h3>
            <p className="text-body text-gray-500">
              {searchQuery || selectedStatus || selectedCompetition 
                ? 'No transfers match your current filters.' 
                : 'No transfer activity to display.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )

  function formatTransferStatus(status: string) {
    const statusMap: { [key: string]: string } = {
      'completed': 'Completed',
      'pending': 'Pending',
      'cancelled': 'Cancelled'
    }
    return statusMap[status] || status
  }
}