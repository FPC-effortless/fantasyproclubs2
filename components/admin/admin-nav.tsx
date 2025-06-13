"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Star,
  Calendar,
  Trophy,
  Shield,
  FileText,
  Settings,
  ChevronDown,
  LayoutDashboard,
  Users,
  BarChart,
  UserCog,
  BarChart2,
  Clipboard
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  {
    title: "Overview",
    href: "/admin/dashboard",
  },
  {
    title: "Teams",
    href: "/admin/teams",
  },
  {
    title: "Competitions",
    href: "/admin/competitions",
  },
  {
    title: "Users",
    href: "/admin/users",
  },
]

const moreMenuItems = [
  {
    title: "Fantasy Management",
    href: "/admin/fantasy",
    icon: Star,
  },
  {
    title: "Match Management",
    href: "/admin/matches",
    icon: Calendar,
  },
  {
    title: "Match Statistics",
    href: "/admin/match-statistics",
    icon: BarChart2,
  },
  {
    title: "Player Accounts",
    href: "/admin/players",
    icon: UserCog,
  },
  {
    title: "Lineup Management",
    href: "/admin/lineups",
    icon: Clipboard,
  },
  {
    title: "Trophies",
    href: "/admin/trophies",
    icon: Trophy,
  },
  {
    title: "Content Management",
    href: "/admin/content",
    icon: FileText,
  },
  {
    title: "Featured Content",
    href: "/admin/featured",
    icon: Star,
  },
  {
    title: "Statistics",
    href: "/admin/statistics",
    icon: BarChart,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-2 sm:gap-4 overflow-hidden">
      {/* Hide nav items on small screens, show only on md and larger */}
      <div className="hidden md:flex items-center gap-2 lg:gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-xs lg:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
              pathname === item.href
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.title}
          </Link>
        ))}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger className={cn(
          "text-xs sm:text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 whitespace-nowrap",
          pathname.startsWith("/admin/") && !navItems.some(item => pathname === item.href)
            ? "text-foreground"
            : "text-muted-foreground"
        )}>
          <span className="hidden sm:inline">More</span>
          <span className="sm:hidden">Menu</span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Show nav items in dropdown on small/medium screens */}
          <div className="md:hidden">
            {navItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 w-full",
                    pathname === item.href && "bg-accent"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ))}
            <div className="border-t my-1" />
          </div>
          {moreMenuItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link 
                href={item.href}
                className={cn(
                  "flex items-center gap-2 w-full",
                  pathname === item.href && "bg-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
} 
