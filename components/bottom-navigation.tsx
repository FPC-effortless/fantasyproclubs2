"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Trophy, User, Wand2, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
}

const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    id: "competitions",
    label: "Competitions",
    icon: Trophy,
    href: "/competitions",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    icon: Wand2,
    href: "/fantasy",
  },
  {
    id: "more",
    label: "More",
    icon: MoreHorizontal,
    href: "/profile",
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E1E1E]/95 backdrop-blur-md border-t border-gray-800/80 safe-area-pb shadow-2xl shadow-black/50" 
      role="navigation" 
      aria-label="Bottom navigation"
    >
      <div className="grid grid-cols-4 h-16 max-w-screen-xl mx-auto">
        {navigationItems.map((item) => {
          const active = isActive(item.href)
          const IconComponent = item.icon

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center spacing-xs transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004225] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E1E1E]",
                "hover:bg-gray-800/50 active:scale-95",
                "btn-enhanced",
                active ? "text-[#004225]" : "text-gray-400 hover:text-white",
              )}
              tabIndex={0}
              aria-current={active ? "page" : undefined}
            >
              <div className={cn(
                "relative transition-all duration-300 ease-out", 
                active && "transform scale-110"
              )}>
                <IconComponent
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    active && "drop-shadow-[0_0_12px_rgba(0,255,135,0.6)]",
                  )}
                />
                {active && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-[#00ff87] to-[#004225] rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                )}
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-br from-[#004225] to-[#00ff87] text-white font-bold shadow-lg shadow-green-500/30 animate-pulse"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-all duration-300",
                  "text-caption",
                  active ? "font-bold text-[#004225]" : "font-normal text-gray-400",
                )}
              >
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-[#004225] to-transparent rounded-full shadow-lg shadow-green-500/50" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
