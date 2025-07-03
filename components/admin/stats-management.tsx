"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Trophy,
  Calendar,
  TrendingUp,
  BarChart2,
  Activity,
  Shield,
  Goal,
  Star,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import {
  LineChart,
  Line,
  BarChart,
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

interface StatsData {
  userStats: {
    totalUsers: number
    activeUsers: number
    newUsersThisMonth: number
    userTypes: {
      admin: number
      manager: number
      player: number
      fan: number
    }
    platformDistribution: {
      xbox: number
      playstation: number
      pc: number
    }
  }
  teamStats: {
    totalTeams: number
    activeTeams: number
    averageTeamSize: number
    teamsCreatedThisMonth: number
    teamPerformance: Array<{
      month: string
      wins: number
      draws: number
      losses: number
    }>
  }
  matchStats: {
    totalMatches: number
    matchesThisMonth: number
    averageGoalsPerMatch: number
    matchCompletion: number
    matchesByDay: Array<{
      day: string
      matches: number
    }>
  }
  competitionStats: {
    activeCompetitions: number
    totalCompetitions: number
    participationRate: number
    competitionTypes: {
      league: number
      tournament: number
      friendly: number
    }
  }
}

const COLORS = ['#00ff87', '#ff4d4d', '#ffd700', '#00bcd4']

export function StatsManagement() {
  const [stats, setStats] = useState<StatsData>({
    userStats: {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
      userTypes: { admin: 0, manager: 0, player: 0, fan: 0 },
      platformDistribution: { xbox: 0, playstation: 0, pc: 0 }
    },
    teamStats: {
      totalTeams: 0,
      activeTeams: 0,
      averageTeamSize: 0,
      teamsCreatedThisMonth: 0,
      teamPerformance: []
    },
    matchStats: {
      totalMatches: 0,
      matchesThisMonth: 0,
      averageGoalsPerMatch: 0,
      matchCompletion: 0,
      matchesByDay: []
    },
    competitionStats: {
      activeCompetitions: 0,
      totalCompetitions: 0,
      participationRate: 0,
      competitionTypes: { league: 0, tournament: 0, friendly: 0 }
    }
  })
  const [timeRange, setTimeRange] = useState("month")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  async function fetchStats() {
    const supabase = createClient()
    setIsLoading(true)

    try {
      // Fetch user statistics
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*')

      if (userError) throw userError

      // Fetch team statistics
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')

      if (teamError) throw teamError

      // Fetch match statistics
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')

      if (matchError) throw matchError

      // Fetch competition statistics
      const { data: competitionData, error: competitionError } = await supabase
        .from('competitions')
        .select('*')

      if (competitionError) throw competitionError

      // Process and set statistics
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      setStats({
        userStats: {
          totalUsers: userData.length,
          activeUsers: userData.filter(u => new Date(u.last_login) > monthStart).length,
          newUsersThisMonth: userData.filter(u => new Date(u.created_at) > monthStart).length,
          userTypes: {
            admin: userData.filter(u => u.user_type === 'admin').length,
            manager: userData.filter(u => u.user_type === 'manager').length,
            player: userData.filter(u => u.user_type === 'player').length,
            fan: userData.filter(u => u.user_type === 'fan').length
          },
          platformDistribution: {
            xbox: userData.filter(u => u.preferred_platform === 'xbox').length,
            playstation: userData.filter(u => u.preferred_platform === 'playstation').length,
            pc: userData.filter(u => u.preferred_platform === 'pc').length
          }
        },
        teamStats: {
          totalTeams: teamData.length,
          activeTeams: teamData.filter(t => t.status === 'active').length,
          averageTeamSize: teamData.reduce((acc, team) => acc + (team.player_count || 0), 0) / teamData.length,
          teamsCreatedThisMonth: teamData.filter(t => new Date(t.created_at) > monthStart).length,
          teamPerformance: processTeamPerformance(teamData)
        },
        matchStats: {
          totalMatches: matchData.length,
          matchesThisMonth: matchData.filter(m => new Date(m.date) > monthStart).length,
          averageGoalsPerMatch: matchData.reduce((acc, match) => acc + match.home_score + match.away_score, 0) / matchData.length,
          matchCompletion: (matchData.filter(m => m.status === 'completed').length / matchData.length) * 100,
          matchesByDay: processMatchesByDay(matchData)
        },
        competitionStats: {
          activeCompetitions: competitionData.filter(c => c.status === 'active').length,
          totalCompetitions: competitionData.length,
          participationRate: (competitionData.reduce((acc, comp) => acc + (comp.participant_count || 0), 0) / teamData.length) * 100,
          competitionTypes: {
            league: competitionData.filter(c => c.type === 'league').length,
            tournament: competitionData.filter(c => c.type === 'tournament').length,
            friendly: competitionData.filter(c => c.type === 'friendly').length
          }
        }
      })
    } catch (error: any) {
      console.error('Error fetching statistics:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load statistics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function processTeamPerformance(teamData: any[]) {
    // Process team performance data for the chart
    // This is a simplified example
    return [
      { month: 'Jan', wins: 10, draws: 5, losses: 3 },
      { month: 'Feb', wins: 12, draws: 4, losses: 2 },
      { month: 'Mar', wins: 8, draws: 6, losses: 4 },
      { month: 'Apr', wins: 15, draws: 3, losses: 1 },
      { month: 'May', wins: 11, draws: 5, losses: 2 },
      { month: 'Jun', wins: 13, draws: 4, losses: 3 },
    ]
  }

  function processMatchesByDay(matchData: any[]) {
    // Process match data by day for the chart
    // This is a simplified example
    return [
      { day: 'Mon', matches: 12 },
      { day: 'Tue', matches: 15 },
      { day: 'Wed', matches: 18 },
      { day: 'Thu', matches: 14 },
      { day: 'Fri', matches: 20 },
      { day: 'Sat', matches: 25 },
      { day: 'Sun', matches: 22 },
    ]
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => fetchStats()}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh Stats
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.userStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.userStats.newUsersThisMonth} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.teamStats.activeTeams}</div>
                <p className="text-xs text-muted-foreground">
                  of {stats.teamStats.totalTeams} total teams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Match Completion</CardTitle>
                <Goal className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.matchStats.matchCompletion.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.matchStats.matchesThisMonth} matches this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Competitions</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.competitionStats.activeCompetitions}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.competitionStats.participationRate.toFixed(1)}% participation
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Admin', value: stats.userStats.userTypes.admin },
                          { name: 'Manager', value: stats.userStats.userTypes.manager },
                          { name: 'Player', value: stats.userStats.userTypes.player },
                          { name: 'Fan', value: stats.userStats.userTypes.fan },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { platform: 'Xbox', users: stats.userStats.platformDistribution.xbox },
                      { platform: 'PlayStation', users: stats.userStats.platformDistribution.playstation },
                      { platform: 'PC', users: stats.userStats.platformDistribution.pc },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="platform" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#00ff87" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.teamStats.teamPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="wins" fill="#00ff87" name="Wins" />
                      <Bar dataKey="draws" fill="#ffd700" name="Draws" />
                      <Bar dataKey="losses" fill="#ff4d4d" name="Losses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Team Size</p>
                    <p className="text-2xl font-bold">{stats.teamStats.averageTeamSize.toFixed(1)} players</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">New Teams This Month</p>
                    <p className="text-2xl font-bold">{stats.teamStats.teamsCreatedThisMonth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Rate</p>
                    <p className="text-2xl font-bold">
                      {((stats.teamStats.activeTeams / stats.teamStats.totalTeams) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matches">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Matches by Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.matchStats.matchesByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="matches" fill="#00ff87" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Match Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Goals per Match</p>
                    <p className="text-2xl font-bold">{stats.matchStats.averageGoalsPerMatch.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Matches This Month</p>
                    <p className="text-2xl font-bold">{stats.matchStats.matchesThisMonth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">{stats.matchStats.matchCompletion.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitions">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Competition Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'League', value: stats.competitionStats.competitionTypes.league },
                          { name: 'Tournament', value: stats.competitionStats.competitionTypes.tournament },
                          { name: 'Friendly', value: stats.competitionStats.competitionTypes.friendly },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competition Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Competitions</p>
                    <p className="text-2xl font-bold">{stats.competitionStats.activeCompetitions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Competitions</p>
                    <p className="text-2xl font-bold">{stats.competitionStats.totalCompetitions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Participation Rate</p>
                    <p className="text-2xl font-bold">{stats.competitionStats.participationRate.toFixed(1)}%</p>
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
