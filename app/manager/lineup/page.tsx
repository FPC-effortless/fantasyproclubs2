"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Trophy,
  UserCheck,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

interface Player {
  id: string
  name: string
  position: string
  number: number
  status: string
  rating: number
}

interface Formation {
  id: string
  name: string
  positions: string[]
}

const formations: Formation[] = [
  { id: "4-4-2", name: "4-4-2", positions: ["GK", "RB", "CB", "CB", "LB", "RM", "CM", "CM", "LM", "ST", "ST"] },
  { id: "4-3-3", name: "4-3-3", positions: ["GK", "RB", "CB", "CB", "LB", "CM", "CM", "CM", "RW", "ST", "LW"] },
  { id: "3-5-2", name: "3-5-2", positions: ["GK", "CB", "CB", "CB", "RWB", "CM", "CM", "CM", "LWB", "ST", "ST"] },
  { id: "4-2-3-1", name: "4-2-3-1", positions: ["GK", "RB", "CB", "CB", "LB", "CDM", "CDM", "CAM", "RW", "ST", "LW"] },
]

export default function LineupPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedFormation, setSelectedFormation] = useState("4-4-2")
  const [lineup, setLineup] = useState<Record<string, Player | null>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [nextMatch, setNextMatch] = useState<any>(null)

  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    try {
      const supabase = createClient()
      
      // Fetch team players
      const { data: playersData, error: playersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('status', 'active')

      if (playersError) throw playersError

      // Fetch next match
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'upcoming')
        .order('match_date')
        .limit(1)
        .single()

      if (matchData) setNextMatch(matchData)

      setPlayers(playersData || [])
    } catch (error) {
      console.error('Error fetching team data:', error)
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerSelect = (position: string, player: Player | null) => {
    setLineup(prev => ({
      ...prev,
      [position]: player
    }))
  }

  const handleSubmitLineup = async () => {
    const selectedPlayers = Object.values(lineup).filter(Boolean)
    
    if (selectedPlayers.length !== 11) {
      toast({
        title: "Incomplete Lineup",
        description: "Please select exactly 11 players for your lineup",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('lineups')
        .insert({
          match_id: nextMatch?.id,
          formation: selectedFormation,
          players: selectedPlayers.map(p => p.id),
          submitted_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Lineup Submitted!",
        description: "Your lineup has been successfully submitted",
      })
    } catch (error) {
      console.error('Error submitting lineup:', error)
      toast({
        title: "Error",
        description: "Failed to submit lineup",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getFormationPositions = () => {
    return formations.find(f => f.id === selectedFormation)?.positions || []
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading team data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 pb-8">
      <div className="w-full pt-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/profile" className="flex items-center gap-2 text-green-400 hover:text-green-300 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>
            <h1 className="text-3xl font-bold text-green-100">Submit Lineup</h1>
            <p className="text-gray-400">Select your starting 11 for the upcoming match</p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="mb-2">
              <Clock className="w-3 h-3 mr-1" />
              Deadline: {nextMatch?.match_date ? new Date(nextMatch.match_date).toLocaleDateString() : 'TBD'}
            </Badge>
            <div className="text-sm text-gray-400">
              {Object.values(lineup).filter(Boolean).length}/11 Players Selected
            </div>
          </div>
        </div>

        {/* Next Match Info */}
        {nextMatch && (
          <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30">
            <CardHeader>
              <CardTitle className="text-green-100 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Next Match
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-green-100">Home Team</h3>
                  <p className="text-gray-300">{nextMatch.home_team_name || 'TBD'}</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-green-100">vs</h3>
                  <p className="text-gray-400 text-sm">
                    {nextMatch.match_date ? new Date(nextMatch.match_date).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-green-100">Away Team</h3>
                  <p className="text-gray-300">{nextMatch.away_team_name || 'TBD'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formation Selection */}
        <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-green-100">Select Formation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formations.map((formation) => (
                <button
                  key={formation.id}
                  onClick={() => setSelectedFormation(formation.id)}
                  className={`p-4 rounded-lg border transition-colors ${
                    selectedFormation === formation.id
                      ? "border-green-500 bg-green-900/30"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="text-lg font-bold text-green-100 mb-1">{formation.name}</div>
                  <div className="text-gray-400 text-sm">{formation.positions.join("-")}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lineup Builder */}
        <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-green-100">Lineup Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {getFormationPositions().map((position, index) => (
                <div key={position} className="space-y-3">
                  <Label className="text-green-100 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    {position} - {index === 0 ? 'Goalkeeper' : index <= 4 ? 'Defender' : index <= 7 ? 'Midfielder' : 'Forward'}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {players
                      .filter(player => {
                        if (index === 0) return player.position === 'GK'
                        if (index <= 4) return ['RB', 'CB', 'LB'].includes(player.position)
                        if (index <= 7) return ['RM', 'CM', 'LM', 'CDM', 'CAM'].includes(player.position)
                        return ['RW', 'ST', 'LW', 'CF'].includes(player.position)
                      })
                      .map((player) => (
                        <button
                          key={player.id}
                          onClick={() => handlePlayerSelect(position, lineup[position]?.id === player.id ? null : player)}
                          className={`p-3 rounded-lg border transition-colors text-left ${
                            lineup[position]?.id === player.id
                              ? "border-green-500 bg-green-900/30"
                              : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-green-100">{player.name}</div>
                              <div className="text-gray-400 text-sm">#{player.number} • {player.position}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-yellow-400 font-semibold">{player.rating}</div>
                              <div className="text-gray-400 text-xs">{player.status}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                  {lineup[position] && (
                    <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-100 text-sm">
                        Selected: {lineup[position]?.name} (#{lineup[position]?.number})
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmitLineup}
            disabled={submitting || Object.values(lineup).filter(Boolean).length !== 11}
            className="bg-green-600 hover:bg-green-700 px-8 py-3"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Submit Lineup
              </>
            )}
          </Button>
        </div>

        {/* Validation Messages */}
        {Object.values(lineup).filter(Boolean).length !== 11 && (
          <Card className="bg-gradient-to-r from-orange-900/20 to-gray-900/40 border-orange-800/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <span className="text-orange-100">
                  Please select exactly 11 players for your lineup ({Object.values(lineup).filter(Boolean).length}/11)
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 