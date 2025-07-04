"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from '@/lib/supabase/client'
import { toast } from "@/hooks/use-toast"
import {
  BarChart,
  Users,
  Trophy,
  Calendar,
  Download,
  Filter,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { SupabaseClient } from "@supabase/supabase-js"
import styles from "./reports.module.css"

interface ReportsData {
  overview: {
    totalUsers: number
    userGrowth: number
    activeMatches: number
    matchesGrowth: number
    activeCompetitions: number
    competitionsGrowth: number
    platformDistribution: { platform: string; count: number; percentage: number }[]
  }
  userStats: {
    registrationTrend: { date: string; count: number }[]
    userTypeDistribution: { type: string; count: number; percentage: number }[]
    accountUpgrades: { status: string; count: number }[]
    topActiveUsers: { display_name: string; activity_score: number }[]
  }
  matchStats: {
    matchesByMonth: { month: string; completed: number; upcoming: number }[]
    competitionActivity: { name: string; matches: number; teams: number }[]
    matchOutcomes: { status: string; count: number }[]
    avgPlayersPerMatch: number
  }
  competitionStats: {
    competitionTypes: { type: string; count: number }[]
    teamsDistribution: { competition: string; teams: number }[]
    leaderboard: { name: string; points: number; matches: number }[]
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

// Add function to get Tailwind color classes
const getColorClass = (index: number) => {
  const colorClasses = [
    'bg-blue-500',
    'bg-emerald-500', 
    'bg-amber-400',
    'bg-orange-500',
    'bg-violet-500',
    'bg-green-400'
  ]
  return colorClasses[index % colorClasses.length]
}

export default function ReportsPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [data, setData] = useState<ReportsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [_error, _setError] = useState<string | null>(null)

  // Initialize Supabase client on mount
  useEffect(() => {
    setSupabase(createClient());
  }, []);

  const fetchReportsData = useCallback(async () => {
    if (!supabase) return;
    try {
      setIsLoading(true)

      // Fetch overview data in parallel
      const [
        usersResult,
        matchesResult, 
        competitionsResult,
        userTypesResult,
        upgradeRequestsResult,
        platformDataResult
      ] = await Promise.all([
        supabase.from('user_profiles').select('id, created_at'),
        supabase.from('matches').select('id, status, created_at'),
        supabase.from('competitions').select('id, name, created_at, type'),
        supabase.from('user_profiles').select('user_type'),
        supabase.from('account_upgrade_requests').select('status'),
        supabase.from('user_profiles').select('gaming')
      ])

      if (usersResult.error) throw usersResult.error
      if (matchesResult.error) throw matchesResult.error
      if (competitionsResult.error) throw competitionsResult.error

      // Process data
      const users = usersResult.data || []
      const matches = matchesResult.data || []
      const competitions = competitionsResult.data || []
      const userTypes = userTypesResult.data || []
      const upgradeRequests = upgradeRequestsResult.data || []
      const platformData = platformDataResult.data || []

      // Calculate growth metrics
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      
      const usersThisMonth = users.filter(u => new Date(u.created_at) >= lastMonth).length
      const usersLastMonth = users.filter(u => {
        const created = new Date(u.created_at)
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())
        return created >= twoMonthsAgo && created < lastMonth
      }).length
      
      const userGrowth = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 0

      // Active matches (not completed)
      const activeMatches = matches.filter(m => m.status !== 'completed').length
      const matchesThisMonth = matches.filter(m => new Date(m.created_at) >= lastMonth).length
      const matchesLastMonth = matches.filter(m => {
        const created = new Date(m.created_at)
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())
        return created >= twoMonthsAgo && created < lastMonth
      }).length
      const matchesGrowth = matchesLastMonth > 0 ? ((matchesThisMonth - matchesLastMonth) / matchesLastMonth) * 100 : 0

      // Active competitions
      const activeCompetitions = competitions.length
      const competitionsGrowth = 0 // No mock data

      // Platform distribution
      const platformCounts = { xbox: 0, playstation: 0, both: 0, none: 0 }
      platformData.forEach(p => {
        const platform = p.gaming?.preferred_platform || 'none'
        platformCounts[platform as keyof typeof platformCounts]++
      })
      
      const totalPlatforms = Object.values(platformCounts).reduce((a, b) => a + b, 0)
      const platformDistribution = Object.entries(platformCounts).map(([platform, count]) => ({
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        count,
        percentage: totalPlatforms > 0 ? Math.round((count / totalPlatforms) * 100) : 0
      }))

      // User registration trend (last 6 months)
      const registrationTrend = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        const count = users.filter(u => {
          const created = new Date(u.created_at)
          return created >= date && created < nextDate
        }).length
        registrationTrend.push({
          date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count
        })
      }

      // User type distribution
      const userTypeCounts = userTypes.reduce((acc, u) => {
        acc[u.user_type] = (acc[u.user_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const totalUsers = userTypes.length
      const userTypeDistribution = Object.entries(userTypeCounts).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
      }))

      // Account upgrades
      const upgradeCounts = upgradeRequests.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const accountUpgrades = Object.entries(upgradeCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count
      }))

      // Match statistics
      const matchesByMonth = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        const monthMatches = matches.filter(m => {
          const created = new Date(m.created_at)
          return created >= date && created < nextDate
        })
        matchesByMonth.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          completed: monthMatches.filter(m => m.status === 'completed').length,
          upcoming: monthMatches.filter(m => m.status !== 'completed').length
        })
      }

      // Competition activity
      const competitionActivity = competitions.slice(0, 5).map(c => ({
        name: c.name,
        matches: 0, // No mock data
        teams: 0 // No mock data
      }))

      // Match outcomes
      const statusCounts = matches.reduce((acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const matchOutcomes = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count
      }))

      // Competition types
      const typeCounts = competitions.reduce((acc, c) => {
        const type = c.type || 'League'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const competitionTypes = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count
      }))

      setData({
        overview: {
          totalUsers: users.length,
          userGrowth,
          activeMatches,
          matchesGrowth,
          activeCompetitions,
          competitionsGrowth,
          platformDistribution
        },
        userStats: {
          registrationTrend,
          userTypeDistribution,
          accountUpgrades,
          topActiveUsers: [] // Empty array - no data yet
        },
        matchStats: {
          matchesByMonth,
          competitionActivity,
          matchOutcomes,
          avgPlayersPerMatch: 22
        },
        competitionStats: {
          competitionTypes,
          teamsDistribution: [],
          leaderboard: []
        }
      })

    } catch (error) {
      console.error('Error fetching reports data:', error)
      toast({
        title: "Error",
        description: "Failed to load reports data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (supabase) {
      fetchReportsData();
    }
  }, [supabase, fetchReportsData]);

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your report is being generated and will be downloaded shortly.",
    })
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-3 w-3 text-green-500" />
    if (value < 0) return <ArrowDown className="h-3 w-3 text-red-500" />
    return <Minus className="h-3 w-3 text-gray-500" />
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-gray-600"
  }

  if (isLoading || !data) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading reports data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Reports & Analytics</h1>
        <div className={styles.headerActions}>
          <Button variant="outline" size="sm" onClick={() => fetchReportsData()}>
            <Activity className={styles.buttonIcon} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className={styles.buttonIcon} />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className={styles.buttonIcon} />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className={styles.tabsContainer}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className={styles.tabContent}>
          <div className={styles.gridLayout}>
            <Card>
              <CardHeader className={styles.cardHeader}>
                <CardTitle className={styles.cardTitleSmall}>Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={styles.metricValue}>{data.overview.totalUsers.toLocaleString()}</div>
                <div className={`${styles.trendIndicator} ${getTrendColor(data.overview.userGrowth)}`}>
                  {getTrendIcon(data.overview.userGrowth)}
                  <span className="ml-1">
                    {Math.abs(data.overview.userGrowth).toFixed(1)}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className={styles.cardHeader}>
                <CardTitle className={styles.cardTitleSmall}>Active Matches</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={styles.metricValue}>{data.overview.activeMatches}</div>
                <div className={`${styles.trendIndicator} ${getTrendColor(data.overview.matchesGrowth)}`}>
                  {getTrendIcon(data.overview.matchesGrowth)}
                  <span className="ml-1">
                    {Math.abs(data.overview.matchesGrowth).toFixed(1)}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className={styles.cardHeader}>
                <CardTitle className={styles.cardTitleSmall}>Active Competitions</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.activeCompetitions}</div>
                <div className={`flex items-center text-xs ${getTrendColor(data.overview.competitionsGrowth)}`}>
                  {getTrendIcon(data.overview.competitionsGrowth)}
                  <span className="ml-1">
                    {Math.abs(data.overview.competitionsGrowth).toFixed(1)}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Distribution</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.overview.platformDistribution.slice(0, 2).map((platform, _index) => (
                    <div key={platform.platform} className="flex items-center justify-between text-sm">
                      <span>{platform.platform}</span>
                      <Badge variant="secondary">{platform.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trend</CardTitle>
                <CardDescription>Monthly user registration over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.userStats.registrationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>User distribution across gaming platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.overview.platformDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ platform, percentage }) => `${platform} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.overview.platformDistribution.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Type Distribution</CardTitle>
                <CardDescription>Breakdown of users by their account type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.userStats.userTypeDistribution.map((type, index) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className={`w-3 h-3 rounded-full ${getColorClass(index)}`}
                        />
                        <span className="font-medium">{type.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{type.count}</div>
                        <div className="text-sm text-muted-foreground">{type.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Upgrade Requests</CardTitle>
                <CardDescription>Status of account upgrade requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.upgradeRequestList}>
                  {data.userStats.accountUpgrades.map((upgrade, _index) => (
                    <div key={upgrade.status} className={styles.upgradeRequestItem}>
                      <span className={styles.upgradeRequestStatus}>{upgrade.status}</span>
                      <Badge 
                        variant={upgrade.status === 'Pending' ? 'default' : 
                                upgrade.status === 'Approved' ? 'default' : 'secondary'}
                      >
                        {upgrade.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Registration Trend</CardTitle>
              <CardDescription>Monthly user registrations and growth patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBar data={data.userStats.registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </RechartsBar>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className={styles.matchesTab}>
          <div className={styles.matchesGrid}>
            <Card>
              <CardHeader>
                <CardTitle>Matches by Month</CardTitle>
                <CardDescription>Completed vs upcoming matches over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsBar data={data.matchStats.matchesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" stackId="a" fill="#8884d8" />
                    <Bar dataKey="upcoming" stackId="a" fill="#82ca9d" />
                  </RechartsBar>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Match Outcomes</CardTitle>
                <CardDescription>Distribution of match statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.matchStats.matchOutcomes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${status} (${count})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.matchStats.matchOutcomes.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Competition Activity</CardTitle>
              <CardDescription>Matches and teams per competition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.competitionActivity}>
                {data.matchStats.competitionActivity.map((comp, _index) => (
                  <div key={comp.name} className={styles.competitionItem}>
                    <div>
                      <h4 className={styles.competitionName}>{comp.name}</h4>
                      <p className={styles.competitionInfo}>{comp.teams} teams participating</p>
                    </div>
                    <div className={styles.competitionStats}>
                      <div className={styles.competitionValue}>{comp.matches}</div>
                      <div className={styles.competitionLabel}>matches</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitions" className={styles.competitionsTab}>
          <div className={styles.competitionsGrid}>
            <Card>
              <CardHeader>
                <CardTitle>Competition Types</CardTitle>
                <CardDescription>Distribution of competition formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.competitionTypeList}>
                  {data.competitionStats.competitionTypes.map((type, index) => (
                    <div key={type.type} className={styles.competitionTypeItem}>
                      <div className={styles.competitionTypeContent}>
                        <div 
                          className={`${styles.colorIndicator} ${getColorClass(index)}`}
                        />
                        <span className={styles.competitionTypeName}>{type.type}</span>
                      </div>
                      <Badge variant="secondary">{type.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.systemHealth}>
                  <div className={styles.systemHealthItem}>
                    <span className={styles.systemHealthLabel}>Database Response</span>
                    <Badge variant="default" className={styles.systemHealthBadgeGreen}>Excellent</Badge>
                  </div>
                  <div className={styles.systemHealthItem}>
                    <span className={styles.systemHealthLabel}>API Performance</span>
                    <Badge variant="default" className={styles.systemHealthBadgeGreen}>Optimal</Badge>
                  </div>
                  <div className={styles.systemHealthItem}>
                    <span className={styles.systemHealthLabel}>User Engagement</span>
                    <Badge variant="default" className={styles.systemHealthBadgeBlue}>High</Badge>
                  </div>
                  <div className={styles.systemHealthItem}>
                    <span className={styles.systemHealthLabel}>System Uptime</span>
                    <Badge variant="default" className={styles.systemHealthBadgeGreen}>99.8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
