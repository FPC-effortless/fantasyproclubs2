"use client"

import { useState, useEffect } from "react"
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Star,
  TrendingUp,
  Settings,
  Crown,
  Activity,
  Users,
  Target,
  Award,
  ChevronRight,
  Edit,
  Bell,
  Shield,
  CreditCard,
  Gamepad2,
  Copy,
  Check,
  ArrowLeft,
  ArrowUpDown,
  LogOut,
  Heart,
  MapPin,
  Phone,
  Cake,
  Lock,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { PlatformBadge } from "@/components/gaming-platform/platform-badge"
import { LogoutButton } from "@/components/auth/logout-button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

// Import createClientComponentClient outside useEffect

// Helper function to create empty fan profile data
function getEmptyFanProfileData(): FanProfileData {
  return {
    id: "",
    username: "",
    fullName: "",
    email: "",
    avatar: "",
    joinedDate: new Date().toISOString(),
    userType: "fan",
    xbox_gamertag: "",
    psn_id: "",
    preferred_platform: "xbox",
    stats: {
      fantasyPoints: 0,
      currentRank: 0,
      bestRank: 0,
      leaguesJoined: 0,
      totalSeasons: 0,
      favoriteTeam: "",
      teamsFollowed: 0,
      matchesWatched: 0,
    },
    fantasyTeam: {
      name: "",
      currentPoints: 0,
      gameweekPoints: 0,
      rank: 0,
      budget: 100,
      transfers: 0,
      teamValue: 0,
    },
    recentActivity: [],
    settings: {
      notifications: true,
      emailUpdates: false,
      publicProfile: true,
      showStats: true,
      matchNotifications: true,
      transferNotifications: true,
      socialMediaSharing: false,
    },
  }
}

interface FanProfileData {
  id: string
  username: string
  fullName: string
  email: string
  avatar?: string
  joinedDate: string
  userType: "fan"
  xbox_gamertag?: string
  psn_id?: string
  preferred_platform?: "xbox" | "playstation" | "both"
  phone_number?: string
  date_of_birth?: string
  location?: string
  favorite_team?: string
  upgradeRequest?: {
    status: "pending" | "approved" | "rejected"
    requestedRole: "player" | "manager"
    submittedAt: string
  }
  stats: {
    fantasyPoints: number
    leaguesJoined: number
    currentRank: number
    totalSeasons: number
    bestRank: number
    favoriteTeam: string
    teamsFollowed: number
    matchesWatched: number
  }
  fantasyTeam: {
    name: string
    currentPoints: number
    gameweekPoints: number
    rank: number
    budget: number
    transfers: number
    teamValue: number
  }
  recentActivity: Array<{
    id: string
    type: "transfer" | "league_join" | "achievement" | "match_watch" | "team_follow"
    description: string
    timestamp: string
    points?: number
  }>
  settings: {
    notifications: boolean
    emailUpdates: boolean
    publicProfile: boolean
    showStats: boolean
    matchNotifications: boolean
    transferNotifications: boolean
    socialMediaSharing: boolean
  }
}

export function FanProfileScreen() {
  const router = useRouter()
  const [profileData, setProfileData] = useState<FanProfileData>(
    getEmptyFanProfileData(),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone_number: "",
    date_of_birth: "",
    location: "",
    xbox_gamertag: "",
    psn_id: "",
    preferred_platform: ""
  })

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true)

        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setProfileData(getEmptyFanProfileData())
          return
        }

        // Get user profile
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (!profile) {
          setProfileData(getEmptyFanProfileData())
          return
        }

        // Get fantasy selections for total points calculation
        const { data: fantasySelections } = await supabase
          .from("fantasy_selections")
          .select(
            `
            fantasy_players (
              points
            )
          `,
          )
          .eq("user_id", user.id)

        const totalFantasyPoints =
          fantasySelections?.reduce(
            (sum, selection) => {
              const fantasyPlayer = Array.isArray(selection.fantasy_players) 
                ? selection.fantasy_players[0] 
                : selection.fantasy_players
              return sum + (fantasyPlayer?.points || 0)
            },
            0,
          ) || 0

        // Get favorite team info
        let favoriteTeamName = "None selected"
        if (profile.team_id) {
          const { data: teamData } = await supabase
            .from("teams")
            .select("name")
            .eq("id", profile.team_id)
            .single()
          
          favoriteTeamName = teamData?.name || "Unknown Team"
        }

        // Build fan profile data from real Supabase data
        const fanProfileData: FanProfileData = {
          id: user.id,
          username: profile.username || profile.full_name || "Fan",
          fullName: profile.full_name || "Unknown Fan",
          email: user.email || "",
          avatar: profile.avatar_url,
          joinedDate: profile.created_at,
          userType: "fan",
          xbox_gamertag: profile.xbox_gamertag,
          psn_id: profile.psn_id,
          preferred_platform: profile.preferred_platform,
          phone_number: profile.phone_number,
          date_of_birth: profile.date_of_birth,
          location: profile.location,
          favorite_team: favoriteTeamName,
          upgradeRequest: undefined, // TODO: Implement upgrade requests
          stats: {
            fantasyPoints: totalFantasyPoints,
            leaguesJoined: 1, // TODO: Implement league tracking
            currentRank: Math.floor(Math.random() * 1000) + 1, // TODO: Calculate current rank
            totalSeasons: 1, // TODO: Calculate total seasons
            bestRank: Math.floor(Math.random() * 500) + 1, // TODO: Track best rank
            favoriteTeam: favoriteTeamName,
            teamsFollowed: Math.floor(Math.random() * 5) + 1,
            matchesWatched: Math.floor(Math.random() * 50) + 10,
          },
          fantasyTeam: {
            name: "My Fantasy Team", // TODO: Get actual fantasy team name
            currentPoints: totalFantasyPoints,
            gameweekPoints: Math.floor(Math.random() * 50) + 10, // TODO: Get current gameweek points
            rank: Math.floor(Math.random() * 1000) + 1, // TODO: Calculate rank
            budget: 100.0, // TODO: Get actual budget
            transfers: 2, // TODO: Get remaining transfers
            teamValue: 95.5 + Math.random() * 10, // TODO: Calculate team value
          },
          recentActivity: [
            {
              id: "1",
              type: "transfer",
              description: "Transferred in Marcus Silva (£8.5m)",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              points: 12
            },
            {
              id: "2",
              type: "team_follow",
              description: "Started following FC Pro Stars",
              timestamp: new Date(Date.now() - 7200000).toISOString()
            },
            {
              id: "3",
              type: "match_watch",
              description: "Watched FC Barcelona vs Real Madrid",
              timestamp: new Date(Date.now() - 86400000).toISOString()
            }
          ],
          settings: {
            notifications: true,
            emailUpdates: true,
            publicProfile: true,
            showStats: true,
            matchNotifications: true,
            transferNotifications: true,
            socialMediaSharing: false,
          },
        }

        setProfileData(fanProfileData)
        setEditForm({
          fullName: fanProfileData.fullName,
          phone_number: fanProfileData.phone_number || "",
          date_of_birth: fanProfileData.date_of_birth || "",
          location: fanProfileData.location || "",
          xbox_gamertag: fanProfileData.xbox_gamertag || "",
          psn_id: fanProfileData.psn_id || "",
          preferred_platform: fanProfileData.preferred_platform || ""
        })
      } catch (error) {
        console.error("Error loading profile data:", error)
        setProfileData(getEmptyFanProfileData())
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [])

  const handleSettingsChange = (
    key: keyof FanProfileData["settings"],
    value: boolean,
  ) => {
    setProfileData((prev) => {
      if (!prev) return getEmptyFanProfileData()
      return {
        ...prev,
        settings: {
          ...prev.settings,
          [key]: value,
        },
      }
    })
    
    toast({
      title: "Setting updated",
      description: `${key.charAt(0).toUpperCase() + key.slice(1)} has been ${value ? 'enabled' : 'disabled'}`,
    })
  }

  const handleProfileUpdate = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: editForm.fullName,
          phone_number: editForm.phone_number || null,
          date_of_birth: editForm.date_of_birth || null,
          location: editForm.location || null,
          xbox_gamertag: editForm.xbox_gamertag || null,
          psn_id: editForm.psn_id || null,
          preferred_platform: editForm.preferred_platform || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      })

      setIsEditingProfile(false)
      
      // Refresh profile data
      window.location.reload()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (!profileData || profileData.id === "") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-white text-xl mb-2">Profile not found</div>
          <div className="text-gray-400">Please log in to view your profile</div>
          <Button 
            onClick={() => router.push("/login")} 
            className="mt-4 bg-purple-600 hover:bg-purple-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "transfer":
        return <ArrowUpDown className="h-4 w-4 text-blue-400" />
      case "league_join":
        return <Trophy className="h-4 w-4 text-green-400" />
      case "achievement":
        return <Award className="h-4 w-4 text-yellow-400" />
      case "match_watch":
        return <Activity className="h-4 w-4 text-purple-400" />
      case "team_follow":
        return <Heart className="h-4 w-4 text-red-400" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMilliseconds = now.getTime() - date.getTime()
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInSeconds < 60) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    return formatDate(dateString)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Fan Profile</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={profileData.avatar || "/placeholder.svg"}
                    alt={profileData.fullName}
                  />
                  <AvatarFallback className="bg-purple-600 text-white text-2xl">
                    {profileData.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "F"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {profileData.fullName}
                  </h2>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center text-gray-300">
                      <User className="h-4 w-4 mr-2" />
                      @{profileData.username}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Mail className="h-4 w-4 mr-2" />
                      {profileData.email}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-4 w-4 mr-2" />
                      Joined {formatDate(profileData.joinedDate)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{profileData.stats.fantasyPoints}</div>
                  <div className="text-sm text-gray-400">Fantasy Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{profileData.stats.currentRank}</div>
                  <div className="text-sm text-gray-400">Current Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{profileData.stats.teamsFollowed}</div>
                  <div className="text-sm text-gray-400">Teams Followed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{profileData.stats.matchesWatched}</div>
                  <div className="text-sm text-gray-400">Matches Watched</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 mb-6">
            <TabsTrigger
              value="overview"
              className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="fantasy"
              className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Fantasy
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Personal Information</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profileData.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{profileData.phone_number}</span>
                    </div>
                  )}
                  {profileData.date_of_birth && (
                    <div className="flex items-center gap-2">
                      <Cake className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{formatDate(profileData.date_of_birth)}</span>
                    </div>
                  )}
                  {profileData.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{profileData.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    <span className="text-gray-300">{profileData.favorite_team}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Gaming Platforms */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Gamepad2 className="h-5 w-5 mr-2" />
                    Gaming Platforms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profileData.xbox_gamertag ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">X</span>
                        </div>
                        <span className="text-gray-300">Xbox</span>
                      </div>
                      <span className="text-white font-medium">{profileData.xbox_gamertag}</span>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">No Xbox account linked</div>
                  )}

                  {profileData.psn_id ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">PS</span>
                        </div>
                        <span className="text-gray-300">PlayStation</span>
                      </div>
                      <span className="text-white font-medium">{profileData.psn_id}</span>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">No PlayStation account linked</div>
                  )}

                  {profileData.preferred_platform && (
                    <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-700">
                      Preferred: {profileData.preferred_platform.charAt(0).toUpperCase() + profileData.preferred_platform.slice(1)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Fantasy Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Points:</span>
                      <span className="text-white font-bold">{profileData.stats.fantasyPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Best Rank:</span>
                      <span className="text-white font-bold">{profileData.stats.bestRank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Seasons:</span>
                      <span className="text-white font-bold">{profileData.stats.totalSeasons}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Teams Followed:</span>
                      <span className="text-white font-bold">{profileData.stats.teamsFollowed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Leagues Joined:</span>
                      <span className="text-white font-bold">{profileData.stats.leaguesJoined}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Matches Watched:</span>
                      <span className="text-white font-bold">{profileData.stats.matchesWatched}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">This Month:</span>
                      <span className="text-white font-bold">{Math.floor(profileData.stats.matchesWatched / 3)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fantasy Tab */}
          <TabsContent value="fantasy" className="space-y-6">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Fantasy Team Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-purple-900/20 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">{profileData.fantasyTeam.currentPoints}</div>
                    <div className="text-sm text-gray-400">Total Points</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-900/20 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">{profileData.fantasyTeam.gameweekPoints}</div>
                    <div className="text-sm text-gray-400">Gameweek Points</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-900/20 border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">#{profileData.fantasyTeam.rank}</div>
                    <div className="text-sm text-gray-400">Current Rank</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-400">£{profileData.fantasyTeam.teamValue.toFixed(1)}M</div>
                    <div className="text-sm text-gray-400">Team Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {profileData.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
                      >
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-white text-sm">{activity.description}</p>
                          <p className="text-gray-400 text-xs">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                        {activity.points && (
                          <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                            +{activity.points} pts
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Notification Settings */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Push Notifications</Label>
                      <p className="text-sm text-gray-400">General app notifications</p>
                    </div>
                    <Switch
                      checked={profileData.settings.notifications}
                      onCheckedChange={(checked) =>
                        handleSettingsChange("notifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Match Notifications</Label>
                      <p className="text-sm text-gray-400">Get notified about matches</p>
                    </div>
                    <Switch
                      checked={profileData.settings.matchNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingsChange("matchNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Transfer Notifications</Label>
                      <p className="text-sm text-gray-400">Fantasy transfer updates</p>
                    </div>
                    <Switch
                      checked={profileData.settings.transferNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingsChange("transferNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Email Updates</Label>
                      <p className="text-sm text-gray-400">Weekly summary emails</p>
                    </div>
                    <Switch
                      checked={profileData.settings.emailUpdates}
                      onCheckedChange={(checked) =>
                        handleSettingsChange("emailUpdates", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Public Profile</Label>
                      <p className="text-sm text-gray-400">Allow others to view your profile</p>
                    </div>
                    <Switch
                      checked={profileData.settings.publicProfile}
                      onCheckedChange={(checked) =>
                        handleSettingsChange("publicProfile", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Show Statistics</Label>
                      <p className="text-sm text-gray-400">Display detailed stats on profile</p>
                    </div>
                    <Switch
                      checked={profileData.settings.showStats}
                      onCheckedChange={(checked) =>
                        handleSettingsChange("showStats", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Social Media Sharing</Label>
                      <p className="text-sm text-gray-400">Allow sharing achievements</p>
                    </div>
                    <Switch
                      checked={profileData.settings.socialMediaSharing}
                      onCheckedChange={(checked) =>
                        handleSettingsChange("socialMediaSharing", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Actions */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-yellow-500/20 bg-yellow-900/10">
                  <div>
                    <Label className="text-yellow-400">Sign Out</Label>
                    <p className="text-sm text-gray-400">Sign out of your account</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-red-900/10">
                  <div>
                    <Label className="text-red-400">Delete Account</Label>
                    <p className="text-sm text-gray-400">Permanently delete your account</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Delete Account</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          This action cannot be undone. This will permanently delete your account and remove all your data.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" className="text-gray-400">Cancel</Button>
                        <Button variant="destructive">Delete Account</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Profile</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update your personal information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Full Name</Label>
                <Input
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Phone Number</Label>
                <Input
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label className="text-white">Date of Birth</Label>
                <Input
                  type="date"
                  value={editForm.date_of_birth}
                  onChange={(e) => setEditForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Location</Label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label className="text-white">Xbox Gamertag</Label>
                <Input
                  value={editForm.xbox_gamertag}
                  onChange={(e) => setEditForm(prev => ({ ...prev, xbox_gamertag: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label className="text-white">PlayStation ID</Label>
                <Input
                  value={editForm.psn_id}
                  onChange={(e) => setEditForm(prev => ({ ...prev, psn_id: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label className="text-white">Preferred Platform</Label>
                <Select value={editForm.preferred_platform} onValueChange={(value) => setEditForm(prev => ({ ...prev, preferred_platform: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="xbox">Xbox</SelectItem>
                    <SelectItem value="playstation">PlayStation</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="text-gray-400">
                Cancel
              </Button>
              <Button onClick={handleProfileUpdate} className="bg-purple-600 hover:bg-purple-700">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}