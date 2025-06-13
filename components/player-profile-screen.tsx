"use client"

import { useState, useEffect } from "react"
import { User, Mail, Calendar, Target, Activity, Users, Edit, Star, Shield, Plus, Gamepad2, Trophy, TrendingUp, Settings, ChevronRight, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { PlatformBadge } from "@/components/gaming-platform/platform-badge"
import { PlatformSelector } from "@/components/gaming-platform/platform-selector"
import { toast } from "@/components/ui/use-toast"
import { LogoutButton } from "@/components/auth/logout-button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface PlayerProfileData {
  id: string
  username: string
  fullName: string
  email: string
  avatar?: string
  joinedDate: string
  userType: "player" | "manager"
  xbox_gamertag?: string
  psn_id?: string
  preferred_platform?: "xbox" | "playstation" | "both"
  experience_level?: "beginner" | "intermediate" | "advanced" | "professional"
  position: string
  jerseyNumber: number
  currentTeam: {
    id: string
    name: string
    shortName: string
    logoUrl?: string
    role: "player" | "manager" | "captain"
    joinedDate: string
  }
  currentSeasonStats: {
    matchesPlayed: number
    goals: number
    assists: number
    cleanSheets: number
    yellowCards: number
    redCards: number
    minutesPlayed: number
    matchRating: number
  }
  careerStats: {
    totalMatches: number
    totalGoals: number
    totalAssists: number
    totalCleanSheets: number
    seasonsPlayed: number
    bestRating: number
  }
  fantasyStats: {
    totalPoints: number
    currentPrice: number
    selectedByPercent: number
    gameweekPoints: number
  }
  performanceData: Array<{
    gameweek: number
    goals: number
    assists: number
    rating: number
    points: number
  }>
  recentMatches: Array<{
    id: string
    date: string
    opponent: string
    result: string
    goals: number
    assists: number
    rating: number
    minutesPlayed: number
  }>
  managedTeams?: Array<{
    id: string
    name: string
    role: string
    since: string
  }>
}

const mockPlayerData: PlayerProfileData = {
  id: "player-123",
  username: "alexj",
  fullName: "Alex Johnson",
  email: "alex.johnson@example.com",
  avatar: "/avatars/alex.jpg",
  joinedDate: "2023-03-15",
  userType: "player",
  xbox_gamertag: "AlexJ123",
  psn_id: "AlexJ_PSN",
  preferred_platform: "both",
  experience_level: "advanced",
  position: "ST",
  jerseyNumber: 9,
  currentTeam: {
    id: "team-1",
    name: "FC United",
    shortName: "FCU",
    role: "player",
    joinedDate: "2023-06-01",
  },
  currentSeasonStats: {
    matchesPlayed: 24,
    goals: 18,
    assists: 7,
    cleanSheets: 0,
    yellowCards: 3,
    redCards: 0,
    minutesPlayed: 2160,
    matchRating: 7.8,
  },
  careerStats: {
    totalMatches: 89,
    totalGoals: 67,
    totalAssists: 23,
    totalCleanSheets: 0,
    seasonsPlayed: 3,
    bestRating: 9.2,
  },
  fantasyStats: {
    totalPoints: 156,
    currentPrice: 8.5,
    selectedByPercent: 23.4,
    gameweekPoints: 12,
  },
  performanceData: [
    { gameweek: 1, goals: 1, assists: 0, rating: 7.5, points: 8 },
    { gameweek: 2, goals: 2, assists: 1, rating: 8.2, points: 15 },
    { gameweek: 3, goals: 0, assists: 1, rating: 6.8, points: 4 },
    { gameweek: 4, goals: 1, assists: 0, rating: 7.1, points: 6 },
    { gameweek: 5, goals: 3, assists: 1, rating: 9.1, points: 18 },
    { gameweek: 6, goals: 1, assists: 2, rating: 8.5, points: 12 },
  ],
  recentMatches: [
    {
      id: "1",
      date: "2024-01-15",
      opponent: "Liverpool Blues",
      result: "W 3-1",
      goals: 2,
      assists: 0,
      rating: 8.5,
      minutesPlayed: 90,
    },
    {
      id: "2",
      date: "2024-01-08",
      opponent: "Chelsea Whites",
      result: "D 1-1",
      goals: 1,
      assists: 0,
      rating: 7.2,
      minutesPlayed: 85,
    },
    {
      id: "3",
      date: "2024-01-01",
      opponent: "Arsenal Gunners",
      result: "L 0-2",
      goals: 0,
      assists: 0,
      rating: 6.1,
      minutesPlayed: 90,
    },
  ],
  managedTeams: [
    {
      id: "team-1",
      name: "Manchester Reds",
      role: "Player-Manager",
      since: "2023-06-01",
    },
  ],
}

// Add enhanced chart components
const PerformanceTrendChart = ({ data }: { data: any[] }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorAssists" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="gameweek" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="goals" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorGoals)" 
          />
          <Area 
            type="monotone" 
            dataKey="assists" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorAssists)" 
          />
          <Line 
            type="monotone" 
            dataKey="rating" 
            stroke="#f59e0b" 
            strokeWidth={3}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

const SkillRadarChart = ({ data }: { data: any }) => {
  const skillData = [
    { skill: 'Pace', value: data.pace || 75 },
    { skill: 'Shooting', value: data.shooting || 82 },
    { skill: 'Passing', value: data.passing || 78 },
    { skill: 'Dribbling', value: data.dribbling || 85 },
    { skill: 'Defense', value: data.defense || 45 },
    { skill: 'Physical', value: data.physical || 80 },
  ]

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={skillData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#9ca3af', fontSize: 10 }}
          />
          <Radar 
            name="Skills" 
            dataKey="value" 
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.3} 
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

const GoalDistributionChart = ({ data }: { data: any[] }) => {
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
  
  const goalTypes = [
    { name: 'Right Foot', value: data.filter(m => m.goals > 0).length * 0.6 },
    { name: 'Left Foot', value: data.filter(m => m.goals > 0).length * 0.25 },
    { name: 'Header', value: data.filter(m => m.goals > 0).length * 0.1 },
    { name: 'Other', value: data.filter(m => m.goals > 0).length * 0.05 },
  ]

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={goalTypes}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {goalTypes.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

const MatchRatingTrendChart = ({ matches }: { matches: any[] }) => {
  const ratingData = matches.slice(-10).map((match, index) => ({
    match: `M${index + 1}`,
    rating: match.rating,
    opponent: match.opponent,
    goals: match.goals,
    assists: match.assists
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={ratingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="match" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis 
            domain={[0, 10]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'rating') return [value.toFixed(1), 'Rating']
              return [value, name]
            }}
          />
          <Line 
            type="monotone" 
            dataKey="rating" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Enhanced stats comparison component
const StatsComparisonCard = ({ title, current, previous, icon: Icon }: {
  title: string
  current: number
  previous: number
  icon: React.ComponentType<{ className?: string }>
}) => {
  const change = current - previous
  const percentChange = previous > 0 ? ((change / previous) * 100) : 0
  const isPositive = change >= 0

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-5 h-5 text-gray-400" />
          <Badge 
            variant="outline" 
            className={`${isPositive ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}`}
          >
            {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{current}</p>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-xs text-gray-500">
            Previous: {previous} ({isPositive ? '+' : ''}{change})
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function PlayerProfileScreen() {
  const [profileData, setProfileData] = useState<PlayerProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true)
        
        // Get current user from Supabase auth
        const supabase = createClientComponentClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setProfileData(getEmptyPlayerProfileData())
          return
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!profile || profile.user_type !== 'player') {
          setProfileData(getEmptyPlayerProfileData())
          return
        }

        // Get player data with team info
        const { data: playerData } = await supabase
          .from('players')
          .select(`
            id,
            position,
            number,
            status,
            teams (
              id,
              name,
              short_name,
              logo_url
            )
          `)
          .eq('user_id', user.id)
          .single()

        // Get player match stats for current season
        const currentYear = new Date().getFullYear()
        const { data: matchStats } = await supabase
          .from('player_match_stats')
          .select(`
            goals,
            assists,
            minutes_played,
            rating,
            matches (
              id,
              date,
              home_team:teams!matches_home_team_id_fkey(name),
              away_team:teams!matches_away_team_id_fkey(name),
              home_score,
              away_score
            )
          `)
          .eq('player_id', playerData?.id)
          .gte('matches.date', `${currentYear}-01-01`)

        // Calculate current season stats
        const currentSeasonStats = {
          matchesPlayed: matchStats?.length || 0,
          goals: matchStats?.reduce((sum, match) => sum + (match.goals || 0), 0) || 0,
          assists: matchStats?.reduce((sum, match) => sum + (match.assists || 0), 0) || 0,
          cleanSheets: 0, // TODO: Calculate based on goalkeeper stats
          yellowCards: 0, // TODO: Add when implemented
          redCards: 0, // TODO: Add when implemented
          minutesPlayed: matchStats?.reduce((sum, match) => sum + (match.minutes_played || 0), 0) || 0,
          matchRating: matchStats?.length ? 
            matchStats.reduce((sum, match) => sum + (match.rating || 0), 0) / matchStats.length : 0
        }

        // Get all career stats
        const { data: careerStats } = await supabase
          .from('player_match_stats')
          .select('goals, assists, minutes_played, rating')
          .eq('player_id', playerData?.id)

        const careerStatsCalculated = {
          totalMatches: careerStats?.length || 0,
          totalGoals: careerStats?.reduce((sum, match) => sum + (match.goals || 0), 0) || 0,
          totalAssists: careerStats?.reduce((sum, match) => sum + (match.assists || 0), 0) || 0,
          totalCleanSheets: 0, // TODO: Calculate for goalkeepers
          seasonsPlayed: 1, // TODO: Calculate actual seasons
          bestRating: careerStats?.reduce((max, match) => Math.max(max, match.rating || 0), 0) || 0
        }

        // Get recent matches (last 10)
        const { data: recentMatches } = await supabase
          .from('player_match_stats')
          .select(`
            goals,
            assists,
            rating,
            minutes_played,
            matches (
              id,
              date,
              home_team:teams!matches_home_team_id_fkey(name),
              away_team:teams!matches_away_team_id_fkey(name),
              home_score,
              away_score
            )
          `)
          .eq('player_id', playerData?.id)
          .order('matches(date)', { ascending: false })
          .limit(10)

        const formattedRecentMatches = recentMatches?.map(match => ({
          id: match.matches.id,
          date: match.matches.date,
          opponent: playerData?.teams?.id === match.matches.home_team?.id ? 
            match.matches.away_team?.name || 'Unknown' : 
            match.matches.home_team?.name || 'Unknown',
          result: `${match.matches.home_score || 0}-${match.matches.away_score || 0}`,
          goals: match.goals || 0,
          assists: match.assists || 0,
          rating: match.rating || 0,
          minutesPlayed: match.minutes_played || 0
        })) || []

        // Build the complete player profile data
        const playerProfileData: PlayerProfileData = {
          id: user.id,
          username: profile.username || profile.full_name || 'Player',
          fullName: profile.full_name || 'Unknown Player',
          email: user.email || '',
          avatar: profile.avatar_url,
          joinedDate: profile.created_at,
          userType: "player",
          xbox_gamertag: profile.xbox_gamertag,
          psn_id: profile.psn_id,
          preferred_platform: profile.preferred_platform,
          experience_level: profile.experience_level,
          position: playerData?.position || 'Unknown',
          jerseyNumber: playerData?.number || 0,
          currentTeam: playerData?.teams ? {
            id: playerData.teams.id,
            name: playerData.teams.name,
            shortName: playerData.teams.short_name,
            logoUrl: playerData.teams.logo_url,
            role: "player",
            joinedDate: playerData.created_at || new Date().toISOString()
          } : {
            id: '',
            name: 'No Team',
            shortName: 'N/A',
            role: "player",
            joinedDate: new Date().toISOString()
          },
          currentSeasonStats,
          careerStats: careerStatsCalculated,
          fantasyStats: {
            totalPoints: 0, // TODO: Get from fantasy_player_stats
            currentPrice: 5.0, // TODO: Get from fantasy_player_stats
            selectedByPercent: 0, // TODO: Calculate
            gameweekPoints: 0 // TODO: Get current gameweek points
          },
          performanceData: [], // TODO: Format match stats for charts
          recentMatches: formattedRecentMatches,
          managedTeams: [] // Players don't manage teams
        }

        setProfileData(playerProfileData)
      } catch (error) {
        console.error('Error loading profile data:', error)
        setProfileData(getEmptyPlayerProfileData())
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [])

  const updateProfile = async (formData: FormData) => {
    if (!profileData) return
    
    setProfileData(prev => {
      if (!prev) return null
      return {
        ...prev,
        xbox_gamertag: formData.get('xbox_gamertag') as string,
        psn_id: formData.get('psn_id') as string,
        preferred_platform: formData.get('preferred_platform') as PlayerProfileData['preferred_platform'],
        experience_level: formData.get('experience_level') as PlayerProfileData['experience_level'],
      }
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" className="text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">Player Profile</h1>
          <Button variant="outline" size="sm" className="text-white border-white/20">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Profile Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.fullName} />
                    <AvatarFallback className="bg-purple-600 text-white text-2xl">
                      {profileData.fullName
                        ?.split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase() || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{profileData.fullName}</h2>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />@{profileData.username}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="h-4 w-4 mr-2" />
                        {profileData.email}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        Joined {formatDate(profileData.joinedDate)}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="text-2xl font-bold text-accent">{profileData.currentTeam.name}</div>
                      <div className="text-sm text-muted-foreground">
                        <div className="text-2xl font-bold text-foreground">#{profileData.jerseyNumber}</div>
                        <div className="text-sm text-muted-foreground">{profileData.position}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {/* Gaming Platforms */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Gamepad2 className="h-5 w-5 mr-2" />
                  Gaming Platforms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profileData.xbox_gamertag ? (
                  <div className="flex items-center justify-between">
                    <Gamepad2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      {profileData.xbox_gamertag}
                    </span>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">No Xbox account linked</div>
                )}

                {profileData.psn_id ? (
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-bold">PS</span>
                    <span className="text-sm text-muted-foreground">
                      {profileData.psn_id}
                    </span>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">No PlayStation account linked</div>
                )}

                {profileData.preferred_platform ? (
                  <div className="text-xs text-muted-foreground mt-2">
                    Preferred: {profileData.preferred_platform.charAt(0).toUpperCase() + profileData.preferred_platform.slice(1)}
                  </div>
                ) : null}

                {profileData.experience_level ? (
                  <div className="text-xs text-muted-foreground mt-2">
                    Experience: {profileData.experience_level.charAt(0).toUpperCase() + profileData.experience_level.slice(1)}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Card */}
        <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white">Current Team: {profileData.currentTeam.name}</span>
              </div>
              <div className="text-right space-y-1">
                <div className="text-sm text-muted-foreground">
                  Role: <span className="text-white capitalize">{profileData.currentTeam.role}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Joined: <span className="text-white">{formatDate(profileData.currentTeam.joinedDate)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-4 text-center">
            <div className="text-2xl font-bold text-[#00ff87]">{profileData.currentSeasonStats.goals}</div>
            <p className="text-xs text-gray-500">This season • {profileData.careerStats.totalGoals} career</p>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-4 text-center">
            <div className="text-2xl font-bold text-white">{profileData.currentSeasonStats.assists}</div>
            <p className="text-xs text-gray-500">This season • {profileData.careerStats.totalAssists} career</p>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-4 text-center">
            <div className="text-2xl font-bold text-white">{profileData.currentSeasonStats.matchesPlayed}</div>
            <p className="text-xs text-gray-500">This season • {profileData.careerStats.totalMatches} career</p>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-4 text-center">
            <div className="text-2xl font-bold text-white">{profileData.fantasyStats.totalPoints}</div>
            <p className="text-xs text-gray-500">
              £{profileData.fantasyStats.currentPrice}M • {profileData.fantasyStats.selectedByPercent}% owned
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/40">
            <TabsTrigger value="performance" className="text-white data-[state=active]:bg-purple-600">
              Performance
            </TabsTrigger>
            <TabsTrigger value="matches" className="text-white data-[state=active]:bg-purple-600">
              Recent Matches
            </TabsTrigger>
            <TabsTrigger value="career" className="text-white data-[state=active]:bg-purple-600">
              Career Stats
            </TabsTrigger>
            {profileData.userType === "manager" && (
              <TabsTrigger value="teams" className="text-white data-[state=active]:bg-purple-600">
                Managed Teams
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="performance" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Goals This Season</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={profileData.performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="goals" fill="#00ff87" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceTrendChart data={profileData.performanceData} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matches" className="mt-6">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileData.recentMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <div className="font-medium text-white">{match.opponent}</div>
                          <div className="text-gray-400">{match.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${match.result === 'W' ? 'text-green-400' : 
                          match.result === 'L' ? 'text-red-400' : 'text-yellow-400'}`}>
                          {match.result}
                        </div>
                        <div className="text-sm text-gray-400">
                          {match.goals}G {match.assists}A
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="career" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Career Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Matches:</span>
                    <span className="text-white font-semibold">{profileData.careerStats.totalMatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Career Goals:</span>
                    <span className="text-[#00ff87] font-semibold">{profileData.careerStats.totalGoals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Career Assists:</span>
                    <span className="text-white font-semibold">{profileData.careerStats.totalAssists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Seasons Played:</span>
                    <span className="text-white font-semibold">{profileData.careerStats.seasonsPlayed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best Rating:</span>
                    <span className="text-[#00ff87] font-semibold">{profileData.careerStats.bestRating}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Fantasy Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Points:</span>
                    <span className="text-[#00ff87] font-semibold">{profileData.fantasyStats.totalPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Price:</span>
                    <span className="text-white font-semibold">£{profileData.fantasyStats.currentPrice}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ownership:</span>
                    <span className="text-white font-semibold">{profileData.fantasyStats.selectedByPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gameweek Points:</span>
                    <span className="text-white font-semibold">{profileData.fantasyStats.gameweekPoints}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {profileData.userType === "manager" && (
            <TabsContent value="teams" className="mt-6">
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Managed Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileData.managedTeams?.map((team) => (
                      <div key={team.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <div className="font-medium text-white">{team.name}</div>
                            <div className="text-gray-400">{team.league}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{team.wins}W {team.draws}D {team.losses}L</div>
                          <div className="text-sm text-gray-400">
                            {team.position} position
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

// Helper function to create empty player profile data
function getEmptyPlayerProfileData(): PlayerProfileData {
  return {
    id: "",
    username: "",
    fullName: "",
    email: "",
    avatar: "",
    joinedDate: new Date().toISOString(),
    userType: "player",
    jerseyNumber: 0,
    position: "",
    xbox_gamertag: "",
    psn_id: "",
    preferred_platform: "xbox",
    experience_level: "beginner",
    currentTeam: {
      name: "",
      role: "",
      joinedDate: new Date().toISOString(),
    },
    currentSeasonStats: {
      goals: 0,
      assists: 0,
      matchesPlayed: 0,
      rating: 0,
    },
    careerStats: {
      totalGoals: 0,
      totalAssists: 0,
      totalMatches: 0,
      seasonsPlayed: 0,
      bestRating: 0,
    },
    fantasyStats: {
      totalPoints: 0,
      currentPrice: 0,
      selectedByPercent: 0,
      gameweekPoints: 0,
    },
    performanceData: [],
    recentMatches: [],
    managedTeams: [],
  }
}
