"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  History, 
  ArrowLeft, 
  Calendar,
  Trophy,
  Target,
  Award
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function MatchHistoryPage() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatchHistory()
  }, [])

  const fetchMatchHistory = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false })

      if (error) throw error
      setMatches(data || [])
    } catch (error) {
      console.error('Error fetching match history:', error)
      toast({
        title: "Error",
        description: "Failed to load match history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading match history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 pb-8">
      <div className="w-full pt-8 px-4 space-y-8">
        {/* Header */}
        <div>
          <Link href="/profile" className="flex items-center gap-2 text-green-400 hover:text-green-300 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-green-100">Match History</h1>
          <p className="text-gray-400">View your past match performances and statistics</p>
        </div>

        {/* Match Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
            <CardContent className="p-6 text-center">
              <History className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-400">{matches.length}</div>
              <div className="text-gray-400 text-sm">Total Matches</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-400">12</div>
              <div className="text-gray-400 text-sm">Wins</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-900/20 to-gray-900/40 border-purple-800/30">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-400">15</div>
              <div className="text-gray-400 text-sm">Goals Scored</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-900/20 to-gray-900/40 border-yellow-800/30">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-yellow-400">8.2</div>
              <div className="text-gray-400 text-sm">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Match History */}
        <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-green-100 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matches.slice(0, 10).map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-100">
                        {match.home_team_name} vs {match.away_team_name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {match.home_score} - {match.away_score}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">
                            {new Date(match.match_date).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-gray-400 text-sm">1 Goal, 1 Assist</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={match.result === 'win' ? 'default' : match.result === 'draw' ? 'secondary' : 'destructive'}>
                      {match.result === 'win' ? 'Win' : match.result === 'draw' ? 'Draw' : 'Loss'}
                    </Badge>
                    <div className="text-right">
                      <div className="text-yellow-400 font-semibold">8.5</div>
                      <div className="text-gray-400 text-xs">Rating</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 