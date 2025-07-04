"use client"

import { useSearchParams, useParams, useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface PlayerStat {
  id: string
  name: string
  team: string
  value: number
  games_played: number
}

interface TeamStat {
  id: string
  name: string
  value: number
  games_played: number
}

export default function StatTablePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const competitionId = params.competitionId as string
  const statType = params.statType as string
  const season = searchParams.get("season") || "1"

  const [stats, setStats] = useState<PlayerStat[] | TeamStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        let data: any[] = []
        if (["goals", "assists", "cleanSheets", "mvp"].includes(statType)) {
          // Player stats
          const { data: playerStats, error } = await supabase
            .from("player_match_stats")
            .select(`
              player_id,
              players!inner(id, name, team_id),
              teams!inner(id, name),
              goals,
              assists,
              clean_sheet,
              rating,
              minutes_played
            `)
            .eq("season", season)
            .eq("competition_id", competitionId)

          if (error) throw error

          // Aggregate by player
          const statMap = new Map<string, any>()
          // Utility to safely extract id and name
          function getId(obj: any, fallback: any) {
            if (Array.isArray(obj)) return obj[0]?.id || fallback
            if (obj && typeof obj === 'object' && 'id' in obj) return obj.id
            return fallback
          }
          function getName(obj: any, fallback: any) {
            if (Array.isArray(obj)) return obj[0]?.name || fallback
            if (obj && typeof obj === 'object' && 'name' in obj) return obj.name
            return fallback
          }
          playerStats?.forEach(stat => {
            const playerId = getId(stat.players, stat.player_id || 'unknown')
            const playerName = getName(stat.players, stat.name || 'Unknown')
            const teamName = getName(stat.teams, 'Unknown')
            const key = playerId
            if (!statMap.has(key)) {
              statMap.set(key, {
                id: playerId,
                name: playerName,
                team: teamName,
                value: 0,
                games_played: 0,
                totalRating: 0,
                ratedMatches: 0
              })
            }
            const entry = statMap.get(key)
            if (statType === "goals") {
              entry.value += stat.goals
            } else if (statType === "assists") {
              entry.value += stat.assists
            } else if (statType === "cleanSheets") {
              entry.value += stat.clean_sheet ? 1 : 0
            } else if (statType === "mvp") {
              if (stat.rating && stat.minutes_played >= 10) {
                entry.totalRating += stat.rating
                entry.ratedMatches += 1
                entry.value = entry.ratedMatches > 0 ? parseFloat((entry.totalRating / entry.ratedMatches).toFixed(2)) : 0
              }
            }
            entry.games_played += 1
          })
          data = Array.from(statMap.values())
            .filter(entry => statType !== "mvp" || entry.ratedMatches >= 3)
            .sort((a, b) => b.value - a.value)
        } else {
          // Team stats
          const { data: matches, error } = await supabase
            .from("matches")
            .select(`
              id, home_team_id, away_team_id, home_score, away_score, status,
              home_team:teams!matches_home_team_id_fkey(id, name),
              away_team:teams!matches_away_team_id_fkey(id, name)
            `)
            .eq("competition_id", competitionId)
            .eq("status", "completed")
            .eq("season", season)

          if (error) throw error

          const teamStatsMap = new Map<string, any>()
          matches?.forEach(match => {
            // Flatten home_team/away_team if they are arrays
            const homeTeamObj = Array.isArray(match.home_team) ? match.home_team[0] : match.home_team
            const awayTeamObj = Array.isArray(match.away_team) ? match.away_team[0] : match.away_team
            if (!teamStatsMap.has(match.home_team_id)) {
              teamStatsMap.set(match.home_team_id, {
                id: homeTeamObj?.id || match.home_team_id,
                name: homeTeamObj?.name || 'Unknown',
                value: 0,
                games_played: 0
              })
            }
            if (!teamStatsMap.has(match.away_team_id)) {
              teamStatsMap.set(match.away_team_id, {
                id: awayTeamObj?.id || match.away_team_id,
                name: awayTeamObj?.name || 'Unknown',
                value: 0,
                games_played: 0
              })
            }
            const home = teamStatsMap.get(match.home_team_id)
            const away = teamStatsMap.get(match.away_team_id)
            if (statType === "teamGoals") {
              home.value += match.home_score
              away.value += match.away_score
            } else if (statType === "defense") {
              home.value += match.away_score
              away.value += match.home_score
            } else if (statType === "form") {
              // Count wins only
              if (match.home_score > match.away_score) home.value += 1
              else if (match.away_score > match.home_score) away.value += 1
            }
            home.games_played += 1
            away.games_played += 1
          })
          data = Array.from(teamStatsMap.values()).sort((a, b) => b.value - a.value)
        }
        setStats(data)
      } catch (err: any) {
        setError(err.message || "Failed to load stats")
      } finally {
        setLoading(false)
      }
    }
    if (competitionId && statType && season) fetchStats()
  }, [competitionId, statType, season, supabase])

  const getStatTitle = (type: string) => {
    switch (type) {
      case "goals": return "Top Scorers"
      case "assists": return "Most Assists"
      case "cleanSheets": return "Clean Sheets"
      case "mvp": return "MVP (Highest Rating)"
      case "teamGoals": return "Most Goals Scored"
      case "defense": return "Best Defense"
      case "form": return "Best Form"
      default: return "Statistics"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold mb-6">{getStatTitle(statType)} - Season {season}</h1>
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Full Table</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">{error}</div>
            ) : stats.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No statistics available</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {stats.map((stat, index) => (
                  <div key={stat.id || index} className="flex items-center justify-between py-3 px-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4",
                      index === 0 ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30" :
                      index === 1 ? "bg-gray-400 text-black shadow-lg shadow-gray-400/30" :
                      index === 2 ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30" :
                      "bg-gray-600 text-white"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">{stat.name || 'Unknown'}</div>
                      {"team" in stat && <div className="text-xs text-gray-400 truncate">{(stat as PlayerStat).team}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.games_played} games</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 