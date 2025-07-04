"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Trophy,
  Users,
  UserCog,
  Calendar,
  Star,
  BarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Button } from "@/components/ui/button"

interface AdminLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, route: '/admin/dashboard' },
  { name: 'Competitions', icon: Trophy, route: '/admin/competitions' },
  { name: 'Teams', icon: Users, route: '/admin/teams' },
  { name: 'Users', icon: UserCog, route: '/admin/users' },
  { name: 'Matches', icon: Calendar, route: '/admin/matches' },
  { name: 'Fantasy', icon: Star, route: '/admin/fantasy' },
  { name: 'Statistics', icon: BarChart, route: '/admin/statistics' },
  { name: 'Settings', icon: Settings, route: '/admin/settings' }
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { supabase } = useSupabase()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold">Fantasy Pro Clubs</span>
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "sticky top-14 h-[calc(100vh-3.5rem)] border-r bg-background transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}>
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="grid gap-1 px-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.route}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      pathname === item.route
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-full"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 
