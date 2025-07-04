"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronDown, Crown, Settings, Users, Activity, RotateCcw, Play, Plus, ChevronLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSupabase } from '@/components/providers/supabase-provider'
import { useRouter } from 'next/navigation'
import Image from "next/image"
import Link from "next/link"
import { openSignInModal } from '@/components/auth/SignInModal'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface FantasyTeam {
  id: string
  name: string
  budget: number
  points: number
  competition_id: string
}

interface BasePlayer {
  id: string
  user_id: string
  position: string
  number: number
  team_id: string
  fantasy_price: number
  fantasy_points: number
}

interface FantasyPlayer extends BasePlayer {
  user_profile: {
    display_name: string
    username: string
    avatar_url?: string
  }
  team: {
    id: string
    name: string
    short_name: string
  }
  player_match_stats: {
    goals: number
    assists: number
    matches_played: number
    average_rating: number
  }
}

interface FantasyTeamPlayer {
  player_id: string
  position: string
  is_captain: boolean
  is_vice_captain: boolean
  is_bench: boolean
}

interface CompetitionTeam {
  team_id: string
}

interface UserProfile {
  id: string
  display_name: string
  username: string
  avatar_url?: string
}

interface Team {
  id: string
  name: string
  short_name: string
}

interface PlayerMatchStat {
  player_id: string
  goals: number
  assists: number
  matches_played: number
  average_rating: number
}

export default function TeamPage() {
  const [formation, setFormation] = useState("4-3-3")
  const [captain, setCaptain] = useState("")
  const [view, setView] = useState("pitch") // pitch or list
  const [fantasyTeam, setFantasyTeam] = useState<FantasyTeam | null>(null)
  const [teamPlayers, setTeamPlayers] = useState<FantasyPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const { supabase } = useSupabase()
  const router = useRouter()

  const formations = ["4-3-3", "4-4-2", "3-5-2", "5-3-2", "3-4-3"]

  useEffect(() => {
    loadUserAndFantasyTeam()
  }, [])

  const loadUserAndFantasyTeam = async () => {
    try {
      setLoading(true)
      console.log('👤 Loading user and fantasy team...')
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('❌ Error loading user:', userError)
        setLoading(false)
        return
      }

      if (!user) {
        console.log('ℹ️ No authenticated user found')
        setLoading(false)
        return
      }

      setUser(user)
      console.log('✅ User loaded:', user.id)

      // Load user's fantasy team
      const { data: fantasyTeamData, error: teamError } = await supabase
        .from('fantasy_teams')
        .select('id, name, budget, points, competition_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (teamError) {
        if (teamError.code === 'PGRST116') {
          // No fantasy team found
          console.log('ℹ️ User has no fantasy team')
        } else {
          console.error('❌ Error loading fantasy team:', teamError)
        }
        setLoading(false)
        return
      }

      setFantasyTeam(fantasyTeamData)
      console.log('✅ Fantasy team loaded:', fantasyTeamData.name)
      
      // Load team players
      if (fantasyTeamData) {
        await loadFantasyTeamPlayers(fantasyTeamData.id, fantasyTeamData.competition_id)
      }

    } catch (error) {
      console.error('💥 Error loading user and fantasy team:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFantasyTeamPlayers = async (fantasyTeamId: string, competitionId: string) => {
    try {
      console.log('👥 Loading fantasy team players for team:', fantasyTeamId)

      // Get teams in the competition
      const { data: competitionTeams, error: competitionTeamsError } = await supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', competitionId)

      if (competitionTeamsError) {
        console.error('❌ Error loading competition teams:', competitionTeamsError)
        return
      }

      if (!competitionTeams || competitionTeams.length === 0) {
        console.log('ℹ️ No teams found in competition')
        return
      }

      const teamIds = competitionTeams.map((ct: CompetitionTeam) => ct.team_id)

      // Get a sample of players (first 15 for a basic team)
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, user_id, position, number, status, team_id, fantasy_price, fantasy_points')
        .in('team_id', teamIds)
        .eq('status', 'active')
        .order('number')
        .limit(15)

      if (playersError) {
        console.error('❌ Error loading players:', playersError)
        return
      }

      if (!playersData || playersData.length === 0) {
        console.log('ℹ️ No players found')
        return
      }

      // Get user profiles, teams, and match stats in parallel
      const [userProfilesResult, teamsResult, matchStatsResult] = await Promise.all([
        (async () => {
          try {
            const result = await supabase
              .from('user_profiles')
              .select('id, display_name, username, avatar_url')
              .in('id', playersData.map((p: BasePlayer) => p.user_id))
            if (result.error) {
              if (result.error.code === '42703') {
                const fallbackResult = await supabase
                  .from('user_profiles')
                  .select('id, display_name, username')
                  .in('id', playersData.map((p: BasePlayer) => p.user_id))
                return { data: fallbackResult.data || [], error: fallbackResult.error }
              } else {
                return { data: result.data || [], error: result.error }
              }
            } else {
              return { data: result.data || [], error: null }
            }
          } catch (error) {
            return { data: [], error }
          }
        })(),
        supabase
          .from('teams')
          .select('id, name, short_name')
          .in('id', playersData.map((p: BasePlayer) => p.team_id)),
        supabase
          .from('player_match_stats')
          .select('player_id, goals, assists, matches_played, average_rating')
          .in('player_id', playersData.map((p: BasePlayer) => p.id)),
      ])

      let userProfiles: UserProfile[] = []
      let profilesError: any = null
      if (userProfilesResult.error) {
        profilesError = userProfilesResult.error
      } else {
        userProfiles = userProfilesResult.data
      }

      const { data: teamsData, error: teamsError } = teamsResult
      if (teamsError) {
        console.error('❌ Error loading teams:', teamsError)
        return
      }

      const { data: matchStatsData, error: matchStatsError } = matchStatsResult
      if (matchStatsError) {
        console.error('❌ Error loading match stats:', matchStatsError)
      }

      // Combine all the data
      const enrichedPlayers = playersData.map((player: BasePlayer) => {
        const userProfile = userProfiles.find((p: UserProfile) => p.id === player.user_id)
        const team = teamsData?.find((t: Team) => t.id === player.team_id)
        const matchStats = matchStatsData?.find((s: PlayerMatchStat) => s.player_id === player.id)

        return {
          ...player,
          user_profile: userProfile || { display_name: 'Unknown', username: 'unknown' },
          team: team || { id: '', name: 'Unknown', short_name: 'UNK' },
          player_match_stats: matchStats || { goals: 0, assists: 0, matches_played: 0, average_rating: 0 }
        } as FantasyPlayer
      })

      setTeamPlayers(enrichedPlayers)

    } catch (error) {
      console.error('💥 Error in loadFantasyTeamPlayers:', error)
    }
  }

  const PlayerSlot = ({ 
    position, 
    isEmpty = false, 
    isCaptain = false,
    player = null
  }: { 
    position: string
    isEmpty?: boolean
    isCaptain?: boolean
    player?: FantasyPlayer | null
  }) => (
    <div className="relative group cursor-pointer">
      {isEmpty ? (
        // Empty slot
        <div className="w-16 h-20 md:w-20 md:h-24 border-2 border-dashed border-white/30 rounded-lg flex flex-col items-center justify-center text-center hover:border-green-400/50 transition-all duration-300">
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center mb-1">
            <Plus className="w-4 h-4 text-white/40" />
          </div>
          <div className="text-xs text-white/60 font-medium">{position}</div>
        </div>
      ) : (
        // Player card
        <div className="w-16 h-20 md:w-20 md:h-24 bg-gradient-to-b from-white to-gray-100 rounded-lg shadow-lg border-2 border-gray-300 hover:border-green-500 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          {/* Fantasy points badge */}
          <div className="absolute -top-1 -left-1 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs px-1.5 py-0.5 rounded-md font-bold shadow-md z-10">
            {Math.floor(player?.fantasy_points || 0)}
          </div>
          
          {/* Captain badge */}
          {isCaptain && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg z-10">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}

          {/* Player image */}
          <div className="pt-3 px-2 flex justify-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              <Image
                src={player?.user_profile?.avatar_url || "/placeholder-avatar.svg"}
                alt="Player"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Player info */}
          <div className="px-1 pt-1 text-center">
            <div className="text-xs font-bold text-gray-900 truncate">
              {player?.user_profile?.display_name || 'PLAYER'}
            </div>
            <div className="text-xs text-gray-600 font-medium">{Math.floor(player?.fantasy_points || 0)}</div>
          </div>
        </div>
      )}
    </div>
  )

  const getFormationLayout = () => {
    switch (formation) {
      case "4-3-3":
        return {
          forwards: 3,
          midfielders: 3,
          defenders: 4,
          goalkeeper: 1
        }
      case "4-4-2":
        return {
          forwards: 2,
          midfielders: 4,
          defenders: 4,
          goalkeeper: 1
        }
      case "3-5-2":
        return {
          forwards: 2,
          midfielders: 5,
          defenders: 3,
          goalkeeper: 1
        }
      case "5-3-2":
        return {
          forwards: 2,
          midfielders: 3,
          defenders: 5,
          goalkeeper: 1
        }
      case "3-4-3":
        return {
          forwards: 3,
          midfielders: 4,
          defenders: 3,
          goalkeeper: 1
        }
      default:
        return {
          forwards: 3,
          midfielders: 3,
          defenders: 4,
          goalkeeper: 1
        }
    }
  }

  const layout = getFormationLayout()

  // Group players by position
  const playersByPosition = {
    GKP: teamPlayers.filter(p => p.position === 'GK' || p.position === 'GKP'),
    DEF: teamPlayers.filter(p => p.position === 'DEF' || p.position === 'CB' || p.position === 'LB' || p.position === 'RB'),
    MID: teamPlayers.filter(p => p.position === 'MID' || p.position === 'CM' || p.position === 'CDM' || p.position === 'CAM'),
    FWD: teamPlayers.filter(p => p.position === 'FWD' || p.position === 'ST' || p.position === 'LW' || p.position === 'RW')
  }

  const PitchView = () => (
    <div className="relative w-full max-w-md mx-auto">
      {/* Football Pitch */}
      <div 
        className="relative w-full bg-gradient-to-b from-green-500 to-green-600 rounded-lg shadow-2xl overflow-hidden"
        style={{ aspectRatio: '2/3' }}
      >
        {/* Pitch pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-400/20 via-transparent to-green-400/20"></div>
        
        {/* Pitch markings */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 300">
          {/* Outer boundary */}
          <rect x="10" y="10" width="180" height="280" fill="none" stroke="white" strokeWidth="2" opacity="0.8"/>
          
          {/* Center line */}
          <line x1="10" y1="150" x2="190" y2="150" stroke="white" strokeWidth="2" opacity="0.8"/>
          
          {/* Center circle */}
          <circle cx="100" cy="150" r="30" fill="none" stroke="white" strokeWidth="2" opacity="0.8"/>
          <circle cx="100" cy="150" r="2" fill="white" opacity="0.8"/>
          
          {/* Goal areas */}
          <rect x="70" y="10" width="60" height="20" fill="none" stroke="white" strokeWidth="2" opacity="0.8"/>
          <rect x="70" y="270" width="60" height="20" fill="none" stroke="white" strokeWidth="2" opacity="0.8"/>
          
          {/* Penalty areas */}
          <rect x="50" y="10" width="100" height="40" fill="none" stroke="white" strokeWidth="2" opacity="0.8"/>
          <rect x="50" y="250" width="100" height="40" fill="none" stroke="white" strokeWidth="2" opacity="0.8"/>
          
          {/* Goal posts */}
          <rect x="85" y="8" width="30" height="4" fill="white" opacity="0.8"/>
          <rect x="85" y="288" width="30" height="4" fill="white" opacity="0.8"/>
        </svg>

        {/* Player positions */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          {/* Forwards */}
          <div className="flex justify-evenly items-start pt-8">
            {Array.from({ length: layout.forwards }, (_, i) => (
              <PlayerSlot 
                key={`fwd-${i}`} 
                position="FWD" 
                player={playersByPosition.FWD[i] || null}
                isEmpty={!playersByPosition.FWD[i]}
                isCaptain={i === 0 && captain === "fwd"} 
              />
            ))}
          </div>

          {/* Midfielders */}
          <div className="flex justify-evenly items-center">
            {Array.from({ length: layout.midfielders }, (_, i) => (
              <PlayerSlot 
                key={`mid-${i}`} 
                position="MID" 
                player={playersByPosition.MID[i] || null}
                isEmpty={!playersByPosition.MID[i]}
              />
            ))}
          </div>

          {/* Defenders */}
          <div className="flex justify-evenly items-center">
            {Array.from({ length: layout.defenders }, (_, i) => (
              <PlayerSlot 
                key={`def-${i}`} 
                position="DEF" 
                player={playersByPosition.DEF[i] || null}
                isEmpty={!playersByPosition.DEF[i]}
              />
            ))}
          </div>

          {/* Goalkeeper */}
          <div className="flex justify-center items-end pb-8">
            <PlayerSlot 
              position="GKP" 
              player={playersByPosition.GKP[0] || null}
              isEmpty={!playersByPosition.GKP[0]}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const ListView = () => (
    <div className="space-y-4">
      {/* Starting XI */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4">Starting XI</h3>
        <div className="grid grid-cols-1 gap-3">
          {teamPlayers.slice(0, 11).map((player, i) => (
            <div key={player.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <Image 
                  src={player.user_profile?.avatar_url || "/placeholder-avatar.svg"} 
                  alt="Player" 
                  width={40}
                  height={40}
                  className="w-8 h-8 rounded-full" 
                />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{player.user_profile?.display_name}</div>
                <div className="text-sm text-gray-300">{player.position} • {Math.floor(player.fantasy_points)} pts</div>
              </div>
              <div className="text-white font-bold">£{player.fantasy_price}M</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bench */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4">Bench</h3>
        <div className="grid grid-cols-1 gap-3">
          {teamPlayers.slice(11, 15).map((player, i) => (
            <div key={player.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <Image 
                  src={player.user_profile?.avatar_url || "/placeholder-avatar.svg"} 
                  alt="Player" 
                  width={40}
                  height={40}
                  className="w-8 h-8 rounded-full" 
                />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{player.user_profile?.display_name}</div>
                <div className="text-sm text-gray-300">{player.position} • {Math.floor(player.fantasy_points)} pts</div>
              </div>
              <div className="text-white font-bold">£{player.fantasy_price}M</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pb-16">
        <div className="p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      </div>
    )
  }

  if (!fantasyTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <Users className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Fantasy Team Found</h2>
          <p className="text-gray-300 mb-6">You haven&apos;t created a fantasy team yet. Create one to start playing!</p>
          <Button 
            onClick={() => {
              if (!user) {
                openSignInModal();
                return;
              }
              router.push('/fantasy');
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Create Fantasy Team
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 text-white pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Link href="/fantasy" className="text-white hover:text-green-200 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <Users className="w-6 h-6 text-green-200" />
          <h1 className="text-2xl font-bold">MY TEAM</h1>
        </div>
      </div>
      <div className="p-4 space-y-6 max-w-5xl mx-auto">
        {/* Notification for unauthenticated users */}
        {!user && (
          <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded shadow flex items-center justify-between">
            <div>
              <strong>Sign up or sign in</strong> to create and manage your own fantasy team, set your lineup, and use all features!
            </div>
            <Button
              className="ml-4 bg-green-600 hover:bg-green-700 text-white"
              onClick={openSignInModal}
            >
              Sign Up / Sign In
            </Button>
          </div>
        )}
        {/* Main team content, pitch, and list views should be wrapped in cards with consistent style */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardContent className="p-4">
            {/* View Toggle */}
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
                <div className="flex">
                  <button
                    onClick={() => setView("pitch")}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      view === "pitch"
                        ? "bg-white text-gray-900 shadow-lg"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Pitch View
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      view === "list"
                        ? "bg-white text-gray-900 shadow-lg"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* Controls */}
            {view === "pitch" && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Select value={formation} onValueChange={setFormation}>
                    <SelectTrigger className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                      <SelectValue placeholder="Formation" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {formations.map((f) => (
                        <SelectItem key={f} value={f} className="text-white hover:bg-gray-700">
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Select value={captain} onValueChange={setCaptain}>
                    <SelectTrigger className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <SelectValue placeholder="Select Captain" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="fwd" className="text-white hover:bg-gray-700">Forward Captain</SelectItem>
                      <SelectItem value="mid" className="text-white hover:bg-gray-700">Midfielder Captain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Main Content */}
            {view === "pitch" ? <PitchView /> : <ListView />}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                variant="outline" 
                className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
              >
                Auto Pick
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Play className="w-4 h-4 mr-2" />
                Enter Squad
              </Button>
            </div>

            {/* Fantasy Chips */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Fantasy Chips</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button className="flex items-center justify-center gap-3 bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 hover:border-green-600/50 text-white hover:bg-gradient-to-r hover:from-green-600/20 hover:to-green-700/20 transition-all duration-300 py-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">Bench Boost</span>
                </Button>
                <Button className="flex items-center justify-center gap-3 bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 hover:border-yellow-600/50 text-white hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-yellow-700/20 transition-all duration-300 py-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">Triple Captain</span>
                </Button>
              </div>
            </div>

            {/* Bench (only shown in pitch view) */}
            {view === "pitch" && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Bench</h3>
                <div className="flex gap-4 overflow-x-auto">
                  {teamPlayers.slice(11, 15).map((player, i) => (
                    <PlayerSlot 
                      key={player.id}
                      position={player.position} 
                      player={player}
                    />
                  ))}
                  {/* Fill empty bench slots */}
                  {Array.from({ length: Math.max(0, 4 - teamPlayers.slice(11, 15).length) }, (_, i) => (
                    <PlayerSlot 
                      key={`bench-empty-${i}`}
                      position="SUB" 
                      isEmpty={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Team Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-green-400">£{fantasyTeam.budget.toFixed(1)}M</div>
                <div className="text-sm text-gray-300">Budget Left</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-blue-400">£{(teamPlayers.reduce((sum, p) => sum + p.fantasy_price, 0)).toFixed(1)}M</div>
                <div className="text-sm text-gray-300">Team Value</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-yellow-400">{fantasyTeam.points}</div>
                <div className="text-sm text-gray-300">Total Points</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-purple-400">{teamPlayers.length}/15</div>
                <div className="text-sm text-gray-300">Players</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
