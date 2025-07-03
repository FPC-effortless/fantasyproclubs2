"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dumbbell, 
  ArrowLeft, 
  Calendar,
  Clock,
  Target,
  TrendingUp,
  CheckCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function TrainingPage() {
  const [trainingSessions, setTrainingSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrainingSessions()
  }, [])

  const fetchTrainingSessions = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setTrainingSessions(data || [])
    } catch (error) {
      console.error('Error fetching training sessions:', error)
      toast({
        title: "Error",
        description: "Failed to load training sessions",
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
          <p className="text-gray-400">Loading training data...</p>
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
          <h1 className="text-3xl font-bold text-green-100">Training Sessions</h1>
          <p className="text-gray-400">Track your training progress and performance</p>
        </div>

        {/* Training Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
            <CardContent className="p-6 text-center">
              <Dumbbell className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-400">{trainingSessions.length}</div>
              <div className="text-gray-400 text-sm">Total Sessions</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-400">24h</div>
              <div className="text-gray-400 text-sm">This Week</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-900/20 to-gray-900/40 border-purple-800/30">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-400">85%</div>
              <div className="text-gray-400 text-sm">Attendance</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-900/20 to-gray-900/40 border-yellow-800/30">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-yellow-400">+12</div>
              <div className="text-gray-400 text-sm">Rating Points</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Training Sessions */}
        <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-green-100 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Training Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainingSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-100">{session.type}</h3>
                      <p className="text-gray-400 text-sm">{session.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">{session.duration} minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default">Completed</Badge>
                    <div className="text-right">
                      <div className="text-yellow-400 font-semibold">+{session.rating_gain}</div>
                      <div className="text-gray-400 text-xs">Rating Points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Training Schedule */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-green-100">Upcoming Training</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-100">Technical Training</h3>
                    <p className="text-gray-400 text-sm">Focus on passing and shooting accuracy</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">Tomorrow, 10:00 AM</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">90 minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">Scheduled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 