"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { User, MapPin, Calendar, Trophy, Settings, Shield, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

interface UserProfile {
  id: string
  display_name: string | null
  username: string | null
  avatar_url: string | null
  user_type: string
  created_at: string
}

interface UserStats {
  totalMatches: number
  wins: number
  losses: number
  draws: number
  goals: number
  assists: number
}

export function ProfileRouter() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    totalMatches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    goals: 0,
    assists: 0
  })
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const { supabase } = useSupabase()

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      
      // Check if Supabase auth is available
      if (!supabase?.auth) {
        console.error('Supabase auth not available')
        setIsAuthenticated(false)
        return
      }
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        // Only log non-session errors to avoid expected auth errors
        if (authError.message !== 'Auth session missing!') {
          console.error('Auth error:', authError)
        }
        setIsAuthenticated(false)
        return
      }

      if (user) {
        setIsAuthenticated(true)
        await loadUserProfile(user.id)
        await loadUserStats(user.id)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error: any) {
      // Only show error toast for unexpected errors
      if (error.message !== 'Auth session missing!') {
        console.error('Error loading profile data:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        })
      }
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, display_name, username, avatar_url, user_type, created_at')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error loading user profile:', error)
      return
    }

    setUserProfile(data)
  }

  const loadUserStats = async (userId: string) => {
    // For now, we'll use mock stats since the player stats system might not be fully implemented
    // In a real implementation, you would query match statistics
    setUserStats({
      totalMatches: 45,
      wins: 28,
      losses: 12,
      draws: 5,
      goals: 23,
      assists: 15
    })
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-400" />
      case 'manager':
        return <Star className="w-4 h-4 text-yellow-400" />
      case 'player':
        return <User className="w-4 h-4 text-blue-400" />
      default:
        return <User className="w-4 h-4 text-gray-400" />
    }
  }

  const getUserTypeBadgeColor = (userType: string) => {
    switch (userType) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'manager':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'player':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
              PROFILE
            </h1>
            <p className="text-green-200/80">Loading your player profile...</p>
          </div>
        </div>

        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-48 w-full rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50" />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        
        {/* Header */}
        <div className="relative z-10 bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-green-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                PROFILE
              </h1>
            </div>
            <p className="text-green-200/80">Access your player profile and statistics</p>
          </div>
        </div>

        <div className="relative z-10 p-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl p-8 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-green-500/50" />
            </div>
            <h2 className="text-xl font-bold text-green-100 mb-2">Profile Not Available</h2>
            <p className="text-gray-300 mb-6">
              You need to be signed in to view your profile.
            </p>
            <div className="space-y-4">
                              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white transition-all duration-300 shadow-lg">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all">
                  Create Account
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      
      {/* Enhanced Header */}
      <div className="relative z-10 bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
        <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-green-400" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                  PROFILE
                </h1>
                <p className="text-green-200/80">Your player profile and statistics</p>
              </div>
            </div>
          <Link href="/profile/settings">
              <Button variant="ghost" className="text-green-100 hover:bg-green-700/30 hover:text-green-300 transition-all">
                <Settings className="w-5 h-5" />
            </Button>
          </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-6 space-y-6 max-w-4xl mx-auto">
        {/* Profile Card */}
        <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
            <Image
              src={userProfile?.avatar_url || "/placeholder-avatar.jpg"}
              alt="Profile"
              width={80}
              height={80}
                className="rounded-full border-2 border-green-500/30 shadow-lg"
            />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl font-bold text-green-100">
                  {userProfile?.display_name || userProfile?.username || 'User'}
                </h2>
                {getUserTypeIcon(userProfile?.user_type || 'fan')}
              </div>
              <Badge 
                variant="outline" 
                className={getUserTypeBadgeColor(userProfile?.user_type || 'fan')}
              >
                {userProfile?.user_type || 'Fan'}
              </Badge>
              {userProfile?.username && (
                <p className="text-gray-300 text-sm mt-1">@{userProfile.username}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <Calendar className="w-4 h-4 text-green-400" />
            <span>Joined {formatJoinDate(userProfile?.created_at || new Date().toISOString())}</span>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl p-4 text-center hover:border-green-600/40 transition-all">
            <div className="text-2xl font-bold text-green-400">{userStats.totalMatches}</div>
            <div className="text-sm text-gray-300">Total Matches</div>
          </Card>
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl p-4 text-center hover:border-green-600/40 transition-all">
            <div className="text-2xl font-bold text-green-400">{userStats.wins}</div>
            <div className="text-sm text-gray-300">Wins</div>
          </Card>
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl p-4 text-center hover:border-green-600/40 transition-all">
            <div className="text-2xl font-bold text-yellow-400">{userStats.goals}</div>
            <div className="text-sm text-gray-300">Goals</div>
          </Card>
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl p-4 text-center hover:border-green-600/40 transition-all">
            <div className="text-2xl font-bold text-blue-400">{userStats.assists}</div>
            <div className="text-sm text-gray-300">Assists</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link href="/fantasy">
            <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 hover:shadow-2xl transition-all duration-300 group p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-100 group-hover:text-green-300 transition-colors">Fantasy Teams</h3>
                    <p className="text-sm text-gray-300">Manage your fantasy football teams</p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-green-400 transition-colors">→</div>
              </div>
            </Card>
          </Link>
          
          <Link href="/competitions">
            <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 hover:shadow-2xl transition-all duration-300 group p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-100 group-hover:text-green-300 transition-colors">Competitions</h3>
                    <p className="text-sm text-gray-300">View available competitions</p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-green-400 transition-colors">→</div>
              </div>
            </Card>
          </Link>

          <Link href="/profile/settings">
            <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl hover:border-green-600/40 hover:shadow-2xl transition-all duration-300 group p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-100 group-hover:text-green-300 transition-colors">Settings</h3>
                    <p className="text-sm text-gray-300">Account and privacy settings</p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-green-400 transition-colors">→</div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
} 