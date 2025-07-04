"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { User, LogOut, Moon, Bell, Info, Shield, HelpCircle, ChevronRight, Users, Trophy, Share2, MessageCircle, ClipboardList, BarChart2, CheckCircle2, ShoppingCart, Repeat2, UserCheck, UserPlus, Lock, Star, Gamepad2, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function MorePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [userType, setUserType] = useState<string | null>(null)

  // Fetch user profile to get user_type
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()
      if (data && data.user_type) setUserType(data.user_type)
    }
    fetchProfile()
  }, [user])

  const handleSignOut = async () => {
    // Add your sign out logic here
    router.push("/login")
  }

  const handleRequireAuth = (feature: string) => {
    toast({
      title: "Sign In Required",
      description: `Please sign in to access ${feature}`,
      variant: "destructive",
    })
    router.push(`/login?redirect=${encodeURIComponent('/profile')}`)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show unsigned user experience
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 pb-8">
        <div className="w-full pt-8 px-0 space-y-8">
          {/* Header */}
          <div className="mb-2 px-4">
            <h1 className="text-2xl font-bold text-green-100 tracking-tight mb-1">Welcome to Fantasy Pro Clubs</h1>
            <p className="text-gray-400 text-sm">Sign in to unlock all features and manage your teams</p>
          </div>

          {/* Welcome Card */}
          <Card className="p-6 bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30 rounded-none w-full">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto">
                <User className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-green-100 mb-2">Join the Community</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Create your account to access team management, competitions, and exclusive features
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => router.push('/login')} className="bg-green-600 hover:bg-green-700">
                    Sign In
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/signup')}>
                    Create Account
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Features Preview */}
          <Card className="p-0 bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30 rounded-none w-full">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-green-100">Available Features</h3>
              <p className="text-gray-400 text-sm">Preview what you can do after signing in</p>
            </div>
            <div className="divide-y divide-gray-800">
              <FeaturePreview 
                icon={Users} 
                title="Team Management" 
                description="Create and manage your teams"
                onClick={() => handleRequireAuth("team management")}
              />
              <FeaturePreview 
                icon={Trophy} 
                title="Competitions" 
                description="Join leagues and tournaments"
                onClick={() => handleRequireAuth("competitions")}
              />
              <FeaturePreview 
                icon={BarChart2} 
                title="Statistics" 
                description="Track your performance"
                onClick={() => handleRequireAuth("statistics")}
              />
              <FeaturePreview 
                icon={Gamepad2} 
                title="Gaming Integration" 
                description="Connect your gaming accounts"
                onClick={() => handleRequireAuth("gaming features")}
              />
            </div>
          </Card>

          {/* Public Features */}
          <Card className="p-0 divide-y divide-gray-800 bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30 rounded-none w-full">
            <SectionLink href="/help" icon={HelpCircle} label="Help & Support" />
            <SectionLink href="/about" icon={Info} label="About" />
            <SectionLink href="/privacy" icon={Shield} label="Privacy Policy" />
          </Card>

          {/* App Settings Section */}
          <Card className="p-0 divide-y divide-gray-800 bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30 rounded-none w-full">
            <SectionToggle icon={Moon} label="Dark Mode" checked={darkMode} onCheckedChange={setDarkMode} />
            <SectionToggle icon={Bell} label="Notifications" checked={notifications} onCheckedChange={setNotifications} />
          </Card>

          {/* App Version */}
          <div className="flex flex-col items-center gap-2 mt-6 px-4">
            <span className="text-xs text-gray-500">App Version 1.0.0</span>
          </div>
        </div>
      </div>
    )
  }

  // Show signed user experience (existing code)
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 pb-8">
      <div className="w-full pt-8 px-0 space-y-8">
        {/* Header */}
        <div className="mb-2 px-4">
          <h1 className="text-2xl font-bold text-green-100 tracking-tight mb-1">More</h1>
          <p className="text-gray-400 text-sm">Account, app settings, and more controls</p>
        </div>

        {/* Account Section */}
        <Card className="p-6 flex items-center gap-4 bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30 rounded-none w-full">
          <Image
            src={user?.user_metadata?.avatar_url || "/placeholder-avatar.svg"}
            alt="avatar"
            width={56}
            height={56}
            className="rounded-full border"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-lg truncate">{user?.user_metadata?.display_name || user?.email || "Guest"}</div>
            <div className="text-gray-400 text-sm truncate">{user?.email}</div>
            {userType && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-yellow-500 capitalize">{userType}</span>
              </div>
            )}
          </div>
          <Link href="/profile/account">
            <Button variant="outline" size="sm">Manage</Button>
          </Link>
        </Card>

        {/* Manager Tools Section */}
        {userType === 'manager' && (
          <Card className="p-0 divide-y divide-gray-800 bg-gradient-to-r from-green-900/20 to-gray-900/40 border-green-800/30 rounded-none w-full">
            <SectionLink href="/manager/lineup" icon={ClipboardList} label="Submit Lineup" />
            <SectionLink href="/manager/personal-stats" icon={BarChart2} label="Submit Personal Stats" />
            <SectionLink href="/manager/team-stats" icon={BarChart2} label="Submit Team Stats" />
            <SectionLink href="/manager/verify-players" icon={UserCheck} label="Verify Players" />
            <SectionLink href="/manager/buy-players" icon={ShoppingCart} label="Buy Players" />
            <SectionLink href="/manager/loan-players" icon={Repeat2} label="Loan Players" />
          </Card>
        )}

        {/* Player Tools Section */}
        {userType === 'player' && (
          <Card className="p-0 divide-y divide-gray-800 bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30 rounded-none w-full">
            <SectionLink href="/player/my-stats" icon={BarChart2} label="My Stats" />
            <SectionLink href="/player/availability" icon={CheckCircle2} label="My Availability" />
            <SectionLink href="/player/request-transfer" icon={UserPlus} label="Request Transfer" />
            <SectionLink href="/player/my-contracts" icon={ClipboardList} label="My Contracts" />
          </Card>
        )}

        {/* My Stuff Section */}
        <Card className="p-0 divide-y divide-gray-800 bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30 rounded-none w-full">
          <SectionLink href="/teams" icon={Users} label="My Teams" />
          <SectionLink href="/competitions" icon={Trophy} label="My Competitions" />
          <SectionLink href="/invite" icon={Share2} label="Invite Friends" />
        </Card>

        {/* App Settings Section */}
        <Card className="p-0 divide-y divide-gray-800 bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30 rounded-none w-full">
          <SectionToggle icon={Moon} label="Dark Mode" checked={darkMode} onCheckedChange={setDarkMode} />
          <SectionToggle icon={Bell} label="Notifications" checked={notifications} onCheckedChange={setNotifications} />
        </Card>

        {/* Support & Legal Section */}
        <Card className="p-0 divide-y divide-gray-800 bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30 rounded-none w-full">
          <SectionLink href="/help" icon={HelpCircle} label="Help & Support" />
          <SectionLink href="/feedback" icon={MessageCircle} label="Send Feedback" />
          <SectionLink href="/about" icon={Info} label="About" />
          <SectionLink href="/privacy" icon={Shield} label="Privacy Policy" />
        </Card>

        {/* App Version & Sign Out */}
        <div className="flex flex-col items-center gap-2 mt-6 px-4">
          <span className="text-xs text-gray-500">App Version 1.0.0</span>
          <Button variant="destructive" className="w-full max-w-xs" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}

function FeaturePreview({ icon: Icon, title, description, onClick }: { 
  icon: any, 
  title: string, 
  description: string, 
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition group w-full text-left"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Icon className="w-5 h-5 text-green-400 group-hover:text-green-300" />
          <Lock className="w-3 h-3 text-gray-500 absolute -top-1 -right-1" />
        </div>
        <div>
          <span className="font-medium text-green-100 group-hover:text-white">{title}</span>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-green-300" />
    </button>
  )
}

function SectionLink({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-4 hover:bg-green-900/20 transition group">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-green-400 group-hover:text-green-300" />
        <span className="font-medium text-green-100 group-hover:text-white">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-green-300" />
    </Link>
  )
}

function SectionToggle({ icon: Icon, label, checked, onCheckedChange }: { icon: any, label: string, checked: boolean, onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-green-400" />
        <span className="font-medium text-green-100">{label}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
