"use client"

import { useState, useEffect, useCallback } from "react"
import type { Database } from "@/types/database"
import { useRouter } from 'next/navigation'
import {
  Users,
  Shield,
  Trophy,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  UserPlus,
  FileText,
  Settings,
  LogOut,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

interface DashboardStats {
  totalUsers: number
  totalTeams: number
  totalCompetitions: number
  totalMatches: number
  pendingUpgrades: number
  activeCompetitions: number
  monthlyGrowth: number
  userGrowthData: Array<{
    month: string
    users: number
    teams: number
  }>
  recentActivity: Array<{
    id: string
    type: "user_registration" | "team_creation" | "match_result" | "upgrade_request" | "competition_created"
    description: string
    timestamp: string
    user?: string
  }>
  pendingActions: Array<{
    id: string
    type: "upgrade_request" | "team_verification" | "match_dispute" | "content_approval"
    title: string
    description: string
    priority: "high" | "medium" | "low"
    timestamp: string
  }>
}

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeams: 0,
    totalCompetitions: 0,
    totalMatches: 0,
    pendingUpgrades: 0,
    activeCompetitions: 0,
    monthlyGrowth: 0,
    userGrowthData: [],
    recentActivity: [],
    pendingActions: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [supabase] = useState(() => createClient())
  const router = useRouter()

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("🚀 [AdminDashboard] Initializing...")

      const [
        totalUsersResult,
        totalTeamsResult,
        totalCompetitionsResult,
        totalMatchesResult,
        pendingUpgradesResult,
        activeCompetitionsResult,
        userGrowthResult,
        recentActivityResult,
        pendingActionsResult
      ] = await Promise.all([
        fetchTotalUsers(),
        fetchTotalTeams(),
        fetchTotalCompetitions(),
        fetchTotalMatches(),
        fetchPendingUpgrades(),
        fetchActiveCompetitions(),
        fetchUserGrowthData(),
        fetchRecentActivity(),
        fetchPendingActions()
      ])

      const newDashboardData = {
        totalUsers: totalUsersResult.count,
        totalTeams: totalTeamsResult.count,
        totalCompetitions: totalCompetitionsResult.count,
        totalMatches: totalMatchesResult.count,
        pendingUpgrades: pendingUpgradesResult.count,
        activeCompetitions: activeCompetitionsResult.count,
        monthlyGrowth: totalUsersResult.monthlyGrowth,
        userGrowthData: userGrowthResult,
        recentActivity: recentActivityResult,
        pendingActions: pendingActionsResult,
      }

      console.log("✅ [AdminDashboard] Data loaded: users=" + newDashboardData.totalUsers + ", teams=" + newDashboardData.totalTeams + ", competitions=" + newDashboardData.totalCompetitions)
      setDashboardData(newDashboardData)

    } catch (error: any) {
      console.error('💥 [AdminDashboard] Loading failed:', error)
      setError(error.message || 'Failed to load dashboard data')
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      console.log("🎯 [AdminDashboard] Loading complete")
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      })
      
      // Redirect to homescreen
      router.push('/')
    } catch (error: any) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchTotalUsers = async () => {
    const { count, error } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    // Calculate monthly growth
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    const { count: lastMonthCount, error: lastMonthError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', lastMonth.toISOString())

    if (lastMonthError) throw lastMonthError

    const currentMonthUsers = (count || 0) - (lastMonthCount || 0)
    const monthlyGrowth = lastMonthCount ? (currentMonthUsers / lastMonthCount) * 100 : 0

    return { count: count || 0, monthlyGrowth: Math.round(monthlyGrowth * 10) / 10 }
  }

  const fetchTotalTeams = async () => {
    const { count, error } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return { count: count || 0 }
  }

  const fetchTotalCompetitions = async () => {
    const { count, error } = await supabase
      .from('competitions')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return { count: count || 0 }
  }

  const fetchTotalMatches = async () => {
    const { count, error } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return { count: count || 0 }
  }

  const fetchPendingUpgrades = async () => {
    const { count, error } = await supabase
      .from('account_upgrade_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (error) throw error
    return { count: count || 0 }
  }

  const fetchActiveCompetitions = async () => {
    const { count, error } = await supabase
      .from('competitions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (error) throw error
    return { count: count || 0 }
  }

  const fetchUserGrowthData = async () => {
    const months = []
    const now = new Date()
    
    // Get last 6 months of data
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const [usersResult, teamsResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', nextMonth.toISOString()),
        supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', nextMonth.toISOString())
      ])

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        users: usersResult.count || 0,
        teams: teamsResult.count || 0,
      })
    }

    return months
  }

  const fetchRecentActivity = async () => {
    const activities: DashboardStats['recentActivity'] = [];
    const limit = 5; // Number of items per activity type

    try {
      // Fetch recent user registrations
      const { data: recentUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, username, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (usersError) {
        console.error('Error fetching recent users:', usersError);
        toast({ title: "Error", description: "Failed to load recent user activity.", variant: "destructive" });
      } else if (recentUsers) {
        activities.push(...recentUsers.map(u => ({
          id: u.id,
          type: 'user_registration' as const,
          description: `New user @${u.username || 'Unknown'} signed up`,
          timestamp: u.created_at,
          user: u.username || undefined,
        })));
      }

      // Fetch recent team creations
      const { data: recentTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, created_at, manager_id, managers:user_profiles!manager_id(username)')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (teamsError) {
        console.error('Error fetching recent teams:', teamsError);
        toast({ title: "Error", description: "Failed to load recent team creation activity.", variant: "destructive" });
      } else if (recentTeams) {
        activities.push(...recentTeams.map(t => ({
          id: t.id,
          type: 'team_creation' as const,
          description: `Team @${t.name} created by ${t.managers?.[0]?.username || 'N/A'}`,
          timestamp: t.created_at,
          user: t.name, 
        })));
      }

      // Fetch recent competition creations
      const { data: recentCompetitions, error: competitionsError } = await supabase
        .from('competitions')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (competitionsError) {
        console.error('Error fetching recent competitions:', competitionsError);
        toast({ title: "Error", description: "Failed to load recent competition creation activity.", variant: "destructive" });
      } else if (recentCompetitions) {
        activities.push(...recentCompetitions.map(c => ({
          id: c.id,
          type: 'competition_created' as const,
          description: `New competition '${c.name}' created`,
          timestamp: c.created_at,
        })));
      }
      
      // Sort all activities by timestamp and take the most recent ones overall
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 7); // Show a total of 7 recent activities overall

    } catch (error: any) {
      console.error('Error fetching recent activity:', error);
      toast({ title: "Error", description: "Failed to load overall recent activity.", variant: "destructive" });
      return []; // Return empty array on error
    }
  }

  const fetchPendingActions = async (): Promise<DashboardStats['pendingActions']> => {
    const localActions: DashboardStats['pendingActions'] = [];
    try {
      const { data: upgradeRequests, error: upgradesError } = await supabase
        .from('account_upgrade_requests')
        .select('id, user_id, requested_role, status, created_at, user_profiles!account_upgrade_requests_user_id_fkey(username)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (upgradesError) {
        console.error('Error fetching pending upgrade requests:', JSON.stringify(upgradesError, null, 2));
        toast({ title: "Error", description: "Failed to load pending upgrade requests.", variant: "destructive" });
      } else if (upgradeRequests) {
        localActions.push(...upgradeRequests.map(req => ({
          id: req.id,
          type: 'upgrade_request' as const,
          title: `Upgrade: @${req.user_profiles?.[0]?.username || req.user_id} to ${req.requested_role}`,
          description: `User @${req.user_profiles?.[0]?.username || req.user_id} requests ${req.requested_role} role.`,
          priority: 'high' as const,
          timestamp: req.created_at,
        })));
      }

      // TODO: Implement fetching for other pending action types when their tables/logic exist
      // e.g., team_verification, match_dispute, content_approval
      // These would also push to localActions

      return localActions;
    } catch (error) {
      console.error('An unexpected error occurred in fetchPendingActions:', JSON.stringify(error, null, 2));
      toast({ title: "Error", description: "An unexpected error occurred while fetching pending actions.", variant: "destructive" });
      return []; // Return empty array on error
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registration":
        return <UserPlus className="h-4 w-4 text-[#00ff87]" />
      case "team_creation":
        return <Shield className="h-4 w-4 text-blue-400" />
      case "upgrade_request":
        return <TrendingUp className="h-4 w-4 text-yellow-400" />
      case "match_result":
        return <Trophy className="h-4 w-4 text-purple-400" />
      case "competition_created":
        return <Calendar className="h-4 w-4 text-[#00ff87]" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case "upgrade_request":
        return <TrendingUp className="h-4 w-4" />
      case "team_verification":
        return <CheckCircle className="h-4 w-4" />
      case "match_dispute":
        return <AlertCircle className="h-4 w-4" />
      case "content_approval":
        return <FileText className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 bg-black text-white">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00ff87]"></div>
        </div>
        <p className="text-center text-gray-400">Loading dashboard data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 space-y-8 bg-black text-white">
        <Card className="bg-red-900/20 border-red-500/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <h3 className="text-lg font-semibold text-red-400">Error Loading Dashboard</h3>
            </div>
            <p className="text-red-300 mt-2">{error}</p>
            <Button 
              onClick={fetchDashboardData}
              className="mt-4 bg-[#00ff87] text-black hover:bg-[#00ff87]/90"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of your Fantasy Pro Clubs platform</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="border-[#00ff87] text-[#00ff87] hover:bg-[#00ff87]/10"
            onClick={fetchDashboardData}
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            className="border-[#00ff87] text-[#00ff87] hover:bg-[#00ff87]/10"
            onClick={() => router.push('/admin/settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button 
            variant="outline" 
            className="border-red-500 text-red-500 hover:bg-red-500/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
            <Users className="h-4 w-4 text-[#00ff87]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00ff87]">{dashboardData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-gray-500">+{dashboardData.monthlyGrowth}% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Teams</CardTitle>
            <Shield className="h-4 w-4 text-[#00ff87]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.totalTeams}</div>
            <p className="text-xs text-gray-500">Active teams registered</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Competitions</CardTitle>
            <Trophy className="h-4 w-4 text-[#00ff87]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.totalCompetitions}</div>
            <p className="text-xs text-gray-500">{dashboardData.activeCompetitions} currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Matches</CardTitle>
            <Calendar className="h-4 w-4 text-[#00ff87]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardData.totalMatches}</div>
            <p className="text-xs text-gray-500">Matches played to date</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Growth Chart */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Platform Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#00ff87"
                    strokeWidth={3}
                    dot={{ fill: "#00ff87" }}
                    name="Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="teams"
                    stroke="#60A5FA"
                    strokeWidth={3}
                    dot={{ fill: "#60A5FA" }}
                    name="Teams"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-[#00ff87]" />
              <span className="text-white">Pending Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.pendingActions.map((action) => (
                <div key={action.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/50">
                  <div className="mt-0.5">{getActionIcon(action.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-white truncate">{action.title}</p>
                      <Badge className={getPriorityColor(action.priority)} variant="outline">
                        {action.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{action.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(action.timestamp)}</p>
                  </div>
                </div>
              ))}
              <Button 
                variant="ghost" 
                className="w-full text-[#00ff87] hover:bg-[#00ff87]/10" 
                size="sm"
                onClick={() => window.location.href = '/admin/pending-actions'}
              >
                View All Actions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-[#00ff87]" />
            <span className="text-white">Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">Activity</TableHead>
                <TableHead className="text-gray-400">User</TableHead>
                <TableHead className="text-gray-400">Time</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.recentActivity.map((activity) => (
                <TableRow key={activity.id} className="border-gray-800">
                  <TableCell className="flex items-center space-x-3">
                    {getActivityIcon(activity.type)}
                    <span className="text-white">{activity.description}</span>
                  </TableCell>
                  <TableCell className="text-gray-300">{activity.user || "System"}</TableCell>
                  <TableCell className="text-gray-400">{formatTimeAgo(activity.timestamp)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-[#00ff87] hover:bg-[#00ff87]/10">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
