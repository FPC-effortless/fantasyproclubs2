"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSupabase } from '@/components/providers/supabase-provider'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
// If you have a chart library, import it here. Otherwise, use a placeholder.
// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function PointsHistoryPage() {
  const { supabase } = useSupabase()
  const [user, setUser] = useState<any>(null)
  const [fantasyTeam, setFantasyTeam] = useState<any>(null)
  const [pointsHistory, setPointsHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserAndTeam = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) {
        setLoading(false)
        return
      }
      // Fetch user's fantasy team
      const { data: team } = await supabase
        .from('fantasy_teams')
        .select('id, name')
        .eq('user_id', user.id)
        .single()
      setFantasyTeam(team)
      if (!team) {
        setLoading(false)
        return
      }
      // Fetch points history (assuming a table fantasy_team_points with columns: team_id, gameweek, points, rank, transfers)
      const { data: history } = await supabase
        .from('fantasy_team_points')
        .select('gameweek, points, rank, transfers')
        .eq('team_id', team.id)
        .order('gameweek', { ascending: true })
      setPointsHistory(history || [])
      setLoading(false)
    }
    fetchUserAndTeam()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 text-white flex items-center justify-center">
        <Skeleton className="w-80 h-40" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <BarChart3 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-300 mb-6">Sign in to view your points history.</p>
          <Button onClick={() => window.openSignInModal?.()} className="bg-green-600 hover:bg-green-700 text-white">Sign In</Button>
        </div>
      </div>
    )
  }

  if (!fantasyTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <BarChart3 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Fantasy Team Found</h2>
          <p className="text-gray-300 mb-6">Create a fantasy team to start tracking your points history.</p>
          <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
            <Link href="/fantasy/team">Create Fantasy Team</Link>
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
          <Link href="/fantasy/team" className="text-white hover:text-green-200 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <BarChart3 className="w-6 h-6 text-green-200" />
          <h1 className="text-2xl font-bold">Points History</h1>
        </div>
      </div>
      <div className="p-4 space-y-6 max-w-3xl mx-auto">
        {/* Chart Section */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-100">
              <BarChart3 className="w-5 h-5 text-green-400" />
              Weekly Points Chart
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* If you have a chart library, render the chart here. Otherwise, show a placeholder. */}
            {/* <ResponsiveContainer width="100%" height={240}>
              <LineChart data={pointsHistory}>
                <XAxis dataKey="gameweek" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="points" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer> */}
            <div className="h-48 flex items-center justify-center text-gray-400">
              {/* Placeholder for chart */}
              Chart coming soon
            </div>
          </CardContent>
        </Card>
        {/* Table Section */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-100">
              <BarChart3 className="w-5 h-5 text-green-400" />
              Weekly Points Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="text-green-300 border-b border-green-900">
                    <th className="py-2 px-3">Gameweek</th>
                    <th className="py-2 px-3">Points</th>
                    <th className="py-2 px-3">Rank</th>
                    <th className="py-2 px-3">Transfers</th>
                  </tr>
                </thead>
                <tbody>
                  {pointsHistory.map((row, i) => (
                    <tr key={i} className="border-b border-green-900/30 hover:bg-green-900/10">
                      <td className="py-2 px-3">{row.gameweek}</td>
                      <td className="py-2 px-3 font-semibold text-green-400">{row.points}</td>
                      <td className="py-2 px-3">{row.rank ?? '-'}</td>
                      <td className="py-2 px-3">{row.transfers ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pointsHistory.length === 0 && (
                <div className="text-center text-gray-400 py-8">No points history found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 