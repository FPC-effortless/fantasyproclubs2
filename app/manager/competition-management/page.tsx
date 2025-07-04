"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Trophy, 
  ArrowLeft, 
  Calendar,
  Users,
  Target,
  Award
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function CompetitionManagementPage() {
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompetitions()
  }, [])

  const fetchCompetitions = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('start_date', { ascending: true })

      if (error) throw error
      setCompetitions(data || [])
    } catch (error) {
      console.error('Error fetching competitions:', error)
      toast({
        title: "Error",
        description: "Failed to load competitions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCompetition = async (competitionId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('competition_participants')
        .insert({
          competition_id: competitionId,
          joined_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Joined Competition!",
        description: "Your team has been registered for the competition",
      })

      fetchCompetitions()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join competition",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading competitions...</p>
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
          <h1 className="text-3xl font-bold text-green-100">Competition Management</h1>
          <p className="text-gray-400">Manage your team&apos;s participation in competitions</p>
        </div>

        {/* Active Competitions */}
        <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-green-100 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Active Competitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {competitions.filter(c => c.status === 'active').map((competition) => (
                <div key={competition.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-100">{competition.name}</h3>
                      <p className="text-gray-400 text-sm">{competition.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">
                            {new Date(competition.start_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">{competition.participants_count || 0} teams</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Competitions */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-green-100 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Available Competitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {competitions.filter(c => c.status === 'upcoming').map((competition) => (
                <div key={competition.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-100">{competition.name}</h3>
                      <p className="text-gray-400 text-sm">{competition.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">
                            Starts {new Date(competition.start_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">Prize: {competition.prize_pool}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">Upcoming</Badge>
                    <Button 
                      onClick={() => handleJoinCompetition(competition.id)}
                      size="sm"
                    >
                      Join Competition
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competition History */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-gray-900/40 border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-green-100">Competition History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {competitions.filter(c => c.status === 'completed').map((competition) => (
                <div key={competition.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-100">{competition.name}</h3>
                      <p className="text-gray-400 text-sm">Final Position: 3rd</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">
                            {new Date(competition.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-400 text-sm">Points: 45</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 