"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Trophy,
  Users,
  BarChart2,
  Calendar,
  Shield,
  Star,
  UserPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type UserRole = "admin" | "manager" | "player" | "fan"

interface MenuItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
  children?: MenuItem[]
  badge?: number
}

interface HeaderProps {
  userRole?: UserRole
  userName?: string
  userAvatar?: string
  notificationCount?: number
}

const menuItems: MenuItem[] = [
  {
    label: "Competitions",
    href: "/competitions",
    icon: Trophy,
    roles: ["admin", "manager", "player", "fan"],
  },
  {
    label: "Teams",
    href: "/teams",
    icon: Users,
    roles: ["admin", "manager", "player", "fan"],
  },
  {
    label: "Fixtures",
    href: "/fixtures",
    icon: Calendar,
    roles: ["admin", "manager", "player", "fan"],
  },
  {
    label: "Fantasy",
    href: "/fantasy",
    icon: Star,
    roles: ["admin", "manager", "player", "fan"],
  },
  {
    label: "Admin Dashboard",
    href: "/admin/dashboard",
    icon: Shield,
    roles: ["admin"],
    children: [
      {
        label: "Overview",
        href: "/admin/dashboard",
        icon: BarChart2,
        roles: ["admin"],
      },
      {
        label: "Upgrade Requests",
        href: "/admin/upgrades",
        icon: UserPlus,
        badge: 5,
        roles: ["admin"],
      },
    ],
  },
]

export function Header({ userRole = "fan", userName = "John Smith", userAvatar, notificationCount = 3 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(userRole))

  // Get user initials for avatar fallback
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title - Left Side */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-accent flex items-center justify-center">
                <Trophy className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="hidden font-bold text-foreground md:inline-block">Fantasy Pro Clubs</span>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center space-x-6" aria-label="Main navigation">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-accent",
                    isActive ? "text-accent" : "text-muted-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute -bottom-[17px] left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-accent" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-accent"
              aria-label="Search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-accent" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent p-0 text-xs font-bold text-accent-foreground"
                      variant="outline"
                    >
                      {notificationCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-secondary border-border">
                <DropdownMenuLabel className="text-accent">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                {[...Array(3)].map((_, i) => (
                  <DropdownMenuItem key={i} className="py-3 cursor-pointer hover:bg-muted">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-accent" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">New match scheduled</p>
                        <p className="text-xs text-muted-foreground">Your team has a new match on Friday</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="py-2 flex justify-center hover:bg-muted">
                  <span className="text-sm font-medium text-accent">View all notifications</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full border border-gray-800 hover:border-[#00ff87]"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatar || "/placeholder.svg"} alt={userName} />
                    <AvatarFallback className="bg-[#00ff87] text-black font-bold text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-white">{userName}</p>
                    <p className="text-xs text-gray-400 capitalize">{userRole}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
                  <User className="mr-2 h-4 w-4 text-[#00ff87]" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
                  <Settings className="mr-2 h-4 w-4 text-[#00ff87]" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4 text-[#00ff87]" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-gray-300 hover:text-[#00ff87]"
                  aria-label="Open Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] bg-gray-900 border-gray-800 p-0">
                <SheetHeader className="p-4 border-b border-gray-800">
                  <SheetTitle className="text-white flex items-center space-x-2">
                    <div className="h-8 w-8 rounded bg-[#00ff87] flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-black" />
                    </div>
                    <span>Fantasy Pro Clubs</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="px-4 py-3 flex items-center space-x-3 border-b border-gray-800">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userAvatar || "/placeholder.svg"} alt={userName} />
                      <AvatarFallback className="bg-[#00ff87] text-black font-bold">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">{userName}</p>
                      <p className="text-xs text-gray-400 capitalize">{userRole}</p>
                    </div>
                  </div>
                  <nav className="mt-4 px-2">
                    {filteredMenuItems.map((item) => {
                      const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center space-x-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-[#00ff87]/10 text-[#00ff87]"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white",
                          )}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                  </nav>
                  <div className="mt-4 px-2">
                    <div className="border-t border-gray-800 pt-4">
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 rounded-md px-3 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </Link>
                      <button
                        className="w-full flex items-center space-x-3 rounded-md px-3 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleLogout()
                        }}
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Bar - Expandable */}
      {isSearchOpen && (
        <div className="border-t border-gray-800 bg-gray-900 py-3 px-4 animate-in fade-in slide-in-from-top duration-300">
          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search competitions, teams, players..."
              className="w-full rounded-md border border-gray-800 bg-gray-800 py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-400 focus:border-[#00ff87] focus:outline-none focus:ring-1 focus:ring-[#00ff87]"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={() => setIsSearchOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
