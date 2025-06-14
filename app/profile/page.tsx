"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { User, LogOut, Moon, Bell, Info, Shield, HelpCircle, ChevronRight, Users, Trophy, Share2, MessageCircle, ClipboardList, BarChart2, CheckCircle2, ShoppingCart, Repeat2, UserCheck, UserPlus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from '@/lib/supabase/client'

export default function MorePage() {
  const { user } = useAuth()
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
