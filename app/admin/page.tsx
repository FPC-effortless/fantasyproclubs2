"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, Trophy, UserCheck } from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalTeams: number
  totalCompetitions: number
  pendingUpgrades: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeams: 0,
    totalCompetitions: 0,
    pendingUpgrades: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClientComponentClient()

      // Fetch stats in parallel
      const [
        { count: usersCount },
        { count: teamsCount },
        { count: competitionsCount },
        { count: upgradesCount }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('teams').select('*', { count: 'exact', head: true }).eq('manager_id', 'not.is.null'),
        supabase.from('competitions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('account_upgrade_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      setStats({
        totalUsers: usersCount || 0,
        totalTeams: teamsCount || 0,
        totalCompetitions: competitionsCount || 0,
        pendingUpgrades: upgradesCount || 0
      })
    }

    fetchStats()
  }, [])

  const statsData = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Total Teams", 
      value: stats.totalTeams,
      icon: Shield,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Active Competitions",
      value: stats.totalCompetitions,
      icon: Trophy,
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: "Pending Upgrades",
      value: stats.pendingUpgrades,
      icon: UserCheck,
      color: "from-red-500 to-red-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      
      {/* Enhanced Header */}
      <div className="relative z-10 bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                ADMIN DASHBOARD
              </h1>
              <p className="text-green-200/80">Monitor and manage the platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-6 py-6 max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-green-100">Dashboard Overview</h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card key={index} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">{stat.title}</CardTitle>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-green-100">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-500/50" />
                </div>
                <p className="text-gray-300">Activity monitoring coming soon...</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-green-100">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-500/50" />
                </div>
                <p className="text-gray-300">Quick actions coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
