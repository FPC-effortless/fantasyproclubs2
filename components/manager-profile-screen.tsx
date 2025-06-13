"use client"

import { useState, useEffect } from "react"
import {
  User,
  Mail,
  Calendar,
  Users,
  Settings,
  Shield,
  Trophy,
  FileInput,
  Plus,
  ChevronRight,
  Edit,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clipboard,
  UserPlus,
  Trash2,
  Star,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import styles from "./manager-profile-screen.module.css"
import { cn } from "@/lib/utils"
import { LogoutButton } from "@/components/auth/logout-button"
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LoadingState } from './loading-state';
import type { BarProps, XAxisProps, YAxisProps } from 'recharts';

// Create a separate dynamic chart component
const DynamicChart = dynamic(() => import('./charts/performance-chart'), {
  ssr: false,
  loading: () => <LoadingState />
});

interface TeamMember {
  id: string
  name: string
  position: string
  jerseyNumber: number
  avatar?: string
  role: "captain" | "player" | "manager"
  matchesPlayed: number
  goals: number
  assists: number
  rating: number
  status: "active" | "injured" | "suspended"
}

interface Fixture {
  id: string
  date: string
  opponent: string
  competition: string
  venue: string
  isHome: boolean
  status: "upcoming" | "completed" | "live"
  result?: string
}

interface TeamPerformance {
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  cleanSheets: number
  points: number
  position: number
  form: Array<"W" | "D" | "L">
  recentResults: Array<{
    opponent: string
    result: string
    score: string
  }>
  performanceData: Array<{
    match: number
    goalsFor: number
    goalsAgainst: number
  }>
}

interface ManagerProfileData {
  id: string
  username: string
  fullName: string
  email: string
  avatar?: string
  joinedDate: string
  userType: "manager"
  team: {
    id: string
    name: string
    shortName: string
    logoUrl?: string
    primaryColor: string
    secondaryColor: string
    foundedDate: string
    homeVenue: string
  }
  teamMembers: TeamMember[]
  fixtures: Fixture[]
  teamPerformance: TeamPerformance
  pendingActions: {
    matchesToSubmit: number
    playerRequests: number
    statsToVerify: number
  }
}

const getEmptyManagerData = (): ManagerProfileData => ({
  id: "",
  username: "-",
  fullName: "-",
  email: "-",
  joinedDate: new Date().toISOString(),
  userType: "manager",
  team: {
    id: "",
    name: "-",
    shortName: "-",
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    foundedDate: "-",
    homeVenue: "-",
  },
  teamMembers: [],
  fixtures: [],
  teamPerformance: {
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    cleanSheets: 0,
    points: 0,
    position: 0,
    form: [],
    recentResults: [],
    performanceData: [],
  },
  pendingActions: {
    matchesToSubmit: 0,
    playerRequests: 0,
    statsToVerify: 0,
  },
})

export function ManagerProfileScreen() {
  const [profileData, setProfileData] = useState<ManagerProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load actual data on mount
  useEffect(() => {
    const loadManagerData = async () => {
      try {
        setIsLoading(true)
        
        const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
        const supabase = createClientComponentClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setProfileData(getEmptyManagerData())
          return
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!profile) {
          setProfileData(getEmptyManagerData())
          return
        }

        // Get managed teams with enhanced mobile-friendly data structure
        const { data: teams } = await supabase
          .from('teams')
          .select(`
            id,
            name,
            short_name,
            logo_url,
            primary_color,
            secondary_color,
            founded_date,
            home_venue,
            created_at,
            players (
              id,
              user_id,
              position,
              number,
              user_profiles!inner (
                display_name,
                avatar_url
              )
            )
          `)
          .eq('manager_id', user.id)

        if (!teams || teams.length === 0) {
          setProfileData(getEmptyManagerData())
          return
        }

        const team = teams[0]
        
        // Build manager profile data from real Supabase data
        const managerProfileData: ManagerProfileData = {
          id: user.id,
          username: profile.username || 'Manager',
          fullName: profile.display_name || 'Team Manager',
          email: user.email || '',
          avatar: profile.avatar_url,
          joinedDate: profile.created_at,
          userType: 'manager',
          team: {
            id: team.id,
            name: team.name,
            shortName: team.short_name || team.name.substring(0, 3).toUpperCase(),
            logoUrl: team.logo_url,
            primaryColor: team.primary_color || '#004225',
            secondaryColor: team.secondary_color || '#ffffff',
            foundedDate: team.founded_date || team.created_at,
            homeVenue: team.home_venue || 'Home Stadium',
          },
          teamMembers: team.players?.map((player: any) => ({
            id: player.id,
            name: player.user_profiles?.display_name || 'Player',
            position: player.position || 'Unknown',
            jerseyNumber: player.number || 0,
            avatar: player.user_profiles?.avatar_url,
            role: 'player' as const,
            matchesPlayed: 0,
            goals: 0,
            assists: 0,
            rating: 0,
            status: 'active' as const,
          })) || [],
          fixtures: [], // Would load from matches table
          teamPerformance: {
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            cleanSheets: 0,
            points: 0,
            position: 0,
            form: [],
            recentResults: [],
            performanceData: [],
          },
          pendingActions: {
            matchesToSubmit: 0,
            playerRequests: 0,
            statsToVerify: 0,
          },
        }

        setProfileData(managerProfileData)
      } catch (error) {
        console.error('Error loading manager data:', error)
        setProfileData(getEmptyManagerData())
      } finally {
        setIsLoading(false)
      }
    }

    loadManagerData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent/20 text-accent border-accent/30"
      case "injured":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "suspended":
        return "bg-warning/20 text-warning border-warning/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  const getFormBadge = (result: "W" | "D" | "L") => {
    switch (result) {
      case "W":
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#00ff87] text-black font-bold text-xs">
            W
          </span>
        )
      case "D":
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400 text-black font-bold text-xs">
            D
          </span>
        )
      case "L":
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white font-bold text-xs">
            L
          </span>
        )
      default:
        return null
    }
  }

  // Mobile-optimized tab configuration
  const mobileTabConfig = [
    { id: "dashboard", label: "Dashboard", icon: User },
    { id: "squad", label: "Squad", icon: Users },
    { id: "fixtures", label: "Fixtures", icon: Calendar },
    { id: "performance", label: "Stats", icon: BarChart3 },
  ]

  // Replace chart implementation
  const Chart = ({ data }: { data: any[] }) => {
    return (
      <Suspense fallback={<LoadingState />}>
        <DynamicChart data={data} />
      </Suspense>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pb-16">
        <div className="p-4 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse" />
            </div>
          </div>
          
          {/* Mobile-optimized loading skeleton */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
          
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-black text-white pb-16 flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-xl font-bold mb-2">No Team Data</h2>
          <p className="text-gray-400">Unable to load manager information</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      {/* Enhanced Mobile Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={profileData.avatar || "/placeholder-avatar.jpg"}
                alt="Manager"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-black" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">{profileData.fullName}</h1>
              <p className="text-sm text-gray-400 truncate">{profileData.team.name}</p>
            </div>
          </div>
          
          {/* Mobile-optimized action button */}
          <div className="flex items-center space-x-2">
            {profileData.pendingActions.matchesToSubmit > 0 && (
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">{profileData.pendingActions.matchesToSubmit}</span>
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Mobile-optimized Tab Navigation */}
      {isMobile ? (
        <div className="sticky top-20 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <div className="flex overflow-x-auto">
            {mobileTabConfig.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center p-3 min-w-0 ${
                    activeTab === tab.id
                      ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/10'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium truncate">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-b border-gray-800">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="squad">Squad</TabsTrigger>
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
            <p className="text-muted-foreground">Team management and performance tracking</p>
          </div>
          <div className="flex gap-4">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              New Match
            </Button>
            <LogoutButton />
          </div>
        </div>

        {/* Manager Info Section */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24 border-2 border-accent">
                <AvatarImage src={profileData?.avatar || "/placeholder.svg"} alt={profileData?.fullName} />
                <AvatarFallback className="bg-accent text-accent-foreground text-xl font-bold">
                  {profileData?.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-foreground">{profileData?.fullName}</h2>
                  <Badge className="bg-[#00ff87]/20 text-[#00ff87] border-[#00ff87]/30">
                    <Shield className="h-3 w-3 mr-1" />
                    Manager
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-400">
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-2" />@{profileData?.username}
                  </p>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {profileData?.email}
                  </p>
                  <p className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {profileData?.team.name}
                  </p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manager since {formatDate(profileData?.joinedDate)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-[#00ff87]">{profileData?.teamPerformance.position}</div>
                  <div className="text-sm text-gray-400">League Position</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{profileData?.teamPerformance.points}</div>
                  <div className="text-sm text-gray-400">Points</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-[#00ff87]/20">
                  <FileInput className="h-6 w-6 text-[#00ff87]" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">Match Results</p>
                  <p className="text-sm text-gray-400">{profileData?.pendingActions.matchesToSubmit} to submit</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-[#00ff87]/20">
                  <UserPlus className="h-6 w-6 text-[#00ff87]" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">Player Requests</p>
                  <p className="text-sm text-gray-400">{profileData?.pendingActions.playerRequests} pending</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-[#00ff87]/20">
                  <Clipboard className="h-6 w-6 text-[#00ff87]" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">Stats Verification</p>
                  <p className="text-sm text-gray-400">{profileData?.pendingActions.statsToVerify} to verify</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Team Performance */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-[#00ff87]" />
                  <span className="text-foreground">Team Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-[#00ff87]">{profileData?.teamPerformance.wins}</div>
                      <div className="text-sm text-gray-400">Wins</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{profileData?.teamPerformance.draws}</div>
                      <div className="text-sm text-gray-400">Draws</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{profileData?.teamPerformance.losses}</div>
                      <div className="text-sm text-gray-400">Losses</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Goals</span>
                      <span className="text-sm text-foreground">
                        {profileData?.teamPerformance.goalsFor} - {profileData?.teamPerformance.goalsAgainst}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      {/* Progress bar with dynamic width - inline style necessary for dynamic percentage */}
                      <div
                        className={styles.goalsProgressBar}
                        // @ts-ignore: Dynamic progress value requires inline style
                        style={{
                          '--progress-width': `${(profileData?.teamPerformance.goalsFor / (profileData?.teamPerformance.goalsFor + profileData?.teamPerformance.goalsAgainst) * 100)}%`
                        } as React.CSSProperties}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Form</span>
                      <div className="flex space-x-1">
                        {profileData?.teamPerformance.form.map((result, index) => (
                          <div key={index}>{getFormBadge(result)}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.performanceChart}>
                    <div className={styles.chartContainer}>
                      <ResponsiveContainer>
                        <Chart data={profileData?.teamPerformance.performanceData} />
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-[#00ff87]" />
                  <span className="text-foreground">Recent Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileData?.teamPerformance.recentResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-foreground font-medium">vs {result.opponent}</p>
                        <p className="text-sm text-gray-400">{result.score}</p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          result.result === "W"
                            ? "bg-[#00ff87]/20 text-[#00ff87]"
                            : result.result === "D"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {result.result}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Submission */}
          <Card className="bg-gradient-to-r from-[#00ff87]/10 to-green-400/5 border-[#00ff87]/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileInput className="h-5 w-5 text-[#00ff87]" />
                <span className="text-foreground">Quick Stats Submission</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Submit match statistics for your most recent fixtures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profileData?.fixtures
                  .filter((fixture) => fixture.status === "completed" && !fixture.result)
                  .slice(0, 2)
                  .map((fixture) => (
                    <div key={fixture.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-foreground font-medium">vs {fixture.opponent}</p>
                        <p className="text-sm text-gray-400">
                          {fixture.competition} • {formatDate(fixture.date)}
                        </p>
                      </div>
                      <Button className="bg-[#00ff87] text-black hover:bg-[#00ff87]/90">Submit Stats</Button>
                    </div>
                  ))}

                <div className="flex justify-center">
                  <Button variant="outline" className="border-[#00ff87] text-[#00ff87] hover:bg-[#00ff87]/10">
                    View All Pending Submissions
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Player Performance Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-[#00ff87]" />
                <span className="text-foreground">Player Performance Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">Player</TableHead>
                    <TableHead className="text-gray-400">Position</TableHead>
                    <TableHead className="text-gray-400">Matches</TableHead>
                    <TableHead className="text-gray-400">Goals</TableHead>
                    <TableHead className="text-gray-400">Assists</TableHead>
                    <TableHead className="text-gray-400">Rating</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profileData?.teamMembers.map((member) => (
                    <TableRow 
                      key={member.id} 
                      className="border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors"
                      onClick={() => window.location.href = `/players/${member.id}`}
                    >
                      <TableCell className="text-foreground font-medium">{member.name}</TableCell>
                      <TableCell className="text-foreground">{member.position}</TableCell>
                      <TableCell className="text-foreground">{member.matchesPlayed}</TableCell>
                      <TableCell className="text-foreground">{member.goals}</TableCell>
                      <TableCell className="text-foreground">{member.assists}</TableCell>
                      <TableCell className="text-foreground">{member.rating}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          styles.statusIndicator,
                          member.status === "active" && styles.statusIndicatorActive,
                          member.status === "injured" && styles.statusIndicatorInjured,
                          member.status === "suspended" && styles.statusIndicatorSuspended
                        )}>
                          {member.status === "active" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {member.status === "injured" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {member.status === "suspended" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Roster Tab */}
        <TabsContent value="squad" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Team Roster</h2>
            <Button className="bg-[#00ff87] text-black hover:bg-[#00ff87]/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profileData?.teamMembers.map((member) => (
              <Card key={member.id} className="bg-card border-border overflow-hidden">
                <div
                  className={`h-1 ${
                    member.status === "active"
                      ? "bg-[#00ff87]"
                      : member.status === "injured"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                  }`}
                ></div>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback className="bg-gray-800 text-white font-bold">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-foreground truncate">{member.name}</h3>
                        {member.role === "captain" && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <Shield className="h-3 w-3 mr-1" />
                            Captain
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {member.position} • #{member.jerseyNumber}
                      </p>
                    </div>
                    <Badge className={getStatusColor(member.status)} variant="outline">
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-foreground">{member.matchesPlayed}</div>
                      <div className="text-xs text-gray-400">Matches</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#00ff87]">{member.goals}</div>
                      <div className="text-xs text-gray-400">Goals</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">{member.assists}</div>
                      <div className="text-xs text-gray-400">Assists</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-400">Rating</span>
                      <span className="text-xs text-foreground">{member.rating}/10</span>
                    </div>
                    <Progress
                      value={member.rating * 10}
                      className={cn(
                        styles.statusIndicatorBar,
                        member.status === "active" && styles.statusIndicatorBarActive,
                        member.status === "injured" && styles.statusIndicatorBarInjured,
                        member.status === "suspended" && styles.statusIndicatorBarSuspended
                      )}
                    ></Progress>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[#00ff87] text-[#00ff87] hover:bg-[#00ff87]/10"
                    >
                      View Stats
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:bg-gray-800">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Fixtures Tab */}
        <TabsContent value="fixtures" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Upcoming Fixtures</h2>
            <Button className="bg-[#00ff87] text-black hover:bg-[#00ff87]/90">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Match
            </Button>
          </div>

          <div className="space-y-4">
            {profileData?.fixtures
              .filter((fixture) => fixture.status === "upcoming")
              .map((fixture) => (
                <Card key={fixture.id} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${fixture.isHome ? "bg-[#00ff87]/20" : "bg-gray-800"}`}>
                          {fixture.isHome ? (
                            <Trophy className="h-6 w-6 text-[#00ff87]" />
                          ) : (
                            <Trophy className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">
                            {fixture.isHome ? "vs" : "@"} {fixture.opponent}
                          </p>
                          <p className="text-sm text-gray-400">
                            {fixture.competition} • {fixture.venue}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-foreground font-medium">{formatDateTime(fixture.date)}</p>
                          <p className="text-sm text-gray-400">{fixture.isHome ? "Home" : "Away"}</p>
                        </div>
                        <Button
                          variant="outline"
                          className="border-[#00ff87] text-[#00ff87] hover:bg-[#00ff87] hover:text-black"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Recent Results</h2>
            <div className="space-y-4">
              {profileData?.fixtures
                .filter((fixture) => fixture.status === "completed")
                .map((fixture) => (
                  <Card key={fixture.id} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-3 rounded-full ${
                              fixture.result?.startsWith("W")
                                ? "bg-[#00ff87]/20"
                                : fixture.result?.startsWith("D")
                                  ? "bg-yellow-500/20"
                                  : "bg-red-500/20"
                            }`}
                          >
                            {fixture.result?.startsWith("W") ? (
                              <Trophy className="h-6 w-6 text-[#00ff87]" />
                            ) : fixture.result?.startsWith("D") ? (
                              <Trophy className="h-6 w-6 text-yellow-400" />
                            ) : (
                              <Trophy className="h-6 w-6 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-foreground">
                              {fixture.isHome ? "vs" : "@"} {fixture.opponent}
                            </p>
                            <p className="text-sm text-gray-400">
                              {fixture.competition} • {fixture.venue}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-4">
                          <div className="text-right">
                            <p
                              className={`font-medium ${
                                fixture.result?.startsWith("W")
                                  ? "text-[#00ff87]"
                                  : fixture.result?.startsWith("D")
                                    ? "text-yellow-400"
                                    : "text-red-400"
                              }`}
                            >
                              {fixture.result}
                            </p>
                            <p className="text-sm text-gray-400">{formatDate(fixture.date)}</p>
                          </div>
                          <Button variant="outline" className="border-gray-700 text-gray-400 hover:bg-gray-800">
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>

        {/* Team Settings Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-[#00ff87]" />
                <span className="text-foreground">Team Settings</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your team&apos;s information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input id="teamName" defaultValue={profileData?.team.name} className="bg-gray-800 border-gray-700" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortName">Short Name</Label>
                  <Input
                    id="shortName"
                    defaultValue={profileData?.team.shortName}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <div
                        className={styles.colorPreview}
                        data-color={profileData?.team.primaryColor}
                      ></div>
                      <Input
                        id="primaryColor"
                        defaultValue={profileData?.team.primaryColor}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                      <div
                        className={styles.colorPreview}
                        data-color={profileData?.team.secondaryColor}
                      ></div>
                      <Input
                        id="secondaryColor"
                        defaultValue={profileData?.team.secondaryColor}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="homeVenue">Home Venue</Label>
                  <Input
                    id="homeVenue"
                    defaultValue={profileData?.team.homeVenue}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" className="border-gray-700 text-gray-400 hover:bg-gray-800">
                  Cancel
                </Button>
                <Button className="bg-[#00ff87] text-black hover:bg-[#00ff87]/90">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Team Management</CardTitle>
              <CardDescription className="text-gray-400">Manage team roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Team Captain</Label>
                <Select defaultValue={profileData?.teamMembers?.[0]?.id || ""}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {profileData?.teamMembers?.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assistant Manager</Label>
                <Select defaultValue={profileData?.teamMembers[0].id}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select a player" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value={profileData?.teamMembers[0].id}>None</SelectItem>
                    {profileData?.teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </div>
  )
}
